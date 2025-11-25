enum EvaluationStatus {
  approved('approved'),
  rejected('rejected'),
  pending('pending');

  const EvaluationStatus(this.value);
  final String value;

  static EvaluationStatus fromString(String value) {
    return EvaluationStatus.values.firstWhere(
      (status) => status.value == value,
      orElse: () => EvaluationStatus.pending,
    );
  }
}

class ApprovalEvaluation {
  final String id;
  final String userId;
  final String ruleId;
  final String chapterId;
  final double score;
  final double threshold;
  final EvaluationStatus status;
  final int attemptNumber;
  final int errorsFromPreviousAttempts;
  final String? feedback;
  final Map<String, dynamic>? evaluationData;
  final DateTime evaluatedAt;
  final DateTime createdAt;
  final DateTime updatedAt;

  const ApprovalEvaluation({
    required this.id,
    required this.userId,
    required this.ruleId,
    required this.chapterId,
    required this.score,
    required this.threshold,
    required this.status,
    required this.attemptNumber,
    required this.errorsFromPreviousAttempts,
    this.feedback,
    this.evaluationData,
    required this.evaluatedAt,
    required this.createdAt,
    required this.updatedAt,
  });

  factory ApprovalEvaluation.fromJson(Map<String, dynamic> json) {
    return ApprovalEvaluation(
      id: json['id'] as String,
      userId: json['userId'] as String,
      ruleId: json['ruleId'] as String,
      chapterId: json['chapterId'] as String,
      score: (json['score'] as num).toDouble(),
      threshold: (json['threshold'] as num).toDouble(),
      status: EvaluationStatus.fromString(json['status'] as String),
      attemptNumber: json['attemptNumber'] as int,
      errorsFromPreviousAttempts: json['errorsFromPreviousAttempts'] as int,
      feedback: json['feedback'] as String?,
      evaluationData: json['evaluationData'] as Map<String, dynamic>?,
      evaluatedAt: DateTime.parse(json['evaluatedAt'] as String),
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userId': userId,
      'ruleId': ruleId,
      'chapterId': chapterId,
      'score': score,
      'threshold': threshold,
      'status': status.value,
      'attemptNumber': attemptNumber,
      'errorsFromPreviousAttempts': errorsFromPreviousAttempts,
      'feedback': feedback,
      'evaluationData': evaluationData,
      'evaluatedAt': evaluatedAt.toIso8601String(),
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  // Business methods
  bool isApproved() {
    return status == EvaluationStatus.approved;
  }

  bool isRejected() {
    return status == EvaluationStatus.rejected;
  }

  bool isPending() {
    return status == EvaluationStatus.pending;
  }

  double getAdjustedScore() {
    return (score - errorsFromPreviousAttempts).clamp(0.0, 100.0);
  }

  bool hasErrorCarryover() {
    return errorsFromPreviousAttempts > 0;
  }

  double getScoreWithPenalty() {
    return getAdjustedScore();
  }

  bool passedThreshold() {
    return getAdjustedScore() >= threshold;
  }

  String getStatusText() {
    switch (status) {
      case EvaluationStatus.approved:
        return 'Aprobado';
      case EvaluationStatus.rejected:
        return 'Rechazado';
      case EvaluationStatus.pending:
        return 'Pendiente';
    }
  }

  ApprovalEvaluation copyWith({
    String? id,
    String? userId,
    String? ruleId,
    String? chapterId,
    double? score,
    double? threshold,
    EvaluationStatus? status,
    int? attemptNumber,
    int? errorsFromPreviousAttempts,
    String? feedback,
    Map<String, dynamic>? evaluationData,
    DateTime? evaluatedAt,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return ApprovalEvaluation(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      ruleId: ruleId ?? this.ruleId,
      chapterId: chapterId ?? this.chapterId,
      score: score ?? this.score,
      threshold: threshold ?? this.threshold,
      status: status ?? this.status,
      attemptNumber: attemptNumber ?? this.attemptNumber,
      errorsFromPreviousAttempts: errorsFromPreviousAttempts ?? this.errorsFromPreviousAttempts,
      feedback: feedback ?? this.feedback,
      evaluationData: evaluationData ?? this.evaluationData,
      evaluatedAt: evaluatedAt ?? this.evaluatedAt,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is ApprovalEvaluation && other.id == id;
  }

  @override
  int get hashCode => id.hashCode;

  @override
  String toString() {
    return 'ApprovalEvaluation(id: $id, chapterId: $chapterId, status: ${status.value}, score: $score)';
  }
}