import { ApiProperty } from '@nestjs/swagger';

export class ChapterStatsDto {
  @ApiProperty({
    description: 'Number of evaluations for this chapter',
    example: 150,
  })
  readonly evaluations!: number;

  @ApiProperty({
    description: 'Approval rate for this chapter (0-1)',
    example: 0.85,
  })
  readonly approvalRate!: number;

  @ApiProperty({
    description: 'Average number of attempts for this chapter',
    example: 2.3,
  })
  readonly averageAttempts!: number;

  @ApiProperty({
    description: 'Average score for this chapter',
    example: 87.5,
  })
  readonly averageScore!: number;
}

export class ApprovalEngineStatsDto {
  @ApiProperty({
    description: 'Total number of evaluations across all chapters',
    example: 1250,
  })
  readonly totalEvaluations!: number;

  @ApiProperty({
    description: 'Overall approval rate (0-1)',
    example: 0.78,
  })
  readonly approvalRate!: number;

  @ApiProperty({
    description: 'Average number of attempts across all evaluations',
    example: 2.1,
  })
  readonly averageAttempts!: number;

  @ApiProperty({
    description: 'Statistics by chapter',
    type: 'object',
    additionalProperties: {
      $ref: '#/components/schemas/ChapterStatsDto',
    },
    example: {
      '1': {
        evaluations: 200,
        approvalRate: 0.9,
        averageAttempts: 1.8,
        averageScore: 89.2,
      },
      '4': {
        evaluations: 150,
        approvalRate: 0.65,
        averageAttempts: 2.8,
        averageScore: 92.1,
      },
    },
  })
  readonly chapterStats!: Record<string, ChapterStatsDto>;

  @ApiProperty({
    description: 'Timestamp when statistics were calculated',
    example: '2024-01-15T10:30:00Z',
  })
  readonly calculatedAt!: Date;
}

export class PerformanceMetricsDto {
  @ApiProperty({
    description: 'ID of the metric',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  readonly id!: string;

  @ApiProperty({
    description: 'ID of the user',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  readonly userId!: string;

  @ApiProperty({
    description: 'ID of the chapter',
    example: '4',
  })
  readonly chapterId!: string;

  @ApiProperty({
    description: 'Type of metric',
    example: 'processing_speed',
  })
  readonly metricType!: string;

  @ApiProperty({
    description: 'Metric value',
    example: 1250.5,
  })
  readonly value!: number;

  @ApiProperty({
    description: 'Unit of measurement',
    example: 'milliseconds',
  })
  readonly unit!: string;

  @ApiProperty({
    description: 'Timestamp when metric was recorded',
    example: '2024-01-15T10:30:00Z',
  })
  readonly recordedAt!: Date;
}

export class PerformanceMetricsResponseDto {
  @ApiProperty({
    description: 'List of performance metrics',
    type: [PerformanceMetricsDto],
  })
  readonly metrics!: PerformanceMetricsDto[];

  @ApiProperty({
    description: 'Total number of metrics',
    example: 25,
  })
  readonly total!: number;

  @ApiProperty({
    description: 'Average processing time in milliseconds',
    example: 1150.2,
  })
  readonly averageProcessingTime!: number;

  @ApiProperty({
    description: 'Fastest processing time in milliseconds',
    example: 850.1,
  })
  readonly fastestTime!: number;

  @ApiProperty({
    description: 'Slowest processing time in milliseconds',
    example: 2100.5,
  })
  readonly slowestTime!: number;
}
