import 'package:flutter/material.dart';
import '../widgets/settings_button.dart';
import '../widgets/forgot_password_form.dart';
import '../widgets/forgot_password_success_actions.dart';
import '../l10n/app_localizations.dart';
import 'login_screen.dart';
import 'loading_screen.dart';

class ForgotPasswordScreen extends StatefulWidget {
  const ForgotPasswordScreen({super.key});

  @override
  State<ForgotPasswordScreen> createState() => _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends State<ForgotPasswordScreen>
    with TickerProviderStateMixin {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  bool _isEmailValid = false;
  bool _isEmailSent = false;
  
  late AnimationController _fadeController;
  late AnimationController _slideController;
  late Animation<double> _fadeAnimation;
  late Animation<Offset> _slideAnimation;
  
  @override
  void initState() {
    super.initState();
    _fadeController = AnimationController(
      duration: const Duration(milliseconds: 1500),
      vsync: this,
    );
    _slideController = AnimationController(
      duration: const Duration(milliseconds: 1200),
      vsync: this,
    );
    
    _fadeAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _fadeController,
      curve: Curves.easeInOut,
    ));
    
    _slideAnimation = Tween<Offset>(
      begin: const Offset(0, 0.3),
      end: Offset.zero,
    ).animate(CurvedAnimation(
      parent: _slideController,
      curve: Curves.easeOutCubic,
    ));
    
    _emailController.addListener(_validateEmail);
    
    // Start animations
    _fadeController.forward();
    _slideController.forward();
  }

  void _validateEmail() {
    final email = _emailController.text;
    setState(() {
      _isEmailValid = email.isNotEmpty && 
          RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}\$').hasMatch(email);
    });
  }
  
  @override
  void dispose() {
    _fadeController.dispose();
    _slideController.dispose();
    _emailController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              Color.fromRGBO(
                (Theme.of(context).colorScheme.primary.r * 255.0).round() & 0xff,
                (Theme.of(context).colorScheme.primary.g * 255.0).round() & 0xff,
                (Theme.of(context).colorScheme.primary.b * 255.0).round() & 0xff,
                0.1,
              ),
              Color.fromRGBO(
                (Theme.of(context).colorScheme.secondary.r * 255.0).round() & 0xff,
                (Theme.of(context).colorScheme.secondary.g * 255.0).round() & 0xff,
                (Theme.of(context).colorScheme.secondary.b * 255.0).round() & 0xff,
                0.1,
              ),
            ],
          ),
        ),
        child: Stack(
          children: [
            SafeArea(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(24.0),
                child: FadeTransition(
                  opacity: _fadeAnimation,
                  child: SlideTransition(
                    position: _slideAnimation,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const SizedBox(height: 40),
                        
                        // Back Button
                        IconButton(
                          onPressed: () => Navigator.of(context).pop(),
                          icon: const Icon(Icons.arrow_back_ios),
                          style: IconButton.styleFrom(
                            backgroundColor: const Color.fromRGBO(255, 255, 255, 0.9),
                            padding: const EdgeInsets.all(12),
                          ),
                        ),
                        
                        const SizedBox(height: 40),
                        
                        // Icon
                        Center(
                          child: Container(
                            width: 100,
                            height: 100,
                            decoration: BoxDecoration(
                              color: Color.fromRGBO(
                                (Theme.of(context).colorScheme.primary.r * 255.0).round() & 0xff,
                                (Theme.of(context).colorScheme.primary.g * 255.0).round() & 0xff,
                                (Theme.of(context).colorScheme.primary.b * 255.0).round() & 0xff,
                                0.1,
                              ),
                              shape: BoxShape.circle,
                            ),
                            child: Icon(
                              _isEmailSent ? Icons.mark_email_read : Icons.lock_reset,
                              size: 50,
                              color: Theme.of(context).colorScheme.primary,
                            ),
                          ),
                        ),
                        
                        const SizedBox(height: 32),
                        
                        // Title
                        Center(
                          child: Text(
                            _isEmailSent ? AppLocalizations.of(context)!.checkYourEmail : AppLocalizations.of(context)!.forgotPassword,
                            style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                              fontWeight: FontWeight.bold,
                              color: Theme.of(context).colorScheme.onSurface,
                            ),
                            textAlign: TextAlign.center,
                          ),
                        ),
                        
                        const SizedBox(height: 16),
                        
                        // Subtitle
                        Center(
                          child: Text(
                            _isEmailSent 
                                ? AppLocalizations.of(context)!.emailSentMessage
                                : AppLocalizations.of(context)!.forgotPasswordSubtitle,
                            style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                              color: Colors.grey.shade600,
                            ),
                            textAlign: TextAlign.center,
                          ),
                        ),
                        
                        const SizedBox(height: 48),
                        
                        if (!_isEmailSent) ...[
                          // Email Form
                          ForgotPasswordForm(
                            formKey: _formKey,
                            emailController: _emailController,
                            isEmailValid: _isEmailValid,
                            onSendResetLink: _handleSendResetLink,
                            onEmailChanged: (value) {
                              setState(() {
                                _isEmailValid = value.isNotEmpty && 
                                    RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}\$').hasMatch(value);
                              });
                            },
                          ),
                        ] else ...[
                          // Success Actions
                          ForgotPasswordSuccessActions(
                            onResendEmail: _handleResendEmail,
                            onOpenEmailApp: _handleOpenEmailApp,
                          ),
                        ],
                        
                        const SizedBox(height: 48),
                        
                        // Back to Login Link
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              Icons.arrow_back,
                              size: 16,
                              color: Colors.grey.shade600,
                            ),
                            const SizedBox(width: 8),
                            GestureDetector(
                              onTap: () {
                                Navigator.of(context).pushReplacement(
                                  MaterialPageRoute(
                                    builder: (context) => const LoginScreen(),
                                  ),
                                );
                              },
                              child: Text(
                                AppLocalizations.of(context)!.backToLogin,
                                style: TextStyle(
                                  color: Theme.of(context).colorScheme.primary,
                                  fontSize: 16,
                                  fontWeight: FontWeight.w600,
                                  decoration: TextDecoration.underline,
                                ),
                              ),
                            ),
                          ],
                        ),
                        
                        const SizedBox(height: 40),
                      ],
                    ),
                  ),
                ),
              ),
            ),
            
            // Settings Button
            const SettingsButton(),
          ],
        ),
      ),
    );
  }

  Future<void> _handleSendResetLink() async {
    if (_formKey.currentState?.validate() ?? false) {
      // Show loading screen
      Navigator.of(context).push(
        MaterialPageRoute(
          builder: (context) => LoadingScreen(
            message: AppLocalizations.of(context)!.sendingResetLink,
            duration: const Duration(seconds: 2),
            onLoadingComplete: () => _completeSendResetLink(),
          ),
        ),
      );
    }
  }

  void _completeSendResetLink() {
    if (mounted) {
      Navigator.of(context).pop(); // Close loading screen
      setState(() {
        _isEmailSent = true;
      });
    }
  }

  void _handleResendEmail() {
    // Show success message
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(AppLocalizations.of(context)!.resetLinkSentAgain),
        backgroundColor: Colors.green,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(10),
        ),
      ),
    );
  }

  void _handleOpenEmailApp() {
    // In a real app, this would open the default email app
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(AppLocalizations.of(context)!.openingEmailApp),
        backgroundColor: Theme.of(context).colorScheme.primary,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(10),
        ),
      ),
    );
  }
}