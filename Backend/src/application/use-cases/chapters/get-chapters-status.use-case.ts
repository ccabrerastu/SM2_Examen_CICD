import { Injectable, Inject, Logger } from '@nestjs/common';
import { IChapterRepository } from '../../interfaces/repositories/chapter-repository.interface';
import { ChapterStatusDto } from '../../dtos/chapters/chapter-status-response.dto';

@Injectable()
export class GetChaptersStatusUseCase {
  private readonly logger = new Logger(GetChaptersStatusUseCase.name);

  constructor(
    @Inject('IChapterRepository')
    private readonly chapterRepository: IChapterRepository,
  ) {}

  async execute(userId: string): Promise<{
    chapters: ChapterStatusDto[];
    totalChapters: number;
    unlockedChapters: number;
    completedChapters: number;
  }> {
    try {
      this.logger.log(`Getting chapters status for user: ${userId}`);

      const { chapters: chaptersWithProgress } =
        await this.chapterRepository.getUserChapterStatus(userId);

      const chapters: ChapterStatusDto[] = chaptersWithProgress.map(item => ({
        id: item.chapter.id,
        title: item.chapter.title,
        description: item.chapter.description,
        level: item.chapter.level,
        order: item.chapter.order,
        imageUrl: item.chapter.imageUrl,
        isUnlocked: item.isUnlocked,
        isCompleted: item.userProgress?.chapterCompleted || false,
        progressPercentage: item.progressPercentage,
        vocabularyItemsLearned: item.userProgress?.vocabularyItemsLearned || 0,
        totalVocabularyItems: item.userProgress?.totalVocabularyItems || 0,
        lastActivity: item.userProgress?.lastActivity || null,
        completionDate: item.userProgress?.chapterCompletionDate || null,
      }));

      const totalChapters = chapters.length;
      const unlockedChapters = chapters.filter(c => c.isUnlocked).length;
      const completedChapters = chapters.filter(c => c.isCompleted).length;

      this.logger.log(
        `Retrieved ${totalChapters} chapters, ${unlockedChapters} unlocked, ${completedChapters} completed for user ${userId}`,
      );

      return {
        chapters,
        totalChapters,
        unlockedChapters,
        completedChapters,
      };
    } catch (error) {
      this.logger.error(
        `Error getting chapters status for user ${userId}:`,
        error instanceof Error ? error.message : String(error),
      );
      throw error;
    }
  }
}
