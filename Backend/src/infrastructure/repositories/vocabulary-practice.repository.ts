import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { VocabularyPractice } from '../../domain/entities/vocabulary-practice.entity';
import { IVocabularyPracticeRepository } from '../../application/interfaces/repositories/vocabulary-practice-repository.interface';

@Injectable()
export class VocabularyPracticeRepository implements IVocabularyPracticeRepository {
  constructor(
    @InjectRepository(VocabularyPractice)
    private readonly repository: Repository<VocabularyPractice>,
  ) {}

  async create(vocabularyPractice: VocabularyPractice): Promise<VocabularyPractice> {
    return await this.repository.save(vocabularyPractice);
  }

  async findById(id: string): Promise<VocabularyPractice | null> {
    return await this.repository.findOne({
      where: { id },
      relations: ['practiceSession', 'practiceSession.chapter'],
    });
  }

  async findByPracticeSessionId(practiceSessionId: string): Promise<VocabularyPractice | null> {
    return await this.repository.findOne({
      where: { practiceSession: { id: practiceSessionId } },
      relations: ['practiceSession', 'practiceSession.chapter'],
    });
  }

  async findByUserId(userId: string, limit = 10, offset = 0): Promise<VocabularyPractice[]> {
    return await this.repository.find({
      where: { practiceSession: { userId } },
      relations: ['practiceSession', 'practiceSession.chapter'],
      order: { practiceSession: { createdAt: 'DESC' } },
      take: limit,
      skip: offset,
    });
  }

  async update(id: string, updates: Partial<VocabularyPractice>): Promise<VocabularyPractice> {
    // Exclude relation properties from updates to avoid TypeORM issues
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { practiceSession, ...updateData } = updates;
    await this.repository.update(id, updateData);
    const updated = await this.findById(id);
    if (!updated) {
      throw new Error('Vocabulary practice not found after update');
    }
    return updated;
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async getStatsByUserId(userId: string): Promise<{
    totalSessions: number;
    totalWordsStudied: number;
    totalWordsLearned: number;
    averageAccuracy: number;
    currentStreak: number;
  }> {
    const practices = await this.repository.find({
      where: { practiceSession: { userId } },
      relations: ['practiceSession'],
    });

    if (practices.length === 0) {
      return {
        totalSessions: 0,
        totalWordsStudied: 0,
        totalWordsLearned: 0,
        averageAccuracy: 0,
        currentStreak: 0,
      };
    }

    const totalSessions = practices.length;
    const totalWordsStudied = practices.reduce((sum, p) => sum + p.wordsStudied, 0);
    const totalWordsLearned = practices.reduce((sum, p) => sum + p.wordsLearned, 0);
    const totalAttempts = practices.reduce((sum, p) => sum + p.totalAttempts, 0);
    const totalCorrectAnswers = practices.reduce((sum, p) => sum + p.correctAnswers, 0);

    const averageAccuracy =
      totalAttempts > 0 ? Math.round((totalCorrectAnswers / totalAttempts) * 100) : 0;

    // Get current streak from the most recent practice
    const mostRecentPractice = practices.sort(
      (a, b) =>
        new Date(b.practiceSession.createdAt).getTime() -
        new Date(a.practiceSession.createdAt).getTime(),
    )[0];
    const currentStreak = mostRecentPractice?.streakCount || 0;

    return {
      totalSessions,
      totalWordsStudied,
      totalWordsLearned,
      averageAccuracy,
      currentStreak,
    };
  }
}
