import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import { InterviewPractice } from '../../domain/entities/interview-practice.entity';
import { PracticeSession } from '../../domain/entities/practice-session.entity';
import { Chapter } from '../../domain/entities/chapter.entity';
import { InterviewSession } from '../../domain/entities/interview-session.entity';
import { ConversationContext } from '../../domain/entities/conversation-context.entity';
import { UserProgress } from '../../domain/entities/user-progress.entity';
import { VocabularyItem } from '../../domain/entities/vocabulary-item.entity';

// Repositories
import { InterviewPracticeRepository } from '../../infrastructure/repositories/interview-practice.repository';
import { PracticeSessionRepository } from '../../infrastructure/repositories/practice-session.repository';
import { ChapterRepository } from '../../infrastructure/repositories/chapter.repository';

// Use Cases
import { CreateInterviewPracticeUseCase } from '../use-cases/practices/interview/create-interview-practice.use-case';
import { GetInterviewPracticeUseCase } from '../use-cases/practices/interview/get-interview-practice.use-case';
import { AnswerQuestionUseCase } from '../use-cases/practices/interview/answer-question.use-case';
import { UpdateConversationFlowUseCase } from '../use-cases/practices/interview/update-conversation-flow.use-case';
import { GetInterviewSessionsUseCase } from '../use-cases/practices/interview/get-interview-sessions.use-case';

// Services
// import { ContextManagementService } from '../services/context-management.service'; // TODO: Requires ConversationContextRepository implementation

@Module({
  imports: [
    TypeOrmModule.forFeature([
      InterviewPractice,
      PracticeSession,
      Chapter,
      InterviewSession,
      ConversationContext,
      UserProgress,
      VocabularyItem,
    ]),
  ],
  providers: [
    // Repositories
    InterviewPracticeRepository,
    {
      provide: 'IInterviewPracticeRepository',
      useExisting: InterviewPracticeRepository,
    },
    PracticeSessionRepository,
    {
      provide: 'IPracticeSessionRepository',
      useExisting: PracticeSessionRepository,
    },
    ChapterRepository,
    {
      provide: 'IChapterRepository',
      useExisting: ChapterRepository,
    },
    // Services
    // ContextManagementService, // TODO: Requires ConversationContextRepository implementation
    // Use Cases
    CreateInterviewPracticeUseCase,
    GetInterviewPracticeUseCase,
    AnswerQuestionUseCase,
    UpdateConversationFlowUseCase,
    GetInterviewSessionsUseCase,
  ],
  exports: [
    // Repositories
    InterviewPracticeRepository,
    'IInterviewPracticeRepository',
    PracticeSessionRepository,
    'IPracticeSessionRepository',
    ChapterRepository,
    'IChapterRepository',
    // Services
    // ContextManagementService, // TODO: Requires ConversationContextRepository implementation
    // Use Cases
    CreateInterviewPracticeUseCase,
    GetInterviewPracticeUseCase,
    AnswerQuestionUseCase,
    UpdateConversationFlowUseCase,
    GetInterviewSessionsUseCase,
  ],
})
export class InterviewPracticeModule {}
