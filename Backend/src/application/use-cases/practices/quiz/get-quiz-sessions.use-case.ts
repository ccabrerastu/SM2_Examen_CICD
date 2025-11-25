import { Injectable } from '@nestjs/common';
import { QuizPractice } from '../../../../domain/entities/quiz-practice.entity';
import { IQuizPracticeRepository } from '../../../interfaces/repositories/quiz-practice-repository.interface';
import { GetQuizSessionsDto } from '../../../dtos/quiz-practice.dto';

@Injectable()
export class GetQuizSessionsUseCase {
  constructor(private readonly quizPracticeRepository: IQuizPracticeRepository) {}

  async execute(userId: string, filters?: GetQuizSessionsDto): Promise<QuizPractice[]> {
    const limit = filters?.limit || 10;
    const offset = filters?.offset || 0;
    return this.quizPracticeRepository.findByUserId(userId, limit, offset);
  }

  async getStats(userId: string): Promise<unknown> {
    return this.quizPracticeRepository.getStatsByUserId(userId);
  }

  async getByChapter(userId: string): Promise<QuizPractice[]> {
    // Note: This would need a specific method in the repository to filter by chapter
    return this.quizPracticeRepository.findByUserId(userId);
  }

  async getByCategory(userId: string, category: string): Promise<QuizPractice[]> {
    return this.quizPracticeRepository.findByUserIdAndCategory(userId, category);
  }

  async getCompleted(userId: string): Promise<QuizPractice[]> {
    // Note: This would need filtering logic in the repository or here
    const practices = await this.quizPracticeRepository.findByUserId(userId);
    return practices.filter(practice => practice.isCompleted());
  }

  async getInProgress(userId: string): Promise<QuizPractice[]> {
    // Note: This would need filtering logic in the repository or here
    const practices = await this.quizPracticeRepository.findByUserId(userId);
    return practices.filter(practice => !practice.isCompleted());
  }
}
