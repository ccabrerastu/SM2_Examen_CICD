import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { QuizQuestionRepository } from '../../../infrastructure/repositories/quiz-question.repository';
import { DailyLivesRepository } from '../../../infrastructure/repositories/daily-lives.repository';
import { QuizAnswerResultDto } from '../../dtos/reading/submit-quiz-answer.dto';

@Injectable()
export class SubmitQuizAnswerUseCase {
  private readonly logger = new Logger(SubmitQuizAnswerUseCase.name);

  constructor(
    private readonly quizQuestionRepository: QuizQuestionRepository,
    private readonly dailyLivesRepository: DailyLivesRepository,
  ) {}

  async execute(
    userId: string,
    questionId: string,
    answerIndex: number,
  ): Promise<QuizAnswerResultDto> {
    this.logger.log(`User ${userId} submitting answer for question ${questionId}`);

    const question = await this.quizQuestionRepository.findById(questionId);

    if (!question) {
      throw new NotFoundException(`Quiz question not found: ${questionId}`);
    }

    const isCorrect = question.isCorrectAnswer(answerIndex);

    // If incorrect, consume a life
    if (!isCorrect) {
      try {
        await this.dailyLivesRepository.consumeLife(userId);
        this.logger.log(`Life consumed for user ${userId} due to incorrect answer`);
      } catch (error) {
        this.logger.warn(`Could not consume life for user ${userId}: ${error}`);
      }
    }

    return {
      isCorrect,
      hint: !isCorrect ? question.hint : null,
      explanation: question.explanation || null,
      correctAnswer: !isCorrect ? question.getCorrectAnswerText() : null,
    };
  }
}
