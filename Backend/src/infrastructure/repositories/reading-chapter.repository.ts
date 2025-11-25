import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ReadingChapter } from '../../domain/entities/reading-chapter.entity';
import { UserProgress } from '../../domain/entities/user-progress.entity';

@Injectable()
export class ReadingChapterRepository {
  constructor(
    @InjectRepository(ReadingChapter)
    private readonly readingChapterRepository: Repository<ReadingChapter>,
    @InjectRepository(UserProgress)
    private readonly userProgressRepository: Repository<UserProgress>,
  ) {}

  async findAll(): Promise<ReadingChapter[]> {
    return await this.readingChapterRepository.find({
      order: { order: 'ASC' },
    });
  }

  async findById(id: string): Promise<ReadingChapter | null> {
    return await this.readingChapterRepository.findOne({
      where: { id },
    });
  }

  async findByOrder(order: number): Promise<ReadingChapter | null> {
    return await this.readingChapterRepository.findOne({
      where: { order },
    });
  }

  async findAllOrderedByLevel(): Promise<ReadingChapter[]> {
    return await this.readingChapterRepository.find({
      order: { level: 'ASC', order: 'ASC' },
    });
  }

  async findUnlockedForUser(userId: string): Promise<ReadingChapter[]> {
    const chapters = await this.readingChapterRepository.find({
      order: { order: 'ASC' },
    });

    const userProgresses = await this.userProgressRepository.find({
      where: { userId },
    });

    const progressMap = new Map(
      userProgresses.map(progress => [progress.readingChapterId, progress]),
    );

    const unlockedChapters: ReadingChapter[] = [];

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
    chapter: ReadingChapter;
    userProgress: UserProgress | null;
    isUnlocked: boolean;
    progressPercentage: number;
  } | null> {
    const chapter = await this.readingChapterRepository.findOne({
      where: { id: chapterId },
    });

    if (!chapter) return null;

    const userProgress = await this.userProgressRepository.findOne({
      where: { userId, readingChapterId: chapterId },
    });

    const userProgresses = await this.userProgressRepository.find({
      where: { userId },
    });

    const progressMap = new Map(
      userProgresses.map(progress => [progress.readingChapterId, progress]),
    );

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
      chapter: ReadingChapter;
      userProgress: UserProgress | null;
      isUnlocked: boolean;
      progressPercentage: number;
    }>;
  }> {
    const chapters = await this.readingChapterRepository.find({
      order: { order: 'ASC' },
    });

    const userProgresses = await this.userProgressRepository.find({
      where: { userId },
    });

    const progressMap = new Map(
      userProgresses.map(progress => [progress.readingChapterId, progress]),
    );

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

    const existingProgress = await this.userProgressRepository.findOne({
      where: { userId, readingChapterId: nextChapter.id },
    });

    if (!existingProgress) {
      await this.createInitialProgress(userId, nextChapter.id);
    }

    return true;
  }

  async getNextChapterToUnlock(completedOrder: number): Promise<ReadingChapter | null> {
    return await this.readingChapterRepository.findOne({
      where: { order: completedOrder + 1 },
    });
  }

  async createInitialProgress(userId: string, readingChapterId: string): Promise<UserProgress> {
    const userProgress = this.userProgressRepository.create({
      userId,
      chapterId: null,
      readingChapterId,
      score: null,
      lastActivity: new Date(),
      chapterCompleted: false,
      chapterCompletionDate: null,
      vocabularyItemsLearned: 0,
      totalVocabularyItems: 0,
      extraData: null,
    });

    return await this.userProgressRepository.save(userProgress);
  }

  async markChapterCompleted(
    userId: string,
    readingChapterId: string,
    score: number,
  ): Promise<UserProgress> {
    let userProgress = await this.userProgressRepository.findOne({
      where: { userId, readingChapterId },
    });

    if (!userProgress) {
      userProgress = await this.createInitialProgress(userId, readingChapterId);
    }

    userProgress.markChapterCompleted();
    userProgress.score = score;
    await this.userProgressRepository.save(userProgress);

    const chapter = await this.readingChapterRepository.findOne({
      where: { id: readingChapterId },
    });

    if (chapter) {
      await this.unlockNextChapter(userId, chapter.order);
    }

    return userProgress;
  }

  private async isChapterUnlocked(
    chapter: ReadingChapter,
    progressMap: Map<string | null, UserProgress>,
  ): Promise<boolean> {
    if (chapter.order === 1) return true;

    const previousChapter = await this.readingChapterRepository.findOne({
      where: { order: chapter.order - 1 },
    });

    if (!previousChapter) return false;

    const previousProgress = progressMap.get(previousChapter.id);
    return previousProgress?.chapterCompleted || false;
  }
}
