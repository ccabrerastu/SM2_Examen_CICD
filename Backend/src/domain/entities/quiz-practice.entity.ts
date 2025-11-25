import { Entity, Column, OneToOne, JoinColumn, PrimaryGeneratedColumn } from 'typeorm';
import { PracticeSession, PracticeType } from './practice-session.entity';

@Entity('quiz_practices')
export class QuizPractice {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @OneToOne(() => PracticeSession, { cascade: true })
  @JoinColumn({ name: 'practice_session_id' })
  practiceSession!: PracticeSession;

  @Column({ name: 'total_questions', type: 'int', default: 0 })
  totalQuestions!: number;

  @Column({ name: 'questions_answered', type: 'int', default: 0 })
  questionsAnswered!: number;

  @Column({ name: 'correct_answers', type: 'int', default: 0 })
  correctAnswers!: number;

  @Column({ name: 'wrong_answers', type: 'int', default: 0 })
  wrongAnswers!: number;

  @Column({ name: 'last_question_index', type: 'int', default: 0 })
  lastQuestionIndex!: number;

  @Column({
    name: 'average_time_per_question',
    type: 'decimal',
    precision: 8,
    scale: 2,
    nullable: true,
  })
  averageTimePerQuestion?: number;

  @Column({ name: 'quiz_category', type: 'varchar', length: 100, nullable: true })
  quizCategory?: string;

  @Column({ name: 'difficulty_level', type: 'varchar', length: 50, nullable: true })
  difficultyLevel?: string;

  @Column({ name: 'time_per_question', type: 'json', nullable: true })
  timePerQuestion?: number[];

  @Column({ name: 'question_results', type: 'json', nullable: true })
  questionResults?: Array<{
    questionIndex: number;
    isCorrect: boolean;
    timeSpent: number;
    selectedAnswer?: string | undefined;
  }>;

  // Business methods
  getAccuracyPercentage(): number {
    if (this.questionsAnswered === 0) {
      return 0;
    }
    return Math.round((this.correctAnswers / this.questionsAnswered) * 100);
  }

  getCompletionPercentage(): number {
    if (this.totalQuestions === 0) {
      return 0;
    }
    return Math.round((this.questionsAnswered / this.totalQuestions) * 100);
  }

  answerQuestion(
    questionIndex: number,
    isCorrect: boolean,
    timeSpent: number,
    selectedAnswer?: string,
  ): void {
    this.questionsAnswered++;
    this.lastQuestionIndex = questionIndex;

    if (isCorrect) {
      this.correctAnswers++;
    } else {
      this.wrongAnswers++;
    }

    // Update time tracking
    if (!this.timePerQuestion) {
      this.timePerQuestion = [];
    }
    this.timePerQuestion.push(timeSpent);

    // Update question results
    if (!this.questionResults) {
      this.questionResults = [];
    }
    this.questionResults.push({
      questionIndex,
      isCorrect,
      timeSpent,
      selectedAnswer,
    });

    // Calculate average time
    this.averageTimePerQuestion =
      this.timePerQuestion.reduce((a, b) => a + b, 0) / this.timePerQuestion.length;

    // Update practice session score
    this.practiceSession.score = this.getAccuracyPercentage();
  }

  isCompleted(): boolean {
    return this.questionsAnswered >= this.totalQuestions;
  }

  getFastestQuestionTime(): number {
    if (!this.timePerQuestion || this.timePerQuestion.length === 0) {
      return 0;
    }
    return Math.min(...this.timePerQuestion);
  }

  getSlowestQuestionTime(): number {
    if (!this.timePerQuestion || this.timePerQuestion.length === 0) {
      return 0;
    }
    return Math.max(...this.timePerQuestion);
  }

  static createForSession(
    practiceSession: PracticeSession,
    category: string,
    difficultyLevel: string,
    totalQuestions: number,
  ): QuizPractice {
    const quizPractice = new QuizPractice();
    quizPractice.practiceSession = practiceSession;
    quizPractice.practiceSession.practiceType = PracticeType.QUIZ;
    quizPractice.quizCategory = category;
    quizPractice.difficultyLevel = difficultyLevel;
    quizPractice.totalQuestions = totalQuestions;
    quizPractice.practiceSession.maxScore = 100; // Quiz score is percentage-based
    return quizPractice;
  }
}
