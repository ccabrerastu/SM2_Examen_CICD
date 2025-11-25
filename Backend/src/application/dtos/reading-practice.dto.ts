import { IsOptional, IsNumber, IsString, Min, IsBoolean, IsDate, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import {
  CreatePracticeSessionDto,
  UpdatePracticeSessionDto,
  PracticeSessionResponseDto,
} from './practice-session.dto';
import { VocabularyDifficulty } from '../../domain/entities/vocabulary-item.entity';

export class CreateReadingPracticeDto extends CreatePracticeSessionDto {
  @IsOptional()
  @IsString()
  textId?: string;

  @IsOptional()
  @IsString()
  textTitle?: string;

  @IsNumber()
  @Min(1)
  totalWords!: number;

  @IsOptional()
  @IsEnum(VocabularyDifficulty)
  difficultyLevel?: VocabularyDifficulty;

  @IsOptional()
  @IsString()
  textCategory?: string;
}

export class UpdateReadingPracticeDto extends UpdatePracticeSessionDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  wordsRead?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  readingSpeedWpm?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  comprehensionQuestionsTotal?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  comprehensionQuestionsCorrect?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  readingTimeSeconds?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  lastPosition?: number;

  @IsOptional()
  @IsEnum(VocabularyDifficulty)
  difficultyLevel?: VocabularyDifficulty;

  @IsOptional()
  @IsString()
  textCategory?: string;
}

export class BookmarkDto {
  @IsNumber()
  @Min(0)
  position!: number;

  @IsOptional()
  @IsString()
  note?: string;

  @Type(() => Date)
  @IsDate()
  timestamp!: Date;
}

export class VocabularyWordDto {
  @IsString()
  word!: string;

  @IsOptional()
  @IsString()
  definition?: string;

  @IsString()
  context!: string;

  @IsNumber()
  @Min(0)
  position!: number;
}

export class UpdateReadingProgressDto {
  @IsNumber()
  @Min(0)
  wordsRead!: number;

  @IsNumber()
  @Min(0)
  timeSpentSeconds!: number;
}

export class AnswerComprehensionQuestionDto {
  @IsBoolean()
  isCorrect!: boolean;
}

export class AddBookmarkDto {
  @IsNumber()
  @Min(0)
  position!: number;

  @IsOptional()
  @IsString()
  note?: string;
}

export class AddVocabularyWordDto {
  @IsString()
  word!: string;

  @IsString()
  context!: string;

  @IsNumber()
  @Min(0)
  position!: number;

  @IsOptional()
  @IsString()
  definition?: string;
}

export class AddVocabularyDto {
  @IsString()
  word!: string;

  @IsString()
  definition!: string;

  @IsString()
  context!: string;

  @IsNumber()
  @Min(0)
  position!: number;
}

export class GetReadingSessionsDto {
  @IsString()
  @IsOptional()
  chapterId?: string;

  @IsString()
  @IsOptional()
  textCategory?: string;

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

export class ReadingPracticeResponseDto extends PracticeSessionResponseDto {
  textId?: string;
  textTitle?: string;
  totalWords!: number;
  wordsRead!: number;
  readingSpeedWpm?: number;
  comprehensionQuestionsTotal!: number;
  comprehensionQuestionsCorrect!: number;
  readingTimeSeconds!: number;
  difficultyLevel?: string;
  textCategory?: string;
  lastPosition!: number;
  readingProgress!: number;
  comprehensionScore!: number;
  estimatedTimeToComplete!: number;
  bookmarks?: BookmarkDto[];
  vocabularyEncountered?: VocabularyWordDto[];

  constructor(partial: Partial<ReadingPracticeResponseDto>) {
    super(partial);
    Object.assign(this, partial);
  }
}

export class ReadingStatsDto {
  totalTextsRead!: number;
  totalWordsRead!: number;
  averageReadingSpeed!: number;
  averageComprehensionScore!: number;
  totalReadingTime!: number; // in seconds
  favoriteCategories!: Array<{
    category: string;
    textsRead: number;
    averageScore: number;
  }>;
  difficultyProgress!: {
    [difficulty: string]: {
      textsRead: number;
      averageSpeed: number;
      averageComprehension: number;
    };
  };
  vocabularyDiscovered!: number;
  bookmarksCreated!: number;
  recentReadings!: Array<{
    id: string;
    textTitle?: string;
    category?: string;
    wordsRead: number;
    comprehensionScore: number;
    readAt: Date;
  }>;

  constructor(partial: Partial<ReadingStatsDto>) {
    Object.assign(this, partial);
  }
}
