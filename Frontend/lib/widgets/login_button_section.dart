import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../l10n/app_localizations.dart';
import '../providers/auth_provider.dart';

class LoginButtonSection extends StatelessWidget {
  final bool isEmailValid;
  final bool isPasswordValid;
  final VoidCallback onLoginPressed;

  const LoginButtonSection({
    super.key,
    required this.isEmailValid,
    required this.isPasswordValid,
    required this.onLoginPressed,
  });

  @override
  Widget build(BuildContext context) {
    return Consumer<AuthProvider>(
      builder: (context, authProvider, child) {
        return Column(
          children: [
            
            // Login Button
            AnimatedContainer(
              duration: const Duration(milliseconds: 300),
              width: double.infinity,
              height: 56,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(16),
                gradient: (isEmailValid && isPasswordValid)
                    ? LinearGradient(
                        colors: [
                          Theme.of(context).colorScheme.primary,
                          Theme.of(context).colorScheme.primary.withValues(alpha: 0.8),
                        ],
                      )
                    : null,
                boxShadow: (isEmailValid && isPasswordValid) ? [
                  BoxShadow(
                    color: Theme.of(context).colorScheme.primary.withValues(alpha: 0.3),
                    blurRadius: 12,
                    offset: const Offset(0, 4),
                  ),
                ] : null,
              ),
              child: ElevatedButton(
                key: const Key('login_button'),
                onPressed: (authProvider.isLoading || !(isEmailValid && isPasswordValid)) ? null : onLoginPressed,
                style: ElevatedButton.styleFrom(
                  backgroundColor: (isEmailValid && isPasswordValid)
                      ? Colors.transparent
                      : Theme.of(context).colorScheme.primary.withValues(alpha: 0.6),
                  shadowColor: Colors.transparent,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                ),
                child: authProvider.isLoading
                    ? Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const SizedBox(
                            height: 20,
                            width: 20,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              valueColor: AlwaysStoppedAnimation<Color>(
                                Colors.white,
                              ),
                            ),
                          ),
                          const SizedBox(width: 12),
                          Text(
                            AppLocalizations.of(context)!.signingYouIn,
                            style: const TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w600,
                              color: Colors.white,
                            ),
                          ),
                        ],
                      )
                    : Text(
                        AppLocalizations.of(context)!.loginButton,
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                          color: Colors.white,
                        ),
                      ),
              ),
            ),
          ],
        );
      },
    );
  }
}