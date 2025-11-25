import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/lives_provider.dart';
import 'no_lives_dialog.dart';

/// A wrapper widget that protects content when user has no lives
/// Shows a blocked state and prevents interaction when lives are exhausted
class LivesGuard extends StatelessWidget {
  final Widget child;
  final String? blockedMessage;
  final VoidCallback? onLifeConsumed;
  final bool showDialog;

  const LivesGuard({
    super.key,
    required this.child,
    this.blockedMessage,
    this.onLifeConsumed,
    this.showDialog = true,
  });

  @override
  Widget build(BuildContext context) {
    return Consumer<LivesProvider>(
      builder: (context, livesProvider, _) {
        if (livesProvider.isBlocked) {
          return _buildBlockedState(context, livesProvider);
        }
        
        return child;
      },
    );
  }

  Widget _buildBlockedState(BuildContext context, LivesProvider livesProvider) {
    return Stack(
      children: [
        // Dimmed content
        Opacity(
          opacity: 0.3,
          child: AbsorbPointer(child: child),
        ),
        
        // Blocked overlay
        Container(
          color: Colors.black54,
          child: Center(
            child: Container(
              margin: const EdgeInsets.all(24),
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: Theme.of(context).colorScheme.surface,
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.2),
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(
                    Icons.block,
                    size: 48,
                    color: Theme.of(context).colorScheme.error,
                  ),
                  const SizedBox(height: 16),
                  Text(
                    blockedMessage ?? 'No Lives Remaining',
                    style: Theme.of(context).textTheme.titleLarge?.copyWith(
                      color: Theme.of(context).colorScheme.error,
                      fontWeight: FontWeight.bold,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 12),
                  Text(
                    "You've used all your lives for today. Come back tomorrow for a fresh start!",
                    style: Theme.of(context).textTheme.bodyMedium,
                    textAlign: TextAlign.center,
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
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                    children: [
                      TextButton(
                        onPressed: () => Navigator.of(context).pop(),
                        child: const Text('Go Back'),
                      ),
                      if (showDialog)
                        ElevatedButton(
                          onPressed: () {
                            context.showNoLivesDialog(
                              hoursUntilReset: livesProvider.hoursUntilReset,
                            );
                          },
                          child: const Text('Learn More'),
                        ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }
}

/// A wrapper for interactive elements that consume lives on error
/// Automatically handles life consumption and shows appropriate feedback
class LifeConsumingWidget extends StatelessWidget {
  final Widget child;
  final VoidCallback onError;
  final String? errorMessage;
  final bool consumeLifeOnError;

  const LifeConsumingWidget({
    super.key,
    required this.child,
    required this.onError,
    this.errorMessage,
    this.consumeLifeOnError = true,
  });

  @override
  Widget build(BuildContext context) {
    return Consumer<LivesProvider>(
      builder: (context, livesProvider, _) {
        return GestureDetector(
          onTap: () => _handleInteraction(context, livesProvider),
          child: child,
        );
      },
    );
  }

  void _handleInteraction(BuildContext context, LivesProvider livesProvider) async {
    // Check if user has lives before allowing interaction
    if (livesProvider.isBlocked) {
      context.showNoLivesDialog(
        hoursUntilReset: livesProvider.hoursUntilReset,
      );
      return;
    }

    // Simulate some interaction that might cause an error
    try {
      onError(); // This would be the actual logic that might fail
    } catch (e) {
      if (consumeLifeOnError) {
        final success = await livesProvider.consumeLife();
        
        if (!success && livesProvider.isBlocked) {
          // Show the no lives dialog if this was the last life
          if (context.mounted) {
            context.showNoLivesDialog(
              hoursUntilReset: livesProvider.hoursUntilReset,
            );
          }
        } else {
          // Show error message or feedback
          if (context.mounted && errorMessage != null) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(errorMessage!),
                backgroundColor: Theme.of(context).colorScheme.error,
                action: SnackBarAction(
                  label: 'Lives: ${livesProvider.currentLives}',
                  textColor: Theme.of(context).colorScheme.onError,
                  onPressed: () {},
                ),
              ),
            );
          }
        }
      }
    }
  }
}

/// A mixin to add lives functionality to any StatefulWidget
mixin LivesAwareMixin<T extends StatefulWidget> on State<T> {
  LivesProvider? _livesProvider;
  
  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    _livesProvider = Provider.of<LivesProvider>(context, listen: false);
  }

  /// Consume a life and handle the result
  Future<bool> consumeLife({
    String? errorMessage,
    bool showDialog = true,
  }) async {
    if (_livesProvider == null) return false;
    
    final success = await _livesProvider!.consumeLife();
    
    if (!success && _livesProvider!.isBlocked && showDialog && mounted) {
      context.showNoLivesDialog(
        hoursUntilReset: _livesProvider!.hoursUntilReset,
      );
    } else if (success && errorMessage != null && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(errorMessage),
          backgroundColor: Theme.of(context).colorScheme.error,
          action: SnackBarAction(
            label: 'Lives: ${_livesProvider!.currentLives}',
            textColor: Theme.of(context).colorScheme.onError,
            onPressed: () {},
          ),
        ),
      );
    }
    
    return success;
  }

  /// Check if user has lives available
  bool get hasLives => _livesProvider?.hasLives ?? false;
  
  /// Check if user is blocked (no lives)
  bool get isBlocked => _livesProvider?.isBlocked ?? false;
  
  /// Get current lives count
  int get currentLives => _livesProvider?.currentLives ?? 0;
}