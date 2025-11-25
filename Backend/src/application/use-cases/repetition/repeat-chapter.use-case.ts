import {
  Injectable,
  Inject,
  Logger,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { CreateRepetitionDto } from '../../dtos/repetition/create-repetition.dto';
import { RepetitionResponseDto } from '../../dtos/repetition/repetition-response.dto';
import { IChapterRepetitionRepository } from '../../interfaces/repositories/chapter-repetition-repository.interface';
import { IUserProgressRepository } from '../../interfaces/repositories/user-progress-repository.interface';
import { IUserRepository } from '../../interfaces/repositories/user-repository.interface';
import { ChapterRepetition, SessionType } from '../../../domain/entities/chapter-repetition.entity';

@Injectable()
export class RepeatChapterUseCase {
  private readonly logger = new Logger(RepeatChapterUseCase.name);

  constructor(
    @Inject('IChapterRepetitionRepository')
    private readonly chapterRepetitionRepository: IChapterRepetitionRepository,
    @Inject('IUserProgressRepository')
    private readonly userProgressRepository: IUserProgressRepository,
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(
    userId: string,
    createRepetitionDto: CreateRepetitionDto,
  ): Promise<RepetitionResponseDto> {
    this.logger.log(
      `Starting chapter repetition for user: ${userId}, chapter: ${createRepetitionDto.chapterId}`,
    );

    try {
      // Validate that user exists
      await this.validateUserExists(userId);

      // Validate that the original progress exists and belongs to the user
      const originalProgress = await this.validateOriginalProgress(
        userId,
        createRepetitionDto.originalProgressId,
        createRepetitionDto.chapterId,
      );

      // Validate that the chapter is approved (has a passing score)
      this.validateChapterIsApproved(originalProgress);

      // Check if there's already an active repetition for this chapter
      await this.validateNoActiveRepetition(userId, createRepetitionDto.chapterId);

      // Create the repetition
      const repetition = await this.chapterRepetitionRepository.create({
        userId,
        chapterId: createRepetitionDto.chapterId,
        originalProgressId: createRepetitionDto.originalProgressId,
        sessionType: createRepetitionDto.sessionType || SessionType.PRACTICE,
      });

      this.logger.log(`Chapter repetition created successfully for user: ${userId}`);

      return this.mapToResponseDto(repetition, originalProgress);
    } catch (error) {
      this.logger.error(
        `Error creating chapter repetition: ${error instanceof Error ? error.message : String(error)}`,
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

  private async validateOriginalProgress(
    userId: string,
    originalProgressId: string,
    chapterId: string,
  ): Promise<any> {
    const originalProgress = await this.userProgressRepository.findById(originalProgressId);

    if (!originalProgress) {
      throw new NotFoundException('Original progress record not found');
    }

    // Validate that the progress belongs to the user
    if (originalProgress.userId !== userId) {
      throw new BadRequestException('You can only repeat your own progress records');
    }

    // Validate that the progress corresponds to the specified chapter
    if (originalProgress.chapterId !== chapterId) {
      throw new BadRequestException('Progress record does not match the specified chapter');
    }

    return originalProgress;
  }

  private validateChapterIsApproved(originalProgress: any): void {
    // A chapter is considered approved if it has a score >= 70
    const PASSING_SCORE = 70;

    if (!originalProgress.score || originalProgress.score < PASSING_SCORE) {
      throw new BadRequestException(
        `Chapter must be approved with a score of at least ${PASSING_SCORE} to be repeated. Current score: ${originalProgress.score || 'N/A'}`,
      );
    }
  }

  private async validateNoActiveRepetition(userId: string, chapterId: string): Promise<void> {
    const activeRepetition = await this.chapterRepetitionRepository.findActiveRepetition(
      userId,
      chapterId,
    );

    if (activeRepetition) {
      throw new ConflictException(
        'There is already an active repetition for this chapter. Please complete or abandon it before starting a new one.',
      );
    }
  }

  private mapToResponseDto(
    repetition: ChapterRepetition,
    originalProgress?: any,
  ): RepetitionResponseDto {
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
      originalProgress: {
        id: originalProgress?.id || '',
        userId: originalProgress?.userId || '',
        chapterId: originalProgress?.chapterId || '',
        score: originalProgress?.score || 0,
        lastActivity: originalProgress?.lastActivity || new Date(),
        extraData: originalProgress?.extraData || {},
        createdAt: originalProgress?.createdAt || new Date(),
        updatedAt: originalProgress?.updatedAt || new Date(),
      },
      durationInMinutes: repetition.getDurationInMinutes(),
      improvementRate: originalProgress?.score
        ? repetition.getImprovementRate(originalProgress.score)
        : null,
      isActive: repetition.isActive(),
    };
  }
}
