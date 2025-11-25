import {
  ChapterRepetition,
  RepetitionStatus,
  SessionType,
} from '../../../domain/entities/chapter-repetition.entity';

export interface CreateRepetitionData {
  userId: string;
  chapterId: string;
  originalProgressId: string;
  sessionType?: SessionType;
}

export interface UpdateRepetitionData {
  repetitionScore?: number;
  status?: RepetitionStatus;
  exerciseResults?: Record<string, any>;
  completedAt?: Date;
}

export interface RepetitionFilters {
  userId?: string;
  chapterId?: string;
  status?: RepetitionStatus;
  sessionType?: SessionType;
  limit?: number;
  offset?: number;
}

export interface RepetitionStats {
  totalRepetitions: number;
  completedRepetitions: number;
  averageScore: number;
  lastRepetitionDate: Date | null;
  improvementRate: number;
}

export interface IChapterRepetitionRepository {
  create(data: CreateRepetitionData): Promise<ChapterRepetition>;
  findById(id: string): Promise<ChapterRepetition | null>;
  findByUserId(userId: string, filters?: RepetitionFilters): Promise<ChapterRepetition[]>;
  findByUserAndChapter(
    userId: string,
    chapterId: string,
    filters?: RepetitionFilters,
  ): Promise<ChapterRepetition[]>;
  findActiveRepetition(userId: string, chapterId: string): Promise<ChapterRepetition | null>;
  update(id: string, data: UpdateRepetitionData): Promise<ChapterRepetition>;
  markAsCompleted(
    id: string,
    score: number,
    exerciseResults?: Record<string, any>,
  ): Promise<ChapterRepetition>;
  markAsAbandoned(id: string): Promise<ChapterRepetition>;
  delete(id: string): Promise<void>;
  getRepetitionStats(userId: string, chapterId?: string): Promise<RepetitionStats>;
  countRepetitionsByChapter(userId: string): Promise<Record<string, number>>;
  findRecentRepetitions(userId: string, limit?: number): Promise<ChapterRepetition[]>;
}
