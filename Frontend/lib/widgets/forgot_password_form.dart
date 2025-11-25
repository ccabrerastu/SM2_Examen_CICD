import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../l10n/app_localizations.dart';

class ForgotPasswordForm extends StatelessWidget {
  final GlobalKey<FormState> formKey;
  final TextEditingController emailController;
  final bool isEmailValid;
  final VoidCallback onSendResetLink;
  final ValueChanged<String> onEmailChanged;

  const ForgotPasswordForm({
    super.key,
    required this.formKey,
    required this.emailController,
    required this.isEmailValid,
    required this.onSendResetLink,
    required this.onEmailChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Consumer<AuthProvider>(
      builder: (context, authProvider, child) {
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
                      color: const Color.fromRGBO(0, 0, 0, 0.05),
                      blurRadius: 10,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: TextFormField(
                  controller: emailController,
                  keyboardType: TextInputType.emailAddress,
                  onChanged: onEmailChanged,
                  decoration: InputDecoration(
                    labelText: AppLocalizations.of(context)!.emailAddress,
                    hintText: AppLocalizations.of(context)!.enterEmailAddress,
                    prefixIcon: Icon(
                      Icons.email_outlined,
                      color: isEmailValid 
                          ? Theme.of(context).colorScheme.primary
                          : Colors.grey.shade400,
                    ),
                    suffixIcon: isEmailValid
                        ? Icon(
                            Icons.check_circle,
                            color: Colors.green.shade400,
                          )
                        : null,
                    filled: true,
                    fillColor: Colors.white,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(16),
                      borderSide: BorderSide.none,
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(16),
                      borderSide: BorderSide(
                        color: Colors.grey.shade200,
                        width: 1,
                      ),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(16),
                      borderSide: BorderSide(
                        color: Theme.of(context).colorScheme.primary,
                        width: 2,
                      ),
                    ),
                  ),
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return AppLocalizations.of(context)!.emailRequired;
                    }
                    if (!RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}\$').hasMatch(value)) {
                      return AppLocalizations.of(context)!.emailInvalid;
                    }
                    return null;
                  },
                ),
              ),
              
              const SizedBox(height: 32),
              
              // Send Reset Link Button
              AnimatedContainer(
                duration: const Duration(milliseconds: 300),
                width: double.infinity,
                height: 56,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(16),
                  gradient: isEmailValid
                      ? LinearGradient(
                          colors: [
                            Theme.of(context).colorScheme.primary,
                            Color.fromRGBO(
                              (Theme.of(context).colorScheme.primary.r * 255.0).round() & 0xff,
                              (Theme.of(context).colorScheme.primary.g * 255.0).round() & 0xff,
                              (Theme.of(context).colorScheme.primary.b * 255.0).round() & 0xff,
                              0.8,
                            ),
                          ],
                        )
                      : null,
                  boxShadow: isEmailValid ? [
                    BoxShadow(
                      color: Color.fromRGBO(
                        (Theme.of(context).colorScheme.primary.r * 255.0).round() & 0xff,
                        (Theme.of(context).colorScheme.primary.g * 255.0).round() & 0xff,
                        (Theme.of(context).colorScheme.primary.b * 255.0).round() & 0xff,
                        0.3,
                      ),
                      blurRadius: 12,
                      offset: const Offset(0, 4),
                    ),
                  ] : null,
                ),
                child: ElevatedButton(
                  onPressed: authProvider.isLoading ? null : onSendResetLink,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: isEmailValid
                        ? Colors.transparent
                        : Color.fromRGBO(
                            (Theme.of(context).colorScheme.primary.r * 255.0).round() & 0xff,
                            (Theme.of(context).colorScheme.primary.g * 255.0).round() & 0xff,
                            (Theme.of(context).colorScheme.primary.b * 255.0).round() & 0xff,
                            0.6,
                          ),
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
                          AppLocalizations.of(context)!.sendResetLink,
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                            color: Colors.white,
                          ),
                        ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}