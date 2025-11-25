import { ApiProperty } from '@nestjs/swagger';

export class DailyLivesResponseDto {
  @ApiProperty({
    description: 'Daily lives ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  readonly id!: string;

  @ApiProperty({
    description: 'User ID',
    example: '660e8400-e29b-41d4-a716-446655440001',
  })
  readonly userId!: string;

  @ApiProperty({
    description: 'Current lives available',
    example: 4,
    minimum: 0,
    maximum: 5,
  })
  readonly currentLives!: number;

  @ApiProperty({
    description: 'Last reset date (YYYY-MM-DD)',
    example: '2025-09-11',
  })
  readonly lastResetDate!: Date;

  @ApiProperty({
    description: 'Indicates if user has lives available',
    example: true,
  })
  readonly hasLivesAvailable!: boolean;

  @ApiProperty({
    description: 'Next reset time (next day at 01:00 AM server time)',
    example: '2025-09-12T01:00:00Z',
  })
  readonly nextReset!: string;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2025-09-11T15:30:00Z',
  })
  readonly createdAt!: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2025-09-11T16:00:00Z',
  })
  readonly updatedAt!: Date;
}
