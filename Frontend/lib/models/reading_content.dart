import 'reading_highlighted_word.dart';

class ReadingContent {
  final String id;
  final String readingChapterId;
  final String title;
  final List<String> content; // Array of 3 page strings
  final List<ReadingHighlightedWord> highlightedWords;
  final int totalPages;
  final int? estimatedReadingTime;
  final String? topic;
  final String level;

  ReadingContent({
    required this.id,
    required this.readingChapterId,
    required this.title,
    required this.content,
    required this.highlightedWords,
    required this.totalPages,
    this.estimatedReadingTime,
    this.topic,
    required this.level,
  });

  factory ReadingContent.fromJson(Map<String, dynamic> json) {
    return ReadingContent(
      id: json['id'] as String,
      readingChapterId: json['readingChapterId'] as String,
      title: json['title'] as String,
      content: (json['content'] as List).map((e) => e as String).toList(),
      highlightedWords: (json['highlightedWords'] as List)
          .map((item) => ReadingHighlightedWord.fromJson(item as Map<String, dynamic>))
          .toList(),
      totalPages: json['totalPages'] as int,
      estimatedReadingTime: json['estimatedReadingTime'] as int?,
      topic: json['topic'] as String?,
      level: json['level'] as String,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'readingChapterId': readingChapterId,
      'title': title,
      'content': content,
      'highlightedWords': highlightedWords.map((word) => word.toJson()).toList(),
      'totalPages': totalPages,
      'estimatedReadingTime': estimatedReadingTime,
      'topic': topic,
      'level': level,
    };
  }
}

class ReadingContentResponse {
  final ReadingContent data;
  final String message;

  ReadingContentResponse({
    required this.data,
    required this.message,
  });

  factory ReadingContentResponse.fromJson(Map<String, dynamic> json) {
    return ReadingContentResponse(
      data: ReadingContent.fromJson(json['data'] as Map<String, dynamic>),
      message: json['message'] as String,
    );
  }
}
