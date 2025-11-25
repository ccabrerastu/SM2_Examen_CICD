import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'environment_config.dart';

class ApiService {
  static final ApiService _instance = ApiService._internal();
  
  factory ApiService() => _instance;
  
  ApiService._internal();
  
  // Default headers for all requests
  Map<String, String> get _defaultHeaders => {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
  
  // Helper method to add authorization header
  Map<String, String> _getHeaders({String? token, bool withCredentials = false}) {
    final headers = Map<String, String>.from(_defaultHeaders);
    if (token != null) {
      headers['Authorization'] = 'Bearer $token';
    }
    // Add CSRF protection header for authentication endpoints
    if (withCredentials) {
      headers['X-Requested-With'] = 'XMLHttpRequest';
      // Backend requires Origin header - use mobile app compatible origin
      headers['Origin'] = 'http://10.0.2.2:3000'; // Dirección especial para emulador Android
    }
    return headers;
  }
  
  // Helper method to log requests (only in development)
  void _logRequest(String method, String url, Map<String, dynamic>? body) {
    if (EnvironmentConfig.enableLogging && EnvironmentConfig.isDevelopment) {
      // ignore: avoid_print
      debugPrint('🔄 API $method: $url');
      if (body != null) {
        // ignore: avoid_print
        debugPrint('📤 Request Body: ${jsonEncode(body)}');
      }
    }
  }
  
  // Helper method to log responses (only in development)
  void _logResponse(http.Response response) {
    if (EnvironmentConfig.enableLogging && EnvironmentConfig.isDevelopment) {
      // ignore: avoid_print
      debugPrint('📥 Response ${response.statusCode}: ${response.body}');
    }
  }
  
  // POST request method
  Future<ApiResponse> post(
    String endpoint, {
    Map<String, dynamic>? body,
    String? token,
    bool withCredentials = false,
  }) async {
    try {
      final url = Uri.parse(endpoint);
      _logRequest('POST', endpoint, body);
      
      final response = await http.post(
        url,
        headers: _getHeaders(token: token, withCredentials: withCredentials),
        body: body != null ? jsonEncode(body) : null,
      ).timeout(EnvironmentConfig.apiTimeout);
      
      _logResponse(response);
      
      return ApiResponse(
        statusCode: response.statusCode,
        data: _parseResponse(response.body),
        success: response.statusCode >= 200 && response.statusCode < 300,
        message: _extractMessage(response.body, response.statusCode),
      );
    } catch (e) {
      if (EnvironmentConfig.enableLogging && EnvironmentConfig.isDevelopment) {
        // ignore: avoid_print
        debugPrint('❌ API Error: $e');
      }
      return ApiResponse(
        statusCode: 0,
        data: null,
        success: false,
        message: _handleError(e),
      );
    }
  }
  
  // GET request method
  Future<ApiResponse> get(
    String endpoint, {
    String? token,
    bool withCredentials = true,
  }) async {
    try {
      final url = Uri.parse(endpoint);
      _logRequest('GET', endpoint, null);

      final response = await http.get(
        url,
        headers: _getHeaders(token: token, withCredentials: withCredentials),
      ).timeout(EnvironmentConfig.apiTimeout);
      
      _logResponse(response);
      
      return ApiResponse(
        statusCode: response.statusCode,
        data: _parseResponse(response.body),
        success: response.statusCode >= 200 && response.statusCode < 300,
        message: _extractMessage(response.body, response.statusCode),
      );
    } catch (e) {
      if (EnvironmentConfig.enableLogging && EnvironmentConfig.isDevelopment) {
        // ignore: avoid_print
        debugPrint('❌ API Error: $e');
      }
      return ApiResponse(
        statusCode: 0,
        data: null,
        success: false,
        message: _handleError(e),
      );
    }
  }
  
  // PUT request method
  Future<ApiResponse> put(
    String endpoint, {
    Map<String, dynamic>? body,
    String? token,
    bool withCredentials = true,
  }) async {
    try {
      final url = Uri.parse(endpoint);
      _logRequest('PUT', endpoint, body);

      final response = await http.put(
        url,
        headers: _getHeaders(token: token, withCredentials: withCredentials),
        body: body != null ? jsonEncode(body) : null,
      ).timeout(EnvironmentConfig.apiTimeout);
      
      _logResponse(response);
      
      return ApiResponse(
        statusCode: response.statusCode,
        data: _parseResponse(response.body),
        success: response.statusCode >= 200 && response.statusCode < 300,
        message: _extractMessage(response.body, response.statusCode),
      );
    } catch (e) {
      if (EnvironmentConfig.enableLogging && EnvironmentConfig.isDevelopment) {
        // ignore: avoid_print
        debugPrint('❌ API Error: $e');
      }
      return ApiResponse(
        statusCode: 0,
        data: null,
        success: false,
        message: _handleError(e),
      );
    }
  }
  
  // DELETE request method
  Future<ApiResponse> delete(
    String endpoint, {
    String? token,
    bool withCredentials = true,
  }) async {
    try {
      final url = Uri.parse(endpoint);
      _logRequest('DELETE', endpoint, null);

      final response = await http.delete(
        url,
        headers: _getHeaders(token: token, withCredentials: withCredentials),
      ).timeout(EnvironmentConfig.apiTimeout);
      
      _logResponse(response);
      
      return ApiResponse(
        statusCode: response.statusCode,
        data: _parseResponse(response.body),
        success: response.statusCode >= 200 && response.statusCode < 300,
        message: _extractMessage(response.body, response.statusCode),
      );
    } catch (e) {
      if (EnvironmentConfig.enableLogging && EnvironmentConfig.isDevelopment) {
        // ignore: avoid_print
        debugPrint('❌ API Error: $e');
      }
      return ApiResponse(
        statusCode: 0,
        data: null,
        success: false,
        message: _handleError(e),
      );
    }
  }
  
  // Helper method to parse JSON response
  dynamic _parseResponse(String responseBody) {
    try {
      return jsonDecode(responseBody);
    } catch (e) {
      return responseBody;
    }
  }
  
  // Helper method to extract message from response
  String _extractMessage(String responseBody, int statusCode) {
    try {
      final data = jsonDecode(responseBody);
      if (data is Map<String, dynamic>) {
        return data['message'] ?? _getDefaultMessage(statusCode);
      }
    } catch (e) {
      // If parsing fails, use default message
    }
    return _getDefaultMessage(statusCode);
  }
  
  // Get default message based on status code
  String _getDefaultMessage(int statusCode) {
    switch (statusCode) {
      case 200:
      case 201:
        return 'Success';
      case 400:
        return 'Bad request';
      case 401:
        return 'Unauthorized';
      case 403:
        return 'Forbidden';
      case 404:
        return 'Not found';
      case 409:
        return 'Conflict';
      case 500:
        return 'Internal server error';
      default:
        return 'Unknown error';
    }
  }
  
  // Handle different types of errors
  String _handleError(dynamic error) {
    if (error.toString().contains('TimeoutException')) {
      return 'Request timeout. Please check your connection.';
    } else if (error.toString().contains('SocketException')) {
      return 'No internet connection. Please check your network.';
    } else {
      return 'Network error. Please try again later.';
    }
  }

  // --- Vocabulary Chapters API Methods ---

  /// Get all vocabulary chapters with their unlock status and progress
  Future<ApiResponse> getVocabularyChapters(String token) async {
    final endpoint = '${EnvironmentConfig.fullApiUrl}/vocab/chapters';
    return await get(endpoint, token: token);
  }

  /// Complete a vocabulary chapter
  Future<ApiResponse> completeVocabularyChapter(
    String chapterId,
    String token, {
    int? finalScore,
    String? completionNotes,
    Map<String, dynamic>? extraData,
  }) async {
    final endpoint = '${EnvironmentConfig.fullApiUrl}/vocab/chapters/$chapterId/complete';
    
    final body = <String, dynamic>{};
    if (finalScore != null) body['finalScore'] = finalScore;
    if (completionNotes != null) body['completionNotes'] = completionNotes;
    if (extraData != null) body['extraData'] = extraData;

    return await post(endpoint, body: body, token: token);
  }

  // --- Evaluation API Methods ---

  /// Get all chapter evaluations for the authenticated user
  Future<ApiResponse> getChapterEvaluations({String? token}) async {
    final endpoint = '${EnvironmentConfig.fullApiUrl}/approval/evaluations';
    return await get(endpoint, token: token);
  }

  /// Evaluate a specific chapter
  Future<ApiResponse> evaluateChapter(
    int chapterId,
    Map<String, dynamic> evaluationData, {
    String? token,
  }) async {
    final endpoint = '${EnvironmentConfig.fullApiUrl}/approval/evaluate/$chapterId';
    
    final body = {
      'chapterId': chapterId,
      ...evaluationData,
    };

    return await post(endpoint, body: body, token: token);
  }

  /// Get evaluation history for a specific user
  Future<ApiResponse> getEvaluationHistory(int? userId, {String? token}) async {
    final endpoint = userId != null 
        ? '${EnvironmentConfig.fullApiUrl}/approval/history/$userId'
        : '${EnvironmentConfig.fullApiUrl}/approval/history';
    return await get(endpoint, token: token);
  }

  /// Get evaluation details by evaluation ID
  Future<ApiResponse> getEvaluationDetails(String evaluationId, {String? token}) async {
    final endpoint = '${EnvironmentConfig.fullApiUrl}/approval/evaluations/$evaluationId';
    return await get(endpoint, token: token);
  }

  /// Configure approval rules (admin only)
  Future<ApiResponse> configureApprovalRule(
    Map<String, dynamic> ruleData, {
    String? token,
  }) async {
    final endpoint = '${EnvironmentConfig.fullApiUrl}/approval/rules';
    return await post(endpoint, body: ruleData, token: token);
  }

  /// Get current approval rules
  Future<ApiResponse> getApprovalRules({String? token}) async {
    final endpoint = '${EnvironmentConfig.fullApiUrl}/approval/rules';
    return await get(endpoint, token: token);
  }
}

// API Response wrapper class
class ApiResponse {
  final int statusCode;
  final dynamic data;
  final bool success;
  final String message;
  
  ApiResponse({
    required this.statusCode,
    required this.data,
    required this.success,
    required this.message,
  });
  
  @override
  String toString() {
    return 'ApiResponse{statusCode: $statusCode, success: $success, message: $message}';
  }
}