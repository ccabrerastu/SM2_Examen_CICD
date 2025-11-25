import { ApiProperty } from '@nestjs/swagger';
import { ProgressResponseDto } from './progress-response.dto';

export class UserProgressListDto {
  @ApiProperty({
    description: 'User ID',
    example: '660e8400-e29b-41d4-a716-446655440001',
  })
  readonly userId!: string;

  @ApiProperty({
    description: 'Total number of progress records',
    example: 5,
  })
  readonly totalRecords!: number;

  @ApiProperty({
    description: 'List of user progress records',
    type: [ProgressResponseDto],
  })
  readonly progress!: ProgressResponseDto[];

  @ApiProperty({
    description: 'Last overall activity timestamp',
    example: '2025-09-08T17:00:00Z',
    nullable: true,
  })
  readonly lastActivity!: Date | null;
}
