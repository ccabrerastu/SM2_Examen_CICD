import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import '../l10n/app_localizations.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../widgets/social_login_button.dart';

class SocialRegisterSection extends StatelessWidget {
  final VoidCallback onGoogleRegister;
  final VoidCallback onAppleRegister;

  const SocialRegisterSection({
    super.key,
    required this.onGoogleRegister,
    required this.onAppleRegister,
  });

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);

    return Column(
      children: [
        // Divider
        Row(
          children: [
            Expanded(child: Divider(color: Colors.grey.shade400)),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Text(
                AppLocalizations.of(context)!.or,
                style: TextStyle(
                  color: Colors.grey.shade600,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
            Expanded(child: Divider(color: Colors.grey.shade400)),
          ],
        ),
        
        const SizedBox(height: 24),
        
        // Google Sign Up
        SocialLoginButton(
          text: AppLocalizations.of(context)!.signUpWithGoogle,
          icon: _buildGoogleIcon(),
          onPressed: onGoogleRegister,
          isLoading: authProvider.isLoading,
        ),
        
        const SizedBox(height: 16),
        
        // Apple Sign Up
        SocialLoginButton(
          text: AppLocalizations.of(context)!.signUpWithApple,
          icon: _buildAppleIcon(),
          backgroundColor: Colors.black,
          textColor: Colors.white,
          onPressed: onAppleRegister,
          isLoading: authProvider.isLoading,
        ),
      ],
    );
  }

  Widget _buildGoogleIcon() {
    return SvgPicture.asset(
      'assets/icons/google_icon.svg',
      width: 24,
      height: 24,
    );
  }

  Widget _buildAppleIcon() {
    return SvgPicture.asset(
      'assets/icons/apple_icon.svg',
      width: 24,
      height: 24,
      colorFilter: const ColorFilter.mode(
        Colors.white,
        BlendMode.srcIn,
      ),
    );
  }
}