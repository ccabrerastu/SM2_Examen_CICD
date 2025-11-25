import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import '../providers/reading_chapters_provider.dart';
import '../providers/lives_provider.dart';
import '../providers/auth_provider.dart';
import '../models/reading_chapter.dart';
import '../widgets/reading_chapter_card.dart';
import '../widgets/app_banner.dart';
import '../l10n/app_localizations.dart';
import 'reading_content_screen.dart';

class ReadingChaptersScreen extends StatefulWidget {
  const ReadingChaptersScreen({super.key});

  @override
  State<ReadingChaptersScreen> createState() => _ReadingChaptersScreenState();
}

class _ReadingChaptersScreenState extends State<ReadingChaptersScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) {
        _loadChapters();
      }
    });
  }

  Future<void> _loadChapters() async {
    if (!mounted) return;
    try {
      final provider = Provider.of<ReadingChaptersProvider>(context, listen: false);
      await provider.fetchChapters();
    } catch (e) {
      debugPrint('Error loading reading chapters: $e');
    }
  }

  Future<void> _refreshChapters() async {
    if (!mounted) return;
    final provider = Provider.of<ReadingChaptersProvider>(context, listen: false);
    await provider.refreshChapters();
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    Provider.of<ReadingChaptersProvider>(context);
    final livesProvider = Provider.of<LivesProvider>(context);
    Provider.of<AuthProvider>(context);

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
      body: RefreshIndicator(
        onRefresh: _refreshChapters,
        child: Consumer<ReadingChaptersProvider>(
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
                      style: const TextStyle(fontSize: 16),
                    ),
                    const SizedBox(height: 16),
                    ElevatedButton.icon(
                      onPressed: _loadChapters,
                      icon: const Icon(Icons.refresh),
                      label: Text(l10n.retry),
                    ),
                  ],
                ),
              );
            }

            if (provider.chapters.isEmpty) {
              return Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(
                      Icons.menu_book_outlined,
                      size: 64,
                      color: Colors.grey,
                    ),
                    const SizedBox(height: 16),
                    Text(
                      l10n.noChaptersAvailable,
                      style: const TextStyle(fontSize: 16),
                    ),
                  ],
                ),
              );
            }

            return Column(
              children: [
                // App Banner Header
                AppBanner(
                  title: l10n.reading,
                  subtitle: l10n.readingPracticeSubtitle,
                  livesText: l10n.livesRemaining(livesProvider.currentLives),
                ),

                // Content
                Expanded(
                  child: CustomScrollView(
                    slivers: [
                      // Progress Header
                      SliverToBoxAdapter(
                        child: _buildProgressHeader(provider),
                      ),

                      // Chapters Grid
                      SliverPadding(
                        padding: const EdgeInsets.all(16),
                        sliver: SliverGrid(
                          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                            crossAxisCount: 2,
                            crossAxisSpacing: 16,
                            mainAxisSpacing: 16,
                            childAspectRatio: 0.75,
                          ),
                          delegate: SliverChildBuilderDelegate(
                            (context, index) {
                              final chapter = provider.chapters[index];
                              return ReadingChapterCard(
                                chapter: chapter,
                                onTap: () => _onChapterTap(context, chapter),
                              );
                            },
                            childCount: provider.chapters.length,
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
      ),
    );
  }

  Widget _buildProgressHeader(ReadingChaptersProvider provider) {
    return Container(
      margin: const EdgeInsets.all(16),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            Colors.blue.shade700,
            Colors.blue.shade500,
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.blue.withValues(alpha: 0.3),
            blurRadius: 8,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        children: [
          const Icon(
            Icons.menu_book,
            size: 48,
            color: Colors.white,
          ),
          const SizedBox(height: 12),
          Text(
            '${provider.completedChapters}/${provider.totalChapters}',
            style: const TextStyle(
              fontSize: 32,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            AppLocalizations.of(context)!.chaptersCompleted,
            style: const TextStyle(
              fontSize: 14,
              color: Colors.white70,
            ),
          ),
          const SizedBox(height: 16),
          ClipRRect(
            borderRadius: BorderRadius.circular(8),
            child: LinearProgressIndicator(
              value: provider.overallProgress / 100,
              backgroundColor: Colors.white30,
              valueColor: const AlwaysStoppedAnimation<Color>(Colors.white),
              minHeight: 8,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            '${provider.overallProgress.toStringAsFixed(0)}% ${AppLocalizations.of(context)!.completed}',
            style: const TextStyle(
              fontSize: 12,
              color: Colors.white70,
            ),
          ),
        ],
      ),
    );
  }

  void _onChapterTap(BuildContext context, ReadingChapter chapter) {
    final l10n = AppLocalizations.of(context)!;
    final livesProvider = Provider.of<LivesProvider>(context, listen: false);

    // Check if chapter is locked
    if (!chapter.isUnlocked) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(l10n.chapterLocked),
          backgroundColor: Colors.orange,
        ),
      );
      return;
    }

    // Check if user has lives
    if (livesProvider.currentLives == 0) {
      _showNoLivesDialog(context);
      return;
    }

    // Navigate to reading content screen
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => ReadingContentScreen(chapter: chapter),
      ),
    );
  }

  void _showNoLivesDialog(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final livesProvider = Provider.of<LivesProvider>(context, listen: false);

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Row(
          children: [
            const Icon(Icons.favorite_border, color: Colors.red),
            const SizedBox(width: 8),
            Text(l10n.noLives),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(l10n.noLivesMessage),
            const SizedBox(height: 16),
            if (livesProvider.nextReset != null)
              Text(
                '${l10n.nextReset}: ${livesProvider.nextReset}',
                style: const TextStyle(
                  fontSize: 12,
                  color: Colors.grey,
                ),
              ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text(l10n.ok),
          ),
        ],
      ),
    );
  }
}

