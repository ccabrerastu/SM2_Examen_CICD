import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { appConfig } from './infrastructure/config/app.config';
import { databaseConfig } from './infrastructure/config/database.config';
import { jwtConfig } from './infrastructure/config/jwt.config';
import { securityConfig } from './infrastructure/config/security/security.config';
import { Person } from './domain/entities/person.entity';
import { User } from './domain/entities/user.entity';
import { RefreshToken } from './domain/entities/refresh-token.entity';
import { UserProgress } from './domain/entities/user-progress.entity';
import { DailyLives } from './domain/entities/daily-lives.entity';
import { Chapter } from './domain/entities/chapter.entity';
import { VocabularyItem } from './domain/entities/vocabulary-item.entity';
import { ChapterRepetition } from './domain/entities/chapter-repetition.entity';
import { ReadingChapter } from './domain/entities/reading-chapter.entity';
import { ReadingContent } from './domain/entities/reading-content.entity';
import { ReadingQuiz } from './domain/entities/reading-quiz.entity';
import { QuizQuestion } from './domain/entities/quiz-question.entity';
import { Translation } from './domain/entities/translation.entity';
import { PracticeSession } from './domain/entities/practice-session.entity';
import { VocabularyPractice } from './domain/entities/vocabulary-practice.entity';
import { QuizPractice } from './domain/entities/quiz-practice.entity';
import { ReadingPractice } from './domain/entities/reading-practice.entity';
import { InterviewPractice } from './domain/entities/interview-practice.entity';
import { InterviewTopic } from './domain/entities/interview-topic.entity';
import { InterviewQuestion } from './domain/entities/interview-question.entity';
import { InterviewSession } from './domain/entities/interview-session.entity';
import { ConversationContext } from './domain/entities/conversation-context.entity';
import { ApprovalRule } from './domain/entities/approval-rule.entity';
import { ApprovalEvaluation } from './domain/entities/approval-evaluation.entity';
import { ApprovalMetrics } from './domain/entities/approval-metrics.entity';
import { AuthModule } from './presentation/modules/auth.module';
import { ApprovalModule } from './presentation/modules/approval.module';
import { ProgressModule } from './presentation/modules/progress.module';
import { LivesModule } from './presentation/modules/lives.module';
import { ChaptersModule } from './presentation/modules/chapters.module';
import { ReadingModule } from './presentation/modules/reading.module';
import { InterviewPracticeModule } from './presentation/modules/interview-practice.module';
import { AdminModule } from './presentation/modules/admin.module';
import { TranslationModule } from './application/modules/translation.module';
import { InterviewModule } from './application/modules/interview.module';
import { CronModule } from './application/modules/cron.module';
import { SecurityModule } from './shared/security.module';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, jwtConfig, securityConfig],
      envFilePath: ['.env.local', '.env'],
    }),

    // Rate Limiting
    ThrottlerModule.forRoot([
      // Global rate limiting
      {
        ttl: 60, // Time window in seconds
        limit: 100, // maximum number of requests within the time window
      },
    ]),

    // Database
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
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
        migrations: ['dist/infrastructure/database/migrations/*{.ts,.js}'],
        migrationsTableName: 'migrations',
        migrationsRun: false,
      }),
    }),

    // Security
    SecurityModule,

    // Feature modules
    AuthModule,
    ProgressModule,
    LivesModule,
    ChaptersModule,
    ReadingModule,
    InterviewPracticeModule,
    AdminModule,
    ApprovalModule,
    TranslationModule,
    InterviewModule,
    CronModule,
  ],
})
export class AppModule {}
