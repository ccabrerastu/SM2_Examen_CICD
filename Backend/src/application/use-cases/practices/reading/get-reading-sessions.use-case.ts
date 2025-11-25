import { Injectable } from '@nestjs/common';
import { ReadingPractice } from '../../../../domain/entities/reading-practice.entity';
import { PracticeStatus } from '../../../../domain/entities/practice-session.entity';
import { IReadingPracticeRepository } from '../../../interfaces/repositories/reading-practice-repository.interface';
import { GetReadingSessionsDto } from '../../../dtos/reading-practice.dto';

@Injectable()
export class GetReadingSessionsUseCase {
  constructor(private readonly readingPracticeRepository: IReadingPracticeRepository) {}

  async execute(
    userId: string,
    filters: GetReadingSessionsDto,
  ): Promise<{ sessions: ReadingPractice[]; total: number }> {
    let sessions: ReadingPractice[];
    const limit = filters.limit || 10;
    const offset = filters.offset || 0;

    // Apply filters using available repository methods
    if (filters.textCategory) {
      sessions = await this.readingPracticeRepository.findByUserIdAndCategory(
        userId,
        filters.textCategory,
        limit,
        offset,
      );
    } else if (filters.difficultyLevel) {
      sessions = await this.readingPracticeRepository.findByUserIdAndDifficulty(
        userId,
        filters.difficultyLevel,
        limit,
        offset,
      );
    } else if (filters.completed !== undefined) {
      sessions = await this.readingPracticeRepository.findCompletedByUserId(
        userId,
        filters.completed,
        limit,
        offset,
      );
    } else {
      sessions = await this.readingPracticeRepository.findByUserId(userId, limit, offset);
    }

    // Filter by chapter if specified
    if (filters.chapterId) {
      sessions = sessions.filter(
        session => session.practiceSession.chapterId === filters.chapterId,
      );
    }

    return { sessions, total: sessions.length };
  }

  async getUserStats(userId: string): Promise<{
    totalSessions: number;
    completedSessions: number;
    totalWordsRead: number;
    averageReadingSpeed: number;
    totalTimeSpent: number;
  }> {
    const stats = await this.readingPracticeRepository.getStatsByUserId(userId);
    const completedSessions = await this.readingPracticeRepository.findCompletedByUserId(
      userId,
      true,
    );

    return {
      totalSessions: stats.totalSessions,
      completedSessions: completedSessions.length,
      totalWordsRead: stats.totalWordsRead,
      averageReadingSpeed: stats.averageReadingSpeed,
      totalTimeSpent: stats.totalReadingTime,
    };
  }

  async getByChapter(
    userId: string,
    chapterId: string,
    limit: number = 10,
    offset: number = 0,
  ): Promise<{ sessions: ReadingPractice[]; total: number }> {
    return this.execute(userId, { chapterId, limit, offset });
  }

  async getInProgressSessions(userId: string): Promise<ReadingPractice[]> {
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
