import { VocabularyPractice } from '../../../domain/entities/vocabulary-practice.entity';

export interface IVocabularyPracticeRepository {
  create(vocabularyPractice: VocabularyPractice): Promise<VocabularyPractice>;
  findById(id: string): Promise<VocabularyPractice | null>;
  findByPracticeSessionId(practiceSessionId: string): Promise<VocabularyPractice | null>;
  findByUserId(userId: string, limit?: number, offset?: number): Promise<VocabularyPractice[]>;
  update(id: string, updates: Partial<VocabularyPractice>): Promise<VocabularyPractice>;
  delete(id: string): Promise<void>;
  getStatsByUserId(userId: string): Promise<{
    totalSessions: number;
    totalWordsStudied: number;
    totalWordsLearned: number;
    averageAccuracy: number;
    currentStreak: number;
  }>;
}
