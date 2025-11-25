import 'package:flutter/material.dart';

/// Helper class for showing motivational notifications
class MotivationalNotificationHelper {
  /// Shows a motivational notification using ScaffoldMessenger
  static void show(
    BuildContext context, {
    required String message,
    required IconData icon,
    required Color color,
    Duration duration = const Duration(seconds: 3),
  }) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        duration: duration,
        backgroundColor: color.withValues(alpha: 0.9),
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
        content: Row(
          children: [
            Icon(
              icon,
              color: Colors.white,
              size: 24,
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                message,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 16,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  /// Shows a success motivational message
  static void showSuccess(
    BuildContext context, {
    required String message,
    Duration duration = const Duration(seconds: 3),
  }) {
    show(
      context,
      message: message,
      icon: Icons.celebration,
      color: Colors.green,
      duration: duration,
    );
  }

  /// Shows an encouragement motivational message
  static void showEncouragement(
    BuildContext context, {
    required String message,
    Duration duration = const Duration(seconds: 3),
  }) {
    show(
      context,
      message: message,
      icon: Icons.trending_up,
      color: Colors.blue,
      duration: duration,
    );
  }

  /// Shows a streak motivational message
  static void showStreak(
    BuildContext context, {
    required String message,
    Duration duration = const Duration(seconds: 3),
  }) {
    show(
      context,
      message: message,
      icon: Icons.local_fire_department,
      color: Colors.orange,
      duration: duration,
    );
  }
}