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
import { Chapter } from './chapter.entity';

export enum PracticeType {
  VOCABULARY = 'vocabulary',
  QUIZ = 'quiz',
  READING = 'reading',
  INTERVIEW = 'interview',
}

export enum PracticeStatus {
  STARTED = 'started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  ABANDONED = 'abandoned',
}

@Entity('practice_sessions')
@Index(['userId', 'practiceType'])
@Index(['chapterId', 'practiceType'])
@Index(['createdAt'])
export class PracticeSession {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id', type: 'uuid' })
  @Index()
  userId!: string;

  @Column({ name: 'chapter_id', type: 'uuid', nullable: true })
  chapterId?: string;

  @ManyToOne(() => Chapter, { nullable: true })
  @JoinColumn({ name: 'chapter_id' })
  chapter?: Chapter;

  @Column({
    name: 'practice_type',
    type: 'enum',
    enum: PracticeType,
  })
  practiceType!: PracticeType;

  @Column({
    name: 'status',
    type: 'enum',
    enum: PracticeStatus,
    default: PracticeStatus.STARTED,
  })
  status!: PracticeStatus;

  @Column({ name: 'score', type: 'decimal', precision: 5, scale: 2, default: 0 })
  score!: number;

  @Column({ name: 'progress', type: 'decimal', precision: 5, scale: 2, default: 0 })
  progress!: number;

  @Column({ name: 'max_score', type: 'decimal', precision: 5, scale: 2, nullable: true })
  maxScore?: number;

  @Column({ name: 'started_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  startedAt!: Date;

  @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
  completedAt?: Date;

  @Column({ name: 'duration_seconds', type: 'int', nullable: true })
  durationSeconds?: number;

  @Column({ name: 'time_spent_seconds', type: 'int', default: 0 })
  timeSpentSeconds!: number;

  @Column({ name: 'extra_data', type: 'json', nullable: true })
  extraData?: Record<string, unknown>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  // Business methods
  isCompleted(): boolean {
    return this.status === PracticeStatus.COMPLETED;
  }

  isInProgress(): boolean {
    return this.status === PracticeStatus.IN_PROGRESS || this.status === PracticeStatus.STARTED;
  }

  getScorePercentage(): number {
    if (!this.maxScore || this.maxScore === 0) {
      return 0;
    }
    return Math.round((this.score / this.maxScore) * 100);
  }

  getDurationMinutes(): number {
    if (!this.durationSeconds) {
      return 0;
    }
    return Math.round(this.durationSeconds / 60);
  }

  markAsCompleted(score?: number): void {
    this.status = PracticeStatus.COMPLETED;
    this.completedAt = new Date();

    if (score !== undefined) {
      this.score = score;
    }

    if (this.startedAt && !this.durationSeconds) {
      this.durationSeconds = Math.floor(
        (this.completedAt.getTime() - this.startedAt.getTime()) / 1000,
      );
    }
  }

  markAsAbandoned(): void {
    this.status = PracticeStatus.ABANDONED;
    this.completedAt = new Date();

    if (this.startedAt && !this.durationSeconds) {
      this.durationSeconds = Math.floor(
        (this.completedAt.getTime() - this.startedAt.getTime()) / 1000,
      );
    }
  }

  updateProgress(score: number, progress?: number, extraData?: Record<string, unknown>): void {
    this.score = score;
    if (progress !== undefined) {
      this.progress = progress;
    }
    this.status = PracticeStatus.IN_PROGRESS;

    if (extraData) {
      this.extraData = { ...this.extraData, ...extraData };
    }
  }

  getPracticeTypeDisplayName(): string {
    const typeNames = {
      [PracticeType.VOCABULARY]: 'Vocabulary Practice',
      [PracticeType.QUIZ]: 'Quiz Practice',
      [PracticeType.READING]: 'Reading Practice',
      [PracticeType.INTERVIEW]: 'Interview Practice',
    };
    return typeNames[this.practiceType];
  }
}
