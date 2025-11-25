import { Injectable, Inject, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { IApprovalRuleRepository } from '../../interfaces/repositories/approval-rule-repository.interface';
import { IApprovalEvaluationRepository } from '../../interfaces/repositories/approval-evaluation-repository.interface';
import { IApprovalMetricsRepository } from '../../interfaces/repositories/approval-metrics-repository.interface';
import { IUserRepository } from '../../interfaces/repositories/user-repository.interface';
import {
  ApprovalEvaluation,
  EvaluationStatus,
} from '../../../domain/entities/approval-evaluation.entity';
import { ApprovalRule } from '../../../domain/entities/approval-rule.entity';
import { ApprovalMetrics } from '../../../domain/entities/approval-metrics.entity';
export interface EvaluationError {
  type: string;
  description: string;
}

export interface EvaluateApprovalRequest {
  userId: string;
  chapterId: string;
  score: number;
  errors?: EvaluationError[];  
  timeSpent?: number;
  additionalData?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface EvaluateApprovalResponse {
  evaluationId: string;
  status: EvaluationStatus;
  score: number;
  adjustedScore: number;
  threshold: number;
  attemptNumber: number;
  errorsCarriedOver: number;
  feedback: string;
  canRetry: boolean;
  maxAttempts: number;
  errors?: EvaluationError[]; 
}


@Injectable()
export class EvaluateApprovalUseCase {
  private readonly logger = new Logger(EvaluateApprovalUseCase.name);

  // Special chapters that require 100% threshold
  private readonly SPECIAL_CHAPTERS = ['4', '5'];
  private readonly DEFAULT_THRESHOLD = 80;
  private readonly SPECIAL_THRESHOLD = 100;

  constructor(
    @Inject('IApprovalRuleRepository')
    private readonly approvalRuleRepository: IApprovalRuleRepository,
    @Inject('IApprovalEvaluationRepository')
    private readonly approvalEvaluationRepository: IApprovalEvaluationRepository,
    @Inject('IApprovalMetricsRepository')
    private readonly approvalMetricsRepository: IApprovalMetricsRepository,
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(request: EvaluateApprovalRequest): Promise<EvaluateApprovalResponse> {
    this.logger.log(
      `Evaluating approval for user: ${request.userId}, chapter: ${request.chapterId}, score: ${request.score}`,
    );

    try {
      // Validate input
      this.validateRequest(request);

      // Validate user exists
      await this.validateUserExists(request.userId);

      // Get applicable rules for the chapter
      const rules = await this.getApplicableRules(request.chapterId);
      if (rules.length === 0) {
        throw new NotFoundException('No approval rules found for this chapter');
      }

      // Use the first applicable rule (rules are ordered by priority)
      const rule = rules[0];

      // Get current attempt number
      const attemptNumber = await this.getNextAttemptNumber(request.userId, request.chapterId);

      // Calculate errors from previous attempts if error carryover is enabled
      const errorsFromPreviousAttempts = rule.allowErrorCarryover
        ? await this.calculateErrorCarryover(request.userId, request.chapterId, attemptNumber)
        : 0;

      // Calculate adjusted score
      const adjustedScore = Math.max(0, request.score - errorsFromPreviousAttempts);

      // Determine threshold based on chapter
      const threshold = this.getThresholdForChapter(request.chapterId, rule);

      // Evaluate approval
      const status =
        adjustedScore >= threshold ? EvaluationStatus.APPROVED : EvaluationStatus.REJECTED;

      // Create evaluation record
      const evaluation = await this.createEvaluation({
        userId: request.userId,
        ruleId: rule.id,
        chapterId: request.chapterId,
        score: request.score,
        threshold,
        status,
        attemptNumber,
        errorsFromPreviousAttempts,
        evaluationData: request.additionalData ?? null,
      });

      // Generate feedback
      const feedback = this.generateFeedback(
        status,
        adjustedScore,
        threshold,
        attemptNumber,
        errorsFromPreviousAttempts,
      );

      // Update evaluation with feedback
      await this.approvalEvaluationRepository.update(evaluation.id, { feedback });

      // Record metrics
      await this.recordMetrics(request, attemptNumber);

      // Check if user can retry
      const canRetry =
        status === EvaluationStatus.REJECTED && rule.canRetryAfterFailure(attemptNumber);

      this.logger.log(
        `Evaluation completed for user: ${request.userId}, status: ${status}, attempt: ${attemptNumber}`,
      );

      return {
        evaluationId: evaluation.id,
        status,
        score: request.score,
        adjustedScore,
        threshold,
        attemptNumber,
        errorsCarriedOver: errorsFromPreviousAttempts,
        feedback,
        canRetry,
        maxAttempts: rule.maxAttempts,
      };
    } catch (error) {
      this.logger.error(
        `Error evaluating approval: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  private validateRequest(request: EvaluateApprovalRequest): void {
    if (!request.userId || !request.chapterId) {
      throw new BadRequestException('User ID and Chapter ID are required');
    }

    if (request.score < 0 || request.score > 100) {
      throw new BadRequestException('Score must be between 0 and 100');
    }
  }

  private async validateUserExists(userId: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
  }

  private async getApplicableRules(chapterId: string): Promise<ApprovalRule[]> {
    return await this.approvalRuleRepository.findApplicableRules(chapterId);
  }

  private async getNextAttemptNumber(userId: string, chapterId: string): Promise<number> {
    const attemptCount = await this.approvalEvaluationRepository.countAttempts(userId, chapterId);
    return attemptCount + 1;
  }

  private async calculateErrorCarryover(
    userId: string,
    chapterId: string,
    currentAttempt: number,
  ): Promise<number> {
    if (currentAttempt === 1) {
      return 0; // No previous attempts
    }

    const previousAttempts = await this.approvalEvaluationRepository.findPreviousAttempts(
      userId,
      chapterId,
      currentAttempt,
    );

    // Calculate total errors from failed attempts
    let totalErrors = 0;
    for (const attempt of previousAttempts) {
      if (attempt.status === EvaluationStatus.REJECTED) {
        // FIXED: Use original score instead of adjustedScore to avoid double penalization
        // Each failed attempt adds penalty based on how far below threshold they were
        const deficit = Math.max(0, attempt.threshold - attempt.score);
        totalErrors += Math.ceil(deficit / 10); // 10 points deficit = 1 error point
      }
    }

    return Math.min(totalErrors, 50); // Cap at 50 points penalty
  }

  private getThresholdForChapter(chapterId: string, rule: ApprovalRule): number {
    // Check if this is a special chapter (4 or 5) that requires 100%
    if (this.SPECIAL_CHAPTERS.includes(chapterId)) {
      return this.SPECIAL_THRESHOLD;
    }

    // Use rule's threshold or default
    return rule.minScoreThreshold || this.DEFAULT_THRESHOLD;
  }

  private async createEvaluation(data: Partial<ApprovalEvaluation>): Promise<ApprovalEvaluation> {
    return await this.approvalEvaluationRepository.create({
      ...data,
      evaluatedAt: new Date(),
    });
  }

  private generateFeedback(
    status: EvaluationStatus,
    adjustedScore: number,
    threshold: number,
    attemptNumber: number,
    errorsCarriedOver: number,
  ): string {
    if (status === EvaluationStatus.APPROVED) {
      if (attemptNumber === 1) {
        return `¡Excelente! Has aprobado en tu primer intento con ${adjustedScore}% (requerido: ${threshold}%).`;
      } else {
        return `¡Felicitaciones! Has aprobado en el intento ${attemptNumber} con ${adjustedScore}% (requerido: ${threshold}%).`;
      }
    } else {
      let feedback = `No has alcanzado el puntaje requerido. Obtuviste ${adjustedScore}% y necesitas ${threshold}%.`;

      if (errorsCarriedOver > 0) {
        feedback += ` Se aplicó una penalización de ${errorsCarriedOver} puntos por intentos anteriores.`;
      }

      feedback += ` Este es tu intento número ${attemptNumber}.`;

      return feedback;
    }
  }

  private async recordMetrics(
    request: EvaluateApprovalRequest,
    attemptNumber: number,
  ): Promise<void> {
    const metrics: Partial<ApprovalMetrics>[] = [
      ApprovalMetrics.createAccuracyMetric(request.userId, request.chapterId, request.score),
      ApprovalMetrics.createAttemptMetric(request.userId, request.chapterId, attemptNumber),
    ];

    if (request.timeSpent) {
      metrics.push(
        ApprovalMetrics.createSpeedMetric(request.userId, request.chapterId, request.timeSpent),
      );
    }

    await this.approvalMetricsRepository.createBulkMetrics(metrics);
  }
}
