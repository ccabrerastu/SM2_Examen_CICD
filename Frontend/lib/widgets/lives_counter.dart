import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/lives_provider.dart';
import '../l10n/app_localizations.dart';

class LivesCounter extends StatelessWidget {
  final bool showLabel;
  final MainAxisAlignment alignment;
  final double iconSize;

  const LivesCounter({
    super.key,
    this.showLabel = true,
    this.alignment = MainAxisAlignment.center,
    this.iconSize = 24,
  });

  @override
  Widget build(BuildContext context) {
    
    return Consumer<LivesProvider>(
      builder: (context, livesProvider, child) {
        final currentLives = livesProvider.currentLives;
        final isBlocked = livesProvider.isBlocked;
        
        return Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          decoration: BoxDecoration(
            color: _getBackgroundColor(context, isBlocked),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(
              color: _getBorderColor(context, isBlocked),
              width: 1,
            ),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            mainAxisAlignment: alignment,
            children: [
              // Lives icons
              ...List.generate(5, (index) {
                final isActive = index < currentLives;
                return Padding(
                  padding: EdgeInsets.only(right: index < 4 ? 4 : 0),
                  child: Icon(
                    isActive ? Icons.favorite : Icons.favorite_border,
                    color: _getHeartColor(context, isActive, isBlocked),
                    size: iconSize,
                  ),
                );
              }),
              
              if (showLabel) ...[
                const SizedBox(width: 8),
                Text(
                  '$currentLives/5',
                  style: TextStyle(
                    color: _getTextColor(context, isBlocked),
                    fontWeight: FontWeight.w600,
                    fontSize: 14,
                  ),
                ),
              ],
              
              // Loading indicator when consuming
              if (livesProvider.isConsuming) ...[
                const SizedBox(width: 8),
                SizedBox(
                  width: 12,
                  height: 12,
                  child: CircularProgressIndicator(
                    strokeWidth: 2,
                    valueColor: AlwaysStoppedAnimation<Color>(
                      _getTextColor(context, isBlocked),
                    ),
                  ),
                ),
              ],
            ],
          ),
        );
      },
    );
  }

  Color _getBackgroundColor(BuildContext context, bool isBlocked) {
    if (isBlocked) {
      return Theme.of(context).colorScheme.errorContainer;
    }
    
    return Theme.of(context).brightness == Brightness.dark
        ? Theme.of(context).colorScheme.surface
        : Theme.of(context).colorScheme.surfaceContainerHighest;
  }

  Color _getBorderColor(BuildContext context, bool isBlocked) {
    if (isBlocked) {
      return Theme.of(context).colorScheme.error;
    }
    
    return Theme.of(context).colorScheme.outline.withValues(alpha: 0.3);
  }

  Color _getHeartColor(BuildContext context, bool isActive, bool isBlocked) {
    if (isBlocked) {
      return isActive 
          ? Theme.of(context).colorScheme.error
          : Theme.of(context).colorScheme.error.withValues(alpha: 0.3);
    }
    
    if (isActive) {
      return Colors.red.shade400;
    }
    
    return Theme.of(context).colorScheme.outline.withValues(alpha: 0.4);
  }

  Color _getTextColor(BuildContext context, bool isBlocked) {
    if (isBlocked) {
      return Theme.of(context).colorScheme.onErrorContainer;
    }
    
    return Theme.of(context).colorScheme.onSurface;
  }
}

class LivesStatus extends StatelessWidget {
  const LivesStatus({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<LivesProvider>(
      builder: (context, livesProvider, child) {
        if (livesProvider.isLoading) {
          return const Center(
            child: CircularProgressIndicator(),
          );
        }

        if (livesProvider.livesState == LivesState.error) {
          return Card(
            color: Theme.of(context).colorScheme.errorContainer,
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(
                    Icons.error_outline,
                    color: Theme.of(context).colorScheme.onErrorContainer,
                    size: 48,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    AppLocalizations.of(context)?.errorLoadingLives ?? 'Error loading lives',
                    style: TextStyle(
                      color: Theme.of(context).colorScheme.onErrorContainer,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  if (livesProvider.errorMessage != null) ...[
                    const SizedBox(height: 4),
                    Text(
                      livesProvider.errorMessage!,
                      style: TextStyle(
                        color: Theme.of(context).colorScheme.onErrorContainer,
                        fontSize: 12,
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ],
                  const SizedBox(height: 8),
                  ElevatedButton(
                    onPressed: () {
                      livesProvider.clearError();
                      livesProvider.fetchLivesStatus();
                    },
                    child: Text(AppLocalizations.of(context)?.retry ?? 'Retry'),
                  ),
                ],
              ),
            ),
          );
        }

        final currentLives = livesProvider.currentLives;
        final nextReset = livesProvider.nextReset;
        final isBlocked = livesProvider.isBlocked;

        return Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                // Lives counter
                const LivesCounter(showLabel: true),
                
                const SizedBox(height: 12),
                
                // Status message
                Text(
                  isBlocked
                      ? (AppLocalizations.of(context)?.noLivesRemaining ?? 'No lives remaining!')
                      : (AppLocalizations.of(context)?.livesRemaining(currentLives) ?? '$currentLives lives remaining'),
                  style: TextStyle(
                    color: isBlocked
                        ? Theme.of(context).colorScheme.error
                        : Theme.of(context).colorScheme.onSurface,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                
                // Next reset time
                if (nextReset != null) ...[
                  const SizedBox(height: 8),
                  Text(
                    isBlocked
                        ? (AppLocalizations.of(context)?.livesResetTomorrow ?? 'Lives reset tomorrow')
                        : (AppLocalizations.of(context)?.nextResetTomorrow ?? 'Next reset tomorrow'),
                    style: TextStyle(
                      color: Theme.of(context).colorScheme.onSurfaceVariant,
                      fontSize: 12,
                    ),
                    textAlign: TextAlign.center,
                  ),
                ],
                
                // Refresh button
                const SizedBox(height: 12),
                TextButton.icon(
                  onPressed: () => livesProvider.fetchLivesStatus(),
                  icon: const Icon(Icons.refresh, size: 16),
                  label: Text(AppLocalizations.of(context)?.refresh ?? 'Refresh'),
                  style: TextButton.styleFrom(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}