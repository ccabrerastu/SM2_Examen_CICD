import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../widgets/settings_button.dart';
import '../widgets/register_form_fields.dart';
import '../widgets/register_button_section.dart';
import '../widgets/social_register_section.dart';
import '../l10n/app_localizations.dart';
import 'home_screen.dart';
import 'login_screen.dart';
import 'loading_screen.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen>
    with TickerProviderStateMixin {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  bool _obscurePassword = true;
  bool _obscureConfirmPassword = true;
  bool _acceptTerms = false;
  bool _isNameValid = false;
  bool _isEmailValid = false;
  bool _isPasswordValid = false;
  bool _isConfirmPasswordValid = false;
  
  late AnimationController _fadeController;
  late AnimationController _slideController;
  
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
    
    _nameController.addListener(_validateName);
    _emailController.addListener(_validateEmail);
    _passwordController.addListener(_validatePassword);
    _confirmPasswordController.addListener(_validateConfirmPassword);
    
    // Start animations
    _fadeController.forward();
    _slideController.forward();
  }

  void _validateName() {
    final name = _nameController.text;
    setState(() {
      _isNameValid = name.isNotEmpty && name.length >= 2;
    });
  }

  void _validateEmail() {
    final email = _emailController.text;
    setState(() {
      _isEmailValid = email.isNotEmpty && 
          RegExp(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$').hasMatch(email);
    });
  }
  
  void _validatePassword() {
    final password = _passwordController.text;
    setState(() {
      _isPasswordValid = password.isNotEmpty && password.length >= 12;
    });
    _validateConfirmPassword(); // Re-validate confirm password
  }
  
  void _validateConfirmPassword() {
    final confirmPassword = _confirmPasswordController.text;
    setState(() {
      _isConfirmPasswordValid = confirmPassword.isNotEmpty && 
          confirmPassword == _passwordController.text;
    });
  }
  
  @override
  void dispose() {
    _fadeController.dispose();
    _slideController.dispose();
    _nameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
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
              Theme.of(context).colorScheme.primary.withValues(alpha: 0.1),
              Theme.of(context).colorScheme.secondary.withValues(alpha: 0.05),
            ],
          ),
        ),
        child: Stack(
          children: [
            SafeArea(
              child: SingleChildScrollView(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 24.0),
                  child: Column(
                    children: [
                      const SizedBox(height: 60),
                      
                      // Welcome Text
                      Text(
                        AppLocalizations.of(context)!.createAccount,
                        style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                          fontWeight: FontWeight.bold,
                          color: Theme.of(context).colorScheme.onSurface,
                        ),
                      ),
                      
                      const SizedBox(height: 8),
                      
                      Text(
                        AppLocalizations.of(context)!.joinUsSlogan,
                        style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                          color: Colors.grey.shade600,
                        ),
                        textAlign: TextAlign.center,
                      ),
                      
                      const SizedBox(height: 40),
                      
                      // Registration Form
                      Form(
                        key: _formKey,
                        child: Column(
                          children: [
                            // Form Fields
                            RegisterFormFields(
                              nameController: _nameController,
                              emailController: _emailController,
                              passwordController: _passwordController,
                              confirmPasswordController: _confirmPasswordController,
                              isNameValid: _isNameValid,
                              isEmailValid: _isEmailValid,
                              isPasswordValid: _isPasswordValid,
                              isConfirmPasswordValid: _isConfirmPasswordValid,
                              obscurePassword: _obscurePassword,
                              obscureConfirmPassword: _obscureConfirmPassword,
                              onTogglePasswordVisibility: () {
                                setState(() {
                                  _obscurePassword = !_obscurePassword;
                                });
                              },
                              onToggleConfirmPasswordVisibility: () {
                                setState(() {
                                  _obscureConfirmPassword = !_obscureConfirmPassword;
                                });
                              },
                            ),
                            
                            const SizedBox(height: 24),
                            
                            // Register Button Section
                            RegisterButtonSection(
                              acceptTerms: _acceptTerms,
                              isNameValid: _isNameValid,
                              isEmailValid: _isEmailValid,
                              isPasswordValid: _isPasswordValid,
                              isConfirmPasswordValid: _isConfirmPasswordValid,
                              onAcceptTermsChanged: () {
                                setState(() {
                                  _acceptTerms = !_acceptTerms;
                                });
                              },
                              onRegister: _handleRegister,
                            ),
                            
                            const SizedBox(height: 24),
                            
                            // Social Register Section
                            SocialRegisterSection(
                              onGoogleRegister: _handleGoogleRegister,
                              onAppleRegister: _handleAppleRegister,
                            ),
                            
                            const SizedBox(height: 32),
                            
                            // Login Link
                            Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Text(
                                  AppLocalizations.of(context)!.alreadyHaveAccount,
                                  style: TextStyle(
                                    color: Colors.grey.shade600,
                                    fontSize: 14,
                                  ),
                                ),
                                GestureDetector(
                                  onTap: () {
                                    Navigator.of(context).pushReplacement(
                                      MaterialPageRoute(
                                        builder: (context) => const LoginScreen(),
                                      ),
                                    );
                                  },
                                  child: Text(
                                    'Sign In',
                                    style: TextStyle(
                                      color: Theme.of(context).colorScheme.primary,
                                      fontSize: 14,
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
                    ],
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


  Future<void> _handleRegister() async {
    if (_formKey.currentState?.validate() ?? false) {
      if (!_acceptTerms) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(AppLocalizations.of(context)!.pleaseAcceptTerms),
            backgroundColor: Colors.red,
          ),
        );
        return;
      }
      
      await _performRealRegistration();
    }
  }

  Future<void> _performRealRegistration() async {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    
    try {
      // Perform real registration
      final success = await authProvider.register(
        context,
        _nameController.text,
        _emailController.text,
        _passwordController.text,
        _confirmPasswordController.text,
      );
      
      if (mounted) {
        if (success) {
          // Registration successful - navigate to home
          Navigator.of(context).pushAndRemoveUntil(
            MaterialPageRoute(builder: (context) => const HomeScreen()),
            (route) => false,
          );
        } else {
          // Registration failed - stay on register screen and show error
          // All fields are preserved automatically since we don't clear the controllers
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(authProvider.errorMessage ?? AppLocalizations.of(context)!.invalidCredentials),
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

  Future<void> _handleGoogleRegister() async {
    // Show loading screen
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) => LoadingScreen(
          message: AppLocalizations.of(context)!.creatingAccountWithGoogle,
          duration: const Duration(seconds: 3),
          onLoadingComplete: () => _completeSocialRegistration(),
        ),
      ),
    );
  }

  Future<void> _handleAppleRegister() async {
    // Show loading screen
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) => LoadingScreen(
          message: AppLocalizations.of(context)!.creatingAccountWithApple,
          duration: const Duration(seconds: 3),
          onLoadingComplete: () => _completeSocialRegistration(),
        ),
      ),
    );
  }

  void _completeSocialRegistration() {
    if (mounted) {
      // Mock registration for social login - always successful
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      authProvider.mockLogin(context); // This will set user as authenticated
      
      Navigator.of(context).pushAndRemoveUntil(
        MaterialPageRoute(builder: (context) => const HomeScreen()),
        (route) => false,
      );
    }
  }
}