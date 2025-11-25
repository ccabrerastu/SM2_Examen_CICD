// Practice Services
export 'base_practice_service.dart';
export 'vocabulary_practice_service.dart';
export 'quiz_practice_service.dart';
export 'reading_practice_service.dart';
export 'interview_practice_service.dart';

// Collection of all practice services for easy access
import 'vocabulary_practice_service.dart';
import 'quiz_practice_service.dart';
import 'reading_practice_service.dart';
import 'interview_practice_service.dart';

class PracticeServices {
  static final VocabularyPracticeService vocabulary = VocabularyPracticeService();
  static final QuizPracticeService quiz = QuizPracticeService();
  static final ReadingPracticeService reading = ReadingPracticeService();
  static final InterviewPracticeService interview = InterviewPracticeService();
}