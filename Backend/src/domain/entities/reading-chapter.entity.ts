import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { ReadingContent } from './reading-content.entity';
import { ChapterLevel } from '../enums/chapter-level.enum';

@Entity('reading_chapters')
@Index(['order'], { unique: true })
@Index(['level'])
export class ReadingChapter {
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

  @Column({ type: 'int', unique: true })
  order!: number;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  imageUrl!: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  topic!: string | null; // e.g., "Programming", "Databases", "Cloud Computing"

  @Column({ type: 'jsonb', nullable: true })
  metadata!: Record<string, unknown> | null;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  // Relations
  @OneToMany(() => ReadingContent, content => content.readingChapter)
  readingContents!: ReadingContent[];

  @CreateDateColumn({ type: 'timestamptz' })
  readonly createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  readonly updatedAt!: Date;

  // Business methods
  getEstimatedReadingTime(): number {
    // Estimate based on metadata or default
    return (this.metadata?.estimatedMinutes as number) || 10;
  }

  getDifficultyLevel(): string {
    const levels = {
      [ChapterLevel.BASIC]: 'Beginner',
      [ChapterLevel.INTERMEDIATE]: 'Intermediate',
      [ChapterLevel.ADVANCED]: 'Advanced',
    };
    return levels[this.level];
  }
}
