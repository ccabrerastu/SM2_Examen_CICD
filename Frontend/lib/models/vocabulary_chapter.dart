enum VocabularyChapterLevel {
  basic(1, 'Basic'),
  intermediate(2, 'Intermediate'),
  advanced(3, 'Advanced');

  const VocabularyChapterLevel(this.value, this.displayName);
  
  final int value;
  final String displayName;

  static VocabularyChapterLevel fromValue(int value) {
    switch (value) {
      case 1:
        return VocabularyChapterLevel.basic;
      case 2:
        return VocabularyChapterLevel.intermediate;
      case 3:
        return VocabularyChapterLevel.advanced;
      default:
        return VocabularyChapterLevel.basic;
    }
  }
}

class VocabularyChapter {
  final String id;
  final String title;
  final String? description;
  final VocabularyChapterLevel level;
  final int order;
  final String? imageUrl;
  final bool isUnlocked;
  final bool isCompleted;
  final double progressPercentage;
  final int vocabularyItemsLearned;
  final int totalVocabularyItems;
  final DateTime? lastActivity;
  final DateTime? completionDate;

  const VocabularyChapter({
    required this.id,
    required this.title,
    this.description,
    required this.level,
    required this.order,
    this.imageUrl,
    required this.isUnlocked,
    required this.isCompleted,
    required this.progressPercentage,
    required this.vocabularyItemsLearned,
    required this.totalVocabularyItems,
    this.lastActivity,
    this.completionDate,
  });

  factory VocabularyChapter.fromJson(Map<String, dynamic> json) {
    return VocabularyChapter(
      id: json['id'] as String,
      title: json['title'] as String,
      description: json['description'] as String?,
      level: VocabularyChapterLevel.fromValue(json['level'] as int),
      order: json['order'] as int,
      imageUrl: json['imageUrl'] as String?,
      isUnlocked: json['isUnlocked'] as bool,
      isCompleted: json['isCompleted'] as bool,
      progressPercentage: (json['progressPercentage'] as num).toDouble(),
      vocabularyItemsLearned: json['vocabularyItemsLearned'] as int,
      totalVocabularyItems: json['totalVocabularyItems'] as int,
      lastActivity: json['lastActivity'] != null 
          ? DateTime.parse(json['lastActivity'] as String) 
          : null,
      completionDate: json['completionDate'] != null 
          ? DateTime.parse(json['completionDate'] as String) 
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'title': title,
      'description': description,
      'level': level.value,
      'order': order,
      'imageUrl': imageUrl,
      'isUnlocked': isUnlocked,
      'isCompleted': isCompleted,
      'progressPercentage': progressPercentage,
      'vocabularyItemsLearned': vocabularyItemsLearned,
      'totalVocabularyItems': totalVocabularyItems,
      'lastActivity': lastActivity?.toIso8601String(),
      'completionDate': completionDate?.toIso8601String(),
    };
  }

  VocabularyChapter copyWith({
    String? id,
    String? title,
    String? description,
    VocabularyChapterLevel? level,
    int? order,
    String? imageUrl,
    bool? isUnlocked,
    bool? isCompleted,
    double? progressPercentage,
    int? vocabularyItemsLearned,
    int? totalVocabularyItems,
    DateTime? lastActivity,
    DateTime? completionDate,
  }) {
    return VocabularyChapter(
      id: id ?? this.id,
      title: title ?? this.title,
      description: description ?? this.description,
      level: level ?? this.level,
      order: order ?? this.order,
      imageUrl: imageUrl ?? this.imageUrl,
      isUnlocked: isUnlocked ?? this.isUnlocked,
      isCompleted: isCompleted ?? this.isCompleted,
      progressPercentage: progressPercentage ?? this.progressPercentage,
      vocabularyItemsLearned: vocabularyItemsLearned ?? this.vocabularyItemsLearned,
      totalVocabularyItems: totalVocabularyItems ?? this.totalVocabularyItems,
      lastActivity: lastActivity ?? this.lastActivity,
      completionDate: completionDate ?? this.completionDate,
    );
  }

  // Helper getters
  bool get hasProgress => vocabularyItemsLearned > 0;
  bool get canStart => isUnlocked && !isCompleted;
  bool get canContinue => isUnlocked && hasProgress && !isCompleted;
  String get progressText => '$vocabularyItemsLearned/$totalVocabularyItems';
  
  String get statusText {
    if (isCompleted) return 'Completed';
    if (!isUnlocked) return 'Locked';
    if (hasProgress) return 'In Progress';
    return 'Available';
  }

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is VocabularyChapter &&
          runtimeType == other.runtimeType &&
          id == other.id;

  @override
  int get hashCode => id.hashCode;

  @override
  String toString() =>
      'VocabularyChapter(id: $id, title: $title, order: $order, isUnlocked: $isUnlocked, isCompleted: $isCompleted)';
}

class VocabularyChaptersResponse {
  final bool success;
  final VocabularyChaptersData data;
  final String message;

  const VocabularyChaptersResponse({
    required this.success,
    required this.data,
    required this.message,
  });

  factory VocabularyChaptersResponse.fromJson(Map<String, dynamic> json) {
    return VocabularyChaptersResponse(
      success: json['success'] as bool,
      data: VocabularyChaptersData.fromJson(json['data'] as Map<String, dynamic>),
      message: json['message'] as String,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'success': success,
      'data': data.toJson(),
      'message': message,
    };
  }
}

class VocabularyChaptersData {
  final List<VocabularyChapter> chapters;
  final int totalChapters;
  final int unlockedChapters;
  final int completedChapters;

  const VocabularyChaptersData({
    required this.chapters,
    required this.totalChapters,
    required this.unlockedChapters,
    required this.completedChapters,
  });

  factory VocabularyChaptersData.fromJson(Map<String, dynamic> json) {
    return VocabularyChaptersData(
      chapters: (json['chapters'] as List<dynamic>)
          .map((e) => VocabularyChapter.fromJson(e as Map<String, dynamic>))
          .toList(),
      totalChapters: json['totalChapters'] as int,
      unlockedChapters: json['unlockedChapters'] as int,
      completedChapters: json['completedChapters'] as int,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'chapters': chapters.map((e) => e.toJson()).toList(),
      'totalChapters': totalChapters,
      'unlockedChapters': unlockedChapters,
      'completedChapters': completedChapters,
    };
  }

  double get overallProgressPercentage => 
      totalChapters > 0 ? (completedChapters / totalChapters) * 100 : 0.0;

  VocabularyChapter? get currentChapter => 
      chapters.where((c) => c.canStart || c.canContinue).firstOrNull;

  List<VocabularyChapter> get availableChapters => 
      chapters.where((c) => c.isUnlocked).toList();

  List<VocabularyChapter> get lockedChapters => 
      chapters.where((c) => !c.isUnlocked).toList();

  @override
  String toString() => 
      'VocabularyChaptersData(totalChapters: $totalChapters, unlockedChapters: $unlockedChapters, completedChapters: $completedChapters)';
}

class CompleteChapterRequest {
  final int? finalScore;
  final String? completionNotes;
  final Map<String, dynamic>? extraData;

  const CompleteChapterRequest({
    this.finalScore,
    this.completionNotes,
    this.extraData,
  });

  Map<String, dynamic> toJson() {
    return {
      if (finalScore != null) 'finalScore': finalScore,
      if (completionNotes != null) 'completionNotes': completionNotes,
      if (extraData != null) 'extraData': extraData,
    };
  }
}

class CompleteChapterResponse {
  final bool success;
  final CompleteChapterData data;
  final String message;

  const CompleteChapterResponse({
    required this.success,
    required this.data,
    required this.message,
  });

  factory CompleteChapterResponse.fromJson(Map<String, dynamic> json) {
    return CompleteChapterResponse(
      success: json['success'] as bool,
      data: CompleteChapterData.fromJson(json['data'] as Map<String, dynamic>),
      message: json['message'] as String,
    );
  }
}

class CompleteChapterData {
  final bool chapterCompleted;
  final bool nextChapterUnlocked;
  final Map<String, dynamic> userProgress;

  const CompleteChapterData({
    required this.chapterCompleted,
    required this.nextChapterUnlocked,
    required this.userProgress,
  });

  factory CompleteChapterData.fromJson(Map<String, dynamic> json) {
    return CompleteChapterData(
      chapterCompleted: json['chapterCompleted'] as bool,
      nextChapterUnlocked: json['nextChapterUnlocked'] as bool,
      userProgress: json['userProgress'] as Map<String, dynamic>,
    );
  }
}