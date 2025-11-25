import 'base_practice_service.dart';
import '../utils/environment_config.dart';

// Data models for quiz practice
class QuizPracticeSession {
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

  // Quiz-specific fields
  final int totalQuestions;
  final int answeredQuestions;
  final int correctAnswers;
  final int incorrectAnswers;
  final String quizCategory;
  final String difficultyLevel;
  final int timeSpentSeconds;
  final List<QuestionResult> questionResults;

  QuizPracticeSession({
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
    required this.totalQuestions,
    required this.answeredQuestions,
    required this.correctAnswers,
    required this.incorrectAnswers,
    required this.quizCategory,
    required this.difficultyLevel,
    required this.timeSpentSeconds,
    required this.questionResults,
  });

  factory QuizPracticeSession.fromJson(Map<String, dynamic> json) {
    return QuizPracticeSession(
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
      totalQuestions: json['totalQuestions'] ?? 0,
      answeredQuestions: json['answeredQuestions'] ?? 0,
      correctAnswers: json['correctAnswers'] ?? 0,
      incorrectAnswers: json['incorrectAnswers'] ?? 0,
      quizCategory: json['quizCategory'] ?? 'general',
      difficultyLevel: json['difficultyLevel'] ?? 'beginner',
      timeSpentSeconds: json['timeSpentSeconds'] ?? 0,
      questionResults:
          (json['questionResults'] as List<dynamic>?)
              ?.map((result) => QuestionResult.fromJson(result))
              .toList() ??
          [],
    );
  }
}

class QuestionResult {
  final int questionNumber;
  final String question;
  final List<String> options;
  final int correctAnswer;
  final int? userAnswer;
  final bool isCorrect;
  final int timeSpentSeconds;
  final DateTime answeredAt;

  QuestionResult({
    required this.questionNumber,
    required this.question,
    required this.options,
    required this.correctAnswer,
    this.userAnswer,
    required this.isCorrect,
    required this.timeSpentSeconds,
    required this.answeredAt,
  });

  factory QuestionResult.fromJson(Map<String, dynamic> json) {
    return QuestionResult(
      questionNumber: json['questionNumber'] ?? 0,
      question: json['question'] ?? '',
      options: List<String>.from(json['options'] ?? []),
      correctAnswer: json['correctAnswer'] ?? 0,
      userAnswer: json['userAnswer'],
      isCorrect: json['isCorrect'] ?? false,
      timeSpentSeconds: json['timeSpentSeconds'] ?? 0,
      answeredAt: DateTime.parse(
        json['answeredAt'] ?? DateTime.now().toIso8601String(),
      ),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'questionNumber': questionNumber,
      'question': question,
      'options': options,
      'correctAnswer': correctAnswer,
      'userAnswer': userAnswer,
      'isCorrect': isCorrect,
      'timeSpentSeconds': timeSpentSeconds,
      'answeredAt': answeredAt.toIso8601String(),
    };
  }
}

class QuizStats {
  final int totalSessions;
  final int completedSessions;
  final double averageScore;
  final double averageAccuracy;
  final int totalQuestionsAnswered;
  final int totalCorrectAnswers;
  final int averageTimePerQuestion;
  final DateTime? lastSessionDate;
  final String favoriteCategory;

  QuizStats({
    required this.totalSessions,
    required this.completedSessions,
    required this.averageScore,
    required this.averageAccuracy,
    required this.totalQuestionsAnswered,
    required this.totalCorrectAnswers,
    required this.averageTimePerQuestion,
    this.lastSessionDate,
    required this.favoriteCategory,
  });

  factory QuizStats.fromJson(Map<String, dynamic> json) {
    return QuizStats(
      totalSessions: json['totalSessions'] ?? 0,
      completedSessions: json['completedSessions'] ?? 0,
      averageScore: (json['averageScore'] ?? 0).toDouble(),
      averageAccuracy: (json['averageAccuracy'] ?? 0).toDouble(),
      totalQuestionsAnswered: json['totalQuestionsAnswered'] ?? 0,
      totalCorrectAnswers: json['totalCorrectAnswers'] ?? 0,
      averageTimePerQuestion: json['averageTimePerQuestion'] ?? 0,
      lastSessionDate: json['lastSessionDate'] != null
          ? DateTime.parse(json['lastSessionDate'])
          : null,
      favoriteCategory: json['favoriteCategory'] ?? 'general',
    );
  }
}

class QuizPracticeService extends BasePracticeService {
  @override
  String get baseEndpoint => 'practices/quiz';

  // Create a new quiz practice session
  Future<QuizPracticeSession?> createQuizSession({
    required String token,
    required String userId,
    String? chapterId,
    String? episodeId,
    String quizCategory = 'general',
    String difficultyLevel = 'beginner',
    int totalQuestions = 10,
  }) async {
    final practiceData = {
      'userId': userId,
      'practiceType': 'quiz',
      if (chapterId != null) 'chapterId': chapterId,
      if (episodeId != null) 'episodeId': episodeId,
      'quizCategory': quizCategory,
      'difficultyLevel': difficultyLevel,
      'totalQuestions': totalQuestions,
    };

    final response = await createPracticeSession(practiceData, token);
    return parseResponse(response, QuizPracticeSession.fromJson);
  }

  // Get quiz practice session
  Future<QuizPracticeSession?> getQuizSession(
    String sessionId,
    String token,
  ) async {
    final response = await getPracticeSession(sessionId, token);
    return parseResponse(response, QuizPracticeSession.fromJson);
  }

  // Update quiz practice session
  Future<QuizPracticeSession?> updateQuizSession({
    required String sessionId,
    required String token,
    int? progress,
    double? score,
    String? status,
    int? answeredQuestions,
    int? correctAnswers,
    int? incorrectAnswers,
    int? timeSpentSeconds,
    List<QuestionResult>? questionResults,
  }) async {
    final updateData = <String, dynamic>{};

    if (progress != null) updateData['progress'] = progress;
    if (score != null) updateData['score'] = score;
    if (status != null) updateData['status'] = status;
    if (answeredQuestions != null) {
      updateData['answeredQuestions'] = answeredQuestions;
    }
    if (correctAnswers != null) updateData['correctAnswers'] = correctAnswers;
    if (incorrectAnswers != null) {
      updateData['incorrectAnswers'] = incorrectAnswers;
    }
    if (timeSpentSeconds != null) {
      updateData['timeSpentSeconds'] = timeSpentSeconds;
    }
    if (questionResults != null) {
      updateData['questionResults'] = questionResults
          .map((result) => result.toJson())
          .toList();
    }

    final response = await updatePracticeSession(sessionId, updateData, token);
    return parseResponse(response, QuizPracticeSession.fromJson);
  }

  // Answer a quiz question
  Future<QuizPracticeSession?> answerQuestion({
    required String sessionId,
    required String token,
    required int questionNumber,
    required int userAnswer,
    required int timeSpentSeconds,
  }) async {
    final endpoint =
        '${EnvironmentConfig.apiBaseUrl}/$baseEndpoint/$sessionId/answer-question';

    final answerData = {
      'questionNumber': questionNumber,
      'userAnswer': userAnswer,
      'timeSpentSeconds': timeSpentSeconds,
    };

    final response = await apiService.post(
      endpoint,
      body: answerData,
      token: token,
    );

    return parseResponse(response, QuizPracticeSession.fromJson);
  }

  // Complete quiz session
  Future<QuizPracticeSession?> completeQuiz({
    required String sessionId,
    required String token,
    required int totalTimeSpent,
  }) async {
    final endpoint =
        '${EnvironmentConfig.apiBaseUrl}/$baseEndpoint/$sessionId/complete';

    final completionData = {
      'totalTimeSpent': totalTimeSpent,
      'status': 'completed',
    };

    final response = await apiService.post(
      endpoint,
      body: completionData,
      token: token,
    );

    return parseResponse(response, QuizPracticeSession.fromJson);
  }

  // Get user quiz sessions
  Future<List<QuizPracticeSession>> getUserQuizSessions({
    required String userId,
    required String token,
    String? category,
    String? difficultyLevel,
    bool? completed,
    double? minScore,
    int? limit,
    int? offset,
  }) async {
    final filters = <String, dynamic>{};
    if (category != null) filters['category'] = category;
    if (difficultyLevel != null) filters['difficultyLevel'] = difficultyLevel;
    if (completed != null) filters['completed'] = completed;
    if (minScore != null) filters['minScore'] = minScore;

    final response = await getUserPracticeSessions(
      userId,
      token,
      filters: filters,
      limit: limit,
      offset: offset,
    );

    return parseListResponse(response, QuizPracticeSession.fromJson);
  }

  // Get user quiz statistics
  Future<QuizStats?> getUserQuizStats({
    required String userId,
    required String token,
    String? timeframe,
    String? category,
    String? difficultyLevel,
  }) async {
    final additionalFilters = <String, dynamic>{};
    if (category != null) additionalFilters['category'] = category;
    if (difficultyLevel != null) {
      additionalFilters['difficultyLevel'] = difficultyLevel;
    }

    final response = await getUserPracticeStats(
      userId,
      token,
      timeframe: timeframe,
      additionalFilters: additionalFilters,
    );

    return parseResponse(response, QuizStats.fromJson);
  }
}
