import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  Logger,
  HttpStatus,
  HttpCode,
  ParseUUIDPipe,
  ValidationPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiExtraModels,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { EnhancedJwtGuard } from '../../../shared/guards/enhanced-jwt.guard';
import { ApprovalEngineService } from '../../../application/services/approval-engine.service';
import {
  EvaluateApprovalDto,
  EvaluateApprovalResponseDto,
  BatchEvaluateApprovalDto,
  BatchEvaluateApprovalResponseDto,
  ConfigureApprovalRuleDto,
  ApprovalRuleResponseDto,
  UpdateApprovalRuleDto,
  GetEvaluationHistoryDto,
  EvaluationHistoryResponseDto,
  ChapterEvaluationStatsDto,
  UserApprovalSummaryDto,
} from '../../../application/dtos/approval';

export interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    email: string;
    role: string;
  };
}

@ApiTags('Approval Engine')
@Controller('approval')
@UseGuards(ThrottlerGuard, EnhancedJwtGuard)
@ApiBearerAuth()
@ApiExtraModels(
  EvaluateApprovalDto,
  EvaluateApprovalResponseDto,
  BatchEvaluateApprovalDto,
  BatchEvaluateApprovalResponseDto,
  ConfigureApprovalRuleDto,
  ApprovalRuleResponseDto,
  UpdateApprovalRuleDto,
  GetEvaluationHistoryDto,
  EvaluationHistoryResponseDto,
  ChapterEvaluationStatsDto,
  UserApprovalSummaryDto,
)
export class ApprovalController {
  private readonly logger = new Logger(ApprovalController.name);

  constructor(private readonly approvalEngineService: ApprovalEngineService) {}

  @Post('evaluate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Evaluate user approval for a chapter',
    description:
      'Evaluates if a user passes a chapter based on their score and approval rules. Handles error carryover from previous attempts.',
  })
  @ApiResponse({
    status: 200,
    description: 'Evaluation completed successfully',
    type: EvaluateApprovalResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Maximum attempts exceeded',
  })
  async evaluateApproval(
    @Body(ValidationPipe) evaluateDto: EvaluateApprovalDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<EvaluateApprovalResponseDto> {
    this.logger.log(
      `Evaluating approval for user: ${evaluateDto.userId}, chapter: ${evaluateDto.chapterId}, score: ${evaluateDto.score}`,
    );

    // Log metadata if present
    if (evaluateDto.metadata) {
      this.logger.log(
        `Additional metadata for evaluation: ${JSON.stringify(evaluateDto.metadata)}`,
      );
    }

    // Audit logging
    this.logger.log(
      `AUDIT: User ${req.user.userId} (${req.user.email}) evaluating approval for user ${evaluateDto.userId} on chapter ${evaluateDto.chapterId}`,
    );

    try {
      const result = await this.approvalEngineService.evaluateApproval(evaluateDto);

      // If this is a quiz completion, update the user progress with the quiz data
      if (
        evaluateDto.metadata &&
        typeof evaluateDto.metadata === 'object' &&
        evaluateDto.metadata.quiz_data &&
        typeof evaluateDto.metadata.quiz_data === 'object'
      ) {
        // Use type assertion to access properties safely
        const quizData = evaluateDto.metadata.quiz_data as {
          quiz_completed?: boolean;
          final_score?: number;
          total_questions?: number;
          correct_answers?: number;
          incorrect_answers?: number;
        };

        if (quizData.quiz_completed === true) {
          this.logger.log(
            `Quiz completed for user ${evaluateDto.userId}, chapter ${evaluateDto.chapterId} with score ${quizData.final_score}`,
          );
        }

        // The score is already saved in the evaluation, no additional action needed here
      }

      // Audit successful evaluation
      this.logger.log(
        `AUDIT: Approval evaluation completed for user ${evaluateDto.userId}, chapter ${evaluateDto.chapterId}. Status: ${result.status}, Score: ${result.adjustedScore}`,
      );

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);

      // Audit failed evaluation
      this.logger.warn(
        `AUDIT: Failed approval evaluation for user ${evaluateDto.userId}, chapter ${evaluateDto.chapterId}: ${errorMessage}`,
      );

      this.logger.error(`Error evaluating approval: ${errorMessage}`);
      throw error;
    }
  }

  @Post('evaluate/batch')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Batch evaluate multiple approvals',
    description: 'Evaluates multiple user approvals in a single request for efficiency.',
  })
  @ApiResponse({
    status: 200,
    description: 'Batch evaluation completed',
    type: BatchEvaluateApprovalResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async batchEvaluateApproval(
    @Body(ValidationPipe) batchDto: BatchEvaluateApprovalDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<BatchEvaluateApprovalResponseDto> {
    this.logger.log(
      `Batch evaluating ${batchDto.evaluations.length} approvals by user: ${req.user.userId}`,
    );

    try {
      const result = await this.approvalEngineService.batchEvaluateApproval(batchDto.evaluations);

      this.logger.log(
        `AUDIT: Batch evaluation completed by user ${req.user.userId}. Successful: ${result.results.length}, Failed: ${result.errors.length}`,
      );

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error in batch evaluation: ${errorMessage}`);
      throw error;
    }
  }

  @Get('history/:userId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get user evaluation history',
    description: 'Retrieves the evaluation history for a specific user with optional filtering.',
  })
  @ApiParam({
    name: 'userId',
    description: 'ID of the user',
    type: 'string',
    format: 'uuid',
  })
  @ApiQuery({
    name: 'chapterId',
    description: 'Filter by chapter ID',
    required: false,
    type: 'string',
  })
  @ApiQuery({
    name: 'status',
    description: 'Filter by evaluation status',
    required: false,
    enum: ['APPROVED', 'FAILED', 'PENDING'],
  })
  @ApiQuery({
    name: 'page',
    description: 'Page number for pagination',
    required: false,
    type: 'number',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    description: 'Number of items per page',
    required: false,
    type: 'number',
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'Evaluation history retrieved successfully',
    type: EvaluationHistoryResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async getEvaluationHistory(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Query() query: Partial<GetEvaluationHistoryDto>,
    @Request() req: AuthenticatedRequest,
  ): Promise<EvaluationHistoryResponseDto> {
    this.logger.log(`Getting evaluation history for user: ${userId} by user: ${req.user.userId}`);

    try {
      const historyDto: GetEvaluationHistoryDto = {
        userId,
        ...query,
      };

      const result = await this.approvalEngineService.getUserEvaluationHistory(historyDto);

      this.logger.log(
        `AUDIT: Evaluation history retrieved for user ${userId} by user ${req.user.userId}. Total items: ${result.total}`,
      );

      // Map GetEvaluationHistoryResponse to EvaluationHistoryResponseDto
      const mappedResult: EvaluationHistoryResponseDto = {
        items: result.evaluations.map(evaluation => ({
          id: evaluation.id,
          chapterId: evaluation.chapterId,
          score: evaluation.score,
          adjustedScore: evaluation.score - evaluation.errorsFromPreviousAttempts,
          status: evaluation.status,
          attemptNumber: evaluation.attemptNumber,
          errorsCarriedOver: evaluation.errorsFromPreviousAttempts,
          timeSpent: 0, // Not available in current structure
          evaluatedAt: evaluation.evaluatedAt,
          feedback: evaluation.feedback || '',
        })),
        total: result.total,
        page: historyDto.page || 1,
        limit: historyDto.limit || 20,
        totalPages: Math.ceil(result.total / (historyDto.limit || 20)),
      };

      return mappedResult;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error getting evaluation history: ${errorMessage}`);
      throw error;
    }
  }

  @Get('summary/:userId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get user approval summary',
    description: 'Retrieves a summary of user approval statistics across all chapters.',
  })
  @ApiParam({
    name: 'userId',
    description: 'ID of the user',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'User approval summary retrieved successfully',
    type: UserApprovalSummaryDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async getUserApprovalSummary(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<UserApprovalSummaryDto> {
    this.logger.log(`Getting approval summary for user: ${userId} by user: ${req.user.userId}`);

    try {
      const result = await this.approvalEngineService.getUserApprovalSummary(userId);

      // Map UserApprovalSummary to UserApprovalSummaryDto
      const mappedResult: UserApprovalSummaryDto = {
        userId: result.userId,
        chaptersAttempted: result.chaptersCompleted.length,
        chaptersApproved: result.approvedEvaluations,
        overallApprovalRate: result.approvalRate,
        averageScore: result.averageScore,
        totalAttempts: result.totalEvaluations,
        pendingChapters: [], // This would need to be calculated separately
        ...(result.lastEvaluation?.evaluatedAt && {
          lastEvaluationDate: result.lastEvaluation.evaluatedAt,
        }),
      };

      this.logger.log(
        `AUDIT: Approval summary retrieved for user ${userId} by user ${req.user.userId}`,
      );

      return mappedResult;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error getting approval summary: ${errorMessage}`);
      throw error;
    }
  }

  @Get('stats/chapter/:chapterId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get chapter evaluation statistics',
    description: 'Retrieves evaluation statistics for a specific chapter.',
  })
  @ApiParam({
    name: 'chapterId',
    description: 'ID of the chapter',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Chapter statistics retrieved successfully',
    type: ChapterEvaluationStatsDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async getChapterStats(
    @Param('chapterId') chapterId: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<ChapterEvaluationStatsDto> {
    this.logger.log(`Getting chapter stats for chapter: ${chapterId} by user: ${req.user.userId}`);

    try {
      const result = await this.approvalEngineService.getChapterStats(chapterId);

      this.logger.log(
        `AUDIT: Chapter stats retrieved for chapter ${chapterId} by user ${req.user.userId}`,
      );

      // Map ChapterEvaluationStats to ChapterEvaluationStatsDto
      const approvalRate =
        result.totalEvaluations > 0 ? (result.approvedCount / result.totalEvaluations) * 100 : 0;

      return {
        chapterId,
        totalEvaluations: result.totalEvaluations,
        approvedCount: result.approvedCount,
        failedCount: result.failedCount,
        pendingCount: 0, // No pending evaluations in current implementation
        averageScore: result.averageScore,
        averageAdjustedScore: result.averageScore, // Same as average score for now
        approvalRate,
        averageAttempts: result.averageAttempts,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error getting chapter stats: ${errorMessage}`);
      throw error;
    }
  }

  @Post('rules')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Configure approval rule',
    description: 'Creates or updates an approval rule for a specific chapter or globally.',
  })
  @ApiResponse({
    status: 201,
    description: 'Approval rule configured successfully',
    type: ApprovalRuleResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions to configure rules',
  })
  async configureRule(
    @Body(ValidationPipe) ruleDto: ConfigureApprovalRuleDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<ApprovalRuleResponseDto> {
    this.logger.log(
      `Configuring approval rule for chapter: ${ruleDto.chapterId || 'global'} by user: ${req.user.userId}`,
    );

    try {
      const result = await this.approvalEngineService.configureRule(ruleDto);

      this.logger.log(
        `AUDIT: Approval rule configured by user ${req.user.userId} for chapter ${ruleDto.chapterId || 'global'}. Rule ID: ${result.id}`,
      );

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error configuring rule: ${errorMessage}`);
      throw error;
    }
  }

  @Get('rules')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get approval rules',
    description: 'Retrieves all approval rules or rules for a specific chapter.',
  })
  @ApiQuery({
    name: 'chapterId',
    description: 'Filter by chapter ID',
    required: false,
    type: 'string',
  })
  @ApiQuery({
    name: 'isActive',
    description: 'Filter by active status',
    required: false,
    type: 'boolean',
  })
  @ApiResponse({
    status: 200,
    description: 'Approval rules retrieved successfully',
    type: [ApprovalRuleResponseDto],
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async getRules(
    @Query('chapterId') chapterId?: string,
    @Query('isActive') isActive?: boolean,
    @Request() req?: AuthenticatedRequest,
  ): Promise<ApprovalRuleResponseDto[]> {
    this.logger.log(
      `Getting approval rules. Chapter: ${chapterId || 'all'}, Active: ${isActive ?? 'all'} by user: ${req?.user.userId}`,
    );

    try {
      const result = await this.approvalEngineService.getRules(chapterId, isActive);

      this.logger.log(
        `AUDIT: Approval rules retrieved by user ${req?.user.userId}. Count: ${result.length}`,
      );

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error getting rules: ${errorMessage}`);
      throw error;
    }
  }

  @Put('rules/:ruleId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update approval rule',
    description: 'Updates an existing approval rule.',
  })
  @ApiParam({
    name: 'ruleId',
    description: 'ID of the rule to update',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Approval rule updated successfully',
    type: ApprovalRuleResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions to update rules',
  })
  @ApiResponse({
    status: 404,
    description: 'Rule not found',
  })
  async updateRule(
    @Param('ruleId', ParseUUIDPipe) ruleId: string,
    @Body(ValidationPipe) updateDto: UpdateApprovalRuleDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<ApprovalRuleResponseDto> {
    this.logger.log(`Updating approval rule: ${ruleId} by user: ${req.user.userId}`);

    try {
      const result = await this.approvalEngineService.updateRule(ruleId, updateDto);

      this.logger.log(`AUDIT: Approval rule ${ruleId} updated by user ${req.user.userId}`);

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error updating rule: ${errorMessage}`);
      throw error;
    }
  }

  @Delete('rules/:ruleId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete approval rule',
    description: 'Deletes an existing approval rule.',
  })
  @ApiParam({
    name: 'ruleId',
    description: 'ID of the rule to delete',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: 204,
    description: 'Approval rule deleted successfully',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  @ApiResponse({
    status: 403,
    description: 'Insufficient permissions to delete rules',
  })
  @ApiResponse({
    status: 404,
    description: 'Rule not found',
  })
  async deleteRule(
    @Param('ruleId', ParseUUIDPipe) ruleId: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<void> {
    this.logger.log(`Deleting approval rule: ${ruleId} by user: ${req.user.userId}`);

    try {
      await this.approvalEngineService.deleteRule(ruleId);

      this.logger.log(`AUDIT: Approval rule ${ruleId} deleted by user ${req.user.userId}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error deleting rule: ${errorMessage}`);
      throw error;
    }
  }

  @Get('can-attempt/:userId/:chapterId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Check if user can attempt chapter',
    description:
      'Checks if a user can attempt a specific chapter based on approval rules and previous attempts.',
  })
  @ApiParam({
    name: 'userId',
    description: 'ID of the user',
    type: 'string',
    format: 'uuid',
  })
  @ApiParam({
    name: 'chapterId',
    description: 'ID of the chapter',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Attempt eligibility checked successfully',
    schema: {
      type: 'object',
      properties: {
        canAttempt: {
          type: 'boolean',
          description: 'Whether the user can attempt the chapter',
        },
        reason: {
          type: 'string',
          description: 'Reason if user cannot attempt',
        },
        attemptsRemaining: {
          type: 'number',
          description: 'Number of attempts remaining',
        },
        maxAttempts: {
          type: 'number',
          description: 'Maximum attempts allowed',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Invalid or missing JWT token',
  })
  async canUserAttemptChapter(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Param('chapterId') chapterId: string,
    @Request() req: AuthenticatedRequest,
  ): Promise<{
    canAttempt: boolean;
    reason?: string;
    attemptsRemaining: number;
    maxAttempts: number;
  }> {
    this.logger.log(
      `Checking if user ${userId} can attempt chapter ${chapterId} by user: ${req.user.userId}`,
    );

    try {
      const result = await this.approvalEngineService.canUserAttemptChapter(userId, chapterId);

      // Map service response to controller response format
      const mappedResult = {
        canAttempt: result.canAttempt,
        attemptsRemaining: result.attemptsRemaining || 0,
        maxAttempts: 3, // Default value, should be retrieved from rules
        ...(result.reason && { reason: result.reason }),
      };

      this.logger.log(
        `AUDIT: Attempt eligibility checked for user ${userId}, chapter ${chapterId} by user ${req.user.userId}. Can attempt: ${result.canAttempt}`,
      );

      return mappedResult;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.error(`Error checking attempt eligibility: ${errorMessage}`);
      throw error;
    }
  }
}
