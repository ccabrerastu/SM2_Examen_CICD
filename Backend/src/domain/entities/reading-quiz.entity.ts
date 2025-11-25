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

export enum QuestionType {
  MULTIPLE_CHOICE = 'multiple_choice',
  TRUE_FALSE = 'true_false',
}

@Entity('reading_quizzes')
@Index(['readingContentId'])
export class ReadingQuiz {
  @PrimaryGeneratedColumn('uuid')
  readonly id!: string;

  @Column({ type: 'uuid' })
  readingContentId!: string;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'int', default: 0 })
  totalQuestions!: number;

  @Column({ type: 'int', default: 0 })
  passingScore!: number;

  @Column({ type: 'jsonb', default: [] })
  questions!: ReadingQuizQuestion[];

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ type: 'int', default: 0 })
  timeLimit!: number; // en segundos, 0 significa sin límite

  // Relations
  @ManyToOne(() => ReadingContent, content => content.readingQuizzes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'readingContentId' })
  readingContent!: ReadingContent;

  @CreateDateColumn({ type: 'timestamptz' })
  readonly createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  readonly updatedAt!: Date;

  // Business methods
  calculateScore(answers: number[]): number {
    if (!this.questions || this.questions.length === 0) return 0;

    let correctAnswers = 0;
    for (let i = 0; i < answers.length && i < this.questions.length; i++) {
      if (this.questions[i].isCorrectAnswer(answers[i])) {
        correctAnswers++;
      }
    }

    return Math.round((correctAnswers / this.questions.length) * 100);
  }

  isPassed(score: number): boolean {
    return score >= this.passingScore;
  }
}

// Estructura para las preguntas dentro del quiz
export interface ReadingQuizQuestion {
  id: string;
  questionText: string;
  questionType: QuestionType;
  options: string[];
  correctAnswer: number | boolean; // índice para opción múltiple, true/false para verdadero/falso
  explanation?: string;
  points: number;

  // Método para verificar si la respuesta es correcta
  isCorrectAnswer(answer: number | boolean): boolean;
}

// Implementación para preguntas de opción múltiple
export class MultipleChoiceQuestion implements ReadingQuizQuestion {
  id!: string;
  questionText!: string;
  questionType: QuestionType = QuestionType.MULTIPLE_CHOICE;
  options!: string[];
  correctAnswer!: number;
  explanation?: string;
  points!: number;

  constructor(data: Partial<MultipleChoiceQuestion>) {
    Object.assign(this, data);
  }

  isCorrectAnswer(answer: number): boolean {
    return answer === this.correctAnswer;
  }
}

// Implementación para preguntas de verdadero/falso
export class TrueFalseQuestion implements ReadingQuizQuestion {
  id!: string;
  questionText!: string;
  questionType: QuestionType = QuestionType.TRUE_FALSE;
  options: string[] = ['Verdadero', 'Falso'];
  correctAnswer!: boolean;
  explanation?: string;
  points!: number;

  constructor(data: Partial<TrueFalseQuestion>) {
    Object.assign(this, data);
  }

  isCorrectAnswer(answer: boolean): boolean {
    return answer === this.correctAnswer;
  }
}
