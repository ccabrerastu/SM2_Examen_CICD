import { ApiProperty } from '@nestjs/swagger';

export class ConsumeLifeResponseDto {
  @ApiProperty({
    description: 'Indicates if life was consumed successfully',
    example: true,
  })
  readonly success!: boolean;

  @ApiProperty({
    description: 'Current lives remaining after consumption',
    example: 3,
    minimum: 0,
    maximum: 5,
  })
  readonly currentLives!: number;

  @ApiProperty({
    description: 'Indicates if user has lives available',
    example: true,
  })
  readonly hasLivesAvailable!: boolean;

  @ApiProperty({
    description: 'Message describing the action result',
    example: 'Life consumed successfully. You have 3 lives remaining.',
  })
  readonly message!: string;

  @ApiProperty({
    description: 'Next reset time when lives will be restored',
    example: '2025-09-12T01:00:00Z',
    nullable: true,
  })
  readonly nextReset!: string | null;
}
