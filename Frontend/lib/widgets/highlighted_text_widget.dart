import 'package:flutter/material.dart';
import '../models/highlighted_word.dart';
import '../utils/text_highlight_parser.dart';

/// Widget que muestra texto con palabras resaltadas
class HighlightedTextWidget extends StatefulWidget {
  final String text;
  final List<HighlightedWord>? highlights;
  final TextStyle? textStyle;
  final TextAlign textAlign;
  final int? maxLines;
  final TextOverflow overflow;
  final bool enableVocabularyHighlights;
  final bool enableGrammarHighlights;
  final Function(HighlightedWord)? onWordTap;
  final bool showTooltips;

  const HighlightedTextWidget({
    super.key,
    required this.text,
    this.highlights,
    this.textStyle,
    this.textAlign = TextAlign.start,
    this.maxLines,
    this.overflow = TextOverflow.clip,
    this.enableVocabularyHighlights = true,
    this.enableGrammarHighlights = false,
    this.onWordTap,
    this.showTooltips = true,
  });

  @override
  State<HighlightedTextWidget> createState() => _HighlightedTextWidgetState();
}

class _HighlightedTextWidgetState extends State<HighlightedTextWidget> {
  List<HighlightedWord> _allHighlights = [];

  @override
  void initState() {
    super.initState();
    _generateHighlights();
  }

  @override
  void didUpdateWidget(HighlightedTextWidget oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.text != widget.text ||
        oldWidget.highlights != widget.highlights ||
        oldWidget.enableVocabularyHighlights != widget.enableVocabularyHighlights ||
        oldWidget.enableGrammarHighlights != widget.enableGrammarHighlights) {
      _generateHighlights();
    }
  }

  void _generateHighlights() {
    final List<List<HighlightedWord>> highlightLists = [];

    // Agregar resaltados personalizados
    if (widget.highlights != null) {
      highlightLists.add(widget.highlights!);
    }

    // Agregar resaltados de vocabulario automáticos
    if (widget.enableVocabularyHighlights) {
      highlightLists.add(
        TextHighlightParser.createVocabularyHighlights(widget.text),
      );
    }

    // Agregar resaltados de gramática automáticos
    if (widget.enableGrammarHighlights) {
      highlightLists.add(
        TextHighlightParser.createGrammarHighlights(widget.text),
      );
    }

    // Combinar todos los resaltados evitando solapamientos
    _allHighlights = TextHighlightParser.combineHighlights(highlightLists);
  }

  void _handleWordTap(HighlightedWord word) {
    if (widget.onWordTap != null) {
      widget.onWordTap!(word);
    } else if (widget.showTooltips) {
      _showWordTooltip(word);
    }
  }

  void _showWordTooltip(HighlightedWord word) {
    if (word.definition == null && word.translation == null) return;

    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: Row(
            children: [
              Container(
                width: 12,
                height: 12,
                decoration: BoxDecoration(
                  color: word.type.color,
                  shape: BoxShape.circle,
                ),
              ),
              const SizedBox(width: 8),
              Text(
                word.word,
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const Spacer(),
              Chip(
                label: Text(
                  word.type.name,
                  style: const TextStyle(fontSize: 12),
                ),
                backgroundColor: word.type.color.withValues(alpha: 0.2),
              ),
            ],
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              if (word.definition != null) ...[
                const Text(
                  'Definición:',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 14,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  word.definition!,
                  style: const TextStyle(fontSize: 14),
                ),
                const SizedBox(height: 12),
              ],
              if (word.translation != null) ...[
                const Text(
                  'Traducción:',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 14,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  word.translation!,
                  style: const TextStyle(
                    fontSize: 14,
                    fontStyle: FontStyle.italic,
                  ),
                ),
              ],
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('Cerrar'),
            ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final spans = TextHighlightParser.parseTextWithHighlights(
      widget.text,
      _allHighlights,
      defaultStyle: widget.textStyle,
      onWordTap: _handleWordTap,
      highlightColor: Theme.of(context).colorScheme.primary,
    );

    return RichText(
      text: TextSpan(children: spans),
      textAlign: widget.textAlign,
      maxLines: widget.maxLines,
      overflow: widget.overflow,
    );
  }
}

/// Widget que muestra estadísticas de resaltado
class HighlightStatsWidget extends StatelessWidget {
  final List<HighlightedWord> highlights;

  const HighlightStatsWidget({
    super.key,
    required this.highlights,
  });

  @override
  Widget build(BuildContext context) {
    final stats = _calculateStats();

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(12.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Estadísticas de Resaltado',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            ...stats.entries.map((entry) => _buildStatRow(entry.key, entry.value)),
          ],
        ),
      ),
    );
  }

  Map<HighlightType, int> _calculateStats() {
    final Map<HighlightType, int> stats = {};
    
    for (final highlight in highlights) {
      stats[highlight.type] = (stats[highlight.type] ?? 0) + 1;
    }
    
    return stats;
  }

  Widget _buildStatRow(HighlightType type, int count) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 2.0),
      child: Row(
        children: [
          Container(
            width: 12,
            height: 12,
            decoration: BoxDecoration(
              color: type.color,
              shape: BoxShape.circle,
            ),
          ),
          const SizedBox(width: 8),
          Text(type.name),
          const Spacer(),
          Text(
            count.toString(),
            style: const TextStyle(fontWeight: FontWeight.bold),
          ),
        ],
      ),
    );
  }
}

/// Widget de configuración para resaltados
class HighlightConfigWidget extends StatefulWidget {
  final bool enableVocabulary;
  final bool enableGrammar;
  final Function(bool vocabulary, bool grammar) onConfigChanged;

  const HighlightConfigWidget({
    super.key,
    required this.enableVocabulary,
    required this.enableGrammar,
    required this.onConfigChanged,
  });

  @override
  State<HighlightConfigWidget> createState() => _HighlightConfigWidgetState();
}

class _HighlightConfigWidgetState extends State<HighlightConfigWidget> {
  late bool _enableVocabulary;
  late bool _enableGrammar;

  @override
  void initState() {
    super.initState();
    _enableVocabulary = widget.enableVocabulary;
    _enableGrammar = widget.enableGrammar;
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(12.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Configuración de Resaltado',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 8),
            SwitchListTile(
              title: const Text('Vocabulario'),
              subtitle: const Text('Resaltar palabras de vocabulario'),
              value: _enableVocabulary,
              activeThumbColor: HighlightType.vocabulary.color,
              activeTrackColor: HighlightType.vocabulary.color.withValues(alpha: 0.4),
              onChanged: (value) {
                setState(() => _enableVocabulary = value);
                widget.onConfigChanged(_enableVocabulary, _enableGrammar);
              },
            ),
            SwitchListTile(
              title: const Text('Gramática'),
              subtitle: const Text('Resaltar patrones gramaticales'),
              value: _enableGrammar,
              activeThumbColor: HighlightType.grammar.color,
              activeTrackColor: HighlightType.grammar.color.withValues(alpha: 0.4),
              onChanged: (value) {
                setState(() => _enableGrammar = value);
                widget.onConfigChanged(_enableVocabulary, _enableGrammar);
              },
            ),
          ],
        ),
      ),
    );
  }
}
