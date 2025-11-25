import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import {
  IInterviewSessionRepository,
  // IInterviewMessageRepository, // TODO: Entity not yet created
} from '../../interfaces/repositories/interview-repository.interface';
import { IConversationContextRepository } from '../../interfaces/repositories/conversation-context-repository.interface';
import {
  InterviewStatus,
  InterviewSession,
} from '../../../domain/entities/interview-session.entity';
import { ContextType } from '../../../domain/entities/conversation-context.entity';

export interface ProcessMessageRequest {
  sessionToken: string;
  message: string;
  messageType?: string;
  metadata?: {
    responseTime?: number;
    clientTimestamp?: string;
    deviceInfo?: {
      platform?: string;
      browser?: string;
      version?: string;
      userAgent?: string;
    };
  };
}

export interface ProcessMessageResponse {
  messageId: string;
  response: string;
  sessionStatus: InterviewStatus;
  nextQuestion?: {
    id: string;
    text: string;
    type: string;
    category?: string;
  };
  progress: {
    currentQuestionIndex: number;
    totalQuestions: number;
    completionPercentage: number;
  };
  contextUpdated: boolean;
}

// Internal types
interface ConversationHistory extends Record<string, unknown> {
  messages: Array<{
    id?: string;
    content: string;
    timestamp: Date;
    type: string;
  }>;
  messageCount?: number;
  lastActivity?: Date;
}

interface QuestionData {
  id: string;
  text: string;
  type: string;
  category?: string;
}

interface ConversationContextMap {
  [key: string]: Record<string, unknown>;
}

@Injectable()
export class ProcessInterviewMessageUseCase {
  constructor(
    private readonly sessionRepository: IInterviewSessionRepository,
    // private readonly messageRepository: IInterviewMessageRepository, // TODO: Entity not yet created
    private readonly contextRepository: IConversationContextRepository,
  ) {}

  async execute(request: ProcessMessageRequest): Promise<ProcessMessageResponse> {
    // Validate and get session
    const session = await this.sessionRepository.findById(request.sessionToken); // Using sessionToken as sessionId for now
    if (!session) {
      throw new NotFoundException('Interview session not found');
    }

    // Check if session is in progress (instead of isActive which doesn't exist)
    if (session.status !== InterviewStatus.IN_PROGRESS) {
      throw new BadRequestException('Interview session is not active');
    }

    // TODO: Store user message when InterviewMessage entity is created
    // const userMessage = await this.messageRepository.create({ ... });
    const userMessageId = `temp_${Date.now()}`;

    // Update conversation context
    await this.updateConversationContext(session.id, request.message, userMessageId);

    // Generate AI response
    const aiResponse = await this.generateAIResponse(session, request.message);

    // TODO: Store AI response when InterviewMessage entity is created
    // const aiMessage = await this.messageRepository.create({ ... });
    const aiMessageId = `temp_ai_${Date.now()}`;

    // Update session progress if needed
    let updatedSession = session;
    if (aiResponse.shouldAdvanceQuestion) {
      updatedSession = await this.advanceQuestion(session);
    }

    // Note: lastActivityAt doesn't exist in InterviewSession entity
    // Session is automatically updated with updatedAt timestamp

    return {
      messageId: aiMessageId,
      response: aiResponse.content,
      sessionStatus: updatedSession.status,
      ...(aiResponse.nextQuestion && { nextQuestion: aiResponse.nextQuestion }),
      progress: {
        currentQuestionIndex: updatedSession.currentQuestionIndex,
        totalQuestions: updatedSession.totalQuestions,
        completionPercentage: updatedSession.getCompletionPercentage(),
      },
      contextUpdated: true,
    };
  }

  private async updateConversationContext(
    sessionId: string,
    userMessage: string,
    messageId: string,
  ): Promise<void> {
    // Update conversation history
    const conversationHistory = await this.contextRepository.findByKey(
      sessionId,
      'conversation_history',
    );

    if (conversationHistory) {
      const history = conversationHistory.contextValue as unknown as ConversationHistory;
      history.messages = history.messages || [];
      history.messages.push({
        id: messageId,
        content: userMessage,
        timestamp: new Date(),
        type: 'user',
      });
      history.messageCount = history.messages.length;
      history.lastActivity = new Date();

      await this.contextRepository.update(conversationHistory.id, {
        contextValue: history,
      });
    } else {
      await this.contextRepository.create({
        sessionId,
        contextType: ContextType.CONVERSATION_HISTORY,
        contextKey: 'conversation_history',
        contextValue: {
          messages: [
            {
              id: messageId,
              content: userMessage,
              timestamp: new Date(),
              type: 'user',
            },
          ],
          messageCount: 1,
          lastActivity: new Date(),
        },
        priority: 1,
      });
    }

    // Extract and store user preferences/patterns
    await this.extractUserPatterns(sessionId, userMessage);
  }

  private async extractUserPatterns(sessionId: string, message: string): Promise<void> {
    // Simple pattern extraction (in production, use NLP)
    const patterns = {
      messageLength: message.length,
      hasQuestions: message.includes('?'),
      sentiment: this.analyzeSentiment(message),
      topics: this.extractTopics(message),
      complexity: this.analyzeComplexity(message),
    };

    await this.contextRepository.upsertContext(
      sessionId,
      'user_patterns',
      patterns,
      ContextType.USER_PROFILE,
      2,
    );
  }

  private async generateAIResponse(
    session: InterviewSession,
    userMessage: string,
  ): Promise<{
    content: string;
    processingTime: number;
    tokens: number;
    shouldAdvanceQuestion: boolean;
    nextQuestion?: QuestionData;
  }> {
    const startTime = Date.now();

    // Get conversation context
    const context = await this.getConversationContext(session.id);

    // In production, integrate with OpenAI or similar
    // For now, generate a simple response
    const response = await this.generateMockResponse(session, userMessage, context);

    const processingTime = Date.now() - startTime;

    return {
      content: response.content,
      processingTime,
      tokens: response.content.length / 4, // Rough token estimate
      shouldAdvanceQuestion: response.shouldAdvance,
      ...(response.nextQuestion && { nextQuestion: response.nextQuestion }),
    };
  }

  private async getConversationContext(sessionId: string): Promise<ConversationContextMap> {
    const contexts = await this.contextRepository.findActiveContexts(sessionId);

    const contextMap: ConversationContextMap = {};
    contexts.forEach(ctx => {
      contextMap[ctx.contextKey] = ctx.contextValue;
    });

    return contextMap;
  }

  private async generateMockResponse(
    session: InterviewSession,
    userMessage: string,
    _context: ConversationContextMap,
  ): Promise<{
    content: string;
    shouldAdvance: boolean;
    nextQuestion?: QuestionData;
  }> {
    // Mock AI response generation
    const responses = [
      "That's a great point. Can you elaborate on your experience with that?",
      'I understand. Tell me more about how you handled that situation.',
      'Interesting perspective. What challenges did you face?',
      'Thank you for sharing. Can you give me a specific example?',
      'That sounds challenging. How did you overcome it?',
    ];

    const randomResponse = responses[Math.floor(Math.random() * responses.length)];

    // Check if we should advance to next question
    const shouldAdvance = userMessage.length > 50 && Math.random() > 0.3;

    let nextQuestion: QuestionData | undefined = undefined;
    if (shouldAdvance && session.currentQuestionIndex < session.totalQuestions - 1) {
      nextQuestion = {
        id: `q_${session.currentQuestionIndex + 1}`,
        text: `Question ${session.currentQuestionIndex + 2}: What are your long-term career goals?`,
        type: 'behavioral',
        category: 'Career Planning',
      };
    }

    return {
      content: randomResponse,
      shouldAdvance,
      ...(nextQuestion && { nextQuestion }),
    };
  }

  private async advanceQuestion(session: InterviewSession): Promise<InterviewSession> {
    const newQuestionIndex = session.currentQuestionIndex + 1;

    let newStatus = session.status;
    if (newQuestionIndex >= session.totalQuestions) {
      newStatus = InterviewStatus.COMPLETED;
    }

    return await this.sessionRepository.update(session.id, {
      currentQuestionIndex: newQuestionIndex,
      questionsAnswered: session.questionsAnswered + 1,
      status: newStatus,
    });
  }

  private analyzeSentiment(message: string): string {
    // Simple sentiment analysis
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'wonderful'];
    const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'difficult'];

    const words = message.toLowerCase().split(' ');
    const positiveCount = words.filter(word => positiveWords.includes(word)).length;
    const negativeCount = words.filter(word => negativeWords.includes(word)).length;

    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  private extractTopics(message: string): string[] {
    // Simple topic extraction
    const topics: string[] = [];
    const techWords = ['javascript', 'python', 'react', 'node', 'database', 'api'];
    const businessWords = ['management', 'leadership', 'strategy', 'team', 'project'];

    const words = message.toLowerCase().split(' ');

    techWords.forEach(word => {
      if (words.includes(word)) topics.push('technology');
    });

    businessWords.forEach(word => {
      if (words.includes(word)) topics.push('business');
    });

    return [...new Set(topics)];
  }

  private analyzeComplexity(message: string): string {
    const words = message.split(' ').length;
    const sentences = message.split('.').length;

    if (words > 100 && sentences > 5) return 'high';
    if (words > 50 && sentences > 3) return 'medium';
    return 'low';
  }
}
