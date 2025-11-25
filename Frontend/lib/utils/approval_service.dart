import '../models/approval_rule.dart';
import '../models/approval_evaluation.dart';
import '../models/approval_metrics.dart';
import 'api_service.dart';
import 'environment_config.dart';

class ApprovalService {
  static final ApprovalService _instance = ApprovalService._internal();
  
  factory ApprovalService() => _instance;
  
  ApprovalService._internal();
  
  final ApiService _apiService = ApiService();
  
  // Base endpoint for approval module
  String get _baseEndpoint => '${EnvironmentConfig.fullApiUrl}/approval';
  
  // Approval Rules endpoints
  Future<ApiResponse> getApprovalRules({String? token}) async {
    return await _apiService.get(
      '$_baseEndpoint/rules',
      token: token,
    );
  }
  
  Future<ApiResponse> getApprovalRuleById(String ruleId, {String? token}) async {
    return await _apiService.get(
      '$_baseEndpoint/rules/$ruleId',
      token: token,
    );
  }
  
  Future<ApiResponse> getApprovalRulesByChapter(String chapterId, {String? token}) async {
    return await _apiService.get(
      '$_baseEndpoint/rules/chapter/$chapterId',
      token: token,
    );
  }
  
  Future<ApiResponse> createApprovalRule(ApprovalRule rule, {String? token}) async {
    return await _apiService.post(
      '$_baseEndpoint/rules',
      body: rule.toJson(),
      token: token,
    );
  }
  
  Future<ApiResponse> updateApprovalRule(String ruleId, ApprovalRule rule, {String? token}) async {
    return await _apiService.put(
      '$_baseEndpoint/rules/$ruleId',
      body: rule.toJson(),
      token: token,
    );
  }
  
  // Approval Evaluation endpoints
  Future<ApiResponse> evaluateApproval({
    required String userId,
    required String chapterId,
    required double score,
    required int errors,
    required int timeSpent,
    String? token,
    Map<String, dynamic>? metadata,
  }) async {
    final body = {
      'userId': userId,
      'chapterId': chapterId,
      'score': score,
      'errors': errors,
      'timeSpent': timeSpent,
    };
    
    // Add metadata if available
    if (metadata != null && metadata.isNotEmpty) {
      body['metadata'] = metadata;
    }
    
    return await _apiService.post(
      '$_baseEndpoint/evaluate',
      body: body,
      token: token,
    );
  }
  
  Future<ApiResponse> getApprovalEvaluations({String? token}) async {
    return await _apiService.get(
      '$_baseEndpoint/evaluations',
      token: token,
    );
  }
  
  Future<ApiResponse> getApprovalEvaluationById(String evaluationId, {String? token}) async {
    return await _apiService.get(
      '$_baseEndpoint/evaluations/$evaluationId',
      token: token,
    );
  }
  
  Future<ApiResponse> getUserEvaluations(String userId, {String? token}) async {
    return await _apiService.get(
      '$_baseEndpoint/evaluations/user/$userId',
      token: token,
    );
  }
  
  Future<ApiResponse> getChapterEvaluations(String chapterId, {String? token}) async {
    return await _apiService.get(
      '$_baseEndpoint/evaluations/chapter/$chapterId',
      token: token,
    );
  }
  
  Future<ApiResponse> getUserChapterEvaluation(String userId, String chapterId, {String? token}) async {
    return await _apiService.get(
      '$_baseEndpoint/evaluations/user/$userId/chapter/$chapterId',
      token: token,
    );
  }
  
  Future<ApiResponse> getChapterEvaluationStats(String chapterId, {String? token}) async {
    return await _apiService.get(
      '$_baseEndpoint/evaluations/chapter/$chapterId/stats',
      token: token,
    );
  }
  
  Future<ApiResponse> updateApprovalEvaluation(String evaluationId, ApprovalEvaluation evaluation, {String? token}) async {
    return await _apiService.put(
      '$_baseEndpoint/evaluations/$evaluationId',
      body: evaluation.toJson(),
      token: token,
    );
  }
  
  // Approval Metrics endpoints
  Future<ApiResponse> createApprovalMetrics(ApprovalMetrics metrics, {String? token}) async {
    return await _apiService.post(
      '$_baseEndpoint/metrics',
      body: metrics.toJson(),
      token: token,
    );
  }
  
  Future<ApiResponse> getApprovalMetrics({String? token}) async {
    return await _apiService.get(
      '$_baseEndpoint/metrics',
      token: token,
    );
  }
  
  Future<ApiResponse> getApprovalMetricsById(String metricsId, {String? token}) async {
    return await _apiService.get(
      '$_baseEndpoint/metrics/$metricsId',
      token: token,
    );
  }
  
  Future<ApiResponse> getUserMetrics(String userId, {String? token}) async {
    return await _apiService.get(
      '$_baseEndpoint/metrics/user/$userId',
      token: token,
    );
  }
  
  Future<ApiResponse> getChapterMetrics(String chapterId, {String? token}) async {
    return await _apiService.get(
      '$_baseEndpoint/metrics/chapter/$chapterId',
      token: token,
    );
  }
  
  Future<ApiResponse> getUserChapterMetrics(String userId, String chapterId, {String? token}) async {
    return await _apiService.get(
      '$_baseEndpoint/metrics/user/$userId/chapter/$chapterId',
      token: token,
    );
  }
  
  Future<ApiResponse> getAverageMetricValue(String metricType, {String? token}) async {
    return await _apiService.get(
      '$_baseEndpoint/metrics/average/$metricType',
      token: token,
    );
  }
  
  Future<ApiResponse> getUserMetricsSummary(String userId, {String? token}) async {
    return await _apiService.get(
      '$_baseEndpoint/metrics/user/$userId/summary',
      token: token,
    );
  }
  
  Future<ApiResponse> getChapterMetricsSummary(String chapterId, {String? token}) async {
    return await _apiService.get(
      '$_baseEndpoint/metrics/chapter/$chapterId/summary',
      token: token,
    );
  }
  
  Future<ApiResponse> updateApprovalMetrics(String metricsId, ApprovalMetrics metrics, {String? token}) async {
    return await _apiService.put(
      '$_baseEndpoint/metrics/$metricsId',
      body: metrics.toJson(),
      token: token,
    );
  }
  
  // Helper methods for parsing responses
  List<ApprovalRule> parseApprovalRules(dynamic data) {
    if (data is List) {
      return data.map((item) => ApprovalRule.fromJson(item as Map<String, dynamic>)).toList();
    }
    return [];
  }
  
  ApprovalRule? parseApprovalRule(dynamic data) {
    if (data is Map<String, dynamic>) {
      return ApprovalRule.fromJson(data);
    }
    return null;
  }
  
  List<ApprovalEvaluation> parseApprovalEvaluations(dynamic data) {
    if (data is List) {
      return data.map((item) => ApprovalEvaluation.fromJson(item as Map<String, dynamic>)).toList();
    }
    return [];
  }
  
  ApprovalEvaluation? parseApprovalEvaluation(dynamic data) {
    if (data is Map<String, dynamic>) {
      return ApprovalEvaluation.fromJson(data);
    }
    return null;
  }
  
  List<ApprovalMetrics> parseApprovalMetricsList(dynamic data) {
    if (data is List) {
      return data.map((item) => ApprovalMetrics.fromJson(item as Map<String, dynamic>)).toList();
    }
    return [];
  }
  
  ApprovalMetrics? parseApprovalMetrics(dynamic data) {
    if (data is Map<String, dynamic>) {
      return ApprovalMetrics.fromJson(data);
    }
    return null;
  }
  
  UserMetricsSummary? parseUserMetricsSummary(dynamic data) {
    if (data is Map<String, dynamic>) {
      return UserMetricsSummary.fromJson(data);
    }
    return null;
  }
  
  ChapterMetricsSummary? parseChapterMetricsSummary(dynamic data) {
    if (data is Map<String, dynamic>) {
      return ChapterMetricsSummary.fromJson(data);
    }
    return null;
  }
}