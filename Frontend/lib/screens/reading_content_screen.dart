import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:vibration/vibration.dart';
import '../providers/reading_content_provider.dart';
import '../providers/reading_chapters_provider.dart';
import '../providers/lives_provider.dart';
import '../models/reading_chapter.dart';
import '../widgets/highlighted_text.dart';
import '../l10n/app_localizations.dart';

class ReadingContentScreen extends StatefulWidget {
  final ReadingChapter chapter;

  const ReadingContentScreen({
    super.key,
    required this.chapter,
  });

  @override
  State<ReadingContentScreen> createState() => _ReadingContentScreenState();
}

class _ReadingContentScreenState extends State<ReadingContentScreen> {
  final ScrollController _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadContent();
    });
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  Future<void> _loadContent() async {
    final provider = Provider.of<ReadingContentProvider>(context, listen: false);
    await provider.fetchContent(widget.chapter.id);
  }

  void _scrollToTop() {
    // Use a small delay to ensure the scroll controller is attached
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          0,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final contentProvider = Provider.of<ReadingContentProvider>(context);

    return PopScope(
      canPop: false, // Evita que el sistema haga pop automáticamente
      onPopInvokedWithResult: (didPop, dynamic result) async {
        if (didPop) return; // Ya hizo pop, no hacer nada

        // Reemplazo de tu onWillPop
        if (contentProvider.isQuizMode) {
          final shouldPop = await _showExitQuizDialog(context);
          if (shouldPop && context.mounted) {
            Navigator.of(context).pop();
          }
        } else {
          if (context.mounted) {
            Navigator.of(context).pop();
          }
        }
      },
      child: Scaffold(
        appBar: AppBar(
          title: Text(widget.chapter.title),
          elevation: 0,
        ),
        body: Consumer<ReadingContentProvider>(
          builder: (context, provider, child) {
            if (provider.isLoading) {
              return const Center(
                child: CircularProgressIndicator(),
              );
            }

            if (provider.hasError) {
              return Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(
                      Icons.error_outline,
                      size: 64,
                      color: Colors.red,
                    ),
                    const SizedBox(height: 16),
                    Text(
                      provider.errorMessage ?? l10n.unknownError,
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 16),
                    ElevatedButton.icon(
                      onPressed: _loadContent,
                      icon: const Icon(Icons.refresh),
                      label: Text(l10n.retry),
                    ),
                  ],
                ),
              );
            }

            if (provider.content == null) {
              return const Center(child: Text('No content available'));
            }

            if (provider.isLoadingQuiz) {
              return Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const CircularProgressIndicator(),
                    const SizedBox(height: 16),
                    Text(l10n.loading, style: const TextStyle(fontSize: 16)),
                  ],
                ),
              );
            }

            return provider.isQuizMode
                ? _buildQuizView(provider)
                : _buildReadingView(provider);
          },
        ),
      ),
    );
  }

  Widget _buildReadingView(ReadingContentProvider provider) {
    final l10n = AppLocalizations.of(context)!;
    final theme = Theme.of(context);

    return Column(
      children: [
        // Page indicator - Redesigned
        Container(
          padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 20),
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [
                theme.colorScheme.primary.withValues(alpha: 0.1),
                theme.colorScheme.primary.withValues(alpha: 0.05),
              ],
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
            ),
          ),
          child: Column(
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    decoration: BoxDecoration(
                      color: theme.colorScheme.primary,
                      borderRadius: BorderRadius.circular(20),
                      boxShadow: [
                        BoxShadow(
                          color: theme.colorScheme.primary.withValues(alpha: 0.3),
                          blurRadius: 8,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: Text(
                      '${l10n.page} ${provider.currentPage + 1}/${provider.totalPages}',
                      style: TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.bold,
                        color: theme.colorScheme.onPrimary,
                      ),
                    ),
                  ),
                  // Level badge
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                    decoration: BoxDecoration(
                      color: _getLevelColor(provider.content!.level),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      provider.content!.level.toUpperCase(),
                      style: const TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              ClipRRect(
                borderRadius: BorderRadius.circular(10),
                child: LinearProgressIndicator(
                  value: (provider.currentPage + 1) / provider.totalPages,
                  backgroundColor: Colors.grey.shade300,
                  valueColor: AlwaysStoppedAnimation<Color>(theme.colorScheme.primary),
                  minHeight: 8,
                ),
              ),
            ],
          ),
        ),

        // Reading content - Redesigned
        Expanded(
          child: SingleChildScrollView(
            controller: _scrollController,
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Content card with gradient
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                      colors: [
                        theme.colorScheme.surface,
                        theme.colorScheme.surfaceContainerHighest.withValues(alpha: 0.3),
                      ],
                    ),
                    borderRadius: BorderRadius.circular(20),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.08),
                        blurRadius: 15,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Title with icon
                      Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              color: theme.colorScheme.primary.withValues(alpha: 0.1),
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: Icon(
                              Icons.menu_book_rounded,
                              color: theme.colorScheme.primary,
                              size: 24,
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Text(
                              provider.content!.title,
                              style: TextStyle(
                                fontSize: 22,
                                fontWeight: FontWeight.bold,
                                color: theme.colorScheme.onSurface,
                                height: 1.3,
                              ),
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 24),
                      // Divider
                      Container(
                        height: 2,
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            colors: [
                              theme.colorScheme.primary.withValues(alpha: 0.5),
                              theme.colorScheme.primary.withValues(alpha: 0.1),
                              Colors.transparent,
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: 24),
                      // Highlighted text content with improved styling
                      HighlightedText(
                        text: provider.currentPageContent,
                        highlightedWords: provider.currentPageHighlightedWords,
                        textStyle: TextStyle(
                          fontSize: 18,
                          height: 1.8,
                          letterSpacing: 0.3,
                          color: theme.colorScheme.onSurface.withValues(alpha: 0.9),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),

        // Navigation buttons
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.white,
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.1),
                blurRadius: 8,
                offset: const Offset(0, -2),
              ),
            ],
          ),
          child: Row(
            children: [
              // Previous button
              if (provider.currentPage > 0)
                Expanded(
                  child: OutlinedButton.icon(
                    onPressed: () {
                      provider.previousPage();
                      _scrollToTop();
                    },
                    icon: const Icon(Icons.arrow_back),
                    label: Text(l10n.previous),
                  ),
                ),
              if (provider.currentPage > 0) const SizedBox(width: 16),
              // Next/Start Quiz button
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: () => _onNextOrStartQuiz(provider),
                  icon: Icon(
                    provider.isLastPage ? Icons.quiz : Icons.arrow_forward,
                  ),
                  label: Text(
                    provider.isLastPage ? l10n.startQuiz : l10n.next,
                  ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildQuizView(ReadingContentProvider provider) {
    final l10n = AppLocalizations.of(context)!;
    final theme = Theme.of(context);
    final question = provider.currentQuestion;
    final livesProvider = Provider.of<LivesProvider>(context, listen: false);

    if (question == null) {
      return const Center(
        child: Text('No questions available'),
      );
    }

    return Column(
      children: [
        // Beautiful Quiz progress header
        Container(
          padding: const EdgeInsets.symmetric(vertical: 20, horizontal: 20),
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [
                theme.colorScheme.primary,
                theme.colorScheme.primary.withValues(alpha: 0.8),
              ],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            boxShadow: [
              BoxShadow(
                color: theme.colorScheme.primary.withValues(alpha: 0.3),
                blurRadius: 10,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Column(
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  // Question counter
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.2),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      '${l10n.question} ${provider.currentQuestionIndex + 1}/${provider.totalQuestions}',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: theme.colorScheme.onPrimary,
                      ),
                    ),
                  ),
                  // Lives display
                  Consumer<LivesProvider>(
                    builder: (context, livesProvider, child) {
                      return Row(
                        children: List.generate(livesProvider.currentLives, (index) {
                          return Padding(
                            padding: const EdgeInsets.only(left: 4),
                            child: Icon(
                              Icons.favorite,
                              color: Colors.red,
                              size: 24,
                            ),
                          );
                        }),
                      );
                    },
                  ),
                ],
              ),
              const SizedBox(height: 12),
              // Progress bar
              ClipRRect(
                borderRadius: BorderRadius.circular(10),
                child: LinearProgressIndicator(
                  value: (provider.currentQuestionIndex + 1) / provider.totalQuestions,
                  backgroundColor: Colors.white.withValues(alpha: 0.3),
                  valueColor: const AlwaysStoppedAnimation<Color>(Colors.white),
                  minHeight: 8,
                ),
              ),
            ],
          ),
        ),

        // Question content
        Expanded(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Question card
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                      colors: [
                        theme.colorScheme.surface,
                        theme.colorScheme.surfaceContainerHighest.withValues(alpha: 0.5),
                      ],
                    ),
                    borderRadius: BorderRadius.circular(20),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.08),
                        blurRadius: 15,
                        offset: const Offset(0, 4),
                      ),
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Question icon and text
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: theme.colorScheme.primary.withValues(alpha: 0.1),
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: Icon(
                              Icons.quiz,
                              color: theme.colorScheme.primary,
                              size: 28,
                            ),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: Text(
                              question.questionText,
                              style: TextStyle(
                                fontSize: 20,
                                fontWeight: FontWeight.bold,
                                color: theme.colorScheme.onSurface,
                                height: 1.4,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),

                // Options - Beautiful cards
                ...question.options.asMap().entries.map((entry) {
                  final index = entry.key;
                  final option = entry.value;
                  final isSelected = provider.userAnswers[provider.currentQuestionIndex] == index;

                  return Container(
                    margin: const EdgeInsets.only(bottom: 16),
                    child: InkWell(
                      onTap: () => _onAnswerSelected(index, provider, livesProvider),
                      borderRadius: BorderRadius.circular(16),
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 200),
                        padding: const EdgeInsets.all(20),
                        decoration: BoxDecoration(
                          gradient: isSelected
                              ? LinearGradient(
                                  colors: [
                                    theme.colorScheme.primary.withValues(alpha: 0.2),
                                    theme.colorScheme.primary.withValues(alpha: 0.1),
                                  ],
                                )
                              : null,
                          color: isSelected ? null : Colors.white,
                          border: Border.all(
                            color: isSelected
                                ? theme.colorScheme.primary
                                : Colors.grey.shade300,
                            width: isSelected ? 3 : 2,
                          ),
                          borderRadius: BorderRadius.circular(16),
                          boxShadow: isSelected
                              ? [
                                  BoxShadow(
                                    color: theme.colorScheme.primary.withValues(alpha: 0.3),
                                    blurRadius: 12,
                                    offset: const Offset(0, 4),
                                  ),
                                ]
                              : [
                                  BoxShadow(
                                    color: Colors.black.withValues(alpha: 0.05),
                                    blurRadius: 8,
                                    offset: const Offset(0, 2),
                                  ),
                                ],
                        ),
                        child: Row(
                          children: [
                            // Option letter
                            Container(
                              width: 40,
                              height: 40,
                              decoration: BoxDecoration(
                                color: isSelected
                                    ? theme.colorScheme.primary
                                    : Colors.grey.shade200,
                                shape: BoxShape.circle,
                              ),
                              child: Center(
                                child: Text(
                                  String.fromCharCode(65 + index), // A, B, C, D
                                  style: TextStyle(
                                    fontSize: 18,
                                    fontWeight: FontWeight.bold,
                                    color: isSelected
                                        ? Colors.white
                                        : Colors.grey.shade700,
                                  ),
                                ),
                              ),
                            ),
                            const SizedBox(width: 16),
                            Expanded(
                              child: Text(
                                option,
                                style: TextStyle(
                                  fontSize: 17,
                                  fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
                                  color: isSelected
                                      ? theme.colorScheme.primary
                                      : Colors.black87,
                                  height: 1.4,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  );
                }),

                // Hint - Only shown after first wrong attempt
                if (provider.showHint && question.hasExplanation)
                  TweenAnimationBuilder<double>(
                    tween: Tween(begin: 0.0, end: 1.0),
                    duration: const Duration(milliseconds: 500),
                    builder: (context, value, child) {
                      return Transform.scale(
                        scale: value,
                        child: Opacity(
                          opacity: value,
                          child: Container(
                            margin: const EdgeInsets.only(top: 20),
                            padding: const EdgeInsets.all(20),
                            decoration: BoxDecoration(
                              gradient: LinearGradient(
                                colors: [
                                  Colors.amber.shade100,
                                  Colors.amber.shade50,
                                ],
                              ),
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(
                                color: Colors.amber.shade700,
                                width: 2,
                              ),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.amber.withValues(alpha: 0.3),
                                  blurRadius: 12,
                                  offset: const Offset(0, 4),
                                ),
                              ],
                            ),
                            child: Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Icon(
                                  Icons.lightbulb,
                                  color: Colors.amber.shade900,
                                  size: 28,
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        'Hint',
                                        style: TextStyle(
                                          fontSize: 16,
                                          fontWeight: FontWeight.bold,
                                          color: Colors.amber.shade900,
                                        ),
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        question.hint,
                                        style: TextStyle(
                                          fontSize: 15,
                                          color: Colors.amber.shade900,
                                          height: 1.4,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      );
                    },
                  ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Color _getLevelColor(String level) {
    switch (level.toUpperCase()) {
      case 'BASIC':
        return Colors.green.shade100;
      case 'INTERMEDIATE':
        return Colors.orange.shade100;
      case 'ADVANCED':
        return Colors.red.shade100;
      default:
        return Colors.grey.shade100;
    }
  }

  Future<void> _onNextOrStartQuiz(ReadingContentProvider provider) async {
    if (provider.isLastPage) {
      await provider.startQuiz();

      // Check if there was an error loading quiz
      if (provider.errorMessage != null) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(provider.errorMessage!),
              backgroundColor: Colors.red,
            ),
          );
        }
      }
    } else {
      provider.nextPage();
      _scrollToTop();
    }
  }

  /// New method: Handle answer selection with vibration and life loss logic
  Future<void> _onAnswerSelected(
    int answerIndex,
    ReadingContentProvider provider,
    LivesProvider livesProvider,
  ) async {
    final result = await provider.submitAnswer(answerIndex);

    if (result == 'correct') {
      // Correct answer - auto advance to next question
      await Future.delayed(const Duration(milliseconds: 600));

      if (provider.isLastQuestion) {
        // Last question - submit quiz
        await _submitQuiz(provider);
      } else {
        // Move to next question
        provider.nextQuestion();
      }
    } else if (result == 'wrong_first_attempt') {
      // First wrong attempt - vibrate and show hint
      if (await Vibration.hasVibrator()) {
        Vibration.vibrate(duration: 500);
      }
      // Hint is automatically shown by provider
    } else if (result == 'wrong_second_attempt') {
      // Second wrong attempt - vibrate stronger, lose life, show animation
      if (await Vibration.hasVibrator()) {
        Vibration.vibrate(pattern: [0, 200, 100, 200]);
      }

      // Show life lost animation
      await _showLifeLostAnimation();

      // Consume a life
      await livesProvider.consumeLife();

      // Check if out of lives
      if (livesProvider.currentLives <= 0) {
        // Save progress and return to reading screen
        await _handleNoLivesRemaining(provider);
        return;
      }

      // Move to next question (only if not the last one)
      await Future.delayed(const Duration(milliseconds: 800));
      if (provider.isLastQuestion) {
        // Last question answered incorrectly - don't complete, just reset
        // User can retry the quiz later
        provider.resetQuiz();
        if (mounted) {
          Navigator.of(context).pop(); // Return to chapters screen
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Quiz not completed. Try again!'),
              backgroundColor: Colors.orange,
            ),
          );
        }
      } else {
        provider.nextQuestion();
      }
    }
  }

  /// Show life lost animation
  Future<void> _showLifeLostAnimation() async {
    showDialog(
      context: context,
      barrierDismissible: false,
      barrierColor: Colors.black.withValues(alpha: 0.7),
      builder: (context) => const LifeLostAnimationDialog(),
    );

    await Future.delayed(const Duration(milliseconds: 1500));
    if (mounted) Navigator.of(context).pop();
  }

  /// Handle no lives remaining - go back without completing
  Future<void> _handleNoLivesRemaining(ReadingContentProvider provider) async {

    // DO NOT submit quiz - user didn't complete it
    // Just exit and let them retry later with new lives

    if (!mounted) return;

    // Show dialog
    await showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
        ),
        title: Row(
          children: [
            const Icon(Icons.heart_broken, color: Colors.red, size: 32),
            const SizedBox(width: 12),
            const Expanded(
              child: Text(
                'No Lives Remaining',
                style: TextStyle(fontSize: 20),
              ),
            ),
          ],
        ),
        content: const Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              'You\'ve run out of lives! Your progress has been saved.',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 16),
            ),
            SizedBox(height: 16),
            Text(
              'Come back tomorrow to continue!',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 14,
                color: Colors.grey,
              ),
            ),
          ],
        ),
        actions: [
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context); // Close dialog
              Navigator.pop(context); // Go back to chapters
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: Theme.of(context).colorScheme.primary,
              minimumSize: const Size(double.infinity, 48),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
            child: const Text('Back to Reading'),
          ),
        ],
      ),
    );
  }

  Future<void> _submitQuiz(ReadingContentProvider provider) async {
    final l10n = AppLocalizations.of(context)!;

    // Show loading dialog
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => const Center(
        child: CircularProgressIndicator(),
      ),
    );

    final result = await provider.submitQuiz();

    // Close loading dialog
    if (mounted) Navigator.pop(context);

    if (!result['success']) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(result['error'] ?? l10n.unknownError),
            backgroundColor: Colors.red,
          ),
        );
      }
      return;
    }

    final score = result['score'] as int;
    final chapterCompleted = result['chapterCompleted'] as bool? ?? false;

    if (chapterCompleted) {
      if (!mounted) return;
      // Mark chapter as completed
      final chaptersProvider = Provider.of<ReadingChaptersProvider>(context, listen: false);
      await chaptersProvider.completeChapter(widget.chapter.id, score);

      // Show success dialog
      if (mounted) {
        _showSuccessDialog(score);
      }
    } else {
      if (!mounted) return;
      // Consume a life and show retry dialog
      final livesProvider = Provider.of<LivesProvider>(context, listen: false);
      await livesProvider.consumeLife();

      if (mounted) {
        _showRetryDialog(score);
      }
    }
  }

  void _showSuccessDialog(int score) {
    final l10n = AppLocalizations.of(context)!;

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        title: Row(
          children: [
            const Icon(Icons.check_circle, color: Colors.green, size: 32),
            const SizedBox(width: 8),
            Text(l10n.congratulations),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(l10n.chapterCompleted),
            const SizedBox(height: 16),
            Text(
              '${l10n.score}: $score/10',
              style: const TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: Colors.green,
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(context); // Close dialog
              Navigator.pop(context); // Go back to chapters screen
            },
            child: Text(l10n.backToChapters),
          ),
        ],
      ),
    );
  }

  void _showRetryDialog(int score) {
    final l10n = AppLocalizations.of(context)!;
    final livesProvider = Provider.of<LivesProvider>(context, listen: false);

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        title: Row(
          children: [
            const Icon(Icons.info_outline, color: Colors.orange, size: 32),
            const SizedBox(width: 8),
            Text(l10n.tryAgain),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(l10n.scoreNotEnough),
            const SizedBox(height: 16),
            Text(
              '${l10n.score}: $score/10',
              style: const TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
                color: Colors.orange,
              ),
            ),
            const SizedBox(height: 16),
            Text(
              '${l10n.livesRemaining}: ${livesProvider.currentLives}',
              style: const TextStyle(color: Colors.grey),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(context); // Close dialog
              Navigator.pop(context); // Go back to chapters screen
            },
            child: Text(l10n.backToChapters),
          ),
          if (livesProvider.currentLives > 0)
            ElevatedButton(
              onPressed: () {
                final contentProvider = Provider.of<ReadingContentProvider>(context, listen: false);
                contentProvider.resetQuiz();
                Navigator.pop(context); // Close dialog
              },
              child: Text(l10n.retry),
            ),
        ],
      ),
    );
  }

  Future<bool> _showExitQuizDialog(BuildContext context) async {
    final l10n = AppLocalizations.of(context)!;

    final result = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(l10n.exitQuiz),
        content: Text(l10n.exitQuizConfirmation),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: Text(l10n.cancel),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(context, true),
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.red,
            ),
            child: Text(l10n.exit),
          ),
        ],
      ),
    );

    return result ?? false;
  }
}

/// Life Lost Animation Dialog Widget
class LifeLostAnimationDialog extends StatefulWidget {
  const LifeLostAnimationDialog({super.key});

  @override
  State<LifeLostAnimationDialog> createState() => _LifeLostAnimationDialogState();
}

class _LifeLostAnimationDialogState extends State<LifeLostAnimationDialog>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _scaleAnimation;
  late Animation<double> _fadeAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(milliseconds: 1200),
      vsync: this,
    );

    _scaleAnimation = Tween<double>(begin: 0.0, end: 1.2).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.0, 0.6, curve: Curves.elasticOut),
      ),
    );

    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _controller,
        curve: const Interval(0.0, 0.3, curve: Curves.easeIn),
      ),
    );

    _controller.forward();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Center(
      child: AnimatedBuilder(
        animation: _controller,
        builder: (context, child) {
          return Transform.scale(
            scale: _scaleAnimation.value,
            child: Opacity(
              opacity: _fadeAnimation.value,
              child: Container(
                padding: const EdgeInsets.all(40),
                decoration: BoxDecoration(
                  color: Colors.white,
                  shape: BoxShape.circle,
                  boxShadow: [
                    BoxShadow(
                      color: Colors.red.withValues(alpha: 0.5),
                      blurRadius: 40,
                      spreadRadius: 10,
                    ),
                  ],
                ),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    TweenAnimationBuilder<double>(
                      tween: Tween(begin: 0.0, end: 1.0),
                      duration: const Duration(milliseconds: 800),
                      builder: (context, value, child) {
                        return Transform.rotate(
                          angle: value * 0.2,
                          child: Icon(
                            Icons.favorite_border,
                            color: Colors.red.withValues(alpha: 1 - value),
                            size: 80,
                          ),
                        );
                      },
                    ),
                    const SizedBox(height: 16),
                    const Text(
                      '-1 Life',
                      style: TextStyle(
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                        color: Colors.red,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}

