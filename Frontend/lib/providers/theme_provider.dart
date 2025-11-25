import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../utils/color_palettes.dart';
import '../utils/app_themes.dart';

class ThemeProvider with ChangeNotifier {
  static const String _themeKey = 'theme_mode';
  static const String _colorPaletteKey = 'color_palette';
  static const String _customColorKey = 'custom_color';
  
  ThemeMode _themeMode = ThemeMode.light;
  ColorPalette _colorPalette = ColorPalette.purple;
  bool _isInitialized = false;
  
  ThemeMode get themeMode => _themeMode;
  ColorPalette get colorPalette => _colorPalette;
  bool get isInitialized => _isInitialized;
  
  bool get isDarkMode => _themeMode == ThemeMode.dark;
  
  ThemeData get lightTheme => AppThemes.lightTheme(_colorPalette);
  ThemeData get darkTheme => AppThemes.darkTheme(_colorPalette);
  
  ThemeProvider() {
    _loadFromPrefs();
  }
  
  Future<void> toggleTheme() async {
    _themeMode = _themeMode == ThemeMode.light 
        ? ThemeMode.dark 
        : ThemeMode.light;
    
    // Notify change immediately
    notifyListeners();
    
    // Save asynchronously
    await _saveToPrefs();
  }
  
  Future<void> setColorPalette(ColorPalette palette) async {
    if (_colorPalette != palette) {
      _colorPalette = palette;
      notifyListeners();
      await _saveToPrefs();
    }
  }
  
  Future<void> setCustomColor(Color color) async {
    AppColorPalettes.setCustomPalette(color);
    _colorPalette = ColorPalette.custom;
    notifyListeners();
    await _saveCustomColor(color);
    await _saveToPrefs();
  }
  
  Future<void> _loadFromPrefs() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final themeIndex = prefs.getInt(_themeKey) ?? 0; // Default: light mode
      final paletteIndex = prefs.getInt(_colorPaletteKey) ?? 0; // Default: purple palette
      
      _themeMode = ThemeMode.values[themeIndex];
      _colorPalette = ColorPalette.values[paletteIndex];
      
      // Load custom color if custom palette is selected
      if (_colorPalette == ColorPalette.custom) {
        await _loadCustomColor();
      }
      
      _isInitialized = true;
      notifyListeners();
    } catch (e) {
      debugPrint('Error loading theme preferences: $e');
      _isInitialized = true;
      notifyListeners();
    }
  }
  
  Future<void> _saveToPrefs() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setInt(_themeKey, _themeMode.index);
      await prefs.setInt(_colorPaletteKey, _colorPalette.index);
    } catch (e) {
      debugPrint('Error saving theme preferences: $e');
    }
  }
  
  Future<void> _saveCustomColor(Color color) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setInt(_customColorKey, (color.a * 255).round() << 24 | (color.r * 255).round() << 16 | (color.g * 255).round() << 8 | (color.b * 255).round());
    } catch (e) {
      debugPrint('Error saving custom color: $e');
    }
  }
  
  Future<void> _loadCustomColor() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final colorValue = prefs.getInt(_customColorKey);
      if (colorValue != null) {
        final customColor = Color(colorValue);
        AppColorPalettes.setCustomPalette(customColor);
      }
    } catch (e) {
      debugPrint('Error loading custom color: $e');
    }
  }
}