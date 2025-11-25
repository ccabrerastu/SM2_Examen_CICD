import { ApiProperty } from '@nestjs/swagger';
import { RepetitionStatus, SessionType } from '../../../domain/entities/chapter-repetition.entity';
import { ProgressResponseDto } from '../progress/progress-response.dto';

export class RepetitionResponseDto {
  @ApiProperty({
    description: 'Repetition ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  readonly id!: string;

  @ApiProperty({
    description: 'User ID',
    example: '660e8400-e29b-41d4-a716-446655440001',
  })
  readonly userId!: string;

  @ApiProperty({
    description: 'Chapter ID',
    example: '770e8400-e29b-41d4-a716-446655440002',
  })
  readonly chapterId!: string;

  @ApiProperty({
    description: 'Original progress record ID',
    example: '880e8400-e29b-41d4-a716-446655440003',
  })
  readonly originalProgressId!: string;

  @ApiProperty({
    description: 'Score obtained in the repetition',
    example: 92.5,
    nullable: true,
  })
  readonly repetitionScore!: number | null;

  @ApiProperty({
    description: 'Type of repetition session',
    enum: SessionType,
    example: SessionType.PRACTICE,
  })
  readonly sessionType!: SessionType;

  @ApiProperty({
    description: 'Current status of the repetition',
    enum: RepetitionStatus,
    example: RepetitionStatus.COMPLETED,
  })
  readonly status!: RepetitionStatus;

  @ApiProperty({
    description: 'Results of individual exercises in JSON format',
    example: {
      vocabulary: { correct: 8, total: 10, timeSpent: 120 },
      reading: { correct: 5, total: 5, timeSpent: 180 },
      listening: { correct: 7, total: 8, timeSpent: 150 },
    },
    nullable: true,
  })
  readonly exerciseResults!: Record<string, any> | null;

  @ApiProperty({
    description: 'When the repetition was started',
    example: '2025-01-20T09:00:00Z',
  })
  readonly startedAt!: Date;

  @ApiProperty({
    description: 'When the repetition was completed',
    example: '2025-01-20T10:30:00Z',
    nullable: true,
  })
  readonly completedAt!: Date | null;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2025-01-20T09:00:00Z',
  })
  readonly createdAt!: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2025-01-20T10:30:00Z',
  })
  readonly updatedAt!: Date;

  @ApiProperty({
    description: 'Original progress record details',
    type: ProgressResponseDto,
    required: false,
  })
  readonly originalProgress?: ProgressResponseDto;

  @ApiProperty({
    description: 'Chapter information',
    example: {
      id: '770e8400-e29b-41d4-a716-446655440002',
      title: 'Basic Conversations',
      level: 'beginner',
    },
    required: false,
  })
  readonly chapter?: {
    id: string;
    title: string;
    level: string;
  };

  @ApiProperty({
    description: 'Duration of the repetition in minutes',
    example: 90,
    nullable: true,
  })
  readonly durationInMinutes?: number | null;

  @ApiProperty({
    description: 'Improvement rate compared to original score',
    example: 15.5,
    nullable: true,
  })
  readonly improvementRate?: number | null;

  @ApiProperty({
    description: 'Whether the repetition is currently active',
    example: false,
  })
  readonly isActive!: boolean;
}
