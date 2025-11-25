import { DailyLives } from '../../../domain/entities/daily-lives.entity';

export interface IDailyLivesRepository {
  findByUserId(userId: string): Promise<DailyLives | null>;
  findByUserIdAndDate(userId: string, date: Date): Promise<DailyLives | null>;
  createOrUpdateForUser(userId: string): Promise<DailyLives>;
  consumeLife(userId: string): Promise<DailyLives | null>;
  resetDailyLives(userId: string): Promise<DailyLives | null>;
  resetAllUsersLives(): Promise<number>;
  exists(userId: string): Promise<boolean>;
}
