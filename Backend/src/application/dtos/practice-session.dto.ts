import { IsEnum, IsOptional, IsNumber, IsString, IsDate, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { PracticeType, PracticeStatus } from '../../domain/entities/practice-session.entity';

export class CreatePracticeSessionDto {
  @IsEnum(PracticeType)
  practiceType!: PracticeType;

  @IsString()
  userId!: string;

  @IsOptional()
  @IsString()
  chapterId?: string;

  @IsOptional()
  @IsString()
  episodeId?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  progress?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  score?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxScore?: number;

  @IsOptional()
  @IsEnum(PracticeStatus)
  status?: PracticeStatus;
}

export class UpdatePracticeSessionDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  progress?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  score?: number;

  @IsOptional()
  @IsEnum(PracticeStatus)
  status?: PracticeStatus;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endedAt?: Date;
}

export class PracticeSessionResponseDto {
  id!: string;
  practiceType!: PracticeType;
  userId!: string;
  chapterId?: string;
  episodeId?: string;
  progress!: number;
  score!: number;
  maxScore!: number;
  status!: PracticeStatus;
  startedAt!: Date;
  endedAt?: Date;
  createdAt!: Date;
  updatedAt!: Date;

  constructor(partial: Partial<PracticeSessionResponseDto>) {
    Object.assign(this, partial);
  }
}

export class PracticeSessionStatsDto {
  totalSessions!: number;
  completedSessions!: number;
  averageScore!: number;
  averageProgress!: number;
  totalTimeSpent!: number; // in seconds
  lastSessionDate?: Date;
  bestScore!: number;
  practiceType!: PracticeType;

  constructor(partial: Partial<PracticeSessionStatsDto>) {
    Object.assign(this, partial);
  }
}
