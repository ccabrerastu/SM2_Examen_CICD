import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { VocabularyItemRepository } from '../../../infrastructure/repositories/vocabulary-item.repository';
import { ChapterRepository } from '../../../infrastructure/repositories/chapter.repository';

@Injectable()
export class GetVocabularyItemsUseCase {
  private readonly logger = new Logger(GetVocabularyItemsUseCase.name);

  constructor(
    private readonly vocabularyItemRepository: VocabularyItemRepository,
    private readonly chapterRepository: ChapterRepository,
  ) {}

  async execute(
    chapterId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    items: any[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  }> {
    this.logger.log(
      `Fetching vocabulary items for chapter ${chapterId} - Page: ${page}, Limit: ${limit}`,
    );

    // Verify chapter exists
    const chapter = await this.chapterRepository.findById(chapterId);
    if (!chapter) {
      throw new NotFoundException(`Chapter with ID ${chapterId} not found`);
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get items and total count
    const [items, total] = await this.vocabularyItemRepository.findByChapterId(
      chapterId,
      skip,
      limit,
    );

    // Calculate pagination metadata
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    this.logger.log(
      `Retrieved ${items.length} vocabulary items out of ${total} total for chapter ${chapterId}`,
    );

    return {
      items,
      total,
      page,
      limit,
      totalPages,
      hasNextPage,
      hasPreviousPage,
    };
  }
}
