import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../widgets/loading_book_icon.dart';
import '../providers/theme_provider.dart';
import '../l10n/app_localizations.dart';

class LoadingScreen extends StatefulWidget {
  final String? message;
  final VoidCallback? onLoadingComplete;
  final Duration duration;

  const LoadingScreen({
    super.key,
    this.message,
    this.onLoadingComplete,
    this.duration = const Duration(seconds: 3),
  });

  @override
  State<LoadingScreen> createState() => _LoadingScreenState();
}

class _LoadingScreenState extends State<LoadingScreen>
    with TickerProviderStateMixin {
  late AnimationController _fadeController;
  late Animation<double> _fadeAnimation;

  @override
  void initState() {
    super.initState();
    
    _fadeController = AnimationController(
      duration: const Duration(milliseconds: 800),
      vsync: this,
    );

    _fadeAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _fadeController,
      curve: Curves.easeInOut,
    ));

    _startAnimations();
  }

  void _startAnimations() async {
    // Start fade in animation
    _fadeController.forward();

    // Wait exactly 3 seconds total, then complete (Loading mock)
    Future.delayed(const Duration(seconds: 3), () {
      if (mounted && widget.onLoadingComplete != null) {
        widget.onLoadingComplete!();
      }
    });
  }

  @override
  void dispose() {
    _fadeController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<ThemeProvider>(
      builder: (context, themeProvider, child) {
        return Scaffold(
          backgroundColor: Theme.of(context).colorScheme.surface,
          body: Container(
            width: double.infinity,
            height: double.infinity,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
                colors: [
                  Theme.of(context).colorScheme.primary.withValues(alpha: 0.1),
                  Theme.of(context).colorScheme.surface,
                  Theme.of(context).colorScheme.primary.withValues(alpha: 0.05),
                ],
              ),
            ),
            child: SafeArea(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  // App Logo/Title
                  FadeTransition(
                    opacity: _fadeAnimation,
                    child: Column(
                      children: [
                        Text(
                          AppLocalizations.of(context)!.appTitle,
                          style: Theme.of(context).textTheme.headlineLarge?.copyWith(
                            fontWeight: FontWeight.bold,
                            color: Theme.of(context).colorScheme.primary,
                          ),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 8),
                        Text(
                          AppLocalizations.of(context)!.learningSlogan,
                          style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                            color: Theme.of(context).colorScheme.onSurface.withValues(
                              alpha: 0.7,
                            ),
                            letterSpacing: 1.2,
                          ),
                          textAlign: TextAlign.center,
                        ),
                      ],
                    ),
                  ),
                  
                  const SizedBox(height: 60),
                  
                  // Loading Book Icon
                  FadeTransition(
                    opacity: _fadeAnimation,
                    child: LoadingBookIcon(
                      size: 120,
                      baseColor: Colors.grey.shade400,
                      fillColor: Theme.of(context).colorScheme.primary,
                      duration: const Duration(seconds: 2),
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}