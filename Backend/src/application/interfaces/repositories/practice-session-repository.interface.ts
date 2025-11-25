import { PracticeSession, PracticeType } from '../../../domain/entities/practice-session.entity';

export interface IPracticeSessionRepository {
  create(practiceSession: PracticeSession): Promise<PracticeSession>;
  findById(id: string): Promise<PracticeSession | null>;
  findByUserId(userId: string, limit?: number, offset?: number): Promise<PracticeSession[]>;
  findByUserIdAndType(
    userId: string,
    practiceType: PracticeType,
    limit?: number,
    offset?: number,
  ): Promise<PracticeSession[]>;
  findByUserIdAndChapter(
    userId: string,
    chapterId: string,
    practiceType?: PracticeType,
  ): Promise<PracticeSession[]>;
  update(id: string, updates: Partial<PracticeSession>): Promise<PracticeSession>;
  delete(id: string): Promise<void>;
  findActiveSessionsByUser(userId: string): Promise<PracticeSession[]>;
  markAsCompleted(id: string, score: number): Promise<PracticeSession>;
  markAsAbandoned(id: string): Promise<PracticeSession>;
}
