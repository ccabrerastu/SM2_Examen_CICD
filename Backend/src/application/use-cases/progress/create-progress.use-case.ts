import { Injectable, Inject, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateProgressDto } from '../../dtos/progress/create-progress.dto';
import { ProgressResponseDto } from '../../dtos/progress/progress-response.dto';
import { IUserProgressRepository } from '../../interfaces/repositories/user-progress-repository.interface';
import { IUserRepository } from '../../interfaces/repositories/user-repository.interface';

@Injectable()
export class CreateProgressUseCase {
  private readonly logger = new Logger(CreateProgressUseCase.name);

  constructor(
    @Inject('IUserProgressRepository')
    private readonly userProgressRepository: IUserProgressRepository,
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(
    userId: string,
    createProgressDto: CreateProgressDto,
  ): Promise<ProgressResponseDto> {
    this.logger.log(
      `Creating/updating progress for user: ${userId}, chapter: ${createProgressDto.chapterId}`,
    );

    try {
      // Validate that user exists
      const user = await this.userRepository.findById(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Validate input data
      this.validateCreateProgressData(createProgressDto);

      // Create or update progress
      const progress = await this.userProgressRepository.createOrUpdate(userId, createProgressDto);

      this.logger.log(`Progress saved successfully for user: ${userId}`);

      return this.mapToResponseDto(progress);
    } catch (error) {
      this.logger.error(
        `Error creating progress: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  private validateCreateProgressData(createProgressDto: CreateProgressDto): void {
    if (createProgressDto.score !== undefined) {
      if (createProgressDto.score < 0 || createProgressDto.score > 100) {
        throw new BadRequestException('Score must be between 0 and 100');
      }
    }

    if (createProgressDto.extraData && typeof createProgressDto.extraData !== 'object') {
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
