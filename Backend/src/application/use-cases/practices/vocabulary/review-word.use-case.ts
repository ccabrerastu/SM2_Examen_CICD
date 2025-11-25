import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { VocabularyPractice } from '../../../../domain/entities/vocabulary-practice.entity';
import { PracticeStatus } from '../../../../domain/entities/practice-session.entity';
import { IVocabularyPracticeRepository } from '../../../interfaces/repositories/vocabulary-practice-repository.interface';
import { IPracticeSessionRepository } from '../../../interfaces/repositories/practice-session-repository.interface';
import { ReviewWordDto } from '../../../dtos/vocabulary-practice.dto';

@Injectable()
export class ReviewWordUseCase {
  constructor(
    private readonly vocabularyPracticeRepository: IVocabularyPracticeRepository,
    private readonly practiceSessionRepository: IPracticeSessionRepository,
  ) {}

  async execute(
    practiceId: string,
    userId: string,
    reviewWordDto: ReviewWordDto,
  ): Promise<VocabularyPractice> {
    const practice = await this.vocabularyPracticeRepository.findById(practiceId);

    if (!practice) {
      throw new NotFoundException('Vocabulary practice not found');
    }

    if (practice.practiceSession.userId !== userId) {
      throw new ForbiddenException('You do not have access to this practice');
    }

    if (practice.practiceSession.status === PracticeStatus.COMPLETED) {
      throw new BadRequestException('Cannot review words in a completed practice');
    }

    // Determine if the answer is correct
    const isCorrect =
      reviewWordDto.userAnswer.toLowerCase().trim() ===
      reviewWordDto.correctAnswer.toLowerCase().trim();

    // Review the word
    practice.reviewWord(isCorrect);

    // Update practice
    const updatedPractice = await this.vocabularyPracticeRepository.update(practice.id, {
      wordsReviewed: practice.wordsReviewed,
      correctAnswers: practice.correctAnswers,
      incorrectAnswers: practice.incorrectAnswers,
      reviewedWords: practice.reviewedWords,
    });

    // Update session progress, score and time
    const newProgress = practice.getProgress();
    const newScore = practice.getScore();
    const totalTimeSpent =
      practice.practiceSession.timeSpentSeconds + reviewWordDto.timeSpentSeconds;

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
