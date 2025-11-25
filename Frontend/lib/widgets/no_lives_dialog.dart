import 'package:flutter/material.dart';
import '../l10n/app_localizations.dart';

class NoLivesDialog extends StatelessWidget {
  final int hoursUntilReset;
  final VoidCallback? onDismiss;

  const NoLivesDialog({
    super.key,
    this.hoursUntilReset = 24,
    this.onDismiss,
  });

  static Future<void> show(
    BuildContext context, {
    int hoursUntilReset = 24,
    VoidCallback? onDismiss,
  }) {
    return showDialog<void>(
      context: context,
      barrierDismissible: false,
      builder: (context) => NoLivesDialog(
        hoursUntilReset: hoursUntilReset,
        onDismiss: onDismiss,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;

    return AlertDialog(
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
      title: Column(
        children: [
          Icon(
            Icons.favorite_border,
            size: 48,
            color: Theme.of(context).colorScheme.error,
          ),
          const SizedBox(height: 12),
          Text(
            l10n.outOfLives,
            style: TextStyle(
              color: Theme.of(context).colorScheme.error,
              fontWeight: FontWeight.bold,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            l10n.outOfLivesMessage,
            textAlign: TextAlign.center,
            style: TextStyle(
              color: Theme.of(context).colorScheme.onSurface,
            ),
          ),
          
          const SizedBox(height: 16),
          
          // Lives visualization
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: List.generate(5, (index) => 
              Padding(
                padding: EdgeInsets.only(right: index < 4 ? 4 : 0),
                child: Icon(
                  Icons.favorite_border,
                  color: Theme.of(context).colorScheme.error.withValues(alpha: 0.5),
                  size: 24,
                ),
              ),
            ),
          ),
          
          const SizedBox(height: 16),
          
          // Reset time info
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Theme.of(context).colorScheme.surfaceContainerHighest.withValues(alpha: 0.5),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Column(
              children: [
                Icon(
                  Icons.schedule,
                  color: Theme.of(context).colorScheme.onSurfaceVariant,
                  size: 20,
                ),
                const SizedBox(height: 4),
                Text(
                  l10n.livesReset,
                  style: TextStyle(
                    color: Theme.of(context).colorScheme.onSurfaceVariant,
                    fontWeight: FontWeight.w500,
                    fontSize: 12,
                  ),
                ),
                Text(
                  l10n.nextResetIn(hoursUntilReset),
                  style: TextStyle(
                    color: Theme.of(context).colorScheme.onSurfaceVariant,
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
          ),
          
          const SizedBox(height: 16),
          
          // Encouraging message
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: Theme.of(context).colorScheme.primaryContainer,
              borderRadius: BorderRadius.circular(8),
            ),
            child: Row(
              children: [
                Icon(
                  Icons.lightbulb_outline,
                  color: Theme.of(context).colorScheme.onPrimaryContainer,
                  size: 20,
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    l10n.reviewTime,
                    style: TextStyle(
                      color: Theme.of(context).colorScheme.onPrimaryContainer,
                      fontSize: 12,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
      actions: [
        TextButton(
          onPressed: () {
            Navigator.of(context).pop();
            onDismiss?.call();
          },
          child: Text(l10n.iUnderstand),
        ),
      ],
    );
  }
}

/// Extension method to easily show the no lives dialog from any provider or widget
extension NoLivesDialogExtension on BuildContext {
  Future<void> showNoLivesDialog({
    int hoursUntilReset = 24,
    VoidCallback? onDismiss,
  }) {
    return NoLivesDialog.show(
      this,
      hoursUntilReset: hoursUntilReset,
      onDismiss: onDismiss,
    );
  }
}