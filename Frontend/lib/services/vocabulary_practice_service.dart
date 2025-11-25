import 'base_practice_service.dart';
import '../utils/environment_config.dart';

// Data models for vocabulary practice
class VocabularyPracticeSession {
  final String id;
  final String userId;
  final String? chapterId;
  final String? episodeId;
  final int progress;
  final double score;
  final double maxScore;
  final String status;
  final DateTime startedAt;
  final DateTime? endedAt;
  final DateTime createdAt;
  final DateTime updatedAt;

  // Vocabulary-specific fields
  final int wordsStudied;
  final int wordsLearned;
  final int correctAnswers;
  final int incorrectAnswers;
  final String difficultyLevel;
  final List<StudiedWord> studiedWords;

  VocabularyPracticeSession({
    required this.id,
    required this.userId,
    this.chapterId,
    this.episodeId,
    required this.progress,
    required this.score,
    required this.maxScore,
    required this.status,
    required this.startedAt,
    this.endedAt,
    required this.createdAt,
    required this.updatedAt,
    required this.wordsStudied,
    required this.wordsLearned,
    required this.correctAnswers,
    required this.incorrectAnswers,
    required this.difficultyLevel,
    required this.studiedWords,
  });

  factory VocabularyPracticeSession.fromJson(Map<String, dynamic> json) {
    return VocabularyPracticeSession(
      id: json['id'] ?? '',
      userId: json['userId'] ?? '',
      chapterId: json['chapterId'],
      episodeId: json['episodeId'],
      progress: json['progress'] ?? 0,
      score: (json['score'] ?? 0).toDouble(),
      maxScore: (json['maxScore'] ?? 0).toDouble(),
      status: json['status'] ?? 'started',
      startedAt: DateTime.parse(
        json['startedAt'] ?? DateTime.now().toIso8601String(),
      ),
      endedAt: json['endedAt'] != null ? DateTime.parse(json['endedAt']) : null,
      createdAt: DateTime.parse(
        json['createdAt'] ?? DateTime.now().toIso8601String(),
      ),
      updatedAt: DateTime.parse(
        json['updatedAt'] ?? DateTime.now().toIso8601String(),
      ),
      wordsStudied: json['wordsStudied'] ?? 0,
      wordsLearned: json['wordsLearned'] ?? 0,
      correctAnswers: json['correctAnswers'] ?? 0,
      incorrectAnswers: json['incorrectAnswers'] ?? 0,
      difficultyLevel: json['difficultyLevel'] ?? 'beginner',
      studiedWords:
          (json['studiedWords'] as List<dynamic>?)
              ?.map((word) => StudiedWord.fromJson(word))
              .toList() ??
          [],
    );
  }
}

class StudiedWord {
  final String word;
  final String meaning;
  final bool isLearned;
  final int attempts;
  final DateTime studiedAt;

  StudiedWord({
    required this.word,
    required this.meaning,
    required this.isLearned,
    required this.attempts,
    required this.studiedAt,
  });

  factory StudiedWord.fromJson(Map<String, dynamic> json) {
    return StudiedWord(
      word: json['word'] ?? '',
      meaning: json['meaning'] ?? '',
      isLearned: json['isLearned'] ?? false,
      attempts: json['attempts'] ?? 0,
      studiedAt: DateTime.parse(
        json['studiedAt'] ?? DateTime.now().toIso8601String(),
      ),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'word': word,
      'meaning': meaning,
      'isLearned': isLearned,
      'attempts': attempts,
      'studiedAt': studiedAt.toIso8601String(),
    };
  }
}

class VocabularyStats {
  final int totalSessions;
  final int completedSessions;
  final double averageScore;
  final int totalWordsStudied;
  final int totalWordsLearned;
  final double learningRate;
  final DateTime? lastSessionDate;

  VocabularyStats({
    required this.totalSessions,
    required this.completedSessions,
    required this.averageScore,
    required this.totalWordsStudied,
    required this.totalWordsLearned,
    required this.learningRate,
    this.lastSessionDate,
  });

  factory VocabularyStats.fromJson(Map<String, dynamic> json) {
    return VocabularyStats(
      totalSessions: json['totalSessions'] ?? 0,
      completedSessions: json['completedSessions'] ?? 0,
      averageScore: (json['averageScore'] ?? 0).toDouble(),
      totalWordsStudied: json['totalWordsStudied'] ?? 0,
      totalWordsLearned: json['totalWordsLearned'] ?? 0,
      learningRate: (json['learningRate'] ?? 0).toDouble(),
      lastSessionDate: json['lastSessionDate'] != null
          ? DateTime.parse(json['lastSessionDate'])
          : null,
    );
  }
}

class VocabularyPracticeService extends BasePracticeService {
  @override
  String get baseEndpoint => 'practices/vocabulary';

  // Create a new vocabulary practice session
  Future<VocabularyPracticeSession?> createVocabularySession({
    required String token,
    required String userId,
    String? chapterId,
    String? episodeId,
    String difficultyLevel = 'beginner',
    List<String>? targetWords,
  }) async {
    final practiceData = {
      'userId': userId,
      'practiceType': 'vocabulary',
      if (chapterId != null) 'chapterId': chapterId,
      if (episodeId != null) 'episodeId': episodeId,
      'difficultyLevel': difficultyLevel,
      if (targetWords != null) 'targetWords': targetWords,
    };

    final response = await createPracticeSession(practiceData, token);
    return parseResponse(response, VocabularyPracticeSession.fromJson);
  }

  // Get vocabulary practice session
  Future<VocabularyPracticeSession?> getVocabularySession(
    String sessionId,
    String token,
  ) async {
    final response = await getPracticeSession(sessionId, token);
    return parseResponse(response, VocabularyPracticeSession.fromJson);
  }

  // Update vocabulary practice session
  Future<VocabularyPracticeSession?> updateVocabularySession({
    required String sessionId,
    required String token,
    int? progress,
    double? score,
    String? status,
    int? wordsStudied,
    int? wordsLearned,
    int? correctAnswers,
    int? incorrectAnswers,
    List<StudiedWord>? studiedWords,
  }) async {
    final updateData = <String, dynamic>{};

    if (progress != null) updateData['progress'] = progress;
    if (score != null) updateData['score'] = score;
    if (status != null) updateData['status'] = status;
    if (wordsStudied != null) updateData['wordsStudied'] = wordsStudied;
    if (wordsLearned != null) updateData['wordsLearned'] = wordsLearned;
    if (correctAnswers != null) updateData['correctAnswers'] = correctAnswers;
    if (incorrectAnswers != null) {
      updateData['incorrectAnswers'] = incorrectAnswers;
    }
    if (studiedWords != null) {
      updateData['studiedWords'] = studiedWords
          .map((word) => word.toJson())
          .toList();
    }

    final response = await updatePracticeSession(sessionId, updateData, token);
    return parseResponse(response, VocabularyPracticeSession.fromJson);
  }

  // Study a word
  Future<VocabularyPracticeSession?> studyWord({
    required String sessionId,
    required String token,
    required String word,
    required String meaning,
    required bool isCorrect,
  }) async {
    final endpoint =
        '${EnvironmentConfig.apiBaseUrl}/$baseEndpoint/$sessionId/study-word';

    final studyData = {
      'word': word,
      'meaning': meaning,
      'isCorrect': isCorrect,
    };

    final response = await apiService.post(
      endpoint,
      body: studyData,
      token: token,
    );

    return parseResponse(response, VocabularyPracticeSession.fromJson);
  }

  // Review a word
  Future<VocabularyPracticeSession?> reviewWord({
    required String sessionId,
    required String token,
    required String word,
    required bool isCorrect,
  }) async {
    final endpoint =
        '${EnvironmentConfig.apiBaseUrl}/$baseEndpoint/$sessionId/review-word';

    final reviewData = {'word': word, 'isCorrect': isCorrect};

    final response = await apiService.post(
      endpoint,
      body: reviewData,
      token: token,
    );

    return parseResponse(response, VocabularyPracticeSession.fromJson);
  }

  // Get user vocabulary sessions
  Future<List<VocabularyPracticeSession>> getUserVocabularySessions({
    required String userId,
    required String token,
    String? difficultyLevel,
    bool? completed,
    int? limit,
    int? offset,
  }) async {
    final filters = <String, dynamic>{};
    if (difficultyLevel != null) filters['difficultyLevel'] = difficultyLevel;
    if (completed != null) filters['completed'] = completed;

    final response = await getUserPracticeSessions(
      userId,
      token,
      filters: filters,
      limit: limit,
      offset: offset,
    );

    return parseListResponse(response, VocabularyPracticeSession.fromJson);
  }

  // Get user vocabulary statistics
  Future<VocabularyStats?> getUserVocabularyStats({
    required String userId,
    required String token,
    String? timeframe,
    String? difficultyLevel,
  }) async {
    final additionalFilters = <String, dynamic>{};
    if (difficultyLevel != null) {
      additionalFilters['difficultyLevel'] = difficultyLevel;
    }

    final response = await getUserPracticeStats(
      userId,
      token,
      timeframe: timeframe,
      additionalFilters: additionalFilters,
    );

    return parseResponse(response, VocabularyStats.fromJson);
  }
}
