import { Injectable, NotFoundException } from '@nestjs/common';
import {
  PracticeSession,
  PracticeType,
  PracticeStatus,
} from '../../../../domain/entities/practice-session.entity';
import { ReadingPractice } from '../../../../domain/entities/reading-practice.entity';
import { IPracticeSessionRepository } from '../../../interfaces/repositories/practice-session-repository.interface';
import { IReadingPracticeRepository } from '../../../interfaces/repositories/reading-practice-repository.interface';
import { IChapterRepository } from '../../../interfaces/repositories/chapter-repository.interface';
import { CreateReadingPracticeDto } from '../../../dtos/reading-practice.dto';

@Injectable()
export class CreateReadingPracticeUseCase {
  constructor(
    private readonly practiceSessionRepository: IPracticeSessionRepository,
    private readonly readingPracticeRepository: IReadingPracticeRepository,
    private readonly chapterRepository: IChapterRepository,
  ) {}

  async execute(userId: string, createDto: CreateReadingPracticeDto): Promise<ReadingPractice> {
    let chapter = null;

    // Validate chapter exists if chapterId is provided
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
    practiceSession.practiceType = PracticeType.READING;
    practiceSession.status = PracticeStatus.STARTED;
    practiceSession.progress = 0;
    practiceSession.score = 0;
    practiceSession.maxScore = 100; // Reading practice is percentage-based
    practiceSession.timeSpentSeconds = 0;
    if (chapter) {
      practiceSession.chapter = chapter;
    }

    const savedSession = await this.practiceSessionRepository.create(practiceSession);

    // Create reading practice
    const readingPractice = ReadingPractice.createForSession(
      savedSession,
      createDto.textId || '',
      createDto.textTitle || '',
      createDto.totalWords,
      createDto.difficultyLevel || '',
      createDto.textCategory || '',
    );

    const savedReadingPractice = await this.readingPracticeRepository.create(readingPractice);

    // Update session status to in progress
    await this.practiceSessionRepository.update(savedSession.id, {
      status: PracticeStatus.IN_PROGRESS,
    });

    return savedReadingPractice;
  }
}
