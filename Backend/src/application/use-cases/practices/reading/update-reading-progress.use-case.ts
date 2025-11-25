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
import { UpdateReadingProgressDto } from '../../../dtos/reading-practice.dto';

@Injectable()
export class UpdateReadingProgressUseCase {
  constructor(
    private readonly readingPracticeRepository: IReadingPracticeRepository,
    private readonly practiceSessionRepository: IPracticeSessionRepository,
  ) {}

  async execute(
    practiceId: string,
    userId: string,
    progressDto: UpdateReadingProgressDto,
  ): Promise<ReadingPractice> {
    const practice = await this.readingPracticeRepository.findById(practiceId);

    if (!practice) {
      throw new NotFoundException('Reading practice not found');
    }

    if (practice.practiceSession.userId !== userId) {
      throw new ForbiddenException('You do not have access to this practice');
    }

    if (practice.practiceSession.status === PracticeStatus.COMPLETED) {
      throw new BadRequestException('Cannot update progress in a completed practice');
    }

    // Update reading progress
    practice.updateReadingProgress(progressDto.wordsRead, progressDto.timeSpentSeconds);

    // Update practice
    const updateData: Partial<ReadingPractice> = {
      wordsRead: practice.wordsRead,
      readingTimeSeconds: practice.readingTimeSeconds,
      lastPosition: practice.lastPosition,
    };

    if (practice.readingSpeedWpm !== undefined) {
      updateData.readingSpeedWpm = practice.readingSpeedWpm;
    }

    const updatedPractice = await this.readingPracticeRepository.update(practice.id, updateData);

    // Update session progress and time
    const newProgress = practice.getReadingProgress();
    const totalTimeSpent = practice.practiceSession.timeSpentSeconds + progressDto.timeSpentSeconds;

    await this.practiceSessionRepository.update(practice.practiceSession.id, {
      progress: newProgress,
      timeSpentSeconds: totalTimeSpent,
    });

    // Check if reading is completed
    if (practice.isCompleted()) {
      await this.practiceSessionRepository.update(practice.practiceSession.id, {
        status: PracticeStatus.COMPLETED,
        completedAt: new Date(),
      });
    }

    return updatedPractice;
  }
}
