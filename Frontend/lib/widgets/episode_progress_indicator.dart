import 'package:flutter/material.dart';
import '../models/episode.dart';

class EpisodeProgressIndicator extends StatelessWidget {
  final List<Episode> episodes;

  const EpisodeProgressIndicator({
    super.key,
    required this.episodes,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
      child: Row(
        children: episodes.asMap().entries.map((entry) {
          final index = entry.key;
          final episode = entry.value;
          
          return Expanded(
            child: Container(
              margin: EdgeInsets.only(
                right: index < episodes.length - 1 ? 8 : 0,
              ),
              height: 8,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(4),
                color: _getProgressBarColor(episode),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }

  Color _getProgressBarColor(Episode episode) {
    switch (episode.status) {
      case EpisodeStatus.completed:
        return episode.difficulty.color;
      case EpisodeStatus.current:
        return episode.difficulty.color;
      case EpisodeStatus.locked:
        return Colors.grey.shade300;
    }
  }
}