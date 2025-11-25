import { Injectable, NestMiddleware, Logger, Inject } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { IDailyLivesRepository } from '../../application/interfaces/repositories/daily-lives-repository.interface';
import { NoLivesError } from '../exceptions/no-lives.error';

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

@Injectable()
export class LivesValidationMiddleware implements NestMiddleware {
  private readonly logger = new Logger(LivesValidationMiddleware.name);

  constructor(
    @Inject('IDailyLivesRepository')
    private readonly dailyLivesRepository: IDailyLivesRepository,
  ) {}

  async use(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    // Only validate on critical requests that consume learning actions
    const criticalRoutes = [
      '/api/v1/progress', // When submitting progress
      '/api/v1/quiz/', // Quiz attempts (future)
      '/api/v1/exercise/', // Exercise attempts (future)
      '/api/v1/assessment/', // Assessment attempts (future)
    ];

    // Skip validation for non-critical routes
    const isCriticalRoute = criticalRoutes.some(
      route => req.path.startsWith(route) && req.method === 'POST',
    );

    if (!isCriticalRoute) {
      return next();
    }

    // Skip validation if user is not authenticated
    if (!req.user?.userId) {
      return next();
    }

    const userId = req.user.userId;

    try {
      this.logger.log(`Validating lives for user ${userId} on ${req.method} ${req.path}`);

      // Get or create daily lives record (this handles both creation and daily reset)
      const dailyLives = await this.dailyLivesRepository.createOrUpdateForUser(userId);

      // Check if user has lives available
      if (dailyLives.currentLives <= 0) {
        this.logger.warn(
          `AUDIT: User ${userId} blocked - no lives remaining for ${req.method} ${req.path}`,
        );

        const nextReset = this.getNextResetTime();
        const error = new NoLivesError(
          'You have no lives remaining. Try again tomorrow.',
          nextReset.toISOString(),
          0,
        );

        return res.status(error.getStatus()).json(error.getResponse());
      }

      // Lives available, continue
      this.logger.log(
        `Lives validation passed for user ${userId}. Lives available: ${dailyLives.currentLives}`,
      );
      next();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error validating lives for user ${userId}: ${errorMessage}`);

      // On validation error, log but allow request to continue
      // This ensures the system doesn't break if lives validation fails
      this.logger.warn(`Lives validation failed, allowing request to continue`);
      next();
    }
  }

  private getNextResetTime(): Date {
    const tomorrow = new Date();
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    tomorrow.setUTCHours(1, 0, 0, 0); // 1:00 AM UTC
    return tomorrow;
  }
}
