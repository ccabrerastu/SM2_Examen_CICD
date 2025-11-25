import { Injectable, Inject, Logger, BadRequestException } from '@nestjs/common';
import { IDailyLivesRepository } from '../../interfaces/repositories/daily-lives-repository.interface';
import { ConsumeLifeResponseDto } from '../../dtos/daily-lives/consume-life-response.dto';
import { NoLivesError } from '../../../shared/exceptions/no-lives.error';

@Injectable()
export class ConsumeLifeUseCase {
  private readonly logger = new Logger(ConsumeLifeUseCase.name);

  constructor(
    @Inject('IDailyLivesRepository')
    private readonly dailyLivesRepository: IDailyLivesRepository,
  ) {}

  async execute(userId: string): Promise<ConsumeLifeResponseDto> {
    this.logger.log(`Attempting to consume life for user: ${userId}`);

    try {
      // Get or create daily lives record (this handles both creation and daily reset)
      const dailyLives = await this.dailyLivesRepository.createOrUpdateForUser(userId);

      // Check if user has lives available
      if (dailyLives.currentLives <= 0) {
        this.logger.warn(`User ${userId} attempted to consume life but has no lives remaining`);

        const nextReset = this.getNextResetTime();
        throw new NoLivesError(
          'You have no lives remaining. Try again tomorrow.',
          nextReset.toISOString(),
          0,
        );
      }

      // Consume a life
      const updatedLives = await this.dailyLivesRepository.consumeLife(userId);

      if (!updatedLives) {
        throw new BadRequestException('Failed to consume life - user record not found');
      }

      const nextReset = this.getNextResetTime();

      const response: ConsumeLifeResponseDto = {
        success: true,
        currentLives: updatedLives.currentLives,
        hasLivesAvailable: updatedLives.currentLives > 0,
        message: `Life consumed successfully. You have ${updatedLives.currentLives} lives remaining.`,
        nextReset: nextReset.toISOString(),
      };

      this.logger.log(
        `Life consumed for user ${userId}. Lives remaining: ${updatedLives.currentLives}`,
      );
      return response;
    } catch (error) {
      if (error instanceof NoLivesError) {
        throw error; // Re-throw NoLivesError as is
      }

      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error consuming life for user ${userId}: ${errorMessage}`);
      throw new BadRequestException(`Failed to consume life: ${errorMessage}`);
    }
  }

  private getNextResetTime(): Date {
    const tomorrow = new Date();
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    tomorrow.setUTCHours(1, 0, 0, 0); // 1:00 AM UTC
    return tomorrow;
  }
}
