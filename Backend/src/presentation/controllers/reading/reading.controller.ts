import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  Logger,
  HttpStatus,
  HttpCode,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { EnhancedJwtGuard } from '../../../shared/guards/enhanced-jwt.guard';
import { SkipCSRF } from '../../../shared/guards/csrf.guard';
import { AuthenticatedRequest } from '../../../shared/types/request.types';

import { GetReadingChaptersStatusUseCase } from '../../../application/use-cases/reading/get-reading-chapters-status.use-case';
import { GetReadingContentUseCase } from '../../../application/use-cases/reading/get-reading-content.use-case';
import { GetQuizQuestionsUseCase } from '../../../application/use-cases/reading/get-quiz-questions.use-case';
import { SubmitQuizAnswerUseCase } from '../../../application/use-cases/reading/submit-quiz-answer.use-case';
import { CompleteReadingChapterUseCase } from '../../../application/use-cases/reading/complete-reading-chapter.use-case';

import { ReadingChaptersStatusResponseDto } from '../../../application/dtos/reading/reading-chapter-status-response.dto';
import { ReadingContentResponseDto } from '../../../application/dtos/reading/reading-content-response.dto';
import { QuizQuestionsResponseDto } from '../../../application/dtos/reading/quiz-question-response.dto';
import {
  SubmitQuizAnswerDto,
  SubmitQuizAnswerResponseDto,
} from '../../../application/dtos/reading/submit-quiz-answer.dto';
import {
  CompleteReadingChapterDto,
  CompleteReadingChapterResponseDto,
} from '../../../application/dtos/reading/complete-reading.dto';

@SkipCSRF()
@ApiTags('Reading')
@Controller('reading/chapters')
@UseGuards(ThrottlerGuard, EnhancedJwtGuard)
@ApiBearerAuth()
export class ReadingController {
  private readonly logger = new Logger(ReadingController.name);

  constructor(
    private readonly getReadingChaptersStatusUseCase: GetReadingChaptersStatusUseCase,
    private readonly getReadingContentUseCase: GetReadingContentUseCase,
    private readonly getQuizQuestionsUseCase: GetQuizQuestionsUseCase,
    private readonly submitQuizAnswerUseCase: SubmitQuizAnswerUseCase,
    private readonly completeReadingChapterUseCase: CompleteReadingChapterUseCase,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get all reading chapters with status for user' })
  @ApiResponse({ status: HttpStatus.OK, type: ReadingChaptersStatusResponseDto })
  async getReadingChapters(
    @Request() req: AuthenticatedRequest,
  ): Promise<ReadingChaptersStatusResponseDto> {
    const userId = req.user?.userId;
    if (!userId) {
      throw new Error('User ID not found in request');
    }
    this.logger.log(`Getting reading chapters for user: ${userId}`);

    const data = await this.getReadingChaptersStatusUseCase.execute(userId);

    return {
      success: true,
      data,
      message: 'Reading chapters retrieved successfully',
    };
  }

  @Get(':id/content')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get reading content for a chapter' })
  @ApiParam({ name: 'id', description: 'Reading chapter ID' })
  @ApiResponse({ status: HttpStatus.OK, type: ReadingContentResponseDto })
  async getReadingContent(
    @Param('id', ParseUUIDPipe) chapterId: string,
  ): Promise<ReadingContentResponseDto> {
    this.logger.log(`Getting reading content for chapter: ${chapterId}`);

    const data = await this.getReadingContentUseCase.execute(chapterId);

    return {
      success: true,
      data,
      message: 'Reading content retrieved successfully',
    };
  }

  @Get(':id/quiz')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get quiz questions for a reading chapter' })
  @ApiParam({ name: 'id', description: 'Reading chapter ID' })
  @ApiResponse({ status: HttpStatus.OK, type: QuizQuestionsResponseDto })
  async getQuizQuestions(
    @Param('id', ParseUUIDPipe) chapterId: string,
  ): Promise<QuizQuestionsResponseDto> {
    this.logger.log(`Getting quiz questions for chapter: ${chapterId}`);

    const data = await this.getQuizQuestionsUseCase.execute(chapterId);

    return {
      success: true,
      data,
      message: 'Quiz questions retrieved successfully',
    };
  }

  @Post(':id/quiz/submit')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Submit quiz answer' })
  @ApiParam({ name: 'id', description: 'Reading chapter ID' })
  @ApiResponse({ status: HttpStatus.OK, type: SubmitQuizAnswerResponseDto })
  async submitQuizAnswer(
    @Request() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) _chapterId: string,
    @Body() submitDto: SubmitQuizAnswerDto,
  ): Promise<SubmitQuizAnswerResponseDto> {
    const userId = req.user?.userId;
    if (!userId) {
      throw new Error('User ID not found in request');
    }
    this.logger.log(`User ${userId} submitting quiz answer`);

    const data = await this.submitQuizAnswerUseCase.execute(
      userId,
      submitDto.questionId,
      submitDto.answerIndex,
    );

    return {
      success: true,
      data,
      message: 'Answer submitted successfully',
    };
  }

  @Post(':id/complete')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Complete reading chapter' })
  @ApiParam({ name: 'id', description: 'Reading chapter ID' })
  @ApiResponse({ status: HttpStatus.OK, type: CompleteReadingChapterResponseDto })
  async completeChapter(
    @Request() req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) chapterId: string,
    @Body() completeDto: CompleteReadingChapterDto,
  ): Promise<CompleteReadingChapterResponseDto> {
    const userId = req.user?.userId;
    if (!userId) {
      throw new Error('User ID not found in request');
    }
    this.logger.log(`User ${userId} completing reading chapter: ${chapterId}`);

    const data = await this.completeReadingChapterUseCase.execute(
      userId,
      chapterId,
      completeDto.score,
    );

    return {
      success: true,
      data,
      message: 'Reading chapter completed successfully',
    };
  }
}
