import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Chapter } from '../../domain/entities/chapter.entity';
import { UserProgress } from '../../domain/entities/user-progress.entity';
import { VocabularyItem } from '../../domain/entities/vocabulary-item.entity';
import { IChapterRepository } from '../../application/interfaces/repositories/chapter-repository.interface';

@Injectable()
export class ChapterRepository implements IChapterRepository {
  constructor(
    @InjectRepository(Chapter)
    private readonly chapterRepository: Repository<Chapter>,
    @InjectRepository(UserProgress)
    private readonly userProgressRepository: Repository<UserProgress>,
    @InjectRepository(VocabularyItem)
    private readonly vocabularyRepository: Repository<VocabularyItem>,
  ) {}

  async findAll(): Promise<Chapter[]> {
    return await this.chapterRepository.find({
      order: { order: 'ASC' },
    });
  }

  async findById(id: string): Promise<Chapter | null> {
    return await this.chapterRepository.findOne({
      where: { id },
    });
  }

  async findByOrder(order: number): Promise<Chapter | null> {
    return await this.chapterRepository.findOne({
      where: { order },
    });
  }

  async findAllOrderedByLevel(): Promise<Chapter[]> {
    return await this.chapterRepository.find({
      order: { level: 'ASC', order: 'ASC' },
    });
  }

  async findUnlockedForUser(userId: string): Promise<Chapter[]> {
    // Get all chapters and their progress for the user
    const chapters = await this.chapterRepository.find({
      order: { order: 'ASC' },
    });

    const userProgresses = await this.userProgressRepository.find({
      where: { userId },
    });

    const progressMap = new Map(userProgresses.map(progress => [progress.chapterId, progress]));

    const unlockedChapters: Chapter[] = [];

    for (const chapter of chapters) {
      const isUnlocked = await this.isChapterUnlocked(chapter, progressMap);

      if (isUnlocked) {
        unlockedChapters.push(chapter);
      }
    }

    return unlockedChapters;
  }

  async getChapterWithProgress(
    chapterId: string,
    userId: string,
  ): Promise<{
    chapter: Chapter;
    userProgress: UserProgress | null;
    isUnlocked: boolean;
    progressPercentage: number;
  } | null> {
    const chapter = await this.chapterRepository.findOne({
      where: { id: chapterId },
    });

    if (!chapter) return null;

    const userProgress = await this.userProgressRepository.findOne({
      where: { userId, chapterId },
    });

    const userProgresses = await this.userProgressRepository.find({
      where: { userId },
    });

    const progressMap = new Map(userProgresses.map(progress => [progress.chapterId, progress]));

    const isUnlocked = await this.isChapterUnlocked(chapter, progressMap);
    const progressPercentage = userProgress ? userProgress.getProgressPercentage() : 0;

    return {
      chapter,
      userProgress,
      isUnlocked,
      progressPercentage,
    };
  }

  async getUserChapterStatus(userId: string): Promise<{
    chapters: Array<{
      chapter: Chapter;
      userProgress: UserProgress | null;
      isUnlocked: boolean;
      progressPercentage: number;
    }>;
  }> {
    const chapters = await this.chapterRepository.find({
      order: { order: 'ASC' },
    });

    const userProgresses = await this.userProgressRepository.find({
      where: { userId },
    });

    const progressMap = new Map(userProgresses.map(progress => [progress.chapterId, progress]));

    const chapterStatuses = [];

    for (const chapter of chapters) {
      const userProgress = progressMap.get(chapter.id) || null;
      const isUnlocked = await this.isChapterUnlocked(chapter, progressMap);
      const progressPercentage = userProgress ? userProgress.getProgressPercentage() : 0;

      chapterStatuses.push({
        chapter,
        userProgress,
        isUnlocked,
        progressPercentage,
      });
    }

    return { chapters: chapterStatuses };
  }

  async unlockNextChapter(userId: string, completedChapterOrder: number): Promise<boolean> {
    const nextChapter = await this.getNextChapterToUnlock(completedChapterOrder);

    if (!nextChapter) return false;

    // Create initial progress for the next chapter if it doesn't exist
    const existingProgress = await this.userProgressRepository.findOne({
      where: { userId, chapterId: nextChapter.id },
    });

    if (!existingProgress) {
      const vocabularyCount = await this.vocabularyRepository.count({
        where: { chapterId: nextChapter.id, isActive: true },
      });

      await this.createInitialProgress(userId, nextChapter.id, vocabularyCount);
    }

    return true;
  }

  async getNextChapterToUnlock(completedOrder: number): Promise<Chapter | null> {
    return await this.chapterRepository.findOne({
      where: { order: completedOrder + 1 },
    });
  }

  async createInitialProgress(
    userId: string,
    chapterId: string,
    totalVocabularyItems: number,
  ): Promise<UserProgress> {
    const userProgress = this.userProgressRepository.create({
      userId,
      chapterId,
      score: null,
      lastActivity: new Date(),
      chapterCompleted: false,
      chapterCompletionDate: null,
      vocabularyItemsLearned: 0,
      totalVocabularyItems,
      extraData: null,
    });

    return await this.userProgressRepository.save(userProgress);
  }

  async markChapterCompleted(userId: string, chapterId: string): Promise<UserProgress> {
    const userProgress = await this.userProgressRepository.findOne({
      where: { userId, chapterId },
    });

    if (!userProgress) {
      throw new Error('User progress not found for this chapter');
    }

    userProgress.markChapterCompleted();
    await this.userProgressRepository.save(userProgress);

    // Unlock next chapter
    const chapter = await this.chapterRepository.findOne({
      where: { id: chapterId },
    });

    if (chapter) {
      await this.unlockNextChapter(userId, chapter.order);
    }

    return userProgress;
  }

  private async isChapterUnlocked(
    chapter: Chapter,
    progressMap: Map<string | null, UserProgress>,
  ): Promise<boolean> {
    // First chapter is always unlocked
    if (chapter.order === 1) return true;

    // Check if previous chapter is completed
    const previousChapter = await this.chapterRepository.findOne({
      where: { order: chapter.order - 1 },
    });

    if (!previousChapter) return false;

    const previousProgress = progressMap.get(previousChapter.id);
    return previousProgress?.chapterCompleted || false;
  }
}
