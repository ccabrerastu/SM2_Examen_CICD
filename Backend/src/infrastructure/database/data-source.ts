import { DataSource } from 'typeorm';
import { Person } from '../../domain/entities/person.entity';
import { User } from '../../domain/entities/user.entity';
import { RefreshToken } from '../../domain/entities/refresh-token.entity';
import { UserProgress } from '../../domain/entities/user-progress.entity';
import { DailyLives } from '../../domain/entities/daily-lives.entity';
import { Chapter } from '../../domain/entities/chapter.entity';
import { VocabularyItem } from '../../domain/entities/vocabulary-item.entity';
import { InterviewTopic } from '../../domain/entities/interview-topic.entity';
import { InterviewQuestion } from '../../domain/entities/interview-question.entity';
import { InterviewSession } from '../../domain/entities/interview-session.entity';
import { ReadingChapter } from '../../domain/entities/reading-chapter.entity';
import { ReadingContent } from '../../domain/entities/reading-content.entity';
import { ReadingQuiz } from '../../domain/entities/reading-quiz.entity';
import { QuizQuestion } from '../../domain/entities/quiz-question.entity';
import { Translation } from '../../domain/entities/translation.entity';
import { ChapterRepetition } from '../../domain/entities/chapter-repetition.entity';
import { PracticeSession } from '../../domain/entities/practice-session.entity';
import { VocabularyPractice } from '../../domain/entities/vocabulary-practice.entity';
import { QuizPractice } from '../../domain/entities/quiz-practice.entity';
import { ReadingPractice } from '../../domain/entities/reading-practice.entity';
import { InterviewPractice } from '../../domain/entities/interview-practice.entity';
import { ConversationContext } from '../../domain/entities/conversation-context.entity';
import { ApprovalRule } from '../../domain/entities/approval-rule.entity';
import { ApprovalEvaluation } from '../../domain/entities/approval-evaluation.entity';
import { ApprovalMetrics } from '../../domain/entities/approval-metrics.entity';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  username: process.env.DATABASE_USERNAME || 'postgres',
  password: process.env.DATABASE_PASSWORD || 'password',
  database: process.env.DATABASE_NAME || 'english_learn_db',
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
  synchronize: false, // ALWAYS false in production
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
  migrations: ['src/infrastructure/database/migrations/*{.ts,.js}'],
  subscribers: ['src/infrastructure/database/subscribers/*{.ts,.js}'],
  migrationsTableName: 'migrations',
  migrationsRun: false,
});
