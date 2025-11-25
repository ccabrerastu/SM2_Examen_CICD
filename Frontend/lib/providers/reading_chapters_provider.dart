import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import '../models/reading_chapter.dart';
import '../utils/environment_config.dart';
import 'auth_provider.dart';

enum ReadingChaptersState {
  initial,
  loading,
  loaded,
  error,
}

class ReadingChaptersProvider with ChangeNotifier {
  final AuthProvider _authProvider;

  ReadingChaptersState _state = ReadingChaptersState.initial;
  List<ReadingChapter> _chapters = [];
  String? _errorMessage;
  int _totalChapters = 0;
  int _unlockedChapters = 0;
  int _completedChapters = 0;
  double _overallProgress = 0.0;

  ReadingChaptersProvider(this._authProvider);

  // Getters
  ReadingChaptersState get state => _state;
  List<ReadingChapter> get chapters => _chapters;
  String? get errorMessage => _errorMessage;
  int get totalChapters => _totalChapters;
  int get unlockedChapters => _unlockedChapters;
  int get completedChapters => _completedChapters;
  double get overallProgress => _overallProgress;

  bool get isLoading => _state == ReadingChaptersState.loading;
  bool get hasError => _state == ReadingChaptersState.error;
  bool get isLoaded => _state == ReadingChaptersState.loaded;

  /// Fetch reading chapters from backend
  Future<void> fetchChapters() async {
    debugPrint('📖 ReadingChaptersProvider: Starting fetchChapters');

    if (!_authProvider.isAuthenticated || _authProvider.token == null) {
      debugPrint('📖 ReadingChaptersProvider: User not authenticated');
      _state = ReadingChaptersState.error;
      _errorMessage = 'User not authenticated';
      notifyListeners();
      return;
    }

    _state = ReadingChaptersState.loading;
    _errorMessage = null;
    notifyListeners();

    try {
      final url = '${EnvironmentConfig.fullApiUrl}/reading/chapters';
      debugPrint('📖 ReadingChaptersProvider: Fetching from $url');

      final response = await http.get(
        Uri.parse(url),
        headers: {
          'Authorization': 'Bearer ${_authProvider.token}',
          'Origin': EnvironmentConfig.apiBaseUrl,
          'X-Requested-With': 'XMLHttpRequest',
        },
      );

      debugPrint('📖 ReadingChaptersProvider: Response status ${response.statusCode}');

      if (response.statusCode == 200) {
        final jsonData = json.decode(response.body);
        final chaptersResponse = ReadingChaptersResponse.fromJson(jsonData);

        _chapters = chaptersResponse.chapters;
        _totalChapters = chaptersResponse.totalChapters;
        _unlockedChapters = chaptersResponse.unlockedChapters;
        _completedChapters = chaptersResponse.completedChapters;
        _overallProgress = chaptersResponse.overallProgress;

        debugPrint('📖 ReadingChaptersProvider: Loaded ${_chapters.length} chapters');

        _state = ReadingChaptersState.loaded;
        _errorMessage = null;
      } else if (response.statusCode == 401) {
        _state = ReadingChaptersState.error;
        _errorMessage = 'Session expired. Please login again.';
      } else {
        debugPrint('📖 ReadingChaptersProvider: Error ${response.statusCode}');
        _state = ReadingChaptersState.error;
        _errorMessage = 'Failed to load chapters: ${response.statusCode}';
      }
    } catch (e) {
      debugPrint('📖 ReadingChaptersProvider: Exception $e');
      _state = ReadingChaptersState.error;
      _errorMessage = 'Network error: $e';
    }

    notifyListeners();
  }

  /// Refresh chapters (pull-to-refresh)
  Future<void> refreshChapters() async {
    await fetchChapters();
  }

  /// Get a specific chapter by ID
  ReadingChapter? getChapterById(String chapterId) {
    try {
      return _chapters.firstWhere((chapter) => chapter.id == chapterId);
    } catch (e) {
      return null;
    }
  }

  /// Get next unlocked chapter
  ReadingChapter? getNextUnlockedChapter() {
    try {
      return _chapters.firstWhere(
        (chapter) => chapter.isUnlocked && !chapter.isCompleted,
      );
    } catch (e) {
      return null;
    }
  }

  /// Mark chapter as completed (called after quiz success)
  Future<bool> completeChapter(String chapterId, int score) async {
    if (!_authProvider.isAuthenticated || _authProvider.token == null) {
      return false;
    }

    try {
      final response = await http.post(
        Uri.parse('${EnvironmentConfig.fullApiUrl}/reading/chapters/$chapterId/complete'),
        headers: {
          'Authorization': 'Bearer ${_authProvider.token}',
          'Origin': EnvironmentConfig.apiBaseUrl,
          'X-Requested-With': 'XMLHttpRequest',
          'Content-Type': 'application/json',
        },
        body: json.encode({
          'score': score,
        }),
      );

      if (response.statusCode == 200 || response.statusCode == 201) {
        // Refresh chapters to get updated unlock status
        await fetchChapters();
        return true;
      } else {
        _errorMessage = 'Failed to complete chapter: ${response.statusCode}';
        notifyListeners();
        return false;
      }
    } catch (e) {
      _errorMessage = 'Network error: $e';
      notifyListeners();
      return false;
    }
  }

  /// Reset state (useful for logout)
  void reset() {
    _state = ReadingChaptersState.initial;
    _chapters = [];
    _errorMessage = null;
    _totalChapters = 0;
    _unlockedChapters = 0;
    _completedChapters = 0;
    _overallProgress = 0.0;
    notifyListeners();
  }
}
