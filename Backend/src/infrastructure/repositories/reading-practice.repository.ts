import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ReadingPractice } from '../../domain/entities/reading-practice.entity';
import { IReadingPracticeRepository } from '../../application/interfaces/repositories/reading-practice-repository.interface';

@Injectable()
export class ReadingPracticeRepository implements IReadingPracticeRepository {
  constructor(
    @InjectRepository(ReadingPractice)
    private readonly repository: Repository<ReadingPractice>,
  ) {}

  async create(readingPractice: ReadingPractice): Promise<ReadingPractice> {
    return await this.repository.save(readingPractice);
  }

  async findById(id: string): Promise<ReadingPractice | null> {
    return await this.repository.findOne({
      where: { id },
      relations: ['practiceSession', 'practiceSession.chapter'],
    });
  }

  async findByPracticeSessionId(practiceSessionId: string): Promise<ReadingPractice | null> {
    return await this.repository.findOne({
      where: { practiceSession: { id: practiceSessionId } },
      relations: ['practiceSession', 'practiceSession.chapter'],
    });
  }

  async findByUserId(userId: string, limit = 10, offset = 0): Promise<ReadingPractice[]> {
    return await this.repository.find({
      where: { practiceSession: { userId } },
      relations: ['practiceSession', 'practiceSession.chapter'],
      order: { practiceSession: { createdAt: 'DESC' } },
      take: limit,
      skip: offset,
    });
  }

  async findByUserIdAndCategory(
    userId: string,
    category: string,
    limit = 10,
    offset = 0,
  ): Promise<ReadingPractice[]> {
    return await this.repository.find({
      where: {
        practiceSession: { userId },
        textCategory: category,
      },
      relations: ['practiceSession', 'practiceSession.chapter'],
      order: { practiceSession: { createdAt: 'DESC' } },
      take: limit,
      skip: offset,
    });
  }

  async findByUserIdAndDifficulty(
    userId: string,
    difficulty: string,
    limit = 10,
    offset = 0,
  ): Promise<ReadingPractice[]> {
    return await this.repository.find({
      where: {
        practiceSession: { userId },
        difficultyLevel: difficulty,
      },
      relations: ['practiceSession', 'practiceSession.chapter'],
      order: { practiceSession: { createdAt: 'DESC' } },
      take: limit,
      skip: offset,
    });
  }

  async findCompletedByUserId(
    userId: string,
    completed: boolean,
    limit = 10,
    offset = 0,
  ): Promise<ReadingPractice[]> {
    const queryBuilder = this.repository
      .createQueryBuilder('reading')
      .leftJoinAndSelect('reading.practiceSession', 'session')
      .leftJoinAndSelect('session.chapter', 'chapter')
      .where('session.userId = :userId', { userId });

    if (completed) {
      queryBuilder.andWhere('reading.wordsRead >= reading.totalWords');
    } else {
      queryBuilder.andWhere('reading.wordsRead < reading.totalWords');
    }

    return await queryBuilder
      .orderBy('session.createdAt', 'DESC')
      .take(limit)
      .skip(offset)
      .getMany();
  }

  async update(id: string, updates: Partial<ReadingPractice>): Promise<ReadingPractice> {
    // Exclude relation properties from updates to avoid TypeORM issues
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { practiceSession, ...updateData } = updates;
    await this.repository.update(id, updateData);
    const updated = await this.findById(id);
    if (!updated) {
      throw new Error('Reading practice not found after update');
    }
    return updated;
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async getStatsByUserId(userId: string): Promise<{
    totalSessions: number;
    totalWordsRead: number;
    averageReadingSpeed: number;
    averageComprehensionScore: number;
    totalReadingTime: number;
    categoriesRead: string[];
    vocabularyEncountered: number;
    bookmarksCreated: number;
  }> {
    const practices = await this.repository.find({
      where: { practiceSession: { userId } },
      relations: ['practiceSession'],
    });

    if (practices.length === 0) {
      return {
        totalSessions: 0,
        totalWordsRead: 0,
        averageReadingSpeed: 0,
        averageComprehensionScore: 0,
        totalReadingTime: 0,
        categoriesRead: [],
        vocabularyEncountered: 0,
        bookmarksCreated: 0,
      };
    }

    const totalSessions = practices.length;
    const totalWordsRead = practices.reduce((sum, p) => sum + p.wordsRead, 0);
    const totalReadingTime = practices.reduce((sum, p) => sum + p.readingTimeSeconds, 0);

    const practicesWithSpeed = practices.filter(p => p.readingSpeedWpm && p.readingSpeedWpm > 0);
    const averageReadingSpeed =
      practicesWithSpeed.length > 0
        ? practicesWithSpeed.reduce((sum, p) => sum + (p.readingSpeedWpm || 0), 0) /
          practicesWithSpeed.length
        : 0;

    const practicesWithQuestions = practices.filter(p => p.comprehensionQuestionsTotal > 0);
    const averageComprehensionScore =
      practicesWithQuestions.length > 0
        ? practicesWithQuestions.reduce((sum, p) => sum + p.getComprehensionScore(), 0) /
          practicesWithQuestions.length
        : 0;

    const categoriesRead = Array.from(
      new Set(
        practices
          .map(p => p.textCategory)
          .filter((category): category is string => Boolean(category)),
      ),
    );

    const vocabularyEncountered = practices.reduce(
      (sum, p) => sum + (p.vocabularyEncountered?.length || 0),
      0,
    );
    const bookmarksCreated = practices.reduce((sum, p) => sum + (p.bookmarks?.length || 0), 0);

    return {
      totalSessions,
      totalWordsRead,
      averageReadingSpeed: Math.round(averageReadingSpeed * 100) / 100,
      averageComprehensionScore: Math.round(averageComprehensionScore),
      totalReadingTime,
      categoriesRead,
      vocabularyEncountered,
      bookmarksCreated,
    };
  }
}
