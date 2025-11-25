import { ReadingPractice } from '../../../domain/entities/reading-practice.entity';

export interface IReadingPracticeRepository {
  create(readingPractice: ReadingPractice): Promise<ReadingPractice>;
  findById(id: string): Promise<ReadingPractice | null>;
  findByPracticeSessionId(practiceSessionId: string): Promise<ReadingPractice | null>;
  findByUserId(userId: string, limit?: number, offset?: number): Promise<ReadingPractice[]>;
  findByUserIdAndCategory(
    userId: string,
    category: string,
    limit?: number,
    offset?: number,
  ): Promise<ReadingPractice[]>;
  findByUserIdAndDifficulty(
    userId: string,
    difficulty: string,
    limit?: number,
    offset?: number,
  ): Promise<ReadingPractice[]>;
  findCompletedByUserId(
    userId: string,
    completed: boolean,
    limit?: number,
    offset?: number,
  ): Promise<ReadingPractice[]>;
  update(id: string, updates: Partial<ReadingPractice>): Promise<ReadingPractice>;
  delete(id: string): Promise<void>;
  getStatsByUserId(userId: string): Promise<{
    totalSessions: number;
    totalWordsRead: number;
    averageReadingSpeed: number;
    averageComprehensionScore: number;
    totalReadingTime: number;
    categoriesRead: string[];
    vocabularyEncountered: number;
    bookmarksCreated: number;
  }>;
}
