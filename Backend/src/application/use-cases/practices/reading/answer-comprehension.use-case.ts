import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { ReadingPractice } from '../../../../domain/entities/reading-practice.entity';
import { PracticeStatus } from '../../../../domain/entities/practice-session.entity';
import { IReadingPracticeRepository } from '../../../interfaces/repositories/reading-practice-repository.interface';
import { IPracticeSessionRepository } from '../../../interfaces/repositories/practice-session-repository.interface';
import { AnswerComprehensionQuestionDto } from '../../../dtos/reading-practice.dto';

@Injectable()
export class AnswerComprehensionUseCase {
  constructor(
    private readonly readingPracticeRepository: IReadingPracticeRepository,
    private readonly practiceSessionRepository: IPracticeSessionRepository,
  ) {}

  async execute(
    practiceId: string,
    userId: string,
    answerDto: AnswerComprehensionQuestionDto,
  ): Promise<ReadingPractice> {
    const practice = await this.readingPracticeRepository.findById(practiceId);

    if (!practice) {
      throw new NotFoundException('Reading practice not found');
    }

    if (practice.practiceSession.userId !== userId) {
      throw new ForbiddenException('You do not have access to this practice');
    }

    if (practice.practiceSession.status === PracticeStatus.COMPLETED) {
      throw new BadRequestException('Cannot answer questions in a completed practice');
    }

    // Answer comprehension question
    practice.answerComprehensionQuestion(answerDto.isCorrect);

    // Update practice
    const updatedPractice = await this.readingPracticeRepository.update(practice.id, {
      comprehensionQuestionsCorrect: practice.comprehensionQuestionsCorrect,
      comprehensionQuestionsTotal: practice.comprehensionQuestionsTotal,
    });

    // Update session score
    const newScore = practice.getComprehensionScore();

    await this.practiceSessionRepository.update(practice.practiceSession.id, {
      score: newScore,
    });

    return updatedPractice;
  }
}
