import { Injectable, Inject, Logger } from '@nestjs/common';
import { IDailyLivesRepository } from '../../interfaces/repositories/daily-lives-repository.interface';
import { DailyLivesResponseDto } from '../../dtos/daily-lives/daily-lives-response.dto';

@Injectable()
export class GetLivesStatusUseCase {
  private readonly logger = new Logger(GetLivesStatusUseCase.name);

  constructor(
    @Inject('IDailyLivesRepository')
    private readonly dailyLivesRepository: IDailyLivesRepository,
  ) {}

  async execute(userId: string): Promise<DailyLivesResponseDto> {
    this.logger.log(`Getting lives status for user: ${userId}`);

    try {
      // Get or create daily lives record (this handles both creation and daily reset)
      const dailyLives = await this.dailyLivesRepository.createOrUpdateForUser(userId);

      const nextReset = this.getNextResetTime();

      const response: DailyLivesResponseDto = {
        id: dailyLives.id,
        userId: dailyLives.userId,
        currentLives: dailyLives.currentLives,
        hasLivesAvailable: dailyLives.currentLives > 0,
        lastResetDate: dailyLives.lastResetDate,
        nextReset: nextReset.toISOString(),
        createdAt: dailyLives.createdAt,
        updatedAt: dailyLives.updatedAt,
      };

      this.logger.log(`Lives status retrieved for user ${userId}: ${dailyLives.currentLives}/5`);
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error getting lives status for user ${userId}: ${errorMessage}`);
      throw error;
    }
  }

  private getNextResetTime(): Date {
    const tomorrow = new Date();
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    tomorrow.setUTCHours(1, 0, 0, 0); // 1:00 AM UTC
    return tomorrow;
  }
}
