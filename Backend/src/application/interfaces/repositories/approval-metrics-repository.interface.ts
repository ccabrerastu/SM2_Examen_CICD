import { ApprovalMetrics } from '../../../domain/entities/approval-metrics.entity';

export interface IApprovalMetricsRepository {
  create(metrics: Partial<ApprovalMetrics>): Promise<ApprovalMetrics>;
  findById(id: string): Promise<ApprovalMetrics | null>;
  findByUserId(userId: string): Promise<ApprovalMetrics[]>;
  findByUserAndChapter(userId: string, chapterId: string): Promise<ApprovalMetrics[]>;
  findByMetricType(metricType: string): Promise<ApprovalMetrics[]>;
  findByUserChapterAndType(
    userId: string,
    chapterId: string,
    metricType: string,
  ): Promise<ApprovalMetrics[]>;
  findRecentMetrics(userId: string, daysBack: number): Promise<ApprovalMetrics[]>;
  update(id: string, updateData: Partial<ApprovalMetrics>): Promise<ApprovalMetrics>;
  delete(id: string): Promise<void>;
  getAverageMetricValue(chapterId: string, metricType: string): Promise<number>;
  getUserMetricsSummary(userId: string): Promise<{
    totalMetrics: number;
    averageAccuracy: number;
    averageSpeed: number;
    totalAttempts: number;
  }>;
  getChapterMetricsSummary(chapterId: string): Promise<{
    totalUsers: number;
    averageAccuracy: number;
    averageSpeed: number;
    averageAttempts: number;
  }>;
  createBulkMetrics(metrics: Partial<ApprovalMetrics>[]): Promise<ApprovalMetrics[]>;
}
