import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import {
  InterviewPractice,
  ResponseQuality,
} from '../../../../domain/entities/interview-practice.entity';
import { PracticeStatus } from '../../../../domain/entities/practice-session.entity';
import { IInterviewPracticeRepository } from '../../../interfaces/repositories/interview-practice-repository.interface';
import { IPracticeSessionRepository } from '../../../interfaces/repositories/practice-session-repository.interface';
import { AnswerQuestionDto } from '../../../dtos/interview-practice.dto';

@Injectable()
export class AnswerQuestionUseCase {
  constructor(
    @Inject('IInterviewPracticeRepository')
    private readonly interviewPracticeRepository: IInterviewPracticeRepository,
    @Inject('IPracticeSessionRepository')
    private readonly practiceSessionRepository: IPracticeSessionRepository,
  ) {}

  async execute(
    practiceId: string,
    userId: string,
    answerDto: AnswerQuestionDto,
  ): Promise<InterviewPractice> {
    const practice = await this.interviewPracticeRepository.findById(practiceId);

    if (!practice) {
      throw new NotFoundException('Interview practice not found');
    }

    if (practice.practiceSession.userId !== userId) {
      throw new ForbiddenException('You do not have access to this practice');
    }

    if (practice.practiceSession.status === PracticeStatus.COMPLETED) {
      throw new BadRequestException('Cannot answer questions in a completed practice');
    }

    // Answer question
    practice.answerQuestion(
      parseInt(answerDto.questionId),
      `Question ${answerDto.questionId}`,
      answerDto.responseText,
      answerDto.responseTimeSeconds,
      {
        fluency: answerDto.fluencyScore || 0,
        pronunciation: answerDto.pronunciationScore || 0,
        grammar: answerDto.grammarScore || 0,
        vocabulary: answerDto.vocabularyScore || 0,
        overall: answerDto.responseQuality || ResponseQuality.POOR,
        feedback: 'AI evaluation feedback',
      },
    );

    // Update practice
    const updatedPractice = await this.interviewPracticeRepository.update(practice.id, {
      questionsAnswered: practice.questionsAnswered,
      ...(practice.averageResponseTime !== undefined && {
        averageResponseTime: practice.averageResponseTime,
      }),
      fluencyScore: practice.fluencyScore,
      pronunciationScore: practice.pronunciationScore,
      grammarScore: practice.grammarScore,
      vocabularyScore: practice.vocabularyScore,
      ...(practice.conversationFlow && { conversationFlow: practice.conversationFlow }),
    });

    // Update session progress and score
    const newProgress = practice.getCompletionPercentage();
    const newScore = practice.getOverallScore();
    const totalTimeSpent =
      practice.practiceSession.timeSpentSeconds + answerDto.responseTimeSeconds;

    await this.practiceSessionRepository.update(practice.practiceSession.id, {
      progress: newProgress,
      score: newScore,
      timeSpentSeconds: totalTimeSpent,
    });

    // Check if interview is completed
    if (practice.isCompleted()) {
      await this.practiceSessionRepository.update(practice.practiceSession.id, {
        status: PracticeStatus.COMPLETED,
        completedAt: new Date(),
      });
    }

    return updatedPractice;
  }
}
