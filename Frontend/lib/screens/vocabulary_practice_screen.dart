import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../l10n/app_localizations.dart';
import '../providers/vocabulary_practice_provider.dart';
import '../models/vocabulary_chapter.dart';
import '../widgets/flashcard_widget.dart';

class VocabularyPracticeScreen extends StatefulWidget {
  final VocabularyChapter chapter;

  const VocabularyPracticeScreen({
    super.key,
    required this.chapter,
  });

  @override
  State<VocabularyPracticeScreen> createState() => _VocabularyPracticeScreenState();
}

class _VocabularyPracticeScreenState extends State<VocabularyPracticeScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<VocabularyPracticeProvider>(context, listen: false)
          .loadVocabularyItems(widget.chapter);
    });
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;

    return Scaffold(
      appBar: AppBar(
        title: Text(widget.chapter.title),
        actions: [
          Consumer<VocabularyPracticeProvider>(
            builder: (context, provider, child) {
              if (provider.state == VocabularyPracticeState.loaded ||
                  provider.state == VocabularyPracticeState.practicing) {
                return IconButton(
                  icon: const Icon(Icons.refresh),
                  onPressed: () {
                    showDialog(
                      context: context,
                      builder: (context) => AlertDialog(
                        title: Text(l10n.restart),
                        content: Text(l10n.restartPracticeConfirm),
                        actions: [
                          TextButton(
                            onPressed: () => Navigator.pop(context),
                            child: Text(l10n.cancel),
                          ),
                          TextButton(
                            onPressed: () {
                              provider.restart();
                              Navigator.pop(context);
                            },
                            child: Text(l10n.restart),
                          ),
                        ],
                      ),
                    );
                  },
                );
              }
              return const SizedBox.shrink();
            },
          ),
        ],
      ),
      body: Consumer<VocabularyPracticeProvider>(
        builder: (context, provider, child) {
          if (provider.state == VocabularyPracticeState.loading) {
            return const Center(child: CircularProgressIndicator());
          }

          if (provider.state == VocabularyPracticeState.error) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.error_outline, size: 64, color: Colors.red.shade300),
                  const SizedBox(height: 16),
                  Text(
                    l10n.error,
                    style: Theme.of(context).textTheme.headlineSmall,
                  ),
                  const SizedBox(height: 8),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 32),
                    child: Text(
                      provider.errorMessage ?? l10n.unknownError,
                      textAlign: TextAlign.center,
                      style: Theme.of(context).textTheme.bodyMedium,
                    ),
                  ),
                  const SizedBox(height: 24),
                  ElevatedButton.icon(
                    onPressed: () => provider.loadVocabularyItems(widget.chapter),
                    icon: const Icon(Icons.refresh),
                    label: Text(l10n.retry),
                  ),
                ],
              ),
            );
          }

          if (provider.state == VocabularyPracticeState.completed ||
              provider.isCompleted) {
            return _buildCompletedView(context, provider, l10n);
          }

          if (provider.currentItem == null) {
            return Center(
              child: Text(
                l10n.noVocabularyItems,
                style: Theme.of(context).textTheme.bodyLarge,
              ),
            );
          }

          return Column(
            children: [
              // Progress indicator
              _buildProgressIndicator(provider),

              // Flashcard
              Expanded(
                child: Center(
                  child: FlashcardWidget(
                    item: provider.currentItem!,
                    showTranslation: provider.showTranslation,
                    onFlip: () => provider.toggleTranslation(),
                  ),
                ),
              ),

              // Controls
              _buildControls(context, provider, l10n),
            ],
          );
        },
      ),
    );
  }

  Widget _buildProgressIndicator(VocabularyPracticeProvider provider) {
    return Container(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                '${provider.currentIndex + 1} / ${provider.totalItems}',
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                ),
              ),
              Text(
                '${(provider.progress * 100).toInt()}%',
                style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: Colors.green,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          LinearProgressIndicator(
            value: provider.progress,
            backgroundColor: Colors.grey.shade300,
            valueColor: const AlwaysStoppedAnimation<Color>(Colors.green),
          ),
        ],
      ),
    );
  }

  Widget _buildControls(
    BuildContext context,
    VocabularyPracticeProvider provider,
    AppLocalizations l10n,
  ) {
    return Container(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          // Know/Don't Know buttons
          if (provider.showTranslation)
            Row(
              children: [
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: () {
                      provider.markAsNotLearned();
                      provider.nextItem();
                    },
                    icon: const Icon(Icons.close),
                    label: Text(l10n.dontKnow),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.red.shade400,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 12),
                    ),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: ElevatedButton.icon(
                    onPressed: () {
                      provider.markAsLearned();
                      provider.nextItem();
                    },
                    icon: const Icon(Icons.check),
                    label: Text(l10n.iKnow),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.green.shade400,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 12),
                    ),
                  ),
                ),
              ],
            ),

          // Navigation buttons
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              IconButton(
                onPressed: provider.currentIndex > 0
                    ? () => provider.previousItem()
                    : null,
                icon: const Icon(Icons.arrow_back),
                iconSize: 32,
              ),
              if (!provider.showTranslation)
                ElevatedButton(
                  onPressed: () => provider.toggleTranslation(),
                  child: Text(l10n.showAnswer),
                ),
              IconButton(
                onPressed: provider.currentIndex < provider.totalItems - 1
                    ? () => provider.nextItem()
                    : null,
                icon: const Icon(Icons.arrow_forward),
                iconSize: 32,
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildCompletedView(
    BuildContext context,
    VocabularyPracticeProvider provider,
    AppLocalizations l10n,
  ) {
    final score = provider.totalItems > 0
        ? (provider.correctAnswers / provider.totalItems * 100).toInt()
        : 0;

    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.celebration,
              size: 100,
              color: Colors.amber.shade400,
            ),
            const SizedBox(height: 24),
            Text(
              l10n.practiceCompleted,
              style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 32),
            _buildStatCard(
              l10n.score,
              '$score%',
              Colors.blue.shade400,
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(
                  child: _buildStatCard(
                    l10n.correct,
                    '${provider.correctAnswers}',
                    Colors.green.shade400,
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: _buildStatCard(
                    l10n.incorrect,
                    '${provider.incorrectAnswers}',
                    Colors.red.shade400,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 32),
            ElevatedButton.icon(
              onPressed: () => provider.restart(),
              icon: const Icon(Icons.refresh),
              label: Text(l10n.practiceAgain),
              style: ElevatedButton.styleFrom(
                padding: const EdgeInsets.symmetric(
                  horizontal: 32,
                  vertical: 16,
                ),
              ),
            ),
            const SizedBox(height: 12),
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: Text(l10n.backToChapters),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatCard(String label, String value, Color color) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color, width: 2),
      ),
      child: Column(
        children: [
          Text(
            value,
            style: TextStyle(
              fontSize: 32,
              fontWeight: FontWeight.bold,
              color: color,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            label,
            style: TextStyle(
              fontSize: 14,
              color: Colors.grey.shade700,
            ),
          ),
        ],
      ),
    );
  }
}

