import 'dart:async';
import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../utils/api_service.dart';
import '../utils/environment_config.dart';
import 'approval_provider.dart';

enum ProgressState {
  initial,
  saving,
  saved,
  error,
  retrying,
}

class ProgressProvider with ChangeNotifier {
  final ApiService _apiService = ApiService();
  ApprovalProvider? _approvalProvider;
  
  ProgressState _progressState = ProgressState.initial;
  String? _errorMessage;
  Timer? _debounceTimer;
  final List<Map<String, dynamic>> _pendingSaves = [];
  bool _isOfflineMode = false;
  bool _simulateNetworkError = false;
  
  // Approval integration
  void setApprovalProvider(ApprovalProvider approvalProvider) {
    _approvalProvider = approvalProvider;
  }
  
  // Getters
  ProgressState get progressState => _progressState;
  String? get errorMessage => _errorMessage;
  bool get isSaving => _progressState == ProgressState.saving;
  bool get hasPendingProgress => _pendingSaves.isNotEmpty;
  
  // Auto-save configuration
  static const Duration _debounceDuration = Duration(milliseconds: 500);
  static const int _maxRetryAttempts = 3;
  static const Duration _retryDelay = Duration(seconds: 2);

  /// Main method to save user progress with debounce and retry logic
  Future<void> saveProgress({
    required String chapterId,
    required double score,
    Map<String, dynamic>? extraData,
  }) async {
    // Cancel existing debounce timer
    _debounceTimer?.cancel();
    
    final progressData = {
      'chapter_id': chapterId,
      'score': score,
      'extra_data': extraData,
      'timestamp': DateTime.now().millisecondsSinceEpoch,
    };
    
    // Debounce the save operation
    _debounceTimer = Timer(_debounceDuration, () async {
      await _performSave(progressData);
    });
  }

  /// Perform the actual save operation with retry logic
  Future<void> _performSave(Map<String, dynamic> progressData, {int attemptCount = 0}) async {
    try {
      _setProgressState(ProgressState.saving);
      
      // Check for simulated network error or offline mode
      if (_simulateNetworkError || _isOfflineMode) {
        throw Exception('Network error simulated or offline mode');
      }
      
      // Get auth token (skip in test mode)
      String? token;
      if (!_testMode) {
        token = await _getAuthToken();
        if (token == null) {
          throw Exception('User not authenticated');
        }
      } else {
        token = 'test_token'; // Use dummy token in test mode
      }
      
      // Prepare API request
      final endpoint = '${EnvironmentConfig.fullApiUrl}/progress';
      final requestBody = {
        'chapter_id': progressData['chapter_id'],
        'score': progressData['score'],
        'extra_data': progressData['extra_data'],
      };
      
      // Make API call (simulate success in test mode unless network error is simulated)
      if (_testMode) {
        // Simulate network delay
        await Future.delayed(Duration(milliseconds: 100));
        
        if (_simulateNetworkError) {
          // Simulate network error in test mode
          throw Exception('Simulated network error (TEST MODE)');
        } else {
          // Simulate successful API call in test mode
          _setProgressState(ProgressState.saved);
          _removePendingSave(progressData);
          
          if (kDebugMode) {
            debugPrint('✅ Progress saved successfully (TEST MODE) for chapter: ${progressData['chapter_id']}');
          }
        }
      } else {
        final response = await _apiService.post(
          endpoint,
          body: requestBody,
          token: token,
        );
        
        if (response.success) {
          _setProgressState(ProgressState.saved);
          _removePendingSave(progressData);
          
          // Store successful save locally for backup
          await _storeProgressLocally(progressData);
          
          if (kDebugMode) {
            debugPrint('✅ Progress saved successfully for chapter: ${progressData['chapter_id']}');
          }
        } else {
          throw Exception(response.message);
        }
      }
      
    } catch (e) {
      if (kDebugMode) {
        debugPrint('❌ Error saving progress (attempt ${attemptCount + 1}): $e');
      }
      
      // Retry logic
      if (attemptCount < _maxRetryAttempts - 1) {
        await Future.delayed(_retryDelay);
        await _performSave(progressData, attemptCount: attemptCount + 1);
      } else {
        // Max retries reached, store for later sync
        _setProgressState(ProgressState.error, 'Failed to save progress after $_maxRetryAttempts attempts');
        await _storePendingProgress(progressData);
      }
    }
  }

  /// Detect and save progress based on module events
  Future<void> onChapterCompleted(String chapterId, double score, {int errors = 0, int timeSpent = 0, Map<String, dynamic>? extraData}) async {
    final Map<String, dynamic> progressData = {
      'event_type': 'chapter_completed',
      'completed_at': DateTime.now().toIso8601String(),
      'errors': errors,
      'time_spent': timeSpent,
    };
    
    // Merge additional data if provided
    if (extraData != null) {
      progressData.addAll(extraData);
    }
    
    await saveProgress(
      chapterId: chapterId,
      score: score,
      extraData: progressData,
    );
    
    // Trigger approval evaluation if approval provider is available
    if (_approvalProvider != null) {
      try {
        await _approvalProvider!.evaluateChapterApproval(
          chapterId: chapterId,
          score: score,
          errors: errors,
          timeSpent: timeSpent,
        );
        
        if (kDebugMode) {
          debugPrint('✅ Approval evaluation completed for chapter: $chapterId');
        }
      } catch (e) {
        if (kDebugMode) {
          debugPrint('⚠️ Failed to evaluate approval for chapter $chapterId: $e');
        }
      }
    }
  }

  Future<void> onQuizAnswered(String chapterId, double score, int questionIndex) async {
    await saveProgress(
      chapterId: chapterId,
      score: score,
      extraData: {
        'event_type': 'quiz_answered',
        'last_question': questionIndex,
        'answered_at': DateTime.now().toIso8601String(),
      },
    );
  }

  Future<void> onVocabularyPracticed(String chapterId, String lastWord, int wordsLearned) async {
    await saveProgress(
      chapterId: chapterId,
      score: wordsLearned.toDouble(),
      extraData: {
        'event_type': 'vocabulary_practiced',
        'vocab': {
          'chapter': chapterId,
          'lastWord': lastWord,
          'wordsLearned': wordsLearned,
        },
        'practiced_at': DateTime.now().toIso8601String(),
      },
    );
  }

  Future<void> onReadingProgress(String chapterId, int lastParagraph, bool quizCompleted) async {
    await saveProgress(
      chapterId: chapterId,
      score: quizCompleted ? 100.0 : (lastParagraph * 10.0),
      extraData: {
        'event_type': 'reading_progress',
        'reading': {
          'chapter': chapterId,
          'lastParagraph': lastParagraph,
          'quizCompleted': quizCompleted,
        },
        'read_at': DateTime.now().toIso8601String(),
      },
    );
  }

  Future<void> onInterviewAnswer(String chapterId, int lastQuestion, String answer) async {
    await saveProgress(
      chapterId: chapterId,
      score: lastQuestion.toDouble(),
      extraData: {
        'event_type': 'interview_answered',
        'interview': {
          'chapter': chapterId,
          'lastQuestion': lastQuestion,
          'lastAnswer': answer,
        },
        'answered_at': DateTime.now().toIso8601String(),
      },
    );
  }

  /// Sync pending saves when connectivity is restored
  Future<void> syncPendingProgress() async {
    final pendingSaves = await _getPendingProgress();
    
    if (pendingSaves.isNotEmpty) {
      for (final progress in pendingSaves) {
        await _performSave(progress);
        await Future.delayed(const Duration(milliseconds: 100)); // Small delay between requests
      }
    }
  }

  /// Get user progress from API
  Future<Map<String, dynamic>?> getUserProgress() async {
    try {
      final token = await _getAuthToken();
      if (token == null) return null;
      
      final userId = await _getUserId();
      if (userId == null) return null;
      
      final endpoint = '${EnvironmentConfig.fullApiUrl}/progress/$userId';
      final response = await _apiService.get(endpoint, token: token);
      
      if (response.success && response.data != null) {
        return response.data as Map<String, dynamic>;
      }
      
      return null;
    } catch (e) {
      if (kDebugMode) {
        debugPrint('❌ Error fetching user progress: $e');
      }
      return null;
    }
  }

  // Private helper methods
  Future<String?> _getAuthToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('auth_token');
  }

  Future<String?> _getUserId() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('user_id');
  }

  Future<void> _storeProgressLocally(Map<String, dynamic> progressData) async {
    final prefs = await SharedPreferences.getInstance();
    final progressJson = jsonEncode(progressData);
    await prefs.setString('last_progress_backup', progressJson);
  }

  Future<void> _storePendingProgress(Map<String, dynamic> progressData) async {
    final prefs = await SharedPreferences.getInstance();
    final existing = prefs.getStringList('pending_progress') ?? [];
    existing.add(jsonEncode(progressData));
    await prefs.setStringList('pending_progress', existing);
    
    _pendingSaves.add(progressData);
  }

  Future<List<Map<String, dynamic>>> _getPendingProgress() async {
    final prefs = await SharedPreferences.getInstance();
    final pendingList = prefs.getStringList('pending_progress') ?? [];
    
    return pendingList.map((jsonString) {
      return jsonDecode(jsonString) as Map<String, dynamic>;
    }).toList();
  }

  void _removePendingSave(Map<String, dynamic> progressData) async {
    final prefs = await SharedPreferences.getInstance();
    final pendingList = prefs.getStringList('pending_progress') ?? [];
    final progressJson = jsonEncode(progressData);
    
    pendingList.remove(progressJson);
    await prefs.setStringList('pending_progress', pendingList);
    
    _pendingSaves.removeWhere((item) => 
      jsonEncode(item) == progressJson);
  }

  void _setProgressState(ProgressState state, [String? errorMessage]) {
    if (_isDisposed) return; // Prevent calling notifyListeners on disposed provider
    _progressState = state;
    _errorMessage = errorMessage;
    notifyListeners();
  }

  @override
  void dispose() {
    _isDisposed = true;
    _debounceTimer?.cancel();
    super.dispose();
  }

  /// Clear all progress data (used on logout)
  Future<void> clearProgressData() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('last_progress_backup');
    await prefs.remove('pending_progress');
    
    _pendingSaves.clear();
    _progressState = ProgressState.initial;
    _errorMessage = null;
    notifyListeners();
  }

  /// Test helper methods for integration tests
  bool _testMode = false;
  bool _isDisposed = false;
  
  void enableTestMode() {
    _testMode = true;
    notifyListeners();
  }
  
  void simulateNetworkError(bool hasError) {
    _simulateNetworkError = hasError;
    notifyListeners();
    
    // When network error is resolved, try to sync pending progress
    if (!hasError && hasPendingProgress) {
      syncPendingProgress();
    }
  }

  void setOfflineMode(bool isOffline) {
    _isOfflineMode = isOffline;
    notifyListeners();
  }
}