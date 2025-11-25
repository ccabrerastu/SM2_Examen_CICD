import {
  Injectable,
  Inject,
  Logger,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { IChapterRepository } from '../../interfaces/repositories/chapter-repository.interface';
import { CompleteChapterDto } from '../../dtos/chapters/complete-chapter.dto';

@Injectable()
export class CompleteChapterUseCase {
  private readonly logger = new Logger(CompleteChapterUseCase.name);

  constructor(
    @Inject('IChapterRepository')
    private readonly chapterRepository: IChapterRepository,
  ) {}

  async execute(
    userId: string,
    chapterId: string,
    completeChapterDto: CompleteChapterDto,
  ): Promise<{
    success: boolean;
    chapterCompleted: boolean;
    nextChapterUnlocked: boolean;
    userProgress: import('../../../domain/entities/user-progress.entity').UserProgress;
    message: string;
  }> {
    try {
      this.logger.log(`Completing chapter ${chapterId} for user: ${userId}`);

      // Get chapter with current progress
      const chapterData = await this.chapterRepository.getChapterWithProgress(chapterId, userId);

      if (!chapterData) {
        throw new NotFoundException('Chapter not found');
      }

      if (!chapterData.isUnlocked) {
        throw new ForbiddenException('Chapter is not unlocked for this user');
      }

      if (chapterData.userProgress?.chapterCompleted) {
        this.logger.warn(`User ${userId} tried to complete already completed chapter ${chapterId}`);
        return {
          success: true,
          chapterCompleted: true,
          nextChapterUnlocked: false,
          userProgress: chapterData.userProgress,
          message: 'Chapter already completed',
        };
      }

      // Validate that user has completed enough vocabulary items to complete chapter
      const currentProgress = chapterData.userProgress;
      if (!currentProgress || !currentProgress.canCompleteChapter()) {
        throw new BadRequestException(
          'Cannot complete chapter. Not all vocabulary items have been learned.',
        );
      }

      // Mark chapter as completed
      const updatedProgress = await this.chapterRepository.markChapterCompleted(userId, chapterId);

      // Update score if provided
      if (completeChapterDto.finalScore !== undefined) {
        updatedProgress.score = completeChapterDto.finalScore;
      }

      // Add completion notes to extraData
      if (completeChapterDto.completionNotes || completeChapterDto.extraData) {
        const extraData = updatedProgress.extraData || {};
        if (completeChapterDto.completionNotes) {
          extraData.completionNotes = completeChapterDto.completionNotes;
        }
        if (completeChapterDto.extraData) {
          Object.assign(extraData, completeChapterDto.extraData);
        }
        updatedProgress.extraData = extraData;
      }

      // Check if next chapter was unlocked
      const nextChapter = await this.chapterRepository.getNextChapterToUnlock(
        chapterData.chapter.order,
      );
      const nextChapterUnlocked = !!nextChapter;

      this.logger.log(
        `Chapter ${chapterId} completed for user ${userId}. Next chapter unlocked: ${nextChapterUnlocked}`,
      );

      return {
        success: true,
        chapterCompleted: true,
        nextChapterUnlocked,
        userProgress: updatedProgress,
        message: nextChapterUnlocked
          ? 'Chapter completed and next chapter unlocked!'
          : 'Chapter completed! You have finished all available chapters.',
      };
    } catch (error) {
      this.logger.error(
        `Error completing chapter ${chapterId} for user ${userId}:`,
        error instanceof Error ? error.message : String(error),
      );
      throw error;
    }
  }
}
