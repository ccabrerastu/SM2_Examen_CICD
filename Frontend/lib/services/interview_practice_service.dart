import 'base_practice_service.dart';
import '../utils/environment_config.dart';

// Data models for interview practice
class InterviewPracticeSession {
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

  // Interview-specific fields
  final String interviewType;
  final String difficultyLevel;
  final int totalQuestions;
  final int answeredQuestions;
  final List<InterviewQuestion> questions;
  final List<InterviewAnswer> answers;
  final ConversationFlow conversationFlow;
  final AIEvaluation? aiEvaluation;
  final int speakingTimeSeconds;

  InterviewPracticeSession({
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
    required this.interviewType,
    required this.difficultyLevel,
    required this.totalQuestions,
    required this.answeredQuestions,
    required this.questions,
    required this.answers,
    required this.conversationFlow,
    this.aiEvaluation,
    required this.speakingTimeSeconds,
  });

  factory InterviewPracticeSession.fromJson(Map<String, dynamic> json) {
    return InterviewPracticeSession(
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
      interviewType: json['interviewType'] ?? 'general',
      difficultyLevel: json['difficultyLevel'] ?? 'beginner',
      totalQuestions: json['totalQuestions'] ?? 0,
      answeredQuestions: json['answeredQuestions'] ?? 0,
      questions:
          (json['questions'] as List<dynamic>?)
              ?.map((question) => InterviewQuestion.fromJson(question))
              .toList() ??
          [],
      answers:
          (json['answers'] as List<dynamic>?)
              ?.map((answer) => InterviewAnswer.fromJson(answer))
              .toList() ??
          [],
      conversationFlow: ConversationFlow.fromJson(
        json['conversationFlow'] ?? {},
      ),
      aiEvaluation: json['aiEvaluation'] != null
          ? AIEvaluation.fromJson(json['aiEvaluation'])
          : null,
      speakingTimeSeconds: json['speakingTimeSeconds'] ?? 0,
    );
  }
}

class InterviewQuestion {
  final String id;
  final String question;
  final String category;
  final String difficultyLevel;
  final List<String> expectedKeywords;
  final int timeLimit;
  final String? followUpQuestion;

  InterviewQuestion({
    required this.id,
    required this.question,
    required this.category,
    required this.difficultyLevel,
    required this.expectedKeywords,
    required this.timeLimit,
    this.followUpQuestion,
  });

  factory InterviewQuestion.fromJson(Map<String, dynamic> json) {
    return InterviewQuestion(
      id: json['id'] ?? '',
      question: json['question'] ?? '',
      category: json['category'] ?? 'general',
      difficultyLevel: json['difficultyLevel'] ?? 'beginner',
      expectedKeywords: List<String>.from(json['expectedKeywords'] ?? []),
      timeLimit: json['timeLimit'] ?? 60,
      followUpQuestion: json['followUpQuestion'],
    );
  }
}

class InterviewAnswer {
  final String questionId;
  final String answer;
  final int speakingTimeSeconds;
  final DateTime answeredAt;
  final double confidenceScore;
  final List<String> detectedKeywords;
  final String audioUrl;

  InterviewAnswer({
    required this.questionId,
    required this.answer,
    required this.speakingTimeSeconds,
    required this.answeredAt,
    required this.confidenceScore,
    required this.detectedKeywords,
    required this.audioUrl,
  });

  factory InterviewAnswer.fromJson(Map<String, dynamic> json) {
    return InterviewAnswer(
      questionId: json['questionId'] ?? '',
      answer: json['answer'] ?? '',
      speakingTimeSeconds: json['speakingTimeSeconds'] ?? 0,
      answeredAt: DateTime.parse(
        json['answeredAt'] ?? DateTime.now().toIso8601String(),
      ),
      confidenceScore: (json['confidenceScore'] ?? 0).toDouble(),
      detectedKeywords: List<String>.from(json['detectedKeywords'] ?? []),
      audioUrl: json['audioUrl'] ?? '',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'questionId': questionId,
      'answer': answer,
      'speakingTimeSeconds': speakingTimeSeconds,
      'answeredAt': answeredAt.toIso8601String(),
      'confidenceScore': confidenceScore,
      'detectedKeywords': detectedKeywords,
      'audioUrl': audioUrl,
    };
  }
}

class ConversationFlow {
  final int currentQuestionIndex;
  final List<String> completedQuestions;
  final String flowState;
  final Map<String, dynamic> context;

  ConversationFlow({
    required this.currentQuestionIndex,
    required this.completedQuestions,
    required this.flowState,
    required this.context,
  });

  factory ConversationFlow.fromJson(Map<String, dynamic> json) {
    return ConversationFlow(
      currentQuestionIndex: json['currentQuestionIndex'] ?? 0,
      completedQuestions: List<String>.from(json['completedQuestions'] ?? []),
      flowState: json['flowState'] ?? 'started',
      context: Map<String, dynamic>.from(json['context'] ?? {}),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'currentQuestionIndex': currentQuestionIndex,
      'completedQuestions': completedQuestions,
      'flowState': flowState,
      'context': context,
    };
  }
}

class AIEvaluation {
  final double overallScore;
  final double fluencyScore;
  final double grammarScore;
  final double vocabularyScore;
  final double pronunciationScore;
  final String feedback;
  final List<String> strengths;
  final List<String> improvements;
  final DateTime evaluatedAt;

  AIEvaluation({
    required this.overallScore,
    required this.fluencyScore,
    required this.grammarScore,
    required this.vocabularyScore,
    required this.pronunciationScore,
    required this.feedback,
    required this.strengths,
    required this.improvements,
    required this.evaluatedAt,
  });

  factory AIEvaluation.fromJson(Map<String, dynamic> json) {
    return AIEvaluation(
      overallScore: (json['overallScore'] ?? 0).toDouble(),
      fluencyScore: (json['fluencyScore'] ?? 0).toDouble(),
      grammarScore: (json['grammarScore'] ?? 0).toDouble(),
      vocabularyScore: (json['vocabularyScore'] ?? 0).toDouble(),
      pronunciationScore: (json['pronunciationScore'] ?? 0).toDouble(),
      feedback: json['feedback'] ?? '',
      strengths: List<String>.from(json['strengths'] ?? []),
      improvements: List<String>.from(json['improvements'] ?? []),
      evaluatedAt: DateTime.parse(
        json['evaluatedAt'] ?? DateTime.now().toIso8601String(),
      ),
    );
  }
}

class InterviewStats {
  final int totalSessions;
  final int completedSessions;
  final double averageScore;
  final double averageFluencyScore;
  final double averageGrammarScore;
  final double averageVocabularyScore;
  final double averagePronunciationScore;
  final int totalSpeakingTimeMinutes;
  final DateTime? lastSessionDate;
  final String favoriteInterviewType;
  final int totalQuestionsAnswered;

  InterviewStats({
    required this.totalSessions,
    required this.completedSessions,
    required this.averageScore,
    required this.averageFluencyScore,
    required this.averageGrammarScore,
    required this.averageVocabularyScore,
    required this.averagePronunciationScore,
    required this.totalSpeakingTimeMinutes,
    this.lastSessionDate,
    required this.favoriteInterviewType,
    required this.totalQuestionsAnswered,
  });

  factory InterviewStats.fromJson(Map<String, dynamic> json) {
    return InterviewStats(
      totalSessions: json['totalSessions'] ?? 0,
      completedSessions: json['completedSessions'] ?? 0,
      averageScore: (json['averageScore'] ?? 0).toDouble(),
      averageFluencyScore: (json['averageFluencyScore'] ?? 0).toDouble(),
      averageGrammarScore: (json['averageGrammarScore'] ?? 0).toDouble(),
      averageVocabularyScore: (json['averageVocabularyScore'] ?? 0).toDouble(),
      averagePronunciationScore: (json['averagePronunciationScore'] ?? 0)
          .toDouble(),
      totalSpeakingTimeMinutes: json['totalSpeakingTimeMinutes'] ?? 0,
      lastSessionDate: json['lastSessionDate'] != null
          ? DateTime.parse(json['lastSessionDate'])
          : null,
      favoriteInterviewType: json['favoriteInterviewType'] ?? 'general',
      totalQuestionsAnswered: json['totalQuestionsAnswered'] ?? 0,
    );
  }
}

class InterviewPracticeService extends BasePracticeService {
  @override
  String get baseEndpoint => 'practices/interview';

  // Create a new interview practice session
  Future<InterviewPracticeSession?> createInterviewSession({
    required String token,
    required String userId,
    String? chapterId,
    String? episodeId,
    String interviewType = 'general',
    String difficultyLevel = 'beginner',
    int totalQuestions = 5,
  }) async {
    final practiceData = {
      'userId': userId,
      'practiceType': 'interview',
      if (chapterId != null) 'chapterId': chapterId,
      if (episodeId != null) 'episodeId': episodeId,
      'interviewType': interviewType,
      'difficultyLevel': difficultyLevel,
      'totalQuestions': totalQuestions,
    };

    final response = await createPracticeSession(practiceData, token);
    return parseResponse(response, InterviewPracticeSession.fromJson);
  }

  // Get interview practice session
  Future<InterviewPracticeSession?> getInterviewSession(
    String sessionId,
    String token,
  ) async {
    final response = await getPracticeSession(sessionId, token);
    return parseResponse(response, InterviewPracticeSession.fromJson);
  }

  // Answer interview question
  Future<InterviewPracticeSession?> answerQuestion({
    required String sessionId,
    required String token,
    required String questionId,
    required String answer,
    required int speakingTimeSeconds,
    String? audioUrl,
    double? confidenceScore,
    List<String>? detectedKeywords,
  }) async {
    final endpoint =
        '${EnvironmentConfig.apiBaseUrl}/$baseEndpoint/$sessionId/answer-question';

    final answerData = {
      'questionId': questionId,
      'answer': answer,
      'speakingTimeSeconds': speakingTimeSeconds,
      if (audioUrl != null) 'audioUrl': audioUrl,
      if (confidenceScore != null) 'confidenceScore': confidenceScore,
      if (detectedKeywords != null) 'detectedKeywords': detectedKeywords,
    };

    final response = await apiService.post(
      endpoint,
      body: answerData,
      token: token,
    );

    return parseResponse(response, InterviewPracticeSession.fromJson);
  }

  // Update conversation flow
  Future<InterviewPracticeSession?> updateConversationFlow({
    required String sessionId,
    required String token,
    required ConversationFlow conversationFlow,
  }) async {
    final endpoint =
        '${EnvironmentConfig.apiBaseUrl}/$baseEndpoint/$sessionId/conversation-flow';

    final response = await apiService.put(
      endpoint,
      body: conversationFlow.toJson(),
      token: token,
    );

    return parseResponse(response, InterviewPracticeSession.fromJson);
  }

  // Request AI evaluation
  Future<InterviewPracticeSession?> requestAIEvaluation({
    required String sessionId,
    required String token,
  }) async {
    final endpoint =
        '${EnvironmentConfig.apiBaseUrl}/$baseEndpoint/$sessionId/ai-evaluation';

    final response = await apiService.post(endpoint, body: {}, token: token);

    return parseResponse(response, InterviewPracticeSession.fromJson);
  }

  // Complete interview session
  Future<InterviewPracticeSession?> completeInterview({
    required String sessionId,
    required String token,
    required int totalSpeakingTime,
  }) async {
    final endpoint =
        '${EnvironmentConfig.apiBaseUrl}/$baseEndpoint/$sessionId/complete';

    final completionData = {
      'totalSpeakingTime': totalSpeakingTime,
      'status': 'completed',
    };

    final response = await apiService.post(
      endpoint,
      body: completionData,
      token: token,
    );

    return parseResponse(response, InterviewPracticeSession.fromJson);
  }

  // Get user interview sessions
  Future<List<InterviewPracticeSession>> getUserInterviewSessions({
    required String userId,
    required String token,
    String? interviewType,
    String? difficultyLevel,
    bool? completed,
    double? minScore,
    int? limit,
    int? offset,
  }) async {
    final filters = <String, dynamic>{};
    if (interviewType != null) filters['interviewType'] = interviewType;
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

    return parseListResponse(response, InterviewPracticeSession.fromJson);
  }

  // Get user interview statistics
  Future<InterviewStats?> getUserInterviewStats({
    required String userId,
    required String token,
    String? timeframe,
    String? interviewType,
    String? difficultyLevel,
  }) async {
    final additionalFilters = <String, dynamic>{};
    if (interviewType != null) {
      additionalFilters['interviewType'] = interviewType;
    }
    if (difficultyLevel != null) {
      additionalFilters['difficultyLevel'] = difficultyLevel;
    }

    final response = await getUserPracticeStats(
      userId,
      token,
      timeframe: timeframe,
      additionalFilters: additionalFilters,
    );

    return parseResponse(response, InterviewStats.fromJson);
  }
}
