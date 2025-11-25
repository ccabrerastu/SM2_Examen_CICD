import 'dart:convert';
import 'package:flutter/material.dart';

import '../utils/api_service.dart';
import '../utils/environment_config.dart';

abstract class BasePracticeService {
  final ApiService apiService = ApiService();
  
  String get baseEndpoint;
    
  // Create a new practice session
  Future<ApiResponse> createPracticeSession(
    Map<String, dynamic> practiceData,
    String token,
  ) async {
    final endpoint = '${EnvironmentConfig.apiBaseUrl}/$baseEndpoint';
    
    return await apiService.post(
      endpoint,
      body: practiceData,
      token: token,
    );
  }
  
  // Get a specific practice session
  Future<ApiResponse> getPracticeSession(
    String sessionId,
    String token,
  ) async {
    final endpoint = '${EnvironmentConfig.apiBaseUrl}/$baseEndpoint/$sessionId';
    
    return await apiService.get(
      endpoint,
      token: token,
    );
  }
  
  // Update a practice session
  Future<ApiResponse> updatePracticeSession(
    String sessionId,
    Map<String, dynamic> updateData,
    String token,
  ) async {
    final endpoint = '${EnvironmentConfig.apiBaseUrl}/$baseEndpoint/$sessionId';
    
    return await apiService.put(
      endpoint,
      body: updateData,
      token: token,
    );
  }
  
  // Get user practice sessions
  Future<ApiResponse> getUserPracticeSessions(
    String userId,
    String token, {
    Map<String, dynamic>? filters,
    int? limit,
    int? offset,
  }) async {
    var endpoint = '${EnvironmentConfig.apiBaseUrl}/$baseEndpoint/user/$userId/sessions';
    
    // Add query parameters if provided
    final queryParams = <String, String>{};
    
    if (filters != null) {
      filters.forEach((key, value) {
        if (value != null) {
          queryParams[key] = value.toString();
        }
      });
    }
    
    if (limit != null) {
      queryParams['limit'] = limit.toString();
    }
    
    if (offset != null) {
      queryParams['offset'] = offset.toString();
    }
    
    if (queryParams.isNotEmpty) {
      final queryString = queryParams.entries
          .map((e) => '${e.key}=${Uri.encodeComponent(e.value)}')
          .join('&');
      endpoint += '?$queryString';
    }
    
    return await apiService.get(
      endpoint,
      token: token,
    );
  }
  
  // Get user practice statistics
  Future<ApiResponse> getUserPracticeStats(
    String userId,
    String token, {
    String? timeframe,
    Map<String, dynamic>? additionalFilters,
  }) async {
    var endpoint = '${EnvironmentConfig.apiBaseUrl}/$baseEndpoint/user/$userId/stats';
    
    final queryParams = <String, String>{};
    
    if (timeframe != null) {
      queryParams['timeframe'] = timeframe;
    }
    
    if (additionalFilters != null) {
      additionalFilters.forEach((key, value) {
        if (value != null) {
          queryParams[key] = value.toString();
        }
      });
    }
    
    if (queryParams.isNotEmpty) {
      final queryString = queryParams.entries
          .map((e) => '${e.key}=${Uri.encodeComponent(e.value)}')
          .join('&');
      endpoint += '?$queryString';
    }
    
    return await apiService.get(
      endpoint,
      token: token,
    );
  }
  
  // Helper method to handle API responses
  T? parseResponse<T>(ApiResponse response, T Function(Map<String, dynamic>) fromJson) {
    if (response.success && response.data != null) {
      try {
        if (response.data is Map<String, dynamic>) {
          return fromJson(response.data as Map<String, dynamic>);
        } else if (response.data is String) {
          final jsonData = jsonDecode(response.data as String);
          if (jsonData is Map<String, dynamic>) {
            return fromJson(jsonData);
          }
        }
      } catch (e) {
        if (EnvironmentConfig.enableLogging) {
          debugPrint('Error parsing response: $e');
        }
      }
    }
    return null;
  }
  
  // Helper method to handle list responses
  List<T> parseListResponse<T>(ApiResponse response, T Function(Map<String, dynamic>) fromJson) {
    if (response.success && response.data != null) {
      try {
        List<dynamic> dataList;
        
        if (response.data is List) {
          dataList = response.data as List<dynamic>;
        } else if (response.data is String) {
          final jsonData = jsonDecode(response.data as String);
          if (jsonData is List) {
            dataList = jsonData;
          } else {
            return [];
          }
        } else {
          return [];
        }
        
        return dataList
            .whereType<Map<String, dynamic>>()
            .map((item) => fromJson(item))
            .toList();
      } catch (e) {
        if (EnvironmentConfig.enableLogging) {
          debugPrint('Error parsing list response: $e');
        }
      }
    }
    return [];
  }
}