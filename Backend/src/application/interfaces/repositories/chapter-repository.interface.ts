import { Chapter } from '../../../domain/entities/chapter.entity';
import { UserProgress } from '../../../domain/entities/user-progress.entity';

export interface IChapterRepository {
  findAll(): Promise<Chapter[]>;
  findById(id: string): Promise<Chapter | null>;
  findByOrder(order: number): Promise<Chapter | null>;
  findAllOrderedByLevel(): Promise<Chapter[]>;
  findUnlockedForUser(userId: string): Promise<Chapter[]>;
  getChapterWithProgress(
    chapterId: string,
    userId: string,
  ): Promise<{
    chapter: Chapter;
    userProgress: UserProgress | null;
    isUnlocked: boolean;
    progressPercentage: number;
  } | null>;
  getUserChapterStatus(userId: string): Promise<{
    chapters: Array<{
      chapter: Chapter;
      userProgress: UserProgress | null;
      isUnlocked: boolean;
      progressPercentage: number;
    }>;
  }>;
  unlockNextChapter(userId: string, completedChapterOrder: number): Promise<boolean>;
  getNextChapterToUnlock(completedOrder: number): Promise<Chapter | null>;
  createInitialProgress(
    userId: string,
    chapterId: string,
    totalVocabularyItems: number,
  ): Promise<UserProgress>;
  markChapterCompleted(userId: string, chapterId: string): Promise<UserProgress>;
}
