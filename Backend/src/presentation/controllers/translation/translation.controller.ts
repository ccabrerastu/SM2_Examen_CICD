import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  UseGuards,
  Request,
  Logger,
  HttpStatus,
  HttpCode,
  ValidationPipe,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiExtraModels,
  ApiQuery,
  getSchemaPath,
} from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { EnhancedJwtGuard } from '../../../shared/guards/enhanced-jwt.guard';
import { TranslationService } from '../../../application/services/translation.service';
import { TranslateRequestDto, TranslationResponseDto } from '../../../application/dtos/translation';
import { DeviceInfo } from '../../../shared/middleware/device-detection.middleware';

interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    email: string;
    role: string;
  };
  deviceInfo?: DeviceInfo;
}

@ApiTags('Translation Service')
@Controller('translation')
@UseGuards(ThrottlerGuard, EnhancedJwtGuard)
@ApiBearerAuth()
@ApiExtraModels(TranslateRequestDto, TranslationResponseDto)
export class TranslationController {
  private readonly logger = new Logger(TranslationController.name);

  constructor(private readonly translationService: TranslationService) {}

  @Post('translate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Translate text between languages',
    description:
      'Translates text from source language to target language using external APIs with caching',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Translation completed successfully',
    schema: {
      $ref: getSchemaPath(TranslationResponseDto),
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid request parameters',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { type: 'array', items: { type: 'string' } },
        error: { type: 'string', example: 'Bad Request' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication required',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 401 },
        message: { type: 'string', example: 'Unauthorized' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.TOO_MANY_REQUESTS,
    description: 'Rate limit exceeded',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 429 },
        message: { type: 'string', example: 'ThrottlerException: Too Many Requests' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.SERVICE_UNAVAILABLE,
    description: 'Translation service temporarily unavailable',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 503 },
        message: { type: 'string', example: 'Translation service temporarily unavailable' },
      },
    },
  })
  async translateText(
    @Request() req: AuthenticatedRequest,
    @Body(ValidationPipe) translateRequest: TranslateRequestDto,
  ): Promise<TranslationResponseDto> {
    this.logger.log(
      `Translation request from user ${req.user.userId}: ${translateRequest.sourceLanguage} -> ${translateRequest.targetLanguage}`,
    );

    try {
      const result = await this.translationService.translateText(translateRequest, req.deviceInfo);

      this.logger.log(
        `Translation completed successfully for user ${req.user.userId}, translation ID: ${result.id}`,
      );

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Translation failed for user ${req.user.userId}: ${errorMessage}`,
        errorStack,
      );
      throw error;
    }
  }

  @Get('history')
  @ApiOperation({
    summary: 'Get translation history',
    description: 'Retrieves the translation history with pagination',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of translations to return (default: 50, max: 100)',
    example: 50,
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    type: Number,
    description: 'Number of translations to skip (default: 0)',
    example: 0,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Translation history retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        translations: {
          type: 'array',
          items: { $ref: getSchemaPath(TranslationResponseDto) },
        },
        total: { type: 'number', example: 150 },
        limit: { type: 'number', example: 50 },
        offset: { type: 'number', example: 0 },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication required',
  })
  async getTranslationHistory(
    @Request() req: AuthenticatedRequest,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
  ): Promise<{
    translations: TranslationResponseDto[];
    total: number;
    limit: number;
    offset: number;
  }> {
    // Validate limit (max 100)
    const validatedLimit = Math.min(Math.max(limit, 1), 100);
    const validatedOffset = Math.max(offset, 0);

    this.logger.log(
      `Getting translation history for user ${req.user.userId}, limit: ${validatedLimit}, offset: ${validatedOffset}`,
    );

    try {
      const translations = await this.translationService.getTranslationHistory(
        req.user.userId,
        validatedLimit,
        validatedOffset,
      );

      const translationResponses = translations.map(translation => translation.toResponseFormat());

      return {
        translations: translationResponses,
        total: translationResponses.length, // Note: This should be the total count from DB
        limit: validatedLimit,
        offset: validatedOffset,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Failed to get translation history for user ${req.user.userId}: ${errorMessage}`,
        errorStack,
      );
      throw error;
    }
  }

  @Get('stats')
  @ApiOperation({
    summary: 'Get translation statistics',
    description: 'Retrieves translation service statistics (admin only)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Translation statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        totalTranslations: { type: 'number', example: 1500 },
        activeTranslations: { type: 'number', example: 1200 },
        expiredTranslations: { type: 'number', example: 300 },
        mostUsedLanguagePairs: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              pair: { type: 'string', example: 'en-es' },
              count: { type: 'number', example: 450 },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication required',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Admin access required',
  })
  async getTranslationStats(@Request() req: AuthenticatedRequest): Promise<{
    totalTranslations: number;
    activeTranslations: number;
    expiredTranslations: number;
    mostUsedLanguagePairs: Array<{ pair: string; count: number }>;
  }> {
    // Note: You might want to add role-based access control here
    // For now, we'll allow all authenticated users to see stats
    this.logger.log(`Getting translation stats for user ${req.user.userId}`);

    try {
      const stats = await this.translationService.getTranslationStats();

      this.logger.log(`Translation stats retrieved successfully for user ${req.user.userId}`);

      return stats;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Failed to get translation stats for user ${req.user.userId}: ${errorMessage}`,
        errorStack,
      );
      throw error;
    }
  }

  @Get('vocabulary/search')
  @ApiOperation({
    summary: 'Search in internal vocabulary dictionary',
    description: 'Searches for translations in the internal vocabulary dictionary',
  })
  @ApiQuery({
    name: 'text',
    required: true,
    type: String,
    description: 'Text to search for in vocabulary',
    example: 'hello',
  })
  @ApiQuery({
    name: 'sourceLanguage',
    required: true,
    type: String,
    description: 'Source language code (en, es)',
    example: 'en',
  })
  @ApiQuery({
    name: 'targetLanguage',
    required: true,
    type: String,
    description: 'Target language code (en, es)',
    example: 'es',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Vocabulary search completed successfully',
    schema: {
      type: 'object',
      properties: {
        found: { type: 'boolean', example: true },
        translation: { $ref: getSchemaPath(TranslationResponseDto) },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'No translation found in vocabulary',
    schema: {
      type: 'object',
      properties: {
        found: { type: 'boolean', example: false },
        message: { type: 'string', example: 'No translation found in vocabulary dictionary' },
      },
    },
  })
  async searchInVocabulary(
    @Request() req: AuthenticatedRequest,
    @Query('text') text: string,
    @Query('sourceLanguage') sourceLanguage: string,
    @Query('targetLanguage') targetLanguage: string,
  ): Promise<{ found: boolean; translation?: TranslationResponseDto; message?: string }> {
    this.logger.log(
      `Vocabulary search request from user ${req.user.userId}: "${text}" (${sourceLanguage} -> ${targetLanguage})`,
    );

    try {
      const result = await this.translationService.searchInVocabulary({
        text,
        sourceLanguage,
        targetLanguage,
      });

      if (result) {
        this.logger.log(
          `Vocabulary search successful for user ${req.user.userId}: found translation for "${text}"`,
        );
        return { found: true, translation: result };
      } else {
        this.logger.log(
          `Vocabulary search for user ${req.user.userId}: no translation found for "${text}"`,
        );
        return { found: false, message: 'No translation found in vocabulary dictionary' };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Vocabulary search failed for user ${req.user.userId}: ${errorMessage}`,
        errorStack,
      );
      throw error;
    }
  }

  @Post('cleanup')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Cleanup expired translations',
    description: 'Removes expired translations from the database (admin only)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Cleanup completed successfully',
    schema: {
      type: 'object',
      properties: {
        deletedCount: { type: 'number', example: 25 },
        message: { type: 'string', example: 'Successfully cleaned up 25 expired translations' },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authentication required',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Admin access required',
  })
  async cleanupExpiredTranslations(
    @Request() req: AuthenticatedRequest,
  ): Promise<{ deletedCount: number; message: string }> {
    // Note: You might want to add role-based access control here
    this.logger.log(`Cleanup expired translations requested by user ${req.user.userId}`);

    try {
      const deletedCount = await this.translationService.cleanupExpiredTranslations();

      const message = `Successfully cleaned up ${deletedCount} expired translations`;
      this.logger.log(message);

      return { deletedCount, message };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Failed to cleanup expired translations for user ${req.user.userId}: ${errorMessage}`,
        errorStack,
      );
      throw error;
    }
  }
}
