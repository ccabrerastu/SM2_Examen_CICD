import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/reading_provider.dart';
import '../providers/progress_provider.dart';
import '../l10n/app_localizations.dart';
import '../utils/audio_service.dart';
import '../widgets/highlighted_text_widget.dart';
import '../models/highlighted_word.dart';

class ReadingScreen extends StatelessWidget {
  final String chapterId;
  
  const ReadingScreen({super.key, this.chapterId = 'reading-chapter-1'});

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (context) => ReadingProvider(
        progressProvider: Provider.of<ProgressProvider>(context, listen: false),
        chapterId: chapterId,
      ),
      child: const _ReadingScreenContent(),
    );
  }
}

class _ReadingScreenContent extends StatefulWidget {
  const _ReadingScreenContent();

  @override
  State<_ReadingScreenContent> createState() => _ReadingScreenContentState();
}

class _ReadingScreenContentState extends State<_ReadingScreenContent> {
  final AudioService _audioService = AudioService();
  bool _isPlaying = false;
  bool _isPaused = false;
  double _speechRate = 0.5;
  double _volume = 1.0;
  
  // Variables para el resaltado de texto
  bool _enableVocabularyHighlights = true;
  bool _enableGrammarHighlights = false;
  bool _showHighlightConfig = false;

  @override
  void dispose() {
    _audioService.stop();
    super.dispose();
  }

  Future<void> _speakText(String text) async {
    if (_isPlaying) {
      await _audioService.stop();
      setState(() {
        _isPlaying = false;
        _isPaused = false;
      });
      return;
    }

    setState(() {
      _isPlaying = true;
      _isPaused = false;
    });

    await _audioService.setSpeechRate(_speechRate);
    await _audioService.setVolume(_volume);
    
    final success = await _audioService.speakText(text, language: 'en-US');
    
    if (mounted) {
      setState(() {
        _isPlaying = false;
        _isPaused = false;
      });
    }

    if (!success) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Error al reproducir audio'),
            duration: Duration(seconds: 2),
          ),
        );
      }
    }
  }

  Future<void> _pauseAudio() async {
    if (_isPlaying && !_isPaused) {
      await _audioService.pause();
      setState(() {
        _isPaused = true;
      });
    }
  }

  Future<void> _stopAudio() async {
    await _audioService.stop();
    setState(() {
      _isPlaying = false;
      _isPaused = false;
    });
  }

  void _onHighlightConfigChanged(bool vocabulary, bool grammar) {
    setState(() {
      _enableVocabularyHighlights = vocabulary;
      _enableGrammarHighlights = grammar;
    });
  }

  void _onWordTap(HighlightedWord word) {
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
            if (word.word.isNotEmpty)
              TextButton(
                onPressed: () {
                  Navigator.of(context).pop();
                  _speakText(word.word);
                },
                child: const Text('Pronunciar'),
              ),
          ],
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Theme.of(context).colorScheme.surface,
      appBar: AppBar(
        title: Text(AppLocalizations.of(context)?.reading ?? 'Reading'),
        backgroundColor: Theme.of(context).colorScheme.primary,
        foregroundColor: Theme.of(context).colorScheme.onPrimary,
        actions: [
          IconButton(
            icon: Icon(
              _showHighlightConfig ? Icons.highlight_off : Icons.highlight,
              color: Theme.of(context).colorScheme.onPrimary,
            ),
            onPressed: () {
              setState(() {
                _showHighlightConfig = !_showHighlightConfig;
              });
            },
            tooltip: _showHighlightConfig ? 'Ocultar configuración' : 'Configurar resaltado',
          ),
          Consumer<ReadingProvider>(
            builder: (context, readingProvider, child) {
              return Container(
                margin: const EdgeInsets.only(right: 16),
                child: Center(
                  child: Text(
                    '${readingProvider.completionPercentage.toStringAsFixed(0)}%',
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      color: Theme.of(context).colorScheme.onPrimary,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              );
            },
          ),
        ],
      ),
      body: Consumer<ReadingProvider>(
        builder: (context, readingProvider, child) {
          return Column(
            children: [
              // Chapter Header
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Theme.of(context).colorScheme.primaryContainer,
                  borderRadius: const BorderRadius.only(
                    bottomLeft: Radius.circular(16),
                    bottomRight: Radius.circular(16),
                  ),
                ),
                child: Column(
                  children: [
                    Text(
                      readingProvider.chapter.title,
                      style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                        color: Theme.of(context).colorScheme.onPrimaryContainer,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Paragraph ${readingProvider.currentParagraphIndex + 1} of ${readingProvider.chapter.paragraphs.length}',
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: Theme.of(context).colorScheme.onPrimaryContainer,
                      ),
                    ),
                    const SizedBox(height: 8),
                    LinearProgressIndicator(
                      value: readingProvider.readingProgress,
                      backgroundColor: Theme.of(context).colorScheme.outline.withValues(alpha: 0.3),
                      valueColor: AlwaysStoppedAnimation<Color>(
                        Theme.of(context).colorScheme.primary,
                      ),
                    ),
                  ],
                ),
              ),

              // Reading Content
              Expanded(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    children: [
                      // Paragraph Card
                      Card(
                        elevation: 2,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: Container(
                          width: double.infinity,
                          padding: const EdgeInsets.all(24),
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(16),
                            gradient: LinearGradient(
                              begin: Alignment.topLeft,
                              end: Alignment.bottomRight,
                              colors: [
                                Theme.of(context).colorScheme.surface,
                                Theme.of(context).colorScheme.surfaceContainerHighest,
                              ],
                            ),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                children: [
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                    decoration: BoxDecoration(
                                      color: Theme.of(context).colorScheme.primaryContainer,
                                      borderRadius: BorderRadius.circular(20),
                                    ),
                                    child: Text(
                                      'Paragraph ${readingProvider.currentParagraph.paragraphNumber}',
                                      style: Theme.of(context).textTheme.titleSmall?.copyWith(
                                        color: Theme.of(context).colorScheme.onPrimaryContainer,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ),
                                  Container(
                                    decoration: BoxDecoration(
                                      color: _isPlaying
                                          ? Theme.of(context).colorScheme.errorContainer
                                          : Theme.of(context).colorScheme.secondaryContainer,
                                      shape: BoxShape.circle,
                                    ),
                                    child: IconButton(
                                      onPressed: () => _speakText(readingProvider.currentParagraph.content),
                                      icon: Icon(
                                        _isPlaying ? Icons.stop : Icons.volume_up,
                                        color: _isPlaying
                                            ? Theme.of(context).colorScheme.onErrorContainer
                                            : Theme.of(context).colorScheme.onSecondaryContainer,
                                      ),
                                      tooltip: _isPlaying ? 'Detener lectura' : 'Leer en voz alta',
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 20),
                              HighlightedTextWidget(
                                text: readingProvider.currentParagraph.content,
                                textStyle: Theme.of(context).textTheme.bodyLarge?.copyWith(
                                  height: 1.8,
                                  fontSize: 17,
                                  letterSpacing: 0.3,
                                ),
                                enableVocabularyHighlights: _enableVocabularyHighlights,
                                enableGrammarHighlights: _enableGrammarHighlights,
                                onWordTap: _onWordTap,
                                showTooltips: false,
                              ),
                            ],
                          ),
                        ),
                      ),

                      const SizedBox(height: 24),

                      // Highlight Configuration
                      if (_showHighlightConfig) ...[
                        HighlightConfigWidget(
                          enableVocabulary: _enableVocabularyHighlights,
                          enableGrammar: _enableGrammarHighlights,
                          onConfigChanged: _onHighlightConfigChanged,
                        ),
                        const SizedBox(height: 16),
                      ],

                      // Reading Complete Message
                      if (readingProvider.isReadingComplete && !readingProvider.isQuizComplete) ...[
                        Card(
                          color: Theme.of(context).colorScheme.secondaryContainer,
                          child: Padding(
                            padding: const EdgeInsets.all(16),
                            child: Column(
                              children: [
                                Icon(
                                  Icons.menu_book,
                                  size: 48,
                                  color: Theme.of(context).colorScheme.secondary,
                                ),
                                const SizedBox(height: 8),
                                Text(
                                  'Reading Complete!',
                                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                                    color: Theme.of(context).colorScheme.onSecondaryContainer,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                const SizedBox(height: 8),
                                Text(
                                  'Now take the quiz to complete this chapter.',
                                  textAlign: TextAlign.center,
                                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                    color: Theme.of(context).colorScheme.onSecondaryContainer,
                                  ),
                                ),
                                const SizedBox(height: 16),
                                ElevatedButton.icon(
                                  onPressed: () => _showQuizDialog(context, readingProvider),
                                  icon: const Icon(Icons.quiz),
                                  label: const Text('Take Quiz'),
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: Theme.of(context).colorScheme.primary,
                                    foregroundColor: Theme.of(context).colorScheme.onPrimary,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ],

                      // Chapter Complete Message
                      if (readingProvider.isChapterComplete) ...[
                        Card(
                          color: Theme.of(context).colorScheme.primaryContainer,
                          child: Padding(
                            padding: const EdgeInsets.all(16),
                            child: Column(
                              children: [
                                Icon(
                                  Icons.celebration,
                                  size: 48,
                                  color: Theme.of(context).colorScheme.primary,
                                ),
                                const SizedBox(height: 8),
                                Text(
                                  'Chapter Complete! 🎉',
                                  style: Theme.of(context).textTheme.titleLarge?.copyWith(
                                    color: Theme.of(context).colorScheme.onPrimaryContainer,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                                const SizedBox(height: 8),
                                Text(
                                  'Quiz Score: ${readingProvider.quizScore}%',
                                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                                    color: Theme.of(context).colorScheme.onPrimaryContainer,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
              ),

              // Accessibility Controls
              if (_isPlaying || _isPaused)
                Container(
                  margin: const EdgeInsets.symmetric(horizontal: 16),
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Theme.of(context).colorScheme.surfaceContainerHighest,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Column(
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          IconButton(
                            onPressed: _stopAudio,
                            icon: const Icon(Icons.stop),
                            tooltip: 'Detener',
                          ),
                          const SizedBox(width: 16),
                          IconButton(
                            onPressed: _pauseAudio,
                            icon: Icon(_isPaused ? Icons.play_arrow : Icons.pause),
                            tooltip: _isPaused ? 'Reanudar' : 'Pausar',
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Row(
                        children: [
                          const Icon(Icons.speed),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Slider(
                              value: _speechRate,
                              min: 0.1,
                              max: 1.0,
                              divisions: 9,
                              label: '${(_speechRate * 100).round()}%',
                              onChanged: (value) {
                                setState(() {
                                  _speechRate = value;
                                });
                                _audioService.setSpeechRate(value);
                              },
                            ),
                          ),
                        ],
                      ),
                      Row(
                        children: [
                          const Icon(Icons.volume_up),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Slider(
                              value: _volume,
                              min: 0.0,
                              max: 1.0,
                              divisions: 10,
                              label: '${(_volume * 100).round()}%',
                              onChanged: (value) {
                                setState(() {
                                  _volume = value;
                                });
                                _audioService.setVolume(value);
                              },
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),

              // Navigation Controls
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Theme.of(context).colorScheme.surface,
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.05),
                      blurRadius: 10,
                      offset: const Offset(0, -2),
                    ),
                  ],
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: [
                    Expanded(
                      child: Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 4),
                        child: ElevatedButton.icon(
                          onPressed: readingProvider.currentParagraphIndex > 0
                              ? readingProvider.previousParagraph
                              : null,
                          icon: const Icon(Icons.arrow_back, size: 18),
                          label: const Text('Previous'),
                          style: ElevatedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(vertical: 12),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(12),
                            ),
                          ),
                        ),
                      ),
                    ),

                    if (!readingProvider.isReadingComplete)
                      Expanded(
                        child: Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 4),
                          child: ElevatedButton.icon(
                            onPressed: !readingProvider.isLastParagraph
                                ? readingProvider.nextParagraph
                                : () {
                                    readingProvider.nextParagraph();
                                  },
                            icon: Icon(
                              readingProvider.isLastParagraph ? Icons.check_circle : Icons.arrow_forward,
                              size: 18,
                            ),
                            label: Text(readingProvider.isLastParagraph ? 'Finish' : 'Next'),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: readingProvider.isLastParagraph
                                  ? Theme.of(context).colorScheme.primary
                                  : null,
                              foregroundColor: readingProvider.isLastParagraph
                                  ? Theme.of(context).colorScheme.onPrimary
                                  : null,
                              padding: const EdgeInsets.symmetric(vertical: 12),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                            ),
                          ),
                        ),
                      ),

                    if (readingProvider.isReadingComplete && !readingProvider.isQuizComplete)
                      Expanded(
                        child: Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 4),
                          child: ElevatedButton.icon(
                            onPressed: () => _showQuizDialog(context, readingProvider),
                            icon: const Icon(Icons.quiz, size: 18),
                            label: const Text('Start Quiz'),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Theme.of(context).colorScheme.primary,
                              foregroundColor: Theme.of(context).colorScheme.onPrimary,
                              padding: const EdgeInsets.symmetric(vertical: 12),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                            ),
                          ),
                        ),
                      ),
                  ],
                ),
              ),
            ],
          );
        },
      ),
    );
  }

  void _showQuizDialog(BuildContext context, ReadingProvider readingProvider) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (BuildContext context) {
        return AlertDialog(
          title: const Text('Reading Quiz'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text('Answer the following questions based on the reading:'),
              const SizedBox(height: 16),
              ...readingProvider.chapter.quizQuestions.asMap().entries.map(
                (entry) => Padding(
                  padding: const EdgeInsets.symmetric(vertical: 4),
                  child: Text('${entry.key + 1}. ${entry.value}'),
                ),
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () {
                // Simulate quiz completion with random score
                final score = 75 + (25 * (readingProvider.currentParagraphIndex / readingProvider.chapter.paragraphs.length)).round();
                readingProvider.completeQuiz(score);
                Navigator.of(context).pop();
              },
              child: const Text('Complete Quiz'),
            ),
          ],
        );
      },
    );
  }
}
