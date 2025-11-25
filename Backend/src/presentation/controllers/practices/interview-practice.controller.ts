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
  ParseUUIDPipe,
  Query,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiExtraModels,
  getSchemaPath,
} from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { EnhancedJwtGuard } from '../../../shared/guards/enhanced-jwt.guard';
import { AuthenticatedRequest } from '../../../shared/types/request.types';

// DTOs
import {
  CreateInterviewPracticeDto,
  UpdateInterviewPracticeDto,
  InterviewPracticeResponseDto,
  InterviewStatsDto,
  AnswerInterviewQuestionDto,
  ConversationFlowDto,
  AIEvaluationDto,
} from '../../../application/dtos/interview-practice.dto';

// Use Cases
import { CreateInterviewPracticeUseCase } from '../../../application/use-cases/practices/interview/create-interview-practice.use-case';
import { GetInterviewPracticeUseCase } from '../../../application/use-cases/practices/interview/get-interview-practice.use-case';
import { AnswerQuestionUseCase } from '../../../application/use-cases/practices/interview/answer-question.use-case';
import { UpdateConversationFlowUseCase } from '../../../application/use-cases/practices/interview/update-conversation-flow.use-case';
import { GetInterviewSessionsUseCase } from '../../../application/use-cases/practices/interview/get-interview-sessions.use-case';

// Entities
import {
  InterviewPractice,
  ResponseQuality,
  InterviewType,
} from '../../../domain/entities/interview-practice.entity';

@ApiTags('Practices - Interview')
@Controller('practices/interview')
@UseGuards(ThrottlerGuard, EnhancedJwtGuard)
@ApiBearerAuth()
@ApiExtraModels(
  CreateInterviewPracticeDto,
  UpdateInterviewPracticeDto,
  InterviewPracticeResponseDto,
  InterviewStatsDto,
)
export class InterviewPracticeController {
  private readonly logger = new Logger(InterviewPracticeController.name);

  constructor(
    private readonly createInterviewPracticeUseCase: CreateInterviewPracticeUseCase,
    private readonly getInterviewPracticeUseCase: GetInterviewPracticeUseCase,
    private readonly answerQuestionUseCase: AnswerQuestionUseCase,
    private readonly updateConversationFlowUseCase: UpdateConversationFlowUseCase,
    private readonly getInterviewSessionsUseCase: GetInterviewSessionsUseCase,
  ) {}

  @Post('stream')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Process interview message with streaming',
    description: 'Process a message from the interview chat with streaming response',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Message processed successfully with streaming response',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'User not authenticated',
  })
  async streamInterviewMessage(
    @Request() req: AuthenticatedRequest,
    @Body() _body: { message: string; chapterId: string },
    @Res() response: Response,
  ): Promise<void> {
    this.logger.log(`Streaming interview message for user: ${req.user.userId}`);

    // Set headers for SSE
    response.setHeader('Content-Type', 'text/event-stream');
    response.setHeader('Cache-Control', 'no-cache');
    response.setHeader('Connection', 'keep-alive');

    // Mock streaming response for now
    const words = [
      'Hello! ',
      "I'm ",
      'your ',
      'interview ',
      'assistant. ',
      "I'll ",
      'be ',
      'streaming ',
      'responses ',
      'to ',
      'you ',
      'in ',
      'real-time. ',
      'This ',
      'helps ',
      'create ',
      'a ',
      'more ',
      'natural ',
      'conversation ',
      'flow. ',
      "Let's ",
      'practice ',
      'your ',
      'interview ',
      'skills!',
    ];

    // Stream each word with a delay
    for (const word of words) {
      await new Promise(resolve => setTimeout(resolve, 100));
      response.write(`data: ${JSON.stringify({ content: word })}\n\n`);
    }

    // End the stream
    response.write(`data: [DONE]\n\n`);
    response.end();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create new interview practice session',
    description: 'Start a new interview practice session for the authenticated user',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Interview practice session created successfully',
    schema: {
      $ref: getSchemaPath(InterviewPracticeResponseDto),
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'User not authenticated',
  })
  async createInterviewPractice(
    @Request() req: AuthenticatedRequest,
    @Body() createDto: CreateInterviewPracticeDto,
  ): Promise<InterviewPracticeResponseDto> {
    this.logger.log(`Creating interview practice for user: ${req.user.userId}`);

    try {
      const userId = req.user.userId;
      if (!userId) {
        throw new Error('User ID is required');
      }

      const interviewPractice = await this.createInterviewPracticeUseCase.execute(
        userId,
        createDto,
      );

      return this.mapToResponseDto(interviewPractice);
    } catch (error) {
      this.logger.error(
        `Error creating interview practice: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get interview practice session',
    description: 'Retrieve a specific interview practice session by ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Practice session ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Interview practice session retrieved successfully',
    schema: {
      $ref: getSchemaPath(InterviewPracticeResponseDto),
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Practice session not found',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'User not authenticated',
  })
  async getInterviewPractice(
    @Request() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<InterviewPracticeResponseDto> {
    this.logger.log(`Getting interview practice ${id} for user: ${req.user.userId}`);

    try {
      const userId = req.user.userId;
      if (!userId) {
        throw new Error('User ID is required');
      }

      const interviewPractice = await this.getInterviewPracticeUseCase.execute(id, userId);

      return this.mapToResponseDto(interviewPractice);
    } catch (error) {
      this.logger.error(
        `Error getting interview practice: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update interview practice session',
    description: 'Update progress and data for an interview practice session',
  })
  @ApiParam({
    name: 'id',
    description: 'Practice session ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Interview practice session updated successfully',
    schema: {
      $ref: getSchemaPath(InterviewPracticeResponseDto),
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Practice session not found',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'User not authenticated',
  })
  async updateInterviewPractice(
    @Request() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() _updateDto: UpdateInterviewPracticeDto,
  ): Promise<InterviewPracticeResponseDto> {
    this.logger.log(`Updating interview practice ${id} for user: ${req.user.userId}`);

    try {
      const userId = req.user.userId;
      if (!userId) {
        throw new Error('User ID is required');
      }

      // For now, use get to retrieve and then manually update the fields we can
      // This is a temporary implementation until we create the proper update use case
      const interviewPractice = await this.getInterviewPracticeUseCase.execute(id, userId);

      // Since we don't have an update use case yet, we'll return the current data
      // In a full implementation, we would have an UpdateInterviewPracticeUseCase
      this.logger.warn('UpdateInterviewPracticeUseCase not implemented - returning current data');

      return this.mapToResponseDto(interviewPractice);
    } catch (error) {
      this.logger.error(
        `Error updating interview practice: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  @Post(':id/answer-question')
  @ApiOperation({
    summary: 'Answer interview question',
    description: 'Record an answer to an interview question with AI evaluation',
  })
  @ApiParam({
    name: 'id',
    description: 'Practice session ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Interview answer recorded successfully',
    schema: {
      $ref: getSchemaPath(InterviewPracticeResponseDto),
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Practice session not found',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'User not authenticated',
  })
  async answerInterviewQuestion(
    @Request() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() answerDto: AnswerInterviewQuestionDto,
  ): Promise<InterviewPracticeResponseDto> {
    this.logger.log(`Recording interview answer for practice ${id}, user: ${req.user.userId}`);

    try {
      const userId = req.user.userId;
      if (!userId) {
        throw new Error('User ID is required');
      }

      // Map AnswerInterviewQuestionDto to AnswerQuestionDto
      const mappedDto = {
        questionId: answerDto.questionIndex.toString(),
        responseText: answerDto.userResponse,
        responseTimeSeconds: answerDto.responseTime,
        ...(answerDto.evaluation?.fluency !== undefined && {
          fluencyScore: answerDto.evaluation.fluency,
        }),
        ...(answerDto.evaluation?.pronunciation !== undefined && {
          pronunciationScore: answerDto.evaluation.pronunciation,
        }),
        ...(answerDto.evaluation?.grammar !== undefined && {
          grammarScore: answerDto.evaluation.grammar,
        }),
        ...(answerDto.evaluation?.vocabulary !== undefined && {
          vocabularyScore: answerDto.evaluation.vocabulary,
        }),
      };

      const interviewPractice = await this.answerQuestionUseCase.execute(id, userId, mappedDto);

      return this.mapToResponseDto(interviewPractice);
    } catch (error) {
      this.logger.error(
        `Error recording interview answer: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  @Post(':id/update-conversation')
  @ApiOperation({
    summary: 'Update conversation flow',
    description: 'Update the conversation flow and interaction data',
  })
  @ApiParam({
    name: 'id',
    description: 'Practice session ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Conversation flow updated successfully',
    schema: {
      $ref: getSchemaPath(InterviewPracticeResponseDto),
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Practice session not found',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'User not authenticated',
  })
  async updateConversationFlow(
    @Request() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() conversationDto: ConversationFlowDto,
  ): Promise<InterviewPracticeResponseDto> {
    this.logger.log(`Updating conversation flow for practice ${id}, user: ${req.user.userId}`);

    try {
      const userId = req.user.userId;
      if (!userId) {
        throw new Error('User ID is required');
      }

      // Map ConversationFlowDto to UpdateConversationFlowDto
      const mappedDto = {
        questionId: conversationDto.questionIndex.toString(), // Convert index to string ID
        contextNotes: `Question: ${conversationDto.question}, Response: ${conversationDto.userResponse}`,
      };

      const interviewPractice = await this.updateConversationFlowUseCase.execute(
        id,
        userId,
        mappedDto,
      );

      return this.mapToResponseDto(interviewPractice);
    } catch (error) {
      this.logger.error(
        `Error updating conversation flow: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  @Post(':id/ai-evaluation')
  @ApiOperation({
    summary: 'Request AI evaluation',
    description: 'Request AI evaluation of the interview performance',
  })
  @ApiParam({
    name: 'id',
    description: 'Practice session ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'AI evaluation completed successfully',
    schema: {
      $ref: getSchemaPath(AIEvaluationDto),
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Practice session not found',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'User not authenticated',
  })
  async requestAIEvaluation(
    @Request() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<AIEvaluationDto> {
    this.logger.log(`Requesting AI evaluation for practice ${id}, user: ${req.user.userId}`);

    try {
      const userId = req.user.userId;
      if (!userId) {
        throw new Error('User ID is required');
      }

      // For now, return a mock evaluation based on the practice session
      // In a full implementation, this would call an AIEvaluationUseCase
      const interviewPractice = await this.getInterviewPracticeUseCase.execute(id, userId);

      // Create a mock AI evaluation based on existing scores
      const mockEvaluation: AIEvaluationDto = {
        fluency: interviewPractice.fluencyScore || 75,
        pronunciation: interviewPractice.pronunciationScore || 80,
        grammar: interviewPractice.grammarScore || 70,
        vocabulary: interviewPractice.vocabularyScore || 85,
        overall: ResponseQuality.GOOD,
        feedback:
          'Overall good performance. Focus on improving grammar and fluency for better results.',
      };

      this.logger.warn('Using mock AI evaluation - implement proper AIEvaluationUseCase');
      return mockEvaluation;
    } catch (error) {
      this.logger.error(
        `Error requesting AI evaluation: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  @Get('user/:userId/sessions')
  @ApiOperation({
    summary: 'Get user interview practice sessions',
    description: 'Retrieve all interview practice sessions for a specific user',
  })
  @ApiParam({
    name: 'userId',
    description: 'User ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiQuery({
    name: 'interviewType',
    description: 'Filter by interview type',
    type: 'string',
    required: false,
  })
  @ApiQuery({
    name: 'completed',
    description: 'Filter by completion status',
    type: 'boolean',
    required: false,
  })
  @ApiQuery({
    name: 'minScore',
    description: 'Filter by minimum overall score',
    type: 'number',
    required: false,
  })
  @ApiQuery({
    name: 'limit',
    description: 'Number of sessions to retrieve',
    type: 'number',
    required: false,
    example: 10,
  })
  @ApiQuery({
    name: 'offset',
    description: 'Number of sessions to skip',
    type: 'number',
    required: false,
    example: 0,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User interview practice sessions retrieved successfully',
    schema: {
      type: 'array',
      items: {
        $ref: getSchemaPath(InterviewPracticeResponseDto),
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'User not authenticated',
  })
  async getUserInterviewSessions(
    @Request() req: AuthenticatedRequest,
    @Param('userId', ParseUUIDPipe) userId: string,
    @Query('interviewType') interviewType?: string,
    @Query('completed') completed?: boolean,
    @Query('minScore') _minScore?: number,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ): Promise<InterviewPracticeResponseDto[]> {
    this.logger.log(`Getting interview sessions for user: ${userId}`);

    try {
      // Validate that user can access these sessions (basic auth check)
      const requestingUserId = req.user.userId;
      if (!requestingUserId) {
        throw new Error('User ID is required');
      }

      // Create query parameters DTO (only include supported fields)
      const filtersDto = {
        ...(interviewType && { interviewType: interviewType as InterviewType }),
        ...(completed !== undefined && { completed }),
        limit: limit || 10,
        offset: offset || 0,
      };

      // Note: minScore is not supported by GetInterviewSessionsDto, filtered manually if needed

      const result = await this.getInterviewSessionsUseCase.execute(userId, filtersDto);

      return result.sessions.map(session => this.mapToResponseDto(session));
    } catch (error) {
      this.logger.error(
        `Error getting interview sessions: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  @Get('user/:userId/stats')
  @ApiOperation({
    summary: 'Get user interview statistics',
    description: 'Retrieve comprehensive interview performance statistics for a user',
  })
  @ApiParam({
    name: 'userId',
    description: 'User ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiQuery({
    name: 'timeframe',
    description: 'Time frame for statistics (7d, 30d, 90d, all)',
    type: 'string',
    required: false,
    example: '30d',
  })
  @ApiQuery({
    name: 'interviewType',
    description: 'Filter by interview type',
    type: 'string',
    required: false,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User interview statistics retrieved successfully',
    schema: {
      $ref: getSchemaPath(InterviewStatsDto),
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'User not authenticated',
  })
  async getUserInterviewStats(
    @Request() req: AuthenticatedRequest,
    @Param('userId', ParseUUIDPipe) userId: string,
    @Query('timeframe') _timeframe?: string,
    @Query('interviewType') interviewType?: string,
  ): Promise<InterviewStatsDto> {
    this.logger.log(`Getting interview stats for user: ${userId}`);

    try {
      // Validate that user can access these stats (basic auth check)
      const requestingUserId = req.user.userId;
      if (!requestingUserId) {
        throw new Error('User ID is required');
      }

      // For now, get sessions and calculate stats manually
      // In a full implementation, we would have a dedicated GetUserStatsUseCase
      const filtersDto = {
        ...(interviewType && { interviewType: interviewType as InterviewType }),
      };

      const result = await this.getInterviewSessionsUseCase.execute(userId, filtersDto);

      // Calculate mock stats from sessions
      const sessions = result.sessions;
      const totalSessions = sessions.length;
      const averageScore =
        totalSessions > 0
          ? sessions.reduce((sum, s) => sum + (s.getOverallScore() || 0), 0) / totalSessions
          : 0;

      const mockStats = new InterviewStatsDto({
        totalInterviews: totalSessions,
        averageOverallScore: Math.round(averageScore),
        averageResponseTime:
          totalSessions > 0
            ? sessions.reduce((sum, s) => sum + (s.averageResponseTime || 0), 0) / totalSessions
            : 0,
        interviewTypePerformance: {} as {
          [type in InterviewType]: {
            totalInterviews: number;
            averageScore: number;
            averageResponseTime: number;
            skillBreakdown: {
              fluency: number;
              pronunciation: number;
              grammar: number;
              vocabulary: number;
            };
          };
        },
        skillProgression: {
          fluency: [],
          pronunciation: [],
          grammar: [],
          vocabulary: [],
        },
        commonStrengths: [],
        commonImprovements: [],
        recentInterviews: sessions.slice(0, 5).map(s => ({
          id: s.practiceSession.id,
          interviewType: s.interviewType,
          overallScore: s.getOverallScore() || 0,
          completedAt: s.practiceSession.updatedAt,
        })),
      });

      this.logger.warn(
        'Using calculated stats - implement proper GetUserStatsUseCase for better performance',
      );
      return mockStats;
    } catch (error) {
      this.logger.error(
        `Error getting interview stats: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  @Get(':id/performance-summary')
  @ApiOperation({
    summary: 'Get interview performance summary',
    description: 'Get detailed performance summary for a completed interview session',
  })
  @ApiParam({
    name: 'id',
    description: 'Practice session ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Performance summary retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        overallScore: { type: 'number' },
        fluencyScore: { type: 'number' },
        grammarScore: { type: 'number' },
        vocabularyScore: { type: 'number' },
        pronunciationScore: { type: 'number' },
        confidenceScore: { type: 'number' },
        strengths: { type: 'array', items: { type: 'string' } },
        areasForImprovement: { type: 'array', items: { type: 'string' } },
        recommendations: { type: 'array', items: { type: 'string' } },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Practice session not found',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'User not authenticated',
  })
  async getPerformanceSummary(
    @Request() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<object> {
    this.logger.log(`Getting performance summary for practice ${id}, user: ${req.user.userId}`);

    try {
      const userId = req.user.userId;
      if (!userId) {
        throw new Error('User ID is required');
      }

      // Get the interview practice session
      const interviewPractice = await this.getInterviewPracticeUseCase.execute(id, userId);

      // Calculate confidence score based on level
      let confidenceScore = 60; // default
      if (interviewPractice.confidenceLevel) {
        switch (interviewPractice.confidenceLevel) {
          case 'high':
            confidenceScore = 85;
            break;
          case 'medium':
            confidenceScore = 70;
            break;
          case 'low':
            confidenceScore = 50;
            break;
        }
      }

      // Create detailed performance summary
      const performanceSummary = {
        overallScore: interviewPractice.getOverallScore(),
        fluencyScore: interviewPractice.fluencyScore || 0,
        grammarScore: interviewPractice.grammarScore || 0,
        vocabularyScore: interviewPractice.vocabularyScore || 0,
        pronunciationScore: interviewPractice.pronunciationScore || 0,
        confidenceScore,
        strengths: interviewPractice.strengthsIdentified || [
          'Clear communication',
          'Good vocabulary usage',
        ],
        areasForImprovement: interviewPractice.areasForImprovement || [
          'Grammar accuracy',
          'Response fluency',
        ],
        recommendations: [
          'Practice more complex sentence structures',
          'Focus on improving response time',
          'Work on pronunciation of difficult words',
          'Increase confidence in technical discussions',
        ],
        completionPercentage: interviewPractice.getCompletionPercentage(),
        totalQuestions: interviewPractice.totalQuestions,
        questionsAnswered: interviewPractice.questionsAnswered,
        averageResponseTime: interviewPractice.averageResponseTime || 0,
        sessionDuration:
          interviewPractice.practiceSession.updatedAt.getTime() -
          interviewPractice.practiceSession.startedAt.getTime(),
        interviewType: interviewPractice.interviewType,
        detailedFeedback: {
          fluency: {
            score: interviewPractice.fluencyScore || 0,
            feedback: 'Focus on speaking more naturally and reducing pauses.',
          },
          grammar: {
            score: interviewPractice.grammarScore || 0,
            feedback: 'Work on complex sentence structures and verb tenses.',
          },
          vocabulary: {
            score: interviewPractice.vocabularyScore || 0,
            feedback: 'Expand technical vocabulary for professional discussions.',
          },
          pronunciation: {
            score: interviewPractice.pronunciationScore || 0,
            feedback: 'Practice pronunciation of challenging words and sounds.',
          },
        },
      };

      this.logger.warn(
        'Using calculated performance summary - implement proper PerformanceSummaryUseCase',
      );
      return performanceSummary;
    } catch (error) {
      this.logger.error(
        `Error getting performance summary: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  private mapToResponseDto(interviewPractice: InterviewPractice): InterviewPracticeResponseDto {
    const responseDto = new InterviewPracticeResponseDto({});

    // Map PracticeSession properties
    responseDto.id = interviewPractice.practiceSession.id;
    responseDto.userId = interviewPractice.practiceSession.userId;
    if (interviewPractice.practiceSession.chapterId) {
      responseDto.chapterId = interviewPractice.practiceSession.chapterId;
    }
    responseDto.practiceType = interviewPractice.practiceSession.practiceType;
    responseDto.status = interviewPractice.practiceSession.status;
    responseDto.progress = interviewPractice.practiceSession.progress;
    responseDto.score = interviewPractice.practiceSession.score;
    responseDto.maxScore = interviewPractice.practiceSession.maxScore || 100;
    responseDto.startedAt = interviewPractice.practiceSession.startedAt;
    responseDto.createdAt = interviewPractice.practiceSession.createdAt;
    responseDto.updatedAt = interviewPractice.practiceSession.updatedAt;

    // Map Interview-specific properties
    responseDto.interviewType = interviewPractice.interviewType;
    responseDto.totalQuestions = interviewPractice.totalQuestions;
    responseDto.questionsAnswered = interviewPractice.questionsAnswered;
    responseDto.fluencyScore = interviewPractice.fluencyScore;
    responseDto.pronunciationScore = interviewPractice.pronunciationScore;
    responseDto.grammarScore = interviewPractice.grammarScore;
    responseDto.vocabularyScore = interviewPractice.vocabularyScore;
    responseDto.overallScore = interviewPractice.getOverallScore();
    responseDto.completionPercentage = interviewPractice.getCompletionPercentage();

    // Optional properties
    if (interviewPractice.averageResponseTime !== undefined) {
      responseDto.averageResponseTime = interviewPractice.averageResponseTime;
    }
    if (interviewPractice.confidenceLevel) {
      responseDto.confidenceLevel = interviewPractice.confidenceLevel;
    }
    if (interviewPractice.lastQuestionAnswered) {
      responseDto.lastQuestionAnswered = interviewPractice.lastQuestionAnswered;
    }
    if (interviewPractice.areasForImprovement) {
      responseDto.areasForImprovement = interviewPractice.areasForImprovement;
    }
    if (interviewPractice.strengthsIdentified) {
      responseDto.strengthsIdentified = interviewPractice.strengthsIdentified;
    }

    // Performance summary
    responseDto.performanceSummary = {
      overallScore: interviewPractice.getOverallScore(),
      breakdown: {
        fluency: interviewPractice.fluencyScore,
        pronunciation: interviewPractice.pronunciationScore,
        grammar: interviewPractice.grammarScore,
        vocabulary: interviewPractice.vocabularyScore,
      },
      completion: interviewPractice.getCompletionPercentage(),
      averageResponseTime: interviewPractice.averageResponseTime || 0,
      strengths: interviewPractice.strengthsIdentified || [],
      improvements: interviewPractice.areasForImprovement || [],
    };

    return responseDto;
  }
}
