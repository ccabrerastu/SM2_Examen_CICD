import 'dart:async';
import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/vocabulary_chapter.dart';
import '../utils/api_service.dart';
import 'auth_provider.dart';

enum VocabularyChaptersState {
  initial,
  loading,
  loaded,
  completing,
  completed,
  error,
}

class VocabularyChaptersProvider with ChangeNotifier {
  final ApiService _apiService = ApiService();
  final AuthProvider _authProvider;
  
  VocabularyChaptersState _state = VocabularyChaptersState.initial;
  VocabularyChaptersData? _chaptersData;
  String? _errorMessage;
  Timer? _refreshTimer;
  
  // Offline handling
  final List<Map<String, dynamic>> _pendingActions = [];
  Timer? _retryTimer;
  bool _isOnline = true;
  
  // Configuration
  static const Duration _refreshInterval = Duration(minutes: 10);
  static const String _chaptersKey = 'cached_vocabulary_chapters';
  static const String _pendingActionsKey = 'pending_chapters_actions';
  
  // Getters
  VocabularyChaptersState get state => _state;
  VocabularyChaptersData? get chaptersData => _chaptersData;
  List<VocabularyChapter> get chapters => _chaptersData?.chapters ?? [];
  String? get errorMessage => _errorMessage;
  bool get isLoading => _state == VocabularyChaptersState.loading;
  bool get isCompleting => _state == VocabularyChaptersState.completing;
  bool get hasData => _chaptersData != null;
  
  // Statistics
  int get totalChapters => _chaptersData?.totalChapters ?? 0;
  int get unlockedChapters => _chaptersData?.unlockedChapters ?? 0;
  int get completedChapters => _chaptersData?.completedChapters ?? 0;
  double get overallProgress => _chaptersData?.overallProgressPercentage ?? 0.0;
  
  // Current chapter
  VocabularyChapter? get currentChapter => _chaptersData?.currentChapter;
  List<VocabularyChapter> get availableChapters => _chaptersData?.availableChapters ?? [];
  List<VocabularyChapter> get lockedChapters => _chaptersData?.lockedChapters ?? [];

  VocabularyChaptersProvider(this._authProvider) {
    _initialize();
  }

  Future<void> _initialize() async {
    // Listen to auth changes
    _authProvider.addListener(_onAuthChanged);
    
    // Load cached data
    await _loadCachedData();
    
    // Start periodic refresh if authenticated
    if (_authProvider.isAuthenticated) {
      _startPeriodicRefresh();
      // Initial load
      await loadChapters(showLoading: false);
    }
  }

  void _onAuthChanged() {
    if (_authProvider.isAuthenticated) {
      _startPeriodicRefresh();
      loadChapters(showLoading: false);
    } else {
      _stopPeriodicRefresh();
      _clearData();
    }
  }

  void _startPeriodicRefresh() {
    _stopPeriodicRefresh();
    _refreshTimer = Timer.periodic(_refreshInterval, (_) {
      if (_authProvider.isAuthenticated && _isOnline) {
        loadChapters(showLoading: false);
      }
    });
  }

  void _stopPeriodicRefresh() {
    _refreshTimer?.cancel();
    _refreshTimer = null;
  }

  void _clearData() {
    _state = VocabularyChaptersState.initial;
    _chaptersData = null;
    _errorMessage = null;
    notifyListeners();
  }

  /// Load vocabulary chapters from API
  Future<bool> loadChapters({bool showLoading = true}) async {
    if (!_authProvider.isAuthenticated) {
      _setError('User not authenticated');
      return false;
    }

    if (showLoading) {
      _setState(VocabularyChaptersState.loading);
    }

    try {
      final response = await _apiService.getVocabularyChapters(_authProvider.token!);
      
      if (response.success && response.data != null) {
        final chaptersResponse = VocabularyChaptersResponse.fromJson(response.data);
        
        if (chaptersResponse.success) {
          _chaptersData = chaptersResponse.data;
          _setState(VocabularyChaptersState.loaded);
          _errorMessage = null;
          
          // Cache the data
          await _cacheData();
          
          // Mark as online
          _isOnline = true;
          
          if (kDebugMode) {
            debugPrint('📚 Vocabulary chapters loaded: ${_chaptersData!.totalChapters} total, ${_chaptersData!.unlockedChapters} unlocked');
          }
          
          return true;
        } else {
          _setError(chaptersResponse.message);
          return false;
        }
      } else {
        _setError(response.message);
        return false;
      }
    } catch (e) {
      if (kDebugMode) {
        debugPrint('❌ Error loading vocabulary chapters: $e');
      }
      
      // Handle offline scenario
      _isOnline = false;
      
      if (_chaptersData != null) {
        // Use cached data
        _setState(VocabularyChaptersState.loaded);
        _setError('Using offline data. Check your connection.');
      } else {
        _setError('Unable to load chapters. Please check your connection.');
      }
      
      return false;
    }
  }

  /// Complete a vocabulary chapter
  Future<bool> completeChapter(
    String chapterId, {
    int? finalScore,
    String? completionNotes,
    Map<String, dynamic>? extraData,
  }) async {
    if (!_authProvider.isAuthenticated) {
      _setError('User not authenticated');
      return false;
    }

    final chapter = chapters.firstWhere(
      (c) => c.id == chapterId,
      orElse: () => throw ArgumentError('Chapter not found'),
    );

    if (!chapter.isUnlocked) {
      _setError('Chapter is not unlocked');
      return false;
    }

    if (chapter.isCompleted) {
      _setError('Chapter already completed');
      return false;
    }

    _setState(VocabularyChaptersState.completing);

    try {
      final response = await _apiService.completeVocabularyChapter(
        chapterId,
        _authProvider.token!,
        finalScore: finalScore,
        completionNotes: completionNotes,
        extraData: extraData,
      );
      
      if (response.success && response.data != null) {
        final completeResponse = CompleteChapterResponse.fromJson(response.data);
        
        if (completeResponse.success) {
          // Refresh chapters data to get updated state
          await loadChapters(showLoading: false);
          _setState(VocabularyChaptersState.completed);
          
          if (kDebugMode) {
            debugPrint('✅ Chapter completed successfully: ${chapter.title}');
            if (completeResponse.data.nextChapterUnlocked) {
              debugPrint('🔓 Next chapter unlocked!');
            }
          }
          
          return true;
        } else {
          _setError(completeResponse.message);
          return false;
        }
      } else {
        _setError(response.message);
        return false;
      }
    } catch (e) {
      if (kDebugMode) {
        debugPrint('❌ Error completing chapter: $e');
      }
      
      // Queue for offline processing
      if (!_isOnline) {
        await _queueAction('complete_chapter', {
          'chapterId': chapterId,
          'finalScore': finalScore,
          'completionNotes': completionNotes,
          'extraData': extraData,
        });
        _setError('Action queued. Will complete when online.');
      } else {
        _setError('Failed to complete chapter. Please try again.');
      }
      
      return false;
    }
  }

  /// Get a specific chapter by ID
  VocabularyChapter? getChapterById(String chapterId) {
    return chapters.firstWhere(
      (c) => c.id == chapterId,
      orElse: () => throw ArgumentError('Chapter not found'),
    );
  }

  /// Get next available chapter
  VocabularyChapter? getNextChapter() {
    final unlockedAndIncomplete = chapters
        .where((c) => c.isUnlocked && !c.isCompleted)
        .toList();
    
    if (unlockedAndIncomplete.isEmpty) return null;
    
    // Sort by order and return first
    unlockedAndIncomplete.sort((a, b) => a.order.compareTo(b.order));
    return unlockedAndIncomplete.first;
  }

  /// Cache data locally
  Future<void> _cacheData() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final data = {
        'chaptersData': _chaptersData?.toJson(),
        'timestamp': DateTime.now().toIso8601String(),
      };
      await prefs.setString(_chaptersKey, jsonEncode(data));
    } catch (e) {
      if (kDebugMode) {
        debugPrint('Failed to cache vocabulary chapters data: $e');
      }
    }
  }

  /// Load cached data
  Future<void> _loadCachedData() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final cachedData = prefs.getString(_chaptersKey);
      
      if (cachedData != null) {
        final data = jsonDecode(cachedData);
        final timestamp = DateTime.parse(data['timestamp']);
        
        // Use cached data if it's less than 1 hour old
        if (DateTime.now().difference(timestamp) < const Duration(hours: 1)) {
          _chaptersData = VocabularyChaptersData.fromJson(data['chaptersData']);
          _setState(VocabularyChaptersState.loaded);
          
          if (kDebugMode) {
            debugPrint('📚 Loaded cached vocabulary chapters data');
          }
        }
      }
    } catch (e) {
      if (kDebugMode) {
        debugPrint('Failed to load cached vocabulary chapters data: $e');
      }
    }
  }

  /// Queue action for offline processing
  Future<void> _queueAction(String action, Map<String, dynamic> data) async {
    _pendingActions.add({
      'action': action,
      'data': data,
      'timestamp': DateTime.now().toIso8601String(),
    });
    
    // Save to preferences
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_pendingActionsKey, jsonEncode(_pendingActions));
    } catch (e) {
      if (kDebugMode) {
        debugPrint('Failed to save pending actions: $e');
      }
    }
  }

  /// Process pending actions when back online
  Future<void> processPendingActions() async {
    if (!_isOnline || _pendingActions.isEmpty) return;
    
    final actionsToProcess = List.from(_pendingActions);
    _pendingActions.clear();
    
    for (final action in actionsToProcess) {
      try {
        switch (action['action']) {
          case 'complete_chapter':
            await completeChapter(
              action['data']['chapterId'],
              finalScore: action['data']['finalScore'],
              completionNotes: action['data']['completionNotes'],
              extraData: action['data']['extraData'],
            );
            break;
        }
      } catch (e) {
        // Re-queue failed actions
        _pendingActions.add(action);
      }
    }
    
    // Update saved pending actions
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_pendingActionsKey, jsonEncode(_pendingActions));
    } catch (e) {
      if (kDebugMode) {
        debugPrint('Failed to update pending actions: $e');
      }
    }
  }

  void _setState(VocabularyChaptersState newState) {
    _state = newState;
    notifyListeners();
  }

  void _setError(String message) {
    _errorMessage = message;
    _setState(VocabularyChaptersState.error);
  }

  /// Clear error state
  void clearError() {
    _errorMessage = null;
    if (_state == VocabularyChaptersState.error) {
      _setState(_chaptersData != null 
        ? VocabularyChaptersState.loaded 
        : VocabularyChaptersState.initial);
    }
  }

  @override
  void dispose() {
    _authProvider.removeListener(_onAuthChanged);
    _stopPeriodicRefresh();
    _retryTimer?.cancel();
    super.dispose();
  }
}