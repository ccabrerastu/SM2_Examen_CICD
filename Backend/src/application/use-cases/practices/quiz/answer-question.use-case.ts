import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { QuizPractice } from '../../../../domain/entities/quiz-practice.entity';
import { PracticeStatus } from '../../../../domain/entities/practice-session.entity';
import { IQuizPracticeRepository } from '../../../interfaces/repositories/quiz-practice-repository.interface';
import { IPracticeSessionRepository } from '../../../interfaces/repositories/practice-session-repository.interface';
import { AnswerQuizQuestionDto } from '../../../dtos/quiz-practice.dto';

@Injectable()
export class AnswerQuestionUseCase {
  constructor(
    private readonly quizPracticeRepository: IQuizPracticeRepository,
    private readonly practiceSessionRepository: IPracticeSessionRepository,
  ) {}

  async execute(
    practiceId: string,
    userId: string,
    answerDto: AnswerQuizQuestionDto,
  ): Promise<QuizPractice> {
    const practice = await this.quizPracticeRepository.findById(practiceId);

    if (!practice) {
      throw new NotFoundException('Quiz practice not found');
    }

    if (practice.practiceSession.userId !== userId) {
      throw new ForbiddenException('You do not have access to this practice');
    }

    if (practice.practiceSession.status === PracticeStatus.COMPLETED) {
      throw new BadRequestException('Cannot answer questions in a completed practice');
    }

    // Answer the question
    const isCorrect = answerDto.selectedAnswer === answerDto.correctAnswer;
    practice.answerQuestion(
      parseInt(answerDto.questionId),
      isCorrect,
      answerDto.timeSpentSeconds,
      answerDto.selectedAnswer,
    );

    // Update practice
    const updatedPractice = await this.quizPracticeRepository.update(practice.id, {
      questionsAnswered: practice.questionsAnswered,
      correctAnswers: practice.correctAnswers,
      wrongAnswers: practice.wrongAnswers,
      lastQuestionIndex: practice.lastQuestionIndex,
      ...(practice.timePerQuestion && { timePerQuestion: practice.timePerQuestion }),
      ...(practice.questionResults && { questionResults: practice.questionResults }),
      ...(practice.averageTimePerQuestion !== undefined && {
        averageTimePerQuestion: practice.averageTimePerQuestion,
      }),
    });

    // Update session progress, score and time
    const newProgress = practice.getCompletionPercentage();
    const newScore = practice.getAccuracyPercentage();
    const totalTimeSpent = practice.practiceSession.timeSpentSeconds + answerDto.timeSpentSeconds;

    await this.practiceSessionRepository.update(practice.practiceSession.id, {
      progress: newProgress,
      score: newScore,
      timeSpentSeconds: totalTimeSpent,
    });

    // Check if practice is completed
    if (practice.isCompleted()) {
      await this.practiceSessionRepository.update(practice.practiceSession.id, {
        status: PracticeStatus.COMPLETED,
        completedAt: new Date(),
      });
    }

    return updatedPractice;
  }
}
