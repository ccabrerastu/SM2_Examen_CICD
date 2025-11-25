import {
  Controller,
  Post,
  Get,
  UseGuards,
  Request,
  Logger,
  HttpStatus,
  HttpCode,
  Param,
  Body,
  ParseUUIDPipe,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiExtraModels,
  ApiParam,
  getSchemaPath,
} from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { EnhancedJwtGuard } from '../../../shared/guards/enhanced-jwt.guard';
import { GetChaptersStatusUseCase } from '../../../application/use-cases/chapters/get-chapters-status.use-case';
import { CompleteChapterUseCase } from '../../../application/use-cases/chapters/complete-chapter.use-case';
import { GetVocabularyItemsUseCase } from '../../../application/use-cases/chapters/get-vocabulary-items.use-case';
import { ChaptersStatusResponseDto } from '../../../application/dtos/chapters/chapter-status-response.dto';
import { CompleteChapterDto } from '../../../application/dtos/chapters/complete-chapter.dto';
import { VocabularyItemsResponseDto } from '../../../application/dtos/chapters/vocabulary-items-response.dto';

interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    email: string;
    role: string;
  };
}

@ApiTags('Vocabulary Chapters')
@Controller('vocab/chapters')
@UseGuards(ThrottlerGuard, EnhancedJwtGuard)
@ApiBearerAuth()
@ApiExtraModels(ChaptersStatusResponseDto, CompleteChapterDto, VocabularyItemsResponseDto)
export class ChaptersController {
  private readonly logger = new Logger(ChaptersController.name);

  constructor(
    private readonly getChaptersStatusUseCase: GetChaptersStatusUseCase,
    private readonly completeChapterUseCase: CompleteChapterUseCase,
    private readonly getVocabularyItemsUseCase: GetVocabularyItemsUseCase,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get user chapters status',
    description:
      'Retrieve all chapters with their unlock status, progress, and completion information for the authenticated user',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Chapters status retrieved successfully',
    schema: {
      $ref: getSchemaPath(ChaptersStatusResponseDto),
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication required',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        message: { type: 'string', example: 'Access token is required' },
        code: { type: 'string', example: 'UNAUTHORIZED' },
      },
    },
  })
  async getChaptersStatus(
    @Request() req: AuthenticatedRequest,
  ): Promise<ChaptersStatusResponseDto> {
    try {
      const userId = req.user.userId;
      this.logger.log(`Getting chapters status for user: ${userId}`);

      const result = await this.getChaptersStatusUseCase.execute(userId);

      return {
        success: true,
        data: result,
        message: 'Chapters status retrieved successfully',
      };
    } catch (error) {
      this.logger.error(
        `Error getting chapters status:`,
        error instanceof Error ? error.message : String(error),
      );
      throw error;
    }
  }

  @Get(':id/vocabulary')
  @HttpCode(HttpStatus.OK)
  @ApiParam({
    name: 'id',
    description: 'Chapter ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiOperation({
    summary: 'Get vocabulary items for a chapter',
    description: 'Retrieve paginated vocabulary items for a specific chapter',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Vocabulary items retrieved successfully',
    schema: {
      $ref: getSchemaPath(VocabularyItemsResponseDto),
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Chapter not found',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        message: { type: 'string', example: 'Chapter not found' },
        code: { type: 'string', example: 'CHAPTER_NOT_FOUND' },
      },
    },
  })
  async getVocabularyItems(
    @Param('id', ParseUUIDPipe) chapterId: string,
    @Query('page', new ParseIntPipe({ optional: true })) page: number = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit: number = 10,
  ): Promise<VocabularyItemsResponseDto> {
    try {
      this.logger.log(
        `Getting vocabulary items for chapter: ${chapterId} (page: ${page}, limit: ${limit})`,
      );

      const result = await this.getVocabularyItemsUseCase.execute(chapterId, page, limit);

      return {
        success: true,
        data: result,
        message: 'Vocabulary items retrieved successfully',
      };
    } catch (error) {
      this.logger.error(
        `Error getting vocabulary items for chapter ${chapterId}:`,
        error instanceof Error ? error.message : String(error),
      );
      throw error;
    }
  }

  @Post(':id/complete')
  @HttpCode(HttpStatus.OK)
  @ApiParam({
    name: 'id',
    description: 'Chapter ID to complete',
    type: 'string',
    format: 'uuid',
  })
  @ApiOperation({
    summary: 'Complete a chapter',
    description:
      'Mark a chapter as completed for the authenticated user. This will unlock the next chapter if available.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Chapter completed successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            chapterCompleted: { type: 'boolean', example: true },
            nextChapterUnlocked: { type: 'boolean', example: true },
            userProgress: {
              type: 'object',
              description: 'Updated user progress data',
            },
          },
        },
        message: { type: 'string', example: 'Chapter completed and next chapter unlocked!' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Cannot complete chapter - requirements not met',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        message: {
          type: 'string',
          example: 'Cannot complete chapter. Not all vocabulary items have been learned.',
        },
        code: { type: 'string', example: 'REQUIREMENTS_NOT_MET' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Chapter not found',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        message: { type: 'string', example: 'Chapter not found' },
        code: { type: 'string', example: 'CHAPTER_NOT_FOUND' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Chapter not unlocked for user',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        message: { type: 'string', example: 'Chapter is not unlocked for this user' },
        code: { type: 'string', example: 'CHAPTER_LOCKED' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication required',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: false },
        message: { type: 'string', example: 'Access token is required' },
        code: { type: 'string', example: 'UNAUTHORIZED' },
      },
    },
  })
  async completeChapter(
    @Param('id', ParseUUIDPipe) chapterId: string,
    @Body() completeChapterDto: CompleteChapterDto,
    @Request() req: AuthenticatedRequest,
  ) {
    try {
      const userId = req.user.userId;
      this.logger.log(`Completing chapter ${chapterId} for user: ${userId}`);

      const result = await this.completeChapterUseCase.execute(
        userId,
        chapterId,
        completeChapterDto,
      );

      return {
        success: result.success,
        data: {
          chapterCompleted: result.chapterCompleted,
          nextChapterUnlocked: result.nextChapterUnlocked,
          userProgress: result.userProgress,
        },
        message: result.message,
      };
    } catch (error) {
      this.logger.error(
        `Error completing chapter ${chapterId}:`,
        error instanceof Error ? error.message : String(error),
      );
      throw error;
    }
  }
}
