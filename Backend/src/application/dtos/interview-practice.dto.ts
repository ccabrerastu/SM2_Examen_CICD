import {
  IsOptional,
  IsNumber,
  IsString,
  Min,
  Max,
  IsArray,
  ValidateNested,
  IsEnum,
  IsDate,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  CreatePracticeSessionDto,
  UpdatePracticeSessionDto,
  PracticeSessionResponseDto,
} from './practice-session.dto';
import { InterviewType, ResponseQuality } from '../../domain/entities/interview-practice.entity';

export class CreateInterviewPracticeDto extends CreatePracticeSessionDto {
  @IsEnum(InterviewType)
  interviewType!: InterviewType;

  @IsNumber()
  @Min(1)
  totalQuestions!: number;
}

export class UpdateInterviewPracticeDto extends UpdatePracticeSessionDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  questionsAnswered?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  averageResponseTime?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  fluencyScore?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  pronunciationScore?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  grammarScore?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  vocabularyScore?: number;

  @IsOptional()
  @IsString()
  confidenceLevel?: string;

  @IsOptional()
  @IsString()
  lastQuestionAnswered?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  areasForImprovement?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  strengthsIdentified?: string[];
}

export class AIEvaluationDto {
  @IsNumber()
  @Min(0)
  @Max(100)
  fluency!: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  pronunciation!: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  grammar!: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  vocabulary!: number;

  @IsEnum(ResponseQuality)
  overall!: ResponseQuality;

  @IsString()
  feedback!: string;
}

export class ConversationFlowDto {
  @IsNumber()
  @Min(0)
  questionIndex!: number;

  @IsString()
  question!: string;

  @IsString()
  userResponse!: string;

  @IsNumber()
  @Min(0)
  responseTime!: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => AIEvaluationDto)
  aiEvaluation?: AIEvaluationDto;

  @Type(() => Date)
  @IsDate()
  timestamp!: Date;
}

export class AnswerInterviewQuestionDto {
  @IsNumber()
  @Min(0)
  questionIndex!: number;

  @IsString()
  question!: string;

  @IsString()
  userResponse!: string;

  @IsNumber()
  @Min(0)
  responseTime!: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => AIEvaluationDto)
  evaluation?: AIEvaluationDto;
}

export class AddAreaForImprovementDto {
  @IsString()
  area!: string;
}

export class AddStrengthDto {
  @IsString()
  strength!: string;
}

export class AnswerQuestionDto {
  @IsString()
  questionId!: string;

  @IsString()
  responseText!: string;

  @IsNumber()
  @Min(0)
  responseTimeSeconds!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  fluencyScore?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  pronunciationScore?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  grammarScore?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  vocabularyScore?: number;

  @IsOptional()
  @IsEnum(ResponseQuality)
  responseQuality?: ResponseQuality;
}

export class UpdateConversationFlowDto {
  @IsString()
  questionId!: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  followUpQuestions?: string[];

  @IsOptional()
  @IsString()
  contextNotes?: string;
}

export class GetInterviewSessionsDto {
  @IsString()
  @IsOptional()
  chapterId?: string;

  @IsEnum(InterviewType)
  @IsOptional()
  interviewType?: InterviewType;

  @IsBoolean()
  @IsOptional()
  completed?: boolean;

  @IsNumber()
  @IsOptional()
  @Min(1)
  limit?: number;

  @IsNumber()
  @IsOptional()
  @Min(0)
  offset?: number;
}

export class PerformanceSummaryDto {
  @IsNumber()
  @Min(0)
  @Max(100)
  overallScore!: number;

  @ValidateNested()
  @Type(() => Object)
  breakdown!: {
    fluency: number;
    pronunciation: number;
    grammar: number;
    vocabulary: number;
  };

  @IsNumber()
  @Min(0)
  @Max(100)
  completion!: number;

  @IsNumber()
  @Min(0)
  averageResponseTime!: number;

  @IsArray()
  @IsString({ each: true })
  strengths!: string[];

  @IsArray()
  @IsString({ each: true })
  improvements!: string[];
}

export class InterviewPracticeResponseDto extends PracticeSessionResponseDto {
  interviewType!: InterviewType;
  totalQuestions!: number;
  questionsAnswered!: number;
  averageResponseTime?: number;
  fluencyScore!: number;
  pronunciationScore!: number;
  grammarScore!: number;
  vocabularyScore!: number;
  confidenceLevel?: string;
  lastQuestionAnswered?: string;
  overallScore!: number;
  completionPercentage!: number;
  conversationFlow?: ConversationFlowDto[];
  areasForImprovement?: string[];
  strengthsIdentified?: string[];
  performanceSummary!: PerformanceSummaryDto;

  constructor(partial: Partial<InterviewPracticeResponseDto>) {
    super(partial);
    Object.assign(this, partial);
  }
}

export class InterviewStatsDto {
  totalInterviews!: number;
  averageOverallScore!: number;
  averageResponseTime!: number;
  interviewTypePerformance!: {
    [type in InterviewType]: {
      totalInterviews: number;
      averageScore: number;
      averageResponseTime: number;
      skillBreakdown: {
        fluency: number;
        pronunciation: number;
        grammar: number;
        vocabulary: number;
      };
    };
  };
  skillProgression!: {
    fluency: Array<{ date: Date; score: number }>;
    pronunciation: Array<{ date: Date; score: number }>;
    grammar: Array<{ date: Date; score: number }>;
    vocabulary: Array<{ date: Date; score: number }>;
  };
  commonStrengths!: Array<{ strength: string; frequency: number }>;
  commonImprovements!: Array<{ area: string; frequency: number }>;
  recentInterviews!: Array<{
    id: string;
    interviewType: InterviewType;
    overallScore: number;
    completedAt: Date;
  }>;

  constructor(partial: Partial<InterviewStatsDto>) {
    Object.assign(this, partial);
  }
}
