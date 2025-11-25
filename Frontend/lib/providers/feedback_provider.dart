import 'package:flutter/material.dart';

enum FeedbackType { success, error, achievement, streak, perfect }

enum FeedbackState { idle, showing, hiding }

class FeedbackData {
  final FeedbackType type;
  final String message;
  final String? subtitle;
  final IconData? icon;
  final Color? color;
  final Duration duration;
  final bool showParticles;
  final Map<String, dynamic>? metadata;

  const FeedbackData({
    required this.type,
    required this.message,
    this.subtitle,
    this.icon,
    this.color,
    this.duration = const Duration(seconds: 2),
    this.showParticles = false,
    this.metadata,
  });
}

class FeedbackProvider with ChangeNotifier {
  FeedbackState _state = FeedbackState.idle;
  FeedbackData? _currentFeedback;
  int _streakCount = 0;
  int _correctAnswers = 0;
  int _totalQuestions = 0;
  bool _isSessionActive = false;

  // Getters
  FeedbackState get state => _state;
  FeedbackData? get currentFeedback => _currentFeedback;
  int get streakCount => _streakCount;
  int get correctAnswers => _correctAnswers;
  int get totalQuestions => _totalQuestions;
  bool get isSessionActive => _isSessionActive;
  double get accuracy =>
      _totalQuestions > 0 ? _correctAnswers / _totalQuestions : 0.0;

  // Session management
  void startSession() {
    _isSessionActive = true;
    _streakCount = 0;
    _correctAnswers = 0;
    _totalQuestions = 0;
    notifyListeners();
  }

  void endSession() {
    _isSessionActive = false;
    _state = FeedbackState.idle;
    _currentFeedback = null;
    notifyListeners();
  }

  // Feedback methods
  void showCorrectAnswer({
    String? customMessage,
    bool isStreak = false,
    Map<String, dynamic>? metadata,
  }) {
    _correctAnswers++;
    _totalQuestions++;
    _streakCount++;

    String message = customMessage ?? _getCorrectMessage();
    bool showParticles = _streakCount >= 3 || isStreak;

    _showFeedback(
      FeedbackData(
        type: isStreak ? FeedbackType.streak : FeedbackType.success,
        message: message,
        subtitle: _streakCount > 1 ? 'Racha: $_streakCount' : null,
        icon: isStreak ? Icons.local_fire_department : Icons.check_circle,
        color: isStreak ? Colors.orange : Colors.green,
        showParticles: showParticles,
        metadata: metadata,
      ),
    );
  }

  void showIncorrectAnswer({
    String? customMessage,
    String? correctAnswer,
    Map<String, dynamic>? metadata,
  }) {
    _totalQuestions++;
    _streakCount = 0;

    String message = customMessage ?? _getIncorrectMessage();
    String? subtitle = correctAnswer != null
        ? 'Correcto: $correctAnswer'
        : null;

    _showFeedback(
      FeedbackData(
        type: FeedbackType.error,
        message: message,
        subtitle: subtitle,
        icon: Icons.cancel,
        color: Colors.red,
        duration: const Duration(seconds: 3),
        metadata: metadata,
      ),
    );
  }

  void showAchievement({
    required String message,
    String? subtitle,
    IconData? icon,
    Map<String, dynamic>? metadata,
  }) {
    _showFeedback(
      FeedbackData(
        type: FeedbackType.achievement,
        message: message,
        subtitle: subtitle,
        icon: icon ?? Icons.emoji_events,
        color: Colors.amber,
        duration: const Duration(seconds: 4),
        showParticles: true,
        metadata: metadata,
      ),
    );
  }

  void showPerfectScore() {
    _showFeedback(
      FeedbackData(
        type: FeedbackType.perfect,
        message: '¡Puntuación Perfecta!',
        subtitle: '100% de aciertos',
        icon: Icons.star,
        color: Colors.purple,
        duration: const Duration(seconds: 4),
        showParticles: true,
      ),
    );
  }

  void _showFeedback(FeedbackData feedback) {
    _currentFeedback = feedback;
    _state = FeedbackState.showing;
    notifyListeners();

    // Auto hide after duration
    Future.delayed(feedback.duration, () {
      if (_currentFeedback == feedback) {
        hideFeedback();
      }
    });
  }

  void hideFeedback() {
    if (_state == FeedbackState.showing) {
      _state = FeedbackState.hiding;
      notifyListeners();

      // Clear feedback after hide animation
      Future.delayed(const Duration(milliseconds: 300), () {
        _currentFeedback = null;
        _state = FeedbackState.idle;
        notifyListeners();
      });
    }
  }

  // Motivational messages
  String _getCorrectMessage() {
    final messages = [
      '¡Correcto!',
      '¡Excelente!',
      '¡Muy bien!',
      '¡Perfecto!',
      '¡Genial!',
      '¡Fantástico!',
    ];

    if (_streakCount >= 5) {
      return '¡Increíble racha!';
    } else if (_streakCount >= 3) {
      return '¡Vas muy bien!';
    }

    return messages[_correctAnswers % messages.length];
  }

  String _getIncorrectMessage() {
    final messages = [
      'Incorrecto',
      'No es correcto',
      'Inténtalo de nuevo',
      'Casi lo tienes',
      'Sigue intentando',
    ];

    return messages[_totalQuestions % messages.length];
  }

  // Reset methods
  void resetStreak() {
    _streakCount = 0;
    notifyListeners();
  }

  void resetSession() {
    _streakCount = 0;
    _correctAnswers = 0;
    _totalQuestions = 0;
    _currentFeedback = null;
    _state = FeedbackState.idle;
    notifyListeners();
  }
}
