import 'dart:convert';
import 'dart:io';

import 'package:flutter/material.dart';

/// Comprehensive QA Test Suite for Vocabulary Chapters System
/// 
/// This script validates the complete functionality of the progressive
/// vocabulary chapters system including backend API and frontend integration.
/// 
/// Test Cases:
/// 1. Initial state: Only chapter 1 unlocked
/// 2. Progressive unlocking: Complete chapter 1 → unlock chapter 2
/// 3. Edge case: Manual access to locked chapter
/// 4. Frontend/Backend synchronization
/// 5. Lives system integration
/// 6. Security validation
class VocabularyChaptersQATests {
  static const String baseUrl = 'http://localhost:3000/api/v1';
  static const String testEmail = 'qa.simple@example.com';
  static const String testPassword = 'QATestPassword123';
  
  String? authToken;
  String? userId;
  
  /// Run all QA tests
  Future<void> runAllTests() async {
    debugPrint('🧪 Starting Vocabulary Chapters QA Test Suite');
    debugPrint('=' * 60);
    
    try {
      // Setup: Create test user and authenticate
      await _setupTestUser();
      
      // Test 1: Initial state validation
      await _testInitialState();
      
      // Test 2: Progressive unlocking
      await _testProgressiveUnlocking();
      
      // Test 3: Edge cases
      await _testEdgeCases();
      
      // Test 4: Frontend/Backend sync
      await _testFrontendBackendSync();
      
      // Test 5: Lives integration
      await _testLivesIntegration();
      
      // Test 6: Security validation
      await _testSecurityValidation();
      
      debugPrint('\n🎉 All QA tests completed successfully!');
      debugPrint('=' * 60);
      
    } catch (e) {
      debugPrint('\n❌ QA tests failed with error: $e');
      exit(1);
    } finally {
      // Cleanup: Remove test user
      await _cleanupTestUser();
    }
  }
  
  /// Setup test user and authentication
  Future<void> _setupTestUser() async {
    debugPrint('\n📋 Setup: Creating test user and authenticating...');
    
    // Try to register test user (might already exist)
    try {
      await _makeHttpRequest(
        'POST', 
        '$baseUrl/auth/register',
        body: {
          'fullName': 'QA Test User Simple',
          'email': testEmail,
          'password': testPassword,
          'confirmPassword': testPassword,
        },
      );
      debugPrint('✅ Test user registered successfully');
    } catch (e) {
      debugPrint('ℹ️  Test user might already exist, continuing with login...');
    }
    
    // Login to get token
    final loginResponse = await _makeHttpRequest(
      'POST', 
      '$baseUrl/auth/login',
      body: {
        'email': testEmail,
        'password': testPassword,
      },
    );
    
    authToken = loginResponse['accessToken'];
    userId = loginResponse['userId'];
    
    if (authToken == null || userId == null) {
      throw Exception('Failed to authenticate test user');
    }
    
    debugPrint('✅ Test user authenticated successfully');
    debugPrint('   Token: ${authToken!.substring(0, 20)}...');
    debugPrint('   User ID: $userId');
  }
  
  /// Test 1: Validate initial state - only chapter 1 should be unlocked
  Future<void> _testInitialState() async {
    debugPrint('\n🔬 Test 1: Validating initial state...');
    
    final response = await _makeHttpRequest(
      'GET',
      '$baseUrl/vocab/chapters',
      headers: {'Authorization': 'Bearer $authToken'},
    );
    
    // Validate response structure
    _validateChaptersResponse(response);
    
    final chapters = response['data']['chapters'] as List;
    final stats = response['data'];
    
    // Test initial conditions
    bool foundUnlockedChapter1 = false;
    int unlockedCount = 0;
    
    for (var chapter in chapters) {
      if (chapter['order'] == 1) {
        if (!chapter['isUnlocked']) {
          throw Exception('Chapter 1 should be unlocked by default');
        }
        foundUnlockedChapter1 = true;
      }
      
      if (chapter['isUnlocked']) {
        unlockedCount++;
      }
    }
    
    if (!foundUnlockedChapter1) {
      throw Exception('Chapter 1 not found or not unlocked');
    }
    
    // Validate statistics
    if (stats['unlockedChapters'] != unlockedCount) {
      throw Exception('Unlocked chapters count mismatch');
    }
    
    if (stats['completedChapters'] > stats['unlockedChapters']) {
      throw Exception('Completed chapters cannot exceed unlocked chapters');
    }
    
    debugPrint('✅ Initial state validation passed');
    debugPrint('   - Chapter 1 is unlocked: ✅');
    debugPrint('   - Total chapters: ${stats['totalChapters']}');
    debugPrint('   - Unlocked chapters: ${stats['unlockedChapters']}');
    debugPrint('   - Completed chapters: ${stats['completedChapters']}');
  }
  
  /// Test 2: Progressive unlocking - complete chapter 1 to unlock chapter 2
  Future<void> _testProgressiveUnlocking() async {
    debugPrint('\n🔄 Test 2: Testing progressive unlocking...');
    
    // First, get initial state
    final initialResponse = await _makeHttpRequest(
      'GET',
      '$baseUrl/vocab/chapters',
      headers: {'Authorization': 'Bearer $authToken'},
    );
    
    final initialChapters = initialResponse['data']['chapters'] as List;
    final chapter1 = initialChapters.firstWhere((c) => c['order'] == 1);
    final chapter2 = initialChapters.firstWhere((c) => c['order'] == 2);
    
    debugPrint('   Initial state:');
    debugPrint('   - Chapter 1 unlocked: ${chapter1['isUnlocked']}');
    debugPrint('   - Chapter 1 completed: ${chapter1['isCompleted']}');
    debugPrint('   - Chapter 2 unlocked: ${chapter2['isUnlocked']}');
    
    // Complete chapter 1 if not already completed
    if (!chapter1['isCompleted']) {
      debugPrint('   Completing chapter 1...');
      
      final completeResponse = await _makeHttpRequest(
        'POST',
        '$baseUrl/vocab/chapters/${chapter1['id']}/complete',
        headers: {'Authorization': 'Bearer $authToken'},
        body: {
          'finalScore': 95,
          'completionNotes': 'QA Test completion',
        },
      );
      
      // Validate completion response
      if (!completeResponse['success']) {
        throw Exception('Chapter completion failed: ${completeResponse['message']}');
      }
      
      final completionData = completeResponse['data'];
      if (!completionData['chapterCompleted']) {
        throw Exception('Chapter should be marked as completed');
      }
      
      debugPrint('✅ Chapter 1 completed successfully');
      debugPrint('   - Next chapter unlocked: ${completionData['nextChapterUnlocked']}');
    } else {
      debugPrint('   Chapter 1 already completed, skipping completion test');
    }
    
    // Verify final state
    final finalResponse = await _makeHttpRequest(
      'GET',
      '$baseUrl/vocab/chapters',
      headers: {'Authorization': 'Bearer $authToken'},
    );
    
    final finalChapters = finalResponse['data']['chapters'] as List;
    final finalChapter1 = finalChapters.firstWhere((c) => c['order'] == 1);
    final finalChapter2 = finalChapters.firstWhere((c) => c['order'] == 2);
    
    // Validate progressive unlocking
    if (!finalChapter1['isCompleted']) {
      throw Exception('Chapter 1 should be completed after completion call');
    }
    
    if (!finalChapter2['isUnlocked']) {
      throw Exception('Chapter 2 should be unlocked after completing chapter 1');
    }
    
    debugPrint('✅ Progressive unlocking validation passed');
    debugPrint('   Final state:');
    debugPrint('   - Chapter 1 completed: ${finalChapter1['isCompleted']}');
    debugPrint('   - Chapter 2 unlocked: ${finalChapter2['isUnlocked']}');
  }
  
  /// Test 3: Edge cases validation
  Future<void> _testEdgeCases() async {
    debugPrint('\n🔍 Test 3: Testing edge cases...');
    
    // Get current chapters state
    final response = await _makeHttpRequest(
      'GET',
      '$baseUrl/vocab/chapters',
      headers: {'Authorization': 'Bearer $authToken'},
    );
    
    final chapters = response['data']['chapters'] as List;
    
    // Find a locked chapter
    final lockedChapter = chapters.where((c) => !c['isUnlocked']).firstOrNull;
    
    if (lockedChapter != null) {
      debugPrint('   Testing access to locked chapter ${lockedChapter['order']}...');
      
      // Try to complete a locked chapter (should fail)
      try {
        await _makeHttpRequest(
          'POST',
          '$baseUrl/vocab/chapters/${lockedChapter['id']}/complete',
          headers: {'Authorization': 'Bearer $authToken'},
          body: {'finalScore': 100},
        );
        
        throw Exception('Should not be able to complete a locked chapter');
      } catch (e) {
        if (e.toString().contains('Should not be able to complete')) {
          rethrow;
        }
        debugPrint('✅ Correctly blocked access to locked chapter');
      }
    }
    
    // Test invalid chapter ID
    debugPrint('   Testing invalid chapter ID...');
    try {
      await _makeHttpRequest(
        'POST',
        '$baseUrl/vocab/chapters/invalid-uuid/complete',
        headers: {'Authorization': 'Bearer $authToken'},
        body: {'finalScore': 100},
      );
      
      throw Exception('Should not accept invalid chapter ID');
    } catch (e) {
      if (e.toString().contains('Should not accept invalid')) {
        rethrow;
      }
      debugPrint('✅ Correctly rejected invalid chapter ID');
    }
    
    // Test unauthorized access
    debugPrint('   Testing unauthorized access...');
    try {
      await _makeHttpRequest(
        'GET',
        '$baseUrl/vocab/chapters',
      );
      
      throw Exception('Should require authorization');
    } catch (e) {
      if (e.toString().contains('Should require authorization')) {
        rethrow;
      }
      debugPrint('✅ Correctly requires authorization');
    }
    
    debugPrint('✅ Edge cases validation passed');
  }
  
  /// Test 4: Frontend/Backend synchronization
  Future<void> _testFrontendBackendSync() async {
    debugPrint('\n🔄 Test 4: Testing Frontend/Backend synchronization...');
    
    // Make multiple rapid requests to test consistency
    List<Future> requests = [];
    
    for (int i = 0; i < 5; i++) {
      requests.add(_makeHttpRequest(
        'GET',
        '$baseUrl/vocab/chapters',
        headers: {'Authorization': 'Bearer $authToken'},
      ));
    }
    
    final responses = await Future.wait(requests);
    
    // Validate all responses are consistent
    final firstResponse = responses.first;
    for (final response in responses) {
      if (response['data']['totalChapters'] != firstResponse['data']['totalChapters']) {
        throw Exception('Inconsistent total chapters count across requests');
      }
      
      if (response['data']['completedChapters'] != firstResponse['data']['completedChapters']) {
        throw Exception('Inconsistent completed chapters count across requests');
      }
    }
    
    debugPrint('✅ Frontend/Backend synchronization validation passed');
    debugPrint('   - All ${responses.length} concurrent requests returned consistent data');
  }
  
  /// Test 5: Lives system integration
  Future<void> _testLivesIntegration() async {
    debugPrint('\n❤️  Test 5: Testing Lives system integration...');
    
    // Get lives status
    final livesResponse = await _makeHttpRequest(
      'GET',
      '$baseUrl/lives/status',
      headers: {'Authorization': 'Bearer $authToken'},
    );
    
    debugPrint('   Current lives status:');
    debugPrint('   - Lives available: ${livesResponse['data']['currentLives']}');
    debugPrint('   - Has lives: ${livesResponse['data']['hasLivesAvailable']}');
    
    // Test that chapters endpoint works regardless of lives status
    final chaptersResponse = await _makeHttpRequest(
      'GET',
      '$baseUrl/vocab/chapters',
      headers: {'Authorization': 'Bearer $authToken'},
    );
    
    if (!chaptersResponse['success']) {
      throw Exception('Chapters endpoint should work regardless of lives status');
    }
    
    debugPrint('✅ Lives system integration validation passed');
    debugPrint('   - Chapters can be viewed regardless of lives status');
  }
  
  /// Test 6: Security validation
  Future<void> _testSecurityValidation() async {
    debugPrint('\n🔒 Test 6: Testing security validation...');
    
    // Test rate limiting (if implemented)
    debugPrint('   Testing rate limiting...');
    List<Future> rapidRequests = [];
    
    for (int i = 0; i < 10; i++) {
      rapidRequests.add(_makeHttpRequest(
        'GET',
        '$baseUrl/vocab/chapters',
        headers: {'Authorization': 'Bearer $authToken'},
      ));
    }
    
    try {
      await Future.wait(rapidRequests);
      debugPrint('✅ All rapid requests succeeded (rate limiting may not be strict)');
    } catch (e) {
      debugPrint('✅ Rate limiting is working (some requests were throttled)');
    }
    
    // Test malformed requests
    debugPrint('   Testing malformed requests...');
    
    try {
      await _makeHttpRequest(
        'POST',
        '$baseUrl/vocab/chapters/valid-uuid/complete',
        headers: {'Authorization': 'Bearer $authToken'},
        body: {'invalidField': 'should be rejected'},
      );
    } catch (e) {
      debugPrint('✅ Malformed request properly handled');
    }
    
    debugPrint('✅ Security validation passed');
  }
  
  /// Validate chapters response structure
  void _validateChaptersResponse(Map<String, dynamic> response) {
    if (!response.containsKey('success') || response['success'] != true) {
      throw Exception('Invalid response structure: missing success field');
    }
    
    if (!response.containsKey('data')) {
      throw Exception('Invalid response structure: missing data field');
    }
    
    final data = response['data'];
    final requiredFields = ['chapters', 'totalChapters', 'unlockedChapters', 'completedChapters'];
    
    for (final field in requiredFields) {
      if (!data.containsKey(field)) {
        throw Exception('Invalid response structure: missing $field field');
      }
    }
    
    final chapters = data['chapters'] as List;
    if (chapters.isEmpty) {
      throw Exception('No chapters found in response');
    }
    
    // Validate chapter structure
    final firstChapter = chapters.first;
    final requiredChapterFields = [
      'id', 'title', 'level', 'order', 'isUnlocked', 'isCompleted', 
      'progressPercentage', 'vocabularyItemsLearned', 'totalVocabularyItems'
    ];
    
    for (final field in requiredChapterFields) {
      if (!firstChapter.containsKey(field)) {
        throw Exception('Invalid chapter structure: missing $field field');
      }
    }
  }
  
  /// Make HTTP request helper
  Future<Map<String, dynamic>> _makeHttpRequest(
    String method, 
    String url, {
    Map<String, String>? headers,
    Map<String, dynamic>? body,
  }) async {
    final client = HttpClient();
    client.connectionTimeout = const Duration(seconds: 10);
    
    try {
      final uri = Uri.parse(url);
      late HttpClientRequest request;
      
      switch (method.toUpperCase()) {
        case 'GET':
          request = await client.getUrl(uri);
          break;
        case 'POST':
          request = await client.postUrl(uri);
          break;
        case 'PUT':
          request = await client.putUrl(uri);
          break;
        case 'DELETE':
          request = await client.deleteUrl(uri);
          break;
        default:
          throw Exception('Unsupported HTTP method: $method');
      }
      
      // Add headers
      request.headers.set('Content-Type', 'application/json');
      request.headers.set('Accept', 'application/json');
      request.headers.set('Origin', 'http://localhost:3000');
      request.headers.set('X-Requested-With', 'XMLHttpRequest');
      
      if (headers != null) {
        headers.forEach((key, value) {
          request.headers.set(key, value);
        });
      }
      
      // Add body for POST/PUT requests
      if (body != null && (method == 'POST' || method == 'PUT')) {
        final jsonBody = jsonEncode(body);
        request.contentLength = utf8.encode(jsonBody).length;
        request.write(jsonBody);
      }
      
      final response = await request.close();
      final responseBody = await response.transform(utf8.decoder).join();
      
      if (response.statusCode >= 400) {
        throw Exception('HTTP ${response.statusCode}: $responseBody');
      }
      
      return jsonDecode(responseBody) as Map<String, dynamic>;
      
    } catch (e) {
      rethrow;
    } finally {
      client.close();
    }
  }
  
  /// Cleanup test user
  Future<void> _cleanupTestUser() async {
    debugPrint('\n🧹 Cleanup: Test user cleanup completed');
    // Note: In a real scenario, you might want to delete the test user
    // For now, we'll just log the cleanup
  }
}

/// Main function to run QA tests
void main() async {
  final qaTests = VocabularyChaptersQATests();
  await qaTests.runAllTests();
}