import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('approval_metrics')
@Index(['userId'], { unique: false })
@Index(['chapterId'], { unique: false })
@Index(['metricType'])
@Index(['recordedAt'])
@Index(['userId', 'chapterId', 'metricType'], { unique: false })
export class ApprovalMetrics {
  @PrimaryGeneratedColumn('uuid')
  readonly id!: string;

  @Column({ type: 'uuid' })
  userId!: string;

  @Column({ type: 'uuid' })
  chapterId!: string;

  @Column({ type: 'varchar', length: 100 })
  metricType!: string;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  value!: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  unit!: string | null;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'jsonb', nullable: true })
  additionalData!: Record<string, unknown> | null;

  @Column({ type: 'timestamptz' })
  recordedAt!: Date;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @CreateDateColumn({ type: 'timestamptz' })
  readonly createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  readonly updatedAt!: Date;

  // Business methods
  isPerformanceMetric(): boolean {
    return ['accuracy', 'speed', 'completion_rate'].includes(this.metricType);
  }

  isEngagementMetric(): boolean {
    return ['time_spent', 'attempts', 'retry_rate'].includes(this.metricType);
  }

  getFormattedValue(): string {
    if (this.unit) {
      return `${this.value} ${this.unit}`;
    }
    return this.value.toString();
  }

  isRecentMetric(daysThreshold: number = 7): boolean {
    const threshold = new Date();
    threshold.setDate(threshold.getDate() - daysThreshold);
    return this.recordedAt >= threshold;
  }

  updateValue(newValue: number, additionalData?: Record<string, unknown>): void {
    this.value = newValue;
    this.recordedAt = new Date();
    if (additionalData) {
      this.additionalData = { ...this.additionalData, ...additionalData };
    }
  }

  static createAccuracyMetric(
    userId: string,
    chapterId: string,
    accuracy: number,
  ): Partial<ApprovalMetrics> {
    return {
      userId,
      chapterId,
      metricType: 'accuracy',
      value: accuracy,
      unit: 'percentage',
      description: 'User accuracy percentage for chapter',
      recordedAt: new Date(),
    };
  }

  static createSpeedMetric(
    userId: string,
    chapterId: string,
    timeSpent: number,
  ): Partial<ApprovalMetrics> {
    return {
      userId,
      chapterId,
      metricType: 'speed',
      value: timeSpent,
      unit: 'seconds',
      description: 'Time spent completing chapter',
      recordedAt: new Date(),
    };
  }

  static createAttemptMetric(
    userId: string,
    chapterId: string,
    attempts: number,
  ): Partial<ApprovalMetrics> {
    return {
      userId,
      chapterId,
      metricType: 'attempts',
      value: attempts,
      unit: 'count',
      description: 'Number of attempts for chapter completion',
      recordedAt: new Date(),
    };
  }
}
