import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { ReadingChapter } from './reading-chapter.entity';
import { QuizQuestion } from './quiz-question.entity';
import { ReadingQuiz } from './reading-quiz.entity';

export interface HighlightedWord {
  word: string;
  definition: string;
  page: number;
}

@Entity('reading_contents')
@Index(['readingChapterId'])
export class ReadingContent {
  @PrimaryGeneratedColumn('uuid')
  readonly id!: string;

  @Column({ type: 'uuid' })
  readingChapterId!: string;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'jsonb' })
  content!: string[]; // Array of 3 pages (strings)

  @Column({ type: 'jsonb' })
  highlightedWords!: HighlightedWord[];

  @Column({ type: 'int', default: 3 })
  totalPages!: number;

  @Column({ type: 'int', nullable: true })
  estimatedReadingTime!: number | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  topic!: string | null;

  @Column({
    type: 'enum',
    enum: ['BASIC', 'INTERMEDIATE', 'ADVANCED'],
    default: 'BASIC',
  })
  level!: string;

  // Relations
  @ManyToOne(() => ReadingChapter, chapter => chapter.readingContents, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'readingChapterId' })
  readingChapter!: ReadingChapter;

  @OneToMany(() => QuizQuestion, question => question.readingContent, {
    cascade: true,
  })
  quizQuestions!: QuizQuestion[];

  @OneToMany(() => ReadingQuiz, quiz => quiz.readingContent, {
    cascade: true,
  })
  readingQuizzes!: ReadingQuiz[];

  @CreateDateColumn({ type: 'timestamptz' })
  readonly createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  readonly updatedAt!: Date;

  // Business methods
  getPageContent(pageNumber: number): string | null {
    if (pageNumber < 1 || pageNumber > this.totalPages) {
      return null;
    }
    return this.content[pageNumber - 1] || null;
  }

  getHighlightedWordsForPage(pageNumber: number): HighlightedWord[] {
    return this.highlightedWords.filter(hw => hw.page === pageNumber);
  }

  getAllHighlightedWords(): HighlightedWord[] {
    return this.highlightedWords;
  }
}
