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
} from '@nestjs/common';
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
  CreateVocabularyPracticeDto,
  UpdateVocabularyPracticeDto,
  VocabularyPracticeResponseDto,
  VocabularyStatsDto,
  StudyWordDto,
  ReviewWordDto,
} from '../../../application/dtos/vocabulary-practice.dto';

@ApiTags('Practices - Vocabulary')
@Controller('practices/vocabulary')
@UseGuards(ThrottlerGuard, EnhancedJwtGuard)
@ApiBearerAuth()
@ApiExtraModels(
  CreateVocabularyPracticeDto,
  UpdateVocabularyPracticeDto,
  VocabularyPracticeResponseDto,
  VocabularyStatsDto,
)
export class VocabularyPracticeController {
  private readonly logger = new Logger(VocabularyPracticeController.name);

  constructor() {} // TODO: Inject use cases when implemented

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create new vocabulary practice session',
    description: 'Start a new vocabulary practice session for the authenticated user',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Vocabulary practice session created successfully',
    schema: {
      $ref: getSchemaPath(VocabularyPracticeResponseDto),
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
  async createVocabularyPractice(
    @Request() _req: AuthenticatedRequest,
    @Body() _createDto: CreateVocabularyPracticeDto,
  ): Promise<VocabularyPracticeResponseDto> {
    this.logger.log(`Creating vocabulary practice for user: ${_req.user.userId}`);

    // TODO: Implement use case
    throw new Error('Not implemented yet');
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get vocabulary practice session',
    description: 'Retrieve a specific vocabulary practice session by ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Practice session ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Vocabulary practice session retrieved successfully',
    schema: {
      $ref: getSchemaPath(VocabularyPracticeResponseDto),
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
  async getVocabularyPractice(
    @Request() _req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<VocabularyPracticeResponseDto> {
    this.logger.log(`Getting vocabulary practice ${id} for user: ${_req.user.userId}`);

    // TODO: Implement use case
    throw new Error('Not implemented yet');
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update vocabulary practice session',
    description: 'Update progress and data for a vocabulary practice session',
  })
  @ApiParam({
    name: 'id',
    description: 'Practice session ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Vocabulary practice session updated successfully',
    schema: {
      $ref: getSchemaPath(VocabularyPracticeResponseDto),
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
  async updateVocabularyPractice(
    @Request() _req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() _updateDto: UpdateVocabularyPracticeDto,
  ): Promise<VocabularyPracticeResponseDto> {
    this.logger.log(`Updating vocabulary practice ${id} for user: ${_req.user.userId}`);

    // TODO: Implement use case
    throw new Error('Not implemented yet');
  }

  @Post(':id/study-word')
  @ApiOperation({
    summary: 'Record word study activity',
    description: 'Record that a word has been studied in the vocabulary practice session',
  })
  @ApiParam({
    name: 'id',
    description: 'Practice session ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Word study recorded successfully',
    schema: {
      $ref: getSchemaPath(VocabularyPracticeResponseDto),
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
  async studyWord(
    @Request() _req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() _studyWordDto: StudyWordDto,
  ): Promise<VocabularyPracticeResponseDto> {
    this.logger.log(`Recording word study for practice ${id}, user: ${_req.user.userId}`);

    // TODO: Implement use case
    throw new Error('Not implemented yet');
  }

  @Post(':id/review-word')
  @ApiOperation({
    summary: 'Record word review activity',
    description: 'Record that a word has been reviewed in the vocabulary practice session',
  })
  @ApiParam({
    name: 'id',
    description: 'Practice session ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Word review recorded successfully',
    schema: {
      $ref: getSchemaPath(VocabularyPracticeResponseDto),
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
  async reviewWord(
    @Request() _req: AuthenticatedRequest,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() _reviewWordDto: ReviewWordDto,
  ): Promise<VocabularyPracticeResponseDto> {
    this.logger.log(`Recording word review for practice ${id}, user: ${_req.user.userId}`);

    // TODO: Implement use case
    throw new Error('Not implemented yet');
  }

  @Get('user/:userId/sessions')
  @ApiOperation({
    summary: 'Get user vocabulary practice sessions',
    description: 'Retrieve all vocabulary practice sessions for a specific user',
  })
  @ApiParam({
    name: 'userId',
    description: 'User ID',
    type: 'string',
    format: 'uuid',
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
    description: 'User vocabulary practice sessions retrieved successfully',
    schema: {
      type: 'array',
      items: {
        $ref: getSchemaPath(VocabularyPracticeResponseDto),
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'User not authenticated',
  })
  async getUserVocabularySessions(
    @Request() _req: AuthenticatedRequest,
    @Param('userId', ParseUUIDPipe) userId: string,
    @Query('limit') _limit?: number,
    @Query('offset') _offset?: number,
  ): Promise<VocabularyPracticeResponseDto[]> {
    this.logger.log(`Getting vocabulary sessions for user: ${userId}`);

    // TODO: Implement use case
    throw new Error('Not implemented yet');
  }

  @Get('user/:userId/stats')
  @ApiOperation({
    summary: 'Get user vocabulary statistics',
    description: 'Retrieve comprehensive vocabulary learning statistics for a user',
  })
  @ApiParam({
    name: 'userId',
    description: 'User ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User vocabulary statistics retrieved successfully',
    schema: {
      $ref: getSchemaPath(VocabularyStatsDto),
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'User not authenticated',
  })
  async getUserVocabularyStats(
    @Request() _req: AuthenticatedRequest,
    @Param('userId', ParseUUIDPipe) userId: string,
  ): Promise<VocabularyStatsDto> {
    this.logger.log(`Getting vocabulary stats for user: ${userId}`);

    // TODO: Implement use case
    throw new Error('Not implemented yet');
  }
}
