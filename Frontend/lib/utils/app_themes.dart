import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'color_palettes.dart';

class AppThemes {
  static ThemeData lightTheme(ColorPalette colorPalette) {
    final palette = AppColorPalettes.getPalette(colorPalette);
    
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      colorScheme: ColorScheme.light(
        primary: palette['primary']!,
        primaryContainer: palette['primaryVariant']!,
        secondary: palette['primary']!.withValues(alpha: 0.3),
        surface: palette['surface']!,
        surfaceContainer: palette['background']!, // Use for main content background
        onPrimary: palette['onPrimary']!,
        onSecondary: palette['onSurface']!,
        onSurface: palette['onSurface']!,
      ),
      textTheme: GoogleFonts.interTextTheme().copyWith(
        bodyLarge: TextStyle(color: palette['onSurface']),
        bodyMedium: TextStyle(color: palette['onSurface']!.withValues(alpha: 0.6)),
        headlineLarge: TextStyle(
          color: palette['onSurface'],
          fontWeight: FontWeight.bold,
        ),
        headlineMedium: TextStyle(
          color: palette['onSurface'],
          fontWeight: FontWeight.bold,
        ),
        titleMedium: TextStyle(
          color: palette['onSurface'],
          fontWeight: FontWeight.w600,
        ),
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: palette['primary'],
        foregroundColor: palette['onPrimary'],
        elevation: 0,
      ),
      cardTheme: CardThemeData(
        color: palette['surface'],
        elevation: 4,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: palette['primary'],
          foregroundColor: palette['onPrimary'],
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        ),
      ),
    );
  }

  static ThemeData darkTheme(ColorPalette colorPalette) {
    final palette = AppColorPalettes.getPalette(colorPalette);
    
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      colorScheme: ColorScheme.dark(
        primary: palette['primary']!,
        primaryContainer: palette['primaryVariant']!,
        secondary: palette['primary']!.withValues(alpha: 0.3),
        surface: const Color(0xFF1E1E1E),
        onPrimary: palette['onPrimary']!,
        onSecondary: Colors.white,
        onSurface: Colors.white,
      ),
      textTheme: GoogleFonts.interTextTheme(ThemeData.dark().textTheme).copyWith(
        bodyLarge: const TextStyle(color: Colors.white),
        bodyMedium: const TextStyle(color: Colors.white70),
        headlineLarge: const TextStyle(
          color: Colors.white,
          fontWeight: FontWeight.bold,
        ),
        headlineMedium: const TextStyle(
          color: Colors.white,
          fontWeight: FontWeight.bold,
        ),
        titleMedium: const TextStyle(
          color: Colors.white,
          fontWeight: FontWeight.w600,
        ),
      ),
      appBarTheme: AppBarTheme(
        backgroundColor: palette['primary'],
        foregroundColor: palette['onPrimary'],
        elevation: 0,
      ),
      cardTheme: const CardThemeData(
        color: Color(0xFF1E1E1E),
        elevation: 4,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.all(Radius.circular(16)),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: palette['primary'],
          foregroundColor: palette['onPrimary'],
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        ),
      ),
    );
  }
}