import { DataSource } from 'typeorm';
import { Person } from './src/domain/entities/person.entity';
import { User } from './src/domain/entities/user.entity';
import { RefreshToken } from './src/domain/entities/refresh-token.entity';
import { UserProgress } from './src/domain/entities/user-progress.entity';
import { DailyLives } from './src/domain/entities/daily-lives.entity';
import { Chapter } from './src/domain/entities/chapter.entity';
import { VocabularyItem } from './src/domain/entities/vocabulary-item.entity';
import { ChapterRepetition } from './src/domain/entities/chapter-repetition.entity';
import { ReadingChapter } from './src/domain/entities/reading-chapter.entity';
import { ReadingContent } from './src/domain/entities/reading-content.entity';
import { ReadingQuiz } from './src/domain/entities/reading-quiz.entity';
import { QuizQuestion } from './src/domain/entities/quiz-question.entity';
import { Translation } from './src/domain/entities/translation.entity';
import { PracticeSession } from './src/domain/entities/practice-session.entity';
import { VocabularyPractice } from './src/domain/entities/vocabulary-practice.entity';
import { QuizPractice } from './src/domain/entities/quiz-practice.entity';
import { ReadingPractice } from './src/domain/entities/reading-practice.entity';
import { InterviewPractice } from './src/domain/entities/interview-practice.entity';
import { InterviewTopic } from './src/domain/entities/interview-topic.entity';
import { InterviewQuestion } from './src/domain/entities/interview-question.entity';
import { InterviewSession } from './src/domain/entities/interview-session.entity';
import { ConversationContext } from './src/domain/entities/conversation-context.entity';
import { ApprovalRule } from './src/domain/entities/approval-rule.entity';
import { ApprovalEvaluation } from './src/domain/entities/approval-evaluation.entity';
import { ApprovalMetrics } from './src/domain/entities/approval-metrics.entity';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  username: process.env.DATABASE_USERNAME || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'password',
  database: process.env.DATABASE_NAME || 'english_learn_db',
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
  entities: [
    // User entities
    Person,
    User,
    RefreshToken,
    UserProgress,
    DailyLives,

    // Chapter and Vocabulary entities
    Chapter,
    VocabularyItem,
    ChapterRepetition,

    // Reading entities
    ReadingChapter,
    ReadingContent,
    ReadingQuiz,

    // Quiz entities
    QuizQuestion,

    // Translation entities
    Translation,

    // Practice entities
    PracticeSession,
    VocabularyPractice,
    QuizPractice,
    ReadingPractice,
    InterviewPractice,

    // Interview entities
    InterviewTopic,
    InterviewQuestion,
    InterviewSession,

    // Context entities
    ConversationContext,

    // Approval entities
    ApprovalRule,
    ApprovalEvaluation,
    ApprovalMetrics,
  ],
  migrations: ['src/infrastructure/database/migrations/*.ts'],
  subscribers: ['src/infrastructure/database/subscribers/*.ts'],
  migrationsTableName: 'migrations',
  migrationsRun: false,
});

export default AppDataSource;
