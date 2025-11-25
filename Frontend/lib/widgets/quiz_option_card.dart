import 'package:flutter/material.dart';

class QuizOptionCard extends StatelessWidget {
  final String option;
  final bool isSelected;
  final bool isCorrect;
  final bool isWrong;
  final bool showResult;
  final VoidCallback onTap;

  const QuizOptionCard({
    super.key,
    required this.option,
    required this.isSelected,
    required this.isCorrect,
    required this.isWrong,
    required this.showResult,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    Color borderColor = Colors.transparent;
    Color backgroundColor = Theme.of(context).colorScheme.surface;
    
    if (showResult) {
      if (isCorrect) {
        borderColor = Colors.green;
        backgroundColor = Colors.green.withValues(alpha: 0.1);
      } else if (isWrong) {
        borderColor = Colors.red;
        backgroundColor = Colors.red.withValues(alpha: 0.1);
      }
    } else if (isSelected) {
      borderColor = Theme.of(context).colorScheme.primary;
    }

    return GestureDetector(
      onTap: showResult ? null : onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        margin: const EdgeInsets.all(6),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: backgroundColor,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: borderColor,
            width: borderColor == Colors.transparent ? 1 : 2,
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.05),
              blurRadius: 4,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Row(
          children: [
            Expanded(
              child: Text(
                option,
                textAlign: TextAlign.justify,
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: Theme.of(context).colorScheme.onSurface,
                  fontSize: 16,
                  height: 1.5,
                ),
              ),
            ),
            if (showResult && isCorrect)
              Icon(
                Icons.check_circle,
                color: Colors.green,
                size: 20,
              ),
            if (showResult && isWrong)
              Icon(
                Icons.cancel,
                color: Colors.red,
                size: 20,
              ),
          ],
        ),
      ),
    );
  }
}