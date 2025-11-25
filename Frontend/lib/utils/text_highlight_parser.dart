import 'package:flutter/material.dart';
import 'package:flutter/gestures.dart';
import '../models/highlighted_word.dart';

/// Parser para convertir texto plano en texto con resaltados
class TextHighlightParser {
  /// Convierte texto plano en una lista de TextSpan con resaltados
  static List<TextSpan> parseTextWithHighlights(
    String text,
    List<HighlightedWord> highlights, {
    TextStyle? defaultStyle,
    Function(HighlightedWord)? onWordTap,
    Color? highlightColor,
  }) {
    // Remove asterisks from text
    final cleanText = text.replaceAll('*', '');

    if (highlights.isEmpty) {
      return [TextSpan(text: cleanText, style: defaultStyle)];
    }

    // Ordenar los resaltados por posición de inicio
    final sortedHighlights = List<HighlightedWord>.from(highlights)
      ..sort((a, b) => a.startIndex.compareTo(b.startIndex));

    final List<TextSpan> spans = [];
    int currentIndex = 0;

    // Use provided highlight color or fall back to deep purple
    final textColor = highlightColor ?? Colors.deepPurple;

    for (final highlight in sortedHighlights) {
      // Agregar texto antes del resaltado
      if (currentIndex < highlight.startIndex) {
        spans.add(TextSpan(
          text: cleanText.substring(currentIndex, highlight.startIndex),
          style: defaultStyle,
        ));
      }

      // Agregar el texto resaltado con color personalizado
      spans.add(TextSpan(
        text: cleanText.substring(highlight.startIndex, highlight.endIndex),
        style: defaultStyle?.copyWith(
          color: textColor,
          fontWeight: FontWeight.w600,
        ) ?? TextStyle(
          color: textColor,
          fontWeight: FontWeight.w600,
        ),
        recognizer: highlight.isClickable && onWordTap != null
            ? (TapGestureRecognizer()..onTap = () => onWordTap(highlight))
            : null,
      ));

      currentIndex = highlight.endIndex;
    }

    // Agregar texto restante después del último resaltado
    if (currentIndex < cleanText.length) {
      spans.add(TextSpan(
        text: cleanText.substring(currentIndex),
        style: defaultStyle,
      ));
    }

    return spans;
  }

  /// Encuentra palabras en el texto y crea resaltados automáticamente
  static List<HighlightedWord> findWordsToHighlight(
    String text,
    List<String> wordsToHighlight, {
    HighlightConfig config = HighlightConfig.defaultVocabulary,
    Map<String, String>? definitions,
    Map<String, String>? translations,
  }) {
    final List<HighlightedWord> highlights = [];
    
    for (final word in wordsToHighlight) {
      if (config.wordsToIgnore.contains(word.toLowerCase())) {
        continue;
      }

      final matches = _findWordMatches(text, word, config);
      
      for (final match in matches) {
        final highlightType = config.wordTypeMapping[word.toLowerCase()] ?? 
                            HighlightType.vocabulary;
        
        highlights.add(HighlightedWord(
          word: word,
          startIndex: match.start,
          endIndex: match.end,
          type: highlightType,
          definition: definitions?[word.toLowerCase()],
          translation: translations?[word.toLowerCase()],
        ));
      }
    }

    return highlights;
  }

  /// Encuentra todas las coincidencias de una palabra en el texto
  static List<Match> _findWordMatches(
    String text,
    String word,
    HighlightConfig config,
  ) {
    String pattern = word;
    
    if (config.wholeWordsOnly) {
      pattern = r'\b' + RegExp.escape(word) + r'\b';
    } else {
      pattern = RegExp.escape(word);
    }

    final regex = RegExp(
      pattern,
      caseSensitive: config.caseSensitive,
    );

    return regex.allMatches(text).toList();
  }

  /// Crea resaltados predefinidos para vocabulario común
  static List<HighlightedWord> createVocabularyHighlights(String text) {
    final vocabularyWords = {
      'adventure': {
        'type': HighlightType.vocabulary,
        'definition': 'An exciting or unusual experience',
        'translation': 'Aventura',
      },
      'curious': {
        'type': HighlightType.vocabulary,
        'definition': 'Eager to know or learn something',
        'translation': 'Curioso/a',
      },
      'mysterious': {
        'type': HighlightType.vocabulary,
        'definition': 'Difficult to understand or explain',
        'translation': 'Misterioso/a',
      },
      'journey': {
        'type': HighlightType.vocabulary,
        'definition': 'An act of traveling from one place to another',
        'translation': 'Viaje',
      },
      'determination': {
        'type': HighlightType.vocabulary,
        'definition': 'Firmness of purpose; resoluteness',
        'translation': 'Determinación',
      },
      'courage': {
        'type': HighlightType.vocabulary,
        'definition': 'The ability to do something that frightens one',
        'translation': 'Valor, coraje',
      },
      'resolve': {
        'type': HighlightType.vocabulary,
        'definition': 'Firm determination to do something',
        'translation': 'Resolución, determinación',
      },
    };

    final List<HighlightedWord> highlights = [];

    for (final entry in vocabularyWords.entries) {
      final word = entry.key;
      final data = entry.value;
      
      final matches = _findWordMatches(
        text,
        word,
        HighlightConfig.defaultVocabulary,
      );

      for (final match in matches) {
        highlights.add(HighlightedWord(
          word: word,
          startIndex: match.start,
          endIndex: match.end,
          type: data['type'] as HighlightType,
          definition: data['definition'] as String?,
          translation: data['translation'] as String?,
        ));
      }
    }

    return highlights;
  }

  /// Crea resaltados para patrones gramaticales
  static List<HighlightedWord> createGrammarHighlights(String text) {
    final grammarPatterns = {
      r'\b(was|were|is|are|am)\b': {
        'type': HighlightType.grammar,
        'definition': 'Verb "to be" - linking verb',
        'translation': 'Verbo "ser/estar"',
      },
      r'\b(had|has|have)\b': {
        'type': HighlightType.grammar,
        'definition': 'Auxiliary verb "to have"',
        'translation': 'Verbo auxiliar "haber/tener"',
      },
      r'\b\w+ed\b': {
        'type': HighlightType.grammar,
        'definition': 'Past tense verb (regular)',
        'translation': 'Verbo en pasado (regular)',
      },
    };

    final List<HighlightedWord> highlights = [];

    for (final entry in grammarPatterns.entries) {
      final pattern = entry.key;
      final data = entry.value;
      
      final regex = RegExp(pattern, caseSensitive: false);
      final matches = regex.allMatches(text);

      for (final match in matches) {
        highlights.add(HighlightedWord(
          word: text.substring(match.start, match.end),
          startIndex: match.start,
          endIndex: match.end,
          type: data['type'] as HighlightType,
          definition: data['definition'] as String?,
          translation: data['translation'] as String?,
        ));
      }
    }

    return highlights;
  }

  /// Combina múltiples tipos de resaltados evitando solapamientos
  static List<HighlightedWord> combineHighlights(
    List<List<HighlightedWord>> highlightLists,
  ) {
    final List<HighlightedWord> allHighlights = [];
    
    for (final list in highlightLists) {
      allHighlights.addAll(list);
    }

    // Ordenar por posición de inicio
    allHighlights.sort((a, b) => a.startIndex.compareTo(b.startIndex));

    // Eliminar solapamientos (prioridad al primer resaltado)
    final List<HighlightedWord> nonOverlapping = [];
    
    for (final highlight in allHighlights) {
      bool overlaps = false;
      
      for (final existing in nonOverlapping) {
        if (_highlightsOverlap(highlight, existing)) {
          overlaps = true;
          break;
        }
      }
      
      if (!overlaps) {
        nonOverlapping.add(highlight);
      }
    }

    return nonOverlapping;
  }

  /// Verifica si dos resaltados se solapan
  static bool _highlightsOverlap(HighlightedWord a, HighlightedWord b) {
    return !(a.endIndex <= b.startIndex || b.endIndex <= a.startIndex);
  }
}