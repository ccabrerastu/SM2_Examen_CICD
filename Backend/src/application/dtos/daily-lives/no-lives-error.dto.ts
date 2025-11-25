import { ApiProperty } from '@nestjs/swagger';

export class NoLivesErrorDto {
  @ApiProperty({
    description: 'Error code indicating no lives available',
    example: 'NO_LIVES',
  })
  readonly error!: string;

  @ApiProperty({
    description: 'Error message',
    example: 'You have no lives remaining. Try again tomorrow.',
  })
  readonly message!: string;

  @ApiProperty({
    description: 'Next reset time when lives will be restored',
    example: '2025-09-12T01:00:00Z',
  })
  readonly nextReset!: string;

  @ApiProperty({
    description: 'Current lives count (should be 0)',
    example: 0,
  })
  readonly currentLives!: number;
}
