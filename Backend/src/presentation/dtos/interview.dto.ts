import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsNumber, IsObject, IsUUID } from 'class-validator';

export enum InterviewType {
  CONVERSATION = 'conversation',
  VOCABULARY = 'vocabulary',
  GRAMMAR = 'grammar',
  PRONUNCIATION = 'pronunciation',
  MIXED = 'mixed',
}

export enum MessageType {
  TEXT = 'text',
  AUDIO = 'audio',
  SYSTEM = 'system',
}

export enum CompletionReason {
  COMPLETED = 'completed',
  USER_TERMINATED = 'user_terminated',
  TIMEOUT = 'timeout',
  ERROR = 'error',
}

export class CreateInterviewSessionDto {
  @ApiProperty({ description: 'Chapter ID for the interview' })
  @IsUUID()
  chapterId!: string;

  @ApiProperty({ enum: InterviewType, description: 'Type of interview' })
  @IsEnum(InterviewType)
  interviewType!: InterviewType;

  @ApiProperty({ description: 'Session configuration', required: false })
  @IsOptional()
  @IsObject()
  sessionConfig?: {
    duration?: number;
    difficulty?: string;
    focusAreas?: string[];
    language?: string;
  };
}

export class ProcessMessageDto {
  @ApiProperty({ description: 'Message content' })
  @IsString()
  message!: string;

  @ApiProperty({ enum: MessageType, description: 'Type of message' })
  @IsEnum(MessageType)
  messageType!: MessageType;

  @ApiProperty({ description: 'Additional metadata', required: false })
  @IsOptional()
  @IsObject()
  metadata?: {
    audioUrl?: string;
    confidence?: number;
    timestamp?: Date;
    deviceInfo?: object;
  };
}

export class CompleteInterviewDto {
  @ApiProperty({ description: 'Final session score', required: false })
  @IsOptional()
  @IsNumber()
  finalScore?: number;

  @ApiProperty({ description: 'Session feedback', required: false })
  @IsOptional()
  @IsString()
  feedback?: string;

  @ApiProperty({ enum: CompletionReason, description: 'Reason for completion' })
  @IsEnum(CompletionReason)
  completionReason!: CompletionReason;
}

export class InterviewSessionResponseDto {
  @ApiProperty({ description: 'Session token' })
  sessionToken!: string;

  @ApiProperty({ description: 'Session ID' })
  sessionId!: string;

  @ApiProperty({ description: 'Session status' })
  status!: string;

  @ApiProperty({ description: 'Initial AI message' })
  initialMessage!: string;

  @ApiProperty({ description: 'Session configuration' })
  config!: object;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt!: Date;
}

export class ProcessMessageResponseDto {
  @ApiProperty({ description: 'AI response message' })
  response!: string;

  @ApiProperty({ description: 'Response type' })
  responseType!: MessageType;

  @ApiProperty({ description: 'Session progress' })
  sessionProgress!: {
    currentQuestion: number;
    totalQuestions: number;
    score: number;
    percentage: number;
  };

  @ApiProperty({ description: 'Response metadata' })
  metadata!: {
    processingTime: number;
    confidence: number;
    suggestions?: string[];
  };

  @ApiProperty({ description: 'Message timestamp' })
  timestamp!: Date;
}

export class InterviewCompletionResponseDto {
  @ApiProperty({ description: 'Session summary' })
  summary!: {
    totalMessages: number;
    duration: number;
    finalScore: number;
    completionRate: number;
  };

  @ApiProperty({ description: 'Performance analysis' })
  analysis!: {
    strengths: string[];
    improvements: string[];
    recommendations: string[];
    skillScores: object;
  };

  @ApiProperty({ description: 'Session completion timestamp' })
  completedAt!: Date;

  @ApiProperty({ description: 'Generated certificate data', required: false })
  certificate?: {
    certificateId: string;
    downloadUrl: string;
    validUntil: Date;
  };
}
