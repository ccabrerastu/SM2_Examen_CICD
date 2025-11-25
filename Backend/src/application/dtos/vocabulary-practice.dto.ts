import { IsOptional, IsNumber, IsString, Min, IsBoolean, IsEnum } from 'class-validator';
import {
  CreatePracticeSessionDto,
  UpdatePracticeSessionDto,
  PracticeSessionResponseDto,
} from './practice-session.dto';
import { VocabularyDifficulty } from '../../domain/entities/vocabulary-item.entity';

export class CreateVocabularyPracticeDto extends CreatePracticeSessionDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  wordsStudied?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  wordsLearned?: number;

  @IsOptional()
  @IsString()
  difficultyLevel?: string;
}

export class UpdateVocabularyPracticeDto extends UpdatePracticeSessionDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  wordsStudied?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  wordsLearned?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  correctAnswers?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  totalAttempts?: number;

  @IsOptional()
  @IsString()
  lastWordStudied?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  wordsReviewed?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  streakCount?: number;

  @IsOptional()
  @IsString()
  difficultyLevel?: string;
}

export class WordStudiedDto {
  @IsString()
  word!: string;

  @IsOptional()
  @IsString()
  definition?: string;

  @IsOptional()
  @IsString()
  context?: string;

  @IsOptional()
  isCorrect?: boolean;
}

export class StudyWordDto {
  @IsString()
  wordId!: string;

  @IsNumber()
  @Min(0)
  timeSpentSeconds!: number;

  @IsOptional()
  @IsString()
  word?: string;

  @IsOptional()
  isCorrect?: boolean;
}

export class ReviewWordDto {
  @IsString()
  wordId!: string;

  @IsString()
  userAnswer!: string;

  @IsString()
  correctAnswer!: string;

  @IsNumber()
  @Min(0)
  timeSpentSeconds!: number;

  @IsOptional()
  isCorrect?: boolean;
}

export class GetVocabularySessionsDto {
  @IsString()
  @IsOptional()
  chapterId?: string;

  @IsBoolean()
  @IsOptional()
  completed?: boolean;

  @IsEnum(VocabularyDifficulty)
  @IsOptional()
  difficultyLevel?: VocabularyDifficulty;

  @IsNumber()
  @IsOptional()
  @Min(1)
  limit?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  offset?: number;
}

export class VocabularyPracticeResponseDto extends PracticeSessionResponseDto {
  wordsStudied!: number;
  wordsLearned!: number;
  correctAnswers!: number;
  totalAttempts!: number;
  lastWordStudied?: string;
  wordsReviewed!: number;
  streakCount!: number;
  difficultyLevel?: string;
  accuracyPercentage!: number;
  learningRate!: number;

  constructor(partial: Partial<VocabularyPracticeResponseDto>) {
    super(partial);
    Object.assign(this, partial);
  }
}

export class VocabularyStatsDto {
  totalWordsStudied!: number;
  totalWordsLearned!: number;
  averageAccuracy!: number;
  currentStreak!: number;
  longestStreak!: number;
  totalPracticeSessions!: number;
  averageWordsPerSession!: number;
  difficultyDistribution!: {
    [key: string]: number;
  };
  recentWords!: Array<{
    word: string;
    studiedAt: Date;
    isLearned: boolean;
  }>;

  constructor(partial: Partial<VocabularyStatsDto>) {
    Object.assign(this, partial);
  }
}
