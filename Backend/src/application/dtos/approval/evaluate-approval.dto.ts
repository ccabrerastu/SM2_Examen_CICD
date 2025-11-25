import { IsUUID, IsNumber, IsOptional, IsObject, Min, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { EvaluationStatus } from '../../../domain/entities/approval-evaluation.entity';
import {
  IsValidScore,
  IsValidChapterId,
} from '../../../presentation/validators/approval.validators';

export class EvaluateApprovalDto {
  @ApiProperty({
    description: 'ID of the user being evaluated',
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  @IsUUID(4, { message: 'User ID must be a valid UUID' })
  readonly userId!: string;

  @ApiProperty({
    description: 'ID of the chapter being evaluated',
    example: '1',
  })
  @IsString({ message: 'Chapter ID must be a string' })
  @IsValidChapterId({ message: 'Chapter ID must be a valid chapter number between 1 and 20' })
  readonly chapterId!: string;

  @ApiProperty({
    description: 'Score obtained by the user',
    example: 85.5,
    minimum: 0,
    maximum: 100,
  })
  @IsValidScore({ message: 'Score must be a number between 0 and 100' })
  readonly score!: number;

  @ApiProperty({
    description: 'Time spent on the chapter in seconds',
    example: 1800,
    minimum: 0,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Time spent must be a number' })
  @Min(0, { message: 'Time spent cannot be negative' })
  readonly timeSpent?: number;

  @ApiProperty({
    description: 'Additional evaluation data',
    example: {
      questionResults: [true, false, true],
      difficulty: 'medium',
      completionTime: 1800,
    },
    required: false,
  })
  @IsOptional()
  @IsObject({ message: 'Additional data must be an object' })
  readonly additionalData?: Record<string, unknown>;

  @ApiProperty({
    description: 'Metadata for the evaluation, including quiz data',
    example: {
      quiz_data: {
        quiz_completed: true,
        final_score: 85,
        total_questions: 10,
        correct_answers: 8,
        incorrect_answers: 2,
      },
    },
    required: false,
  })
  @IsOptional()
  @IsObject({ message: 'Metadata must be an object' })
  readonly metadata?: Record<string, unknown>;
}

export class EvaluateApprovalResponseDto {
  @ApiProperty({
    description: 'ID of the evaluation record',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  readonly evaluationId!: string;

  @ApiProperty({
    description: 'Evaluation status',
    enum: EvaluationStatus,
    example: EvaluationStatus.APPROVED,
  })
  readonly status!: EvaluationStatus;

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
    description: 'Required threshold for approval',
    example: 80,
  })
  readonly threshold!: number;

  @ApiProperty({
    description: 'Current attempt number',
    example: 2,
  })
  readonly attemptNumber!: number;

  @ApiProperty({
    description: 'Points deducted from previous failed attempts',
    example: 5,
  })
  readonly errorsCarriedOver!: number;

  @ApiProperty({
    description: 'Feedback message for the user',
    example: '¡Felicitaciones! Has aprobado en el intento 2 con 80.5% (requerido: 80%).',
  })
  readonly feedback!: string;

  @ApiProperty({
    description: 'Whether the user can retry if failed',
    example: true,
  })
  readonly canRetry!: boolean;

  @ApiProperty({
    description: 'Maximum attempts allowed',
    example: 3,
  })
  readonly maxAttempts!: number;
}

export class BatchEvaluateApprovalDto {
  @ApiProperty({
    description: 'Array of evaluation requests',
    type: [EvaluateApprovalDto],
  })
  readonly evaluations!: EvaluateApprovalDto[];
}

export class BatchEvaluateApprovalResponseDto {
  @ApiProperty({
    description: 'Successful evaluation results',
    type: [EvaluateApprovalResponseDto],
  })
  readonly results!: EvaluateApprovalResponseDto[];

  @ApiProperty({
    description: 'Failed evaluations with error messages',
    example: [
      {
        request: { userId: '123', chapterId: '1', score: 85 },
        error: 'User not found',
      },
    ],
  })
  readonly errors!: Array<{
    request: EvaluateApprovalDto;
    error: string;
  }>;
}
