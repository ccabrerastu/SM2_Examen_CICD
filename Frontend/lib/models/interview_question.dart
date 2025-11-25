class InterviewQuestion {
  final String id;
  final String question;
  final String category;
  final String difficulty;
  final String categoryLabel;
  final int minimumAnswerLength;
  final int recommendedTimeSeconds;
  final int order;
  final List<String>? sampleAnswers;

  InterviewQuestion({
    required this.id,
    required this.question,
    required this.category,
    required this.difficulty,
    required this.categoryLabel,
    required this.minimumAnswerLength,
    required this.recommendedTimeSeconds,
    required this.order,
    this.sampleAnswers,
  });

  factory InterviewQuestion.fromJson(Map<String, dynamic> json) {
    return InterviewQuestion(
      id: json['id'] as String,
      question: json['question'] as String,
      category: json['category'] as String,
      difficulty: json['difficulty'] as String,
      categoryLabel: json['categoryLabel'] as String,
      minimumAnswerLength: json['minimumAnswerLength'] as int,
      recommendedTimeSeconds: json['recommendedTimeSeconds'] as int,
      order: json['order'] as int,
      sampleAnswers: json['sampleAnswers'] != null
          ? List<String>.from(json['sampleAnswers'] as List)
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'question': question,
      'category': category,
      'difficulty': difficulty,
      'categoryLabel': categoryLabel,
      'minimumAnswerLength': minimumAnswerLength,
      'recommendedTimeSeconds': recommendedTimeSeconds,
      'order': order,
      'sampleAnswers': sampleAnswers,
    };
  }
}
