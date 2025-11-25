import 'rule_type.dart';

class ApprovalRule {
  final String id;
  final String name;
  final String? description;
  final String? chapterId;
  final RuleType ruleType;
  final double? threshold;
  final double minScoreThreshold;
  final int maxAttempts;
  final bool allowErrorCarryover;
  final bool isActive;
  final Map<String, dynamic>? metadata;
  final DateTime createdAt;
  final DateTime updatedAt;

  const ApprovalRule({
    required this.id,
    required this.name,
    this.description,
    this.chapterId,
    required this.ruleType,
    this.threshold,
    required this.minScoreThreshold,
    required this.maxAttempts,
    required this.allowErrorCarryover,
    required this.isActive,
    this.metadata,
    required this.createdAt,
    required this.updatedAt,
  });

  factory ApprovalRule.fromJson(Map<String, dynamic> json) {
    return ApprovalRule(
      id: json['id'] as String,
      name: json['name'] as String,
      description: json['description'] as String?,
      chapterId: json['chapterId'] as String?,
      ruleType: RuleType.fromString(json['ruleType'] as String? ?? 'score'),
      threshold: json['threshold'] != null ? (json['threshold'] as num).toDouble() : null,
      minScoreThreshold: (json['minScoreThreshold'] as num).toDouble(),
      maxAttempts: json['maxAttempts'] as int,
      allowErrorCarryover: json['allowErrorCarryover'] as bool,
      isActive: json['isActive'] as bool,
      metadata: json['metadata'] as Map<String, dynamic>?,
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'chapterId': chapterId,
      'ruleType': ruleType.value,
      'threshold': threshold,
      'minScoreThreshold': minScoreThreshold,
      'maxAttempts': maxAttempts,
      'allowErrorCarryover': allowErrorCarryover,
      'isActive': isActive,
      'metadata': metadata,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  // Business methods
  bool isApplicableToChapter(String chapterId) {
    return this.chapterId == null || this.chapterId == chapterId;
  }

  bool isScoreApproved(double score) {
    return score >= minScoreThreshold;
  }

  bool hasSpecialRequirements() {
    return metadata != null && metadata!.isNotEmpty;
  }

  double getThresholdPercentage() {
    return minScoreThreshold;
  }

  bool canRetryAfterFailure(int currentAttempts) {
    return currentAttempts < maxAttempts;
  }

  ApprovalRule copyWith({
    String? id,
    String? name,
    String? description,
    String? chapterId,
    RuleType? ruleType,
    double? threshold,
    double? minScoreThreshold,
    int? maxAttempts,
    bool? allowErrorCarryover,
    bool? isActive,
    Map<String, dynamic>? metadata,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return ApprovalRule(
      id: id ?? this.id,
      name: name ?? this.name,
      description: description ?? this.description,
      chapterId: chapterId ?? this.chapterId,
      ruleType: ruleType ?? this.ruleType,
      threshold: threshold ?? this.threshold,
      minScoreThreshold: minScoreThreshold ?? this.minScoreThreshold,
      maxAttempts: maxAttempts ?? this.maxAttempts,
      allowErrorCarryover: allowErrorCarryover ?? this.allowErrorCarryover,
      isActive: isActive ?? this.isActive,
      metadata: metadata ?? this.metadata,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is ApprovalRule && other.id == id;
  }

  @override
  int get hashCode => id.hashCode;

  @override
  String toString() {
    return 'ApprovalRule(id: $id, name: $name, chapterId: $chapterId, threshold: $minScoreThreshold)';
  }
}