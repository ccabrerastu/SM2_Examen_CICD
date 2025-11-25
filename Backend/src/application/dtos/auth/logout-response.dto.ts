import { ApiProperty } from '@nestjs/swagger';

export class LogoutResponseDto {
  @ApiProperty({
    description: 'Indicates if the logout was successful',
    example: true,
  })
  readonly success!: boolean;

  @ApiProperty({
    description: 'Human-readable message about the logout operation',
    example: 'Logged out successfully',
  })
  readonly message!: string;

  @ApiProperty({
    description: 'Number of revoked tokens/sessions (optional)',
    example: 1,
    required: false,
  })
  readonly revokedTokensCount?: number | undefined;

  constructor(success: boolean, message: string, revokedTokensCount?: number) {
    this.success = success;
    this.message = message;
    this.revokedTokensCount = revokedTokensCount;
  }
}
