import 'package:flutter/material.dart';
import '../l10n/app_localizations.dart';

class RegisterFormFields extends StatelessWidget {
  final TextEditingController nameController;
  final TextEditingController emailController;
  final TextEditingController passwordController;
  final TextEditingController confirmPasswordController;
  final bool isNameValid;
  final bool isEmailValid;
  final bool isPasswordValid;
  final bool isConfirmPasswordValid;
  final bool obscurePassword;
  final bool obscureConfirmPassword;
  final VoidCallback onTogglePasswordVisibility;
  final VoidCallback onToggleConfirmPasswordVisibility;

  const RegisterFormFields({
    super.key,
    required this.nameController,
    required this.emailController,
    required this.passwordController,
    required this.confirmPasswordController,
    required this.isNameValid,
    required this.isEmailValid,
    required this.isPasswordValid,
    required this.isConfirmPasswordValid,
    required this.obscurePassword,
    required this.obscureConfirmPassword,
    required this.onTogglePasswordVisibility,
    required this.onToggleConfirmPasswordVisibility,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // Name Field
        _buildFormField(
          context: context,
          controller: nameController,
          labelText: AppLocalizations.of(context)!.fullName,
          hintText: AppLocalizations.of(context)!.enterFullName,
          prefixIcon: Icons.person_outline,
          isValid: isNameValid,
          validator: (value) {
            if (value == null || value.isEmpty) {
              return AppLocalizations.of(context)!.pleaseEnterName;
            }
            if (value.length < 2) {
              return AppLocalizations.of(context)!.nameTooShort;
            }
            return null;
          },
        ),
        
        const SizedBox(height: 20),
        
        // Email Field
        _buildFormField(
          context: context,
          controller: emailController,
          labelText: AppLocalizations.of(context)!.email,
          hintText: AppLocalizations.of(context)!.emailAddress,
          prefixIcon: Icons.email_outlined,
          isValid: isEmailValid,
          keyboardType: TextInputType.emailAddress,
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
        
        const SizedBox(height: 20),
        
        // Password Field
        _buildFormField(
          context: context,
          controller: passwordController,
          labelText: AppLocalizations.of(context)!.password,
          hintText: AppLocalizations.of(context)!.password,
          prefixIcon: Icons.lock_outline,
          isValid: isPasswordValid,
          obscureText: obscurePassword,
          suffixIcon: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              if (isPasswordValid)
                Icon(
                  Icons.check_circle,
                  color: Colors.green.shade400,
                ),
              IconButton(
                icon: Icon(
                  obscurePassword
                      ? Icons.visibility_off
                      : Icons.visibility,
                  color: Colors.grey.shade400,
                ),
                onPressed: onTogglePasswordVisibility,
              ),
            ],
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
        
        const SizedBox(height: 20),
        
        // Confirm Password Field
        _buildFormField(
          context: context,
          controller: confirmPasswordController,
          labelText: AppLocalizations.of(context)!.confirmPassword,
          hintText: AppLocalizations.of(context)!.enterConfirmPassword,
          prefixIcon: Icons.lock_outline,
          isValid: isConfirmPasswordValid,
          obscureText: obscureConfirmPassword,
          suffixIcon: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              if (isConfirmPasswordValid)
                Icon(
                  Icons.check_circle,
                  color: Colors.green.shade400,
                ),
              IconButton(
                icon: Icon(
                  obscureConfirmPassword
                      ? Icons.visibility_off
                      : Icons.visibility,
                  color: Colors.grey.shade400,
                ),
                onPressed: onToggleConfirmPasswordVisibility,
              ),
            ],
          ),
          validator: (value) {
            if (value == null || value.isEmpty) {
              return AppLocalizations.of(context)!.passwordRequired;
            }
            if (value != passwordController.text) {
              return AppLocalizations.of(context)!.passwordsDontMatch;
            }
            return null;
          },
        ),
      ],
    );
  }

  Widget _buildFormField({
    required BuildContext context,
    required TextEditingController controller,
    required String labelText,
    required String hintText,
    required IconData prefixIcon,
    required bool isValid,
    required String? Function(String?) validator,
    TextInputType? keyboardType,
    bool obscureText = false,
    Widget? suffixIcon,
  }) {
    return Container(
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
        controller: controller,
        keyboardType: keyboardType,
        obscureText: obscureText,
        decoration: InputDecoration(
          labelText: labelText,
          hintText: hintText,
          prefixIcon: Icon(
            prefixIcon,
            color: isValid 
                ? Theme.of(context).colorScheme.primary
                : Colors.grey.shade400,
          ),
          suffixIcon: suffixIcon ?? (isValid
              ? Icon(
                  Icons.check_circle,
                  color: Colors.green.shade400,
                )
              : null),
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
        validator: validator,
      ),
    );
  }
}