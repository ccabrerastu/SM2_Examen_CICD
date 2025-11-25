import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import '../providers/interview_provider.dart';
import '../providers/auth_provider.dart';
import '../providers/lives_provider.dart';
import '../models/interview_topic.dart';
import '../models/interview_session.dart';
import '../widgets/app_banner.dart';
import '../l10n/app_localizations.dart';
import 'interview_session_screen.dart';

class InterviewTopicsScreen extends StatefulWidget {
  const InterviewTopicsScreen({super.key});

  @override
  State<InterviewTopicsScreen> createState() => _InterviewTopicsScreenState();
}

class _InterviewTopicsScreenState extends State<InterviewTopicsScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<InterviewProvider>().loadTopics();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Theme.of(context).colorScheme.surfaceContainer,
      appBar: AppBar(
        toolbarHeight: 0,
        backgroundColor: Theme.of(context).colorScheme.primary,
        elevation: 0,
        systemOverlayStyle: SystemUiOverlayStyle(
          statusBarColor: Theme.of(context).colorScheme.primary,
          statusBarIconBrightness: Theme.of(context).brightness == Brightness.dark
              ? Brightness.light
              : Brightness.dark,
          statusBarBrightness: Theme.of(context).brightness,
        ),
      ),
      body: Column(
        children: [
          // Header - AppBanner
          Consumer2<AuthProvider, LivesProvider>(
            builder: (context, authProvider, livesProvider, child) {
              return AppBanner(
                title: AppLocalizations.of(context)!.interview,
                subtitle: AppLocalizations.of(context)!.chooseYourPreferredTopic,
                livesText: AppLocalizations.of(context)!.livesRemaining(livesProvider.currentLives),
              );
            },
          ),

          // Content
          Expanded(
            child: Consumer<InterviewProvider>(
        builder: (context, provider, child) {
          if (provider.state == InterviewState.loadingTopics) {
            return const Center(child: CircularProgressIndicator());
          }

          if (provider.state == InterviewState.error) {
            final l10n = AppLocalizations.of(context)!;
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.error_outline, size: 64, color: Colors.red),
                  const SizedBox(height: 16),
                  Text(provider.errorMessage ?? l10n.unknownError),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: () => provider.loadTopics(),
                    child: Text(l10n.retry),
                  ),
                ],
              ),
            );
          }

          if (provider.topics.isEmpty) {
            final l10n = AppLocalizations.of(context)!;
            return Center(child: Text(l10n.noTopicsAvailable));
          }

          return RefreshIndicator(
            onRefresh: () => provider.loadTopics(),
            child: ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: provider.topics.length,
              itemBuilder: (context, index) {
                final topic = provider.topics[index];
                return _TopicCard(topic: topic);
              },
            ),
          );
        },
            ),
          ),
        ],
      ),
    );
  }
}

class _TopicCard extends StatelessWidget {
  final InterviewTopic topic;

  const _TopicCard({required this.topic});

  IconData _getIconForTopic(String? iconName) {
    switch (iconName) {
      case 'javascript':
        return Icons.code;
      case 'python':
        return Icons.code_outlined;
      case 'database':
        return Icons.storage;
      case 'cloud':
        return Icons.cloud;
      default:
        return Icons.question_answer;
    }
  }

  Color _getColorForDifficulty(String difficulty) {
    switch (difficulty.toLowerCase()) {
      case 'beginner':
        return Colors.green;
      case 'intermediate':
        return Colors.orange;
      case 'advanced':
        return Colors.red;
      default:
        return Colors.blue;
    }
  }

  String _getDifficultyTranslation(BuildContext context, String difficulty) {
    final l10n = AppLocalizations.of(context)!;
    switch (difficulty.toLowerCase()) {
      case 'beginner':
        return l10n.beginner.toUpperCase();
      case 'intermediate':
        return l10n.intermediate.toUpperCase();
      case 'advanced':
        return l10n.advanced.toUpperCase();
      default:
        return difficulty.toUpperCase();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 4,
      margin: const EdgeInsets.only(bottom: 16),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: InkWell(
        onTap: () => _startInterview(context),
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              // Icon
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.blue.shade100,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(
                  _getIconForTopic(topic.iconName),
                  size: 32,
                  color: Colors.blue.shade700,
                ),
              ),
              const SizedBox(width: 16),
              // Content
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      topic.name,
                      style: const TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    if (topic.description != null) ...[
                      const SizedBox(height: 4),
                      Text(
                        topic.description!,
                        style: TextStyle(
                          fontSize: 14,
                          color: Colors.grey.shade600,
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                    const SizedBox(height: 8),
                    Builder(
                      builder: (context) {
                        final l10n = AppLocalizations.of(context)!;
                        return Row(
                          children: [
                            _buildBadge(
                              l10n.questionsCount(topic.totalQuestions),
                              Colors.blue,
                            ),
                            const SizedBox(width: 8),
                            _buildBadge(
                              l10n.durationMinutes(topic.estimatedDurationMinutes),
                              Colors.green,
                            ),
                            const SizedBox(width: 8),
                            _buildBadge(
                              _getDifficultyTranslation(context, topic.difficulty),
                              _getColorForDifficulty(topic.difficulty),
                            ),
                          ],
                        );
                      },
                    ),
                  ],
                ),
              ),
              const Icon(Icons.chevron_right),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildBadge(String text, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(4),
        border: Border.all(color: color.withValues(alpha: 0.3)),
      ),
      child: Text(
        text,
        style: TextStyle(
          fontSize: 12,
          color: _getShadeColor(color),
          fontWeight: FontWeight.w500,
        ),
      ),
    );
  }

  Color _getShadeColor(Color color) {
    // MaterialColor typically has shade700, but for other colors we darken them
    if (color is MaterialColor) {
      return color.shade700;
    }
    // For non-MaterialColor, return a darker version
      return Color.fromRGBO(
        (color.r * 255 * 0.7).round(),
        (color.g * 255 * 0.7).round(),
        (color.b * 255 * 0.7).round(),
        color.a,
      );
  }

  Future<void> _startInterview(BuildContext context) async {
    final provider = context.read<InterviewProvider>();
    final livesProvider = context.read<LivesProvider>();
    final l10n = AppLocalizations.of(context)!;

    // Check if user has lives available
    if (livesProvider.currentLives <= 0) {
      _showNoLivesDialog(context);
      return;
    }

    // FIRST: Check if there's an active session BEFORE showing any dialog
    final activeSession = await provider.checkActiveSession(topic.id);

    if (activeSession != null) {
      // Active session found - show active session dialog directly
      if (!context.mounted) return;
      _showActiveSessionDialog(context, provider, activeSession);
      return;
    }

    // No active session - show confirmation dialog to start new session
    if (!context.mounted) return;
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Text(l10n.startInterviewTitle(topic.name)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('${l10n.questions}: ${topic.totalQuestions}'),
            Text('${l10n.duration}: ~${topic.estimatedDurationMinutes} ${l10n.durationMinutes(1).split(' ').last}'),
            Text('${l10n.difficulty}: ${_getDifficultyTranslation(context, topic.difficulty)}'),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: Text(l10n.cancel),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(ctx);
              provider.startSession(topic.id).then((_) {
                if (!context.mounted) return;
                if (provider.hasActiveSession) {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => const InterviewSessionScreen(),
                    ),
                  );
                } else if (provider.state == InterviewState.error) {
                  // Show error
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text(provider.errorMessage ?? 'Unknown error'),
                      backgroundColor: Colors.red,
                    ),
                  );
                }
              });
            },
            child: Text(l10n.start),
          ),
        ],
      ),
    );
  }

  void _showActiveSessionDialog(
    BuildContext context,
    InterviewProvider provider,
    InterviewSession activeSession,
  ) {
    final l10n = AppLocalizations.of(context)!;

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => AlertDialog(
        title: Row(
          children: [
            const Icon(Icons.warning_amber_rounded, color: Colors.orange, size: 32),
            const SizedBox(width: 12),
            const Expanded(child: Text('Active Session Found')),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'You already have an active interview session for "${topic.name}".',
              style: const TextStyle(fontSize: 16),
            ),
            const SizedBox(height: 12),
            Text(
              'Progress: ${activeSession.currentQuestionIndex}/${activeSession.totalQuestions} questions',
              style: TextStyle(color: Colors.grey.shade700, fontSize: 14),
            ),
            const SizedBox(height: 16),
            const Text(
              'Would you like to:',
              style: TextStyle(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            Text('• Resume your previous session', style: TextStyle(color: Colors.grey.shade700)),
            Text('• Abandon it and start fresh', style: TextStyle(color: Colors.grey.shade700)),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: Text(l10n.cancel),
          ),
          TextButton(
            onPressed: () async {
              Navigator.pop(ctx);

              // Show loading indicator
              showDialog(
                context: context,
                barrierDismissible: false,
                builder: (loadingCtx) => const Center(
                  child: CircularProgressIndicator(),
                ),
              );

              // Abandon current session and start new one
              await provider.abandonAndRestart(topic.id);

              // Close loading indicator
              if (context.mounted) {
                Navigator.pop(context);
              }

              if (provider.hasActiveSession) {
                // Successfully started new session - navigate
                if (context.mounted) {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => const InterviewSessionScreen(),
                    ),
                  );
                }
              } else if (provider.state == InterviewState.error) {
                // Show error
                if (context.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text('Failed to restart: ${provider.errorMessage}'),
                      backgroundColor: Colors.red,
                    ),
                  );
                }
              }
            },
            style: TextButton.styleFrom(foregroundColor: Colors.red),
            child: const Text('Abandon & Restart'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(ctx);
              provider.resumeSession(topic.id).then((_) {
                if (!context.mounted) return;
                if (provider.hasActiveSession) {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => const InterviewSessionScreen(),
                    ),
                  );
                } else {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text('Failed to resume: ${provider.errorMessage}'),
                      backgroundColor: Colors.red,
                    ),
                  );
                }
              });
            },
            child: const Text('Resume Session'),
          ),
        ],
      ),
    );
  }

  void _showNoLivesDialog(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final livesProvider = context.read<LivesProvider>();

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: Row(
          children: [
            const Icon(Icons.heart_broken, color: Colors.red, size: 32),
            const SizedBox(width: 12),
            Text(l10n.noLivesTitle),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              l10n.noLivesMessage,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 16),
            if (livesProvider.nextReset != null)
              Text(
                l10n.nextResetAt(
                  DateTime.parse(livesProvider.nextReset!).toLocal().toString().split(' ')[1].substring(0, 5),
                ),
                style: const TextStyle(color: Colors.grey),
              ),
          ],
        ),
        actions: [
          ElevatedButton(
            onPressed: () => Navigator.pop(ctx),
            child: Text(l10n.understood),
          ),
        ],
      ),
    );
  }
}

