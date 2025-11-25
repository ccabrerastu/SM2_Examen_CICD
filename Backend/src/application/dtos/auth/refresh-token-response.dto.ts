import { ApiProperty } from '@nestjs/swagger';

export class RefreshTokenResponseDto {
  @ApiProperty({
    description: 'User unique identifier',
    example: 'uuid-user-id',
  })
  readonly userId!: string;

  @ApiProperty({
    description: 'New access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  readonly accessToken!: string;

  @ApiProperty({
    description: 'Access token expiration time in seconds',
    example: 900,
  })
  readonly expiresIn!: number;

  @ApiProperty({
    description: 'Success message',
    example: 'Token refreshed successfully',
  })
  readonly message!: string;

  // Note: refreshToken is not included in response body for security
  // It's set as HttpOnly cookie automatically
  readonly refreshToken?: string | undefined; // Internal use only

  constructor(
    userId: string,
    accessToken: string,
    expiresIn: number,
    message: string,
    refreshToken?: string,
  ) {
    this.userId = userId;
    this.accessToken = accessToken;
    this.expiresIn = expiresIn;
    this.message = message;
    this.refreshToken = refreshToken;
  }
}
