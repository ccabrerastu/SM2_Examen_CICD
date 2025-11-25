import 'package:flutter/material.dart';
import 'progress_provider.dart';

class ReadingParagraph {
  final String content;
  final int paragraphNumber;
  
  ReadingParagraph({
    required this.content,
    required this.paragraphNumber,
  });
}

class ReadingChapter {
  final String title;
  final List<ReadingParagraph> paragraphs;
  final List<String> quizQuestions;
  
  ReadingChapter({
    required this.title,
    required this.paragraphs,
    required this.quizQuestions,
  });
}

class ReadingProvider with ChangeNotifier {
  final ProgressProvider? _progressProvider;
  final String _chapterId;
  
  late ReadingChapter _chapter;
  int _currentParagraphIndex = 0;
  bool _isReadingComplete = false;
  bool _isQuizComplete = false;
  int _quizScore = 0;
  
  ReadingProvider({
    ProgressProvider? progressProvider,
    String chapterId = 'reading-chapter-1',
  }) : _progressProvider = progressProvider,
       _chapterId = chapterId {
    _initializeChapter();
  }
  
  void _initializeChapter() {
    _chapter = ReadingChapter(
      title: 'The Adventure Begins',
      paragraphs: [
        ReadingParagraph(
          content: 'Once upon a time, in a small village nestled between rolling hills and crystal-clear streams, there lived a young girl named Emma. She had always been curious about the world beyond her village.',
          paragraphNumber: 1,
        ),
        ReadingParagraph(
          content: 'Emma spent her days exploring the nearby woods, collecting interesting stones, and reading every book she could find in the village library. Her favorite books were about faraway places and exciting adventures.',
          paragraphNumber: 2,
        ),
        ReadingParagraph(
          content: 'One morning, Emma discovered an old map hidden in the library. The map showed a mysterious island that wasn\'t marked on any modern charts. This discovery would change her life forever.',
          paragraphNumber: 3,
        ),
        ReadingParagraph(
          content: 'Emma decided to embark on a journey to find this mysterious island. She prepared carefully, gathering supplies and studying navigation techniques. Her adventure was about to begin.',
          paragraphNumber: 4,
        ),
        ReadingParagraph(
          content: 'With determination in her heart and the old map in her backpack, Emma set off on her greatest adventure. She knew that this journey would test her courage and resolve.',
          paragraphNumber: 5,
        ),
      ],
      quizQuestions: [
        'What was Emma\'s favorite hobby?',
        'Where did Emma find the old map?',
        'What did the map show?',
      ],
    );
  }
  
  // Getters
  ReadingChapter get chapter => _chapter;
  ReadingParagraph get currentParagraph => _chapter.paragraphs[_currentParagraphIndex];
  int get currentParagraphIndex => _currentParagraphIndex;
  bool get isReadingComplete => _isReadingComplete;
  bool get isQuizComplete => _isQuizComplete;
  int get quizScore => _quizScore;
  bool get isLastParagraph => _currentParagraphIndex >= _chapter.paragraphs.length - 1;
  double get readingProgress => _chapter.paragraphs.isEmpty ? 0.0 : (_currentParagraphIndex + 1) / _chapter.paragraphs.length;
  
  // Actions
  void nextParagraph() {
    if (_currentParagraphIndex < _chapter.paragraphs.length - 1) {
      _currentParagraphIndex++;
      
      // Auto-save reading progress
      _progressProvider?.onReadingProgress(
        _chapterId,
        _currentParagraphIndex,
        _isQuizComplete,
      );
      
      notifyListeners();
    } else if (!_isReadingComplete) {
      // Mark reading as complete when reaching the last paragraph
      _isReadingComplete = true;
      
      // Auto-save reading completion
      _progressProvider?.onReadingProgress(
        _chapterId,
        _currentParagraphIndex,
        _isQuizComplete,
      );
      
      notifyListeners();
    }
  }
  
  void previousParagraph() {
    if (_currentParagraphIndex > 0) {
      _currentParagraphIndex--;
      
      // Auto-save reading progress
      _progressProvider?.onReadingProgress(
        _chapterId,
        _currentParagraphIndex,
        _isQuizComplete,
      );
      
      notifyListeners();
    }
  }
  
  void goToParagraph(int index) {
    if (index >= 0 && index < _chapter.paragraphs.length) {
      _currentParagraphIndex = index;
      
      // Auto-save reading progress
      _progressProvider?.onReadingProgress(
        _chapterId,
        _currentParagraphIndex,
        _isQuizComplete,
      );
      
      notifyListeners();
    }
  }
  
  void completeQuiz(int score) {
    _isQuizComplete = true;
    _quizScore = score;
    
    // Auto-save quiz completion
    _progressProvider?.onReadingProgress(
      _chapterId,
      _currentParagraphIndex,
      _isQuizComplete,
    );
    
    // If both reading and quiz are complete, mark chapter as complete
    if (_isReadingComplete && _isQuizComplete) {
      final finalScore = (_quizScore * 0.7) + (50 * 0.3); // 70% quiz, 30% reading completion
      _progressProvider?.onChapterCompleted(_chapterId, finalScore);
    }
    
    notifyListeners();
  }
  
  void resetProgress() {
    _currentParagraphIndex = 0;
    _isReadingComplete = false;
    _isQuizComplete = false;
    _quizScore = 0;
    notifyListeners();
  }
  
  // Get completion percentage
  double get completionPercentage {
    double readingPercent = readingProgress * 50; // Reading is 50% of total
    double quizPercent = _isQuizComplete ? 50 : 0; // Quiz is 50% of total
    return readingPercent + quizPercent;
  }
  
  // Check if chapter is fully complete
  bool get isChapterComplete => _isReadingComplete && _isQuizComplete;
  
  // Get reading statistics
  Map<String, dynamic> get readingStats => {
    'totalParagraphs': _chapter.paragraphs.length,
    'paragraphsRead': _currentParagraphIndex + 1,
    'readingComplete': _isReadingComplete,
    'quizComplete': _isQuizComplete,
    'quizScore': _quizScore,
    'overallProgress': completionPercentage,
  };
}