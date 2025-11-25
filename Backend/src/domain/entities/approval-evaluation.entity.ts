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
import { ApprovalRule } from './approval-rule.entity';

export enum EvaluationStatus {
  APPROVED = 'approved',
  REJECTED = 'rejected',
  PENDING = 'pending',
}

@Entity('approval_evaluations')
@Index(['userId'], { unique: false })
@Index(['ruleId'], { unique: false })
@Index(['chapterId'], { unique: false })
@Index(['status'])
@Index(['evaluatedAt'])
@Index(['userId', 'chapterId', 'attemptNumber'], { unique: true })
export class ApprovalEvaluation {
  @PrimaryGeneratedColumn('uuid')
  readonly id!: string;

  @Column({ type: 'uuid' })
  userId!: string;

  @Column({ type: 'uuid' })
  ruleId!: string;

  @Column({ type: 'uuid' })
  chapterId!: string;

  @Column({ type: 'numeric', precision: 10, scale: 2 })
  score!: number;

  @Column({ type: 'numeric', precision: 5, scale: 2 })
  threshold!: number;

  @Column({
    type: 'enum',
    enum: EvaluationStatus,
    default: EvaluationStatus.PENDING,
  })
  status!: EvaluationStatus;

  @Column({ type: 'int', default: 1 })
  attemptNumber!: number;

  @Column({ type: 'int', default: 0 })
  errorsFromPreviousAttempts!: number;

  @Column({ type: 'text', nullable: true })
  feedback!: string | null;

  @Column({ type: 'jsonb', nullable: true })
  evaluationData!: Record<string, unknown> | null;

  @Column({ type: 'timestamptz' })
  evaluatedAt!: Date;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @ManyToOne(() => ApprovalRule, { eager: false })
  @JoinColumn({ name: 'ruleId' })
  rule!: ApprovalRule;

  @CreateDateColumn({ type: 'timestamptz' })
  readonly createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  readonly updatedAt!: Date;

  // Business methods
  isApproved(): boolean {
    return this.status === EvaluationStatus.APPROVED;
  }

  isRejected(): boolean {
    return this.status === EvaluationStatus.REJECTED;
  }

  isPending(): boolean {
    return this.status === EvaluationStatus.PENDING;
  }

  getAdjustedScore(): number {
    return Math.max(0, this.score - this.errorsFromPreviousAttempts);
  }

  approve(feedback?: string): void {
    this.status = EvaluationStatus.APPROVED;
    this.feedback = feedback || null;
    this.evaluatedAt = new Date();
  }

  reject(feedback?: string): void {
    this.status = EvaluationStatus.REJECTED;
    this.feedback = feedback || null;
    this.evaluatedAt = new Date();
  }

  hasErrorCarryover(): boolean {
    return this.errorsFromPreviousAttempts > 0;
  }

  getScoreWithPenalty(): number {
    return this.getAdjustedScore();
  }
}
