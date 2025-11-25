import 'package:flutter/material.dart';
import '../models/reading_highlighted_word.dart';
import 'package:flutter/gestures.dart';

class HighlightedText extends StatelessWidget {
  final String text;
  final List<ReadingHighlightedWord> highlightedWords;
  final TextStyle? textStyle;

  const HighlightedText({
    super.key,
    required this.text,
    required this.highlightedWords,
    this.textStyle,
  });

  @override
  Widget build(BuildContext context) {
    final defaultStyle = textStyle ?? const TextStyle(
      fontSize: 16,
      height: 1.6,
      color: Colors.black87,
    );

    // Remove ** markers from text
    final cleanText = text.replaceAll('**', '');

    if (highlightedWords.isEmpty) {
      return Text(
        cleanText,
        style: defaultStyle,
      );
    }

    return RichText(
      text: TextSpan(
        style: defaultStyle,
        children: _buildTextSpans(context, cleanText),
      ),
    );
  }

  List<TextSpan> _buildTextSpans(BuildContext context, String cleanText) {
    final List<TextSpan> spans = [];
    int lastIndex = 0;

    // Sort highlighted words by their position in text
    final sortedWords = List<ReadingHighlightedWord>.from(highlightedWords);
    sortedWords.sort((a, b) {
      final aIndex = cleanText.toLowerCase().indexOf(a.word.toLowerCase());
      final bIndex = cleanText.toLowerCase().indexOf(b.word.toLowerCase());
      return aIndex.compareTo(bIndex);
    });

    for (final highlightedWord in sortedWords) {
      // Find the word position in the text (case-insensitive)
      final wordIndex = cleanText.toLowerCase().indexOf(
        highlightedWord.word.toLowerCase(),
        lastIndex,
      );

      if (wordIndex == -1) continue;

      // Add normal text before the highlighted word
      if (wordIndex > lastIndex) {
        spans.add(TextSpan(
          text: cleanText.substring(lastIndex, wordIndex),
        ));
      }

      // Add highlighted word as tappable span
      final actualWord = cleanText.substring(
        wordIndex,
        wordIndex + highlightedWord.word.length,
      );

      final primaryColor = Theme.of(context).colorScheme.primary;

      spans.add(TextSpan(
        text: actualWord,
        style: TextStyle(
          color: primaryColor,
          fontWeight: FontWeight.w700,
          fontSize: (textStyle?.fontSize ?? 16) + 1,
        ),
        recognizer: TapGestureRecognizer()
          ..onTap = () => _showDefinitionDialog(context, highlightedWord),
      ));

      lastIndex = wordIndex + highlightedWord.word.length;
    }

    // Add remaining text
    if (lastIndex < cleanText.length) {
      spans.add(TextSpan(
        text: cleanText.substring(lastIndex),
      ));
    }

    return spans;
  }

  void _showDefinitionDialog(BuildContext context, ReadingHighlightedWord word) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ),
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: Colors.blue.shade100,
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(
                Icons.menu_book,
                color: Colors.blue,
                size: 24,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                word.word,
                style: const TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Definition:',
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.bold,
                color: Colors.grey,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              word.definition,
              style: const TextStyle(
                fontSize: 16,
                height: 1.5,
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Close'),
          ),
        ],
      ),
    );
  }
}