import { Injectable, Inject, Logger } from '@nestjs/common';
import { IDailyLivesRepository } from '../../interfaces/repositories/daily-lives-repository.interface';
import { DailyLivesResponseDto } from '../../dtos/daily-lives/daily-lives-response.dto';

@Injectable()
export class ResetLivesUseCase {
  private readonly logger = new Logger(ResetLivesUseCase.name);

  constructor(
    @Inject('IDailyLivesRepository')
    private readonly dailyLivesRepository: IDailyLivesRepository,
  ) {}

  async execute(userId: string): Promise<DailyLivesResponseDto> {
    this.logger.log(`Resetting lives for user: ${userId} (TESTING MODE)`);

    try {
      // Reset user lives to 5
      const dailyLives = await this.dailyLivesRepository.resetDailyLives(userId);

      if (!dailyLives) {
        // If no record exists, create one
        const newDailyLives = await this.dailyLivesRepository.createOrUpdateForUser(userId);

        const response: DailyLivesResponseDto = {
          id: newDailyLives.id,
          userId: newDailyLives.userId,
          currentLives: newDailyLives.currentLives,
          hasLivesAvailable: newDailyLives.currentLives > 0,
          lastResetDate: newDailyLives.lastResetDate,
          nextReset: this.getNextResetTime().toISOString(),
          createdAt: newDailyLives.createdAt,
          updatedAt: newDailyLives.updatedAt,
        };

        this.logger.log(`Lives reset completed for user ${userId}: ${newDailyLives.currentLives}/5`);
        return response;
      }

      const response: DailyLivesResponseDto = {
        id: dailyLives.id,
        userId: dailyLives.userId,
        currentLives: dailyLives.currentLives,
        hasLivesAvailable: dailyLives.currentLives > 0,
        lastResetDate: dailyLives.lastResetDate,
        nextReset: this.getNextResetTime().toISOString(),
        createdAt: dailyLives.createdAt,
        updatedAt: dailyLives.updatedAt,
      };

      this.logger.log(`Lives reset completed for user ${userId}: ${dailyLives.currentLives}/5`);
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error resetting lives for user ${userId}: ${errorMessage}`);
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
