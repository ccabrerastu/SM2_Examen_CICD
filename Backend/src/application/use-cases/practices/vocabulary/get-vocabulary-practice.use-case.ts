import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { VocabularyPractice } from '../../../../domain/entities/vocabulary-practice.entity';
import { IVocabularyPracticeRepository } from '../../../interfaces/repositories/vocabulary-practice-repository.interface';

@Injectable()
export class GetVocabularyPracticeUseCase {
  constructor(private readonly vocabularyPracticeRepository: IVocabularyPracticeRepository) {}

  async execute(practiceId: string, userId: string): Promise<VocabularyPractice> {
    const practice = await this.vocabularyPracticeRepository.findById(practiceId);

    if (!practice) {
      throw new NotFoundException('Vocabulary practice not found');
    }

    // Verify that the practice belongs to the user
    if (practice.practiceSession.userId !== userId) {
      throw new ForbiddenException('You do not have access to this practice');
    }

    return practice;
  }

  async getBySessionId(sessionId: string, userId: string): Promise<VocabularyPractice> {
    const practice = await this.vocabularyPracticeRepository.findByPracticeSessionId(sessionId);

    if (!practice) {
      throw new NotFoundException('Vocabulary practice not found for this session');
    }

    // Verify that the practice belongs to the user
    if (practice.practiceSession.userId !== userId) {
      throw new ForbiddenException('You do not have access to this practice');
    }

    return practice;
  }
}
