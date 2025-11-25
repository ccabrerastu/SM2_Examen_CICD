import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Check,
} from 'typeorm';
import { User } from './user.entity';
import { Chapter } from './chapter.entity';
import { UserProgress } from './user-progress.entity';

export enum SessionType {
  PRACTICE = 'practice',
  REVIEW = 'review',
  CHALLENGE = 'challenge',
}

export enum RepetitionStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  ABANDONED = 'abandoned',
}

@Entity('chapter_repetitions')
@Check('repetition_score >= 0 AND repetition_score <= 100')
@Check("session_type IN ('practice', 'review', 'challenge')")
@Check("status IN ('active', 'completed', 'abandoned')")
export class ChapterRepetition {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @Column({ name: 'chapter_id', type: 'uuid' })
  chapterId!: string;

  @Column({ name: 'original_progress_id', type: 'uuid' })
  originalProgressId!: string;

  @Column({
    name: 'repetition_score',
    type: 'integer',
    nullable: true,
  })
  repetitionScore!: number;

  @Column({
    name: 'session_type',
    type: 'varchar',
    length: 20,
    default: SessionType.PRACTICE,
  })
  sessionType!: SessionType;

  @Column({
    name: 'status',
    type: 'varchar',
    length: 20,
    default: RepetitionStatus.ACTIVE,
  })
  status!: RepetitionStatus;

  @Column({
    name: 'exercise_results',
    type: 'jsonb',
    default: {},
  })
  exerciseResults!: Record<string, any>;

  @Column({
    name: 'started_at',
    type: 'timestamp with time zone',
    default: () => 'NOW()',
  })
  startedAt!: Date;

  @Column({
    name: 'completed_at',
    type: 'timestamp with time zone',
    nullable: true,
  })
  completedAt!: Date;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp with time zone',
  })
  createdAt!: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp with time zone',
  })
  updatedAt!: Date;

  // Relaciones
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @ManyToOne(() => Chapter, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'chapter_id' })
  chapter!: Chapter;

  @ManyToOne(() => UserProgress, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'original_progress_id' })
  originalProgress!: UserProgress;

  // Métodos de negocio
  markAsCompleted(score: number, exerciseResults?: Record<string, any>): void {
    this.status = RepetitionStatus.COMPLETED;
    this.repetitionScore = score;
    this.completedAt = new Date();
    if (exerciseResults) {
      this.exerciseResults = exerciseResults;
    }
  }

  markAsAbandoned(): void {
    this.status = RepetitionStatus.ABANDONED;
  }

  isActive(): boolean {
    return this.status === RepetitionStatus.ACTIVE;
  }

  isCompleted(): boolean {
    return this.status === RepetitionStatus.COMPLETED;
  }

  getImprovementRate(originalScore: number): number {
    if (!this.repetitionScore || !originalScore) {
      return 0;
    }
    return ((this.repetitionScore - originalScore) / originalScore) * 100;
  }

  getDurationInMinutes(): number {
    if (!this.completedAt) {
      return 0;
    }
    const diffMs = this.completedAt.getTime() - this.startedAt.getTime();
    return Math.round(diffMs / (1000 * 60));
  }

  updateExerciseResults(results: Record<string, any>): void {
    this.exerciseResults = { ...this.exerciseResults, ...results };
  }
}
