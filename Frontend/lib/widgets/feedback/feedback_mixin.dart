import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/feedback_provider.dart';
import '../../providers/lives_provider.dart';

/// Mixin that provides convenient feedback methods for widgets
mixin FeedbackMixin<T extends StatefulWidget> on State<T> {
  
  /// Show success feedback
  void showSuccessFeedback({
    required String message,
    String? subtitle,
    bool isStreak = false,
    Map<String, dynamic>? metadata,
  }) {
    final feedbackProvider = Provider.of<FeedbackProvider>(context, listen: false);
    
    if (isStreak) {
      feedbackProvider.showCorrectAnswer(
        customMessage: message,
        isStreak: true,
        metadata: metadata,
      );
    } else {
      feedbackProvider.showCorrectAnswer(
        customMessage: message,
        metadata: metadata,
      );
    }
  }

  /// Show error feedback
  void showErrorFeedback({
    required String message,
    String? hint,
    String? correctAnswer,
    bool consumeLife = true,
    Map<String, dynamic>? metadata,
  }) {
    final feedbackProvider = Provider.of<FeedbackProvider>(context, listen: false);
    
    // Consume life if specified
    if (consumeLife) {
      final livesProvider = Provider.of<LivesProvider>(context, listen: false);
      livesProvider.consumeLife();
    }
    
    feedbackProvider.showIncorrectAnswer(
      customMessage: message,
      correctAnswer: hint ?? correctAnswer,
      metadata: metadata,
    );
  }

  /// Show achievement feedback
  void showAchievementFeedback({
    required String message,
    String? subtitle,
    IconData? icon,
    bool isPerfect = false,
    Map<String, dynamic>? metadata,
  }) {
    final feedbackProvider = Provider.of<FeedbackProvider>(context, listen: false);
    
    if (isPerfect) {
      feedbackProvider.showPerfectScore();
    } else {
      feedbackProvider.showAchievement(
        message: message,
        subtitle: subtitle,
        icon: icon,
        metadata: metadata,
      );
    }
  }

  /// Hide current feedback
  void hideFeedback() {
    final feedbackProvider = Provider.of<FeedbackProvider>(context, listen: false);
    feedbackProvider.hideFeedback();
  }

  /// Show streak feedback
  void showStreakFeedback({
    required String message,
    String? subtitle,
    int streakCount = 0,
    Map<String, dynamic>? metadata,
  }) {
    showSuccessFeedback(
      message: message,
      subtitle: subtitle ?? (streakCount > 0 ? 'Racha: $streakCount' : null),
      isStreak: true,
      metadata: metadata,
    );
  }

  /// Show pronunciation feedback
  void showPronunciationFeedback({
    required double accuracy,
    String? customMessage,
    Map<String, dynamic>? metadata,
  }) {
    String message = customMessage ?? _getPronunciationMessage(accuracy);
    
    if (accuracy >= 0.9) {
      showSuccessFeedback(
        message: message,
        subtitle: 'Pronunciación: ${(accuracy * 100).toStringAsFixed(1)}%',
        metadata: metadata,
      );
    } else if (accuracy >= 0.7) {
      showSuccessFeedback(
        message: message,
        subtitle: 'Pronunciación: ${(accuracy * 100).toStringAsFixed(1)}%',
        metadata: metadata,
      );
    } else {
      showErrorFeedback(
        message: message,
        hint: 'Intenta pronunciar más claramente',
        consumeLife: false,
        metadata: metadata,
      );
    }
  }

  String _getPronunciationMessage(double accuracy) {
    if (accuracy >= 0.95) return '¡Pronunciación perfecta!';
    if (accuracy >= 0.9) return '¡Excelente pronunciación!';
    if (accuracy >= 0.8) return '¡Buena pronunciación!';
    if (accuracy >= 0.7) return 'Pronunciación aceptable';
    if (accuracy >= 0.6) return 'Necesitas mejorar un poco';
    return 'Intenta pronunciar más claramente';
  }
}