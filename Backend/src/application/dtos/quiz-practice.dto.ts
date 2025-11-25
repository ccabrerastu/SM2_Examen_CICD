import { IsOptional, IsNumber, IsString, Min, IsBoolean, IsEnum } from 'class-validator';
import {
  CreatePracticeSessionDto,
  UpdatePracticeSessionDto,
  PracticeSessionResponseDto,
} from './practice-session.dto';
import { VocabularyDifficulty } from '../../domain/entities/vocabulary-item.entity';

export class CreateQuizPracticeDto extends CreatePracticeSessionDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  totalQuestions?: number;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsEnum(VocabularyDifficulty)
  difficultyLevel?: VocabularyDifficulty;
}

export class UpdateQuizPracticeDto extends UpdatePracticeSessionDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  questionsAnswered?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  correctAnswers?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  wrongAnswers?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  lastQuestionIndex?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  averageTimePerQuestion?: number;

  @IsOptional()
  @IsString()
  quizCategory?: string;

  @IsOptional()
  @IsString()
  difficultyLevel?: string;
}

export class QuestionResultDto {
  @IsNumber()
  @Min(0)
  questionIndex!: number;

  @IsBoolean()
  isCorrect!: boolean;

  @IsNumber()
  @Min(0)
  timeSpent!: number;

  @IsOptional()
  @IsString()
  selectedAnswer?: string;
}

export class AnswerQuizQuestionDto {
  @IsString()
  questionId!: string;

  @IsString()
  selectedAnswer!: string;

  @IsString()
  correctAnswer!: string;

  @IsNumber()
  @Min(0)
  timeSpentSeconds!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  questionIndex?: number;

  @IsOptional()
  @IsBoolean()
  isCorrect?: boolean;
}

export class GetQuizSessionsDto {
  @IsString()
  @IsOptional()
  chapterId?: string;

  @IsString()
  @IsOptional()
  category?: string;

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

export class QuizPracticeResponseDto extends PracticeSessionResponseDto {
  totalQuestions!: number;
  questionsAnswered!: number;
  correctAnswers!: number;
  wrongAnswers!: number;
  lastQuestionIndex!: number;
  averageTimePerQuestion?: number;
  quizCategory?: string;
  difficultyLevel?: string;
  accuracyPercentage!: number;
  completionPercentage!: number;
  timePerQuestion?: number[];
  questionResults?: QuestionResultDto[];

  constructor(partial: Partial<QuizPracticeResponseDto>) {
    super(partial);
    Object.assign(this, partial);
  }
}

export class QuizStatsDto {
  totalQuizzes!: number;
  totalQuestionsAnswered!: number;
  averageAccuracy!: number;
  averageCompletionTime!: number;
  fastestQuizTime!: number;
  bestAccuracy!: number;
  categoryPerformance!: {
    [category: string]: {
      totalQuizzes: number;
      averageAccuracy: number;
      averageTime: number;
    };
  };
  difficultyPerformance!: {
    [difficulty: string]: {
      totalQuizzes: number;
      averageAccuracy: number;
      averageTime: number;
    };
  };
  recentQuizzes!: Array<{
    id: string;
    category?: string;
    difficulty?: string;
    accuracy: number;
    completedAt: Date;
  }>;

  constructor(partial: Partial<QuizStatsDto>) {
    Object.assign(this, partial);
  }
}
