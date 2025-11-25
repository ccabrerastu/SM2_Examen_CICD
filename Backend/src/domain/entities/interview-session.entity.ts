import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { InterviewTopic } from './interview-topic.entity';

export enum InterviewStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  ABANDONED = 'abandoned',
}

export interface AnswerEvaluation {
  questionId: string;
  questionText: string;
  answerText: string;
  answerLength: number;
  submittedAt: Date;

  // AI Evaluation Scores (0-100) - PLACEHOLDER for future AI integration
  fluencyScore?: number;
  grammarScore?: number;
  vocabularyScore?: number;
  pronunciationScore?: number;
  coherenceScore?: number;
  overallQuestionScore?: number;

  // AI Feedback - PLACEHOLDER for future AI integration
  aiFeedback?: string;
  detectedIssues?: string[];
  suggestedImprovements?: string[];

  // Metadata
  timeSpentSeconds?: number;
  attemptNumber?: number;
}

@Entity('interview_sessions')
export class InterviewSession {
  @PrimaryGeneratedColumn('uuid')
  readonly id!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @ManyToOne(() => InterviewTopic, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'topic_id' })
  topic!: InterviewTopic;

  @Column({ name: 'topic_id', type: 'uuid' })
  topicId!: string;

  @Column({
    type: 'enum',
    enum: InterviewStatus,
    default: InterviewStatus.NOT_STARTED,
  })
  status!: InterviewStatus;

  @Column({ name: 'total_questions', type: 'int', default: 0 })
  totalQuestions!: number;

  @Column({ name: 'questions_answered', type: 'int', default: 0 })
  questionsAnswered!: number;

  @Column({ name: 'current_question_index', type: 'int', default: 0 })
  currentQuestionIndex!: number;

  @Column({ type: 'json', nullable: true })
  answers!: AnswerEvaluation[]; // Array of answers with evaluations

  @Column({ name: 'overall_score', type: 'numeric', precision: 5, scale: 2, default: 0 })
  overallScore!: number; // Final score (0-100)

  @Column({ name: 'fluency_score', type: 'numeric', precision: 5, scale: 2, default: 0 })
  fluencyScore!: number;

  @Column({ name: 'grammar_score', type: 'numeric', precision: 5, scale: 2, default: 0 })
  grammarScore!: number;

  @Column({ name: 'vocabulary_score', type: 'numeric', precision: 5, scale: 2, default: 0 })
  vocabularyScore!: number;

  @Column({ name: 'pronunciation_score', type: 'numeric', precision: 5, scale: 2, default: 0 })
  pronunciationScore!: number;

  @Column({ name: 'coherence_score', type: 'numeric', precision: 5, scale: 2, default: 0 })
  coherenceScore!: number;

  @Column({ name: 'final_feedback', type: 'text', nullable: true })
  finalFeedback?: string; // Overall feedback for the interview

  @Column({ type: 'json', nullable: true })
  strengths?: string[]; // Identified strengths

  @Column({ name: 'areas_for_improvement', type: 'json', nullable: true })
  areasForImprovement?: string[]; // Areas needing improvement

  @Column({ name: 'total_time_spent_seconds', type: 'int', nullable: true })
  totalTimeSpentSeconds?: number; // Total time spent in the interview

  @Column({ name: 'started_at', type: 'timestamptz', nullable: true })
  startedAt?: Date;

  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
  completedAt?: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  // Business methods
  start(totalQuestions: number): void {
    this.status = InterviewStatus.IN_PROGRESS;
    this.totalQuestions = totalQuestions;
    this.startedAt = new Date();
    this.currentQuestionIndex = 0;
    this.answers = [];
  }

  submitAnswer(answer: AnswerEvaluation): void {
    if (!this.answers) {
      this.answers = [];
    }

    this.answers.push(answer);
    this.questionsAnswered++;

    // Update current question index
    if (this.currentQuestionIndex < this.totalQuestions - 1) {
      this.currentQuestionIndex++;
    }

    // Check if interview is complete
    if (this.questionsAnswered >= this.totalQuestions) {
      this.complete();
    }
  }

  complete(): void {
    this.status = InterviewStatus.COMPLETED;
    this.completedAt = new Date();
    this.calculateFinalScores();
    this.generateFeedback();
  }

  abandon(): void {
    this.status = InterviewStatus.ABANDONED;
    this.completedAt = new Date();
  }

  calculateFinalScores(): void {
    if (!this.answers || this.answers.length === 0) {
      this.overallScore = 0;
      return;
    }

    let totalFluency = 0;
    let totalGrammar = 0;
    let totalVocabulary = 0;
    let totalPronunciation = 0;
    let totalCoherence = 0;
    let count = 0;

    for (const answer of this.answers) {
      if (answer.overallQuestionScore !== undefined) {
        totalFluency += answer.fluencyScore || 0;
        totalGrammar += answer.grammarScore || 0;
        totalVocabulary += answer.vocabularyScore || 0;
        totalPronunciation += answer.pronunciationScore || 0;
        totalCoherence += answer.coherenceScore || 0;
        count++;
      }
    }

    if (count > 0) {
      this.fluencyScore = totalFluency / count;
      this.grammarScore = totalGrammar / count;
      this.vocabularyScore = totalVocabulary / count;
      this.pronunciationScore = totalPronunciation / count;
      this.coherenceScore = totalCoherence / count;

      // Overall score is weighted average
      this.overallScore = (
        this.fluencyScore * 0.25 +
        this.grammarScore * 0.20 +
        this.vocabularyScore * 0.20 +
        this.pronunciationScore * 0.20 +
        this.coherenceScore * 0.15
      );
    }
  }

  generateFeedback(): void {
    const score = this.overallScore;

    // Generate feedback based on score range
    if (score >= 90) {
      this.finalFeedback = 'Excellent interview! Your English communication skills are outstanding.';
    } else if (score >= 80) {
      this.finalFeedback = 'Great job! Your English level is very good, keep practicing.';
    } else if (score >= 70) {
      this.finalFeedback = 'Good performance! You can still improve your communication skills.';
    } else if (score >= 60) {
      this.finalFeedback = 'Decent effort. Focus on improving grammar and vocabulary.';
    } else {
      this.finalFeedback = 'Keep practicing! Consider reviewing basic grammar and common phrases.';
    }
  }

  getCompletionPercentage(): number {
    if (this.totalQuestions === 0) return 0;
    return Math.round((this.questionsAnswered / this.totalQuestions) * 100);
  }

  isCompleted(): boolean {
    return this.status === InterviewStatus.COMPLETED;
  }

  isInProgress(): boolean {
    return this.status === InterviewStatus.IN_PROGRESS;
  }

  getTotalTimeSpent(): number {
    if (!this.startedAt) return 0;

    const endTime = this.completedAt || new Date();
    return Math.floor((endTime.getTime() - this.startedAt.getTime()) / 1000);
  }

  static createSession(userId: string, topicId: string): InterviewSession {
    const session = new InterviewSession();
    session.userId = userId;
    session.topicId = topicId;
    session.status = InterviewStatus.NOT_STARTED;
    session.totalQuestions = 0;
    session.questionsAnswered = 0;
    session.currentQuestionIndex = 0;
    session.overallScore = 0;
    return session;
  }
}
