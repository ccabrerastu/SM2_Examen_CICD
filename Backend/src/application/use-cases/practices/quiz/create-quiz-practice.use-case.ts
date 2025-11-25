import { Injectable, NotFoundException } from '@nestjs/common';
import {
  PracticeSession,
  PracticeType,
  PracticeStatus,
} from '../../../../domain/entities/practice-session.entity';
import { QuizPractice } from '../../../../domain/entities/quiz-practice.entity';

import { IPracticeSessionRepository } from '../../../interfaces/repositories/practice-session-repository.interface';
import { IQuizPracticeRepository } from '../../../interfaces/repositories/quiz-practice-repository.interface';
import { IChapterRepository } from '../../../interfaces/repositories/chapter-repository.interface';
import { CreateQuizPracticeDto } from '../../../dtos/quiz-practice.dto';

@Injectable()
export class CreateQuizPracticeUseCase {
  constructor(
    private readonly practiceSessionRepository: IPracticeSessionRepository,
    private readonly quizPracticeRepository: IQuizPracticeRepository,
    private readonly chapterRepository: IChapterRepository,
  ) {}

  async execute(userId: string, createDto: CreateQuizPracticeDto): Promise<QuizPractice> {
    let chapter = null;

    // Validate chapter exists if provided
    if (createDto.chapterId) {
      chapter = await this.chapterRepository.findById(createDto.chapterId);
      if (!chapter) {
        throw new NotFoundException('Chapter not found');
      }
    }

    // Create practice session
    const practiceSession = new PracticeSession();
    practiceSession.userId = userId;
    if (createDto.chapterId) {
      practiceSession.chapterId = createDto.chapterId;
    }
    practiceSession.practiceType = PracticeType.QUIZ;
    practiceSession.status = PracticeStatus.STARTED;
    practiceSession.progress = 0;
    practiceSession.score = 0;
    practiceSession.maxScore = createDto.totalQuestions || 10; // Default 10 questions
    practiceSession.timeSpentSeconds = 0;
    if (chapter) {
      practiceSession.chapter = chapter;
    }

    const savedSession = await this.practiceSessionRepository.create(practiceSession);

    // Create quiz practice
    const quizPractice = QuizPractice.createForSession(
      savedSession,
      createDto.category || '',
      createDto.difficultyLevel || '',
      createDto.totalQuestions || 10,
    );

    const savedQuizPractice = await this.quizPracticeRepository.create(quizPractice);

    // Update session status to in progress
    await this.practiceSessionRepository.update(savedSession.id, {
      status: PracticeStatus.IN_PROGRESS,
    });

    return savedQuizPractice;
  }
}
