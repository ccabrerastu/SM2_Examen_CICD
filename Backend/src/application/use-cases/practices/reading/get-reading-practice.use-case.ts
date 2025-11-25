import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { ReadingPractice } from '../../../../domain/entities/reading-practice.entity';
import { IReadingPracticeRepository } from '../../../interfaces/repositories/reading-practice-repository.interface';

@Injectable()
export class GetReadingPracticeUseCase {
  constructor(private readonly readingPracticeRepository: IReadingPracticeRepository) {}

  async execute(practiceId: string, userId: string): Promise<ReadingPractice> {
    const practice = await this.readingPracticeRepository.findById(practiceId);

    if (!practice) {
      throw new NotFoundException('Reading practice not found');
    }

    // Verify that the practice belongs to the user
    if (practice.practiceSession.userId !== userId) {
      throw new ForbiddenException('You do not have access to this practice');
    }

    return practice;
  }

  async getBySessionId(sessionId: string, userId: string): Promise<ReadingPractice> {
    const practice = await this.readingPracticeRepository.findByPracticeSessionId(sessionId);

    if (!practice) {
      throw new NotFoundException('Reading practice not found for this session');
    }

    // Verify that the practice belongs to the user
    if (practice.practiceSession.userId !== userId) {
      throw new ForbiddenException('You do not have access to this practice');
    }

    return practice;
  }
}
