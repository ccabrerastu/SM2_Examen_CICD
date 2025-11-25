class ReadingQuizQuestion {
  final String id;
  final String readingContentId;
  final String questionText;
  final List<String> options; // Array of 4 options
  final int correctAnswer; // Index 0-3 of the correct option
  final String hint;
  final int order;
  final bool hasExplanation;

  ReadingQuizQuestion({
    required this.id,
    required this.readingContentId,
    required this.questionText,
    required this.options,
    required this.correctAnswer,
    required this.hint,
    required this.order,
    required this.hasExplanation,
  });

  factory ReadingQuizQuestion.fromJson(Map<String, dynamic> json) {
    return ReadingQuizQuestion(
      id: json['id'] as String,
      readingContentId: json['readingContentId'] as String,
      questionText: json['questionText'] as String,
      options: (json['options'] as List).map((e) => e as String).toList(),
      correctAnswer: (json['correctAnswer'] ?? 0) as int,
      hint: json['hint'] as String? ?? '',
      order: json['order'] as int,
      hasExplanation: json['hasExplanation'] as bool? ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'readingContentId': readingContentId,
      'questionText': questionText,
      'options': options,
      'correctAnswer': correctAnswer,
      'hint': hint,
      'order': order,
      'hasExplanation': hasExplanation,
    };
  }

  bool isCorrectAnswer(int answerIndex) {
    return answerIndex == correctAnswer;
  }
}

class ReadingQuizQuestionsResponse {
  final List<ReadingQuizQuestion> questions;
  final int totalQuestions;
  final String message;

  ReadingQuizQuestionsResponse({
    required this.questions,
    required this.totalQuestions,
    required this.message,
  });

  factory ReadingQuizQuestionsResponse.fromJson(Map<String, dynamic> json) {
    final data = json['data'] as Map<String, dynamic>;
    return ReadingQuizQuestionsResponse(
      questions: (data['questions'] as List)
          .map((item) => ReadingQuizQuestion.fromJson(item as Map<String, dynamic>))
          .toList(),
      totalQuestions: data['totalQuestions'] as int,
      message: json['message'] as String,
    );
  }
}
