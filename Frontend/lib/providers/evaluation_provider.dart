import 'dart:async';
import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/chapter_evaluation.dart';
import '../utils/api_service.dart';
import 'auth_provider.dart';

enum EvaluationState {
  initial,
  loading,
  loaded,
  evaluating,
  evaluated,
  error,
}

class EvaluationProvider with ChangeNotifier {
  final ApiService _apiService = ApiService();
  final AuthProvider _authProvider;
  
  EvaluationState _state = EvaluationState.initial;
  List<ChapterEvaluation> _evaluations = [];
  ChapterEvaluation? _currentEvaluation;
  String? _errorMessage;
  Timer? _refreshTimer;
  
  // Offline handling
  final List<Map<String, dynamic>> _pendingEvaluations = [];
  Timer? _retryTimer;
  bool _isOnline = true;
  
  // Configuration
  static const Duration _refreshInterval = Duration(minutes: 5);
  static const String _evaluationsKey = 'cached_evaluations';
  static const String _pendingEvaluationsKey = 'pending_evaluations';
  
  EvaluationProvider(this._authProvider) {
    _initializeProvider();
  }
  
  // Getters
  EvaluationState get state => _state;
  List<ChapterEvaluation> get evaluations => _evaluations;
  ChapterEvaluation? get currentEvaluation => _currentEvaluation;
  String? get errorMessage => _errorMessage;
  bool get isLoading => _state == EvaluationState.loading;
  bool get isEvaluating => _state == EvaluationState.evaluating;
  bool get hasData => _evaluations.isNotEmpty;
  
  // Statistics
  int get totalEvaluations => _evaluations.length;
  int get passedEvaluations => _evaluations.where((e) => e.status == EvaluationStatus.passed || e.status == EvaluationStatus.excellent).length;
  int get failedEvaluations => _evaluations.where((e) => e.status == EvaluationStatus.failed).length;
  double get averageScore => _evaluations.isEmpty ? 0.0 : _evaluations.map((e) => e.score).reduce((a, b) => a + b) / _evaluations.length;
  
  void _initializeProvider() {
    _loadCachedData();
    _startPeriodicRefresh();
  }
  
  Future<void> _loadCachedData() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final cachedData = prefs.getString(_evaluationsKey);
      
      if (cachedData != null) {
        final List<dynamic> jsonList = json.decode(cachedData);
        _evaluations = jsonList.map((json) => ChapterEvaluation.fromJson(json)).toList();
        _state = EvaluationState.loaded;
        notifyListeners();
      }
    } catch (e) {
      debugPrint('Error loading cached evaluations: $e');
    }
  }
  
  Future<void> _saveCachedData() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final jsonList = _evaluations.map((e) => e.toJson()).toList();
      await prefs.setString(_evaluationsKey, json.encode(jsonList));
    } catch (e) {
      debugPrint('Error saving cached evaluations: $e');
    }
  }
  
  void _startPeriodicRefresh() {
    _refreshTimer?.cancel();
    _refreshTimer = Timer.periodic(_refreshInterval, (_) {
      if (_authProvider.isAuthenticated) {
        refreshEvaluations();
      }
    });
  }
  
  Future<void> getChapterEvaluations({bool forceRefresh = false}) async {
    if (!_authProvider.isAuthenticated) {
      _setError('Usuario no autenticado');
      return;
    }
    
    if (_state == EvaluationState.loading) return;
    
    if (!forceRefresh && _evaluations.isNotEmpty) {
      _state = EvaluationState.loaded;
      notifyListeners();
      return;
    }
    
    _setState(EvaluationState.loading);
    
    try {
      final token = _authProvider.token;
      final response = await _apiService.getChapterEvaluations(token: token);
      
      if (response.success && response.data != null) {
        _evaluations = (response.data as List)
            .map((json) => ChapterEvaluation.fromJson(json))
            .toList();
        
        await _saveCachedData();
        _setState(EvaluationState.loaded);
        _clearError();
      } else {
        _setError(response.message);
      }
    } catch (e) {
      _setError('Error de conexión: $e');
      debugPrint('Error getting evaluations: $e');
    }
  }
  
  Future<void> evaluateChapter(int chapterId, Map<String, dynamic> evaluationData) async {
    if (!_authProvider.isAuthenticated) {
      _setError('Usuario no autenticado');
      return;
    }
    
    if (_state == EvaluationState.evaluating) return;
    
    _setState(EvaluationState.evaluating);
    
    try {
      final token = _authProvider.token;
      final response = await _apiService.evaluateChapter(chapterId, evaluationData, token: token);
      
      if (response.success && response.data != null) {
        final newEvaluation = ChapterEvaluation.fromJson(response.data);
        
        // Update or add the evaluation
        final existingIndex = _evaluations.indexWhere((e) => e.chapterNumber == chapterId);
        if (existingIndex != -1) {
          _evaluations[existingIndex] = newEvaluation;
        } else {
          _evaluations.add(newEvaluation);
        }
        
        _currentEvaluation = newEvaluation;
        await _saveCachedData();
        _setState(EvaluationState.evaluated);
        _clearError();
      } else {
        _setError(response.message);
      }
    } catch (e) {
      // Save for offline retry
      if (!_isOnline) {
        _pendingEvaluations.add({
          'chapterId': chapterId,
          'evaluationData': evaluationData,
          'timestamp': DateTime.now().millisecondsSinceEpoch,
        });
        await _savePendingEvaluations();
      }
      
      _setError('Error de conexión: $e');
      debugPrint('Error evaluating chapter: $e');
    }
  }
  
  Future<void> getEvaluationHistory({int? userId}) async {
    if (!_authProvider.isAuthenticated) {
      _setError('Usuario no autenticado');
      return;
    }
    
    _setState(EvaluationState.loading);
    
    try {
      final token = _authProvider.token;
      final userIdToUse = userId ?? (_authProvider.user?.id is int ? _authProvider.user!.id as int : null);
      final response = await _apiService.getEvaluationHistory(userIdToUse, token: token);
      
      if (response.success && response.data != null) {
        _evaluations = (response.data as List)
            .map((json) => ChapterEvaluation.fromJson(json))
            .toList();
        
        await _saveCachedData();
        _setState(EvaluationState.loaded);
        _clearError();
      } else {
        _setError(response.message);
      }
    } catch (e) {
      _setError('Error de conexión: $e');
      debugPrint('Error getting evaluation history: $e');
    }
  }
  
  Future<void> refreshEvaluations() async {
    await getChapterEvaluations(forceRefresh: true);
  }
  
  List<ChapterEvaluation> getEvaluationsByChapter(int? chapterNumber) {
    if (chapterNumber == null) return _evaluations;
    return _evaluations.where((e) => e.chapterNumber == chapterNumber).toList();
  }
  
  ChapterEvaluation? getLatestEvaluationForChapter(int chapterNumber) {
    final chapterEvaluations = _evaluations
        .where((e) => e.chapterNumber == chapterNumber)
        .toList();
    
    if (chapterEvaluations.isEmpty) return null;
    
    chapterEvaluations.sort((a, b) => b.completedAt.compareTo(a.completedAt));
    return chapterEvaluations.first;
  }
  
  Future<void> _savePendingEvaluations() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_pendingEvaluationsKey, json.encode(_pendingEvaluations));
    } catch (e) {
      debugPrint('Error saving pending evaluations: $e');
    }
  }
  
  
  Future<void> _processPendingEvaluations() async {
    if (_pendingEvaluations.isEmpty) return;
    
    final List<Map<String, dynamic>> toRemove = [];
    
    for (final pending in _pendingEvaluations) {
      try {
        await evaluateChapter(pending['chapterId'], pending['evaluationData']);
        toRemove.add(pending);
      } catch (e) {
        debugPrint('Failed to process pending evaluation: $e');
      }
    }
    
    _pendingEvaluations.removeWhere((item) => toRemove.contains(item));
    await _savePendingEvaluations();
  }
  
  void _setState(EvaluationState newState) {
    _state = newState;
    notifyListeners();
  }
  
  void _setError(String message) {
    _errorMessage = message;
    _state = EvaluationState.error;
    notifyListeners();
  }
  
  void _clearError() {
    _errorMessage = null;
  }
  
  void clearCurrentEvaluation() {
    _currentEvaluation = null;
    notifyListeners();
  }
  
  void setOnlineStatus(bool isOnline) {
    _isOnline = isOnline;
    if (isOnline && _pendingEvaluations.isNotEmpty) {
      _processPendingEvaluations();
    }
  }
  
  @override
  void dispose() {
    _refreshTimer?.cancel();
    _retryTimer?.cancel();
    super.dispose();
  }
}