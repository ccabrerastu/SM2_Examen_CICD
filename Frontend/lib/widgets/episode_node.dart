import 'package:flutter/material.dart';
import '../models/episode.dart';
import '../l10n/app_localizations.dart';

class EpisodeNode extends StatefulWidget {
  final Episode episode;
  final VoidCallback onTap;

  const EpisodeNode({
    super.key,
    required this.episode,
    required this.onTap,
  });

  @override
  State<EpisodeNode> createState() => _EpisodeNodeState();
}

class _EpisodeNodeState extends State<EpisodeNode>
    with TickerProviderStateMixin {
  late AnimationController _pulseController;
  late AnimationController _glowController;
  late Animation<double> _pulseAnimation;
  late Animation<double> _glowAnimation;

  @override
  void initState() {
    super.initState();
    
    // Pulse for completed episodes
    _pulseController = AnimationController(
      duration: const Duration(seconds: 3),
      vsync: this,
    );
    _pulseAnimation = Tween<double>(
      begin: 1.0,
      end: 1.05,
    ).animate(CurvedAnimation(
      parent: _pulseController,
      curve: Curves.easeInOut,
    ));

    // Glow for current episode
    _glowController = AnimationController(
      duration: const Duration(milliseconds: 1500),
      vsync: this,
    );
    _glowAnimation = Tween<double>(
      begin: 0.3,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _glowController,
      curve: Curves.easeInOut,
    ));

    _startAnimations();
  }

  void _startAnimations() {
    if (widget.episode.status == EpisodeStatus.completed) {
      _pulseController.repeat(reverse: true);
    } else if (widget.episode.status == EpisodeStatus.current) {
      _glowController.repeat(reverse: true);
    }
  }

  @override
  void dispose() {
    _pulseController.dispose();
    _glowController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: widget.episode.status != EpisodeStatus.locked ? widget.onTap : null,
      child: Tooltip(
        message: _getTooltipMessage(),
        child: Column(
          children: [
            // Episode circle
            AnimatedBuilder(
              animation: widget.episode.status == EpisodeStatus.completed 
                  ? _pulseAnimation
                  : _glowAnimation,
              builder: (context, child) {
                return Transform.scale(
                  scale: widget.episode.status == EpisodeStatus.completed 
                      ? _pulseAnimation.value
                      : 1.0,
                  child: Container(
                    width: 80,
                    height: 80,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: widget.episode.difficulty.color,
                      boxShadow: [
                        BoxShadow(
                          color: widget.episode.status == EpisodeStatus.current
                              ? widget.episode.difficulty.color.withValues(alpha: (_glowAnimation.value * 0.6).clamp(0.0, 1.0))
                              : Colors.black.withValues(alpha: 0.2),
                          blurRadius: widget.episode.status == EpisodeStatus.current ? 20 : 8,
                          spreadRadius: widget.episode.status == EpisodeStatus.current ? 5 : 0,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: Icon(
                      widget.episode.statusIcon,
                      color: widget.episode.statusIconColor,
                      size: 32,
                    ),
                  ),
                );
              },
            ),
            
            const SizedBox(height: 8),
            
            // Episode text
            Text(
              widget.episode.title,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: widget.episode.textColor,
                fontWeight: FontWeight.bold,
                fontSize: 14,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  String _getTooltipMessage() {
    switch (widget.episode.status) {
      case EpisodeStatus.completed:
        return AppLocalizations.of(context)!.episodeCompleted;
      case EpisodeStatus.current:
        return AppLocalizations.of(context)!.continueEpisode;
      case EpisodeStatus.locked:
        return AppLocalizations.of(context)!.completePreviousEpisode;
    }
  }
}