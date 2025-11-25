class ApprovalMetrics {
  final String id;
  final String userId;
  final String chapterId;
  final String metricType;
  final double value;
  final String? unit;
  final String? description;
  final Map<String, dynamic>? additionalData;
  final DateTime recordedAt;
  final DateTime createdAt;
  final DateTime updatedAt;

  const ApprovalMetrics({
    required this.id,
    required this.userId,
    required this.chapterId,
    required this.metricType,
    required this.value,
    this.unit,
    this.description,
    this.additionalData,
    required this.recordedAt,
    required this.createdAt,
    required this.updatedAt,
  });

  factory ApprovalMetrics.fromJson(Map<String, dynamic> json) {
    return ApprovalMetrics(
      id: json['id'] as String,
      userId: json['userId'] as String,
      chapterId: json['chapterId'] as String,
      metricType: json['metricType'] as String,
      value: (json['value'] as num).toDouble(),
      unit: json['unit'] as String?,
      description: json['description'] as String?,
      additionalData: json['additionalData'] as Map<String, dynamic>?,
      recordedAt: DateTime.parse(json['recordedAt'] as String),
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userId': userId,
      'chapterId': chapterId,
      'metricType': metricType,
      'value': value,
      'unit': unit,
      'description': description,
      'additionalData': additionalData,
      'recordedAt': recordedAt.toIso8601String(),
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  // Business methods
  bool isPerformanceMetric() {
    return ['accuracy', 'speed', 'completion_rate'].contains(metricType);
  }

  bool isEngagementMetric() {
    return ['time_spent', 'attempts', 'retry_rate'].contains(metricType);
  }

  String getFormattedValue() {
    if (unit != null) {
      return '$value $unit';
    }
    return value.toString();
  }

  bool isRecentMetric({int daysThreshold = 7}) {
    final threshold = DateTime.now().subtract(Duration(days: daysThreshold));
    return recordedAt.isAfter(threshold);
  }

  // Static factory methods for common metrics
  static ApprovalMetrics createAccuracyMetric({
    required String id,
    required String userId,
    required String chapterId,
    required double accuracy,
    DateTime? recordedAt,
  }) {
    final now = DateTime.now();
    return ApprovalMetrics(
      id: id,
      userId: userId,
      chapterId: chapterId,
      metricType: 'accuracy',
      value: accuracy,
      unit: 'percentage',
      description: 'User accuracy percentage for chapter',
      recordedAt: recordedAt ?? now,
      createdAt: now,
      updatedAt: now,
    );
  }

  static ApprovalMetrics createSpeedMetric({
    required String id,
    required String userId,
    required String chapterId,
    required double timeSpent,
    DateTime? recordedAt,
  }) {
    final now = DateTime.now();
    return ApprovalMetrics(
      id: id,
      userId: userId,
      chapterId: chapterId,
      metricType: 'speed',
      value: timeSpent,
      unit: 'seconds',
      description: 'Time spent completing chapter',
      recordedAt: recordedAt ?? now,
      createdAt: now,
      updatedAt: now,
    );
  }

  static ApprovalMetrics createAttemptMetric({
    required String id,
    required String userId,
    required String chapterId,
    required int attempts,
    DateTime? recordedAt,
  }) {
    final now = DateTime.now();
    return ApprovalMetrics(
      id: id,
      userId: userId,
      chapterId: chapterId,
      metricType: 'attempts',
      value: attempts.toDouble(),
      unit: 'count',
      description: 'Number of attempts for chapter completion',
      recordedAt: recordedAt ?? now,
      createdAt: now,
      updatedAt: now,
    );
  }

  ApprovalMetrics copyWith({
    String? id,
    String? userId,
    String? chapterId,
    String? metricType,
    double? value,
    String? unit,
    String? description,
    Map<String, dynamic>? additionalData,
    DateTime? recordedAt,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return ApprovalMetrics(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      chapterId: chapterId ?? this.chapterId,
      metricType: metricType ?? this.metricType,
      value: value ?? this.value,
      unit: unit ?? this.unit,
      description: description ?? this.description,
      additionalData: additionalData ?? this.additionalData,
      recordedAt: recordedAt ?? this.recordedAt,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is ApprovalMetrics && other.id == id;
  }

  @override
  int get hashCode => id.hashCode;

  @override
  String toString() {
    return 'ApprovalMetrics(id: $id, type: $metricType, value: $value, unit: $unit)';
  }
}

// Data classes for API responses
class UserMetricsSummary {
  final int totalMetrics;
  final double averageAccuracy;
  final double averageSpeed;
  final int totalAttempts;

  const UserMetricsSummary({
    required this.totalMetrics,
    required this.averageAccuracy,
    required this.averageSpeed,
    required this.totalAttempts,
  });

  factory UserMetricsSummary.fromJson(Map<String, dynamic> json) {
    return UserMetricsSummary(
      totalMetrics: json['totalMetrics'] as int,
      averageAccuracy: (json['averageAccuracy'] as num).toDouble(),
      averageSpeed: (json['averageSpeed'] as num).toDouble(),
      totalAttempts: json['totalAttempts'] as int,
    );
  }
}

class ChapterMetricsSummary {
  final int totalUsers;
  final double averageAccuracy;
  final double averageSpeed;
  final double averageAttempts;

  const ChapterMetricsSummary({
    required this.totalUsers,
    required this.averageAccuracy,
    required this.averageSpeed,
    required this.averageAttempts,
  });

  factory ChapterMetricsSummary.fromJson(Map<String, dynamic> json) {
    return ChapterMetricsSummary(
      totalUsers: json['totalUsers'] as int,
      averageAccuracy: (json['averageAccuracy'] as num).toDouble(),
      averageSpeed: (json['averageSpeed'] as num).toDouble(),
      averageAttempts: (json['averageAttempts'] as num).toDouble(),
    );
  }
}