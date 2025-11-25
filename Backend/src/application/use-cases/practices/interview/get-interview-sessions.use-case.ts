import { Injectable, Inject } from '@nestjs/common';
import {
  InterviewPractice,
  InterviewType,
} from '../../../../domain/entities/interview-practice.entity';
import { PracticeType, PracticeStatus } from '../../../../domain/entities/practice-session.entity';
import { IInterviewPracticeRepository } from '../../../interfaces/repositories/interview-practice-repository.interface';
import { GetInterviewSessionsDto } from '../../../dtos/interview-practice.dto';

@Injectable()
export class GetInterviewSessionsUseCase {
  constructor(
    @Inject('IInterviewPracticeRepository')
    private readonly interviewPracticeRepository: IInterviewPracticeRepository,
  ) {}

  async execute(
    userId: string,
    filters: GetInterviewSessionsDto,
  ): Promise<{ sessions: InterviewPractice[]; total: number }> {
    const queryOptions: Partial<{
      userId: string;
      practiceType: PracticeType;
      chapterId: string;
      interviewType: InterviewType;
    }> = {
      userId,
      practiceType: PracticeType.INTERVIEW,
    };

    // Apply filters
    if (filters.chapterId) {
      queryOptions.chapterId = filters.chapterId;
    }

    if (filters.interviewType) {
      queryOptions.interviewType = filters.interviewType;
    }

    // TODO: Implement findByFilters method in repository
    let sessions = await this.interviewPracticeRepository.findByUserId(
      userId,
      filters.limit || 10,
      filters.offset || 0,
    );

    // Apply completion filter after fetching (until repository supports complex filters)
    if (filters.completed !== undefined) {
      sessions = sessions.filter(session => {
        const isCompleted = session.practiceSession.status === PracticeStatus.COMPLETED;
        return filters.completed ? isCompleted : !isCompleted;
      });
    }

    const total = sessions.length;

    return { sessions, total };
  }

  async getUserStats(userId: string): Promise<{
    totalSessions: number;
    completedSessions: number;
    averageOverallScore: number;
    averageFluencyScore: number;
    averagePronunciationScore: number;
    averageGrammarScore: number;
    averageVocabularyScore: number;
    totalQuestionsAnswered: number;
    averageResponseTime: number;
    totalTimeSpent: number;
    interviewTypeStats: {
      [key in InterviewType]: {
        sessions: number;
        averageScore: number;
      };
    };
  }> {
    // TODO: Implement getUserStats method in repository
    const sessions = await this.interviewPracticeRepository.findByUserId(userId, 100, 0);
    const completedSessions = sessions.filter(
      s => s.practiceSession.status === PracticeStatus.COMPLETED,
    );

    return {
      totalSessions: sessions.length,
      completedSessions: completedSessions.length,
      averageOverallScore: 0,
      averageFluencyScore: 0,
      averagePronunciationScore: 0,
      averageGrammarScore: 0,
      averageVocabularyScore: 0,
      totalQuestionsAnswered: 0,
      averageResponseTime: 0,
      totalTimeSpent: 0,
      interviewTypeStats: {
        job_interview: { sessions: 0, averageScore: 0 },
        casual_conversation: { sessions: 0, averageScore: 0 },
        business_meeting: { sessions: 0, averageScore: 0 },
        academic_interview: { sessions: 0, averageScore: 0 },
        phone_interview: { sessions: 0, averageScore: 0 },
      },
    };
  }

  async getByChapter(
    userId: string,
    chapterId: string,
    limit: number = 10,
    offset: number = 0,
  ): Promise<{ sessions: InterviewPractice[]; total: number }> {
    return this.execute(userId, { chapterId, limit, offset });
  }

  async getByInterviewType(
    userId: string,
    interviewType: InterviewType,
    limit: number = 10,
    offset: number = 0,
  ): Promise<{ sessions: InterviewPractice[]; total: number }> {
    return this.execute(userId, { interviewType, limit, offset });
  }

  async getInProgressSessions(userId: string): Promise<InterviewPractice[]> {
    const { sessions } = await this.execute(userId, {
      completed: false,
      limit: 50,
      offset: 0,
    });

    return sessions.filter(
      session => session.practiceSession.status === PracticeStatus.IN_PROGRESS,
    );
  }
}
