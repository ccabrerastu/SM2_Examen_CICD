import 'package:flutter/material.dart';
import '../models/vocabulary_chapter.dart';
import '../l10n/app_localizations.dart';

class VocabularyChapterCard extends StatefulWidget {
  final VocabularyChapter chapter;
  final VoidCallback onTap;
  final Duration animationDelay;

  const VocabularyChapterCard({
    super.key,
    required this.chapter,
    required this.onTap,
    this.animationDelay = Duration.zero,
  });

  @override
  State<VocabularyChapterCard> createState() => _VocabularyChapterCardState();
}

class _VocabularyChapterCardState extends State<VocabularyChapterCard>
    with TickerProviderStateMixin {
  late AnimationController _scaleController;
  late AnimationController _fadeController;
  late AnimationController _progressController;
  late Animation<double> _scaleAnimation;
  late Animation<double> _fadeAnimation;
  late Animation<double> _progressAnimation;

  @override
  void initState() {
    super.initState();
    _setupAnimations();
    _startAnimations();
  }

  void _setupAnimations() {
    _scaleController = AnimationController(
      duration: const Duration(milliseconds: 200),
      vsync: this,
    );
    
    _fadeController = AnimationController(
      duration: const Duration(milliseconds: 600),
      vsync: this,
    );
    
    _progressController = AnimationController(
      duration: const Duration(milliseconds: 1200),
      vsync: this,
    );

    _scaleAnimation = Tween<double>(
      begin: 0.95,
      end: 1.05,
    ).animate(CurvedAnimation(
      parent: _scaleController,
      curve: Curves.easeInOut,
    ));

    _fadeAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _fadeController,
      curve: Curves.easeOut,
    ));

    _progressAnimation = Tween<double>(
      begin: 0.0,
      end: widget.chapter.progressPercentage / 100.0,
    ).animate(CurvedAnimation(
      parent: _progressController,
      curve: Curves.easeOutCubic,
    ));
  }

  void _startAnimations() async {
    await Future.delayed(widget.animationDelay);
    if (mounted) {
      _fadeController.forward();
      await Future.delayed(const Duration(milliseconds: 300));
      if (mounted && widget.chapter.progressPercentage > 0) {
        _progressController.forward();
      }
    }
  }

  @override
  void dispose() {
    _scaleController.dispose();
    _fadeController.dispose();
    _progressController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final l10n = AppLocalizations.of(context)!;
    
    return FadeTransition(
      opacity: _fadeAnimation,
      child: GestureDetector(
        onTapDown: (_) => _scaleController.forward(),
        onTapUp: (_) {
          _scaleController.reverse();
          widget.onTap();
        },
        onTapCancel: () => _scaleController.reverse(),
        child: ScaleTransition(
          scale: _scaleAnimation,
          child: Container(
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(16),
              boxShadow: [
                BoxShadow(
                  color: theme.colorScheme.shadow.withValues(alpha: 0.15),
                  blurRadius: 8,
                  offset: const Offset(0, 3),
                ),
              ],
            ),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(16),
              child: Material(
                color: _getCardBackgroundColor(theme),
                child: InkWell(
                  onTap: widget.onTap,
                  child: Container(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Header with icon and level
                        _buildHeader(theme, l10n),
                        
                        const SizedBox(height: 12),
                        
                        // Title
                        _buildTitle(theme),
                        
                        const SizedBox(height: 8),
                        
                        // Description
                        if (widget.chapter.description != null)
                          _buildDescription(theme),
                        
                        const Spacer(),
                        
                        // Progress section
                        _buildProgress(theme, l10n),
                        
                        const SizedBox(height: 8),
                        
                        // Status badge
                        _buildStatusBadge(theme, l10n),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildHeader(ThemeData theme, AppLocalizations l10n) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        // Chapter number badge
        Container(
          width: 32,
          height: 32,
          decoration: BoxDecoration(
            color: _getStatusColor(theme).withValues(alpha: 0.2),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Center(
            child: Text(
              '${widget.chapter.order}',
              style: theme.textTheme.labelLarge?.copyWith(
                color: _getStatusColor(theme),
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ),
        
        // Level and status icon
        Row(
          children: [
            // Level badge
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
              decoration: BoxDecoration(
                color: _getLevelColor(theme).withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(
                  color: _getLevelColor(theme).withValues(alpha: 0.3),
                ),
              ),
              child: Text(
                widget.chapter.level.displayName.toUpperCase(),
                style: theme.textTheme.labelSmall?.copyWith(
                  color: _getLevelColor(theme),
                  fontWeight: FontWeight.bold,
                  fontSize: 10,
                ),
              ),
            ),
            
            const SizedBox(width: 8),
            
            // Status icon
            _buildStatusIcon(theme),
          ],
        ),
      ],
    );
  }

  Widget _buildTitle(ThemeData theme) {
    return Text(
      widget.chapter.title,
      style: theme.textTheme.titleMedium?.copyWith(
        fontWeight: FontWeight.bold,
        color: widget.chapter.isUnlocked 
          ? theme.colorScheme.onSurface 
          : theme.colorScheme.onSurface.withValues(alpha: 0.6),
      ),
      maxLines: 2,
      overflow: TextOverflow.ellipsis,
    );
  }

  Widget _buildDescription(ThemeData theme) {
    return Text(
      widget.chapter.description!,
      style: theme.textTheme.bodySmall?.copyWith(
        color: widget.chapter.isUnlocked 
          ? theme.colorScheme.onSurface.withValues(alpha: 0.7)
          : theme.colorScheme.onSurface.withValues(alpha: 0.4),
      ),
      maxLines: 2,
      overflow: TextOverflow.ellipsis,
    );
  }

  Widget _buildProgress(ThemeData theme, AppLocalizations l10n) {
    if (!widget.chapter.isUnlocked) {
      return const SizedBox.shrink();
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(
              l10n.progress,
              style: theme.textTheme.labelSmall?.copyWith(
                color: theme.colorScheme.onSurface.withValues(alpha: 0.6),
              ),
            ),
            Text(
              '${widget.chapter.progressPercentage.toInt()}%',
              style: theme.textTheme.labelSmall?.copyWith(
                color: _getStatusColor(theme),
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
        const SizedBox(height: 4),
        
        // Animated progress bar
        AnimatedBuilder(
          animation: _progressAnimation,
          builder: (context, child) {
            return ClipRRect(
              borderRadius: BorderRadius.circular(2),
              child: LinearProgressIndicator(
                value: _progressAnimation.value,
                backgroundColor: theme.colorScheme.outline.withValues(alpha: 0.2),
                valueColor: AlwaysStoppedAnimation<Color>(_getStatusColor(theme)),
                minHeight: 4,
              ),
            );
          },
        ),
        
        const SizedBox(height: 2),
        
        // Vocabulary progress
        Text(
          widget.chapter.progressText,
          style: theme.textTheme.labelSmall?.copyWith(
            color: theme.colorScheme.onSurface.withValues(alpha: 0.5),
          ),
        ),
      ],
    );
  }

  Widget _buildStatusBadge(ThemeData theme, AppLocalizations l10n) {
    final statusText = _getStatusText(l10n);
    final statusColor = _getStatusColor(theme);
    
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: statusColor.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: statusColor.withValues(alpha: 0.3),
          width: 1,
        ),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            _getStatusIconData(),
            size: 12,
            color: statusColor,
          ),
          const SizedBox(width: 4),
          Text(
            statusText,
            style: theme.textTheme.labelSmall?.copyWith(
              color: statusColor,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatusIcon(ThemeData theme) {
    return Container(
      width: 24,
      height: 24,
      decoration: BoxDecoration(
        color: _getStatusColor(theme).withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Icon(
        _getStatusIconData(),
        size: 14,
        color: _getStatusColor(theme),
      ),
    );
  }

  Color _getCardBackgroundColor(ThemeData theme) {
    if (!widget.chapter.isUnlocked) {
      return theme.colorScheme.surfaceContainerHighest.withValues(alpha: 0.5);
    } else if (widget.chapter.isCompleted) {
      return theme.colorScheme.primaryContainer.withValues(alpha: 0.3);
    } else {
      return theme.colorScheme.surface;
    }
  }

  Color _getStatusColor(ThemeData theme) {
    if (widget.chapter.isCompleted) {
      return theme.colorScheme.primary;
    } else if (!widget.chapter.isUnlocked) {
      return theme.colorScheme.outline;
    } else if (widget.chapter.hasProgress) {
      return theme.colorScheme.secondary;
    } else {
      return theme.colorScheme.tertiary;
    }
  }

  Color _getLevelColor(ThemeData theme) {
    switch (widget.chapter.level) {
      case VocabularyChapterLevel.basic:
        return Colors.green;
      case VocabularyChapterLevel.intermediate:
        return Colors.orange.shade600;
      case VocabularyChapterLevel.advanced:
        return Colors.red.shade600;
    }
  }

  IconData _getStatusIconData() {
    if (widget.chapter.isCompleted) {
      return Icons.check_circle;
    } else if (!widget.chapter.isUnlocked) {
      return Icons.lock;
    } else if (widget.chapter.hasProgress) {
      return Icons.play_circle;
    } else {
      return Icons.play_circle_outline;
    }
  }

  String _getStatusText(AppLocalizations l10n) {
    if (widget.chapter.isCompleted) {
      return l10n.completed;
    } else if (!widget.chapter.isUnlocked) {
      return l10n.locked;
    } else if (widget.chapter.hasProgress) {
      return l10n.continue_;
    } else {
      return l10n.start;
    }
  }
}
