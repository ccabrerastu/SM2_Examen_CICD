// User entities
export { User } from './user.entity';
export { RefreshToken } from './refresh-token.entity';
export { UserProgress } from './user-progress.entity';
export { DailyLives } from './daily-lives.entity';

// Chapter and Vocabulary entities
export { Chapter } from './chapter.entity';
export { VocabularyItem } from './vocabulary-item.entity';
export { ChapterRepetition } from './chapter-repetition.entity';

// Reading entities
export { ReadingChapter } from './reading-chapter.entity';
export { ReadingContent } from './reading-content.entity';
export {
  ReadingQuiz,
  QuestionType,
  ReadingQuizQuestion,
  MultipleChoiceQuestion,
  TrueFalseQuestion,
} from './reading-quiz.entity';

// Quiz entities
export { QuizQuestion } from './quiz-question.entity';

// Translation entities
export { Translation } from './translation.entity';
export { Person } from './person.entity';

// Base practice entity
export { PracticeSession, PracticeType, PracticeStatus } from './practice-session.entity';

// Specific practice entities
export { VocabularyPractice } from './vocabulary-practice.entity';
export { QuizPractice } from './quiz-practice.entity';
export { ReadingPractice } from './reading-practice.entity';
export { InterviewPractice, InterviewType as InterviewPracticeType, ResponseQuality } from './interview-practice.entity';

// Interview Session entities
export {
  InterviewSession,
  InterviewStatus,
  AnswerEvaluation,
} from './interview-session.entity';

// Interview Topic entities
export {
  InterviewTopic,
  TopicCategory,
  DifficultyLevel,
} from './interview-topic.entity';

// Interview Question entities
export {
  InterviewQuestion,
  QuestionCategory,
  QuestionDifficulty,
} from './interview-question.entity';

// Conversation Context entities (NEW)
export {
  ConversationContext,
  ConversationSummary,
  ContextRelationship,
  ContextType,
  ContextStatus,
} from './conversation-context.entity';

// Approval entities
export { ApprovalRule } from './approval-rule.entity';
export { ApprovalEvaluation } from './approval-evaluation.entity';
export { ApprovalMetrics } from './approval-metrics.entity';

// Re-export all practice entities as a collection
export const PRACTICE_ENTITIES = [
  'PracticeSession',
  'VocabularyPractice',
  'QuizPractice',
  'ReadingPractice',
  'InterviewPractice',
];

// Re-export all approval entities as a collection
export const APPROVAL_ENTITIES = ['ApprovalRule', 'ApprovalEvaluation', 'ApprovalMetrics'];
