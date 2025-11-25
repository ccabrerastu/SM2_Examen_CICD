import { Injectable } from '@nestjs/common';
import { IQuizPracticeRepository } from '../../../interfaces/repositories/quiz-practice-repository.interface';

@Injectable()
export class GetQuizCategoriesUseCase {
  constructor(private readonly quizPracticeRepository: IQuizPracticeRepository) {}

  async execute(): Promise<
    Array<{
      category: string;
      displayName: string;
      description: string;
      totalQuizzes: number;
    }>
  > {
    return this.quizPracticeRepository.getAvailableCategories();
  }

  async getByChapter(): Promise<string[]> {
    // Note: This would need implementation in the repository
    const categories = await this.quizPracticeRepository.getAvailableCategories();
    return categories.map(cat => cat.category);
  }

  async getUserCategories(): Promise<string[]> {
    // Note: This would need implementation in the repository
    const categories = await this.quizPracticeRepository.getAvailableCategories();
    return categories.map(cat => cat.category);
  }
}
