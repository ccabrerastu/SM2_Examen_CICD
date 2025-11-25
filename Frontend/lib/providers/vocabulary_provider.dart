import 'package:flutter/material.dart';
import '../models/vocabulary_word.dart';
import '../services/vocabulary_practice_service.dart';
import 'progress_provider.dart';

class VocabularyProvider with ChangeNotifier {
  final List<VocabularyWord> _words = VocabularyWord.getSampleWords();
  final ProgressProvider? _progressProvider;
  final VocabularyPracticeService _vocabularyService = VocabularyPracticeService();
  final String _chapterId;
  
  int _currentWordIndex = 0;
  int _wordsLearned = 0;
  bool _isStudyMode = true;
  VocabularyPracticeSession? _currentSession;
  bool _isLoading = false;
  
  VocabularyProvider({
    ProgressProvider? progressProvider,
    String chapterId = 'vocab-chapter-1',
  }) : _progressProvider = progressProvider,
       _chapterId = chapterId;
  
  // Getters
  List<VocabularyWord> get words => _words;
  VocabularyWord get currentWord => _words[_currentWordIndex];
  int get currentWordIndex => _currentWordIndex;
  int get wordsLearned => _wordsLearned;
  bool get hasNextWord => _currentWordIndex < _words.length - 1;
  bool get hasPreviousWord => _currentWordIndex > 0;
  bool get isStudyMode => _isStudyMode;
  VocabularyPracticeSession? get currentSession => _currentSession;
  bool get isLoading => _isLoading;
  bool get isLastWord => _currentWordIndex >= _words.length - 1;
  double get progress => _words.isEmpty ? 0.0 : (_currentWordIndex + 1) / _words.length;
  
  // Actions
  void nextWord() {
    if (_currentWordIndex < _words.length - 1) {
      _currentWordIndex++;
      
      // Auto-save progress when moving to next word
      _progressProvider?.onVocabularyPracticed(
        _chapterId,
        currentWord.word,
        _wordsLearned,
      );
      
      notifyListeners();
    }
  }
  
  void previousWord() {
    if (_currentWordIndex > 0) {
      _currentWordIndex--;
      notifyListeners();
    }
  }
  
  void markWordAsLearned() {
    if (_wordsLearned < _words.length) {
      _wordsLearned++;
      
      // Auto-save progress when marking word as learned
      _progressProvider?.onVocabularyPracticed(
        _chapterId,
        currentWord.word,
        _wordsLearned,
      );
      
      notifyListeners();
      
      // If all words are learned, complete the chapter
      if (_wordsLearned >= _words.length) {
        _progressProvider?.onChapterCompleted(_chapterId, 100.0);
      }
    }
  }
  
  void toggleStudyMode() {
    _isStudyMode = !_isStudyMode;
    notifyListeners();
  }
  
  void goToWord(int index) {
    if (index >= 0 && index < _words.length) {
      _currentWordIndex = index;
      
      // Auto-save progress when jumping to specific word
      _progressProvider?.onVocabularyPracticed(
        _chapterId,
        currentWord.word,
        _wordsLearned,
      );
      
      notifyListeners();
    }
  }
  
  void resetProgress() {
    _currentWordIndex = 0;
    _wordsLearned = 0;
    _isStudyMode = true;
    notifyListeners();
  }
  
  // Get words that haven't been learned yet
  List<VocabularyWord> get unlearnedWords {
    if (_wordsLearned >= _words.length) return [];
    return _words.skip(_wordsLearned).toList();
  }
  
  // Get percentage of completion
  double get completionPercentage {
    if (_words.isEmpty) return 0.0;
    return (_wordsLearned / _words.length) * 100;
  }
  
  // Create a new vocabulary practice session
  Future<void> createVocabularySession({
    required String userId,
    required String token,
    String? episodeId,
  }) async {
    _isLoading = true;
    notifyListeners();
    
    try {
      _currentSession = await _vocabularyService.createVocabularySession(
        token: token,
        userId: userId,
        chapterId: _chapterId,
        episodeId: episodeId,
      );
      
      if (_currentSession != null) {
        // Update local state based on session data
        _wordsLearned = _currentSession!.studiedWords.length;
      }
    } catch (e) {
      debugPrint('Error creating vocabulary session: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
  
  // Study a word and update session
  Future<void> studyWord({
    required String token,
    required String word,
    required String meaning,
    bool isCorrect = true,
  }) async {
    if (_currentSession == null) return;
    
    try {
      _currentSession = await _vocabularyService.studyWord(
        sessionId: _currentSession!.id,
        token: token,
        word: word,
        meaning: meaning,
        isCorrect: isCorrect,
      );
      
      if (_currentSession != null) {
        _wordsLearned = _currentSession!.studiedWords.length;
        
        // Auto-save progress
        _progressProvider?.onVocabularyPracticed(
          _chapterId,
          word,
          _wordsLearned,
        );
      }
      
      notifyListeners();
    } catch (e) {
      debugPrint('Error studying word: $e');
    }
  }
  
  // Get user vocabulary statistics
  Future<VocabularyStats?> getUserStats({
    required String userId,
    required String token,
    String? timeframe,
  }) async {
    try {
      return await _vocabularyService.getUserVocabularyStats(
        userId: userId,
        token: token,
        timeframe: timeframe,
      );
    } catch (e) {
      debugPrint('Error getting vocabulary stats: $e');
      return null;
    }
  }
}