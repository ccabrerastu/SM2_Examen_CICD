import 'package:flutter/material.dart';
import '../l10n/app_localizations.dart';

class ForgotPasswordSuccessActions extends StatelessWidget {
  final VoidCallback onResendEmail;
  final VoidCallback onOpenEmailApp;

  const ForgotPasswordSuccessActions({
    super.key,
    required this.onResendEmail,
    required this.onOpenEmailApp,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // Resend Email Button
        Container(
          width: double.infinity,
          height: 56,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: Theme.of(context).colorScheme.primary,
              width: 2,
            ),
          ),
          child: ElevatedButton(
            onPressed: onResendEmail,
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.transparent,
              shadowColor: Colors.transparent,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
              ),
            ),
            child: Text(
              AppLocalizations.of(context)!.resendEmail,
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
                color: Theme.of(context).colorScheme.primary,
              ),
            ),
          ),
        ),
        
        const SizedBox(height: 16),
        
        // Open Email App Button
        Container(
          width: double.infinity,
          height: 56,
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(16),
            gradient: LinearGradient(
              colors: [
                Theme.of(context).colorScheme.primary,
                Color.fromRGBO(
                  (Theme.of(context).colorScheme.primary.r * 255.0).round() & 0xff,
                  (Theme.of(context).colorScheme.primary.g * 255.0).round() & 0xff,
                  (Theme.of(context).colorScheme.primary.b * 255.0).round() & 0xff,
                  0.8,
                ),
              ],
            ),
            boxShadow: [
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
            ],
          ),
          child: ElevatedButton(
            onPressed: onOpenEmailApp,
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.transparent,
              shadowColor: Colors.transparent,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(16),
              ),
            ),
            child: Text(
              AppLocalizations.of(context)!.openEmailApp,
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