import {
  Controller,
  Post,
  Get,
  Put,
  Param,
  Body,
  UseGuards,
  Request,
  Logger,
  HttpStatus,
  HttpCode,
  ValidationPipe,
  UsePipes,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { EnhancedJwtGuard } from '../../../shared/guards/enhanced-jwt.guard';

import { CreateProgressDto } from '../../../application/dtos/progress/create-progress.dto';
import { UpdateProgressDto } from '../../../application/dtos/progress/update-progress.dto';
import { ProgressResponseDto } from '../../../application/dtos/progress/progress-response.dto';
import { UserProgressListDto } from '../../../application/dtos/progress/user-progress-list.dto';

import { CreateRepetitionDto } from '../../../application/dtos/repetition/create-repetition.dto';
import { UpdateRepetitionDto } from '../../../application/dtos/repetition/update-repetition.dto';
import { RepetitionResponseDto } from '../../../application/dtos/repetition/repetition-response.dto';
import { RepetitionStatsDto } from '../../../application/dtos/repetition/repetition-stats.dto';

import { CreateProgressUseCase } from '../../../application/use-cases/progress/create-progress.use-case';
import { GetUserProgressUseCase } from '../../../application/use-cases/progress/get-user-progress.use-case';
import { UpdateProgressUseCase } from '../../../application/use-cases/progress/update-progress.use-case';

import { RepeatChapterUseCase } from '../../../application/use-cases/repetition/repeat-chapter.use-case';
import { GetRepetitionsUseCase } from '../../../application/use-cases/repetition/get-repetitions.use-case';
import { UpdateRepetitionUseCase } from '../../../application/use-cases/repetition/update-repetition.use-case';

interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    email: string;
    role: string;
  };
}

@ApiTags('Progress')
@Controller('progress')
@UseGuards(ThrottlerGuard, EnhancedJwtGuard)
@ApiBearerAuth()
export class ProgressController {
  private readonly logger = new Logger(ProgressController.name);

  constructor(
    private readonly createProgressUseCase: CreateProgressUseCase,
    private readonly getUserProgressUseCase: GetUserProgressUseCase,
    private readonly updateProgressUseCase: UpdateProgressUseCase,
    private readonly repeatChapterUseCase: RepeatChapterUseCase,
    private readonly getRepetitionsUseCase: GetRepetitionsUseCase,
    private readonly updateRepetitionUseCase: UpdateRepetitionUseCase,
  ) {}

  /* ======================
   * PROGRESS
   * ====================== */

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @ApiOperation({
    summary: 'Create or update user progress',
    description:
      'Creates a new progress record or updates an existing one for the authenticated user',
  })
  @ApiResponse({
    status: 201,
    description: 'Progress created or updated successfully',
    type: ProgressResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing JWT token' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async createProgress(
    @Body() createProgressDto: CreateProgressDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<ProgressResponseDto> {
    this.logger.log(`Creating progress for user: ${req.user.userId}`);
    try {
      return await this.createProgressUseCase.execute(req.user.userId, createProgressDto);
    } catch (error) {
      this.logger.error(
        `Error creating progress: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  @Get(':userId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get user progress',
    description:
      'Retrieves all progress records for a user. Users can only access their own progress unless they are admin.',
  })
  @ApiParam({
    name: 'userId',
    description: 'User ID to get progress for',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'User progress retrieved successfully',
    type: UserProgressListDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing JWT token' })
  @ApiResponse({ status: 403, description: "Forbidden - Cannot access other user's progress" })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserProgress(
    @Param('userId') targetUserId: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<UserProgressListDto> {
    this.logger.log(`Getting progress for user: ${targetUserId}, requested by: ${req.user.userId}`);
    try {
      return await this.getUserProgressUseCase.execute(targetUserId, req.user.userId);
    } catch (error) {
      this.logger.error(
        `Error getting user progress: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @ApiOperation({
    summary: 'Update progress record',
    description: 'Updates an existing progress record. Users can only update their own progress.',
  })
  @ApiParam({ name: 'id', description: 'Progress record ID', type: 'string', format: 'uuid' })
  @ApiResponse({
    status: 200,
    description: 'Progress updated successfully',
    type: ProgressResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing JWT token' })
  @ApiResponse({ status: 403, description: "Forbidden - Cannot update other user's progress" })
  @ApiResponse({ status: 404, description: 'Progress record not found' })
  async updateProgress(
    @Param('id') progressId: string,
    @Body() updateProgressDto: UpdateProgressDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<ProgressResponseDto> {
    this.logger.log(`Updating progress: ${progressId} by user: ${req.user.userId}`);
    try {
      return await this.updateProgressUseCase.execute(
        progressId,
        req.user.userId,
        updateProgressDto,
      );
    } catch (error) {
      this.logger.error(
        `Error updating progress: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  /* ======================
   * REPETITIONS
   * ====================== */

  @Post('repetitions')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @ApiOperation({
    summary: 'Start chapter repetition',
    description: 'Creates a new repetition session for an approved chapter',
  })
  @ApiResponse({
    status: 201,
    description: 'Repetition started successfully',
    type: RepetitionResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data or chapter not approved' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing JWT token' })
  @ApiResponse({ status: 404, description: 'User or chapter not found' })
  @ApiResponse({ status: 409, description: 'Active repetition already exists for this chapter' })
  async startRepetition(
    @Body() createRepetitionDto: CreateRepetitionDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<RepetitionResponseDto> {
    this.logger.log(
      `Starting repetition for user: ${req.user.userId}, chapter: ${createRepetitionDto.chapterId}`,
    );
    try {
      return await this.repeatChapterUseCase.execute(req.user.userId, createRepetitionDto);
    } catch (error) {
      this.logger.error(
        `Error starting repetition: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  @Get('repetitions')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get user repetitions',
    description: 'Retrieves repetition history for the authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'Repetitions retrieved successfully',
    type: [RepetitionResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing JWT token' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserRepetitions(@Request() req: AuthenticatedRequest): Promise<RepetitionResponseDto[]> {
    this.logger.log(`Getting repetitions for user: ${req.user.userId}`);
    try {
      const result = await this.getRepetitionsUseCase.execute(req.user.userId);
      return result.repetitions;
    } catch (error) {
      this.logger.error(
        `Error getting repetitions: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  @Get('repetitions/recent')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get recent repetitions',
    description: 'Retrieves recent repetitions for the authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'Recent repetitions retrieved successfully',
    type: [RepetitionResponseDto],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing JWT token' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getRecentRepetitions(
    @Request() req: AuthenticatedRequest,
  ): Promise<RepetitionResponseDto[]> {
    this.logger.log(`Getting recent repetitions for user: ${req.user.userId}`);
    try {
      return await this.getRepetitionsUseCase.getRecentRepetitions(req.user.userId);
    } catch (error) {
      this.logger.error(
        `Error getting recent repetitions: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  @Get('repetitions/stats')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get repetition statistics',
    description: 'Retrieves repetition statistics for the authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'Repetition statistics retrieved successfully',
    type: RepetitionStatsDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing JWT token' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getRepetitionStats(@Request() req: AuthenticatedRequest): Promise<RepetitionStatsDto> {
    this.logger.log(`Getting repetition stats for user: ${req.user.userId}`);
    try {
      const result = await this.getRepetitionsUseCase.execute(req.user.userId);
      return (
        result?.stats || {
          totalRepetitions: 0,
          completedRepetitions: 0,
          averageScore: 0,
          lastRepetitionDate: null,
          improvementRate: 0,
        }
      );
    } catch (error) {
      this.logger.error(
        `Error getting repetition stats: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  @Get('repetitions/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get repetition by ID',
    description: 'Retrieves a specific repetition by ID for the authenticated user',
  })
  @ApiParam({ name: 'id', description: 'Repetition ID', type: 'string', format: 'uuid' })
  @ApiResponse({
    status: 200,
    description: 'Repetition retrieved successfully',
    type: RepetitionResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing JWT token' })
  @ApiResponse({ status: 404, description: 'Repetition not found' })
  async getRepetitionById(
    @Param('id') repetitionId: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<RepetitionResponseDto> {
    this.logger.log(`Getting repetition: ${repetitionId} for user: ${req.user.userId}`);
    try {
      return await this.getRepetitionsUseCase.getRepetitionById(req.user.userId, repetitionId);
    } catch (error) {
      this.logger.error(
        `Error getting repetition: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  @Put('repetitions/:id')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @ApiOperation({
    summary: 'Update repetition',
    description: 'Updates an existing repetition session',
  })
  @ApiParam({ name: 'id', description: 'Repetition ID', type: 'string', format: 'uuid' })
  @ApiResponse({
    status: 200,
    description: 'Repetition updated successfully',
    type: RepetitionResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing JWT token' })
  @ApiResponse({ status: 404, description: 'Repetition not found' })
  @ApiResponse({ status: 409, description: 'Cannot update completed or abandoned repetition' })
  async updateRepetition(
    @Param('id') repetitionId: string,
    @Body() updateRepetitionDto: UpdateRepetitionDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<RepetitionResponseDto> {
    this.logger.log(`Updating repetition: ${repetitionId} for user: ${req.user.userId}`);
    try {
      return await this.updateRepetitionUseCase.execute(
        req.user.userId,
        repetitionId,
        updateRepetitionDto,
      );
    } catch (error) {
      this.logger.error(
        `Error updating repetition: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  @Post('repetitions/:id/complete')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @ApiOperation({
    summary: 'Complete repetition',
    description: 'Marks a repetition as completed with final score',
  })
  @ApiParam({ name: 'id', description: 'Repetition ID', type: 'string', format: 'uuid' })
  @ApiResponse({
    status: 200,
    description: 'Repetition completed successfully',
    type: RepetitionResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Invalid score or repetition cannot be completed' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing JWT token' })
  @ApiResponse({ status: 404, description: 'Repetition not found' })
  @ApiResponse({ status: 409, description: 'Repetition is not active' })
  async completeRepetition(
    @Param('id') repetitionId: string,
    @Body() body: { score: number; exerciseResults?: Record<string, any> },
    @Request() req: AuthenticatedRequest,
  ): Promise<RepetitionResponseDto> {
    this.logger.log(
      `Completing repetition: ${repetitionId} for user: ${req.user.userId} with score: ${body.score}`,
    );
    try {
      return await this.updateRepetitionUseCase.completeRepetition(
        req.user.userId,
        repetitionId,
        body.score,
        body.exerciseResults,
      );
    } catch (error) {
      this.logger.error(
        `Error completing repetition: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  @Post('repetitions/:id/abandon')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Abandon repetition', description: 'Marks a repetition as abandoned' })
  @ApiParam({ name: 'id', description: 'Repetition ID', type: 'string', format: 'uuid' })
  @ApiResponse({
    status: 200,
    description: 'Repetition abandoned successfully',
    type: RepetitionResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing JWT token' })
  @ApiResponse({ status: 404, description: 'Repetition not found' })
  @ApiResponse({ status: 409, description: 'Repetition is not active' })
  async abandonRepetition(
    @Param('id') repetitionId: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<RepetitionResponseDto> {
    this.logger.log(`Abandoning repetition: ${repetitionId} for user: ${req.user.userId}`);
    try {
      return await this.updateRepetitionUseCase.abandonRepetition(req.user.userId, repetitionId);
    } catch (error) {
      this.logger.error(
        `Error abandoning repetition: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }
}
