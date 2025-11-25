class VocabularyItem {
  final String id;
  final String englishTerm;
  final String spanishTranslation;
  final String? type;
  final String? difficulty;
  final String? definition;
  final String? exampleSentence;
  final String? pronunciation;
  final String? audioUrl;

  VocabularyItem({
    required this.id,
    required this.englishTerm,
    required this.spanishTranslation,
    this.type,
    this.difficulty,
    this.definition,
    this.exampleSentence,
    this.pronunciation,
    this.audioUrl,
  });

  factory VocabularyItem.fromJson(Map<String, dynamic> json) {
    return VocabularyItem(
      id: json['id'] as String,
      englishTerm: json['englishTerm'] as String,
      spanishTranslation: json['spanishTranslation'] as String,
      type: json['type'] as String?,
      difficulty: json['difficulty'] as String?,
      definition: json['definition'] as String?,
      exampleSentence: json['exampleSentence'] as String?,
      pronunciation: json['pronunciation'] as String?,
      audioUrl: json['audioUrl'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'englishTerm': englishTerm,
      'spanishTranslation': spanishTranslation,
      'type': type,
      'difficulty': difficulty,
      'definition': definition,
      'exampleSentence': exampleSentence,
      'pronunciation': pronunciation,
      'audioUrl': audioUrl,
    };
  }
}

class VocabularyItemsResponse {
  final List<VocabularyItem> items;
  final int total;
  final int page;
  final int limit;
  final int totalPages;
  final bool hasNextPage;
  final bool hasPreviousPage;

  VocabularyItemsResponse({
    required this.items,
    required this.total,
    required this.page,
    required this.limit,
    required this.totalPages,
    required this.hasNextPage,
    required this.hasPreviousPage,
  });

  factory VocabularyItemsResponse.fromJson(Map<String, dynamic> json) {
    final data = json['data'] as Map<String, dynamic>;
    return VocabularyItemsResponse(
      items: (data['items'] as List)
          .map((item) => VocabularyItem.fromJson(item as Map<String, dynamic>))
          .toList(),
      total: data['total'] as int,
      page: data['page'] as int,
      limit: data['limit'] as int,
      totalPages: data['totalPages'] as int,
      hasNextPage: data['hasNextPage'] as bool,
      hasPreviousPage: data['hasPreviousPage'] as bool,
    );
  }
}
