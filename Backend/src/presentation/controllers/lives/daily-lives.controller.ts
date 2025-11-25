import {
  Controller,
  Post,
  Get,
  UseGuards,
  Request,
  Logger,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiExtraModels,
  getSchemaPath,
} from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { EnhancedJwtGuard } from '../../../shared/guards/enhanced-jwt.guard';
import { ConsumeLifeUseCase } from '../../../application/use-cases/daily-lives/consume-life.use-case';
import { GetLivesStatusUseCase } from '../../../application/use-cases/daily-lives/get-lives-status.use-case';
import { ResetLivesUseCase } from '../../../application/use-cases/daily-lives/reset-lives.use-case';
import { ConsumeLifeResponseDto } from '../../../application/dtos/daily-lives/consume-life-response.dto';
import { DailyLivesResponseDto } from '../../../application/dtos/daily-lives/daily-lives-response.dto';
import { NoLivesErrorDto } from '../../../application/dtos/daily-lives/no-lives-error.dto';
import { SkipCSRF } from '../../../shared/guards/csrf.guard';

interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    email: string;
    role: string;
  };
}

@ApiTags('Lives')
@Controller('lives')
@UseGuards(ThrottlerGuard, EnhancedJwtGuard)
@ApiBearerAuth()
@ApiExtraModels(ConsumeLifeResponseDto, DailyLivesResponseDto, NoLivesErrorDto)
export class DailyLivesController {
  private readonly logger = new Logger(DailyLivesController.name);

  constructor(
    private readonly consumeLifeUseCase: ConsumeLifeUseCase,
    private readonly getLivesStatusUseCase: GetLivesStatusUseCase,
    private readonly resetLivesUseCase: ResetLivesUseCase,
  ) {}

  @Get('status')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get user lives status',
    description:
      'Retrieves the current lives status for the authenticated user including available lives and next reset time',
  })
  @ApiResponse({
    status: 200,
    description: 'Lives status retrieved successfully',
    type: DailyLivesResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async getLivesStatus(@Request() req: AuthenticatedRequest): Promise<DailyLivesResponseDto> {
    this.logger.log(`Getting lives status for user: ${req.user.userId}`);

    try {
      return await this.getLivesStatusUseCase.execute(req.user.userId);
    } catch (error) {
      this.logger.error(
        `Error getting lives status: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  @Post('consume')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Consume a life',
    description:
      'Consumes one life when the user makes an error. Returns updated lives count or error if no lives available.',
  })
  @ApiResponse({
    status: 200,
    description: 'Life consumed successfully',
    type: ConsumeLifeResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'No lives available - user must wait for daily reset',
    schema: {
      $ref: getSchemaPath(NoLivesErrorDto),
    },
  })
  @ApiResponse({
    status: 429,
    description: 'Too many requests - rate limit exceeded',
  })
  async consumeLife(@Request() req: AuthenticatedRequest): Promise<ConsumeLifeResponseDto> {
    this.logger.log(`Consuming life for user: ${req.user.userId}`);

    // Add audit logging
    this.logger.log(
      `AUDIT: User ${req.user.userId} (${req.user.email}) attempting to consume life`,
    );

    try {
      const result = await this.consumeLifeUseCase.execute(req.user.userId);

      // Audit successful consumption
      this.logger.log(
        `AUDIT: Life consumed successfully for user ${req.user.userId}. Lives remaining: ${result.currentLives}`,
      );

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      // Audit failed consumption attempts
      this.logger.warn(
        `AUDIT: Failed to consume life for user ${req.user.userId}: ${errorMessage}`,
      );

      this.logger.error(`Error consuming life: ${errorMessage}`);
      throw error;
    }
  }

  @Post('reset')
  @SkipCSRF()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Reset user lives (TESTING ONLY)',
    description:
      'Resets the authenticated user lives to 5. This endpoint is for testing purposes only.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lives reset successfully',
    type: DailyLivesResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async resetLives(@Request() req: AuthenticatedRequest): Promise<DailyLivesResponseDto> {
    this.logger.log(`Resetting lives for user: ${req.user.userId} (TESTING MODE)`);

    try {
      const result = await this.resetLivesUseCase.execute(req.user.userId);

      this.logger.log(
        `AUDIT: Lives reset successfully for user ${req.user.userId}. Lives now: ${result.currentLives}`,
      );

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error resetting lives: ${errorMessage}`);
      throw error;
    }
  }
}
