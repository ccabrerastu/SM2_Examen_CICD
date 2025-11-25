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
import { ReadingContent } from './reading-content.entity';

@Entity('quiz_questions')
@Index(['readingContentId'])
@Index(['order'])
export class QuizQuestion {
  @PrimaryGeneratedColumn('uuid')
  readonly id!: string;

  @Column({ type: 'uuid' })
  readingContentId!: string;

  @Column({ type: 'text' })
  questionText!: string;

  @Column({ type: 'jsonb' })
  options!: string[]; // Array of 4 options

  @Column({ type: 'int' })
  correctAnswer!: number; // Index 0-3

  @Column({ type: 'text' })
  hint!: string;

  @Column({ type: 'text', nullable: true })
  explanation!: string | null;

  @Column({ type: 'int' })
  order!: number; // 1-10

  // Relations
  @ManyToOne(() => ReadingContent, content => content.quizQuestions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'readingContentId' })
  readingContent!: ReadingContent;

  @CreateDateColumn({ type: 'timestamptz' })
  readonly createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  readonly updatedAt!: Date;

  // Business methods
  isCorrectAnswer(answerIndex: number): boolean {
    return answerIndex === this.correctAnswer;
  }

  getCorrectAnswerText(): string {
    return this.options[this.correctAnswer] || '';
  }

  hasExplanation(): boolean {
    return !!this.explanation;
  }

  hasHint(): boolean {
    return !!this.hint;
  }
}
