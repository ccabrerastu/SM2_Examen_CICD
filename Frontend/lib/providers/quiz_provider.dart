import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/quiz_question.dart';
import '../services/quiz_practice_service.dart';

import 'progress_provider.dart';

class QuizProvider with ChangeNotifier {
  final List<QuizQuestion> _questions = QuizQuestion.getSampleQuestions();
  final ProgressProvider? _progressProvider;
  final QuizPracticeService _quizService = QuizPracticeService();
  final String _chapterId;
  
  int _currentQuestionIndex = 0;
  int? _selectedOption;
  int _score = 100;
  bool _hasAnswered = false;
  bool _showResult = false;
  QuizPracticeSession? _currentSession;
  bool _isLoading = false;
  
  QuizProvider({
    ProgressProvider? progressProvider,
    String chapterId = 'default-chapter',
  }) : _progressProvider = progressProvider,
       _chapterId = chapterId;

  List<QuizQuestion> get questions => _questions;
  QuizQuestion get currentQuestion => _questions[_currentQuestionIndex];
  int get currentQuestionIndex => _currentQuestionIndex;
  int? get selectedOption => _selectedOption;
  int get score => _score;
  bool get hasAnswered => _hasAnswered;
  bool get showResult => _showResult;
  bool get canSubmit => _selectedOption != null && !_hasAnswered;
  QuizPracticeSession? get currentSession => _currentSession;
  bool get isLoading => _isLoading;

  void selectOption(int optionIndex) {
    if (!_hasAnswered) {
      _selectedOption = optionIndex;
      notifyListeners();
    }
  }

  void submitAnswer() {
    if (_selectedOption != null && !_hasAnswered) {
      _hasAnswered = true;
      _showResult = true;
      
      // Check if answer is correct
      if (_selectedOption == currentQuestion.correctAnswer) {
        // Keep current score for correct answer
      } else {
        // Deduct points for wrong answer (optional)
        _score = (_score - 20).clamp(0, 100);
      }
      
      // Auto-save progress after answering
      _progressProvider?.onQuizAnswered(_chapterId, _score.toDouble(), _currentQuestionIndex);
      
      notifyListeners();
    }
  }

  void nextQuestion() {
    if (_currentQuestionIndex < _questions.length - 1) {
      _currentQuestionIndex++;
      _resetQuestionState();
      
      // Auto-save progress when moving to next question
      _progressProvider?.onQuizAnswered(_chapterId, _score.toDouble(), _currentQuestionIndex);
    } else {
      // Quiz completed - save final progress with additional metadata
      Map<String, dynamic> quizData = {
        'quiz_completed': true,
        'final_score': _score,
        'questions_total': _questions.length,
        'completed_at': DateTime.now().toIso8601String(),
      };
      
      _progressProvider?.onChapterCompleted(_chapterId, _score.toDouble(), extraData: quizData);
      
      // Also persist score in local storage for offline access
      _persistQuizScore(_chapterId, _score, quizData);
    }
  }
  
  // Persist quiz score locally for offline access
  Future<void> _persistQuizScore(String chapterId, int score, Map<String, dynamic> quizData) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      
      // Store quiz scores by chapter
      final key = 'quiz_score_$chapterId';
      await prefs.setDouble(key, score.toDouble());
      
      // Store quiz completion data
      final completionKey = 'quiz_completion_$chapterId';
      await prefs.setString(completionKey, jsonEncode(quizData));
      
      // Store last completed quiz timestamp
      await prefs.setString('last_completed_quiz', DateTime.now().toIso8601String());
      
      debugPrint('✅ Quiz score persisted locally: $score for chapter $chapterId');
    } catch (e) {
      debugPrint('❌ Error persisting quiz score: $e');
    }
  }

  void resetQuiz() {
    _currentQuestionIndex = 0;
    _score = 100;
    _resetQuestionState();
  }

  void _resetQuestionState() {
    _selectedOption = null;
    _hasAnswered = false;
    _showResult = false;
    notifyListeners();
  }

  bool isCorrectAnswer(int optionIndex) {
    return optionIndex == currentQuestion.correctAnswer;
  }

  bool isWrongAnswer(int optionIndex) {
    return _hasAnswered && 
           _selectedOption == optionIndex && 
           optionIndex != currentQuestion.correctAnswer;
  }
  
  // Create a new quiz practice session
  Future<void> createQuizSession({
    required String userId,
    required String token,
    String? episodeId,
    String quizCategory = 'general',
    String difficultyLevel = 'beginner',
    int totalQuestions = 10,
  }) async {
    _isLoading = true;
    notifyListeners();
    
    try {
      _currentSession = await _quizService.createQuizSession(
        token: token,
        userId: userId,
        chapterId: _chapterId,
        episodeId: episodeId,
        quizCategory: quizCategory,
        difficultyLevel: difficultyLevel,
        totalQuestions: totalQuestions,
      );
      
      if (_currentSession != null) {
        // Update local state based on session data
        _currentQuestionIndex = 0;
        _score = _currentSession!.score.toInt();
      }
    } catch (e) {
      debugPrint('Error creating quiz session: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
  
  // Submit answer using the service
  Future<void> submitAnswerToService({
    required String token,
    required int timeSpentSeconds,
  }) async {
    if (_currentSession == null || _selectedOption == null) return;
    
    try {
      _currentSession = await _quizService.answerQuestion(
        sessionId: _currentSession!.id,
        token: token,
        questionNumber: _currentQuestionIndex + 1,
        userAnswer: _selectedOption!,
        timeSpentSeconds: timeSpentSeconds,
      );
      
      if (_currentSession != null) {
        _score = _currentSession!.score.toInt();
      }
      
      notifyListeners();
    } catch (e) {
      debugPrint('Error submitting answer: $e');
    }
  }
  
  // Complete quiz session
  Future<void> completeQuizSession({
    required String token,
    required int totalTimeSpent,
  }) async {
    if (_currentSession == null) return;
    
    try {
      _currentSession = await _quizService.completeQuiz(
        sessionId: _currentSession!.id,
        token: token,
        totalTimeSpent: totalTimeSpent,
      );
      
      if (_currentSession != null) {
        // Save final progress
        _progressProvider?.onChapterCompleted(_chapterId, _currentSession!.score);
      }
      
      notifyListeners();
    } catch (e) {
      debugPrint('Error completing quiz: $e');
    }
  }
  
  // Get user quiz statistics
  Future<QuizStats?> getUserStats({
    required String userId,
    required String token,
    String? timeframe,
    String? category,
    String? difficultyLevel,
  }) async {
    try {
      return await _quizService.getUserQuizStats(
        userId: userId,
        token: token,
        timeframe: timeframe,
        category: category,
        difficultyLevel: difficultyLevel,
      );
    } catch (e) {
      debugPrint('Error getting quiz stats: $e');
      return null;
    }
  }
}