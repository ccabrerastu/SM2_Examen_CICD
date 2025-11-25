// Practice Controllers
import { VocabularyPracticeController } from './vocabulary-practice.controller';
import { QuizPracticeController } from './quiz-practice.controller';
import { ReadingPracticeController } from './reading-practice.controller';
import { InterviewPracticeController } from './interview-practice.controller';

// Re-export controllers
export { VocabularyPracticeController };
export { QuizPracticeController };
export { ReadingPracticeController };
export { InterviewPracticeController };

// Collection of all practice controllers for easy module registration
export const PRACTICE_CONTROLLERS = [
  VocabularyPracticeController,
  QuizPracticeController,
  ReadingPracticeController,
  InterviewPracticeController,
];
