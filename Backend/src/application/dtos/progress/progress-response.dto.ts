import { ApiProperty } from '@nestjs/swagger';

export class ProgressResponseDto {
  @ApiProperty({
    description: 'Progress ID',
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
    nullable: true,
  })
  readonly chapterId!: string | null;

  @ApiProperty({
    description: 'Score obtained by the user',
    example: 85.5,
    nullable: true,
  })
  readonly score!: number | null;

  @ApiProperty({
    description: 'Last activity timestamp',
    example: '2025-09-08T17:00:00Z',
  })
  readonly lastActivity!: Date;

  @ApiProperty({
    description: 'Additional data in JSON format',
    example: {
      vocab: { chapter: 2, lastWord: 'apple' },
      reading: { chapter: 1, lastParagraph: 5 },
    },
    nullable: true,
  })
  readonly extraData!: Record<string, unknown> | null;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2025-09-08T15:30:00Z',
  })
  readonly createdAt!: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2025-09-08T17:00:00Z',
  })
  readonly updatedAt!: Date;
}
