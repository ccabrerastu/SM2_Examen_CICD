import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('approval_rules')
@Index(['chapterId'], { unique: false })
@Index(['isActive'])
export class ApprovalRule {
  @PrimaryGeneratedColumn('uuid')
  readonly id!: string;

  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'uuid', nullable: true })
  chapterId!: string | null;

  @Column({ type: 'numeric', precision: 5, scale: 2 })
  minScoreThreshold!: number;

  @Column({ type: 'int', default: 1 })
  maxAttempts!: number;

  @Column({ type: 'boolean', default: false })
  allowErrorCarryover!: boolean;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ type: 'jsonb', nullable: true })
  metadata!: Record<string, unknown> | null;

  @CreateDateColumn({ type: 'timestamptz' })
  readonly createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  readonly updatedAt!: Date;

  // Business methods
  isApplicableToChapter(chapterId: string): boolean {
    return this.chapterId === null || this.chapterId === chapterId;
  }

  isScoreApproved(score: number): boolean {
    return score >= this.minScoreThreshold;
  }

  hasSpecialRequirements(): boolean {
    return this.metadata !== null && Object.keys(this.metadata).length > 0;
  }

  getThresholdPercentage(): number {
    return this.minScoreThreshold;
  }

  canRetryAfterFailure(currentAttempts: number): boolean {
    return currentAttempts < this.maxAttempts;
  }
}
