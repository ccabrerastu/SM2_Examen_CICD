import 'episode.dart';

class Chapter {
  final int id;
  final String title;
  final String category;
  final List<Episode> episodes;
  final double overallProgress;

  const Chapter({
    required this.id,
    required this.title,
    required this.category,
    required this.episodes,
    required this.overallProgress,
  });

  int get completedEpisodes {
    return episodes.where((e) => e.status == EpisodeStatus.completed).length;
  }

  int get totalEpisodes => episodes.length;

  String get progressText => "$completedEpisodes/$totalEpisodes";

  Episode? get currentEpisode {
    try {
      return episodes.firstWhere((e) => e.status == EpisodeStatus.current);
    } catch (e) {
      return null;
    }
  }

  static Chapter getSampleChapter() {
    return Chapter(
      id: 4,
      title: "English Basics",
      category: "Vocabulary",
      overallProgress: 0.6,
      episodes: Episode.getSampleEpisodes(),
    );
  }
}