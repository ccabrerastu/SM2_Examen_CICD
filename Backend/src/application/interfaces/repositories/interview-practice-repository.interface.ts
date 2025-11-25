import {
  InterviewPractice,
  InterviewType,
} from '../../../domain/entities/interview-practice.entity';

export interface IInterviewPracticeRepository {
  create(interviewPractice: InterviewPractice): Promise<InterviewPractice>;
  findById(id: string): Promise<InterviewPractice | null>;
  findByPracticeSessionId(practiceSessionId: string): Promise<InterviewPractice | null>;
  findByUserId(userId: string, limit?: number, offset?: number): Promise<InterviewPractice[]>;
  findByUserIdAndType(
    userId: string,
    interviewType: InterviewType,
    limit?: number,
    offset?: number,
  ): Promise<InterviewPractice[]>;
  update(id: string, updates: Partial<InterviewPractice>): Promise<InterviewPractice>;
  delete(id: string): Promise<void>;
  getStatsByUserId(userId: string): Promise<{
    totalSessions: number;
    totalQuestionsAnswered: number;
    averageFluencyScore: number;
    averagePronunciationScore: number;
    averageGrammarScore: number;
    averageVocabularyScore: number;
    averageResponseTime: number;
    interviewTypesCompleted: InterviewType[];
    areasForImprovement: string[];
    strengthsIdentified: string[];
  }>;
}
