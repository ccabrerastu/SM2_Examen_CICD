import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Logger,
  Request,
  BadRequestException,
  NotFoundException,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { InterviewService } from '../../../application/services/interview/interview.service';
import { EnhancedJwtGuard } from '../../../shared/guards/enhanced-jwt.guard';
import { SkipCSRF } from '../../../shared/guards/csrf.guard';
import { AuthenticatedRequest } from '../../../shared/types/request.types';
import {
  GetTopicsResponseDto,
  StartInterviewSessionDto,
  StartInterviewSessionResponseDto,
  SubmitAnswerDto,
  SubmitAnswerAudioDto,
  SubmitAnswerResponseDto,
  GetSessionScoreResponseDto,
} from '../../../application/dtos/interview';

@ApiTags('Interview')
@Controller('interview')
@UseGuards(ThrottlerGuard, EnhancedJwtGuard)
@ApiBearerAuth()
export class InterviewController {
  private readonly logger = new Logger(InterviewController.name);

  constructor(private readonly interviewService: InterviewService) {}

  @Get('topics')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get all available interview topics',
    description: 'Returns a list of all active interview topics with their metadata (JavaScript, Python, Databases, etc.)',
  })
  @ApiResponse({
    status: 200,
    description: 'List of available topics',
    type: GetTopicsResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing JWT token' })
  async getTopics(@Request() req: AuthenticatedRequest): Promise<GetTopicsResponseDto> {
    const userId = req.user?.userId;
    if (!userId) {
      throw new Error('User ID not found in request');
    }
    this.logger.log(`User ${userId} requesting interview topics`);
    return this.interviewService.getAvailableTopics();
  }

  @Post('sessions/start')
  @SkipCSRF()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Start a new interview session',
    description: 'Creates a new interview session for a specific topic and returns all questions',
  })
  @ApiResponse({
    status: 201,
    description: 'Interview session started successfully',
    type: StartInterviewSessionResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request - User already has an active session for this topic' })
  @ApiResponse({ status: 404, description: 'Not Found - Topic does not exist or is inactive' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing JWT token' })
  async startSession(
    @Request() req: AuthenticatedRequest,
    @Body() dto: StartInterviewSessionDto,
  ): Promise<StartInterviewSessionResponseDto> {
    const userId = req.user?.userId;
    if (!userId) {
      throw new Error('User ID not found in request');
    }
    this.logger.log(`User ${userId} starting interview session for topic ${dto.topicId}`);
    return this.interviewService.startInterviewSession(userId, dto);
  }

  @Post('sessions/submit-answer')
  @SkipCSRF()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Submit an answer for evaluation',
    description: 'Submits user answer and returns AI evaluation with scores for fluency, grammar, vocabulary, pronunciation, coherence',
  })
  @ApiResponse({
    status: 200,
    description: 'Answer submitted and evaluated successfully',
    type: SubmitAnswerResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid session or question' })
  @ApiResponse({ status: 404, description: 'Not Found - Session or question does not exist' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing JWT token' })
  async submitAnswer(
    @Request() req: AuthenticatedRequest,
    @Body() dto: SubmitAnswerDto,
  ): Promise<SubmitAnswerResponseDto> {
    const userId = req.user?.userId;
    if (!userId) {
      throw new Error('User ID not found in request');
    }
    this.logger.log(`User ${userId} submitting answer for session ${dto.sessionId}, question ${dto.questionId}`);
    return this.interviewService.submitAnswer(userId, dto);
  }

  @Post('sessions/submit-answer-audio')
  @SkipCSRF()
  @UseInterceptors(FileInterceptor('audio'))
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Submit an audio answer for evaluation',
    description: 'Submits user audio answer (M4A format), evaluates with Google Gemini AI, and returns pronunciation analysis with scores',
  })
  @ApiResponse({
    status: 200,
    description: 'Audio answer submitted and evaluated successfully',
    type: SubmitAnswerResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Invalid session, question, or missing audio file' })
  @ApiResponse({ status: 404, description: 'Not Found - Session or question does not exist' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing JWT token' })
  async submitAnswerAudio(
    @Request() req: AuthenticatedRequest,
    @Body() dto: SubmitAnswerAudioDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<SubmitAnswerResponseDto> {
    const userId = req.user?.userId;
    if (!userId) {
      throw new Error('User ID not found in request');
    }

    if (!file) {
      throw new BadRequestException('Audio file is required');
    }

    this.logger.log(`User ${userId} submitting audio answer for session ${dto.sessionId}, question ${dto.questionId}`);
    this.logger.log(`Audio file: ${file.originalname}, size: ${file.size} bytes, mime: ${file.mimetype}`);

    return this.interviewService.submitAnswerAudio(
      userId,
      dto.sessionId,
      dto.questionId,
      file.buffer,
      dto.timeSpentSeconds,
    );
  }

  @Get('sessions/:sessionId/score')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get final session score and feedback',
    description: 'Returns complete evaluation results including scores, feedback, strengths, and areas for improvement',
  })
  @ApiParam({
    name: 'sessionId',
    description: 'Interview session ID (UUID)',
    example: 'uuid-session-123',
  })
  @ApiResponse({
    status: 200,
    description: 'Session score retrieved successfully',
    type: GetSessionScoreResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Session not completed yet' })
  @ApiResponse({ status: 404, description: 'Not Found - Session does not exist' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing JWT token' })
  async getSessionScore(
    @Request() req: AuthenticatedRequest,
    @Param('sessionId') sessionId: string,
  ): Promise<GetSessionScoreResponseDto> {
    const userId = req.user?.userId;
    if (!userId) {
      throw new Error('User ID not found in request');
    }
    this.logger.log(`User ${userId} requesting score for session ${sessionId}`);
    return this.interviewService.getSessionScore(userId, sessionId);
  }

  @Delete('sessions/:sessionId/abandon')
  @SkipCSRF()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Abandon/cancel an active interview session',
    description: 'Marks an in-progress interview session as abandoned, allowing the user to start a new session',
  })
  @ApiParam({
    name: 'sessionId',
    description: 'Interview session ID (UUID) to abandon',
    example: 'uuid-session-123',
  })
  @ApiResponse({
    status: 204,
    description: 'Session abandoned successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad Request - Session is not in progress or does not belong to user' })
  @ApiResponse({ status: 404, description: 'Not Found - Session does not exist' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing JWT token' })
  async abandonSession(
    @Request() req: AuthenticatedRequest,
    @Param('sessionId') sessionId: string,
  ): Promise<void> {
    const userId = req.user?.userId;
    if (!userId) {
      throw new Error('User ID not found in request');
    }
    this.logger.log(`User ${userId} abandoning session ${sessionId}`);
    await this.interviewService.abandonSession(userId, sessionId);
  }

  @Get('sessions/active')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get active session for a topic',
    description: 'Returns the active in-progress session for a specific topic if one exists, allowing the user to resume',
  })
  @ApiResponse({
    status: 200,
    description: 'Active session found and returned',
    type: StartInterviewSessionResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Not Found - No active session for this topic' })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing JWT token' })
  async getActiveSession(
    @Request() req: AuthenticatedRequest,
    @Query('topicId') topicId: string,
  ): Promise<StartInterviewSessionResponseDto> {
    const userId = req.user?.userId;
    if (!userId) {
      throw new Error('User ID not found in request');
    }

    if (!topicId) {
      throw new BadRequestException('topicId query parameter is required');
    }

    this.logger.log(`User ${userId} requesting active session for topic ${topicId}`);
    const activeSession = await this.interviewService.getActiveSessionForTopic(userId, topicId);

    if (!activeSession) {
      throw new NotFoundException('No active session found for this topic');
    }

    return activeSession;
  }
}
