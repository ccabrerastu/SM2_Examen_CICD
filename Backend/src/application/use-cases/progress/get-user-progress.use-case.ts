import { Injectable, Inject, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { UserProgressListDto } from '../../dtos/progress/user-progress-list.dto';
import { ProgressResponseDto } from '../../dtos/progress/progress-response.dto';
import { IUserProgressRepository } from '../../interfaces/repositories/user-progress-repository.interface';
import { IUserRepository } from '../../interfaces/repositories/user-repository.interface';

@Injectable()
export class GetUserProgressUseCase {
  private readonly logger = new Logger(GetUserProgressUseCase.name);

  constructor(
    @Inject('IUserProgressRepository')
    private readonly userProgressRepository: IUserProgressRepository,
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(targetUserId: string, requestingUserId: string): Promise<UserProgressListDto> {
    this.logger.log(
      `Getting progress for user: ${targetUserId}, requested by: ${requestingUserId}`,
    );

    try {
      // Validate that target user exists
      const targetUser = await this.userRepository.findById(targetUserId);
      if (!targetUser) {
        throw new NotFoundException('User not found');
      }

      // Security check: Users can only access their own progress (unless admin)
      const requestingUser = await this.userRepository.findById(requestingUserId);
      if (!requestingUser) {
        throw new NotFoundException('Requesting user not found');
      }

      if (targetUserId !== requestingUserId && !requestingUser.isAdmin) {
        throw new ForbiddenException('You can only access your own progress');
      }

      // Get user progress and stats
      const progressRecords = await this.userProgressRepository.findByUserId(targetUserId);
      const stats = await this.userProgressRepository.getUserStats(targetUserId);

      this.logger.log(`Found ${progressRecords.length} progress records for user: ${targetUserId}`);

      return {
        userId: targetUserId,
        totalRecords: stats.totalRecords,
        lastActivity: stats.lastActivity,
        progress: progressRecords.map(record => this.mapToResponseDto(record)),
      };
    } catch (error) {
      this.logger.error(
        `Error getting user progress: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
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
