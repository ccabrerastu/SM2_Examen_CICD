import { ApiProperty } from '@nestjs/swagger';

export class RepetitionStatsDto {
  @ApiProperty({
    description: 'Total number of repetitions',
    example: 15,
  })
  readonly totalRepetitions!: number;

  @ApiProperty({
    description: 'Number of completed repetitions',
    example: 12,
  })
  readonly completedRepetitions!: number;

  @ApiProperty({
    description: 'Average score across all completed repetitions',
    example: 87.5,
  })
  readonly averageScore!: number;

  @ApiProperty({
    description: 'Date of the last repetition',
    example: '2025-01-20T10:30:00Z',
    nullable: true,
  })
  readonly lastRepetitionDate!: Date | null;

  @ApiProperty({
    description: 'Average improvement rate compared to original scores',
    example: 12.3,
  })
  readonly improvementRate!: number;

  @ApiProperty({
    description: 'Number of repetitions by chapter',
    example: {
      '770e8400-e29b-41d4-a716-446655440002': 5,
      '880e8400-e29b-41d4-a716-446655440003': 3,
      '990e8400-e29b-41d4-a716-446655440004': 7,
    },
    required: false,
  })
  readonly repetitionsByChapter?: Record<string, number>;
}
