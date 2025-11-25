import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class LocaleProvider with ChangeNotifier {
  static const String _localeKey = 'locale';
  
  Locale _locale = const Locale('en');
  
  Locale get locale => _locale;
  
  static const List<Locale> supportedLocales = [
    Locale('en'),
    Locale('es'),
    Locale('pt'),
    Locale('ru'),
  ];
  
  static const Map<String, String> localeNames = {
    'en': 'English',
    'es': 'Español',
    'pt': 'Português',
    'ru': 'Русский',
  };
  
  LocaleProvider() {
    _loadFromPrefs();
  }
  
  Future<void> setLocale(Locale locale) async {
    if (supportedLocales.contains(locale) && _locale != locale) {
      _locale = locale;
      notifyListeners();
      await _saveToPrefs();
    }
  }
  
  String getLocaleName(Locale locale) {
    return localeNames[locale.languageCode] ?? locale.languageCode;
  }
  
  Future<void> _loadFromPrefs() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final localeCode = prefs.getString(_localeKey);
      
      if (localeCode != null) {
        _locale = Locale(localeCode);
        notifyListeners();
      }
    } catch (e) {
      debugPrint('Error loading locale preferences: $e');
    }
  }
  
  Future<void> _saveToPrefs() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(_localeKey, _locale.languageCode);
    } catch (e) {
      debugPrint('Error saving locale preferences: $e');
    }
  }
}