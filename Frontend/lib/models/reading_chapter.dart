class ReadingChapter {
  final String id;
  final String title;
  final String description;
  final String level; // 'BASIC', 'INTERMEDIATE', 'ADVANCED'
  final int order;
  final String? imageUrl;
  final bool isUnlocked;
  final bool isCompleted;
  final double progress; // 0.0 to 100.0
  final int? score;
  final int totalPages;
  final int estimatedMinutes;

  ReadingChapter({
    required this.id,
    required this.title,
    required this.description,
    required this.level,
    required this.order,
    this.imageUrl,
    required this.isUnlocked,
    required this.isCompleted,
    required this.progress,
    this.score,
    required this.totalPages,
    required this.estimatedMinutes,
  });

  factory ReadingChapter.fromJson(Map<String, dynamic> json) {
    // Handle level - can be int (enum) or String
    String levelStr;
    final levelValue = json['level'];
    if (levelValue is int) {
      // Convert enum number to string
      switch (levelValue) {
        case 1:
          levelStr = 'BASIC';
          break;
        case 2:
          levelStr = 'INTERMEDIATE';
          break;
        case 3:
          levelStr = 'ADVANCED';
          break;
        default:
          levelStr = 'BASIC';
      }
    } else {
      levelStr = levelValue as String;
    }

    return ReadingChapter(
      id: json['id'] as String,
      title: json['title'] as String,
      description: json['description'] as String? ?? '',
      level: levelStr,
      order: json['order'] as int,
      imageUrl: json['imageUrl'] as String?,
      isUnlocked: json['isUnlocked'] as bool,
      isCompleted: json['isCompleted'] as bool,
      progress: (json['progressPercentage'] as num?)?.toDouble() ?? 0.0,
      score: json['score'] as int?,
      totalPages: json['totalPages'] as int? ?? 3,
      estimatedMinutes: json['estimatedReadingTime'] as int? ?? 10,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'level': level,
      'order': order,
      'imageUrl': imageUrl,
      'isUnlocked': isUnlocked,
      'isCompleted': isCompleted,
      'progress': progress,
      'score': score,
      'totalPages': totalPages,
      'estimatedMinutes': estimatedMinutes,
    };
  }

  // Helper getters
  String get levelDisplay {
    switch (level.toUpperCase()) {
      case 'BASIC':
        return 'Basic';
      case 'INTERMEDIATE':
        return 'Intermediate';
      case 'ADVANCED':
        return 'Advanced';
      default:
        return level;
    }
  }

  bool get canAccess => isUnlocked && !isCompleted;
}

class ReadingChaptersResponse {
  final List<ReadingChapter> chapters;
  final int totalChapters;
  final int unlockedChapters;
  final int completedChapters;
  final double overallProgress;

  ReadingChaptersResponse({
    required this.chapters,
    required this.totalChapters,
    required this.unlockedChapters,
    required this.completedChapters,
    required this.overallProgress,
  });

  factory ReadingChaptersResponse.fromJson(Map<String, dynamic> json) {
    final data = json['data'] as Map<String, dynamic>;
    return ReadingChaptersResponse(
      chapters: (data['chapters'] as List)
          .map((item) => ReadingChapter.fromJson(item as Map<String, dynamic>))
          .toList(),
      totalChapters: data['totalChapters'] as int,
      unlockedChapters: data['unlockedChapters'] as int,
      completedChapters: data['completedChapters'] as int,
      overallProgress: (data['overallProgress'] as num?)?.toDouble() ?? 0.0,
    );
  }
}
