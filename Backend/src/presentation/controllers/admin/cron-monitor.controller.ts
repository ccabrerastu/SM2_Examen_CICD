import { Controller, Get, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiSecurity } from '@nestjs/swagger';
import { DailyLivesResetService } from '../../../application/services/cron/daily-lives-reset.service';

@ApiTags('admin/cron-monitoring')
@Controller('admin/cron')
@ApiBearerAuth()
@ApiSecurity('admin-only')
export class CronMonitorController {
  constructor(private readonly dailyLivesResetService: DailyLivesResetService) {}

  @Get('lives-reset/status')
  @ApiOperation({
    summary: 'Get daily lives reset job status',
    description: 'Retrieve status information about the daily lives reset cron job',
  })
  @ApiResponse({
    status: 200,
    description: 'Job status retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        isRunning: {
          type: 'boolean',
          description: 'Whether the job is currently running',
          example: false,
        },
        lastSuccessfulReset: {
          type: 'string',
          format: 'date-time',
          description: 'Timestamp of last successful reset',
          example: '2025-09-11T01:00:00.000Z',
          nullable: true,
        },
        consecutiveFailures: {
          type: 'number',
          description: 'Number of consecutive failures',
          example: 0,
        },
        nextScheduledRun: {
          type: 'string',
          format: 'date-time',
          description: 'Next scheduled run time',
          example: '2025-09-12T01:00:00.000Z',
        },
      },
    },
  })
  async getLivesResetStatus() {
    return this.dailyLivesResetService.getStatus();
  }

  @Post('lives-reset/trigger')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Manually trigger daily lives reset',
    description: 'Manually execute the daily lives reset job for testing or emergency purposes',
  })
  @ApiResponse({
    status: 200,
    description: 'Manual reset completed',
    schema: {
      type: 'object',
      properties: {
        success: {
          type: 'boolean',
          description: 'Whether the reset was successful',
          example: true,
        },
        affectedUsers: {
          type: 'number',
          description: 'Number of users whose lives were reset',
          example: 150,
        },
        message: {
          type: 'string',
          description: 'Descriptive message about the operation',
          example: 'Manual reset completed successfully. 150 users processed.',
        },
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'Reset job is already running',
  })
  @ApiResponse({
    status: 500,
    description: 'Reset failed due to internal error',
  })
  async triggerLivesReset() {
    return await this.dailyLivesResetService.manualReset();
  }
}
