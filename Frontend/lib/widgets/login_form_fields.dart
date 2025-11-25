import 'package:flutter/material.dart';
import '../l10n/app_localizations.dart';

class LoginFormFields extends StatelessWidget {
  final GlobalKey<FormState> formKey;
  final TextEditingController emailController;
  final TextEditingController passwordController;
  final bool isEmailValid;
  final bool isPasswordValid;
  final bool isPasswordVisible;
  final bool rememberMe;
  final Function(String) onEmailChanged;
  final Function(String) onPasswordChanged;
  final VoidCallback onPasswordVisibilityToggle;
  final Function(bool?) onRememberMeChanged;
  final VoidCallback onForgotPasswordPressed;

  const LoginFormFields({
    super.key,
    required this.formKey,
    required this.emailController,
    required this.passwordController,
    required this.isEmailValid,
    required this.isPasswordValid,
    required this.isPasswordVisible,
    required this.rememberMe,
    required this.onEmailChanged,
    required this.onPasswordChanged,
    required this.onPasswordVisibilityToggle,
    required this.onRememberMeChanged,
    required this.onForgotPasswordPressed,
  });

  @override
  Widget build(BuildContext context) {
    return Form(
      key: formKey,
      child: Column(
        children: [
          // Email Field
          Container(
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(16),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.05),
                  blurRadius: 10,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: TextFormField(
              key: const Key('email_field'),
              controller: emailController,
              keyboardType: TextInputType.emailAddress,
              onChanged: onEmailChanged,
              decoration: InputDecoration(
                labelText: AppLocalizations.of(context)!.email,
                hintText: AppLocalizations.of(context)!.email,
                prefixIcon: Icon(
                  Icons.email_outlined,
                  color: isEmailValid
                      ? Theme.of(context).colorScheme.primary
                      : Colors.grey.shade400,
                ),
                suffixIcon: isEmailValid
                    ? Icon(
                        Icons.check_circle,
                        color: Theme.of(context).colorScheme.primary,
                      )
                    : null,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(16),
                  borderSide: BorderSide.none,
                ),
                filled: true,
                fillColor: Colors.grey.shade50,
                contentPadding: const EdgeInsets.symmetric(
                  horizontal: 20,
                  vertical: 16,
                ),
              ),
              validator: (value) {
                if (value == null || value.isEmpty) {
                  return AppLocalizations.of(context)!.emailRequired;
                }
                if (!RegExp(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$').hasMatch(value)) {
                  return AppLocalizations.of(context)!.emailInvalid;
                }
                return null;
              },
            ),
          ),
          
          const SizedBox(height: 16),
          
          // Password Field
          Container(
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(16),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.05),
                  blurRadius: 10,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: TextFormField(
              key: const Key('password_field'),
              controller: passwordController,
              obscureText: !isPasswordVisible,
              onChanged: onPasswordChanged,
              decoration: InputDecoration(
                labelText: AppLocalizations.of(context)!.password,
                hintText: AppLocalizations.of(context)!.password,
                prefixIcon: Icon(
                  Icons.lock_outline,
                  color: isPasswordValid
                      ? Theme.of(context).colorScheme.primary
                      : Colors.grey.shade400,
                ),
                suffixIcon: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    if (isPasswordValid)
                      Icon(
                        Icons.check_circle,
                        color: Theme.of(context).colorScheme.primary,
                      ),
                    IconButton(
                      icon: Icon(
                        isPasswordVisible
                            ? Icons.visibility_off
                            : Icons.visibility,
                        color: Colors.grey.shade600,
                      ),
                      onPressed: onPasswordVisibilityToggle,
                    ),
                  ],
                ),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(16),
                  borderSide: BorderSide.none,
                ),
                filled: true,
                fillColor: Colors.grey.shade50,
                contentPadding: const EdgeInsets.symmetric(
                  horizontal: 20,
                  vertical: 16,
                ),
              ),
              validator: (value) {
                if (value == null || value.isEmpty) {
                  return AppLocalizations.of(context)!.passwordRequired;
                }
                if (value.length < 12) {
                  return AppLocalizations.of(context)!.passwordTooShort;
                }
                return null;
              },
            ),
          ),
          
          const SizedBox(height: 16),
          
          // Remember Me and Forgot Password
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Checkbox(
                    value: rememberMe,
                    onChanged: onRememberMeChanged,
                    activeColor: Theme.of(context).colorScheme.primary,
                  ),
                  Text(
                    AppLocalizations.of(context)!.rememberSession,
                    style: TextStyle(
                      color: Colors.grey.shade600,
                      fontSize: 14,
                    ),
                  ),
                ],
              ),
              Expanded(
                child: Align(
                  alignment: Alignment.centerRight,
                  child: TextButton(
                    onPressed: onForgotPasswordPressed,
                    child: Text(
                      AppLocalizations.of(context)!.forgotPasswordQuestion,
                      style: TextStyle(
                        color: Theme.of(context).colorScheme.primary,
                        fontSize: 14,
                      ),
                      textAlign: TextAlign.end,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}