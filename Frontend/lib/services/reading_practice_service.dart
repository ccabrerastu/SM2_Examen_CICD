import 'base_practice_service.dart';
import '../utils/environment_config.dart';

// Data models for reading practice
class ReadingPracticeSession {
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

  // Reading-specific fields
  final String readingMaterial;
  final String readingTitle;
  final String readingLevel;
  final int totalParagraphs;
  final int currentParagraph;
  final int wordsRead;
  final int readingTimeSeconds;
  final double comprehensionScore;
  final List<ComprehensionAnswer> comprehensionAnswers;
  final List<BookmarkedSection> bookmarks;
  final List<VocabularyWord> vocabularyWords;

  ReadingPracticeSession({
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
    required this.readingMaterial,
    required this.readingTitle,
    required this.readingLevel,
    required this.totalParagraphs,
    required this.currentParagraph,
    required this.wordsRead,
    required this.readingTimeSeconds,
    required this.comprehensionScore,
    required this.comprehensionAnswers,
    required this.bookmarks,
    required this.vocabularyWords,
  });

  factory ReadingPracticeSession.fromJson(Map<String, dynamic> json) {
    return ReadingPracticeSession(
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
      readingMaterial: json['readingMaterial'] ?? '',
      readingTitle: json['readingTitle'] ?? '',
      readingLevel: json['readingLevel'] ?? 'beginner',
      totalParagraphs: json['totalParagraphs'] ?? 0,
      currentParagraph: json['currentParagraph'] ?? 0,
      wordsRead: json['wordsRead'] ?? 0,
      readingTimeSeconds: json['readingTimeSeconds'] ?? 0,
      comprehensionScore: (json['comprehensionScore'] ?? 0).toDouble(),
      comprehensionAnswers:
          (json['comprehensionAnswers'] as List<dynamic>?)
              ?.map((answer) => ComprehensionAnswer.fromJson(answer))
              .toList() ??
          [],
      bookmarks:
          (json['bookmarks'] as List<dynamic>?)
              ?.map((bookmark) => BookmarkedSection.fromJson(bookmark))
              .toList() ??
          [],
      vocabularyWords:
          (json['vocabularyWords'] as List<dynamic>?)
              ?.map((word) => VocabularyWord.fromJson(word))
              .toList() ??
          [],
    );
  }
}

class ComprehensionAnswer {
  final String questionId;
  final String question;
  final String userAnswer;
  final String correctAnswer;
  final bool isCorrect;
  final DateTime answeredAt;

  ComprehensionAnswer({
    required this.questionId,
    required this.question,
    required this.userAnswer,
    required this.correctAnswer,
    required this.isCorrect,
    required this.answeredAt,
  });

  factory ComprehensionAnswer.fromJson(Map<String, dynamic> json) {
    return ComprehensionAnswer(
      questionId: json['questionId'] ?? '',
      question: json['question'] ?? '',
      userAnswer: json['userAnswer'] ?? '',
      correctAnswer: json['correctAnswer'] ?? '',
      isCorrect: json['isCorrect'] ?? false,
      answeredAt: DateTime.parse(
        json['answeredAt'] ?? DateTime.now().toIso8601String(),
      ),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'questionId': questionId,
      'question': question,
      'userAnswer': userAnswer,
      'correctAnswer': correctAnswer,
      'isCorrect': isCorrect,
      'answeredAt': answeredAt.toIso8601String(),
    };
  }
}

class BookmarkedSection {
  final String id;
  final int paragraphNumber;
  final int startPosition;
  final int endPosition;
  final String text;
  final String? note;
  final DateTime createdAt;

  BookmarkedSection({
    required this.id,
    required this.paragraphNumber,
    required this.startPosition,
    required this.endPosition,
    required this.text,
    this.note,
    required this.createdAt,
  });

  factory BookmarkedSection.fromJson(Map<String, dynamic> json) {
    return BookmarkedSection(
      id: json['id'] ?? '',
      paragraphNumber: json['paragraphNumber'] ?? 0,
      startPosition: json['startPosition'] ?? 0,
      endPosition: json['endPosition'] ?? 0,
      text: json['text'] ?? '',
      note: json['note'],
      createdAt: DateTime.parse(
        json['createdAt'] ?? DateTime.now().toIso8601String(),
      ),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'paragraphNumber': paragraphNumber,
      'startPosition': startPosition,
      'endPosition': endPosition,
      'text': text,
      'note': note,
      'createdAt': createdAt.toIso8601String(),
    };
  }
}

class VocabularyWord {
  final String word;
  final String definition;
  final String context;
  final int paragraphNumber;
  final bool isLearned;
  final DateTime addedAt;

  VocabularyWord({
    required this.word,
    required this.definition,
    required this.context,
    required this.paragraphNumber,
    required this.isLearned,
    required this.addedAt,
  });

  factory VocabularyWord.fromJson(Map<String, dynamic> json) {
    return VocabularyWord(
      word: json['word'] ?? '',
      definition: json['definition'] ?? '',
      context: json['context'] ?? '',
      paragraphNumber: json['paragraphNumber'] ?? 0,
      isLearned: json['isLearned'] ?? false,
      addedAt: DateTime.parse(
        json['addedAt'] ?? DateTime.now().toIso8601String(),
      ),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'word': word,
      'definition': definition,
      'context': context,
      'paragraphNumber': paragraphNumber,
      'isLearned': isLearned,
      'addedAt': addedAt.toIso8601String(),
    };
  }
}

class ReadingStats {
  final int totalSessions;
  final int completedSessions;
  final int totalWordsRead;
  final int averageReadingSpeed;
  final double averageComprehensionScore;
  final int totalReadingTimeMinutes;
  final DateTime? lastSessionDate;
  final String favoriteLevel;
  final int totalBookmarks;
  final int totalVocabularyWords;

  ReadingStats({
    required this.totalSessions,
    required this.completedSessions,
    required this.totalWordsRead,
    required this.averageReadingSpeed,
    required this.averageComprehensionScore,
    required this.totalReadingTimeMinutes,
    this.lastSessionDate,
    required this.favoriteLevel,
    required this.totalBookmarks,
    required this.totalVocabularyWords,
  });

  factory ReadingStats.fromJson(Map<String, dynamic> json) {
    return ReadingStats(
      totalSessions: json['totalSessions'] ?? 0,
      completedSessions: json['completedSessions'] ?? 0,
      totalWordsRead: json['totalWordsRead'] ?? 0,
      averageReadingSpeed: json['averageReadingSpeed'] ?? 0,
      averageComprehensionScore: (json['averageComprehensionScore'] ?? 0)
          .toDouble(),
      totalReadingTimeMinutes: json['totalReadingTimeMinutes'] ?? 0,
      lastSessionDate: json['lastSessionDate'] != null
          ? DateTime.parse(json['lastSessionDate'])
          : null,
      favoriteLevel: json['favoriteLevel'] ?? 'beginner',
      totalBookmarks: json['totalBookmarks'] ?? 0,
      totalVocabularyWords: json['totalVocabularyWords'] ?? 0,
    );
  }
}

class ReadingPracticeService extends BasePracticeService {
  @override
  String get baseEndpoint => 'practices/reading';

  // Create a new reading practice session
  Future<ReadingPracticeSession?> createReadingSession({
    required String token,
    required String userId,
    String? chapterId,
    String? episodeId,
    required String readingMaterial,
    required String readingTitle,
    String readingLevel = 'beginner',
  }) async {
    final practiceData = {
      'userId': userId,
      'practiceType': 'reading',
      if (chapterId != null) 'chapterId': chapterId,
      if (episodeId != null) 'episodeId': episodeId,
      'readingMaterial': readingMaterial,
      'readingTitle': readingTitle,
      'readingLevel': readingLevel,
    };

    final response = await createPracticeSession(practiceData, token);
    return parseResponse(response, ReadingPracticeSession.fromJson);
  }

  // Get reading practice session
  Future<ReadingPracticeSession?> getReadingSession(
    String sessionId,
    String token,
  ) async {
    final response = await getPracticeSession(sessionId, token);
    return parseResponse(response, ReadingPracticeSession.fromJson);
  }

  // Update reading progress
  Future<ReadingPracticeSession?> updateReadingProgress({
    required String sessionId,
    required String token,
    int? currentParagraph,
    int? wordsRead,
    int? readingTimeSeconds,
    int? progress,
  }) async {
    final updateData = <String, dynamic>{};

    if (currentParagraph != null) {
      updateData['currentParagraph'] = currentParagraph;
    }
    if (wordsRead != null) updateData['wordsRead'] = wordsRead;
    if (readingTimeSeconds != null) {
      updateData['readingTimeSeconds'] = readingTimeSeconds;
    }
    if (progress != null) updateData['progress'] = progress;

    final response = await updatePracticeSession(sessionId, updateData, token);
    return parseResponse(response, ReadingPracticeSession.fromJson);
  }

  // Submit comprehension answer
  Future<ReadingPracticeSession?> submitComprehensionAnswer({
    required String sessionId,
    required String token,
    required String questionId,
    required String answer,
  }) async {
    final endpoint =
        '${EnvironmentConfig.apiBaseUrl}/$baseEndpoint/$sessionId/comprehension-answer';

    final answerData = {'questionId': questionId, 'answer': answer};

    final response = await apiService.post(
      endpoint,
      body: answerData,
      token: token,
    );

    return parseResponse(response, ReadingPracticeSession.fromJson);
  }

  // Add bookmark
  Future<ReadingPracticeSession?> addBookmark({
    required String sessionId,
    required String token,
    required int paragraphNumber,
    required int startPosition,
    required int endPosition,
    required String text,
    String? note,
  }) async {
    final endpoint =
        '${EnvironmentConfig.apiBaseUrl}/$baseEndpoint/$sessionId/bookmark';

    final bookmarkData = {
      'paragraphNumber': paragraphNumber,
      'startPosition': startPosition,
      'endPosition': endPosition,
      'text': text,
      if (note != null) 'note': note,
    };

    final response = await apiService.post(
      endpoint,
      body: bookmarkData,
      token: token,
    );

    return parseResponse(response, ReadingPracticeSession.fromJson);
  }

  // Add vocabulary word
  Future<ReadingPracticeSession?> addVocabularyWord({
    required String sessionId,
    required String token,
    required String word,
    required String definition,
    required String context,
    required int paragraphNumber,
  }) async {
    final endpoint =
        '${EnvironmentConfig.apiBaseUrl}/$baseEndpoint/$sessionId/vocabulary-word';

    final wordData = {
      'word': word,
      'definition': definition,
      'context': context,
      'paragraphNumber': paragraphNumber,
    };

    final response = await apiService.post(
      endpoint,
      body: wordData,
      token: token,
    );

    return parseResponse(response, ReadingPracticeSession.fromJson);
  }

  // Get user reading sessions
  Future<List<ReadingPracticeSession>> getUserReadingSessions({
    required String userId,
    required String token,
    String? level,
    bool? completed,
    double? minComprehensionScore,
    int? limit,
    int? offset,
  }) async {
    final filters = <String, dynamic>{};
    if (level != null) filters['level'] = level;
    if (completed != null) filters['completed'] = completed;
    if (minComprehensionScore != null) {
      filters['minComprehensionScore'] = minComprehensionScore;
    }

    final response = await getUserPracticeSessions(
      userId,
      token,
      filters: filters,
      limit: limit,
      offset: offset,
    );

    return parseListResponse(response, ReadingPracticeSession.fromJson);
  }

  // Get user reading statistics
  Future<ReadingStats?> getUserReadingStats({
    required String userId,
    required String token,
    String? timeframe,
    String? level,
  }) async {
    final additionalFilters = <String, dynamic>{};
    if (level != null) additionalFilters['level'] = level;

    final response = await getUserPracticeStats(
      userId,
      token,
      timeframe: timeframe,
      additionalFilters: additionalFilters,
    );

    return parseResponse(response, ReadingStats.fromJson);
  }
}
