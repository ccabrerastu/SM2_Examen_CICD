import {
  ApprovalEvaluation,
  EvaluationStatus,
} from '../../../domain/entities/approval-evaluation.entity';

export interface IApprovalEvaluationRepository {
  create(evaluation: Partial<ApprovalEvaluation>): Promise<ApprovalEvaluation>;
  findById(id: string): Promise<ApprovalEvaluation | null>;
  findByUserId(userId: string): Promise<ApprovalEvaluation[]>;
  findByUserAndChapter(userId: string, chapterId: string): Promise<ApprovalEvaluation[]>;
  findLatestByUserAndChapter(userId: string, chapterId: string): Promise<ApprovalEvaluation | null>;
  findByStatus(status: EvaluationStatus): Promise<ApprovalEvaluation[]>;
  findPreviousAttempts(
    userId: string,
    chapterId: string,
    currentAttempt: number,
  ): Promise<ApprovalEvaluation[]>;
  countAttempts(userId: string, chapterId: string): Promise<number>;
  update(id: string, updateData: Partial<ApprovalEvaluation>): Promise<ApprovalEvaluation>;
  delete(id: string): Promise<void>;
  getEvaluationHistory(userId: string, limit?: number): Promise<ApprovalEvaluation[]>;
  getChapterEvaluationStats(chapterId: string): Promise<{
    totalEvaluations: number;
    approvedCount: number;
    rejectedCount: number;
    averageScore: number;
    averageAttempts: number;
  }>;
}
