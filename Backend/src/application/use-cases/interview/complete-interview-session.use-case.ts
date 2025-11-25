import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { IInterviewSessionRepository } from '../../interfaces/repositories/interview-repository.interface';
import {
  IConversationContextRepository,
  IConversationSummaryRepository,
} from '../../interfaces/repositories/conversation-context-repository.interface';
import {
  InterviewStatus,
  InterviewSession,
} from '../../../domain/entities/interview-session.entity';

export interface CompleteInterviewRequest {
  sessionId: string;
}

export interface InterviewCompletionResponse {
  sessionId: string;
  finalStatus: InterviewStatus;
  completionPercentage: number;
  overallScore: number;
  fluencyScore: number;
  grammarScore: number;
  vocabularyScore: number;
  pronunciationScore: number;
  coherenceScore: number;
  finalFeedback: string;
  strengths: string[];
  areasForImprovement: string[];
  totalQuestions: number;
  questionsAnswered: number;
  totalTimeSpent: number;
}

// Internal types for analysis
interface CompletionStats extends Record<string, string | number> {
  questionsAnswered: number;
  totalMessages: number;
  averageResponseTime: number;
  userMessages: number;
  systemMessages: number;
}

interface UserPatterns {
  responseLength: number;
  vocabularyDiversity: number;
  sentimentScore: number;
  engagementLevel: string;
  sentiment?: string;
  topics?: string[];
  complexity?: string;
}

interface ConversationAnalysis {
  engagement: string;
  communicationStyle: string;
  strengths: string[];
  improvements: string[];
  sentiment?: string;
  topics?: string[];
}

interface ConversationHistory extends Record<string, unknown> {
  messages: Array<{
    content: string;
    timestamp: Date;
    type: string;
  }>;
  messageCount?: number;
  lastActivity?: Date;
}

@Injectable()
export class CompleteInterviewSessionUseCase {
  constructor(
    private readonly sessionRepository: IInterviewSessionRepository,
    private readonly contextRepository: IConversationContextRepository,
    private readonly summaryRepository: IConversationSummaryRepository,
  ) {}

  async execute(request: CompleteInterviewRequest): Promise<InterviewCompletionResponse> {
    // Validate and get session
    const session = await this.sessionRepository.findById(request.sessionId);
    if (!session) {
      throw new NotFoundException('Interview session not found');
    }

    if (session.status === InterviewStatus.COMPLETED) {
      throw new BadRequestException('Interview session is already completed');
    }

    // Calculate final metrics
    const completionStats = await this.calculateCompletionStats(session);

    // Generate session summary
    const summary = await this.generateSessionSummary(session, completionStats);

    // Use the entity's built-in complete method
    session.complete();

    // Calculate total time spent
    const totalTimeSpent = session.getTotalTimeSpent();

    // Save the completed session
    const updateData: any = {
      status: session.status,
      overallScore: session.overallScore,
      fluencyScore: session.fluencyScore,
      grammarScore: session.grammarScore,
      vocabularyScore: session.vocabularyScore,
      pronunciationScore: session.pronunciationScore,
      coherenceScore: session.coherenceScore,
      totalTimeSpentSeconds: totalTimeSpent,
    };

    if (session.completedAt) {
      updateData.completedAt = session.completedAt;
    }
    if (session.finalFeedback) {
      updateData.finalFeedback = session.finalFeedback;
    }
    if (session.strengths) {
      updateData.strengths = session.strengths;
    }
    if (session.areasForImprovement) {
      updateData.areasForImprovement = session.areasForImprovement;
    }

    const completedSession = await this.sessionRepository.update(session.id, updateData);

    // Archive conversation context
    await this.archiveSessionContext(session.id);

    // Store final summary
    await this.summaryRepository.create({
      sessionId: session.id,
      summaryType: 'final_interview_summary',
      summaryContent: {
        summary: summary.overallSummary,
        keyPoints: summary.keyInsights,
        metrics: completionStats,
        insights: { recommendations: summary.recommendations },
      },
      messageRangeStart: 0,
      messageRangeEnd: completionStats.totalMessages,
      confidenceScore: 0.95,
      generatedBy: 'ai_analysis',
    });

    return {
      sessionId: completedSession.id,
      finalStatus: completedSession.status,
      completionPercentage: completedSession.getCompletionPercentage(),
      overallScore: completedSession.overallScore,
      fluencyScore: completedSession.fluencyScore,
      grammarScore: completedSession.grammarScore,
      vocabularyScore: completedSession.vocabularyScore,
      pronunciationScore: completedSession.pronunciationScore,
      coherenceScore: completedSession.coherenceScore,
      finalFeedback: completedSession.finalFeedback || '',
      strengths: completedSession.strengths || [],
      areasForImprovement: completedSession.areasForImprovement || [],
      totalQuestions: completedSession.totalQuestions,
      questionsAnswered: completedSession.questionsAnswered,
      totalTimeSpent,
    };
  }

  private async calculateCompletionStats(session: InterviewSession): Promise<CompletionStats> {
    // In production, get these from message repository
    // For now, return mock data based on session
    return {
      questionsAnswered: session.questionsAnswered,
      totalMessages: session.questionsAnswered * 2, // Rough estimate
      averageResponseTime: 45, // seconds
      userMessages: session.questionsAnswered,
      systemMessages: session.questionsAnswered,
    };
  }

  private async generateSessionSummary(
    session: InterviewSession,
    stats: CompletionStats,
  ): Promise<{
    overallSummary: string;
    keyInsights: string[];
    topTopics: string[];
    overallSentiment: string;
    recommendations: string[];
  }> {
    // Get conversation context for analysis
    const contexts = await this.contextRepository.findBySessionId(session.id);

    // Extract user patterns and conversation data
    const userPatterns = (contexts.find(c => c.contextKey === 'user_patterns')
      ?.contextValue as unknown as UserPatterns) || {
      responseLength: 0,
      vocabularyDiversity: 0,
      sentimentScore: 0,
      engagementLevel: 'medium',
    };
    const conversationHistory = (contexts.find(c => c.contextKey === 'conversation_history')
      ?.contextValue as unknown as ConversationHistory) || {
      messages: [],
      messageCount: 0,
      lastActivity: new Date(),
    };

    // Analyze the conversation (in production, use advanced NLP)
    const analysis = this.analyzeConversation(userPatterns, conversationHistory, stats);

    return {
      overallSummary: this.generateOverallSummary(session, stats, analysis),
      keyInsights: this.extractKeyInsights(analysis),
      topTopics: analysis.topics || ['communication', 'problem-solving'],
      overallSentiment: analysis.sentiment || 'positive',
      recommendations: this.generateRecommendations(analysis, stats),
    };
  }

  private analyzeConversation(
    userPatterns: UserPatterns,
    _conversationHistory: ConversationHistory,
    stats: CompletionStats,
  ): ConversationAnalysis {
    return {
      engagement: this.calculateEngagement(stats),
      communicationStyle: this.analyzeCommunicationStyle(userPatterns),
      strengths: this.identifyStrengths(userPatterns, stats),
      improvements: this.identifyImprovements(userPatterns, stats),
      sentiment: userPatterns.sentiment || 'positive',
      topics: userPatterns.topics || ['general'],
    };
  }

  private calculateEngagement(stats: CompletionStats): string {
    const messageRatio = stats.userMessages / Math.max(stats.totalMessages, 1);
    if (messageRatio > 0.6) {
      return 'high';
    } else if (messageRatio > 0.3) {
      return 'medium';
    } else {
      return 'low';
    }
  }

  private analyzeCommunicationStyle(patterns: UserPatterns): string {
    return patterns.vocabularyDiversity > 0.7 ? 'varied' : 'consistent';
  }

  private identifyStrengths(patterns: UserPatterns, stats: CompletionStats): string[] {
    const strengths = [];

    if (stats.averageResponseTime < 60) {
      strengths.push('Quick thinking and response time');
    }

    if (patterns.complexity === 'high') {
      strengths.push('Ability to provide detailed explanations');
    }

    if (patterns.sentiment === 'positive') {
      strengths.push('Positive attitude and communication');
    }

    return strengths.length > 0 ? strengths : ['Active participation in the interview'];
  }

  private identifyImprovements(patterns: UserPatterns, stats: CompletionStats): string[] {
    const improvements = [];

    if (stats.averageResponseTime > 120) {
      improvements.push('Consider preparing common interview questions to improve response time');
    }

    if (patterns.complexity === 'low') {
      improvements.push('Provide more detailed examples and explanations');
    }

    return improvements;
  }

  private generateOverallSummary(
    session: InterviewSession,
    stats: CompletionStats,
    analysis: ConversationAnalysis,
  ): string {
    const completionRate = (stats.questionsAnswered / session.totalQuestions) * 100;

    return (
      `Interview session completed with ${completionRate.toFixed(0)}% completion rate. ` +
      `The candidate demonstrated ${analysis.engagement} engagement and ${analysis.communicationStyle} communication style. ` +
      `Overall sentiment was ${analysis.sentiment}. ` +
      `The interview covered topics including ${(analysis.topics || ['general']).join(', ')}.`
    );
  }

  private extractKeyInsights(analysis: ConversationAnalysis): string[] {
    const insights = [];

    insights.push(`Communication style: ${analysis.communicationStyle}`);
    insights.push(`Engagement level: ${analysis.engagement}`);
    insights.push(`Primary topics discussed: ${(analysis.topics || ['general']).join(', ')}`);

    if (analysis.strengths.length > 0) {
      insights.push(`Key strengths: ${analysis.strengths.join(', ')}`);
    }

    return insights;
  }

  private generateRecommendations(
    analysis: ConversationAnalysis,
    stats: CompletionStats,
  ): string[] {
    const recommendations = [];

    if (analysis.engagement === 'low') {
      recommendations.push('Practice active engagement during interviews');
    }

    if (stats.averageResponseTime > 90) {
      recommendations.push('Prepare common interview questions to improve response time');
    }

    // Provide general recommendations
    recommendations.push('Practice providing more detailed examples using the STAR method');

    recommendations.push('Continue practicing interview skills regularly');

    return recommendations;
  }

  private async archiveSessionContext(sessionId: string): Promise<void> {
    const contexts = await this.contextRepository.findBySessionId(sessionId);

    for (const context of contexts) {
      await this.contextRepository.archiveContext(context.id);
    }
  }
}
