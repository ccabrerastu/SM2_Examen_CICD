import 'dart:convert';

class DailyLivesModel {
  final String id;
  final String userId;
  final int currentLives;
  final DateTime lastResetDate;
  final bool hasLivesAvailable;
  final String nextReset;
  final DateTime createdAt;
  final DateTime updatedAt;

  const DailyLivesModel({
    required this.id,
    required this.userId,
    required this.currentLives,
    required this.lastResetDate,
    required this.hasLivesAvailable,
    required this.nextReset,
    required this.createdAt,
    required this.updatedAt,
  });

  factory DailyLivesModel.fromJson(Map<String, dynamic> json) {
    return DailyLivesModel(
      id: json['id'],
      userId: json['userId'],
      currentLives: json['currentLives'],
      lastResetDate: DateTime.parse(json['lastResetDate']),
      hasLivesAvailable: json['hasLivesAvailable'],
      nextReset: json['nextReset'],
      createdAt: DateTime.parse(json['createdAt']),
      updatedAt: DateTime.parse(json['updatedAt']),
    );
  }

  factory DailyLivesModel.fromJsonString(String jsonString) {
    return DailyLivesModel.fromJson(json.decode(jsonString));
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userId': userId,
      'currentLives': currentLives,
      'lastResetDate': lastResetDate.toIso8601String(),
      'hasLivesAvailable': hasLivesAvailable,
      'nextReset': nextReset,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  String toJsonString() {
    return json.encode(toJson());
  }

  DailyLivesModel copyWith({
    String? id,
    String? userId,
    int? currentLives,
    DateTime? lastResetDate,
    bool? hasLivesAvailable,
    String? nextReset,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return DailyLivesModel(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      currentLives: currentLives ?? this.currentLives,
      lastResetDate: lastResetDate ?? this.lastResetDate,
      hasLivesAvailable: hasLivesAvailable ?? this.hasLivesAvailable,
      nextReset: nextReset ?? this.nextReset,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is DailyLivesModel &&
        other.id == id &&
        other.userId == userId &&
        other.currentLives == currentLives &&
        other.lastResetDate == lastResetDate &&
        other.hasLivesAvailable == hasLivesAvailable &&
        other.nextReset == nextReset &&
        other.createdAt == createdAt &&
        other.updatedAt == updatedAt;
  }

  @override
  int get hashCode {
    return Object.hash(
      id,
      userId,
      currentLives,
      lastResetDate,
      hasLivesAvailable,
      nextReset,
      createdAt,
      updatedAt,
    );
  }

  @override
  String toString() {
    return 'DailyLivesModel(id: $id, userId: $userId, currentLives: $currentLives, hasLivesAvailable: $hasLivesAvailable)';
  }
}

class ConsumeLifeResponse {
  final bool success;
  final int currentLives;
  final bool hasLivesAvailable;
  final String message;
  final String? nextReset;

  const ConsumeLifeResponse({
    required this.success,
    required this.currentLives,
    required this.hasLivesAvailable,
    required this.message,
    this.nextReset,
  });

  factory ConsumeLifeResponse.fromJson(Map<String, dynamic> json) {
    return ConsumeLifeResponse(
      success: json['success'],
      currentLives: json['currentLives'],
      hasLivesAvailable: json['hasLivesAvailable'],
      message: json['message'],
      nextReset: json['nextReset'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'success': success,
      'currentLives': currentLives,
      'hasLivesAvailable': hasLivesAvailable,
      'message': message,
      'nextReset': nextReset,
    };
  }

  @override
  String toString() {
    return 'ConsumeLifeResponse(success: $success, currentLives: $currentLives, message: $message)';
  }
}

class NoLivesException implements Exception {
  final String error;
  final String message;
  final String nextReset;
  final int currentLives;

  const NoLivesException({
    required this.error,
    required this.message,
    required this.nextReset,
    required this.currentLives,
  });

  factory NoLivesException.fromJson(Map<String, dynamic> json) {
    return NoLivesException(
      error: json['error'],
      message: json['message'],
      nextReset: json['nextReset'],
      currentLives: json['currentLives'],
    );
  }

  @override
  String toString() {
    return 'NoLivesException: $message (Next reset: $nextReset)';
  }
}