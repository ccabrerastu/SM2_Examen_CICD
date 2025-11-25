import 'package:flutter/material.dart';

/// Enum para definir los diferentes tipos de resaltado
enum HighlightType {
  vocabulary(color: Color(0xFF4CAF50), name: "Vocabulario"),
  grammar(color: Color(0xFF2196F3), name: "Gramática"),
  important(color: Color(0xFFFF9800), name: "Importante"),
  difficult(color: Color(0xFFF44336), name: "Difícil"),
  custom(color: Color(0xFF9C27B0), name: "Personalizado");

  const HighlightType({
    required this.color,
    required this.name,
  });

  final Color color;
  final String name;
}

/// Modelo para representar una palabra resaltada en el texto
class HighlightedWord {
  final String word;
  final int startIndex;
  final int endIndex;
  final HighlightType type;
  final String? definition;
  final String? translation;
  final bool isClickable;

  const HighlightedWord({
    required this.word,
    required this.startIndex,
    required this.endIndex,
    required this.type,
    this.definition,
    this.translation,
    this.isClickable = true,
  });

  /// Obtiene el color de resaltado basado en el tipo
  Color get highlightColor => type.color.withValues(alpha: 0.3);

  /// Obtiene el color del texto
  Color get textColor => type.color.withValues(alpha: 0.8);

  /// Crea una copia de la palabra resaltada con nuevos valores
  HighlightedWord copyWith({
    String? word,
    int? startIndex,
    int? endIndex,
    HighlightType? type,
    String? definition,
    String? translation,
    bool? isClickable,
  }) {
    return HighlightedWord(
      word: word ?? this.word,
      startIndex: startIndex ?? this.startIndex,
      endIndex: endIndex ?? this.endIndex,
      type: type ?? this.type,
      definition: definition ?? this.definition,
      translation: translation ?? this.translation,
      isClickable: isClickable ?? this.isClickable,
    );
  }

  /// Convierte el modelo a JSON
  Map<String, dynamic> toJson() {
    return {
      'word': word,
      'startIndex': startIndex,
      'endIndex': endIndex,
      'type': type.name,
      'definition': definition,
      'translation': translation,
      'isClickable': isClickable,
    };
  }

  /// Crea una instancia desde JSON
  factory HighlightedWord.fromJson(Map<String, dynamic> json) {
    return HighlightedWord(
      word: json['word'] as String,
      startIndex: json['startIndex'] as int,
      endIndex: json['endIndex'] as int,
      type: HighlightType.values.firstWhere(
        (type) => type.name == json['type'],
        orElse: () => HighlightType.custom,
      ),
      definition: json['definition'] as String?,
      translation: json['translation'] as String?,
      isClickable: json['isClickable'] as bool? ?? true,
    );
  }

  @override
  String toString() {
    return 'HighlightedWord(word: $word, type: ${type.name}, startIndex: $startIndex, endIndex: $endIndex)';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is HighlightedWord &&
        other.word == word &&
        other.startIndex == startIndex &&
        other.endIndex == endIndex &&
        other.type == type;
  }

  @override
  int get hashCode {
    return Object.hash(word, startIndex, endIndex, type);
  }
}

/// Configuración para el resaltado de texto
class HighlightConfig {
  final bool caseSensitive;
  final bool wholeWordsOnly;
  final List<String> wordsToIgnore;
  final Map<String, HighlightType> wordTypeMapping;

  const HighlightConfig({
    this.caseSensitive = false,
    this.wholeWordsOnly = true,
    this.wordsToIgnore = const [],
    this.wordTypeMapping = const {},
  });

  /// Configuración por defecto para vocabulario básico
  static const HighlightConfig defaultVocabulary = HighlightConfig(
    caseSensitive: false,
    wholeWordsOnly: true,
    wordsToIgnore: ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'],
    wordTypeMapping: {},
  );

  /// Configuración para resaltado de gramática
  static const HighlightConfig grammar = HighlightConfig(
    caseSensitive: false,
    wholeWordsOnly: false,
    wordsToIgnore: [],
    wordTypeMapping: {},
  );
}
