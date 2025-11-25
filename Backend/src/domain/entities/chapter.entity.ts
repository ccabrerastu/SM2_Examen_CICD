import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { VocabularyItem } from './vocabulary-item.entity';
import { UserProgress } from './user-progress.entity';
import { ChapterLevel } from '../enums/chapter-level.enum';

@Entity('chapters')
@Index(['order'], { unique: true })
@Index(['level', 'order'])
export class Chapter {
  @PrimaryGeneratedColumn('uuid')
  readonly id!: string;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({
    type: 'enum',
    enum: ChapterLevel,
    default: ChapterLevel.BASIC,
  })
  level!: ChapterLevel;

  @Column({ type: 'int' })
  order!: number;

  @Column({ type: 'boolean', default: false })
  isUnlocked!: boolean;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  imageUrl!: string | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata!: Record<string, unknown> | null;

  // Relations
  @OneToMany(() => VocabularyItem, vocabularyItem => vocabularyItem.chapter, {
    cascade: true,
  })
  vocabularyItems!: VocabularyItem[];

  @OneToMany(() => UserProgress, userProgress => userProgress.chapter)
  userProgresses!: UserProgress[];

  @CreateDateColumn({ type: 'timestamptz' })
  readonly createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  readonly updatedAt!: Date;

  // Business methods
  canBeUnlocked(previousChapterCompleted: boolean): boolean {
    return this.order === 1 || previousChapterCompleted;
  }

  getDisplayLevel(): string {
    const levelNames = {
      [ChapterLevel.BASIC]: 'Basic',
      [ChapterLevel.INTERMEDIATE]: 'Intermediate',
      [ChapterLevel.ADVANCED]: 'Advanced',
    };
    return levelNames[this.level];
  }

  isFirstChapter(): boolean {
    return this.order === 1;
  }
}
