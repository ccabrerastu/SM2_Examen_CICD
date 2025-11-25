import { Injectable, Inject, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { RepetitionResponseDto } from '../../dtos/repetition/repetition-response.dto';
import { RepetitionStatsDto } from '../../dtos/repetition/repetition-stats.dto';
import {
  IChapterRepetitionRepository,
  RepetitionFilters,
} from '../../interfaces/repositories/chapter-repetition-repository.interface';
import { IUserRepository } from '../../interfaces/repositories/user-repository.interface';
import { ChapterRepetition } from '../../../domain/entities/chapter-repetition.entity';

export interface GetRepetitionsOptions {
  chapterId?: string;
  status?: string;
  sessionType?: string;
  limit?: number;
  offset?: number;
  includeStats?: boolean;
}

export interface GetRepetitionsResult {
  repetitions: RepetitionResponseDto[];
  stats: RepetitionStatsDto | undefined;
  total: number;
}

@Injectable()
export class GetRepetitionsUseCase {
  private readonly logger = new Logger(GetRepetitionsUseCase.name);

  constructor(
    @Inject('IChapterRepetitionRepository')
    private readonly chapterRepetitionRepository: IChapterRepetitionRepository,
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(
    userId: string,
    options: GetRepetitionsOptions = {},
  ): Promise<GetRepetitionsResult> {
    this.logger.log(`Getting repetitions for user: ${userId}`);

    try {
      // Validate that user exists
      await this.validateUserExists(userId);

      // Build filters
      const filters: RepetitionFilters = {
        userId,
        ...(options.chapterId && { chapterId: options.chapterId }),
        ...(options.status && { status: options.status as any }),
        ...(options.sessionType && { sessionType: options.sessionType as any }),
        ...(options.limit && { limit: options.limit }),
        ...(options.offset && { offset: options.offset }),
      };

      // Get repetitions
      const repetitions = await this.chapterRepetitionRepository.findByUserId(userId, filters);

      // Get stats if requested
      let stats: RepetitionStatsDto | undefined;
      if (options.includeStats) {
        const repetitionStats = await this.chapterRepetitionRepository.getRepetitionStats(
          userId,
          options.chapterId,
        );
        const repetitionsByChapter =
          await this.chapterRepetitionRepository.countRepetitionsByChapter(userId);

        stats = {
          ...repetitionStats,
          repetitionsByChapter,
        };
      }

      // Get total count (without pagination)
      const totalFilters = { ...filters };
      delete totalFilters.limit;
      delete totalFilters.offset;
      const allRepetitions = await this.chapterRepetitionRepository.findByUserId(
        userId,
        totalFilters,
      );
      const total = allRepetitions.length;

      this.logger.log(`Found ${repetitions.length} repetitions for user: ${userId}`);

      return {
        repetitions: repetitions.map(repetition => this.mapToResponseDto(repetition)),
        stats,
        total,
      };
    } catch (error) {
      this.logger.error(
        `Error getting repetitions: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  async getRepetitionById(userId: string, repetitionId: string): Promise<RepetitionResponseDto> {
    this.logger.log(`Getting repetition ${repetitionId} for user: ${userId}`);

    try {
      // Validate that user exists
      await this.validateUserExists(userId);

      // Get repetition
      const repetition = await this.chapterRepetitionRepository.findById(repetitionId);

      if (!repetition) {
        throw new NotFoundException('Repetition not found');
      }

      // Validate that the repetition belongs to the user
      if (repetition.userId !== userId) {
        throw new ForbiddenException('Access denied to this repetition');
      }

      this.logger.log(`Found repetition ${repetitionId} for user: ${userId}`);

      return this.mapToResponseDto(repetition);
    } catch (error) {
      this.logger.error(
        `Error getting repetition by ID: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  async getRecentRepetitions(userId: string, limit: number = 10): Promise<RepetitionResponseDto[]> {
    this.logger.log(`Getting recent repetitions for user: ${userId}`);

    try {
      // Validate that user exists
      await this.validateUserExists(userId);

      // Get recent repetitions
      const repetitions = await this.chapterRepetitionRepository.findRecentRepetitions(
        userId,
        limit,
      );

      this.logger.log(`Found ${repetitions.length} recent repetitions for user: ${userId}`);

      return repetitions.map(repetition => this.mapToResponseDto(repetition));
    } catch (error) {
      this.logger.error(
        `Error getting recent repetitions: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  private async validateUserExists(userId: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }
  }

  private mapToResponseDto(repetition: ChapterRepetition): RepetitionResponseDto {
    return {
      id: repetition.id,
      userId: repetition.userId,
      chapterId: repetition.chapterId,
      originalProgressId: repetition.originalProgressId,
      repetitionScore: repetition.repetitionScore,
      sessionType: repetition.sessionType,
      status: repetition.status,
      exerciseResults: repetition.exerciseResults,
      startedAt: repetition.startedAt,
      completedAt: repetition.completedAt,
      createdAt: repetition.createdAt,
      updatedAt: repetition.updatedAt,
      ...(repetition.originalProgress && {
        originalProgress: {
          id: repetition.originalProgress.id,
          userId: repetition.originalProgress.userId,
          chapterId: repetition.originalProgress.chapterId,
          score: repetition.originalProgress.score,
          lastActivity: repetition.originalProgress.lastActivity,
          extraData: repetition.originalProgress.extraData,
          createdAt: repetition.originalProgress.createdAt,
          updatedAt: repetition.originalProgress.updatedAt,
        },
      }),
      ...(repetition.chapter && {
        chapter: {
          id: repetition.chapter.id,
          title: repetition.chapter.title || 'Unknown Chapter',
          level: repetition.chapter.level?.toString() || 'unknown',
        },
      }),
      durationInMinutes: repetition.getDurationInMinutes(),
      improvementRate: repetition.originalProgress?.score
        ? repetition.getImprovementRate(repetition.originalProgress.score)
        : null,
      isActive: repetition.isActive(),
    } as RepetitionResponseDto;
  }
}
