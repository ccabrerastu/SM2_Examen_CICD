import 'package:flutter/material.dart';

enum ColorPalette {
  purple,
  blue,
  green,
  orange,
  red,
  custom,
}

class AppColorPalettes {
  static const Map<ColorPalette, Map<String, Color>> palettes = {
    ColorPalette.purple: {
      'primary': Color(0xFFA702DC), // Default primary color
      'primaryVariant': Color(0xFF8B01B8),
      'background': Color(0xFFD0C8ED),
      'surface': Colors.white,
      'onPrimary': Colors.white,
      'onSurface': Color(0xFF2D2D2D),
    },
    ColorPalette.blue: {
      'primary': Color(0xFF2196F3),
      'primaryVariant': Color(0xFF1976D2),
      'background': Color(0xFFC8D0ED),
      'surface': Colors.white,
      'onPrimary': Colors.white,
      'onSurface': Color(0xFF2D2D2D),
    },
    ColorPalette.green: {
      'primary': Color(0xFF4CAF50),
      'primaryVariant': Color(0xFF388E3C),
      'background': Color(0xFFC8EDC8),
      'surface': Colors.white,
      'onPrimary': Colors.white,
      'onSurface': Color(0xFF2D2D2D),
    },
    ColorPalette.orange: {
      'primary': Color(0xFFFF9800),
      'primaryVariant': Color(0xFFF57C00),
      'background': Color(0xFFEDD0C8),
      'surface': Colors.white,
      'onPrimary': Colors.white,
      'onSurface': Color(0xFF2D2D2D),
    },
    ColorPalette.red: {
      'primary': Color(0xFFF44336),
      'primaryVariant': Color(0xFFD32F2F),
      'background': Color(0xFFEDC8C8),
      'surface': Colors.white,
      'onPrimary': Colors.white,
      'onSurface': Color(0xFF2D2D2D),
    },
  };

  // Static storage for custom palette
  static Map<String, Color>? _customPalette;

  static Map<String, Color> getPalette(ColorPalette palette) {
    if (palette == ColorPalette.custom && _customPalette != null) {
      return _customPalette!;
    }
    return palettes[palette] ?? palettes[ColorPalette.purple]!;
  }

  // Generate a palette from a primary color
  static Map<String, Color> generatePaletteFromColor(Color primaryColor) {
    final hsl = HSLColor.fromColor(primaryColor);
    
    // Generate variant (darker version)
    final primaryVariant = hsl.withLightness((hsl.lightness - 0.1).clamp(0.0, 1.0)).toColor();
    
    // Generate background based on D0C8ED relationship
    final background = _generateBackgroundFromPrimary(primaryColor);
    
    return {
      'primary': primaryColor,
      'primaryVariant': primaryVariant,
      'background': background,
      'surface': Colors.white,
      'onPrimary': Colors.white,
      'onSurface': const Color(0xFF2D2D2D),
    };
  }

  // Set custom palette
  static void setCustomPalette(Color primaryColor) {
    _customPalette = generatePaletteFromColor(primaryColor);
  }

  // Generate background color with similar relationship as D0C8ED to purple
  static Color _generateBackgroundFromPrimary(Color primaryColor) {
    final hsl = HSLColor.fromColor(primaryColor);
    
    // D0C8ED (#D0C8ED) relationship to purple primary:
    // - Higher lightness (~0.85)
    // - Lower saturation (~0.4)
    // Maintain similar relationship for other colors
    final targetLightness = 0.85;
    final targetSaturation = (hsl.saturation * 0.6).clamp(0.3, 0.7);
    
    return hsl
        .withSaturation(targetSaturation)
        .withLightness(targetLightness)
        .toColor();
  }

  static String getPaletteName(ColorPalette palette) {
    switch (palette) {
      case ColorPalette.purple:
        return 'Purple';
      case ColorPalette.blue:
        return 'Blue';
      case ColorPalette.green:
        return 'Green';
      case ColorPalette.orange:
        return 'Orange';
      case ColorPalette.red:
        return 'Red';
      case ColorPalette.custom:
        return 'Custom';
    }
  }
}