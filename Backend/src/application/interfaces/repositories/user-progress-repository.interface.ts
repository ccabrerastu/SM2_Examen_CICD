import { UserProgress } from '../../../domain/entities/user-progress.entity';
import { CreateProgressDto } from '../../dtos/progress/create-progress.dto';
import { UpdateProgressDto } from '../../dtos/progress/update-progress.dto';

export interface IUserProgressRepository {
  create(userId: string, createProgressDto: CreateProgressDto): Promise<UserProgress>;
  findById(id: string): Promise<UserProgress | null>;
  findByUserId(userId: string): Promise<UserProgress[]>;
  findByUserAndChapter(userId: string, chapterId: string): Promise<UserProgress | null>;
  update(id: string, updateProgressDto: UpdateProgressDto): Promise<UserProgress>;
  createOrUpdate(userId: string, createProgressDto: CreateProgressDto): Promise<UserProgress>;
  delete(id: string): Promise<void>;
  getUserStats(userId: string): Promise<{ totalRecords: number; lastActivity: Date | null }>;
}
