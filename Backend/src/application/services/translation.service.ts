import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Translation,
  TranslationStatus,
  TranslationSource,
} from '../../domain/entities/translation.entity';
import { VocabularyItem } from '../../domain/entities/vocabulary-item.entity';
import { TranslateRequestDto, TranslationResponseDto } from '../dtos/translation';
import {
  DeviceInfo,
  DeviceOptimizationHelper,
} from '../../shared/middleware/device-detection.middleware';
import axios from 'axios';

export interface ExternalTranslationResponse {
  translatedText: string;
  pronunciation?: string | null;
  examples?: string[];
  definition?: string | null;
  audioUrl?: string | null;
}

export interface GoogleTranslateResponse {
  data: {
    translations: Array<{
      translatedText: string;
      detectedSourceLanguage?: string;
    }>;
  };
}

export interface DeepLResponse {
  translations: Array<{
    text: string;
    detected_source_language?: string;
  }>;
}

@Injectable()
export class TranslationService {
  private readonly logger = new Logger(TranslationService.name);
  private readonly GOOGLE_TRANSLATE_API_KEY = process.env.GOOGLE_TRANSLATE_API_KEY;
  private readonly DEEPL_API_KEY = process.env.DEEPL_API_KEY;
  private readonly CACHE_EXPIRATION_DAYS = 30;

  constructor(
    @InjectRepository(Translation)
    private readonly translationRepository: Repository<Translation>,
    @InjectRepository(VocabularyItem)
    private readonly vocabularyRepository: Repository<VocabularyItem>,
  ) {}

  async translateText(
    request: TranslateRequestDto,
    deviceInfo?: DeviceInfo,
  ): Promise<TranslationResponseDto> {
    try {
      this.logger.log(
        `Translating text from ${request.sourceLanguage} to ${request.targetLanguage}`,
      );

      // 1. Check internal vocabulary dictionary first
      const vocabularyTranslation = await this.findInVocabulary(
        request.text,
        request.sourceLanguage,
        request.targetLanguage,
      );

      if (vocabularyTranslation) {
        this.logger.log('Using vocabulary dictionary translation');
        return vocabularyTranslation;
      }

      // 2. Check cache second
      const cachedTranslation = await this.findCachedTranslation(
        request.text,
        request.sourceLanguage,
        request.targetLanguage,
      );

      if (cachedTranslation && cachedTranslation.isActive()) {
        this.logger.log('Using cached translation');
        cachedTranslation.incrementUsage();
        await this.translationRepository.save(cachedTranslation);

        const response = cachedTranslation.toResponseFormat();

        // Apply device-specific optimizations
        if (deviceInfo) {
          return this.optimizeResponseForDevice(response, deviceInfo);
        }

        return response;
      }

      // Get translation from external API
      const externalTranslation = await this.getExternalTranslation(request);

      // Save to database
      const translation = new Translation();
      translation.originalText = request.text;
      translation.translatedText = externalTranslation.translatedText;
      translation.sourceLanguage = request.sourceLanguage;
      translation.targetLanguage = request.targetLanguage;
      translation.pronunciation = externalTranslation.pronunciation || null;
      translation.examples = externalTranslation.examples || [];
      translation.audioUrl = externalTranslation.audioUrl || null;
      translation.definition = externalTranslation.definition || null;
      translation.context = request.context || null;
      translation.status = TranslationStatus.ACTIVE;
      translation.source = TranslationSource.GOOGLE_TRANSLATE;
      translation.setExpiration(this.CACHE_EXPIRATION_DAYS);
      translation.usageCount = 1;
      translation.lastUsedAt = new Date();

      const savedTranslation = await this.translationRepository.save(translation);
      this.logger.log(`Translation saved with ID: ${savedTranslation.id}`);

      const response = savedTranslation.toResponseFormat();

      // Apply device-specific optimizations
      if (deviceInfo) {
        return this.optimizeResponseForDevice(response, deviceInfo);
      }

      return response;
    } catch (error) {
      this.logger.error('Error translating text:', error);
      throw new HttpException(
        'Translation service temporarily unavailable',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  private async findCachedTranslation(
    text: string,
    sourceLanguage: string,
    targetLanguage: string,
  ): Promise<Translation | null> {
    try {
      const translation = await this.translationRepository.findOne({
        where: {
          originalText: text,
          sourceLanguage,
          targetLanguage,
          status: TranslationStatus.ACTIVE,
        },
      });

      if (translation && !translation.isExpired()) {
        return translation;
      }

      // Mark as expired if found but expired
      if (translation && translation.isExpired()) {
        translation.markAsExpired();
        await this.translationRepository.save(translation);
      }

      return null;
    } catch (error) {
      this.logger.error('Error finding cached translation:', error);
      return null;
    }
  }

  private async getExternalTranslation(
    request: TranslateRequestDto,
  ): Promise<ExternalTranslationResponse> {
    // Try Google Translate first
    if (this.GOOGLE_TRANSLATE_API_KEY) {
      try {
        return await this.translateWithGoogle(request);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        this.logger.warn('Google Translate failed, trying DeepL:', errorMessage);
      }
    }

    // Fallback to DeepL
    if (this.DEEPL_API_KEY) {
      try {
        return await this.translateWithDeepL(request);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        this.logger.warn('DeepL failed:', errorMessage);
      }
    }

    // If both fail, throw error
    throw new HttpException(
      'All translation services are unavailable',
      HttpStatus.SERVICE_UNAVAILABLE,
    );
  }

  private async translateWithGoogle(
    request: TranslateRequestDto,
  ): Promise<ExternalTranslationResponse> {
    try {
      const url = `https://translation.googleapis.com/language/translate/v2?key=${this.GOOGLE_TRANSLATE_API_KEY}`;

      const response = await axios.post(url, {
        q: request.text,
        source: request.sourceLanguage,
        target: request.targetLanguage,
        format: 'text',
      });

      const translatedText = (response.data as GoogleTranslateResponse).data.translations[0]
        .translatedText;

      return {
        translatedText,
        pronunciation: null, // Google Translate API doesn't provide pronunciation directly
        examples: [],
        definition: null,
        audioUrl: null,
      };
    } catch (error) {
      this.logger.error('Google Translate API error:', error);
      throw new HttpException('Google Translate service error', HttpStatus.BAD_GATEWAY);
    }
  }

  private async translateWithDeepL(
    request: TranslateRequestDto,
  ): Promise<ExternalTranslationResponse> {
    try {
      const url = 'https://api-free.deepl.com/v2/translate';

      const response = await axios.post(
        url,
        new URLSearchParams({
          auth_key: this.DEEPL_API_KEY!,
          text: request.text,
          source_lang: request.sourceLanguage.toUpperCase(),
          target_lang: request.targetLanguage.toUpperCase(),
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      const translatedText = (response.data as DeepLResponse).translations[0].text;

      return {
        translatedText,
        pronunciation: null,
        examples: [],
        definition: null,
        audioUrl: null,
      };
    } catch (error) {
      this.logger.error('DeepL API error:', error);
      throw new HttpException('DeepL service error', HttpStatus.BAD_GATEWAY);
    }
  }

  async getTranslationHistory(
    userId?: string,
    limit: number = 50,
    offset: number = 0,
  ): Promise<Translation[]> {
    try {
      const queryBuilder = this.translationRepository
        .createQueryBuilder('translation')
        .orderBy('translation.lastUsedAt', 'DESC')
        .limit(limit)
        .offset(offset);

      if (userId) {
        // Note: You might want to add a userId field to Translation entity
        // For now, we'll return all translations
        this.logger.warn('User-specific translation history not implemented yet');
      }

      return await queryBuilder.getMany();
    } catch (error) {
      this.logger.error('Error getting translation history:', error);
      throw new HttpException(
        'Error retrieving translation history',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getTranslationStats(): Promise<{
    totalTranslations: number;
    activeTranslations: number;
    expiredTranslations: number;
    mostUsedLanguagePairs: Array<{ pair: string; count: number }>;
  }> {
    try {
      const [totalTranslations, activeTranslations, expiredTranslations] = await Promise.all([
        this.translationRepository.count(),
        this.translationRepository.count({ where: { status: TranslationStatus.ACTIVE } }),
        this.translationRepository.count({ where: { status: TranslationStatus.EXPIRED } }),
      ]);

      // Get most used language pairs
      const languagePairStats = await this.translationRepository
        .createQueryBuilder('translation')
        .select("CONCAT(translation.sourceLanguage, '-', translation.targetLanguage)", 'pair')
        .addSelect('COUNT(*)', 'count')
        .groupBy('translation.sourceLanguage, translation.targetLanguage')
        .orderBy('count', 'DESC')
        .limit(10)
        .getRawMany();

      return {
        totalTranslations,
        activeTranslations,
        expiredTranslations,
        mostUsedLanguagePairs: languagePairStats.map(stat => ({
          pair: stat.pair,
          count: parseInt(stat.count),
        })),
      };
    } catch (error) {
      this.logger.error('Error getting translation stats:', error);
      throw new HttpException(
        'Error retrieving translation statistics',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async cleanupExpiredTranslations(): Promise<number> {
    try {
      const result = await this.translationRepository.delete({
        status: TranslationStatus.EXPIRED,
      });

      const deletedCount = result.affected || 0;
      this.logger.log(`Cleaned up ${deletedCount} expired translations`);

      return deletedCount;
    } catch (error) {
      this.logger.error('Error cleaning up expired translations:', error);
      throw new HttpException(
        'Error cleaning up expired translations',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async searchInVocabulary(request: TranslateRequestDto): Promise<TranslationResponseDto | null> {
    this.logger.log(
      `Searching in vocabulary: ${request.text} (${request.sourceLanguage} -> ${request.targetLanguage})`,
    );

    try {
      return await this.findInVocabulary(
        request.text,
        request.sourceLanguage,
        request.targetLanguage,
      );
    } catch (error) {
      this.logger.error('Error searching in vocabulary:', error);
      throw new HttpException(
        'Error searching in vocabulary dictionary',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  private async findInVocabulary(
    text: string,
    sourceLanguage: string,
    targetLanguage: string,
  ): Promise<TranslationResponseDto | null> {
    try {
      const normalizedText = text.toLowerCase().trim();

      // Search in vocabulary items
      let vocabularyItem: VocabularyItem | null = null;

      if (sourceLanguage === 'en' && targetLanguage === 'es') {
        // English to Spanish
        vocabularyItem = await this.vocabularyRepository.findOne({
          where: { englishTerm: normalizedText },
        });
      } else if (sourceLanguage === 'es' && targetLanguage === 'en') {
        // Spanish to English
        vocabularyItem = await this.vocabularyRepository.findOne({
          where: { spanishTranslation: normalizedText },
        });
      }

      if (!vocabularyItem) {
        return null;
      }

      // Create translation response from vocabulary item
      const translatedText =
        sourceLanguage === 'en' ? vocabularyItem.spanishTranslation : vocabularyItem.englishTerm;

      // Save to cache for future use
      const translation = new Translation();
      translation.originalText = text;
      translation.translatedText = translatedText;
      translation.sourceLanguage = sourceLanguage;
      translation.targetLanguage = targetLanguage;
      translation.pronunciation = vocabularyItem.pronunciation || null;
      translation.examples = vocabularyItem.exampleSentence ? [vocabularyItem.exampleSentence] : [];
      translation.audioUrl = vocabularyItem.audioUrl || null;
      translation.definition = vocabularyItem.definition || null;
      translation.context = null;
      translation.status = TranslationStatus.ACTIVE;
      translation.source = TranslationSource.VOCABULARY;
      translation.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
      translation.usageCount = 1;

      await this.translationRepository.save(translation);

      return {
        id: translation.id,
        originalText: translation.originalText,
        translatedText: translation.translatedText,
        sourceLanguage: translation.sourceLanguage,
        targetLanguage: translation.targetLanguage,
        pronunciation: translation.pronunciation,
        examples: translation.examples,
        audioUrl: translation.audioUrl,
        definition: translation.definition,
        context: translation.context,
        createdAt: translation.createdAt.toISOString(),
        expiresAt: translation.expiresAt?.toISOString() || null,
      };
    } catch (error) {
      this.logger.error('Error searching in vocabulary:', error);
      return null;
    }
  }

  private optimizeResponseForDevice(
    response: TranslationResponseDto,
    deviceInfo: DeviceInfo,
  ): TranslationResponseDto {
    const optimizedResponse = { ...response };

    // Apply device-specific optimizations
    if (DeviceOptimizationHelper.shouldCompressResponse(deviceInfo)) {
      // Reduce examples for mobile devices
      if (optimizedResponse.examples && optimizedResponse.examples.length > 0) {
        const maxExamples = DeviceOptimizationHelper.getMaxExamplesCount(deviceInfo);
        optimizedResponse.examples = optimizedResponse.examples.slice(0, maxExamples);
      }
    }

    // Remove audio URL for slow connections
    if (!DeviceOptimizationHelper.shouldIncludeAudio(deviceInfo)) {
      optimizedResponse.audioUrl = null;
    }

    // Truncate definition for mobile devices
    if (deviceInfo.isMobile && optimizedResponse.definition) {
      const maxLength = DeviceOptimizationHelper.getOptimalResponseSize(deviceInfo);
      if (optimizedResponse.definition.length > maxLength) {
        optimizedResponse.definition =
          optimizedResponse.definition.substring(0, maxLength - 3) + '...';
      }
    }

    return optimizedResponse;
  }
}
