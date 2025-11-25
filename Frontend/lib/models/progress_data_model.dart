/// Standard JSON format for extra_data field in UserProgress entity
/// This defines the unified structure for storing progress information
/// across different learning modules (Vocabulary, Reading, Interviews, Quiz)
library;

// Base progress data structure
abstract class ProgressExtraData {
  final String eventType;
  final String timestamp;
  
  ProgressExtraData({
    required this.eventType,
    required this.timestamp,
  });
  
  Map<String, dynamic> toJson();
}

// Vocabulary progress data
class VocabularyProgressData extends ProgressExtraData {
  final VocabularyData vocab;
  
  VocabularyProgressData({
    required this.vocab,
    String? timestamp,
  }) : super(
    eventType: 'vocabulary_practiced',
    timestamp: timestamp ?? DateTime.now().toIso8601String(),
  );
  
  factory VocabularyProgressData.fromJson(Map<String, dynamic> json) {
    return VocabularyProgressData(
      vocab: VocabularyData.fromJson(json['vocab']),
      timestamp: json['practiced_at'] ?? json['timestamp'],
    );
  }
  
  @override
  Map<String, dynamic> toJson() => {
    'event_type': eventType,
    'vocab': vocab.toJson(),
    'practiced_at': timestamp,
  };
}

class VocabularyData {
  final String chapter;
  final String lastWord;
  final int wordsLearned;
  
  VocabularyData({
    required this.chapter,
    required this.lastWord,
    required this.wordsLearned,
  });
  
  factory VocabularyData.fromJson(Map<String, dynamic> json) {
    return VocabularyData(
      chapter: json['chapter'] ?? '',
      lastWord: json['lastWord'] ?? '',
      wordsLearned: json['wordsLearned'] ?? 0,
    );
  }
  
  Map<String, dynamic> toJson() => {
    'chapter': chapter,
    'lastWord': lastWord,
    'wordsLearned': wordsLearned,
  };
}

// Reading progress data
class ReadingProgressData extends ProgressExtraData {
  final ReadingData reading;
  
  ReadingProgressData({
    required this.reading,
    String? timestamp,
  }) : super(
    eventType: 'reading_progress',
    timestamp: timestamp ?? DateTime.now().toIso8601String(),
  );
  
  factory ReadingProgressData.fromJson(Map<String, dynamic> json) {
    return ReadingProgressData(
      reading: ReadingData.fromJson(json['reading']),
      timestamp: json['read_at'] ?? json['timestamp'],
    );
  }
  
  @override
  Map<String, dynamic> toJson() => {
    'event_type': eventType,
    'reading': reading.toJson(),
    'read_at': timestamp,
  };
}

class ReadingData {
  final String chapter;
  final int lastParagraph;
  final bool quizCompleted;
  
  ReadingData({
    required this.chapter,
    required this.lastParagraph,
    required this.quizCompleted,
  });
  
  factory ReadingData.fromJson(Map<String, dynamic> json) {
    return ReadingData(
      chapter: json['chapter'] ?? '',
      lastParagraph: json['lastParagraph'] ?? 0,
      quizCompleted: json['quizCompleted'] ?? false,
    );
  }
  
  Map<String, dynamic> toJson() => {
    'chapter': chapter,
    'lastParagraph': lastParagraph,
    'quizCompleted': quizCompleted,
  };
}

// Interview progress data
class InterviewProgressData extends ProgressExtraData {
  final InterviewData interview;
  
  InterviewProgressData({
    required this.interview,
    String? timestamp,
  }) : super(
    eventType: 'interview_answered',
    timestamp: timestamp ?? DateTime.now().toIso8601String(),
  );
  
  factory InterviewProgressData.fromJson(Map<String, dynamic> json) {
    return InterviewProgressData(
      interview: InterviewData.fromJson(json['interview']),
      timestamp: json['answered_at'] ?? json['timestamp'],
    );
  }
  
  @override
  Map<String, dynamic> toJson() => {
    'event_type': eventType,
    'interview': interview.toJson(),
    'answered_at': timestamp,
  };
}

class InterviewData {
  final String chapter;
  final int lastQuestion;
  final String lastAnswer;
  
  InterviewData({
    required this.chapter,
    required this.lastQuestion,
    required this.lastAnswer,
  });
  
  factory InterviewData.fromJson(Map<String, dynamic> json) {
    return InterviewData(
      chapter: json['chapter'] ?? '',
      lastQuestion: json['lastQuestion'] ?? 0,
      lastAnswer: json['lastAnswer'] ?? '',
    );
  }
  
  Map<String, dynamic> toJson() => {
    'chapter': chapter,
    'lastQuestion': lastQuestion,
    'lastAnswer': lastAnswer,
  };
}

// Quiz progress data
class QuizProgressData extends ProgressExtraData {
  final int lastQuestion;
  
  QuizProgressData({
    required this.lastQuestion,
    String? timestamp,
  }) : super(
    eventType: 'quiz_answered',
    timestamp: timestamp ?? DateTime.now().toIso8601String(),
  );
  
  factory QuizProgressData.fromJson(Map<String, dynamic> json) {
    return QuizProgressData(
      lastQuestion: json['last_question'] ?? 0,
      timestamp: json['answered_at'] ?? json['timestamp'],
    );
  }
  
  @override
  Map<String, dynamic> toJson() => {
    'event_type': eventType,
    'last_question': lastQuestion,
    'answered_at': timestamp,
  };
}

// Chapter completion data
class ChapterCompletionData extends ProgressExtraData {
  ChapterCompletionData({
    String? timestamp,
  }) : super(
    eventType: 'chapter_completed',
    timestamp: timestamp ?? DateTime.now().toIso8601String(),
  );
  
  factory ChapterCompletionData.fromJson(Map<String, dynamic> json) {
    return ChapterCompletionData(
      timestamp: json['completed_at'] ?? json['timestamp'],
    );
  }
  
  @override
  Map<String, dynamic> toJson() => {
    'event_type': eventType,
    'completed_at': timestamp,
  };
}

// Factory method to create appropriate progress data from JSON
class ProgressDataFactory {
  static ProgressExtraData? fromJson(Map<String, dynamic> json) {
    final eventType = json['event_type'] ?? '';
    
    switch (eventType) {
      case 'vocabulary_practiced':
        return VocabularyProgressData.fromJson(json);
      case 'reading_progress':
        return ReadingProgressData.fromJson(json);
      case 'interview_answered':
        return InterviewProgressData.fromJson(json);
      case 'quiz_answered':
        return QuizProgressData.fromJson(json);
      case 'chapter_completed':
        return ChapterCompletionData.fromJson(json);
      default:
        return null;
    }
  }
}

/* 
STANDARD JSON FORMATS FOR EXTRA_DATA FIELD:

1. VOCABULARY PROGRESS:
{
  "event_type": "vocabulary_practiced",
  "vocab": {
    "chapter": "vocab-chapter-1",
    "lastWord": "apple",
    "wordsLearned": 5
  },
  "practiced_at": "2025-09-09T03:45:00.000Z"
}

2. READING PROGRESS:
{
  "event_type": "reading_progress",
  "reading": {
    "chapter": "reading-chapter-1",
    "lastParagraph": 3,
    "quizCompleted": false
  },
  "read_at": "2025-09-09T03:45:00.000Z"
}

3. INTERVIEW PROGRESS:
{
  "event_type": "interview_answered",
  "interview": {
    "chapter": "interview-chapter-1",
    "lastQuestion": 2,
    "lastAnswer": "I am a motivated person who enjoys learning..."
  },
  "answered_at": "2025-09-09T03:45:00.000Z"
}

4. QUIZ PROGRESS:
{
  "event_type": "quiz_answered",
  "last_question": 5,
  "answered_at": "2025-09-09T03:45:00.000Z"
}

5. CHAPTER COMPLETION:
{
  "event_type": "chapter_completed",
  "completed_at": "2025-09-09T03:45:00.000Z"
}
*/