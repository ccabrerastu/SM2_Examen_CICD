import { Injectable, BadRequestException } from '@nestjs/common';
import { IInterviewSessionRepository } from '../../interfaces/repositories/interview-repository.interface';
import { IConversationContextRepository } from '../../interfaces/repositories/conversation-context-repository.interface';
import {
  InterviewSession,
  InterviewStatus,
} from '../../../domain/entities/interview-session.entity';
import { ContextType } from '../../../domain/entities/conversation-context.entity';

export interface CreateInterviewSessionRequest {
  userId: string;
  topicId: string;
  totalQuestions?: number;
}

export interface InterviewSessionResponse {
  sessionId: string;
  topicId: string;
  status: InterviewStatus;
  currentQuestionIndex: number;
  totalQuestions: number;
  questionsAnswered: number;
  startedAt: Date | null;
}

@Injectable()
export class StartInterviewSessionUseCase {
  constructor(
    private readonly interviewSessionRepository: IInterviewSessionRepository,
    private readonly contextRepository: IConversationContextRepository,
  ) {}

  async execute(request: CreateInterviewSessionRequest): Promise<InterviewSessionResponse> {
    // Validate request
    if (!request.userId) {
      throw new BadRequestException('User ID is required');
    }
    if (!request.topicId) {
      throw new BadRequestException('Topic ID is required');
    }

    // Check for existing active session
    const existingSession = await this.interviewSessionRepository.findActiveByUserId(
      request.userId,
    );
    if (existingSession) {
      throw new BadRequestException('User already has an active interview session');
    }

    // Create session using entity factory method
    const session = InterviewSession.createSession(request.userId, request.topicId);

    // Start the session with specified or default number of questions
    const totalQuestions = request.totalQuestions || 5;
    session.start(totalQuestions);

    // Save to database
    const savedSession = await this.interviewSessionRepository.create(session);

    // Initialize conversation context (optional)
    await this.initializeSessionContext(savedSession);

    return this.mapToResponse(savedSession);
  }

  private async initializeSessionContext(session: InterviewSession): Promise<void> {
    // Create initial context entries
    const contexts = [
      {
        sessionId: session.id,
        contextType: ContextType.SESSION_STATE,
        contextKey: 'session_info',
        contextValue: {
          sessionId: session.id,
          userId: session.userId,
          topicId: session.topicId,
          startedAt: session.startedAt,
          totalQuestions: session.totalQuestions,
        },
        priority: 1,
      },
      {
        sessionId: session.id,
        contextType: ContextType.CONVERSATION_HISTORY,
        contextKey: 'conversation_start',
        contextValue: {
          messageCount: 0,
          lastActivity: new Date(),
          conversationFlow: 'initiated',
        },
        priority: 3,
      },
    ];

    await this.contextRepository.createMany(contexts);
  }

  private mapToResponse(session: InterviewSession): InterviewSessionResponse {
    return {
      sessionId: session.id,
      topicId: session.topicId,
      status: session.status,
      currentQuestionIndex: session.currentQuestionIndex,
      totalQuestions: session.totalQuestions,
      questionsAnswered: session.questionsAnswered,
      startedAt: session.startedAt || null,
    };
  }
}
