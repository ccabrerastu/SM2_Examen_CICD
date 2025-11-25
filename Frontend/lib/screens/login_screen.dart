import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../l10n/app_localizations.dart';
import '../providers/auth_provider.dart';
import '../widgets/settings_button.dart';
import '../widgets/login_form_fields.dart';
import '../widgets/login_button_section.dart';
import '../widgets/social_login_section.dart';
import 'home_screen.dart';
import 'forgot_password_screen.dart';
import 'loading_screen.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen>
    with TickerProviderStateMixin {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _isEmailValid = false;
  bool _isPasswordValid = false;
  bool _isPasswordVisible = false;
  bool _rememberMe = false;
  
  late AnimationController _fadeController;
  late AnimationController _slideController;
  late Animation<double> _fadeAnimation;
  late Animation<Offset> _slideAnimation;

  @override
  void initState() {
    super.initState();
    
    _fadeController = AnimationController(
      duration: const Duration(milliseconds: 1000),
      vsync: this,
    );
    
    _slideController = AnimationController(
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
    
    _slideAnimation = Tween<Offset>(
      begin: const Offset(0, 0.3),
      end: Offset.zero,
    ).animate(CurvedAnimation(
      parent: _slideController,
      curve: Curves.easeOutCubic,
    ));
    
    _fadeController.forward();
    _slideController.forward();
    
    _emailController.addListener(_validateEmailField);
    _passwordController.addListener(_validatePasswordField);
  }

  bool _validateEmail(String email) {
    return RegExp(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$').hasMatch(email);
  }

  bool _validatePassword(String password) {
    return password.isNotEmpty && password.length >= 12;
  }

  void _validateEmailField() {
    final email = _emailController.text;
    setState(() {
      _isEmailValid = _validateEmail(email);
    });
  }

  void _validatePasswordField() {
    final password = _passwordController.text;
    setState(() {
      _isPasswordValid = password.isNotEmpty && password.length >= 12;
    });
  }
  
  @override
  void dispose() {
    _fadeController.dispose();
    _slideController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
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
                0.05,
              ),
              Theme.of(context).colorScheme.surface,
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
                      children: [
                        const SizedBox(height: 80),
                  
                        // App Title
                        Center(
                          child: Text(
                            AppLocalizations.of(context)!.appTitle,
                            style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                              fontWeight: FontWeight.bold,
                              color: Theme.of(context).colorScheme.primary,
                            ),
                            textAlign: TextAlign.center,
                          ),
                        ),
                        
                        const SizedBox(height: 8),
                        
                        Center(
                          child: Text(
                            AppLocalizations.of(context)!.login,
                            style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                              color: Theme.of(context).colorScheme.onSurface,
                            ),
                            textAlign: TextAlign.center,
                          ),
                        ),
                        
                        const SizedBox(height: 40),
                        
                        // Form Fields
                        LoginFormFields(
                          formKey: _formKey,
                          emailController: _emailController,
                          passwordController: _passwordController,
                          isEmailValid: _isEmailValid,
                          isPasswordValid: _isPasswordValid,
                          isPasswordVisible: _isPasswordVisible,
                          rememberMe: _rememberMe,
                          onEmailChanged: (value) {
                            setState(() {
                              _isEmailValid = _validateEmail(value);
                            });
                          },
                          onPasswordChanged: (value) {
                            setState(() {
                              _isPasswordValid = _validatePassword(value);
                            });
                          },
                          onPasswordVisibilityToggle: () {
                            setState(() {
                              _isPasswordVisible = !_isPasswordVisible;
                            });
                          },
                          onRememberMeChanged: (value) {
                            setState(() {
                              _rememberMe = value ?? false;
                            });
                          },
                          onForgotPasswordPressed: () {
                            Navigator.of(context).push(
                              MaterialPageRoute(
                                builder: (context) => const ForgotPasswordScreen(),
                              ),
                            );
                          },
                        ),
                        
                        const SizedBox(height: 24),
                        
                        // Login Button
                        LoginButtonSection(
                          isEmailValid: _isEmailValid,
                          isPasswordValid: _isPasswordValid,
                          onLoginPressed: _handleLogin,
                        ),
                        
                        const SizedBox(height: 24),
                        
                        // Social Login Section
                        SocialLoginSection(
                          onGoogleLogin: _handleGoogleLogin,
                          onAppleLogin: _handleAppleLogin,
                        ),
                        
                        const SizedBox(height: 20),
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

  Future<void> _handleLogin() async {
    if (_formKey.currentState?.validate() ?? false) {
      await _performRealLogin();
    }
  }

  Future<void> _performRealLogin() async {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    
    try {
      // Perform real login with backend API
      final success = await authProvider.login(
        context,
        _emailController.text,
        _passwordController.text,
      );
      
      if (mounted) {
        if (success) {
          // Login successful - navigate to home
          Navigator.of(context).pushAndRemoveUntil(
            MaterialPageRoute(builder: (context) => const HomeScreen()),
            (route) => false,
          );
        } else {
          // Login failed - stay on login screen and show error
          // Email is preserved automatically since we don't clear the controller
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(AppLocalizations.of(context)!.invalidCredentials),
              backgroundColor: Colors.red,
              duration: const Duration(seconds: 5),
            ),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(AppLocalizations.of(context)!.invalidCredentials),
            backgroundColor: Colors.red,
            duration: const Duration(seconds: 5),
          ),
        );
      }
    }
  }

  Future<void> _handleGoogleLogin() async {
    // Show loading screen
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) => LoadingScreen(
          message: AppLocalizations.of(context)!.connectingWithGoogle,
          duration: const Duration(seconds: 3),
          onLoadingComplete: () => _completeSocialLogin(),
        ),
      ),
    );
  }

  Future<void> _handleAppleLogin() async {
    // Show loading screen
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) => LoadingScreen(
          message: AppLocalizations.of(context)!.connectingWithApple,
          duration: const Duration(seconds: 3),
          onLoadingComplete: () => _completeSocialLogin(),
        ),
      ),
    );
  }

  void _completeSocialLogin() {
    if (mounted) {
      // Mock social login - always successful for now
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      authProvider.mockLogin(context);
      
      Navigator.of(context).pushAndRemoveUntil(
        MaterialPageRoute(builder: (context) => const HomeScreen()),
        (route) => false,
      );
    }
  }
}