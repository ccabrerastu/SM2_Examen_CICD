import { Entity, Column, OneToOne, JoinColumn, PrimaryGeneratedColumn } from 'typeorm';
import { PracticeSession, PracticeType } from './practice-session.entity';

export enum InterviewType {
  JOB_INTERVIEW = 'job_interview',
  CASUAL_CONVERSATION = 'casual_conversation',
  BUSINESS_MEETING = 'business_meeting',
  ACADEMIC_INTERVIEW = 'academic_interview',
  PHONE_INTERVIEW = 'phone_interview',
}

export enum ResponseQuality {
  EXCELLENT = 'excellent',
  GOOD = 'good',
  FAIR = 'fair',
  POOR = 'poor',
}

@Entity('interview_practices')
export class InterviewPractice {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @OneToOne(() => PracticeSession, { cascade: true })
  @JoinColumn({ name: 'practice_session_id' })
  practiceSession!: PracticeSession;

  @Column({
    name: 'interview_type',
    type: 'enum',
    enum: InterviewType,
    default: InterviewType.CASUAL_CONVERSATION,
  })
  interviewType!: InterviewType;

  @Column({ name: 'total_questions', type: 'int', default: 0 })
  totalQuestions!: number;

  @Column({ name: 'questions_answered', type: 'int', default: 0 })
  questionsAnswered!: number;

  @Column({
    name: 'average_response_time',
    type: 'decimal',
    precision: 8,
    scale: 2,
    nullable: true,
  })
  averageResponseTime?: number;

  @Column({ name: 'fluency_score', type: 'decimal', precision: 5, scale: 2, default: 0 })
  fluencyScore!: number;

  @Column({ name: 'pronunciation_score', type: 'decimal', precision: 5, scale: 2, default: 0 })
  pronunciationScore!: number;

  @Column({ name: 'grammar_score', type: 'decimal', precision: 5, scale: 2, default: 0 })
  grammarScore!: number;

  @Column({ name: 'vocabulary_score', type: 'decimal', precision: 5, scale: 2, default: 0 })
  vocabularyScore!: number;

  @Column({ name: 'confidence_level', type: 'varchar', length: 50, nullable: true })
  confidenceLevel?: string;

  @Column({ name: 'last_question_answered', type: 'text', nullable: true })
  lastQuestionAnswered?: string;

  @Column({ name: 'conversation_flow', type: 'json', nullable: true })
  conversationFlow?: Array<{
    questionIndex: number;
    question: string;
    userResponse: string;
    responseTime: number;
    aiEvaluation?:
      | {
          fluency: number;
          pronunciation: number;
          grammar: number;
          vocabulary: number;
          overall: ResponseQuality;
          feedback: string;
        }
      | undefined;
    timestamp: Date;
  }>;

  @Column({ name: 'areas_for_improvement', type: 'json', nullable: true })
  areasForImprovement?: string[];

  @Column({ name: 'strengths_identified', type: 'json', nullable: true })
  strengthsIdentified?: string[];

  // Business methods
  getOverallScore(): number {
    const scores = [
      this.fluencyScore,
      this.pronunciationScore,
      this.grammarScore,
      this.vocabularyScore,
    ];
    const validScores = scores.filter(score => score > 0);

    if (validScores.length === 0) {
      return 0;
    }

    return Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length);
  }

  getCompletionPercentage(): number {
    if (this.totalQuestions === 0) {
      return 0;
    }
    return Math.round((this.questionsAnswered / this.totalQuestions) * 100);
  }

  answerQuestion(
    questionIndex: number,
    question: string,
    userResponse: string,
    responseTime: number,
    evaluation?: {
      fluency: number;
      pronunciation: number;
      grammar: number;
      vocabulary: number;
      overall: ResponseQuality;
      feedback: string;
    },
  ): void {
    this.questionsAnswered++;
    this.lastQuestionAnswered = question;

    // Update conversation flow
    if (!this.conversationFlow) {
      this.conversationFlow = [];
    }

    this.conversationFlow.push({
      questionIndex,
      question,
      userResponse,
      responseTime,
      aiEvaluation: evaluation,
      timestamp: new Date(),
    });

    // Update average response time
    const responseTimes = this.conversationFlow.map(item => item.responseTime);
    this.averageResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;

    // Update scores if evaluation is provided
    if (evaluation) {
      this.updateScores(evaluation);
    }

    // Update practice session progress and score
    this.practiceSession.progress = this.getCompletionPercentage();
    this.practiceSession.score = this.getOverallScore();
  }

  private updateScores(evaluation: {
    fluency: number;
    pronunciation: number;
    grammar: number;
    vocabulary: number;
  }): void {
    // Calculate weighted average of all responses
    const totalResponses = this.questionsAnswered;
    const weight = 1 / totalResponses;
    const previousWeight = (totalResponses - 1) / totalResponses;

    this.fluencyScore = this.fluencyScore * previousWeight + evaluation.fluency * weight;
    this.pronunciationScore =
      this.pronunciationScore * previousWeight + evaluation.pronunciation * weight;
    this.grammarScore = this.grammarScore * previousWeight + evaluation.grammar * weight;
    this.vocabularyScore = this.vocabularyScore * previousWeight + evaluation.vocabulary * weight;
  }

  addAreaForImprovement(area: string): void {
    if (!this.areasForImprovement) {
      this.areasForImprovement = [];
    }
    if (!this.areasForImprovement.includes(area)) {
      this.areasForImprovement.push(area);
    }
  }

  addStrength(strength: string): void {
    if (!this.strengthsIdentified) {
      this.strengthsIdentified = [];
    }
    if (!this.strengthsIdentified.includes(strength)) {
      this.strengthsIdentified.push(strength);
    }
  }

  isCompleted(): boolean {
    return this.questionsAnswered >= this.totalQuestions;
  }

  getPerformanceSummary(): {
    overallScore: number;
    breakdown: {
      fluency: number;
      pronunciation: number;
      grammar: number;
      vocabulary: number;
    };
    completion: number;
    averageResponseTime: number;
    strengths: string[];
    improvements: string[];
  } {
    return {
      overallScore: this.getOverallScore(),
      breakdown: {
        fluency: Math.round(this.fluencyScore),
        pronunciation: Math.round(this.pronunciationScore),
        grammar: Math.round(this.grammarScore),
        vocabulary: Math.round(this.vocabularyScore),
      },
      completion: this.getCompletionPercentage(),
      averageResponseTime: this.averageResponseTime || 0,
      strengths: this.strengthsIdentified || [],
      improvements: this.areasForImprovement || [],
    };
  }

  static createForSession(
    practiceSession: PracticeSession,
    interviewType: InterviewType,
    totalQuestions: number,
  ): InterviewPractice {
    const interviewPractice = new InterviewPractice();
    interviewPractice.practiceSession = practiceSession;
    interviewPractice.practiceSession.practiceType = PracticeType.INTERVIEW;
    interviewPractice.interviewType = interviewType;
    interviewPractice.totalQuestions = totalQuestions;
    interviewPractice.practiceSession.maxScore = 100; // Interview score is percentage-based
    return interviewPractice;
  }
}
