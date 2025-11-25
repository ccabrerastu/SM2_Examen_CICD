import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/theme_provider.dart';
import '../providers/locale_provider.dart';
import '../providers/auth_provider.dart';
import '../utils/color_palettes.dart';
import '../l10n/app_localizations.dart';
import '../widgets/collapsible_section.dart';
import '../widgets/settings_option.dart';
import '../widgets/settings_switch.dart';
import '../widgets/logout_button.dart';
import '../widgets/color_picker_widget.dart';
import 'login_screen.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  bool _notificationsEnabled = true;
  bool _isLoggingOut = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Theme.of(context).colorScheme.surface,
      appBar: AppBar(
        title: Text(AppLocalizations.of(context)!.settings),
        backgroundColor: Theme.of(context).colorScheme.primary,
        foregroundColor: Theme.of(context).colorScheme.onPrimary,
        elevation: 0,
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // System Section
          CollapsibleSection(
            title: AppLocalizations.of(context)!.system,
            initiallyExpanded: true,
            children: [
              // Language Setting
              Consumer<LocaleProvider>(
                builder: (context, localeProvider, child) {
                  return SettingsOption(
                    title: AppLocalizations.of(context)!.language,
                    subtitle: localeProvider.getLocaleName(localeProvider.locale),
                    leading: const Icon(Icons.language),
                    trailing: const Icon(Icons.arrow_forward_ios, size: 16),
                    onTap: () => _showLanguageSelector(context),
                  );
                },
              ),
              
              // Theme Setting
              Consumer<ThemeProvider>(
                builder: (context, themeProvider, child) {
                  return SettingsSwitch(
                    title: AppLocalizations.of(context)!.theme,
                    subtitle: themeProvider.isDarkMode
                        ? AppLocalizations.of(context)!.darkTheme
                        : AppLocalizations.of(context)!.lightTheme,
                    value: themeProvider.isDarkMode,
                    onChanged: (value) => themeProvider.toggleTheme(),
                  );
                },
              ),
              
              // Color Palette Setting
              Consumer<ThemeProvider>(
                builder: (context, themeProvider, child) {
                  return SettingsOption(
                    title: AppLocalizations.of(context)!.colorPalette,
                    subtitle: AppColorPalettes.getPaletteName(
                        themeProvider.colorPalette),
                    leading: Container(
                      width: 24,
                      height: 24,
                      decoration: BoxDecoration(
                        color: AppColorPalettes.getPalette(
                            themeProvider.colorPalette)['primary'],
                        shape: BoxShape.circle,
                      ),
                    ),
                    trailing: const Icon(Icons.arrow_forward_ios, size: 16),
                    onTap: () => _showColorPaletteSelector(context),
                  );
                },
              ),
              
              // Notifications Setting
              SettingsSwitch(
                title: AppLocalizations.of(context)!.notifications,
                subtitle: _notificationsEnabled
                    ? AppLocalizations.of(context)!.notificationsEnabled
                    : AppLocalizations.of(context)!.notificationsDisabled,
                value: _notificationsEnabled,
                onChanged: (value) {
                  setState(() {
                    _notificationsEnabled = value;
                  });
                },
              ),
            ],
          ),
        ],
      ),
      bottomNavigationBar: Consumer<AuthProvider>(
        builder: (context, authProvider, child) {
          if (authProvider.isAuthenticated) {
            return SafeArea(
              child: LogoutButton(
                text: AppLocalizations.of(context)!.logout,
                isLoading: _isLoggingOut,
                onPressed: _handleLogout,
              ),
            );
          }
          return const SizedBox.shrink();
        },
      ),
    );
  }

  void _showLanguageSelector(BuildContext context) {
    showModalBottomSheet(
      context: context,
      builder: (context) => Container(
        padding: const EdgeInsets.all(16),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              AppLocalizations.of(context)!.selectLanguage,
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 16),
            Consumer<LocaleProvider>(
              builder: (context, localeProvider, child) {
                return Column(
                  children: LocaleProvider.supportedLocales.map((locale) {
                    final isSelected = localeProvider.locale == locale;
                    return ListTile(
                      title: Text(localeProvider.getLocaleName(locale)),
                      trailing: isSelected
                          ? Icon(
                              Icons.check,
                              color: Theme.of(context).colorScheme.primary,
                            )
                          : null,
                      onTap: () {
                        localeProvider.setLocale(locale);
                        Navigator.pop(context);
                      },
                    );
                  }).toList(),
                );
              },
            ),
          ],
        ),
      ),
    );
  }

  void _showColorPaletteSelector(BuildContext context) {
    showModalBottomSheet(
      context: context,
      builder: (context) => Container(
        padding: const EdgeInsets.all(16),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              AppLocalizations.of(context)!.selectColorPalette,
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 16),
            Consumer<ThemeProvider>(
              builder: (context, themeProvider, child) {
                return Column(
                  children: [
                    // Predefined palettes
                    ...ColorPalette.values.where((p) => p != ColorPalette.custom).map((palette) {
                      final colors = AppColorPalettes.getPalette(palette);
                      final isSelected = themeProvider.colorPalette == palette;
                      
                      return ListTile(
                        leading: Container(
                          width: 30,
                          height: 30,
                          decoration: BoxDecoration(
                            color: colors['primary'],
                            shape: BoxShape.circle,
                            border: isSelected
                                ? Border.all(
                                    color: Theme.of(context).colorScheme.outline,
                                    width: 2,
                                  )
                                : null,
                          ),
                        ),
                        title: Text(AppColorPalettes.getPaletteName(palette)),
                        trailing: isSelected
                            ? Icon(
                                Icons.check,
                                color: Theme.of(context).colorScheme.primary,
                              )
                            : null,
                        onTap: () {
                          themeProvider.setColorPalette(palette);
                          Navigator.pop(context);
                        },
                      );
                    }),
                    
                    const Divider(),
                    
                    // Custom color option
                    ListTile(
                      leading: Container(
                        width: 30,
                        height: 30,
                        decoration: BoxDecoration(
                          color: themeProvider.colorPalette == ColorPalette.custom 
                              ? AppColorPalettes.getPalette(ColorPalette.custom)['primary']
                              : Theme.of(context).colorScheme.primary.withValues(alpha: 0.3),
                          shape: BoxShape.circle,
                          border: themeProvider.colorPalette == ColorPalette.custom
                              ? Border.all(
                                  color: Theme.of(context).colorScheme.outline,
                                  width: 2,
                                )
                              : null,
                        ),
                        child: themeProvider.colorPalette != ColorPalette.custom
                            ? Icon(
                                Icons.palette,
                                color: Theme.of(context).colorScheme.primary,
                                size: 16,
                              )
                            : null,
                      ),
                      title: Text(AppColorPalettes.getPaletteName(ColorPalette.custom)),
                      trailing: themeProvider.colorPalette == ColorPalette.custom
                          ? Icon(
                              Icons.check,
                              color: Theme.of(context).colorScheme.primary,
                            )
                          : Icon(
                              Icons.arrow_forward_ios,
                              size: 16,
                              color: Theme.of(context).colorScheme.onSurface.withValues(alpha: 0.6),
                            ),
                      onTap: () => _showColorPicker(context, themeProvider),
                    ),
                  ],
                );
              },
            ),
          ],
        ),
      ),
    );
  }

  void _showColorPicker(BuildContext context, ThemeProvider themeProvider) async {
    Navigator.pop(context); // Close the palette selector first
    
    final Color? selectedColor = await showModalBottomSheet<Color>(
      context: context,
      isScrollControlled: true,
      builder: (context) => Padding(
        padding: EdgeInsets.only(
          bottom: MediaQuery.of(context).viewInsets.bottom,
        ),
        child: ColorPickerWidget(
          initialColor: themeProvider.colorPalette == ColorPalette.custom 
              ? AppColorPalettes.getPalette(ColorPalette.custom)['primary']!
              : const Color(0xFFA702DC),
          onColorChanged: (color) {
            // Real-time preview could be added here if needed
          },
        ),
      ),
    );
    
    if (selectedColor != null) {
      await themeProvider.setCustomColor(selectedColor);
    }
  }

  Future<void> _handleLogout() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(AppLocalizations.of(context)!.confirmLogout),
        content: Text(AppLocalizations.of(context)!.logoutConfirmation),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: Text(AppLocalizations.of(context)!.cancel),
          ),
          TextButton(
            onPressed: () => Navigator.of(context).pop(true),
            child: Text(
              AppLocalizations.of(context)!.logout,
              style: TextStyle(
                color: Theme.of(context).colorScheme.error,
              ),
            ),
          ),
        ],
      ),
    );

    if (confirmed == true && mounted) {
      setState(() {
        _isLoggingOut = true;
      });

      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      await authProvider.logout(context);

      if (mounted) {
        Navigator.of(context).pushAndRemoveUntil(
          MaterialPageRoute(builder: (_) => const LoginScreen()),
          (route) => false,
        );
      }
    }
  }
}