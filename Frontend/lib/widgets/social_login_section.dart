import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:provider/provider.dart';
import '../l10n/app_localizations.dart';
import '../providers/auth_provider.dart';
import '../widgets/social_login_button.dart';
import '../screens/register_screen.dart';

class SocialLoginSection extends StatelessWidget {
  final VoidCallback onGoogleLogin;
  final VoidCallback onAppleLogin;

  const SocialLoginSection({
    super.key,
    required this.onGoogleLogin,
    required this.onAppleLogin,
  });

  @override
  Widget build(BuildContext context) {
    return Consumer<AuthProvider>(
      builder: (context, authProvider, child) {
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
            
            // Google Sign In
            SocialLoginButton(
              text: AppLocalizations.of(context)!.loginWithGoogle,
              icon: _buildGoogleIcon(),
              onPressed: onGoogleLogin,
              isLoading: authProvider.isLoading,
            ),
            
            const SizedBox(height: 16),
            
            // Apple Sign In
            SocialLoginButton(
              text: AppLocalizations.of(context)!.loginWithApple,
              icon: _buildAppleIcon(),
              backgroundColor: Colors.black,
              textColor: Colors.white,
              onPressed: onAppleLogin,
              isLoading: authProvider.isLoading,
            ),
            
            const SizedBox(height: 32),
            
            // Register Link
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text(
                  AppLocalizations.of(context)!.dontHaveAccount,
                  style: TextStyle(
                    color: Colors.grey.shade600,
                    fontSize: 14,
                  ),
                ),
                const SizedBox(width: 5),
                GestureDetector(
                  onTap: () {
                    Navigator.of(context).push(
                      MaterialPageRoute(
                        builder: (context) => const RegisterScreen(),
                      ),
                    );
                  },
                  child: Text(
                    AppLocalizations.of(context)!.signUp,
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
          ],
        );
      },
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