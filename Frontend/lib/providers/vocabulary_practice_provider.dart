import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import '../models/vocabulary_item.dart';
import '../models/vocabulary_chapter.dart';
import '../utils/environment_config.dart';
import 'auth_provider.dart';

enum VocabularyPracticeState {
  initial,
  loading,
  loaded,
  practicing,
  error,
  completed,
}

class VocabularyPracticeProvider with ChangeNotifier {
  final AuthProvider _authProvider;

  VocabularyPracticeState _state = VocabularyPracticeState.initial;
  List<VocabularyItem> _items = [];
  List<VocabularyItem> _shuffledItems = [];
  int _currentIndex = 0;
  final Set<String> _learnedItemIds = {};
  String? _errorMessage;
  VocabularyChapter? _currentChapter;
  bool _showTranslation = false;
  int _correctAnswers = 0;
  int _incorrectAnswers = 0;

  VocabularyPracticeProvider(this._authProvider);

  // Getters
  VocabularyPracticeState get state => _state;
  List<VocabularyItem> get items => _items;
  int get currentIndex => _currentIndex;
  VocabularyItem? get currentItem =>
      _shuffledItems.isNotEmpty && _currentIndex < _shuffledItems.length
          ? _shuffledItems[_currentIndex]
          : null;
  int get totalItems => _shuffledItems.length;
  int get learnedCount => _learnedItemIds.length;
  double get progress => totalItems > 0 ? learnedCount / totalItems : 0.0;
  String? get errorMessage => _errorMessage;
  VocabularyChapter? get currentChapter => _currentChapter;
  bool get showTranslation => _showTranslation;
  bool get isCompleted => _learnedItemIds.length == _shuffledItems.length && _shuffledItems.isNotEmpty;
  int get correctAnswers => _correctAnswers;
  int get incorrectAnswers => _incorrectAnswers;
  int get remainingItems => totalItems - _currentIndex;

  Future<void> loadVocabularyItems(VocabularyChapter chapter) async {
    _state = VocabularyPracticeState.loading;
    _currentChapter = chapter;
    _errorMessage = null;
    notifyListeners();

    try {
      if (!_authProvider.isAuthenticated || _authProvider.token == null) {
        throw Exception('User not authenticated');
      }

      final response = await http.get(
        Uri.parse('${EnvironmentConfig.apiBaseUrl}/vocab/chapters/${chapter.id}/vocabulary'),
        headers: {
          'Authorization': 'Bearer ${_authProvider.token}',
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'Origin': EnvironmentConfig.apiBaseUrl,
        },
      );

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        final vocabResponse = VocabularyItemsResponse.fromJson(data);

        _items = vocabResponse.items;
        _shuffledItems = List.from(_items)..shuffle();
        _currentIndex = 0;
        _learnedItemIds.clear();
        _showTranslation = false;
        _correctAnswers = 0;
        _incorrectAnswers = 0;

        _state = VocabularyPracticeState.loaded;
      } else if (response.statusCode == 401) {
        throw Exception('Unauthorized. Please login again.');
      } else {
        throw Exception('Failed to load vocabulary items');
      }
    } catch (e) {
      _state = VocabularyPracticeState.error;
      _errorMessage = e.toString();
    }

    notifyListeners();
  }

  void toggleTranslation() {
    _showTranslation = !_showTranslation;
    notifyListeners();
  }

  void markAsLearned() {
    if (currentItem != null) {
      _learnedItemIds.add(currentItem!.id);
      _correctAnswers++;
      notifyListeners();
    }
  }

  void markAsNotLearned() {
    if (currentItem != null) {
      _incorrectAnswers++;
      notifyListeners();
    }
  }

  void nextItem() {
    if (_currentIndex < _shuffledItems.length - 1) {
      _currentIndex++;
      _showTranslation = false;
      _state = VocabularyPracticeState.practicing;
    } else {
      _state = VocabularyPracticeState.completed;
    }
    notifyListeners();
  }

  void previousItem() {
    if (_currentIndex > 0) {
      _currentIndex--;
      _showTranslation = false;
      notifyListeners();
    }
  }

  void restart() {
    _shuffledItems = List.from(_items)..shuffle();
    _currentIndex = 0;
    _learnedItemIds.clear();
    _showTranslation = false;
    _correctAnswers = 0;
    _incorrectAnswers = 0;
    _state = VocabularyPracticeState.loaded;
    notifyListeners();
  }

  void reset() {
    _state = VocabularyPracticeState.initial;
    _items = [];
    _shuffledItems = [];
    _currentIndex = 0;
    _learnedItemIds.clear();
    _errorMessage = null;
    _currentChapter = null;
    _showTranslation = false;
    _correctAnswers = 0;
    _incorrectAnswers = 0;
    notifyListeners();
  }

  // Answer checking for quiz mode
  bool checkAnswer(String userAnswer) {
    if (currentItem == null) return false;

    final correctAnswer = currentItem!.spanishTranslation.toLowerCase().trim();
    final userAnswerLower = userAnswer.toLowerCase().trim();

    return correctAnswer == userAnswerLower;
  }

  void submitAnswer(String answer) {
    if (checkAnswer(answer)) {
      markAsLearned();
    } else {
      markAsNotLearned();
    }
  }
}
