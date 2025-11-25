import { Injectable } from '@nestjs/common';
import { VocabularyPractice } from '../../../../domain/entities/vocabulary-practice.entity';
import { IVocabularyPracticeRepository } from '../../../interfaces/repositories/vocabulary-practice-repository.interface';
import { GetVocabularySessionsDto } from '../../../dtos/vocabulary-practice.dto';

@Injectable()
export class GetVocabularySessionsUseCase {
  constructor(private readonly vocabularyPracticeRepository: IVocabularyPracticeRepository) {}

  async execute(userId: string, filters?: GetVocabularySessionsDto): Promise<VocabularyPractice[]> {
    const limit = filters?.limit || 10;
    const offset = filters?.offset || 0;
    return this.vocabularyPracticeRepository.findByUserId(userId, limit, offset);
  }

  async getStats(userId: string): Promise<unknown> {
    return this.vocabularyPracticeRepository.getStatsByUserId(userId);
  }

  async getByChapter(userId: string, chapterId: string): Promise<VocabularyPractice[]> {
    // For now, return all sessions and filter by chapter in memory
    const allSessions = await this.vocabularyPracticeRepository.findByUserId(userId);
    return allSessions.filter(session => session.practiceSession.chapter?.id === chapterId);
  }

  async getCompleted(userId: string): Promise<VocabularyPractice[]> {
    // For now, return all sessions and filter completed in memory
    const allSessions = await this.vocabularyPracticeRepository.findByUserId(userId);
    return allSessions.filter(session => session.isCompleted());
  }

  async getInProgress(userId: string): Promise<VocabularyPractice[]> {
    // For now, return all sessions and filter in progress in memory
    const allSessions = await this.vocabularyPracticeRepository.findByUserId(userId);
    return allSessions.filter(session => !session.isCompleted());
  }
}
