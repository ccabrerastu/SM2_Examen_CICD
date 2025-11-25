import {
  Injectable,
  Inject,
  Logger,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { UpdateRepetitionDto } from '../../dtos/repetition/update-repetition.dto';
import { RepetitionResponseDto } from '../../dtos/repetition/repetition-response.dto';
import { IChapterRepetitionRepository } from '../../interfaces/repositories/chapter-repetition-repository.interface';
import { IUserRepository } from '../../interfaces/repositories/user-repository.interface';
import {
  ChapterRepetition,
  RepetitionStatus,
} from '../../../domain/entities/chapter-repetition.entity';

@Injectable()
export class UpdateRepetitionUseCase {
  private readonly logger = new Logger(UpdateRepetitionUseCase.name);

  constructor(
    @Inject('IChapterRepetitionRepository')
    private readonly chapterRepetitionRepository: IChapterRepetitionRepository,
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(
    userId: string,
    repetitionId: string,
    updateRepetitionDto: UpdateRepetitionDto,
  ): Promise<RepetitionResponseDto> {
    this.logger.log(`Updating repetition ${repetitionId} for user: ${userId}`);

    try {
      // Validate that user exists
      await this.validateUserExists(userId);

      // Get and validate repetition
      const repetition = await this.validateRepetitionExists(repetitionId, userId);

      // Validate that repetition can be updated
      this.validateRepetitionCanBeUpdated(repetition);

      // Validate update data
      this.validateUpdateData(updateRepetitionDto, repetition);

      // Update repetition
      const updateData: any = {};
      if (updateRepetitionDto.repetitionScore !== undefined) {
        updateData.repetitionScore = updateRepetitionDto.repetitionScore;
      }
      if (updateRepetitionDto.status !== undefined) {
        updateData.status = updateRepetitionDto.status;
      }
      if (updateRepetitionDto.exerciseResults !== undefined) {
        updateData.exerciseResults = updateRepetitionDto.exerciseResults;
      }
      if (updateRepetitionDto.completedAt !== undefined) {
        updateData.completedAt = updateRepetitionDto.completedAt;
      }

      const updatedRepetition = await this.chapterRepetitionRepository.update(
        repetitionId,
        updateData,
      );

      this.logger.log(`Repetition ${repetitionId} updated successfully for user: ${userId}`);

      return this.mapToResponseDto(updatedRepetition);
    } catch (error) {
      this.logger.error(
        `Error updating repetition: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  async completeRepetition(
    userId: string,
    repetitionId: string,
    score: number,
    exerciseResults?: Record<string, any>,
  ): Promise<RepetitionResponseDto> {
    this.logger.log(
      `Completing repetition ${repetitionId} for user: ${userId} with score: ${score}`,
    );

    try {
      // Validate that user exists
      await this.validateUserExists(userId);

      // Get and validate repetition
      const repetition = await this.validateRepetitionExists(repetitionId, userId);

      // Validate that repetition can be completed
      this.validateRepetitionCanBeCompleted(repetition);

      // Validate score
      this.validateScore(score);

      // Complete repetition using repository method
      const completedRepetition = await this.chapterRepetitionRepository.markAsCompleted(
        repetitionId,
        score,
        exerciseResults,
      );

      this.logger.log(`Repetition ${repetitionId} completed successfully for user: ${userId}`);

      return this.mapToResponseDto(completedRepetition);
    } catch (error) {
      this.logger.error(
        `Error completing repetition: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  async abandonRepetition(userId: string, repetitionId: string): Promise<RepetitionResponseDto> {
    this.logger.log(`Abandoning repetition ${repetitionId} for user: ${userId}`);

    try {
      // Validate that user exists
      await this.validateUserExists(userId);

      // Get and validate repetition
      const repetition = await this.validateRepetitionExists(repetitionId, userId);

      // Validate that repetition can be abandoned
      this.validateRepetitionCanBeAbandoned(repetition);

      // Abandon repetition using repository method
      const abandonedRepetition =
        await this.chapterRepetitionRepository.markAsAbandoned(repetitionId);

      this.logger.log(`Repetition ${repetitionId} abandoned successfully for user: ${userId}`);

      return this.mapToResponseDto(abandonedRepetition);
    } catch (error) {
      this.logger.error(
        `Error abandoning repetition: ${error instanceof Error ? error.message : String(error)}`,
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

  private async validateRepetitionExists(
    repetitionId: string,
    userId: string,
  ): Promise<ChapterRepetition> {
    const repetition = await this.chapterRepetitionRepository.findById(repetitionId);

    if (!repetition) {
      throw new NotFoundException('Repetition not found');
    }

    // Validate that the repetition belongs to the user
    if (repetition.userId !== userId) {
      throw new NotFoundException('Repetition not found');
    }

    return repetition;
  }

  private validateRepetitionCanBeUpdated(repetition: ChapterRepetition): void {
    if (repetition.status === RepetitionStatus.COMPLETED) {
      throw new ConflictException('Cannot update a completed repetition');
    }

    if (repetition.status === RepetitionStatus.ABANDONED) {
      throw new ConflictException('Cannot update an abandoned repetition');
    }
  }

  private validateRepetitionCanBeCompleted(repetition: ChapterRepetition): void {
    if (repetition.status !== RepetitionStatus.ACTIVE) {
      throw new ConflictException('Only active repetitions can be completed');
    }
  }

  private validateRepetitionCanBeAbandoned(repetition: ChapterRepetition): void {
    if (repetition.status !== RepetitionStatus.ACTIVE) {
      throw new ConflictException('Only active repetitions can be abandoned');
    }
  }

  private validateUpdateData(
    updateRepetitionDto: UpdateRepetitionDto,
    repetition: ChapterRepetition,
  ): void {
    // Validate score if provided
    if (updateRepetitionDto.repetitionScore !== undefined) {
      this.validateScore(updateRepetitionDto.repetitionScore);
    }

    // Validate status transitions
    if (updateRepetitionDto.status !== undefined) {
      this.validateStatusTransition(repetition.status, updateRepetitionDto.status);
    }

    // Validate exercise results
    if (updateRepetitionDto.exerciseResults !== undefined) {
      if (typeof updateRepetitionDto.exerciseResults !== 'object') {
        throw new BadRequestException('Exercise results must be a valid object');
      }
    }

    // Validate completion date
    if (updateRepetitionDto.completedAt !== undefined) {
      if (updateRepetitionDto.completedAt < repetition.startedAt) {
        throw new BadRequestException('Completion date cannot be before start date');
      }
    }
  }

  private validateScore(score: number): void {
    if (score === null || score === undefined || typeof score !== 'number') {
      throw new BadRequestException('Score is required and must be a valid number');
    }
    if (score < 0 || score > 100) {
      throw new BadRequestException('Score must be between 0 and 100');
    }
  }

  private validateStatusTransition(
    currentStatus: RepetitionStatus,
    newStatus: RepetitionStatus,
  ): void {
    const validTransitions: Record<RepetitionStatus, RepetitionStatus[]> = {
      [RepetitionStatus.ACTIVE]: [RepetitionStatus.COMPLETED, RepetitionStatus.ABANDONED],
      [RepetitionStatus.COMPLETED]: [], // No transitions allowed from completed
      [RepetitionStatus.ABANDONED]: [], // No transitions allowed from abandoned
    };

    if (!validTransitions[currentStatus].includes(newStatus)) {
      throw new BadRequestException(
        `Invalid status transition from ${currentStatus} to ${newStatus}`,
      );
    }
  }

  private mapToResponseDto(repetition: ChapterRepetition): RepetitionResponseDto {
    const result: any = {
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
      durationInMinutes: repetition.getDurationInMinutes(),
      improvementRate: repetition.originalProgress?.score
        ? repetition.getImprovementRate(repetition.originalProgress.score)
        : null,
      isActive: repetition.isActive(),
    };

    if (repetition.originalProgress) {
      result.originalProgress = {
        vocabularyItemsLearned: repetition.originalProgress.vocabularyItemsLearned,
        totalVocabularyItems: repetition.originalProgress.totalVocabularyItems,
        chapterCompleted: repetition.originalProgress.chapterCompleted,
        score: repetition.originalProgress.score,
      };
    }

    if (repetition.chapter) {
      result.chapter = {
        id: repetition.chapter.id,
        title: repetition.chapter.title,
        level: String(repetition.chapter.level),
      };
    }

    return result;
  }
}
