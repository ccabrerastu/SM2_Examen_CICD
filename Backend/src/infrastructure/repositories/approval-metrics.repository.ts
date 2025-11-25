import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ApprovalMetrics } from '../../domain/entities/approval-metrics.entity';
import { IApprovalMetricsRepository } from '../../application/interfaces/repositories/approval-metrics-repository.interface';

@Injectable()
export class ApprovalMetricsRepository implements IApprovalMetricsRepository {
  constructor(
    @InjectRepository(ApprovalMetrics)
    private readonly repository: Repository<ApprovalMetrics>,
  ) {}

  async create(metrics: Partial<ApprovalMetrics>): Promise<ApprovalMetrics> {
    const metricsEntity = this.repository.create({
      ...metrics,
      recordedAt: metrics.recordedAt || new Date(),
    });
    return await this.repository.save(metricsEntity);
  }

  async findById(id: string): Promise<ApprovalMetrics | null> {
    return await this.repository.findOne({
      where: { id },
      relations: ['user'],
    });
  }

  async findByUserId(userId: string): Promise<ApprovalMetrics[]> {
    return await this.repository.find({
      where: { userId },
      order: { recordedAt: 'DESC' },
    });
  }

  async findByUserAndChapter(userId: string, chapterId: string): Promise<ApprovalMetrics[]> {
    return await this.repository.find({
      where: { userId, chapterId },
      order: { recordedAt: 'DESC' },
    });
  }

  async findByMetricType(metricType: string): Promise<ApprovalMetrics[]> {
    return await this.repository.find({
      where: { metricType },
      order: { recordedAt: 'DESC' },
    });
  }

  async findByUserChapterAndType(
    userId: string,
    chapterId: string,
    metricType: string,
  ): Promise<ApprovalMetrics[]> {
    return await this.repository.find({
      where: { userId, chapterId, metricType },
      order: { recordedAt: 'DESC' },
    });
  }

  async findRecentMetrics(userId: string, daysBack: number): Promise<ApprovalMetrics[]> {
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - daysBack);

    return await this.repository
      .createQueryBuilder('metrics')
      .where('metrics.userId = :userId', { userId })
      .andWhere('metrics.recordedAt >= :dateThreshold', { dateThreshold })
      .orderBy('metrics.recordedAt', 'DESC')
      .getMany();
  }

  async update(id: string, updateData: Partial<ApprovalMetrics>): Promise<ApprovalMetrics> {
    const existing = await this.repository.findOne({ where: { id } });
    if (!existing) {
      throw new Error('Approval metrics not found');
    }

    const updated = this.repository.merge(existing, updateData);
    return await this.repository.save(updated);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async getAverageMetricValue(chapterId: string, metricType: string): Promise<number> {
    const result = await this.repository
      .createQueryBuilder('metrics')
      .select('AVG(metrics.value)', 'average')
      .where('metrics.chapterId = :chapterId', { chapterId })
      .andWhere('metrics.metricType = :metricType', { metricType })
      .getRawOne();

    return result?.average ? parseFloat(result.average) : 0;
  }

  async getUserMetricsSummary(userId: string): Promise<{
    totalMetrics: number;
    averageAccuracy: number;
    averageSpeed: number;
    totalAttempts: number;
  }> {
    const metrics = await this.findByUserId(userId);

    const accuracyMetrics = metrics.filter(m => m.metricType === 'accuracy');
    const speedMetrics = metrics.filter(m => m.metricType === 'speed');
    const attemptMetrics = metrics.filter(m => m.metricType === 'attempts');

    const averageAccuracy =
      accuracyMetrics.length > 0
        ? accuracyMetrics.reduce((sum, m) => sum + m.value, 0) / accuracyMetrics.length
        : 0;

    const averageSpeed =
      speedMetrics.length > 0
        ? speedMetrics.reduce((sum, m) => sum + m.value, 0) / speedMetrics.length
        : 0;

    const totalAttempts = attemptMetrics.reduce((sum, m) => sum + m.value, 0);

    return {
      totalMetrics: metrics.length,
      averageAccuracy: Math.round(averageAccuracy * 100) / 100,
      averageSpeed: Math.round(averageSpeed * 100) / 100,
      totalAttempts,
    };
  }

  async getChapterMetricsSummary(chapterId: string): Promise<{
    totalUsers: number;
    averageAccuracy: number;
    averageSpeed: number;
    averageAttempts: number;
  }> {
    const metrics = await this.repository.find({
      where: { chapterId },
    });

    const uniqueUsers = new Set(metrics.map(m => m.userId));
    const accuracyMetrics = metrics.filter(m => m.metricType === 'accuracy');
    const speedMetrics = metrics.filter(m => m.metricType === 'speed');
    const attemptMetrics = metrics.filter(m => m.metricType === 'attempts');

    const averageAccuracy =
      accuracyMetrics.length > 0
        ? accuracyMetrics.reduce((sum, m) => sum + m.value, 0) / accuracyMetrics.length
        : 0;

    const averageSpeed =
      speedMetrics.length > 0
        ? speedMetrics.reduce((sum, m) => sum + m.value, 0) / speedMetrics.length
        : 0;

    const averageAttempts =
      attemptMetrics.length > 0
        ? attemptMetrics.reduce((sum, m) => sum + m.value, 0) / attemptMetrics.length
        : 0;

    return {
      totalUsers: uniqueUsers.size,
      averageAccuracy: Math.round(averageAccuracy * 100) / 100,
      averageSpeed: Math.round(averageSpeed * 100) / 100,
      averageAttempts: Math.round(averageAttempts * 100) / 100,
    };
  }

  async createBulkMetrics(metrics: Partial<ApprovalMetrics>[]): Promise<ApprovalMetrics[]> {
    const entities = metrics.map(metric =>
      this.repository.create({
        ...metric,
        recordedAt: metric.recordedAt || new Date(),
      }),
    );

    return await this.repository.save(entities);
  }
}
