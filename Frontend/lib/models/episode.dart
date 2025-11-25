import 'package:flutter/material.dart';

enum EpisodeDifficulty {
  beginner(color: Color(0xFF4CAF50), name: "Principiante"),
  easy(color: Color(0xFF388E3C), name: "Fácil"),
  intermediate(color: Color(0xFF1B5E20), name: "Intermedio"),
  hard(color: Color(0xFFFF9800), name: "Difícil"),
  expert(color: Color(0xFFF44336), name: "Experto");

  const EpisodeDifficulty({
    required this.color,
    required this.name,
  });

  final Color color;
  final String name;
}

enum EpisodeStatus {
  completed,
  current,
  locked,
}

class Episode {
  final int id;
  final String title;
  final EpisodeDifficulty difficulty;
  final EpisodeStatus status;
  final String? description;
  final double progress;

  const Episode({
    required this.id,
    required this.title,
    required this.difficulty,
    required this.status,
    this.description,
    required this.progress,
  });

  IconData get statusIcon {
    switch (status) {
      case EpisodeStatus.completed:
        return Icons.check;
      case EpisodeStatus.current:
        return Icons.play_arrow;
      case EpisodeStatus.locked:
        return Icons.lock;
    }
  }

  Color get statusIconColor {
    switch (status) {
      case EpisodeStatus.completed:
        return Colors.white;
      case EpisodeStatus.current:
        return Colors.white;
      case EpisodeStatus.locked:
        return Colors.grey.shade600;
    }
  }

  Color get textColor {
    switch (status) {
      case EpisodeStatus.completed:
      case EpisodeStatus.current:
        return Colors.black;
      case EpisodeStatus.locked:
        return Colors.grey.shade600;
    }
  }

  static List<Episode> getSampleEpisodes() {
    return [
      Episode(
        id: 1,
        title: "Episodio 1",
        difficulty: EpisodeDifficulty.beginner,
        status: EpisodeStatus.completed,
        progress: 1.0,
      ),
      Episode(
        id: 2,
        title: "Episodio 2", 
        difficulty: EpisodeDifficulty.easy,
        status: EpisodeStatus.completed,
        progress: 1.0,
      ),
      Episode(
        id: 3,
        title: "Episodio 3",
        difficulty: EpisodeDifficulty.intermediate,
        status: EpisodeStatus.completed,
        progress: 1.0,
      ),
      Episode(
        id: 4,
        title: "Episodio 4",
        difficulty: EpisodeDifficulty.hard,
        status: EpisodeStatus.current,
        progress: 0.6,
      ),
      Episode(
        id: 5,
        title: "Episodio 5",
        difficulty: EpisodeDifficulty.expert,
        status: EpisodeStatus.locked,
        progress: 0.0,
      ),
    ];
  }
}