import 'package:flutter/foundation.dart';
import 'package:flutter_tts/flutter_tts.dart';
import 'package:audioplayers/audioplayers.dart';

class AudioService {
  static final AudioService _instance = AudioService._internal();
  factory AudioService() => _instance;
  AudioService._internal();

  // Motores
  late FlutterTts _flutterTts;
  late AudioPlayer _audioPlayer;

  // Estado interno
  bool _isInitialized = false;
  bool _isSpeaking = false;
  bool _isPlaying = false;

  // Config TTS
  double _volume = 0.8;
  double _rate = 0.3;
  double _pitch = 1.0;
  String _currentLanguage = 'en-US';
  Map<String, String>? _currentVoice;

  // Cache de idiomas y voces
  List<dynamic> _availableLanguages = [];
  List<dynamic> _availableVoices = [];

  // Getters públicos
  bool get isInitialized => _isInitialized;
  bool get isSpeaking => _isSpeaking;
  bool get isPlaying => _isPlaying;
  double get volume => _volume;
  double get rate => _rate;
  double get pitch => _pitch;
  String get currentLanguage => _currentLanguage;
  Map<String, String>? get currentVoice => _currentVoice;
  List<dynamic> get availableLanguages => _availableLanguages;
  List<dynamic> get availableVoices => _availableVoices;

  /// Helpers estáticos (compatibilidad)
  static Future<bool> speak(String text, {String? language}) =>
      _instance.speakText(text, language: language);

  static Future<void> playFromUrl(String url) =>
      _instance.playAudioFromUrl(url);

  static Future<void> stopAll() => _instance.stop();
  static Future<void> pauseAll() => _instance.pause();

  /// Inicialización
  Future<void> initialize() async {
    if (_isInitialized) return;
    try {
      _flutterTts = FlutterTts();
      _audioPlayer = AudioPlayer();

      // Config específica web
      if (kIsWeb) {
        await _flutterTts.setSharedInstance(true);
      }

      await _configureTts();
      await _loadAvailableLanguages();
      await _loadAvailableVoices();

      _isInitialized = true;
      if (kDebugMode) debugPrint('AudioService initialized successfully');
    } catch (e) {
      if (kDebugMode) debugPrint('Error initializing AudioService: $e');
      throw Exception('Failed to initialize AudioService: $e');
    }
  }

  /// Configurar TTS y handlers
  Future<void> _configureTts() async {
    await _flutterTts.setVolume(_volume);
    await _flutterTts.setSpeechRate(_rate);
    await _flutterTts.setPitch(_pitch);
    await _flutterTts.setLanguage(_currentLanguage);

    // Intentar configurar una voz masculina por defecto
    await _setMaleVoiceIfAvailable();

    _flutterTts.setStartHandler(() {
      _isSpeaking = true;
    });

    _flutterTts.setCompletionHandler(() {
      _isSpeaking = false;
    });

    _flutterTts.setCancelHandler(() {
      _isSpeaking = false;
    });

    _flutterTts.setErrorHandler((msg) {
      _isSpeaking = false;
      if (kDebugMode) debugPrint('TTS Error: $msg');
    });
  }

  Future<void> _loadAvailableLanguages() async {
    try {
      _availableLanguages = await _flutterTts.getLanguages ?? [];
    } catch (e) {
      if (kDebugMode) debugPrint('Error loading languages: $e');
      _availableLanguages = [];
    }
  }

  Future<void> _loadAvailableVoices() async {
    try {
      _availableVoices = await _flutterTts.getVoices ?? [];
      if (kDebugMode) {
        debugPrint('📢 Available voices: ${_availableVoices.length}');
        for (var voice in _availableVoices) {
          debugPrint('  - ${voice['name']} (${voice['locale']})');
        }
      }
    } catch (e) {
      if (kDebugMode) debugPrint('Error loading voices: $e');
      _availableVoices = [];
    }
  }

  /// Configurar voz masculina automáticamente
  Future<void> _setMaleVoiceIfAvailable() async {
    try {
      if (_availableVoices.isEmpty) return;

      // Nombres comunes de voces masculinas en diferentes plataformas
      final maleVoicePatterns = [
        // Android
        'en-us-x-tpf-local',      // Android male voice
        'en-us-x-tpd-local',      // Android male voice
        'en-gb-x-gba-local',      // UK male voice
        // iOS
        'Aaron',                   // US English male
        'Alex',                    // US English male
        'Daniel',                  // UK English male
        'Fred',                    // US English male
        'Jorge',                   // Spanish male
        'Juan',                    // Spanish male
        // Otros patrones
        'male',
        'man',
        'masculino',
      ];

      // Buscar una voz masculina para el idioma actual
      for (var voice in _availableVoices) {
        final voiceMap = voice as Map<String, dynamic>;
        final name = voiceMap['name']?.toString().toLowerCase() ?? '';
        final locale = voiceMap['locale']?.toString().toLowerCase() ?? '';

        // Verificar si el locale coincide con el idioma actual
        if (!locale.contains(_currentLanguage.toLowerCase().split('-').first)) {
          continue;
        }

        // Verificar si el nombre contiene algún patrón masculino
        for (var pattern in maleVoicePatterns) {
          if (name.contains(pattern.toLowerCase())) {
            await setVoice(voiceMap.map((key, value) => MapEntry(key.toString(), value.toString())));
            if (kDebugMode) debugPrint('✅ Male voice set: ${voiceMap['name']}');
            return;
          }
        }
      }

      if (kDebugMode) debugPrint('⚠️ No male voice found, using default');
    } catch (e) {
      if (kDebugMode) debugPrint('Error setting male voice: $e');
    }
  }

  /// Configurar una voz específica
  Future<bool> setVoice(Map<String, String> voice) async {
    try {
      if (!_isInitialized) await initialize();

      await _flutterTts.setVoice(voice);
      _currentVoice = voice;

      if (kDebugMode) debugPrint('Voice set to: ${voice['name']}');
      return true;
    } catch (e) {
      if (kDebugMode) debugPrint('Error setting voice: $e');
      return false;
    }
  }

  /// Obtener voces disponibles filtradas por idioma y género
  List<Map<String, String>> getVoicesByLanguageAndGender({
    String? language,
    bool maleOnly = false,
  }) {
    final voices = <Map<String, String>>[];

    for (var voice in _availableVoices) {
      final voiceMap = voice as Map<String, dynamic>;
      final locale = voiceMap['locale']?.toString().toLowerCase() ?? '';
      final name = voiceMap['name']?.toString().toLowerCase() ?? '';

      // Filtrar por idioma si se especifica
      if (language != null && !locale.contains(language.toLowerCase())) {
        continue;
      }

      // Filtrar por género si se especifica
      if (maleOnly) {
        final malePatterns = ['male', 'man', 'aaron', 'alex', 'daniel', 'fred', 'jorge', 'juan', 'tpf', 'tpd', 'gba'];
        if (!malePatterns.any((pattern) => name.contains(pattern))) {
          continue;
        }
      }

      voices.add(voiceMap.map((key, value) => MapEntry(key.toString(), value.toString())));
    }

    return voices;
  }

  /// Hablar texto
  Future<bool> speakText(String text, {String? language}) async {
    try {
      if (!_isInitialized) await initialize();
      if (text.trim().isEmpty) {
        if (kDebugMode) debugPrint('Cannot speak empty text');
        return false;
      }

      await stopSpeaking();

      if (language != null && language != _currentLanguage) {
        await setLanguage(language);
      }

      final result = await _flutterTts.speak(text);
      if (kDebugMode) debugPrint('Speaking: "$text" in $_currentLanguage');
      return result == 1;
    } catch (e) {
      if (kDebugMode) debugPrint('Error speaking text: $e');
      return false;
    }
  }

  /// Audio desde URL
  Future<bool> playAudioFromUrl(String audioUrl) async {
    try {
      if (!_isInitialized) await initialize();
      if (audioUrl.trim().isEmpty) {
        if (kDebugMode) debugPrint('Cannot play empty audio URL');
        return false;
      }

      await stopAudio();

      _audioPlayer.onPlayerStateChanged.listen((PlayerState state) {
        _isPlaying = state == PlayerState.playing;
      });
      _audioPlayer.onPlayerComplete.listen((_) => _isPlaying = false);

      await _audioPlayer.play(UrlSource(audioUrl));
      if (kDebugMode) debugPrint('Playing audio from URL: $audioUrl');
      return true;
    } catch (e) {
      if (kDebugMode) debugPrint('Error playing audio: $e');
      return false;
    }
  }

  /// Controles TTS
  Future<void> stopSpeaking() async {
    if (!_isInitialized) return;
    if (_isSpeaking) {
      await _flutterTts.stop();
      _isSpeaking = false;
    }
  }

  Future<void> pauseSpeaking() async {
    if (!_isInitialized) return;
    if (_isSpeaking) {
      await _flutterTts.pause();
    }
  }

  /// Controles audio
  Future<void> stopAudio() async {
    if (!_isInitialized) return;
    if (_isPlaying) {
      await _audioPlayer.stop();
      _isPlaying = false;
    }
  }

  Future<void> pauseAudio() async {
    if (!_isInitialized) return;
    if (_isPlaying) {
      await _audioPlayer.pause();
    }
  }

  Future<void> resumeAudio() async {
    if (!_isInitialized) return;
    await _audioPlayer.resume();
  }

  /// Controles globales (para helpers estáticos)
  Future<void> stop() async {
    await stopSpeaking();
    await stopAudio();
  }

  Future<void> pause() async {
    await pauseSpeaking();
    await pauseAudio();
  }

  /// Idioma TTS
  Future<bool> setLanguage(String language) async {
    if (!_isInitialized) await initialize();

    try {
      final supported = getSupportedLanguage(language);
      final result = await _flutterTts.setLanguage(supported);
      if (result == 1) {
        _currentLanguage = supported;
        if (kDebugMode) debugPrint('Language set to: $supported');
        return true;
      }
      return false;
    } catch (e) {
      if (kDebugMode) debugPrint('Error setting language: $e');
      return false;
    }
  }

  bool isLanguageSupported(String code) {
    // getLanguages puede devolver List<dynamic> de códigos tipo 'en-US'
    return _availableLanguages.any((e) => e.toString().toLowerCase() == code.toLowerCase());
  }

  /// Mapeo/normalización de códigos de idioma a formatos soportados por TTS
  String getSupportedLanguage(String languageCode) {
    final map = {
      'en': 'en-US',
      'es': 'es-ES',
      'fr': 'fr-FR',
      'de': 'de-DE',
      'it': 'it-IT',
      'pt': 'pt-BR',
      'ru': 'ru-RU',
      'zh': 'zh-CN',
      'ja': 'ja-JP',
      'ko': 'ko-KR',
      'ar': 'ar-SA',
      'hi': 'hi-IN',
    };

    // 1) exacto
    if (isLanguageSupported(languageCode)) return languageCode;

    // 2) mapeado directo (en -> en-US)
    final mapped = map[languageCode.toLowerCase()];
    if (mapped != null && isLanguageSupported(mapped)) return mapped;

    // 3) tomar base (en-GB -> en -> en-US)
    final base = languageCode.split('-').first.toLowerCase();
    final baseMapped = map[base];
    if (baseMapped != null && isLanguageSupported(baseMapped)) return baseMapped;

    // fallback
    return 'en-US';
  }

  /// Ajustes TTS
  Future<void> setVolume(double volume) async {
    if (!_isInitialized) await initialize();
    _volume = volume.clamp(0.0, 1.0);
    await _flutterTts.setVolume(_volume);
  }

  Future<void> setSpeechRate(double rate) async {
    if (!_isInitialized) await initialize();
    _rate = rate.clamp(0.0, 1.0);
    await _flutterTts.setSpeechRate(_rate);
  }

  Future<void> setPitch(double pitch) async {
    if (!_isInitialized) await initialize();
    _pitch = pitch.clamp(0.5, 2.0);
    await _flutterTts.setPitch(_pitch);
  }

  Future<List<String>> getAvailableLanguagesList() async {
    try {
      if (!_isInitialized) await initialize();
      final langs = await _flutterTts.getLanguages;
      return List<String>.from(langs ?? []);
    } catch (e) {
      if (kDebugMode) debugPrint('Error getting available languages: $e');
      return [];
    }
  }

  Map<String, dynamic> getAudioSettings() {
    return {
      'isInitialized': _isInitialized,
      'isSpeaking': _isSpeaking,
      'isPlaying': _isPlaying,
      'volume': _volume,
      'rate': _rate,
      'pitch': _pitch,
      'currentLanguage': _currentLanguage,
      'currentVoice': _currentVoice,
      'availableLanguagesCount': _availableLanguages.length,
      'availableVoicesCount': _availableVoices.length,
    };
  }

  /// Autotest rápido
  Future<Map<String, bool>> testAudio() async {
    final results = <String, bool>{};
    try {
      await initialize();
      results['initialization'] = _isInitialized;

      results['tts'] = await speakText('Hello, this is a test.');
      await Future.delayed(const Duration(seconds: 2));
      await stopSpeaking();

      results['languageChange'] = await setLanguage('es-ES');
      await setLanguage('en-US'); // back

      if (kDebugMode) debugPrint('Audio test results: $results');
      return results;
    } catch (e) {
      if (kDebugMode) debugPrint('Audio test failed: $e');
      results['error'] = false;
      return results;
    }
  }

  /// Liberar recursos
  Future<void> disposeService() async {
    await stop();
    await _audioPlayer.dispose();
    _isInitialized = false;
    if (kDebugMode) debugPrint('AudioService disposed');
  }
}
