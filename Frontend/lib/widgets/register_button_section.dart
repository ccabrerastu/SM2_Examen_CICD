import 'package:flutter/material.dart';
import '../l10n/app_localizations.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';

class RegisterButtonSection extends StatelessWidget {
  final bool acceptTerms;
  final bool isNameValid;
  final bool isEmailValid;
  final bool isPasswordValid;
  final bool isConfirmPasswordValid;
  final VoidCallback onAcceptTermsChanged;
  final VoidCallback onRegister;

  const RegisterButtonSection({
    super.key,
    required this.acceptTerms,
    required this.isNameValid,
    required this.isEmailValid,
    required this.isPasswordValid,
    required this.isConfirmPasswordValid,
    required this.onAcceptTermsChanged,
    required this.onRegister,
  });

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    final bool isFormValid = isNameValid && isEmailValid && isPasswordValid && isConfirmPasswordValid && acceptTerms;

    return Column(
      children: [
        // Terms and Conditions
        Row(
          children: [
            Checkbox(
              value: acceptTerms,
              onChanged: (value) {
                if (value != null) {
                  onAcceptTermsChanged();
                }
              },
              activeColor: Theme.of(context).colorScheme.primary,
            ),
            Expanded(
              child: GestureDetector(
                onTap: () => onAcceptTermsChanged(),
                child: Text(
                  AppLocalizations.of(context)!.acceptTerms,
                  style: TextStyle(
                    color: Colors.grey.shade600,
                    fontSize: 14,
                  ),
                ),
              ),
            ),
          ],
        ),
        
        const SizedBox(height: 32),
        
        // Register Button
        AnimatedContainer(
          duration: const Duration(milliseconds: 300),
          width: double.infinity,
          height: 56,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(16),
            gradient: isFormValid
                ? LinearGradient(
                    colors: [
                      Theme.of(context).colorScheme.primary,
                      Theme.of(context).colorScheme.primary.withValues(alpha: 0.8),
                    ],
                  )
                : null,
            boxShadow: isFormValid ? [
              BoxShadow(
                color: Theme.of(context).colorScheme.primary.withValues(alpha: 0.3),
                blurRadius: 12,
                offset: const Offset(0, 4),
              ),
            ] : null,
          ),
          child: ElevatedButton(
            onPressed: authProvider.isLoading ? null : (isFormValid ? onRegister : null),
            style: ElevatedButton.styleFrom(
              backgroundColor: isFormValid
                  ? Colors.transparent
                  : Theme.of(context).colorScheme.primary.withValues(alpha: 0.6),
              shadowColor: Colors.transparent,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
              ),
            ),
            child: authProvider.isLoading
                ? const SizedBox(
                    height: 20,
                    width: 20,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      valueColor: AlwaysStoppedAnimation<Color>(
                        Colors.white,
                      ),
                    ),
                  )
                : Text(
                    AppLocalizations.of(context)!.createAccount,
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
  }
}