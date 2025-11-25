import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../providers/lives_provider.dart';
import '../../providers/feedback_provider.dart';
import 'particle_effect.dart';

class LivesFeedbackIntegration extends StatefulWidget {
  final Widget child;
  final VoidCallback? onLifeLost;
  final VoidCallback? onNoLivesLeft;
  final VoidCallback? onLifeRestored;
  final bool showLivesIndicator;
  final bool autoConsumeOnError;

  const LivesFeedbackIntegration({
    super.key,
    required this.child,
    this.onLifeLost,
    this.onNoLivesLeft,
    this.onLifeRestored,
    this.showLivesIndicator = true,
    this.autoConsumeOnError = true,
  });

  @override
  State<LivesFeedbackIntegration> createState() => _LivesFeedbackIntegrationState();
}

class _LivesFeedbackIntegrationState extends State<LivesFeedbackIntegration>
    with TickerProviderStateMixin {
  bool _showParticles = false;
  late AnimationController _heartbeatController;
  late Animation<double> _heartbeatAnimation;
  int _previousLives = 0;

  @override
  void initState() {
    super.initState();
    _heartbeatController = AnimationController(
      duration: const Duration(milliseconds: 800),
      vsync: this,
    );
    _heartbeatAnimation = Tween<double>(
      begin: 1.0,
      end: 1.2,
    ).animate(CurvedAnimation(
      parent: _heartbeatController,
      curve: Curves.elasticOut,
    ));
  }

  @override
  void dispose() {
    _heartbeatController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Consumer2<LivesProvider, FeedbackProvider>(
      builder: (context, livesProvider, feedbackProvider, child) {
        // Monitor lives changes
        WidgetsBinding.instance.addPostFrameCallback((_) {
          _handleLivesChange(livesProvider.currentLives);
        });

        return Stack(
          children: [
            // Main content
            Column(
              children: [
                // Lives indicator
                if (widget.showLivesIndicator)
                  Container(
                    padding: const EdgeInsets.all(16),
                    child: _buildLivesIndicator(livesProvider),
                  ),
                
                // Exercise content
                Expanded(
                  child: widget.child,
                ),
              ],
            ),
            
            // Feedback overlay - handled by FeedbackProvider internally
            
            // Particle effects
            if (_showParticles)
              Positioned.fill(
                child: IgnorePointer(
                  child: ParticleEffect(
                    type: ParticleType.hearts,
                    particleCount: 20,
                    duration: const Duration(seconds: 2),
                    primaryColor: Colors.red,
                    secondaryColor: Colors.pink,
                    onComplete: () {
                      setState(() {
                        _showParticles = false;
                      });
                    },
                  ),
                ),
              ),
            
            // No lives overlay
            if (livesProvider.isBlocked)
              _buildNoLivesOverlay(livesProvider),
          ],
        );
      },
    );
  }

  Widget _buildLivesIndicator(LivesProvider livesProvider) {
    final currentLives = livesProvider.currentLives;
    final maxLives = 5; // Assuming max 5 lives
    
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(25),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.1),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Lives hearts
          AnimatedBuilder(
            animation: _heartbeatAnimation,
            builder: (context, child) {
              return Transform.scale(
                scale: _heartbeatAnimation.value,
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: List.generate(maxLives, (index) {
                    final isActive = index < currentLives;
                    return Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 2),
                      child: Icon(
                        isActive ? Icons.favorite : Icons.favorite_border,
                        color: isActive ? Colors.red[600] : Colors.grey[400],
                        size: 24,
                      ),
                    );
                  }),
                ),
              );
            },
          ),
          
          const SizedBox(width: 12),
          
          // Lives count text
          Text(
            '$currentLives/$maxLives',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: currentLives > 0 ? Colors.grey[800] : Colors.red[600],
            ),
          ),
          
          // Loading indicator when consuming
          if (livesProvider.isConsuming) ...[
            const SizedBox(width: 8),
            SizedBox(
              width: 16,
              height: 16,
              child: CircularProgressIndicator(
                strokeWidth: 2,
                valueColor: AlwaysStoppedAnimation<Color>(Colors.red[600]!),
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildNoLivesOverlay(LivesProvider livesProvider) {
    return Container(
      color: Colors.black.withValues(alpha: 0.8),
      child: Center(
        child: Container(
          margin: const EdgeInsets.all(32),
          padding: const EdgeInsets.all(24),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.3),
                blurRadius: 20,
                offset: const Offset(0, 10),
              ),
            ],
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // No lives icon
              Container(
                width: 80,
                height: 80,
                decoration: BoxDecoration(
                  color: Colors.red[50],
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  Icons.favorite_border,
                  size: 40,
                  color: Colors.red[600],
                ),
              ),
              
              const SizedBox(height: 16),
              
              // Title
              Text(
                '¡Sin vidas!',
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: Colors.grey[800],
                ),
              ),
              
              const SizedBox(height: 8),
              
              // Message
              Text(
                'Has agotado todas tus vidas. Espera a que se renueven o consigue más.',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 16,
                  color: Colors.grey[600],
                ),
              ),
              
              const SizedBox(height: 16),
              
              // Next reset time
              if (livesProvider.nextReset != null)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  decoration: BoxDecoration(
                    color: Colors.blue[50],
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    'Próxima renovación: ${livesProvider.nextReset}',
                    style: TextStyle(
                      fontSize: 14,
                      color: Colors.blue[700],
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
              
              const SizedBox(height: 20),
              
              // Action buttons
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  TextButton(
                    onPressed: () {
                      Navigator.of(context).pop();
                    },
                    child: const Text('Volver'),
                  ),
                  ElevatedButton(
                    onPressed: () {
                      // Navigate to store or watch ad
                      _showGetMoreLivesOptions(context);
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.red[600],
                      foregroundColor: Colors.white,
                    ),
                    child: const Text('Conseguir vidas'),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _handleLivesChange(int currentLives) {
    if (_previousLives > 0 && currentLives < _previousLives) {
      // Life was lost
      _onLifeLost();
    } else if (_previousLives < currentLives) {
      // Life was restored
      _onLifeRestored();
    }
    
    if (currentLives == 0 && _previousLives > 0) {
      // No lives left
      widget.onNoLivesLeft?.call();
    }
    
    _previousLives = currentLives;
  }

  void _onLifeLost() {
    // Trigger heartbeat animation
    _heartbeatController.forward().then((_) {
      _heartbeatController.reverse();
    });
    
    // Show life lost feedback
    final feedbackProvider = Provider.of<FeedbackProvider>(context, listen: false);
    feedbackProvider.showIncorrectAnswer(
      customMessage: '¡Vida perdida!',
    );
    
    // Show motivational message
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            Icon(Icons.favorite, color: Colors.white),
            SizedBox(width: 8),
            Text('¡No te rindas! Aún tienes ${_previousLives - 1} vidas'),
          ],
        ),
        backgroundColor: Colors.orange[600],
        duration: const Duration(seconds: 3),
      ),
    );
    
    widget.onLifeLost?.call();
  }

  void _onLifeRestored() {
    // Trigger heartbeat animation
    _heartbeatController.forward().then((_) {
      _heartbeatController.reverse();
    });
    
    // Show particles
    setState(() {
      _showParticles = true;
    });
    
    // Show life restored feedback
    final feedbackProvider = Provider.of<FeedbackProvider>(context, listen: false);
    feedbackProvider.showCorrectAnswer(
      customMessage: '¡Vida restaurada!',
    );
    
    widget.onLifeRestored?.call();
  }

  void _showGetMoreLivesOptions(BuildContext context) {
    showModalBottomSheet(
      context: context,
      builder: (context) => Container(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              'Conseguir más vidas',
              style: TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: Colors.grey[800],
              ),
            ),
            const SizedBox(height: 16),
            ListTile(
              leading: const Icon(Icons.play_circle_filled, color: Colors.green),
              title: const Text('Ver anuncio'),
              subtitle: const Text('Consigue 1 vida gratis'),
              onTap: () {
                Navigator.pop(context);
                // Implement ad watching logic
              },
            ),
            ListTile(
              leading: const Icon(Icons.shopping_cart, color: Colors.blue),
              title: const Text('Comprar vidas'),
              subtitle: const Text('Paquetes disponibles en la tienda'),
              onTap: () {
                Navigator.pop(context);
                // Navigate to store
              },
            ),
            ListTile(
              leading: const Icon(Icons.schedule, color: Colors.orange),
              title: const Text('Esperar renovación'),
              subtitle: const Text('Las vidas se renuevan automáticamente'),
              onTap: () {
                Navigator.pop(context);
              },
            ),
          ],
        ),
      ),
    );
  }
}

// Extension methods for easy integration
extension LivesFeedbackExtension on State {
  LivesFeedbackIntegration? get livesFeedback {
    final context = this.context;
    return context.findAncestorWidgetOfExactType<LivesFeedbackIntegration>();
  }
  
  Future<bool> consumeLifeOnError() async {
    final livesProvider = Provider.of<LivesProvider>(context, listen: false);
    return await livesProvider.consumeLife();
  }
  
  bool get hasLivesAvailable {
    final livesProvider = Provider.of<LivesProvider>(context, listen: false);
    return livesProvider.hasLives;
  }
  
  int get currentLivesCount {
    final livesProvider = Provider.of<LivesProvider>(context, listen: false);
    return livesProvider.currentLives;
  }
}

// Helper class for lives-related feedback
class LivesFeedbackHelper {
  static void showLifeLostFeedback(BuildContext context, {
    String? customMessage,
    String? hint,
  }) {
    final feedbackProvider = Provider.of<FeedbackProvider>(context, listen: false);
    feedbackProvider.showIncorrectAnswer(
      customMessage: customMessage ?? '¡Vida perdida!',
    );
  }
  
  static void showLifeRestoredFeedback(BuildContext context, {
    String? customMessage,
  }) {
    final feedbackProvider = Provider.of<FeedbackProvider>(context, listen: false);
    feedbackProvider.showCorrectAnswer(
      customMessage: customMessage ?? '¡Vida restaurada!',
    );
  }
  
  static void showNoLivesWarning(BuildContext context) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            Icon(Icons.warning, color: Colors.white),
            SizedBox(width: 8),
            Text('¡Cuidado! Te quedan pocas vidas'),
          ],
        ),
        backgroundColor: Colors.orange[600],
        duration: const Duration(seconds: 3),
      ),
    );
  }
}