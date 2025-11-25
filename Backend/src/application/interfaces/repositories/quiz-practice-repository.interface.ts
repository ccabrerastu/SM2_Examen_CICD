import { QuizPractice } from '../../../domain/entities/quiz-practice.entity';

export interface IQuizPracticeRepository {
  create(quizPractice: QuizPractice): Promise<QuizPractice>;
  findById(id: string): Promise<QuizPractice | null>;
  findByPracticeSessionId(practiceSessionId: string): Promise<QuizPractice | null>;
  findByUserId(userId: string, limit?: number, offset?: number): Promise<QuizPractice[]>;
  findByUserIdAndCategory(
    userId: string,
    category: string,
    limit?: number,
    offset?: number,
  ): Promise<QuizPractice[]>;
  findByUserIdAndDifficulty(
    userId: string,
    difficulty: string,
    limit?: number,
    offset?: number,
  ): Promise<QuizPractice[]>;
  update(id: string, updates: Partial<QuizPractice>): Promise<QuizPractice>;
  delete(id: string): Promise<void>;
  getStatsByUserId(userId: string): Promise<{
    totalSessions: number;
    totalQuestions: number;
    totalCorrectAnswers: number;
    averageAccuracy: number;
    averageTimePerQuestion: number;
    categoriesPlayed: string[];
  }>;
  getAvailableCategories(): Promise<
    Array<{
      category: string;
      displayName: string;
      description: string;
      totalQuizzes: number;
    }>
  >;
}
