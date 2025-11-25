import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/vocabulary_provider.dart';
import '../providers/progress_provider.dart';
import '../l10n/app_localizations.dart';

class VocabularyScreen extends StatelessWidget {
  final String chapterId;
  
  const VocabularyScreen({super.key, this.chapterId = 'vocab-chapter-1'});

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (context) => VocabularyProvider(
        progressProvider: Provider.of<ProgressProvider>(context, listen: false),
        chapterId: chapterId,
      ),
      child: const _VocabularyScreenContent(),
    );
  }
}

class _VocabularyScreenContent extends StatelessWidget {
  const _VocabularyScreenContent();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Theme.of(context).colorScheme.surface,
      appBar: AppBar(
        title: Text(AppLocalizations.of(context)?.vocabulary ?? 'Vocabulary'),
        backgroundColor: Theme.of(context).colorScheme.primary,
        foregroundColor: Theme.of(context).colorScheme.onPrimary,
      ),
      body: Consumer<VocabularyProvider>(
        builder: (context, vocabProvider, child) {
          return Column(
            children: [
              // Progress Header
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
                      'Progress: ${vocabProvider.wordsLearned}/${vocabProvider.words.length}',
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        color: Theme.of(context).colorScheme.onPrimaryContainer,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    LinearProgressIndicator(
                      value: vocabProvider.progress,
                      backgroundColor: Theme.of(context).colorScheme.outline.withValues(alpha: 0.3),
                      valueColor: AlwaysStoppedAnimation<Color>(
                        Theme.of(context).colorScheme.primary,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      '${vocabProvider.completionPercentage.toStringAsFixed(1)}% Complete',
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: Theme.of(context).colorScheme.onPrimaryContainer,
                      ),
                    ),
                  ],
                ),
              ),

              // Word Card
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Card(
                    elevation: 8,
                    child: Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(24),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        crossAxisAlignment: CrossAxisAlignment.center,
                        children: [
                          // Word
                          Text(
                            vocabProvider.currentWord.word,
                            style: Theme.of(context).textTheme.headlineLarge?.copyWith(
                              fontWeight: FontWeight.bold,
                              color: Theme.of(context).colorScheme.primary,
                            ),
                          ),
                          
                          const SizedBox(height: 8),
                          
                          // Pronunciation
                          Text(
                            vocabProvider.currentWord.pronunciation,
                            style: Theme.of(context).textTheme.titleMedium?.copyWith(
                              color: Theme.of(context).colorScheme.secondary,
                              fontStyle: FontStyle.italic,
                            ),
                          ),
                          
                          const SizedBox(height: 16),
                          
                          // Meaning
                          if (vocabProvider.isStudyMode) ...[
                            Container(
                              padding: const EdgeInsets.all(16),
                              decoration: BoxDecoration(
                                color: Theme.of(context).colorScheme.surfaceContainer,
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Text(
                                vocabProvider.currentWord.meaning,
                                style: Theme.of(context).textTheme.bodyLarge,
                                textAlign: TextAlign.center,
                              ),
                            ),
                            
                            const SizedBox(height: 24),
                            
                            // Examples
                            Text(
                              'Examples:',
                              style: Theme.of(context).textTheme.titleSmall?.copyWith(
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            
                            const SizedBox(height: 8),
                            
                            ...vocabProvider.currentWord.examples.map(
                              (example) => Padding(
                                padding: const EdgeInsets.symmetric(vertical: 4),
                                child: Text(
                                  '• $example',
                                  style: Theme.of(context).textTheme.bodyMedium,
                                  textAlign: TextAlign.center,
                                ),
                              ),
                            ),
                          ],
                        ],
                      ),
                    ),
                  ),
                ),
              ),

              // Control Buttons
              Container(
                padding: const EdgeInsets.all(16),
                child: Column(
                  children: [
                    // Study Mode Toggle
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text('Study Mode'),
                        Switch(
                          value: vocabProvider.isStudyMode,
                          onChanged: (_) => vocabProvider.toggleStudyMode(),
                        ),
                      ],
                    ),
                    
                    const SizedBox(height: 16),
                    
                    // Navigation Buttons
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                      children: [
                        ElevatedButton.icon(
                          onPressed: vocabProvider.currentWordIndex > 0
                              ? vocabProvider.previousWord
                              : null,
                          icon: const Icon(Icons.arrow_back),
                          label: const Text('Previous'),
                        ),
                        
                        ElevatedButton.icon(
                          onPressed: vocabProvider.wordsLearned < vocabProvider.currentWordIndex + 1
                              ? vocabProvider.markWordAsLearned
                              : null,
                          icon: const Icon(Icons.check),
                          label: const Text('Learned'),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Theme.of(context).colorScheme.primary,
                            foregroundColor: Theme.of(context).colorScheme.onPrimary,
                          ),
                        ),
                        
                        ElevatedButton.icon(
                          onPressed: !vocabProvider.isLastWord
                              ? vocabProvider.nextWord
                              : null,
                          icon: const Icon(Icons.arrow_forward),
                          label: const Text('Next'),
                        ),
                      ],
                    ),
                    
                    if (vocabProvider.wordsLearned >= vocabProvider.words.length) ...[
                      const SizedBox(height: 16),
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: Theme.of(context).colorScheme.primaryContainer,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              Icons.celebration,
                              color: Theme.of(context).colorScheme.primary,
                            ),
                            const SizedBox(width: 8),
                            Text(
                              'Chapter Complete! 🎉',
                              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                                color: Theme.of(context).colorScheme.primary,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}