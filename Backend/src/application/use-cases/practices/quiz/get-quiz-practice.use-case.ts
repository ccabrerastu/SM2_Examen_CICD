import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { QuizPractice } from '../../../../domain/entities/quiz-practice.entity';
import { IQuizPracticeRepository } from '../../../interfaces/repositories/quiz-practice-repository.interface';

@Injectable()
export class GetQuizPracticeUseCase {
  constructor(private readonly quizPracticeRepository: IQuizPracticeRepository) {}

  async execute(practiceId: string, userId: string): Promise<QuizPractice> {
    const practice = await this.quizPracticeRepository.findById(practiceId);

    if (!practice) {
      throw new NotFoundException('Quiz practice not found');
    }

    // Verify that the practice belongs to the user
    if (practice.practiceSession.userId !== userId) {
      throw new ForbiddenException('You do not have access to this practice');
    }

    return practice;
  }

  async getBySessionId(sessionId: string, userId: string): Promise<QuizPractice> {
    const practice = await this.quizPracticeRepository.findByPracticeSessionId(sessionId);

    if (!practice) {
      throw new NotFoundException('Quiz practice not found for this session');
    }

    // Verify that the practice belongs to the user
    if (practice.practiceSession.userId !== userId) {
      throw new ForbiddenException('You do not have access to this practice');
    }

    return practice;
  }
}
