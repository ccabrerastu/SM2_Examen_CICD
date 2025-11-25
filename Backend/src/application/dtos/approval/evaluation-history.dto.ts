import { IsUUID, IsString, IsOptional, IsNumber, IsEnum, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { EvaluationStatus } from '../../../domain/entities/approval-evaluation.entity';

export class GetEvaluationHistoryDto {
  @ApiProperty({
    description: 'ID of the user',
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  @IsUUID(4, { message: 'User ID must be a valid UUID' })
  readonly userId!: string;

  @ApiProperty({
    description: 'ID of the chapter (optional)',
    example: '4',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Chapter ID must be a string' })
  readonly chapterId?: string;

  @ApiProperty({
    description: 'Filter by evaluation status',
    enum: EvaluationStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(EvaluationStatus, { message: 'Status must be a valid evaluation status' })
  readonly status?: EvaluationStatus;

  @ApiProperty({
    description: 'Page number for pagination',
    example: 1,
    minimum: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Page must be a number' })
  @Min(1, { message: 'Page must be at least 1' })
  readonly page?: number;

  @ApiProperty({
    description: 'Number of items per page',
    example: 10,
    minimum: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Limit must be a number' })
  @Min(1, { message: 'Limit must be at least 1' })
  readonly limit?: number;
}

export class EvaluationHistoryItemDto {
  @ApiProperty({
    description: 'ID of the evaluation',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  readonly id!: string;

  @ApiProperty({
    description: 'ID of the chapter',
    example: '4',
  })
  readonly chapterId!: string;

  @ApiProperty({
    description: 'Original score obtained',
    example: 85.5,
  })
  readonly score!: number;

  @ApiProperty({
    description: 'Adjusted score after error carryover',
    example: 80.5,
  })
  readonly adjustedScore!: number;

  @ApiProperty({
    description: 'Evaluation status',
    enum: EvaluationStatus,
    example: EvaluationStatus.APPROVED,
  })
  readonly status!: EvaluationStatus;

  @ApiProperty({
    description: 'Attempt number',
    example: 2,
  })
  readonly attemptNumber!: number;

  @ApiProperty({
    description: 'Points deducted from previous attempts',
    example: 5,
  })
  readonly errorsCarriedOver!: number;

  @ApiProperty({
    description: 'Time spent on evaluation in seconds',
    example: 1800,
    nullable: true,
  })
  readonly timeSpent?: number;

  @ApiProperty({
    description: 'Evaluation date',
    example: '2024-01-15T10:30:00Z',
  })
  readonly evaluatedAt!: Date;

  @ApiProperty({
    description: 'Feedback provided to user',
    example: '¡Felicitaciones! Has aprobado en el intento 2.',
  })
  readonly feedback!: string;
}

export class EvaluationHistoryResponseDto {
  @ApiProperty({
    description: 'List of evaluation history items',
    type: [EvaluationHistoryItemDto],
  })
  readonly items!: EvaluationHistoryItemDto[];

  @ApiProperty({
    description: 'Total number of evaluations',
    example: 25,
  })
  readonly total!: number;

  @ApiProperty({
    description: 'Current page number',
    example: 1,
  })
  readonly page!: number;

  @ApiProperty({
    description: 'Number of items per page',
    example: 10,
  })
  readonly limit!: number;

  @ApiProperty({
    description: 'Total number of pages',
    example: 3,
  })
  readonly totalPages!: number;
}

export class ChapterEvaluationStatsDto {
  @ApiProperty({
    description: 'ID of the chapter',
    example: '4',
  })
  readonly chapterId!: string;

  @ApiProperty({
    description: 'Total number of evaluations',
    example: 150,
  })
  readonly totalEvaluations!: number;

  @ApiProperty({
    description: 'Number of approved evaluations',
    example: 120,
  })
  readonly approvedCount!: number;

  @ApiProperty({
    description: 'Number of failed evaluations',
    example: 25,
  })
  readonly failedCount!: number;

  @ApiProperty({
    description: 'Number of pending evaluations',
    example: 5,
  })
  readonly pendingCount!: number;

  @ApiProperty({
    description: 'Average score across all evaluations',
    example: 82.5,
  })
  readonly averageScore!: number;

  @ApiProperty({
    description: 'Average adjusted score after error carryover',
    example: 78.3,
  })
  readonly averageAdjustedScore!: number;

  @ApiProperty({
    description: 'Approval rate as percentage',
    example: 80.0,
  })
  readonly approvalRate!: number;

  @ApiProperty({
    description: 'Average number of attempts per user',
    example: 1.8,
  })
  readonly averageAttempts!: number;
}

export class UserApprovalSummaryDto {
  @ApiProperty({
    description: 'ID of the user',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  readonly userId!: string;

  @ApiProperty({
    description: 'Total chapters attempted',
    example: 8,
  })
  readonly chaptersAttempted!: number;

  @ApiProperty({
    description: 'Total chapters approved',
    example: 6,
  })
  readonly chaptersApproved!: number;

  @ApiProperty({
    description: 'Overall approval rate',
    example: 75.0,
  })
  readonly overallApprovalRate!: number;

  @ApiProperty({
    description: 'Average score across all evaluations',
    example: 84.2,
  })
  readonly averageScore!: number;

  @ApiProperty({
    description: 'Total evaluation attempts',
    example: 12,
  })
  readonly totalAttempts!: number;

  @ApiProperty({
    description: 'Chapters with pending evaluations',
    example: ['3', '7'],
  })
  readonly pendingChapters!: string[];

  @ApiProperty({
    description: 'Last evaluation date',
    example: '2024-01-15T10:30:00Z',
    nullable: true,
  })
  readonly lastEvaluationDate?: Date;
}
