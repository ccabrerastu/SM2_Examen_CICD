import 'interview_question.dart';

class InterviewSession {
  final String sessionId;
  final String topicId;
  final String topicName;
  final int totalQuestions;
  final int estimatedDurationMinutes;
  final List<InterviewQuestion> questions;
  final DateTime startedAt;
  final int currentQuestionIndex;

  InterviewSession({
    required this.sessionId,
    required this.topicId,
    required this.topicName,
    required this.totalQuestions,
    required this.estimatedDurationMinutes,
    required this.questions,
    required this.startedAt,
    this.currentQuestionIndex = 0,
  });

  factory InterviewSession.fromJson(Map<String, dynamic> json) {
    return InterviewSession(
      sessionId: json['sessionId'] as String,
      topicId: json['topicId'] as String,
      topicName: json['topicName'] as String,
      totalQuestions: json['totalQuestions'] as int,
      estimatedDurationMinutes: json['estimatedDurationMinutes'] as int,
      questions: (json['questions'] as List)
          .map((q) => InterviewQuestion.fromJson(q as Map<String, dynamic>))
          .toList(),
      startedAt: DateTime.parse(json['startedAt'] as String),
      currentQuestionIndex: json['currentQuestionIndex'] as int? ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'sessionId': sessionId,
      'topicId': topicId,
      'topicName': topicName,
      'totalQuestions': totalQuestions,
      'estimatedDurationMinutes': estimatedDurationMinutes,
      'questions': questions.map((q) => q.toJson()).toList(),
      'startedAt': startedAt.toIso8601String(),
      'currentQuestionIndex': currentQuestionIndex,
    };
  }
}

class AnswerEvaluation {
  final String questionId;
  final String questionText;
  final String answerText;
  final int answerLength;
  final DateTime submittedAt;
  final double? fluencyScore;
  final double? grammarScore;
  final double? vocabularyScore;
  final double? pronunciationScore;
  final double? coherenceScore;
  final double? overallQuestionScore;
  final String? aiFeedback;
  final List<String>? detectedIssues;
  final List<String>? suggestedImprovements;
  final int? timeSpentSeconds;
  final int? attemptNumber;

  AnswerEvaluation({
    required this.questionId,
    required this.questionText,
    required this.answerText,
    required this.answerLength,
    required this.submittedAt,
    this.fluencyScore,
    this.grammarScore,
    this.vocabularyScore,
    this.pronunciationScore,
    this.coherenceScore,
    this.overallQuestionScore,
    this.aiFeedback,
    this.detectedIssues,
    this.suggestedImprovements,
    this.timeSpentSeconds,
    this.attemptNumber,
  });

  factory AnswerEvaluation.fromJson(Map<String, dynamic> json) {
    return AnswerEvaluation(
      questionId: json['questionId'] as String,
      questionText: json['questionText'] as String,
      answerText: json['answerText'] as String,
      answerLength: json['answerLength'] as int,
      submittedAt: DateTime.parse(json['submittedAt'] as String),
      fluencyScore: json['fluencyScore'] as double?,
      grammarScore: json['grammarScore'] as double?,
      vocabularyScore: json['vocabularyScore'] as double?,
      pronunciationScore: json['pronunciationScore'] as double?,
      coherenceScore: json['coherenceScore'] as double?,
      overallQuestionScore: json['overallQuestionScore'] as double?,
      aiFeedback: json['aiFeedback'] as String?,
      detectedIssues: json['detectedIssues'] != null
          ? List<String>.from(json['detectedIssues'] as List)
          : null,
      suggestedImprovements: json['suggestedImprovements'] != null
          ? List<String>.from(json['suggestedImprovements'] as List)
          : null,
      timeSpentSeconds: json['timeSpentSeconds'] as int?,
      attemptNumber: json['attemptNumber'] as int?,
    );
  }
}

class SubmitAnswerResponse {
  final bool success;
  final AnswerEvaluation evaluation;
  final int currentQuestionIndex;
  final int questionsAnswered;
  final int totalQuestions;
  final bool isCompleted;
  final NextQuestion? nextQuestion;

  SubmitAnswerResponse({
    required this.success,
    required this.evaluation,
    required this.currentQuestionIndex,
    required this.questionsAnswered,
    required this.totalQuestions,
    required this.isCompleted,
    this.nextQuestion,
  });

  factory SubmitAnswerResponse.fromJson(Map<String, dynamic> json) {
    return SubmitAnswerResponse(
      success: json['success'] as bool,
      evaluation: AnswerEvaluation.fromJson(json['evaluation'] as Map<String, dynamic>),
      currentQuestionIndex: json['currentQuestionIndex'] as int,
      questionsAnswered: json['questionsAnswered'] as int,
      totalQuestions: json['totalQuestions'] as int,
      isCompleted: json['isCompleted'] as bool,
      nextQuestion: json['nextQuestion'] != null
          ? NextQuestion.fromJson(json['nextQuestion'] as Map<String, dynamic>)
          : null,
    );
  }
}

class NextQuestion {
  final String questionId;
  final String questionText;
  final String category;
  final String difficulty;

  NextQuestion({
    required this.questionId,
    required this.questionText,
    required this.category,
    required this.difficulty,
  });

  factory NextQuestion.fromJson(Map<String, dynamic> json) {
    return NextQuestion(
      questionId: json['questionId'] as String,
      questionText: json['questionText'] as String,
      category: json['category'] as String,
      difficulty: json['difficulty'] as String,
    );
  }
}

class SessionScore {
  final String sessionId;
  final String topicId;
  final String topicName;
  final String status;
  final ScoreBreakdown scores;
  final bool passed;
  final String finalFeedback;
  final List<String> strengths;
  final List<String> areasForImprovement;
  final List<QuestionAnswerSummary> questionAnswers;
  final int totalQuestions;
  final int questionsAnswered;
  final int totalTimeSpentSeconds;
  final DateTime startedAt;
  final DateTime completedAt;

  SessionScore({
    required this.sessionId,
    required this.topicId,
    required this.topicName,
    required this.status,
    required this.scores,
    required this.passed,
    required this.finalFeedback,
    required this.strengths,
    required this.areasForImprovement,
    required this.questionAnswers,
    required this.totalQuestions,
    required this.questionsAnswered,
    required this.totalTimeSpentSeconds,
    required this.startedAt,
    required this.completedAt,
  });

  factory SessionScore.fromJson(Map<String, dynamic> json) {
    return SessionScore(
      sessionId: json['sessionId'] as String,
      topicId: json['topicId'] as String,
      topicName: json['topicName'] as String,
      status: json['status'] as String,
      scores: ScoreBreakdown.fromJson(json['scores'] as Map<String, dynamic>),
      passed: json['passed'] as bool,
      finalFeedback: json['finalFeedback'] as String,
      strengths: List<String>.from(json['strengths'] as List),
      areasForImprovement: List<String>.from(json['areasForImprovement'] as List),
      questionAnswers: (json['questionAnswers'] as List)
          .map((q) => QuestionAnswerSummary.fromJson(q as Map<String, dynamic>))
          .toList(),
      totalQuestions: json['totalQuestions'] as int,
      questionsAnswered: json['questionsAnswered'] as int,
      totalTimeSpentSeconds: json['totalTimeSpentSeconds'] as int,
      startedAt: DateTime.parse(json['startedAt'] as String),
      completedAt: DateTime.parse(json['completedAt'] as String),
    );
  }
}

class ScoreBreakdown {
  final double fluencyScore;
  final double grammarScore;
  final double vocabularyScore;
  final double pronunciationScore;
  final double coherenceScore;
  final double overallScore;

  ScoreBreakdown({
    required this.fluencyScore,
    required this.grammarScore,
    required this.vocabularyScore,
    required this.pronunciationScore,
    required this.coherenceScore,
    required this.overallScore,
  });

  factory ScoreBreakdown.fromJson(Map<String, dynamic> json) {
    return ScoreBreakdown(
      fluencyScore: (json['fluencyScore'] as num).toDouble(),
      grammarScore: (json['grammarScore'] as num).toDouble(),
      vocabularyScore: (json['vocabularyScore'] as num).toDouble(),
      pronunciationScore: (json['pronunciationScore'] as num).toDouble(),
      coherenceScore: (json['coherenceScore'] as num).toDouble(),
      overallScore: (json['overallScore'] as num).toDouble(),
    );
  }
}

class QuestionAnswerSummary {
  final String questionId;
  final String questionText;
  final String category;
  final String answerText;
  final double score;
  final String? feedback;

  QuestionAnswerSummary({
    required this.questionId,
    required this.questionText,
    required this.category,
    required this.answerText,
    required this.score,
    this.feedback,
  });

  factory QuestionAnswerSummary.fromJson(Map<String, dynamic> json) {
    return QuestionAnswerSummary(
      questionId: json['questionId'] as String,
      questionText: json['questionText'] as String,
      category: json['category'] as String,
      answerText: json['answerText'] as String,
      score: (json['score'] as num).toDouble(),
      feedback: json['feedback'] as String?,
    );
  }
}
