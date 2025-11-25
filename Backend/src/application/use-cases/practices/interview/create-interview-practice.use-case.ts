import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import {
  PracticeSession,
  PracticeType,
  PracticeStatus,
} from '../../../../domain/entities/practice-session.entity';
import { InterviewPractice } from '../../../../domain/entities/interview-practice.entity';
import { Chapter } from '../../../../domain/entities/chapter.entity';
import { IPracticeSessionRepository } from '../../../interfaces/repositories/practice-session-repository.interface';
import { IInterviewPracticeRepository } from '../../../interfaces/repositories/interview-practice-repository.interface';
import { IChapterRepository } from '../../../interfaces/repositories/chapter-repository.interface';
import { CreateInterviewPracticeDto } from '../../../dtos/interview-practice.dto';

@Injectable()
export class CreateInterviewPracticeUseCase {
  constructor(
    @Inject('IPracticeSessionRepository')
    private readonly practiceSessionRepository: IPracticeSessionRepository,
    @Inject('IInterviewPracticeRepository')
    private readonly interviewPracticeRepository: IInterviewPracticeRepository,
    @Inject('IChapterRepository')
    private readonly chapterRepository: IChapterRepository,
  ) {}

  async execute(userId: string, createDto: CreateInterviewPracticeDto): Promise<InterviewPractice> {
    // Validate chapter exists if provided
    let chapter: Chapter | null = null;
    if (createDto.chapterId) {
      chapter = await this.chapterRepository.findById(createDto.chapterId);
      if (!chapter) {
        throw new NotFoundException('Chapter not found');
      }

      // Check if user has access to this chapter
      // TODO: Implement getUserProgress method in repository
      const userProgress = null;
      if (!userProgress) {
        throw new BadRequestException('User does not have access to this chapter');
      }
    }

    // Create practice session
    const practiceSession = new PracticeSession();
    practiceSession.userId = userId;
    if (createDto.chapterId) {
      practiceSession.chapterId = createDto.chapterId;
    }
    practiceSession.practiceType = PracticeType.INTERVIEW;
    practiceSession.status = PracticeStatus.STARTED;
    practiceSession.progress = 0;
    practiceSession.score = 0;
    practiceSession.maxScore = 100; // Interview practice is percentage-based
    practiceSession.timeSpentSeconds = 0;
    if (chapter) {
      practiceSession.chapter = chapter;
    }

    const savedSession = await this.practiceSessionRepository.create(practiceSession);

    // Create interview practice
    const interviewPractice = InterviewPractice.createForSession(
      savedSession,
      createDto.interviewType,
      createDto.totalQuestions,
    );

    const savedInterviewPractice = await this.interviewPracticeRepository.create(interviewPractice);

    // Update session status to in progress
    await this.practiceSessionRepository.update(savedSession.id, {
      status: PracticeStatus.IN_PROGRESS,
    });

    return savedInterviewPractice;
  }
}
