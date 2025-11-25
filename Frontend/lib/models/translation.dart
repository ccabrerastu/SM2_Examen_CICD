class Translation {
  // Campos comunes
  final String id;
  final String originalText;
  final String translatedText;
  final String sourceLanguage;
  final String targetLanguage;
  final String? pronunciation;
  final List<String> examples;
  final String? audioUrl;
  final DateTime createdAt;
  final DateTime? expiresAt;

  // Campos del branch main (enriquecidos)
  final String? definition;
  final String? context;

  const Translation({
    required this.id,
    required this.originalText,
    required this.translatedText,
    required this.sourceLanguage,
    required this.targetLanguage,
    this.pronunciation,
    this.examples = const [],
    this.audioUrl,
    this.definition,
    this.context,
    required this.createdAt,
    this.expiresAt,
  });

  // ================= FACTORIES =================

  /// Acepta HU-007-4 (snake_case) y main (camelCase).
  factory Translation.fromJson(Map<String, dynamic> json) {
    // Detectores de estilo
    final bool isSnake =
        json.containsKey('original_text') || json.containsKey('source_language');
    final bool isCamel =
        json.containsKey('originalText') || json.containsKey('sourceLanguage');

    String str(dynamic v, [String d = '']) => (v ?? d).toString();

    // Campos base (tolerantes a ambos estilos)
    final id = str(json['id'] ??
        DateTime.now().millisecondsSinceEpoch.toString());
    final originalText =
        str(isSnake ? json['original_text'] : json['originalText']);
    final translatedText =
        str(isSnake ? json['translated_text'] : json['translatedText']);
    final sourceLanguage =
        str(isSnake ? json['source_language'] : json['sourceLanguage']);
    final targetLanguage =
        str(isSnake ? json['target_language'] : json['targetLanguage']);

    // Pronunciación / audio
    final pronunciation = (isSnake ? json['pronunciation'] : json['pronunciation']) as String?;
    final audioUrl = (isSnake ? json['audio_url'] : json['audioUrl']) as String?;

    // Examples puede venir como List o String
    List<String> examples = const [];
    final rawExamples = json['examples'];
    if (rawExamples is List) {
      examples = List<String>.from(rawExamples.map((e) => e.toString()));
    } else if (rawExamples is String) {
      // Acepta ambos separadores para robustez
      examples = rawExamples
          .split(RegExp(r'[|,]'))
          .map((e) => e.trim())
          .where((e) => e.isNotEmpty)
          .toList();
    }

    // Campos enriquecidos (solo camelCase en main)
    final definition = isCamel ? json['definition'] as String? : null;
    final context = isCamel ? json['context'] as String? : null;

    // Fechas
    DateTime createdAt;
    final createdSnake = json['created_at'];
    final createdCamel = json['createdAt'];
    if (createdSnake is String) {
      createdAt = DateTime.parse(createdSnake);
    } else if (createdCamel is String) {
      createdAt = DateTime.parse(createdCamel);
    } else {
      createdAt = DateTime.now();
    }

    DateTime? expiresAt;
    final expiresSnake = json['expires_at'];
    final expiresCamel = json['expiresAt'];
    if (expiresSnake is String) {
      expiresAt = DateTime.parse(expiresSnake);
    } else if (expiresCamel is String) {
      expiresAt = DateTime.parse(expiresCamel);
    }

    return Translation(
      id: id,
      originalText: originalText,
      translatedText: translatedText,
      sourceLanguage: sourceLanguage,
      targetLanguage: targetLanguage,
      pronunciation: pronunciation,
      examples: examples,
      audioUrl: audioUrl,
      definition: definition,
      context: context,
      createdAt: createdAt,
      expiresAt: expiresAt,
    );
  }

  /// Local DB (acepta ejemplos con '|' o ',')
  factory Translation.fromLocalDb(Map<String, dynamic> map) {
    String str(dynamic v, [String d = '']) => (v ?? d).toString();

    final examplesStr = map['examples']?.toString();
    final examples = examplesStr == null
        ? const <String>[]
        : examplesStr
            .split(RegExp(r'[|,]'))
            .map((e) => e.trim())
            .where((e) => e.isNotEmpty)
            .toList();

    final createdAtRaw = map['created_at'];
    final expiresAtRaw = map['expires_at'];

    DateTime createdAt;
    if (createdAtRaw is int) {
      createdAt = DateTime.fromMillisecondsSinceEpoch(createdAtRaw);
    } else if (createdAtRaw is String) {
      createdAt = DateTime.tryParse(createdAtRaw) ?? DateTime.now();
    } else {
      createdAt = DateTime.now();
    }

    DateTime? expiresAt;
    if (expiresAtRaw is int) {
      expiresAt = DateTime.fromMillisecondsSinceEpoch(expiresAtRaw);
    } else if (expiresAtRaw is String) {
      expiresAt = DateTime.tryParse(expiresAtRaw);
    }

    return Translation(
      id: str(map['id']),
      originalText: str(map['original_text']),
      translatedText: str(map['translated_text']),
      sourceLanguage: str(map['source_language']),
      targetLanguage: str(map['target_language']),
      pronunciation: map['pronunciation'] as String?,
      examples: examples,
      audioUrl: map['audio_url'] as String?,
      // definition/context no se guardan en cache v1
      definition: null,
      context: null,
      createdAt: createdAt,
      expiresAt: expiresAt,
    );
  }

  // ================= SERIALIZACIÓN =================

  /// JSON estilo HU-007-4 (snake_case)
  Map<String, dynamic> toJsonV1() {
    return {
      'id': id,
      'original_text': originalText,
      'translated_text': translatedText,
      'source_language': sourceLanguage,
      'target_language': targetLanguage,
      'pronunciation': pronunciation,
      'examples': examples, // si necesitas string: examples.join('|')
      'audio_url': audioUrl,
      'created_at': createdAt.toIso8601String(),
      'expires_at': expiresAt?.toIso8601String(),
    };
  }

  /// JSON estilo main (camelCase + campos enriquecidos)
  Map<String, dynamic> toJsonV2() {
    return {
      'id': id,
      'originalText': originalText,
      'translatedText': translatedText,
      'sourceLanguage': sourceLanguage,
      'targetLanguage': targetLanguage,
      'pronunciation': pronunciation,
      'examples': examples,
      'audioUrl': audioUrl,
      'definition': definition,
      'context': context,
      'createdAt': createdAt.toIso8601String(),
      'expiresAt': expiresAt?.toIso8601String(),
    };
  }

  /// Compatibilidad: por defecto exportamos V2
  Map<String, dynamic> toJson() => toJsonV2();

  /// Local DB v1 (usa ‘|’ para ejemplos)
  Map<String, dynamic> toLocalDbV1() {
    return {
      'id': id,
      'text_hash': _generateTextHash(),
      'original_text': originalText,
      'translated_text': translatedText,
      'source_language': sourceLanguage,
      'target_language': targetLanguage,
      'pronunciation': pronunciation,
      'examples': examples.join('|'),
      'audio_url': audioUrl,
      'created_at': createdAt.millisecondsSinceEpoch,
      'expires_at': expiresAt?.millisecondsSinceEpoch,
    };
  }

  /// Local DB v2 (usa ‘,’ para ejemplos)
  Map<String, dynamic> toLocalDbV2() {
    return {
      'id': id,
      'text_hash': _generateTextHash(),
      'original_text': originalText,
      'translated_text': translatedText,
      'source_language': sourceLanguage,
      'target_language': targetLanguage,
      'pronunciation': pronunciation,
      'examples': examples.join(','),
      'audio_url': audioUrl,
      'created_at': createdAt.millisecondsSinceEpoch,
      'expires_at': expiresAt?.millisecondsSinceEpoch,
    };
  }

  /// Compatibilidad: por defecto guardamos con v2
  Map<String, dynamic> toLocalDb() => toLocalDbV2();

  // ================= UTILS =================

  String _generateTextHash() =>
      '$originalText-$sourceLanguage-$targetLanguage'.hashCode.toString();

  bool get isExpired => expiresAt != null && DateTime.now().isAfter(expiresAt!);

  Translation copyWith({
    String? id,
    String? originalText,
    String? translatedText,
    String? sourceLanguage,
    String? targetLanguage,
    String? pronunciation,
    List<String>? examples,
    String? audioUrl,
    String? definition,
    String? context,
    DateTime? createdAt,
    DateTime? expiresAt,
  }) {
    return Translation(
      id: id ?? this.id,
      originalText: originalText ?? this.originalText,
      translatedText: translatedText ?? this.translatedText,
      sourceLanguage: sourceLanguage ?? this.sourceLanguage,
      targetLanguage: targetLanguage ?? this.targetLanguage,
      pronunciation: pronunciation ?? this.pronunciation,
      examples: examples ?? this.examples,
      audioUrl: audioUrl ?? this.audioUrl,
      definition: definition ?? this.definition,
      context: context ?? this.context,
      createdAt: createdAt ?? this.createdAt,
      expiresAt: expiresAt ?? this.expiresAt,
    );
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;

    return other is Translation &&
        other.id == id &&
        other.originalText == originalText &&
        other.translatedText == translatedText &&
        other.sourceLanguage == sourceLanguage &&
        other.targetLanguage == targetLanguage;
  }

  @override
  int get hashCode =>
      id.hashCode ^
      originalText.hashCode ^
      translatedText.hashCode ^
      sourceLanguage.hashCode ^
      targetLanguage.hashCode;

  @override
  String toString() =>
      'Translation(id: $id, originalText: $originalText, translatedText: $translatedText, sourceLanguage: $sourceLanguage, targetLanguage: $targetLanguage)';
}
