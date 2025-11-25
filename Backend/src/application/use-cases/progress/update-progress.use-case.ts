import {
  Injectable,
  Inject,
  Logger,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { UpdateProgressDto } from '../../dtos/progress/update-progress.dto';
import { ProgressResponseDto } from '../../dtos/progress/progress-response.dto';
import { IUserProgressRepository } from '../../interfaces/repositories/user-progress-repository.interface';

@Injectable()
export class UpdateProgressUseCase {
  private readonly logger = new Logger(UpdateProgressUseCase.name);

  constructor(
    @Inject('IUserProgressRepository')
    private readonly userProgressRepository: IUserProgressRepository,
  ) {}

  async execute(
    progressId: string,
    requestingUserId: string,
    updateProgressDto: UpdateProgressDto,
  ): Promise<ProgressResponseDto> {
    this.logger.log(`Updating progress: ${progressId} by user: ${requestingUserId}`);

    try {
      // Find existing progress record
      const existingProgress = await this.userProgressRepository.findById(progressId);
      if (!existingProgress) {
        throw new NotFoundException('Progress record not found');
      }

      // Security check: Users can only update their own progress
      if (existingProgress.userId !== requestingUserId) {
        throw new ForbiddenException('You can only update your own progress');
      }

      // Validate input data
      this.validateUpdateProgressData(updateProgressDto);

      // Update progress
      const updatedProgress = await this.userProgressRepository.update(
        progressId,
        updateProgressDto,
      );

      this.logger.log(`Progress updated successfully: ${progressId}`);

      return this.mapToResponseDto(updatedProgress);
    } catch (error) {
      this.logger.error(
        `Error updating progress: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  private validateUpdateProgressData(updateProgressDto: UpdateProgressDto): void {
    if (updateProgressDto.score !== undefined) {
      if (updateProgressDto.score < 0 || updateProgressDto.score > 100) {
        throw new BadRequestException('Score must be between 0 and 100');
      }
    }

    if (updateProgressDto.extraData && typeof updateProgressDto.extraData !== 'object') {
      throw new BadRequestException('Extra data must be a valid object');
    }
  }

  private mapToResponseDto(
    progress: import('../../../domain/entities/user-progress.entity').UserProgress,
  ): ProgressResponseDto {
    return {
      id: progress.id,
      userId: progress.userId,
      chapterId: progress.chapterId,
      score: progress.score,
      lastActivity: progress.lastActivity,
      extraData: progress.extraData,
      createdAt: progress.createdAt,
      updatedAt: progress.updatedAt,
    };
  }
}
