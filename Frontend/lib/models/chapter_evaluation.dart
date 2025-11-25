import 'package:flutter/material.dart';

enum EvaluationStatus { excellent, passed, needsImprovement, failed }

class ChapterEvaluation {
  final String id;
  final int chapterNumber;
  final String chapterTitle;
  final int score;
  final int maxScore;
  final DateTime completedAt;
  final EvaluationStatus status;
  final int attempts;
  final Duration timeSpent;
  final List<SkillEvaluation>? skillBreakdown;
  final String? feedback;

  ChapterEvaluation({
    required this.id,
    required this.chapterNumber,
    required this.chapterTitle,
    required this.score,
    required this.maxScore,
    required this.completedAt,
    required this.status,
    required this.attempts,
    required this.timeSpent,
    this.skillBreakdown,
    this.feedback,
  });

  double get percentage => (score / maxScore) * 100;

  String get statusText {
    switch (status) {
      case EvaluationStatus.excellent:
        return 'Excelente';
      case EvaluationStatus.passed:
        return 'Aprobado';
      case EvaluationStatus.needsImprovement:
        return 'Necesita Mejora';
      case EvaluationStatus.failed:
        return 'Reprobado';
    }
  }

  Color get statusColor {
    switch (status) {
      case EvaluationStatus.excellent:
        return const Color(0xFF4CAF50); // Green
      case EvaluationStatus.passed:
        return const Color(0xFF2196F3); // Blue
      case EvaluationStatus.needsImprovement:
        return const Color(0xFFFF9800); // Orange
      case EvaluationStatus.failed:
        return const Color(0xFFF44336); // Red
    }
  }

  factory ChapterEvaluation.fromJson(Map<String, dynamic> json) {
    return ChapterEvaluation(
      id: json['id'],
      chapterNumber: json['chapterNumber'],
      chapterTitle: json['chapterTitle'],
      score: json['score'],
      maxScore: json['maxScore'],
      completedAt: DateTime.parse(json['completedAt']),
      status: EvaluationStatus.values.firstWhere(
        (e) => e.toString().split('.').last == json['status'],
      ),
      attempts: json['attempts'],
      timeSpent: Duration(seconds: json['timeSpentSeconds']),
      skillBreakdown: json['skillBreakdown'] != null
          ? (json['skillBreakdown'] as List)
                .map((skill) => SkillEvaluation.fromJson(skill))
                .toList()
          : null,
      feedback: json['feedback'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'chapterNumber': chapterNumber,
      'chapterTitle': chapterTitle,
      'score': score,
      'maxScore': maxScore,
      'completedAt': completedAt.toIso8601String(),
      'status': status.toString().split('.').last,
      'attempts': attempts,
      'timeSpentSeconds': timeSpent.inSeconds,
      'skillBreakdown': skillBreakdown?.map((skill) => skill.toJson()).toList(),
      'feedback': feedback,
    };
  }
}

class SkillEvaluation {
  final String skillName;
  final int score;
  final int maxScore;
  final String? feedback;

  SkillEvaluation({
    required this.skillName,
    required this.score,
    required this.maxScore,
    this.feedback,
  });

  double get percentage => (score / maxScore) * 100;

  factory SkillEvaluation.fromJson(Map<String, dynamic> json) {
    return SkillEvaluation(
      skillName: json['skillName'],
      score: json['score'],
      maxScore: json['maxScore'],
      feedback: json['feedback'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'skillName': skillName,
      'score': score,
      'maxScore': maxScore,
      'feedback': feedback,
    };
  }
}
