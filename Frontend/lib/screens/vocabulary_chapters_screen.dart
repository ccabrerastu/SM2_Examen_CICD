import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../providers/vocabulary_chapters_provider.dart';
import '../providers/lives_provider.dart';
import '../providers/auth_provider.dart';
import '../models/vocabulary_chapter.dart';
import '../l10n/app_localizations.dart';
import '../widgets/vocabulary_chapter_card.dart';
import '../widgets/app_banner.dart';
import 'vocabulary_practice_screen.dart';

class VocabularyChaptersScreen extends StatefulWidget {
  const VocabularyChaptersScreen({super.key});

  @override
  State<VocabularyChaptersScreen> createState() => _VocabularyChaptersScreenState();
}

class _VocabularyChaptersScreenState extends State<VocabularyChaptersScreen>
    with TickerProviderStateMixin {
  late AnimationController _progressAnimationController;
  late AnimationController _listAnimationController;
  late Animation<double> _progressAnimation;
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _setupAnimations();
    _loadInitialData();
  }

  void _setupAnimations() {
    _progressAnimationController = AnimationController(
      duration: const Duration(milliseconds: 1500),
      vsync: this,
    );
    
    _listAnimationController = AnimationController(
      duration: const Duration(milliseconds: 800),
      vsync: this,
    );

    _progressAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _progressAnimationController,
      curve: Curves.easeOutCubic,
    ));
  }

  Future<void> _loadInitialData() async {
    if (!mounted) return;

    setState(() => _isLoading = true);

    // Lives status is automatically managed by LivesProvider
    // (fetched on init and refreshed periodically)

    // Load chapters
    if (mounted) {
      final chaptersProvider = context.read<VocabularyChaptersProvider>();
      await chaptersProvider.loadChapters();
    }

    if (mounted) {
      setState(() => _isLoading = false);
      _progressAnimationController.forward();
      _listAnimationController.forward();
    }
  }

  @override
  void dispose() {
    _progressAnimationController.dispose();
    _listAnimationController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    final theme = Theme.of(context);

    return Scaffold(
      backgroundColor: theme.colorScheme.surfaceContainer,
      appBar: AppBar(
        toolbarHeight: 0,
        backgroundColor: theme.colorScheme.primary,
        elevation: 0,
        systemOverlayStyle: SystemUiOverlayStyle(
          statusBarColor: theme.colorScheme.primary,
          statusBarIconBrightness: theme.brightness == Brightness.dark
              ? Brightness.light
              : Brightness.dark,
          statusBarBrightness: theme.brightness,
        ),
      ),
      body: Column(
        children: [
          // App Banner (reusable header from main menu)
          Consumer2<AuthProvider, LivesProvider>(
            builder: (context, authProvider, livesProvider, child) {
              return AppBanner(
                title: l10n.vocabularyChaptersTitle,
                subtitle: authProvider.user?.name ?? l10n.user,
                livesText: l10n.livesRemaining(livesProvider.currentLives),
              );
            },
          ),

          // Content
          Expanded(
            child: Consumer<VocabularyChaptersProvider>(
              builder: (context, chaptersProvider, child) {
                if (_isLoading || chaptersProvider.isLoading) {
                  return _buildLoadingState(l10n);
                }

                if (chaptersProvider.state == VocabularyChaptersState.error) {
                  return _buildErrorState(l10n, chaptersProvider, theme);
                }

                if (!chaptersProvider.hasData || chaptersProvider.chapters.isEmpty) {
                  return _buildEmptyState(l10n, theme);
                }

                return _buildChaptersList(chaptersProvider, l10n, theme);
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildLoadingState(AppLocalizations l10n) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const CircularProgressIndicator(),
          const SizedBox(height: 16),
          Text(
            l10n.loadingVocabularyChapters,
            style: Theme.of(context).textTheme.bodyLarge,
          ),
        ],
      ),
    );
  }

  Widget _buildErrorState(
    AppLocalizations l10n,
    VocabularyChaptersProvider chaptersProvider,
    ThemeData theme,
  ) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.error_outline,
              size: 64,
              color: theme.colorScheme.error,
            ),
            const SizedBox(height: 16),
            Text(
              l10n.errorLoadingChapters,
              style: theme.textTheme.headlineSmall,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            Text(
              chaptersProvider.errorMessage ?? l10n.unknownError,
              style: theme.textTheme.bodyMedium,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                OutlinedButton.icon(
                  onPressed: () => chaptersProvider.clearError(),
                  icon: const Icon(Icons.clear),
                  label: Text(l10n.dismiss),
                ),
                const SizedBox(width: 16),
                FilledButton.icon(
                  onPressed: _handleRefresh,
                  icon: const Icon(Icons.refresh),
                  label: Text(l10n.tryAgain),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyState(AppLocalizations l10n, ThemeData theme) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.book_outlined,
              size: 64,
              color: theme.colorScheme.primary.withValues(alpha: 0.5),
            ),
            const SizedBox(height: 16),
            Text(
              l10n.noChaptersAvailable,
              style: theme.textTheme.headlineSmall,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            Text(
              l10n.noChaptersDescription,
              style: theme.textTheme.bodyMedium,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 24),
            FilledButton.icon(
              onPressed: _handleRefresh,
              icon: const Icon(Icons.refresh),
              label: Text(l10n.refresh),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildChaptersList(
    VocabularyChaptersProvider chaptersProvider,
    AppLocalizations l10n,
    ThemeData theme,
  ) {
    return RefreshIndicator(
      onRefresh: _handleRefresh,
      child: CustomScrollView(
        slivers: [
          // Progress header
          _buildProgressHeader(chaptersProvider, l10n, theme),
          
          // Chapters grid
          SliverPadding(
            padding: const EdgeInsets.all(16.0),
            sliver: SliverAnimatedGrid(
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                crossAxisSpacing: 12,
                mainAxisSpacing: 12,
                childAspectRatio: 0.85,
              ),
              itemCount: chaptersProvider.chapters.length,
              itemBuilder: (context, index, animation) {
                final chapter = chaptersProvider.chapters[index];
                
                return SlideTransition(
                  position: animation.drive(
                    Tween<Offset>(
                      begin: const Offset(0, 0.3),
                      end: Offset.zero,
                    ).chain(CurveTween(curve: Curves.easeOut)),
                  ),
                  child: FadeTransition(
                    opacity: animation,
                    child: VocabularyChapterCard(
                      chapter: chapter,
                      onTap: () => _handleChapterTap(chapter),
                      animationDelay: Duration(milliseconds: index * 100),
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildProgressHeader(
    VocabularyChaptersProvider chaptersProvider,
    AppLocalizations l10n,
    ThemeData theme,
  ) {
    return SliverToBoxAdapter(
      child: Container(
        margin: const EdgeInsets.all(16.0),
        padding: const EdgeInsets.all(20.0),
        decoration: BoxDecoration(
          color: theme.colorScheme.primaryContainer,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: theme.colorScheme.shadow.withValues(alpha: 0.1),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  l10n.yourProgress,
                  style: theme.textTheme.titleLarge?.copyWith(
                    color: theme.colorScheme.onPrimaryContainer,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                  decoration: BoxDecoration(
                    color: theme.colorScheme.primary.withValues(alpha: 0.2),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    '${chaptersProvider.completedChapters}/${chaptersProvider.totalChapters}',
                    style: theme.textTheme.labelLarge?.copyWith(
                      color: theme.colorScheme.primary,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            
            // Animated progress bar
            AnimatedBuilder(
              animation: _progressAnimation,
              builder: (context, child) {
                return Column(
                  children: [
                    ClipRRect(
                      borderRadius: BorderRadius.circular(8),
                      child: LinearProgressIndicator(
                        value: _progressAnimation.value * (chaptersProvider.overallProgress / 100),
                        backgroundColor: theme.colorScheme.outline.withValues(alpha: 0.2),
                        valueColor: AlwaysStoppedAnimation<Color>(theme.colorScheme.primary),
                        minHeight: 8,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          l10n.chaptersCompleted,
                          style: theme.textTheme.bodyMedium?.copyWith(
                            color: theme.colorScheme.onPrimaryContainer.withValues(alpha: 0.7),
                          ),
                        ),
                        Text(
                          '${(chaptersProvider.overallProgress * _progressAnimation.value).toStringAsFixed(1)}%',
                          style: theme.textTheme.bodyMedium?.copyWith(
                            color: theme.colorScheme.onPrimaryContainer,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ],
                    ),
                  ],
                );
              },
            ),
            
            const SizedBox(height: 12),
            
            // Statistics row
            Row(
              children: [
                _buildStatChip(
                  l10n.unlocked,
                  chaptersProvider.unlockedChapters.toString(),
                  Icons.lock_open,
                  theme.colorScheme.primary,
                  theme,
                ),
                const SizedBox(width: 12),
                _buildStatChip(
                  l10n.locked,
                  (chaptersProvider.totalChapters - chaptersProvider.unlockedChapters).toString(),
                  Icons.lock,
                  theme.colorScheme.outline,
                  theme,
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatChip(
    String label,
    String value,
    IconData icon,
    Color color,
    ThemeData theme,
  ) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: color.withValues(alpha: 0.2)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 16, color: color),
          const SizedBox(width: 6),
          Text(
            value,
            style: theme.textTheme.labelMedium?.copyWith(
              color: color,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(width: 4),
          Text(
            label,
            style: theme.textTheme.labelSmall?.copyWith(
              color: color.withValues(alpha: 0.8),
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _handleRefresh() async {
    final chaptersProvider = context.read<VocabularyChaptersProvider>();
    await chaptersProvider.loadChapters();
    _progressAnimationController.reset();
    _progressAnimationController.forward();
  }

  void _handleChapterTap(VocabularyChapter chapter) {
    final livesProvider = context.read<LivesProvider>();
    
    if (!chapter.isUnlocked) {
      _showLockedChapterDialog(chapter);
      return;
    }

    if (chapter.isCompleted) {
      _showCompletedChapterDialog(chapter);
      return;
    }

    if (!livesProvider.hasLives) {
      _showNoLivesDialog();
      return;
    }

    // Navigate to chapter content
    _navigateToChapter(chapter);
  }

  void _showLockedChapterDialog(VocabularyChapter chapter) {
    final l10n = AppLocalizations.of(context)!;
    
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        icon: const Icon(Icons.lock),
        title: Text(l10n.chapterLocked),
        content: Text(l10n.chapterLockedDescription(chapter.order - 1)),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: Text(l10n.understood),
          ),
        ],
      ),
    );
  }

  void _showCompletedChapterDialog(VocabularyChapter chapter) {
    final l10n = AppLocalizations.of(context)!;
    
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        icon: Icon(Icons.check_circle, color: Theme.of(context).colorScheme.primary),
        title: Text(l10n.chapterCompleted),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(l10n.chapterCompletedDescription),
            if (chapter.completionDate != null) ...[
              const SizedBox(height: 8),
              Text(
                l10n.completedOn(DateFormat.yMMMd().format(chapter.completionDate!)),
                style: Theme.of(context).textTheme.bodySmall,
              ),
            ],
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: Text(l10n.close),
          ),
          FilledButton(
            onPressed: () {
              Navigator.of(context).pop();
              _navigateToChapter(chapter);
            },
            child: Text(l10n.reviewChapter),
          ),
        ],
      ),
    );
  }

  void _showNoLivesDialog() {
    final l10n = AppLocalizations.of(context)!;
    final livesProvider = context.read<LivesProvider>();
    
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        icon: Icon(Icons.favorite_border, color: Theme.of(context).colorScheme.error),
        title: Text(l10n.noLivesTitle),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(l10n.noLivesMessage),
            if (livesProvider.nextReset != null) ...[
              const SizedBox(height: 8),
              Text(
                l10n.nextResetAt(DateFormat.yMMMd().add_jm().format(DateTime.parse(livesProvider.nextReset!))),
                style: Theme.of(context).textTheme.bodySmall,
              ),
            ],
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: Text(l10n.understood),
          ),
        ],
      ),
    );
  }

  void _navigateToChapter(VocabularyChapter chapter) {
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (context) => VocabularyPracticeScreen(chapter: chapter),
      ),
    );
  }
}

class SliverAnimatedGrid extends StatelessWidget {
  final SliverGridDelegate gridDelegate;
  final int itemCount;
  final Widget Function(BuildContext, int, Animation<double>) itemBuilder;

  const SliverAnimatedGrid({
    super.key,
    required this.gridDelegate,
    required this.itemCount,
    required this.itemBuilder,
  });

  @override
  Widget build(BuildContext context) {
    return SliverGrid(
      gridDelegate: gridDelegate,
      delegate: SliverChildBuilderDelegate(
        (context, index) {
          return TweenAnimationBuilder<double>(
            duration: Duration(milliseconds: 400 + (index * 50)),
            tween: Tween(begin: 0.0, end: 1.0),
            curve: Curves.easeOut,
            builder: (context, value, child) {
              return itemBuilder(
                context,
                index,
                AlwaysStoppedAnimation<double>(value),
              );
            },
          );
        },
        childCount: itemCount,
      ),
    );
  }
}