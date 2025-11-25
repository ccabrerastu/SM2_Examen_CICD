import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ReadingChapterRepository } from '../../../infrastructure/repositories/reading-chapter.repository';

@Injectable()
export class CompleteReadingChapterUseCase {
  private readonly logger = new Logger(CompleteReadingChapterUseCase.name);

  constructor(private readonly readingChapterRepository: ReadingChapterRepository) {}

  async execute(
    userId: string,
    readingChapterId: string,
    score: number,
  ): Promise<{
    chapterCompleted: boolean;
    nextChapterUnlocked: boolean;
    nextChapterId: string | null;
    score: number;
  }> {
    this.logger.log(
      `Completing reading chapter ${readingChapterId} for user ${userId} with score ${score}`,
    );

    const chapter = await this.readingChapterRepository.findById(readingChapterId);

    if (!chapter) {
      throw new NotFoundException(`Reading chapter not found: ${readingChapterId}`);
    }

    // Mark chapter as completed
    await this.readingChapterRepository.markChapterCompleted(userId, readingChapterId, score);

    // Get next chapter
    const nextChapter = await this.readingChapterRepository.getNextChapterToUnlock(chapter.order);

    return {
      chapterCompleted: true,
      nextChapterUnlocked: !!nextChapter,
      nextChapterId: nextChapter?.id || null,
      score,
    };
  }
}
