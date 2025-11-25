import 'dart:async';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/approval_rule.dart';
import '../models/approval_evaluation.dart';
import '../models/approval_metrics.dart';
import '../utils/approval_service.dart';

enum ApprovalState {
  initial,
  loading,
  evaluating,
  evaluated,
  error,
}

class ApprovalProvider with ChangeNotifier {
  final ApprovalService _approvalService = ApprovalService();
  
  ApprovalState _approvalState = ApprovalState.initial;
  String? _errorMessage;
  
  // Current data
  List<ApprovalRule> _approvalRules = [];
  List<ApprovalEvaluation> _userEvaluations = [];
  final List<ApprovalMetrics> _userMetrics = [];
  ApprovalEvaluation? _currentEvaluation;
  UserMetricsSummary? _userMetricsSummary;
  
  // Cache for chapter-specific data
  final Map<String, List<ApprovalRule>> _chapterRulesCache = {};
  final Map<String, ApprovalEvaluation?> _chapterEvaluationsCache = {};
  final Map<String, List<ApprovalMetrics>> _chapterMetricsCache = {};
  
  // Getters
  ApprovalState get approvalState => _approvalState;
  String? get errorMessage => _errorMessage;
  bool get isLoading => _approvalState == ApprovalState.loading;
  bool get isEvaluating => _approvalState == ApprovalState.evaluating;
  List<ApprovalRule> get approvalRules => _approvalRules;
  List<ApprovalEvaluation> get userEvaluations => _userEvaluations;
  List<ApprovalMetrics> get userMetrics => _userMetrics;
  ApprovalEvaluation? get currentEvaluation => _currentEvaluation;
  UserMetricsSummary? get userMetricsSummary => _userMetricsSummary;
  
  /// Initialize approval data for the current user
  Future<void> initializeApprovalData() async {
    try {
      _setApprovalState(ApprovalState.loading);
      
      final token = await _getAuthToken();
      if (token == null) {
        throw Exception('User not authenticated');
      }
      
      // Load approval rules
      await _loadApprovalRules(token);
      
      // Load user evaluations
      await _loadUserEvaluations(token);
      
      // Load user metrics summary
      await _loadUserMetricsSummary(token);
      
      _setApprovalState(ApprovalState.initial);
      
    } catch (e) {
      _setApprovalState(ApprovalState.error, e.toString());
    }
  }
  
  /// Evaluate user approval for a specific chapter
  Future<ApprovalEvaluation?> evaluateChapterApproval({
    required String chapterId,
    required double score,
    required int errors,
    required int timeSpent,
    Map<String, dynamic>? quizData,
  }) async {
    try {
      _setApprovalState(ApprovalState.evaluating);
      
      final token = await _getAuthToken();
      final userId = await _getUserId();
      
      if (token == null || userId == null) {
        throw Exception('User not authenticated');
      }
      
      // Call evaluation API
      final response = await _approvalService.evaluateApproval(
        userId: userId,
        chapterId: chapterId,
        score: score,
        errors: errors,
        timeSpent: timeSpent,
        token: token,
        metadata: quizData,
      );
      
      if (response.success) {
        final evaluation = _approvalService.parseApprovalEvaluation(response.data);
        
        if (evaluation != null) {
          _currentEvaluation = evaluation;
          
          // Update cache
          _chapterEvaluationsCache[chapterId] = evaluation;
          
          // Add to user evaluations if not already present
          final existingIndex = _userEvaluations.indexWhere((e) => e.id == evaluation.id);
          if (existingIndex >= 0) {
            _userEvaluations[existingIndex] = evaluation;
          } else {
            _userEvaluations.add(evaluation);
          }
          
          // Create metrics for this evaluation
          await _createEvaluationMetrics(
            userId: userId,
            chapterId: chapterId,
            score: score,
            errors: errors,
            timeSpent: timeSpent,
            token: token,
          );
          
          _setApprovalState(ApprovalState.evaluated);
          return evaluation;
        }
      } else {
        throw Exception(response.message);
      }
      
    } catch (e) {
      _setApprovalState(ApprovalState.error, e.toString());
      if (kDebugMode) {
        debugPrint('❌ Error evaluating approval: $e');
      }
    }
    
    return null;
  }
  
  /// Get approval rules for a specific chapter
  Future<List<ApprovalRule>> getChapterApprovalRules(String chapterId) async {
    // Check cache first
    if (_chapterRulesCache.containsKey(chapterId)) {
      return _chapterRulesCache[chapterId]!;
    }
    
    try {
      final token = await _getAuthToken();
      if (token == null) {
        throw Exception('User not authenticated');
      }
      
      final response = await _approvalService.getApprovalRulesByChapter(chapterId, token: token);
      
      if (response.success) {
        final rules = _approvalService.parseApprovalRules(response.data);
        _chapterRulesCache[chapterId] = rules;
        return rules;
      } else {
        throw Exception(response.message);
      }
      
    } catch (e) {
      if (kDebugMode) {
        debugPrint('❌ Error loading chapter approval rules: $e');
      }
      return [];
    }
  }
  
  /// Get user's evaluation for a specific chapter
  Future<ApprovalEvaluation?> getUserChapterEvaluation(String chapterId) async {
    // Check cache first
    if (_chapterEvaluationsCache.containsKey(chapterId)) {
      return _chapterEvaluationsCache[chapterId];
    }
    
    try {
      final token = await _getAuthToken();
      final userId = await _getUserId();
      
      if (token == null || userId == null) {
        throw Exception('User not authenticated');
      }
      
      final response = await _approvalService.getUserChapterEvaluation(userId, chapterId, token: token);
      
      if (response.success) {
        final evaluation = _approvalService.parseApprovalEvaluation(response.data);
        _chapterEvaluationsCache[chapterId] = evaluation;
        return evaluation;
      } else {
        // No evaluation found for this chapter
        _chapterEvaluationsCache[chapterId] = null;
        return null;
      }
      
    } catch (e) {
      if (kDebugMode) {
        debugPrint('❌ Error loading user chapter evaluation: $e');
      }
      _chapterEvaluationsCache[chapterId] = null;
      return null;
    }
  }
  
  /// Get user's metrics for a specific chapter
  Future<List<ApprovalMetrics>> getUserChapterMetrics(String chapterId) async {
    // Check cache first
    if (_chapterMetricsCache.containsKey(chapterId)) {
      return _chapterMetricsCache[chapterId]!;
    }
    
    try {
      final token = await _getAuthToken();
      final userId = await _getUserId();
      
      if (token == null || userId == null) {
        throw Exception('User not authenticated');
      }
      
      final response = await _approvalService.getUserChapterMetrics(userId, chapterId, token: token);
      
      if (response.success) {
        final metrics = _approvalService.parseApprovalMetricsList(response.data);
        _chapterMetricsCache[chapterId] = metrics;
        return metrics;
      } else {
        throw Exception(response.message);
      }
      
    } catch (e) {
      if (kDebugMode) {
        debugPrint('❌ Error loading user chapter metrics: $e');
      }
      return [];
    }
  }
  
  /// Check if user has passed approval for a chapter
  bool hasPassedChapterApproval(String chapterId) {
    final evaluation = _chapterEvaluationsCache[chapterId];
    return evaluation?.isApproved() ?? false;
  }
  
  /// Get the current approval status for a chapter
  EvaluationStatus? getChapterApprovalStatus(String chapterId) {
    final evaluation = _chapterEvaluationsCache[chapterId];
    return evaluation?.status;
  }
  
  /// Clear approval data (used on logout)
  Future<void> clearApprovalData() async {
    _approvalRules.clear();
    _userEvaluations.clear();
    _userMetrics.clear();
    _currentEvaluation = null;
    _userMetricsSummary = null;
    
    _chapterRulesCache.clear();
    _chapterEvaluationsCache.clear();
    _chapterMetricsCache.clear();
    
    _approvalState = ApprovalState.initial;
    _errorMessage = null;
    
    notifyListeners();
  }
  
  /// Refresh approval data
  Future<void> refreshApprovalData() async {
    _chapterRulesCache.clear();
    _chapterEvaluationsCache.clear();
    _chapterMetricsCache.clear();
    
    await initializeApprovalData();
  }
  
  // Private helper methods
  Future<void> _loadApprovalRules(String token) async {
    final response = await _approvalService.getApprovalRules(token: token);
    
    if (response.success) {
      _approvalRules = _approvalService.parseApprovalRules(response.data);
    } else {
      throw Exception('Failed to load approval rules: ${response.message}');
    }
  }
  
  Future<void> _loadUserEvaluations(String token) async {
    final userId = await _getUserId();
    if (userId == null) return;
    
    final response = await _approvalService.getUserEvaluations(userId, token: token);
    
    if (response.success) {
      _userEvaluations = _approvalService.parseApprovalEvaluations(response.data);
    } else {
      if (kDebugMode) {
        debugPrint('⚠️ Could not load user evaluations: ${response.message}');
      }
    }
  }
  
  Future<void> _loadUserMetricsSummary(String token) async {
    final userId = await _getUserId();
    if (userId == null) return;
    
    final response = await _approvalService.getUserMetricsSummary(userId, token: token);
    
    if (response.success) {
      _userMetricsSummary = _approvalService.parseUserMetricsSummary(response.data);
    } else {
      if (kDebugMode) {
        debugPrint('⚠️ Could not load user metrics summary: ${response.message}');
      }
    }
  }
  
  Future<void> _createEvaluationMetrics({
    required String userId,
    required String chapterId,
    required double score,
    required int errors,
    required int timeSpent,
    required String token,
  }) async {
    try {
      // Create accuracy metric
      final accuracyMetric = ApprovalMetrics.createAccuracyMetric(
        id: '', // Will be generated by backend
        userId: userId,
        chapterId: chapterId,
        accuracy: score,
      );
      
      await _approvalService.createApprovalMetrics(accuracyMetric, token: token);
      
      // Create speed metric
      final speedMetric = ApprovalMetrics.createSpeedMetric(
        id: '', // Will be generated by backend
        userId: userId,
        chapterId: chapterId,
        timeSpent: timeSpent.toDouble(),
      );
      
      await _approvalService.createApprovalMetrics(speedMetric, token: token);
      
      // Create attempt metric (assuming this is attempt #1 for simplicity)
      final attemptMetric = ApprovalMetrics.createAttemptMetric(
        id: '', // Will be generated by backend
        userId: userId,
        chapterId: chapterId,
        attempts: 1,
      );
      
      await _approvalService.createApprovalMetrics(attemptMetric, token: token);
      
    } catch (e) {
      if (kDebugMode) {
        debugPrint('⚠️ Could not create evaluation metrics: $e');
      }
    }
  }
  
  Future<String?> _getAuthToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('auth_token');
  }
  
  Future<String?> _getUserId() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('user_id');
  }
  
  void _setApprovalState(ApprovalState state, [String? errorMessage]) {
    _approvalState = state;
    _errorMessage = errorMessage;
    notifyListeners();
  }
  
}