class VocabularyWord {
  final String word;
  final String meaning;
  final String pronunciation;
  final List<String> examples;
  final String? imageUrl;
  final String? audioUrl;
  final String difficulty;
  final List<String> synonyms;
  final List<String> antonyms;
  final String partOfSpeech;
  
  VocabularyWord({
    required this.word,
    required this.meaning,
    required this.pronunciation,
    required this.examples,
    this.imageUrl,
    this.audioUrl,
    this.difficulty = 'beginner',
    this.synonyms = const [],
    this.antonyms = const [],
    this.partOfSpeech = 'noun',
  });

  factory VocabularyWord.fromJson(Map<String, dynamic> json) {
    return VocabularyWord(
      word: json['word'] ?? '',
      meaning: json['meaning'] ?? '',
      pronunciation: json['pronunciation'] ?? '',
      examples: List<String>.from(json['examples'] ?? []),
      imageUrl: json['imageUrl'],
      audioUrl: json['audioUrl'],
      difficulty: json['difficulty'] ?? 'beginner',
      synonyms: List<String>.from(json['synonyms'] ?? []),
      antonyms: List<String>.from(json['antonyms'] ?? []),
      partOfSpeech: json['partOfSpeech'] ?? 'noun',
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'word': word,
      'meaning': meaning,
      'pronunciation': pronunciation,
      'examples': examples,
      'imageUrl': imageUrl,
      'audioUrl': audioUrl,
      'difficulty': difficulty,
      'synonyms': synonyms,
      'antonyms': antonyms,
      'partOfSpeech': partOfSpeech,
    };
  }

  // Static method to get sample words for testing
  static List<VocabularyWord> getSampleWords() {
    return [
      VocabularyWord(
        word: 'Hello',
        meaning: 'A greeting used when meeting someone',
        pronunciation: '/həˈloʊ/',
        examples: [
          'Hello, how are you?',
          'She said hello to her neighbor.',
          'Hello! Nice to meet you.'
        ],
        difficulty: 'beginner',
        synonyms: ['Hi', 'Hey', 'Greetings'],
        partOfSpeech: 'interjection',
      ),
      VocabularyWord(
        word: 'Beautiful',
        meaning: 'Pleasing the senses or mind aesthetically',
        pronunciation: '/ˈbjuːtɪfʊl/',
        examples: [
          'The sunset was beautiful.',
          'She has a beautiful voice.',
          'What a beautiful day!'
        ],
        difficulty: 'beginner',
        synonyms: ['Pretty', 'Lovely', 'Gorgeous'],
        antonyms: ['Ugly', 'Hideous'],
        partOfSpeech: 'adjective',
      ),
      VocabularyWord(
        word: 'Adventure',
        meaning: 'An unusual and exciting experience or activity',
        pronunciation: '/ədˈventʃər/',
        examples: [
          'Their trip was a great adventure.',
          'He loves adventure stories.',
          'Life is an adventure.'
        ],
        difficulty: 'intermediate',
        synonyms: ['Journey', 'Quest', 'Expedition'],
        partOfSpeech: 'noun',
      ),
      VocabularyWord(
        word: 'Magnificent',
        meaning: 'Impressively beautiful, elaborate, or extravagant',
        pronunciation: '/mæɡˈnɪfɪsənt/',
        examples: [
          'The palace was magnificent.',
          'She gave a magnificent performance.',
          'The view from the mountain was magnificent.'
        ],
        difficulty: 'advanced',
        synonyms: ['Splendid', 'Superb', 'Glorious'],
        antonyms: ['Modest', 'Plain'],
        partOfSpeech: 'adjective',
      ),
      VocabularyWord(
        word: 'Serendipity',
        meaning: 'The occurrence of events by chance in a happy way',
        pronunciation: '/ˌserənˈdɪpɪti/',
        examples: [
          'Meeting her was pure serendipity.',
          'The discovery was a result of serendipity.',
          'Sometimes serendipity leads to great opportunities.'
        ],
        difficulty: 'advanced',
        synonyms: ['Chance', 'Fortune', 'Luck'],
        partOfSpeech: 'noun',
      ),
    ];
  }

  @override
  String toString() {
    return 'VocabularyWord(word: $word, meaning: $meaning, difficulty: $difficulty)';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is VocabularyWord && other.word == word;
  }

  @override
  int get hashCode => word.hashCode;
}