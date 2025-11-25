import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { InterviewTopic } from './interview-topic.entity';

export enum QuestionCategory {
  CONCEPTUAL = 'conceptual',        // Theoretical questions (e.g., "What is JavaScript?")
  EXPERIENCE = 'experience',         // Experience-based questions (e.g., "Have you managed a team?")
  DECISION = 'decision',             // Situation-based questions (e.g., "What would you do if...?")
  BEHAVIORAL = 'behavioral',         // Behavioral questions (STAR method)
}

export enum QuestionDifficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
}

@Entity('interview_questions')
export class InterviewQuestion {
  @PrimaryGeneratedColumn('uuid')
  readonly id!: string;

  @ManyToOne(() => InterviewTopic, topic => topic.questions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'topic_id' })
  topic!: InterviewTopic;

  @Column({ name: 'topic_id', type: 'uuid' })
  topicId!: string;

  @Column({ type: 'text' })
  question!: string; // The interview question in English

  @Column({
    type: 'enum',
    enum: QuestionCategory,
    default: QuestionCategory.CONCEPTUAL,
  })
  category!: QuestionCategory;

  @Column({
    type: 'enum',
    enum: QuestionDifficulty,
    default: QuestionDifficulty.MEDIUM,
  })
  difficulty!: QuestionDifficulty;

  @Column({ type: 'text', nullable: true })
  context?: string; // Additional context for the question

  @Column({ name: 'sample_answers', type: 'json', nullable: true })
  sampleAnswers?: string[]; // Array of sample answers for guidance

  @Column({ type: 'json', nullable: true })
  keywords?: string[]; // Keywords to evaluate in the answer

  @Column({ name: 'evaluation_criteria', type: 'json', nullable: true })
  evaluationCriteria?: {
    fluency: number;        // Weight for fluency (0-100)
    grammar: number;        // Weight for grammar (0-100)
    vocabulary: number;     // Weight for vocabulary (0-100)
    pronunciation: number;  // Weight for pronunciation (0-100)
    coherence: number;      // Weight for coherence (0-100)
  };

  @Column({ name: 'minimum_answer_length', type: 'int', default: 60 })
  minimumAnswerLength!: number; // Minimum characters expected

  @Column({ name: 'recommended_time_seconds', type: 'int', default: 120 })
  recommendedTimeSeconds!: number; // Recommended time to answer (in seconds)

  @Column({ type: 'int', default: 0 })
  order!: number; // Order in the interview sequence

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ type: 'text', nullable: true })
  hints?: string; // Hints for struggling candidates

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  // Business methods
  getCategoryLabel(): string {
    const labels: Record<QuestionCategory, string> = {
      [QuestionCategory.CONCEPTUAL]: 'Conceptual',
      [QuestionCategory.EXPERIENCE]: 'Experience',
      [QuestionCategory.DECISION]: 'Decision Making',
      [QuestionCategory.BEHAVIORAL]: 'Behavioral',
    };
    return labels[this.category];
  }

  isAnswerLengthSufficient(answerLength: number): boolean {
    return answerLength >= this.minimumAnswerLength;
  }

  getDefaultEvaluationCriteria(): Record<string, number> {
    return this.evaluationCriteria || {
      fluency: 25,
      grammar: 20,
      vocabulary: 20,
      pronunciation: 20,
      coherence: 15,
    };
  }

  static createQuestion(
    topicId: string,
    question: string,
    category: QuestionCategory,
    difficulty: QuestionDifficulty,
    sampleAnswers?: string[],
  ): InterviewQuestion {
    const interviewQuestion = new InterviewQuestion();
    interviewQuestion.topicId = topicId;
    interviewQuestion.question = question;
    interviewQuestion.category = category;
    interviewQuestion.difficulty = difficulty;
    interviewQuestion.sampleAnswers = sampleAnswers || [];
    interviewQuestion.isActive = true;
    interviewQuestion.order = 0;
    interviewQuestion.minimumAnswerLength = 60;
    interviewQuestion.recommendedTimeSeconds = 120;
    return interviewQuestion;
  }
}
