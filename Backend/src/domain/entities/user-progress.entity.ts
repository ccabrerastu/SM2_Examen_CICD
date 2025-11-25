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
import { Chapter } from './chapter.entity';
import { ReadingChapter } from './reading-chapter.entity';

@Entity('user_progress')
@Index(['userId'], { unique: false })
@Index(['chapterId'], { unique: false })
@Index(['readingChapterId'], { unique: false })
@Index(['chapterCompleted'])
export class UserProgress {
  @PrimaryGeneratedColumn('uuid')
  readonly id!: string;

  @Column({ type: 'uuid' })
  userId!: string;

  @Column({ type: 'uuid', nullable: true })
  chapterId!: string | null;

  @Column({ type: 'uuid', nullable: true })
  readingChapterId!: string | null;

  @Column({ type: 'numeric', precision: 10, scale: 2, nullable: true })
  score!: number | null;

  @Column({ type: 'timestamptz' })
  lastActivity!: Date;

  @Column({ type: 'boolean', default: false })
  chapterCompleted!: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  chapterCompletionDate!: Date | null;

  @Column({ type: 'int', default: 0 })
  vocabularyItemsLearned!: number;

  @Column({ type: 'int', default: 0 })
  totalVocabularyItems!: number;

  @Column({ type: 'jsonb', nullable: true })
  extraData!: Record<string, unknown> | null;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @ManyToOne(() => Chapter, { eager: false, nullable: true })
  @JoinColumn({ name: 'chapterId' })
  chapter!: Chapter | null;

  @ManyToOne(() => ReadingChapter, { eager: false, nullable: true })
  @JoinColumn({ name: 'readingChapterId' })
  readingChapter!: ReadingChapter | null;

  @CreateDateColumn({ type: 'timestamptz' })
  readonly createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  readonly updatedAt!: Date;

  // Business methods
  getProgressPercentage(): number {
    if (this.totalVocabularyItems === 0) return 0;
    return Math.round((this.vocabularyItemsLearned / this.totalVocabularyItems) * 100);
  }

  markChapterCompleted(): void {
    this.chapterCompleted = true;
    this.chapterCompletionDate = new Date();
  }

  incrementVocabularyLearned(): void {
    this.vocabularyItemsLearned++;
    this.lastActivity = new Date();
  }

  isChapterInProgress(): boolean {
    return this.vocabularyItemsLearned > 0 && !this.chapterCompleted;
  }

  canCompleteChapter(): boolean {
    return this.vocabularyItemsLearned >= this.totalVocabularyItems && !this.chapterCompleted;
  }
}
