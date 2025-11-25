import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { InterviewPractice, InterviewType } from '../../domain/entities/interview-practice.entity';
import { IInterviewPracticeRepository } from '../../application/interfaces/repositories/interview-practice-repository.interface';

@Injectable()
export class InterviewPracticeRepository implements IInterviewPracticeRepository {
  constructor(
    @InjectRepository(InterviewPractice)
    private readonly repository: Repository<InterviewPractice>,
  ) {}

  async create(interviewPractice: InterviewPractice): Promise<InterviewPractice> {
    return await this.repository.save(interviewPractice);
  }

  async findById(id: string): Promise<InterviewPractice | null> {
    return await this.repository.findOne({
      where: { id },
      relations: ['practiceSession', 'practiceSession.chapter'],
    });
  }

  async findByPracticeSessionId(practiceSessionId: string): Promise<InterviewPractice | null> {
    return await this.repository.findOne({
      where: { practiceSession: { id: practiceSessionId } },
      relations: ['practiceSession', 'practiceSession.chapter'],
    });
  }

  async findByUserId(userId: string, limit = 10, offset = 0): Promise<InterviewPractice[]> {
    return await this.repository.find({
      where: { practiceSession: { userId } },
      relations: ['practiceSession', 'practiceSession.chapter'],
      order: { practiceSession: { createdAt: 'DESC' } },
      take: limit,
      skip: offset,
    });
  }

  async findByUserIdAndType(
    userId: string,
    interviewType: InterviewType,
    limit = 10,
    offset = 0,
  ): Promise<InterviewPractice[]> {
    return await this.repository.find({
      where: {
        practiceSession: { userId },
        interviewType,
      },
      relations: ['practiceSession', 'practiceSession.chapter'],
      order: { practiceSession: { createdAt: 'DESC' } },
      take: limit,
      skip: offset,
    });
  }

  async update(id: string, updates: Partial<InterviewPractice>): Promise<InterviewPractice> {
    // Exclude relation properties from updates to avoid TypeORM issues
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { practiceSession, ...updateData } = updates;
    await this.repository.update(id, updateData);
    const updated = await this.findById(id);
    if (!updated) {
      throw new Error('Interview practice not found after update');
    }
    return updated;
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async getStatsByUserId(userId: string): Promise<{
    totalSessions: number;
    totalQuestionsAnswered: number;
    averageFluencyScore: number;
    averagePronunciationScore: number;
    averageGrammarScore: number;
    averageVocabularyScore: number;
    averageResponseTime: number;
    interviewTypesCompleted: InterviewType[];
    areasForImprovement: string[];
    strengthsIdentified: string[];
  }> {
    const practices = await this.repository.find({
      where: { practiceSession: { userId } },
      relations: ['practiceSession'],
    });

    if (practices.length === 0) {
      return {
        totalSessions: 0,
        totalQuestionsAnswered: 0,
        averageFluencyScore: 0,
        averagePronunciationScore: 0,
        averageGrammarScore: 0,
        averageVocabularyScore: 0,
        averageResponseTime: 0,
        interviewTypesCompleted: [],
        areasForImprovement: [],
        strengthsIdentified: [],
      };
    }

    const totalSessions = practices.length;
    const totalQuestionsAnswered = practices.reduce((sum, p) => sum + p.questionsAnswered, 0);

    const averageFluencyScore =
      practices.reduce((sum, p) => sum + p.fluencyScore, 0) / practices.length;
    const averagePronunciationScore =
      practices.reduce((sum, p) => sum + p.pronunciationScore, 0) / practices.length;
    const averageGrammarScore =
      practices.reduce((sum, p) => sum + p.grammarScore, 0) / practices.length;
    const averageVocabularyScore =
      practices.reduce((sum, p) => sum + p.vocabularyScore, 0) / practices.length;

    const practicesWithResponseTime = practices.filter(
      p => p.averageResponseTime && p.averageResponseTime > 0,
    );
    const averageResponseTime =
      practicesWithResponseTime.length > 0
        ? practicesWithResponseTime.reduce((sum, p) => sum + (p.averageResponseTime || 0), 0) /
          practicesWithResponseTime.length
        : 0;

    const interviewTypesCompleted = Array.from(new Set(practices.map(p => p.interviewType)));

    // Collect all areas for improvement and strengths
    const allAreasForImprovement = practices.flatMap(p => p.areasForImprovement || []);
    const allStrengthsIdentified = practices.flatMap(p => p.strengthsIdentified || []);

    // Get unique areas and strengths
    const areasForImprovement = Array.from(new Set(allAreasForImprovement));
    const strengthsIdentified = Array.from(new Set(allStrengthsIdentified));

    return {
      totalSessions,
      totalQuestionsAnswered,
      averageFluencyScore: Math.round(averageFluencyScore * 100) / 100,
      averagePronunciationScore: Math.round(averagePronunciationScore * 100) / 100,
      averageGrammarScore: Math.round(averageGrammarScore * 100) / 100,
      averageVocabularyScore: Math.round(averageVocabularyScore * 100) / 100,
      averageResponseTime: Math.round(averageResponseTime * 100) / 100,
      interviewTypesCompleted,
      areasForImprovement,
      strengthsIdentified,
    };
  }
}
