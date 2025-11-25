class InterviewTopic {
  final String id;
  final String name;
  final String? description;
  final String category;
  final String difficulty;
  final String? iconName;
  final String? iconUrl;
  final bool isActive;
  final int order;
  final int estimatedDurationMinutes;
  final int totalQuestions;

  InterviewTopic({
    required this.id,
    required this.name,
    this.description,
    required this.category,
    required this.difficulty,
    this.iconName,
    this.iconUrl,
    required this.isActive,
    required this.order,
    required this.estimatedDurationMinutes,
    required this.totalQuestions,
  });

  factory InterviewTopic.fromJson(Map<String, dynamic> json) {
    return InterviewTopic(
      id: json['id'] as String,
      name: json['name'] as String,
      description: json['description'] as String?,
      category: json['category'] as String,
      difficulty: json['difficulty'] as String,
      iconName: json['iconName'] as String?,
      iconUrl: json['iconUrl'] as String?,
      isActive: json['isActive'] as bool,
      order: json['order'] as int,
      estimatedDurationMinutes: json['estimatedDurationMinutes'] as int,
      totalQuestions: json['totalQuestions'] as int,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'category': category,
      'difficulty': difficulty,
      'iconName': iconName,
      'iconUrl': iconUrl,
      'isActive': isActive,
      'order': order,
      'estimatedDurationMinutes': estimatedDurationMinutes,
      'totalQuestions': totalQuestions,
    };
  }
}
