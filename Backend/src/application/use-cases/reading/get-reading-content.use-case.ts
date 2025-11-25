import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ReadingContentRepository } from '../../../infrastructure/repositories/reading-content.repository';
import { ReadingContentDto } from '../../dtos/reading/reading-content-response.dto';

@Injectable()
export class GetReadingContentUseCase {
  private readonly logger = new Logger(GetReadingContentUseCase.name);

  constructor(private readonly readingContentRepository: ReadingContentRepository) {}

  async execute(readingChapterId: string): Promise<ReadingContentDto> {
    this.logger.log(`Getting reading content for chapter: ${readingChapterId}`);

    const content = await this.readingContentRepository.findByReadingChapterId(readingChapterId);

    if (!content) {
      throw new NotFoundException(`Reading content not found for chapter: ${readingChapterId}`);
    }

    return {
      id: content.id,
      readingChapterId: content.readingChapterId,
      title: content.title,
      content: content.content,
      highlightedWords: content.highlightedWords,
      totalPages: content.totalPages,
      estimatedReadingTime: content.estimatedReadingTime,
      topic: content.topic,
      level: content.level,
    };
  }
}
