import { Injectable } from '@nestjs/common';
import { Repository, LessThan } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ApprovalEvaluation,
  EvaluationStatus,
} from '../../domain/entities/approval-evaluation.entity';
import { IApprovalEvaluationRepository } from '../../application/interfaces/repositories/approval-evaluation-repository.interface';

@Injectable()
export class ApprovalEvaluationRepository implements IApprovalEvaluationRepository {
  constructor(
    @InjectRepository(ApprovalEvaluation)
    private readonly repository: Repository<ApprovalEvaluation>,
  ) {}

  async create(evaluation: Partial<ApprovalEvaluation>): Promise<ApprovalEvaluation> {
    const evaluationEntity = this.repository.create({
      ...evaluation,
      evaluatedAt: evaluation.evaluatedAt || new Date(),
    });
    return await this.repository.save(evaluationEntity);
  }

  async findById(id: string): Promise<ApprovalEvaluation | null> {
    return await this.repository.findOne({
      where: { id },
      relations: ['user', 'rule'],
    });
  }

  async findByUserId(userId: string): Promise<ApprovalEvaluation[]> {
    return await this.repository.find({
      where: { userId },
      order: { evaluatedAt: 'DESC' },
      relations: ['rule'],
    });
  }

  async findByUserAndChapter(userId: string, chapterId: string): Promise<ApprovalEvaluation[]> {
    return await this.repository.find({
      where: { userId, chapterId },
      order: { attemptNumber: 'ASC' },
      relations: ['rule'],
    });
  }

  async findLatestByUserAndChapter(
    userId: string,
    chapterId: string,
  ): Promise<ApprovalEvaluation | null> {
    return await this.repository.findOne({
      where: { userId, chapterId },
      order: { attemptNumber: 'DESC' },
      relations: ['rule'],
    });
  }

  async findByStatus(status: EvaluationStatus): Promise<ApprovalEvaluation[]> {
    return await this.repository.find({
      where: { status },
      order: { evaluatedAt: 'DESC' },
      relations: ['user', 'rule'],
    });
  }

  async findPreviousAttempts(
    userId: string,
    chapterId: string,
    currentAttempt: number,
  ): Promise<ApprovalEvaluation[]> {
    return await this.repository.find({
      where: {
        userId,
        chapterId,
        attemptNumber: LessThan(currentAttempt),
      },
      order: { attemptNumber: 'ASC' },
    });
  }

  async countAttempts(userId: string, chapterId: string): Promise<number> {
    return await this.repository.count({
      where: { userId, chapterId },
    });
  }

  async update(id: string, updateData: Partial<ApprovalEvaluation>): Promise<ApprovalEvaluation> {
    const existing = await this.repository.findOne({ where: { id } });
    if (!existing) {
      throw new Error('Approval evaluation not found');
    }

    const updated = this.repository.merge(existing, updateData);
    return await this.repository.save(updated);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async getEvaluationHistory(userId: string, limit: number = 50): Promise<ApprovalEvaluation[]> {
    return await this.repository.find({
      where: { userId },
      order: { evaluatedAt: 'DESC' },
      take: limit,
      relations: ['rule'],
    });
  }

  async getChapterEvaluationStats(chapterId: string): Promise<{
    totalEvaluations: number;
    approvedCount: number;
    rejectedCount: number;
    averageScore: number;
    averageAttempts: number;
  }> {
    const evaluations = await this.repository.find({
      where: { chapterId },
    });

    const totalEvaluations = evaluations.length;
    const approvedCount = evaluations.filter(e => e.status === EvaluationStatus.APPROVED).length;
    const rejectedCount = evaluations.filter(e => e.status === EvaluationStatus.REJECTED).length;

    const averageScore =
      totalEvaluations > 0
        ? evaluations.reduce((sum, e) => sum + e.score, 0) / totalEvaluations
        : 0;

    // Calculate average attempts per user
    const userAttempts = new Map<string, number>();
    evaluations.forEach(e => {
      const current = userAttempts.get(e.userId) || 0;
      userAttempts.set(e.userId, Math.max(current, e.attemptNumber));
    });

    const averageAttempts =
      userAttempts.size > 0
        ? Array.from(userAttempts.values()).reduce((sum, attempts) => sum + attempts, 0) /
          userAttempts.size
        : 0;

    return {
      totalEvaluations,
      approvedCount,
      rejectedCount,
      averageScore: Math.round(averageScore * 100) / 100,
      averageAttempts: Math.round(averageAttempts * 100) / 100,
    };
  }
}
