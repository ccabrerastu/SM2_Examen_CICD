import {
  InterviewSession,
  InterviewStatus,
} from '../../../domain/entities/interview-session.entity';
import { InterviewQuestion } from '../../../domain/entities/interview-question.entity';

export interface SessionConfig {
  difficulty?: string;
  timeLimit?: number;
  maxQuestions?: number;
  interviewType?: string;
  allowRetries?: boolean;
  metadata?: Record<string, unknown>;
}

export interface IInterviewSessionRepository {
  // Session management
  create(sessionData: Partial<InterviewSession>): Promise<InterviewSession>;
  findById(id: string): Promise<InterviewSession | null>;
  findBySessionToken(token: string): Promise<InterviewSession | null>;
  findByUserId(userId: string, status?: InterviewStatus): Promise<InterviewSession[]>;
  findActiveByUserId(userId: string): Promise<InterviewSession | null>;
  update(id: string, updateData: Partial<InterviewSession>): Promise<InterviewSession>;
  delete(id: string): Promise<void>;

  // Session lifecycle
  startSession(
    userId: string,
    chapterId?: string,
    sessionConfig?: SessionConfig,
  ): Promise<InterviewSession>;
  completeSession(sessionId: string, finalScore?: number): Promise<InterviewSession>;
  terminateSession(sessionId: string, reason?: string): Promise<InterviewSession>;
  pauseSession(sessionId: string): Promise<InterviewSession>;
  resumeSession(sessionId: string): Promise<InterviewSession>;

  // Session queries
  findExpiredSessions(): Promise<InterviewSession[]>;
  findSessionsByDateRange(startDate: Date, endDate: Date): Promise<InterviewSession[]>;
  countActiveSessionsByUser(userId: string): Promise<number>;
  findSessionsWithHighScore(minScore: number): Promise<InterviewSession[]>;

  // Session cleanup
  cleanupExpiredSessions(): Promise<number>;
  archiveCompletedSessions(olderThanDays: number): Promise<number>;

  // Session statistics
  getSessionStats(userId?: string): Promise<{
    totalSessions: number;
    completedSessions: number;
    averageScore: number;
    averageCompletionTime: number;
  }>;

  // Pagination
  findAllPaginated(
    page: number,
    limit: number,
    filters?: {
      userId?: string;
      status?: InterviewStatus;
      chapterId?: string;
      dateFrom?: Date;
      dateTo?: Date;
    },
  ): Promise<{
    sessions: InterviewSession[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;
}

// NOTE: InterviewMessage entity does not exist yet
// Uncomment this interface when InterviewMessage entity is created
/*
export interface IInterviewMessageRepository {
  // Message management
  create(messageData: Partial<InterviewMessage>): Promise<InterviewMessage>;
  findById(id: string): Promise<InterviewMessage | null>;
  findBySessionId(sessionId: string): Promise<InterviewMessage[]>;
  findBySessionIdPaginated(
    sessionId: string,
    page: number,
    limit: number,
  ): Promise<{
    messages: InterviewMessage[];
    total: number;
    page: number;
    limit: number;
  }>;
  update(id: string, updateData: Partial<InterviewMessage>): Promise<InterviewMessage>;
  delete(id: string): Promise<void>;

  // Message queries
  findMessagesByType(sessionId: string, messageType: string): Promise<InterviewMessage[]>;
  findUserMessages(sessionId: string): Promise<InterviewMessage[]>;
  findSystemMessages(sessionId: string): Promise<InterviewMessage[]>;
  findLatestMessages(sessionId: string, count: number): Promise<InterviewMessage[]>;

  // Message analytics
  getMessageStats(sessionId: string): Promise<{
    totalMessages: number;
    userMessages: number;
    systemMessages: number;
    averageResponseTime: number;
  }>;

  // Bulk operations
  createMany(messages: Partial<InterviewMessage>[]): Promise<InterviewMessage[]>;
  deleteBySessionId(sessionId: string): Promise<void>;
  markAsProcessed(messageIds: string[]): Promise<void>;
}
*/

export interface IInterviewQuestionRepository {
  // Question management
  create(questionData: Partial<InterviewQuestion>): Promise<InterviewQuestion>;
  findById(id: string): Promise<InterviewQuestion | null>;
  findBySessionId(sessionId: string): Promise<InterviewQuestion[]>;
  findBySessionIdOrdered(sessionId: string): Promise<InterviewQuestion[]>;
  update(id: string, updateData: Partial<InterviewQuestion>): Promise<InterviewQuestion>;
  delete(id: string): Promise<void>;

  // Question queries
  findCurrentQuestion(sessionId: string): Promise<InterviewQuestion | null>;
  findNextQuestion(sessionId: string): Promise<InterviewQuestion | null>;
  findAnsweredQuestions(sessionId: string): Promise<InterviewQuestion[]>;
  findUnansweredQuestions(sessionId: string): Promise<InterviewQuestion[]>;
  findQuestionsByType(sessionId: string, questionType: string): Promise<InterviewQuestion[]>;

  // Question operations
  submitAnswer(questionId: string, answer: string): Promise<InterviewQuestion>;
  scoreQuestion(questionId: string, score: number, feedback?: string): Promise<InterviewQuestion>;
  generateQuestionsForSession(
    sessionId: string,
    interviewType: string,
    count: number,
    difficulty?: string,
  ): Promise<InterviewQuestion[]>;

  // Question analytics
  getQuestionStats(sessionId: string): Promise<{
    totalQuestions: number;
    answeredQuestions: number;
    averageScore: number;
    averageResponseTime: number;
  }>;

  // Bulk operations
  createMany(questions: Partial<InterviewQuestion>[]): Promise<InterviewQuestion[]>;
  deleteBySessionId(sessionId: string): Promise<void>;
  updateScores(updates: { questionId: string; score: number; feedback?: string }[]): Promise<void>;
}
