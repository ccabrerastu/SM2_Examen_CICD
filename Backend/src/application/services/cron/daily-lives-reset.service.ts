import { Injectable, Logger, Inject } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { IDailyLivesRepository } from '../../interfaces/repositories/daily-lives-repository.interface';

@Injectable()
export class DailyLivesResetService {
  private readonly logger = new Logger(DailyLivesResetService.name);
  private isRunning = false;
  private lastSuccessfulReset: Date | null = null;
  private consecutiveFailures = 0;
  private readonly maxRetries = 3;
  private readonly retryDelay = 5000; // 5 seconds

  constructor(
    @Inject('IDailyLivesRepository')
    private readonly dailyLivesRepository: IDailyLivesRepository,
  ) {}

  /**
   * Cron job that runs daily at 1:00 AM server time to reset all users' lives
   * Cron expression: '0 1 * * *' = At 01:00 every day
   */
  @Cron(CronExpression.EVERY_DAY_AT_1AM, {
    name: 'daily-lives-reset',
    timeZone: 'UTC', // Use UTC for consistency
  })
  async handleDailyLivesReset(): Promise<void> {
    if (this.isRunning) {
      this.logger.warn('Daily lives reset job is already running, skipping...');
      return;
    }

    this.isRunning = true;
    this.logger.log('Starting daily lives reset job...');

    try {
      const result = await this.resetAllUsersLivesWithRetry();

      if (result.success) {
        this.lastSuccessfulReset = new Date();
        this.consecutiveFailures = 0;
        this.logger.log(
          `Daily lives reset completed successfully. ${result.affectedUsers} users processed.`,
        );
      } else {
        throw new Error(`Reset failed: ${result.error}`);
      }
    } catch (error) {
      this.consecutiveFailures++;
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;

      this.logger.error(
        `Daily lives reset failed (attempt ${this.consecutiveFailures}): ${errorMessage}`,
        errorStack,
      );

      // Alert if we have multiple consecutive failures
      if (this.consecutiveFailures >= 3) {
        await this.sendDevOpsAlert(error instanceof Error ? error : new Error(String(error)));
      }
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Reset all users' lives with retry mechanism
   */
  private async resetAllUsersLivesWithRetry(): Promise<{
    success: boolean;
    affectedUsers: number;
    error?: string;
  }> {
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        this.logger.log(`Reset attempt ${attempt}/${this.maxRetries}`);

        const affectedUsers = await this.dailyLivesRepository.resetAllUsersLives();

        this.logger.log(`Reset successful: ${affectedUsers} users updated`);
        return { success: true, affectedUsers };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        this.logger.warn(`Reset attempt ${attempt} failed: ${errorMessage}`);

        if (attempt < this.maxRetries) {
          this.logger.log(`Retrying in ${this.retryDelay}ms...`);
          await this.delay(this.retryDelay);
        } else {
          return {
            success: false,
            affectedUsers: 0,
            error: errorMessage,
          };
        }
      }
    }

    return {
      success: false,
      affectedUsers: 0,
      error: 'Max retries exceeded',
    };
  }

  /**
   * Manual trigger for testing or emergency reset
   */
  async manualReset(): Promise<{
    success: boolean;
    affectedUsers: number;
    message: string;
  }> {
    if (this.isRunning) {
      return {
        success: false,
        affectedUsers: 0,
        message: 'Reset job is already running',
      };
    }

    this.logger.log('Manual daily lives reset triggered');

    try {
      this.isRunning = true;
      const result = await this.resetAllUsersLivesWithRetry();

      if (result.success) {
        this.lastSuccessfulReset = new Date();
        this.consecutiveFailures = 0;
        return {
          success: true,
          affectedUsers: result.affectedUsers,
          message: `Manual reset completed successfully. ${result.affectedUsers} users processed.`,
        };
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Manual reset failed: ${errorMessage}`, errorStack);
      return {
        success: false,
        affectedUsers: 0,
        message: `Manual reset failed: ${errorMessage}`,
      };
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Get reset job status
   */
  getStatus(): {
    isRunning: boolean;
    lastSuccessfulReset: Date | null;
    consecutiveFailures: number;
    nextScheduledRun: string;
  } {
    // Calculate next run time (1:00 AM UTC next day)
    const now = new Date();
    const nextRun = new Date(now);
    nextRun.setUTCHours(1, 0, 0, 0);

    if (nextRun <= now) {
      nextRun.setUTCDate(nextRun.getUTCDate() + 1);
    }

    return {
      isRunning: this.isRunning,
      lastSuccessfulReset: this.lastSuccessfulReset,
      consecutiveFailures: this.consecutiveFailures,
      nextScheduledRun: nextRun.toISOString(),
    };
  }

  /**
   * Send alert to DevOps team
   */
  private async sendDevOpsAlert(error: Error): Promise<void> {
    // TODO: Implement actual alert mechanism (email, Slack, etc.)
    const alertMessage = {
      service: 'Daily Lives Reset',
      severity: 'HIGH',
      message: `Daily lives reset has failed ${this.consecutiveFailures} consecutive times`,
      error: error.message,
      timestamp: new Date().toISOString(),
      lastSuccessfulReset: this.lastSuccessfulReset?.toISOString() || 'Never',
    };

    this.logger.error('DEVOPS ALERT:', JSON.stringify(alertMessage, null, 2));

    // In a real implementation, you would integrate with:
    // - Email service (SendGrid, AWS SES)
    // - Slack/Teams webhooks
    // - Monitoring services (DataDog, New Relic)
    // - PagerDuty or similar alerting services
  }

  /**
   * Utility method for delays
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
