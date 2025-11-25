class ReadingHighlightedWord {
  final String word;
  final String definition;
  final int page;

  ReadingHighlightedWord({
    required this.word,
    required this.definition,
    required this.page,
  });

  factory ReadingHighlightedWord.fromJson(Map<String, dynamic> json) {
    return ReadingHighlightedWord(
      word: json['word'] as String,
      definition: json['definition'] as String,
      page: json['page'] as int,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'word': word,
      'definition': definition,
      'page': page,
    };
  }
}
