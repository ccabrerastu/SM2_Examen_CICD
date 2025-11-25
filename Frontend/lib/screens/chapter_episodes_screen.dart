import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import '../providers/episode_provider.dart';
import '../models/episode.dart';
import '../widgets/app_banner.dart';
import '../widgets/episode_node.dart';
import '../widgets/progress_path.dart';
import '../widgets/episode_progress_indicator.dart';
import '../widgets/repeat_chapter_dialog.dart';
import '../l10n/app_localizations.dart';
import 'episode_screen.dart';

class ChapterEpisodesScreen extends StatefulWidget {
  final String chapterTitle;

  const ChapterEpisodesScreen({
    super.key,
    required this.chapterTitle,
  });

  @override
  State<ChapterEpisodesScreen> createState() => _ChapterEpisodesScreenState();
}

class _ChapterEpisodesScreenState extends State<ChapterEpisodesScreen>
    with TickerProviderStateMixin {
  late AnimationController _cascadeController;
  late List<Animation<double>> _cascadeAnimations;

  @override
  void initState() {
    super.initState();
    
    _cascadeController = AnimationController(
      duration: const Duration(milliseconds: 1000),
      vsync: this,
    );

    _cascadeAnimations = List.generate(5, (index) {
      final start = (index * 0.15).clamp(0.0, 0.6);
      final end = (start + 0.4).clamp(start, 1.0);
      
      return Tween<double>(
        begin: 0.0,
        end: 1.0,
      ).animate(CurvedAnimation(
        parent: _cascadeController,
        curve: Interval(start, end, curve: Curves.easeOutBack),
      ));
    });

    _cascadeController.forward();
  }

  @override
  void dispose() {
    _cascadeController.dispose();
    super.dispose();
  }

  /// Calcula las posiciones de los episodios en un patrón de cuadrantes (5 filas x 2 columnas)
  /// Los episodios se posicionan alternando entre columnas (zigzag)
  List<Offset> _getEpisodePositions(Size screenSize) {
    final width = screenSize.width;
    final height = screenSize.height;

    final positions = <Offset>[];
    const int rows = 5;
    const int cols = 2;

    // Padding desde los bordes
    const double horizontalPadding = 0.15; // 15% padding
    const double verticalPadding = 0.1;   // 10% padding

    // Espacio disponible para el grid
    final double availableWidth = width * (1 - 2 * horizontalPadding);
    final double availableHeight = height * (1 - 2 * verticalPadding);

    // Tamaño de cada cuadrante
    final double quadrantWidth = availableWidth / cols;
    final double quadrantHeight = availableHeight / rows;

    for (int i = 0; i < 10 && i < rows * cols; i++) {
      // Alternar entre columnas: 0, 1, 0, 1, 0...
      final int col = i % cols;
      final int row = i ~/ cols;

      // Posición X: centro del cuadrante correspondiente
      final double x = width * horizontalPadding +
                       (col + 0.5) * quadrantWidth;

      // Posición Y: centro del cuadrante correspondiente
      final double y = height * verticalPadding +
                       (row + 0.5) * quadrantHeight;

      positions.add(Offset(x, y));
    }

    return positions;
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
            AppBanner(
              title: widget.chapterTitle,
              subtitle: AppLocalizations.of(context)!.chapterProgress,
              livesText: AppLocalizations.of(context)!.livesRemaining(5),
            ),
            
            Expanded(
              child: Consumer<EpisodeProvider>(
                builder: (context, episodeProvider, child) {
                  return LayoutBuilder(
                    builder: (context, constraints) {
                      final screenSize = Size(constraints.maxWidth, constraints.maxHeight);
                      final positions = _getEpisodePositions(screenSize);
                      
                      return Stack(
                        children: [
                          Positioned.fill(
                            child: ProgressPath(
                              episodes: episodeProvider.currentChapter.episodes,
                              screenSize: screenSize,
                            ),
                          ),
                          
                          ...episodeProvider.currentChapter.episodes.asMap().entries.map((entry) {
                            final index = entry.key;
                            final episode = entry.value;
                            final position = positions[index];
                            
                            return AnimatedBuilder(
                              animation: _cascadeAnimations[index],
                              builder: (context, child) {
                                final animationValue = _cascadeAnimations[index].value.clamp(0.0, 1.0);
                                return Positioned(
                                  left: position.dx - 40,
                                  top: position.dy - 40,
                                  child: Transform.scale(
                                    scale: animationValue,
                                    child: Opacity(
                                      opacity: animationValue,
                                      child: EpisodeNode(
                                        episode: episode,
                                        onTap: () => _handleEpisodeTap(episodeProvider, episode),
                                      ),
                                    ),
                                  ),
                                );
                              },
                            );
                          }),
                        ],
                      );
                    },
                  );
                },
              ),
            ),
            
            // Bottom progress indicator
            Consumer<EpisodeProvider>(
              builder: (context, episodeProvider, child) {
                return EpisodeProgressIndicator(
                  episodes: episodeProvider.currentChapter.episodes,
                );
              },
            ),
            
            // Repeat chapter button (only show if chapter is completed)
            Consumer<EpisodeProvider>(
              builder: (context, episodeProvider, child) {
                final chapter = episodeProvider.currentChapter;
                final isChapterCompleted = chapter.completedEpisodes == chapter.totalEpisodes;
                
                if (!isChapterCompleted) return const SizedBox.shrink();
                
                return Container(
                  padding: const EdgeInsets.all(16),
                  child: SizedBox(
                    width: double.infinity,
                    child: ElevatedButton.icon(
                      onPressed: () => _handleRepeatChapter(episodeProvider),
                      icon: const Icon(Icons.refresh),
                      label: Text(AppLocalizations.of(context)!.repeatChapter),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Theme.of(context).colorScheme.secondaryContainer,
                        foregroundColor: Theme.of(context).colorScheme.onSecondaryContainer,
                        padding: const EdgeInsets.symmetric(vertical: 12),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                    ),
                  ),
                );
              },
            ),
          ],
        ),
      );
  }

  void _handleEpisodeTap(EpisodeProvider provider, Episode episode) {
    if (episode.status == EpisodeStatus.locked) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(AppLocalizations.of(context)!.completeePreviousEpisode),
          duration: const Duration(seconds: 2),
        ),
      );
    } else {
      provider.selectEpisode(episode.id);
      
      // Navigate to episode screen
      Navigator.push(
        context,
        MaterialPageRoute(
          builder: (context) => EpisodeScreen(episode: episode),
        ),
      );
    }
  }

  Future<void> _handleRepeatChapter(EpisodeProvider provider) async {
    final chapter = provider.currentChapter;
    
    // Calculate current score (mock calculation based on completed episodes)
    final currentScore = (chapter.overallProgress * 100).round();
    
    final shouldRepeat = await context.showRepeatChapterDialog(
      chapterTitle: chapter.title,
      currentScore: currentScore,
      onConfirm: () {
        // Analytics or logging could go here
        debugPrint('User confirmed chapter repetition: ${chapter.title}');
      },
      onCancel: () {
        // Analytics or logging could go here
        debugPrint('User cancelled chapter repetition: ${chapter.title}');
      },
    );

    if (shouldRepeat == true) {
      // Reset chapter progress for repetition (without affecting score)
      provider.resetChapterForRepetition(chapter.id);
      
      // Show confirmation message
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              AppLocalizations.of(context)!.chapterResetForRepetition(chapter.title),
            ),
            duration: const Duration(seconds: 3),
            backgroundColor: Theme.of(context).colorScheme.primaryContainer,
          ),
        );
      }
    }
  }
}