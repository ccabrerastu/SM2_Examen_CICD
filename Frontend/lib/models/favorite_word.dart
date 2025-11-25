class FavoriteWord {
  // --- HU-007-4 (backend v1) ---
  final String? userId;
  final String? originalWord;
  final String? sourceLanguage;
  final String? targetLanguage;
  final String? context;

  // --- main (backend v2 / local enriquecido) ---
  final String? word;
  final String? language;
  final String? pronunciation;
  final String? definition;
  final List<String> examples;
  final String? audioUrl;
  final String? category;
  final String? difficultyLevel;
  final bool isSynced;
  final String? serverId;

  // --- Campos comunes ---
  final String id;
  final String translation;
  final DateTime createdAt;
  final DateTime? updatedAt;

  const FavoriteWord({
    // comunes
    required this.id,
    required this.translation,
    required this.createdAt,
    this.updatedAt,

    // v1
    this.userId,
    this.originalWord,
    this.sourceLanguage,
    this.targetLanguage,
    this.context,

    // v2
    this.word,
    this.language,
    this.pronunciation,
    this.definition,
    this.examples = const [],
    this.audioUrl,
    this.category,
    this.difficultyLevel,
    this.isSynced = false,
    this.serverId,
  });

  // ================== FACTORIES ==================

  /// Acepta ambos esquemas:
  /// - v1: {id,user_id,original_word,translation,source_language,target_language,context,created_at}
  /// - v2: {id,word,translation,language,pronunciation,definition,examples,audioUrl,category,difficultyLevel,createdAt,updatedAt,isSynced,serverId}
  factory FavoriteWord.fromJson(Map<String, dynamic> json) {
    final bool isV1 = json.containsKey('original_word') || json.containsKey('source_language');
    final bool isV2 = json.containsKey('word') || json.containsKey('language');

    // comunes
    final String id = (json['id'] ?? json['serverId'] ?? '').toString();
    final String translation = (json['translation'] ?? '').toString();

    // fechas
    final createdAt = (() {
      final v1 = json['created_at'];
      final v2 = json['createdAt'];
      if (v1 is String) return DateTime.parse(v1);
      if (v2 is String) return DateTime.parse(v2);
      return DateTime.now();
    })();

    final DateTime? updatedAt = (() {
      final v2 = json['updatedAt'];
      if (v2 is String) return DateTime.parse(v2);
      return null;
    })();

    return FavoriteWord(
      // comunes
      id: id,
      translation: translation,
      createdAt: createdAt,
      updatedAt: updatedAt,

      // v1
      userId: isV1 ? (json['user_id'] as String?) : null,
      originalWord: isV1 ? (json['original_word'] as String?) : null,
      sourceLanguage: isV1 ? (json['source_language'] as String?) : null,
      targetLanguage: isV1 ? (json['target_language'] as String?) : null,
      context: isV1 ? (json['context'] as String?) : null,

      // v2
      word: isV2 ? (json['word'] as String?) : null,
      language: isV2 ? (json['language'] as String?) : null,
      pronunciation: isV2 ? (json['pronunciation'] as String?) : null,
      definition: isV2 ? (json['definition'] as String?) : null,
      examples: isV2
          ? (json['examples'] is List
              ? List<String>.from(json['examples'])
              : const <String>[])
          : const <String>[],
      audioUrl: isV2 ? (json['audioUrl'] as String?) : null,
      category: isV2 ? (json['category'] as String?) : null,
      difficultyLevel: isV2 ? (json['difficultyLevel'] as String?) : null,
      isSynced: isV2 ? (json['isSynced'] as bool? ?? true) : false,
      serverId: isV2 ? (json['serverId'] as String? ?? id) : null,
    );
  }

  /// Local DB: acepta ambos estilos de columnas
  factory FavoriteWord.fromLocalDb(Map<String, dynamic> map) {
    final bool looksV1 = map.containsKey('original_word') || map.containsKey('source_language') || map.containsKey('user_id');
    final bool looksV2 = map.containsKey('word') || map.containsKey('language') || map.containsKey('examples');

    final createdAt = (() {
      final v1 = map['created_at'];
      if (v1 is int) return DateTime.fromMillisecondsSinceEpoch(v1);
      if (v1 is String) return DateTime.tryParse(v1) ?? DateTime.now();
      return DateTime.now();
    })();

    final updatedAt = (() {
      final v2 = map['updated_at'];
      if (v2 is int) return DateTime.fromMillisecondsSinceEpoch(v2);
      if (v2 is String) return DateTime.tryParse(v2);
      return null;
    })();

    return FavoriteWord(
      // comunes
      id: (map['id'] ?? map['server_id'] ?? '').toString(),
      translation: (map['translation'] ?? '').toString(),
      createdAt: createdAt,
      updatedAt: updatedAt,

      // v1
      userId: looksV1 ? map['user_id'] as String? : null,
      originalWord: looksV1 ? map['original_word'] as String? : null,
      sourceLanguage: looksV1 ? map['source_language'] as String? : null,
      targetLanguage: looksV1 ? map['target_language'] as String? : null,
      context: looksV1 ? map['context'] as String? : null,

      // v2
      word: looksV2 ? map['word'] as String? : null,
      language: looksV2 ? map['language'] as String? : null,
      pronunciation: looksV2 ? map['pronunciation'] as String? : null,
      definition: looksV2 ? map['definition'] as String? : null,
      examples: looksV2 && map['examples'] != null
          ? List<String>.from(
              map['examples'].toString().split(',').where((e) => e.isNotEmpty),
            )
          : const <String>[],
      audioUrl: looksV2 ? map['audio_url'] as String? : null,
      category: looksV2 ? map['category'] as String? : null,
      difficultyLevel: looksV2 ? map['difficulty_level'] as String? : null,
      isSynced: looksV2 ? ((map['is_synced'] ?? 0) == 1) : false,
      serverId: looksV2 ? map['server_id'] as String? : null,
    );
  }

  // ================== SERIALIZACIÓN ==================

  /// v1 (HU-007-4): payload para API
  Map<String, dynamic> toCreateRequestV1() {
    return {
      'word': originalWord ?? word ?? '',
      'translation': translation,
      'sourceLanguage': sourceLanguage ?? language ?? '',
      'targetLanguage': targetLanguage ?? '',
      'context': context,
    };
  }

  /// v1 (HU-007-4) JSON completo
  Map<String, dynamic> toJsonV1() {
    return {
      'id': id,
      'user_id': userId,
      'original_word': originalWord ?? word,
      'translation': translation,
      'source_language': sourceLanguage ?? language,
      'target_language': targetLanguage,
      'context': context,
      'created_at': createdAt.toIso8601String(),
    };
  }

  /// v2 (main) JSON completo
  Map<String, dynamic> toJsonV2() {
    return {
      'id': serverId ?? id,
      'word': word ?? originalWord ?? '',
      'translation': translation,
      'language': language ?? sourceLanguage ?? '',
      'pronunciation': pronunciation,
      'definition': definition,
      'examples': examples,
      'audioUrl': audioUrl,
      'category': category,
      'difficultyLevel': difficultyLevel,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': (updatedAt ?? createdAt).toIso8601String(),
      'isSynced': isSynced,
      'serverId': serverId ?? id,
    };
  }

  /// v1 Local DB
  Map<String, dynamic> toLocalDbV1() {
    return {
      'id': id,
      'user_id': userId,
      'original_word': originalWord ?? word,
      'translation': translation,
      'source_language': sourceLanguage ?? language,
      'target_language': targetLanguage,
      'context': context,
      'created_at': createdAt.millisecondsSinceEpoch,
    };
  }

  /// v2 Local DB
  Map<String, dynamic> toLocalDbV2() {
    return {
      'id': id,
      'word': word ?? originalWord,
      'translation': translation,
      'language': language ?? sourceLanguage,
      'pronunciation': pronunciation,
      'definition': definition,
      'examples': examples.join(','),
      'audio_url': audioUrl,
      'category': category,
      'difficulty_level': difficultyLevel,
      'created_at': createdAt.millisecondsSinceEpoch,
      'updated_at': (updatedAt ?? createdAt).millisecondsSinceEpoch,
      'is_synced': isSynced ? 1 : 0,
      'server_id': serverId ?? id,
    };
  }

  // Retrocompat: mantener nombres originales también
  Map<String, dynamic> toJson() => toJsonV2();
  Map<String, dynamic> toLocalDb() => toLocalDbV2();

  // ================== COPY / EQ / DEBUG ==================

  FavoriteWord copyWith({
    // comunes
    String? id,
    String? translation,
    DateTime? createdAt,
    DateTime? updatedAt,

    // v1
    String? userId,
    String? originalWord,
    String? sourceLanguage,
    String? targetLanguage,
    String? context,

    // v2
    String? word,
    String? language,
    String? pronunciation,
    String? definition,
    List<String>? examples,
    String? audioUrl,
    String? category,
    String? difficultyLevel,
    bool? isSynced,
    String? serverId,
  }) {
    return FavoriteWord(
      // comunes
      id: id ?? this.id,
      translation: translation ?? this.translation,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,

      // v1
      userId: userId ?? this.userId,
      originalWord: originalWord ?? this.originalWord,
      sourceLanguage: sourceLanguage ?? this.sourceLanguage,
      targetLanguage: targetLanguage ?? this.targetLanguage,
      context: context ?? this.context,

      // v2
      word: word ?? this.word,
      language: language ?? this.language,
      pronunciation: pronunciation ?? this.pronunciation,
      definition: definition ?? this.definition,
      examples: examples ?? this.examples,
      audioUrl: audioUrl ?? this.audioUrl,
      category: category ?? this.category,
      difficultyLevel: difficultyLevel ?? this.difficultyLevel,
      isSynced: isSynced ?? this.isSynced,
      serverId: serverId ?? this.serverId,
    );
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;

    // Igualdad flexible: mismo id o misma tupla principal por esquema
    if (other is! FavoriteWord) return false;
    if (other.id == id) return true;

    final bool eqV1 = other.originalWord == originalWord &&
        other.translation == translation &&
        other.sourceLanguage == sourceLanguage &&
        other.targetLanguage == targetLanguage;

    final bool eqV2 = other.word == word &&
        other.translation == translation &&
        other.language == language;

    return eqV1 || eqV2;
  }

  @override
  int get hashCode => id.hashCode;

  @override
  String toString() {
    final baseWord = word ?? originalWord ?? '';
    final baseLang = language ?? sourceLanguage ?? '';
    return 'FavoriteWord(id: $id, word: $baseWord, translation: $translation, language: $baseLang)';
  }
}
