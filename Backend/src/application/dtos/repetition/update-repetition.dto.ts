import { IsNumber, IsEnum, IsOptional, IsObject, Min, Max, IsDate } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { RepetitionStatus } from '../../../domain/entities/chapter-repetition.entity';

export class UpdateRepetitionDto {
  @ApiProperty({
    description: 'Score obtained in the repetition',
    example: 92.5,
    minimum: 0,
    maximum: 100,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Repetition score must be a number' })
  @Min(0, { message: 'Repetition score cannot be negative' })
  @Max(100, { message: 'Repetition score cannot exceed 100' })
  readonly repetitionScore?: number;

  @ApiProperty({
    description: 'Status of the repetition',
    enum: RepetitionStatus,
    example: RepetitionStatus.COMPLETED,
    required: false,
  })
  @IsOptional()
  @IsEnum(RepetitionStatus, { message: 'Status must be a valid RepetitionStatus' })
  readonly status?: RepetitionStatus;

  @ApiProperty({
    description: 'Results of individual exercises in JSON format',
    example: {
      vocabulary: { correct: 8, total: 10, timeSpent: 120 },
      reading: { correct: 5, total: 5, timeSpent: 180 },
      listening: { correct: 7, total: 8, timeSpent: 150 },
    },
    required: false,
  })
  @IsOptional()
  @IsObject({ message: 'Exercise results must be an object' })
  readonly exerciseResults?: Record<string, any>;

  @ApiProperty({
    description: 'Completion timestamp',
    example: '2025-01-20T10:30:00Z',
    required: false,
  })
  @IsOptional()
  @IsDate({ message: 'Completed at must be a valid date' })
  @Type(() => Date)
  readonly completedAt?: Date;
}
