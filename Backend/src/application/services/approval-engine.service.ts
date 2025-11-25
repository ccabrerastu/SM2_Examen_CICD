import { Injectable, Logger, Inject } from '@nestjs/common';
import {
  EvaluateApprovalUseCase,
  EvaluateApprovalRequest,
  EvaluateApprovalResponse,
} from '../use-cases/approval/evaluate-approval.use-case';
import {
  ConfigureApprovalRuleUseCase,
  GetApprovalRulesUseCase,
  DeleteApprovalRuleUseCase,
  ConfigureApprovalRuleRequest,
  ConfigureApprovalRuleResponse,
} from '../use-cases/approval/configure-approval-rule.use-case';
import {
  UpdateApprovalRuleUseCase,
  UpdateApprovalRuleRequest,
} from '../use-cases/approval/update-approval-rule.use-case';
import {
  GetEvaluationHistoryUseCase,
  GetChapterEvaluationStatsUseCase,
  GetLatestEvaluationUseCase,
  GetEvaluationHistoryRequest,
  GetEvaluationHistoryResponse,
  EvaluationHistoryItem,
} from '../use-cases/approval/get-evaluation-history.use-case';
import { ChapterEvaluationStatsDto } from '../dtos/approval/evaluation-history.dto';
import { IApprovalMetricsRepository } from '../interfaces/repositories/approval-metrics-repository.interface';
import { ApprovalMetrics } from '../../domain/entities/approval-metrics.entity';
import { EvaluationStatus } from '../../domain/entities/approval-evaluation.entity';

export interface ApprovalEngineStats {
  totalEvaluations: number;
  approvalRate: number;
  averageAttempts: number;
  chapterStats: Record<
    string,
    {
      evaluations: number;
      approvalRate: number;
      averageScore: number;
    }
  >;
}

export interface UserApprovalSummary {
  userId: string;
  totalEvaluations: number;
  approvedEvaluations: number;
  approvalRate: number;
  averageScore: number;
  chaptersCompleted: string[];
  currentStreak: number;
  lastEvaluation?: EvaluationHistoryItem;
}

interface CacheEntry {
  data: unknown;
  timestamp: number;
}

@Injectable()
export class ApprovalEngineService {
  private readonly logger = new Logger(ApprovalEngineService.name);
  private readonly performanceCache = new Map<string, CacheEntry>();
  private readonly cacheTimeout = 5 * 60 * 1000; // 5 minutes

  constructor(
    private readonly evaluateApprovalUseCase: EvaluateApprovalUseCase,
    private readonly configureApprovalRuleUseCase: ConfigureApprovalRuleUseCase,
    private readonly updateApprovalRuleUseCase: UpdateApprovalRuleUseCase,
    private readonly getApprovalRulesUseCase: GetApprovalRulesUseCase,
    private readonly deleteApprovalRuleUseCase: DeleteApprovalRuleUseCase,
    private readonly getEvaluationHistoryUseCase: GetEvaluationHistoryUseCase,
    private readonly getChapterEvaluationStatsUseCase: GetChapterEvaluationStatsUseCase,
    private readonly getLatestEvaluationUseCase: GetLatestEvaluationUseCase,
    @Inject('IApprovalMetricsRepository')
    private readonly approvalMetricsRepository: IApprovalMetricsRepository,
  ) {}

  /**
   * Main method to evaluate user approval for a chapter
   */
  async evaluateApproval(request: EvaluateApprovalRequest): Promise<EvaluateApprovalResponse> {
    this.logger.log(
      `Processing approval evaluation for user: ${request.userId}, chapter: ${request.chapterId}`,
    );

    const startTime = Date.now();

    try {
      const result = await this.evaluateApprovalUseCase.execute(request);

      const processingTime = Date.now() - startTime;
      this.logger.log(
        `Approval evaluation completed in ${processingTime}ms. Status: ${result.status}, Score: ${result.adjustedScore}/${result.threshold}`,
      );

      // Record performance metrics
      await this.recordPerformanceMetrics(request.userId, request.chapterId, processingTime);

      return result;
    } catch (error) {
      const processingTime = Date.now() - startTime;
      this.logger.error(
        `Approval evaluation failed after ${processingTime}ms: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  /**
   * Batch evaluate multiple users for the same chapter
   */
  async batchEvaluateApproval(requests: EvaluateApprovalRequest[]): Promise<{
    results: EvaluateApprovalResponse[];
    errors: Array<{ request: EvaluateApprovalRequest; error: string }>;
  }> {
    this.logger.log(`Processing batch approval evaluation for ${requests.length} requests`);

    const results: EvaluateApprovalResponse[] = [];
    const errors: Array<{ request: EvaluateApprovalRequest; error: string }> = [];

    // Process in parallel with concurrency limit
    const concurrencyLimit = 5;
    const chunks = this.chunkArray(requests, concurrencyLimit);

    for (const chunk of chunks) {
      const promises = chunk.map(async request => {
        try {
          const result = await this.evaluateApproval(request);
          results.push(result);
        } catch (error) {
          errors.push({
            request,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      });

      await Promise.all(promises);
    }

    this.logger.log(
      `Batch evaluation completed. Successful: ${results.length}, Failed: ${errors.length}`,
    );

    return { results, errors };
  }

  /**
   * Configure approval rules for a chapter
   */
  async configureRule(
    request: ConfigureApprovalRuleRequest,
  ): Promise<ConfigureApprovalRuleResponse> {
    this.logger.log(`Configuring approval rule for chapter: ${request.chapterId || 'global'}`);

    try {
      const result = await this.configureApprovalRuleUseCase.execute(request);

      // Clear cache when rules change
      this.clearCache();

      return result;
    } catch (error) {
      this.logger.error(
        `Error configuring approval rule: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  /**
   * Update approval rule
   */
  async updateRule(
    ruleId: string,
    request: UpdateApprovalRuleRequest,
  ): Promise<ConfigureApprovalRuleResponse> {
    this.logger.log(`Updating approval rule: ${ruleId}`);

    try {
      const result = await this.updateApprovalRuleUseCase.execute(ruleId, request);

      // Clear cache when rules change
      this.clearCache();

      return result;
    } catch (error) {
      this.logger.error(
        `Error updating approval rule: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  /**
   * Get approval rules with optional filtering
   */
  async getRules(chapterId?: string, isActive?: boolean): Promise<ConfigureApprovalRuleResponse[]> {
    const cacheKey = `rules_${chapterId || 'all'}_${isActive !== undefined ? isActive : 'any'}`;
    const cached = this.getFromCache(cacheKey) as ConfigureApprovalRuleResponse[] | null;

    if (cached) {
      return cached;
    }

    let rules = await this.getApprovalRulesUseCase.execute(chapterId);

    // Apply isActive filter if specified
    if (isActive !== undefined) {
      rules = rules.filter(rule => rule.isActive === isActive);
    }

    this.setCache(cacheKey, rules);

    return rules;
  }

  /**
   * Delete approval rule
   */
  async deleteRule(ruleId: string): Promise<void> {
    await this.deleteApprovalRuleUseCase.execute(ruleId);
    this.clearCache();
  }

  /**
   * Get user evaluation history
   */
  async getUserEvaluationHistory(
    request: GetEvaluationHistoryRequest,
  ): Promise<GetEvaluationHistoryResponse> {
    return await this.getEvaluationHistoryUseCase.execute(request);
  }

  /**
   * Get latest evaluation for user and chapter
   */
  async getLatestEvaluation(
    userId: string,
    chapterId: string,
  ): Promise<EvaluationHistoryItem | null> {
    return await this.getLatestEvaluationUseCase.execute(userId, chapterId);
  }

  /**
   * Get chapter evaluation statistics
   */
  async getChapterStats(chapterId: string): Promise<ChapterEvaluationStatsDto> {
    const cacheKey = `chapter_stats_${chapterId}`;
    const cached = this.getFromCache(cacheKey) as ChapterEvaluationStatsDto | null;

    if (cached) {
      return cached;
    }

    const stats = await this.getChapterEvaluationStatsUseCase.execute(chapterId);

    this.setCache(cacheKey, stats);

    return stats;
  }

  /**
   * Get approval engine statistics
   */
  async getEngineStats(): Promise<ApprovalEngineStats> {
    const cacheKey = 'engine_stats';
    const cached = this.getFromCache(cacheKey) as ApprovalEngineStats | null;

    if (cached) {
      return cached;
    }

    this.logger.log('Calculating approval engine statistics');

    // TODO: Implement actual stats calculation
    const stats: ApprovalEngineStats = {
      totalEvaluations: 0,
      approvalRate: 0,
      averageAttempts: 0,
      chapterStats: {},
    };

    this.setCache(cacheKey, stats);

    return stats;
  }

  /**
   * Get user approval summary
   */
  async getUserApprovalSummary(userId: string): Promise<UserApprovalSummary> {
    this.logger.log(`Getting approval summary for user: ${userId}`);

    const history = await this.getUserEvaluationHistory({
      userId,
      limit: 100, // Get recent evaluations
    });

    const approvedEvaluations = history.evaluations.filter(
      evaluation => evaluation.status === EvaluationStatus.APPROVED,
    );

    const chaptersCompleted = [
      ...new Set(approvedEvaluations.map(evaluation => evaluation.chapterId)),
    ];

    const totalScore = history.evaluations.reduce((sum, evaluation) => sum + evaluation.score, 0);
    const averageScore =
      history.evaluations.length > 0 ? totalScore / history.evaluations.length : 0;

    // Calculate current streak (consecutive approvals)
    let currentStreak = 0;
    for (const evaluation of history.evaluations) {
      if (evaluation.status === EvaluationStatus.APPROVED) {
        currentStreak++;
      } else {
        break;
      }
    }

    return {
      userId,
      totalEvaluations: history.evaluations.length,
      approvedEvaluations: approvedEvaluations.length,
      approvalRate:
        history.evaluations.length > 0
          ? (approvedEvaluations.length / history.evaluations.length) * 100
          : 0,
      averageScore,
      chaptersCompleted,
      currentStreak,
      lastEvaluation: history.evaluations[0] || undefined,
    };
  }

  /**
   * Check if user can attempt a chapter
   */
  async canUserAttemptChapter(
    userId: string,
    chapterId: string,
  ): Promise<{
    canAttempt: boolean;
    reason?: string;
    attemptsRemaining?: number;
    nextAttemptAllowed?: Date;
  }> {
    const latestEvaluation = await this.getLatestEvaluation(userId, chapterId);

    if (!latestEvaluation) {
      return { canAttempt: true };
    }

    if (latestEvaluation.status === EvaluationStatus.APPROVED) {
      return {
        canAttempt: false,
        reason: 'Chapter already approved',
      };
    }

    const rules = await this.getRules(chapterId);
    if (rules.length === 0) {
      return { canAttempt: true };
    }

    const rule = rules[0];
    const attemptsRemaining = rule.maxAttempts - latestEvaluation.attemptNumber;

    if (attemptsRemaining <= 0) {
      return {
        canAttempt: false,
        reason: 'Maximum attempts exceeded',
        attemptsRemaining: 0,
      };
    }

    return {
      canAttempt: true,
      attemptsRemaining,
    };
  }

  /**
   * Record performance metrics
   */
  private async recordPerformanceMetrics(
    userId: string,
    chapterId: string,
    processingTime: number,
  ): Promise<void> {
    try {
      const speedMetric = ApprovalMetrics.createSpeedMetric(userId, chapterId, processingTime);
      await this.approvalMetricsRepository.create(speedMetric);
    } catch (error) {
      this.logger.warn(
        `Failed to record performance metrics: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Utility methods for caching
   */
  private getFromCache(key: string): unknown {
    const cached = this.performanceCache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  private setCache(key: string, data: unknown): void {
    this.performanceCache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  private clearCache(): void {
    this.performanceCache.clear();
  }

  /**
   * Utility method to chunk array for batch processing
   */
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }
}
