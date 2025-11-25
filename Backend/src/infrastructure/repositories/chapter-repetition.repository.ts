import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ChapterRepetition,
  RepetitionStatus,
  SessionType,
} from '../../domain/entities/chapter-repetition.entity';
import { IChapterRepetitionRepository } from '../../application/interfaces/repositories/chapter-repetition-repository.interface';

export interface CreateRepetitionData {
  userId: string;
  chapterId: string;
  originalProgressId: string;
  sessionType?: SessionType;
}

export interface UpdateRepetitionData {
  repetitionScore?: number;
  status?: RepetitionStatus;
  exerciseResults?: Record<string, unknown>;
  completedAt?: Date;
}

export interface RepetitionFilters {
  userId?: string;
  chapterId?: string;
  status?: RepetitionStatus;
  sessionType?: SessionType;
  limit?: number;
  offset?: number;
}

export interface RepetitionStats {
  totalRepetitions: number;
  completedRepetitions: number;
  averageScore: number;
  lastRepetitionDate: Date | null;
  improvementRate: number;
}

@Injectable()
export class ChapterRepetitionRepository implements IChapterRepetitionRepository {
  constructor(
    @InjectRepository(ChapterRepetition)
    private readonly repository: Repository<ChapterRepetition>,
  ) {}

  async create(data: CreateRepetitionData): Promise<ChapterRepetition> {
    const repetition = this.repository.create({
      userId: data.userId,
      chapterId: data.chapterId,
      originalProgressId: data.originalProgressId,
      sessionType: data.sessionType || SessionType.PRACTICE,
      status: RepetitionStatus.ACTIVE,
      startedAt: new Date(),
    });

    return await this.repository.save(repetition);
  }

  async findById(id: string): Promise<ChapterRepetition | null> {
    return await this.repository.findOne({
      where: { id },
      relations: ['user', 'chapter', 'originalProgress'],
    });
  }

  async findByUserId(userId: string, filters?: RepetitionFilters): Promise<ChapterRepetition[]> {
    const queryBuilder = this.repository
      .createQueryBuilder('repetition')
      .leftJoinAndSelect('repetition.chapter', 'chapter')
      .leftJoinAndSelect('repetition.originalProgress', 'originalProgress')
      .where('repetition.userId = :userId', { userId })
      .orderBy('repetition.createdAt', 'DESC');

    if (filters?.chapterId) {
      queryBuilder.andWhere('repetition.chapterId = :chapterId', { chapterId: filters.chapterId });
    }

    if (filters?.status) {
      queryBuilder.andWhere('repetition.status = :status', { status: filters.status });
    }

    if (filters?.sessionType) {
      queryBuilder.andWhere('repetition.sessionType = :sessionType', {
        sessionType: filters.sessionType,
      });
    }

    if (filters?.limit) {
      queryBuilder.limit(filters.limit);
    }

    if (filters?.offset) {
      queryBuilder.offset(filters.offset);
    }

    return await queryBuilder.getMany();
  }

  async findByUserAndChapter(
    userId: string,
    chapterId: string,
    filters?: RepetitionFilters,
  ): Promise<ChapterRepetition[]> {
    const queryBuilder = this.repository
      .createQueryBuilder('repetition')
      .leftJoinAndSelect('repetition.originalProgress', 'originalProgress')
      .where('repetition.userId = :userId', { userId })
      .andWhere('repetition.chapterId = :chapterId', { chapterId })
      .orderBy('repetition.createdAt', 'DESC');

    if (filters?.status) {
      queryBuilder.andWhere('repetition.status = :status', { status: filters.status });
    }

    if (filters?.sessionType) {
      queryBuilder.andWhere('repetition.sessionType = :sessionType', {
        sessionType: filters.sessionType,
      });
    }

    if (filters?.limit) {
      queryBuilder.limit(filters.limit);
    }

    return await queryBuilder.getMany();
  }

  async findActiveRepetition(userId: string, chapterId: string): Promise<ChapterRepetition | null> {
    return await this.repository.findOne({
      where: {
        userId,
        chapterId,
        status: RepetitionStatus.ACTIVE,
      },
      relations: ['originalProgress'],
    });
  }

  async update(id: string, data: UpdateRepetitionData): Promise<ChapterRepetition> {
    const existing = await this.repository.findOne({ where: { id } });
    if (!existing) {
      throw new Error('Repetition record not found');
    }

    const updated = this.repository.merge(existing, {
      ...(data.repetitionScore !== undefined && { repetitionScore: data.repetitionScore }),
      ...(data.status !== undefined && { status: data.status }),
      ...(data.exerciseResults !== undefined && { exerciseResults: data.exerciseResults }),
      ...(data.completedAt !== undefined && { completedAt: data.completedAt }),
    });

    return await this.repository.save(updated);
  }

  async markAsCompleted(
    id: string,
    score: number,
    exerciseResults?: Record<string, unknown>,
  ): Promise<ChapterRepetition> {
    const repetition = await this.findById(id);
    if (!repetition) {
      throw new Error('Repetition not found');
    }

    repetition.markAsCompleted(score, exerciseResults);
    return await this.repository.save(repetition);
  }

  async markAsAbandoned(id: string): Promise<ChapterRepetition> {
    const repetition = await this.findById(id);
    if (!repetition) {
      throw new Error('Repetition not found');
    }

    repetition.markAsAbandoned();
    return await this.repository.save(repetition);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async getRepetitionStats(userId: string, chapterId?: string): Promise<RepetitionStats> {
    const queryBuilder = this.repository
      .createQueryBuilder('repetition')
      .leftJoinAndSelect('repetition.originalProgress', 'originalProgress')
      .where('repetition.userId = :userId', { userId });

    if (chapterId) {
      queryBuilder.andWhere('repetition.chapterId = :chapterId', { chapterId });
    }

    const repetitions = await queryBuilder.getMany();
    const completedRepetitions = repetitions.filter(r => r.status === RepetitionStatus.COMPLETED);

    const totalRepetitions = repetitions.length;
    const completedCount = completedRepetitions.length;

    const averageScore =
      completedCount > 0
        ? completedRepetitions.reduce((sum, r) => sum + (r.repetitionScore || 0), 0) /
          completedCount
        : 0;

    const lastRepetitionDate =
      repetitions.length > 0
        ? repetitions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0].createdAt
        : null;

    // Calcular tasa de mejora promedio
    const improvementRates = completedRepetitions
      .filter(
        r =>
          r.originalProgress &&
          typeof r.originalProgress.score === 'number' &&
          r.originalProgress.score > 0,
      )
      .map(r => r.getImprovementRate(r.originalProgress.score as number));

    const improvementRate =
      improvementRates.length > 0
        ? improvementRates.reduce((sum, rate) => sum + rate, 0) / improvementRates.length
        : 0;

    return {
      totalRepetitions,
      completedRepetitions: completedCount,
      averageScore,
      lastRepetitionDate,
      improvementRate,
    };
  }

  async countRepetitionsByChapter(userId: string): Promise<Record<string, number>> {
    const result = await this.repository
      .createQueryBuilder('repetition')
      .select('repetition.chapterId', 'chapterId')
      .addSelect('COUNT(*)', 'count')
      .where('repetition.userId = :userId', { userId })
      .groupBy('repetition.chapterId')
      .getRawMany();

    return result.reduce((acc, item) => {
      acc[item.chapterId] = parseInt(item.count);
      return acc;
    }, {});
  }

  async findRecentRepetitions(userId: string, limit: number = 10): Promise<ChapterRepetition[]> {
    return await this.repository.find({
      where: { userId },
      relations: ['chapter', 'originalProgress'],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }
}
