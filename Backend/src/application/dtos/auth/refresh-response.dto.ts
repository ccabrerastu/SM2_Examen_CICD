import { ApiProperty } from '@nestjs/swagger';

export class RefreshResponseDto {
  @ApiProperty({
    description: 'User ID associated with the token',
    example: 'uuid-string-here',
  })
  readonly userId!: string;

  @ApiProperty({
    description: 'New JWT access token for authentication',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  readonly accessToken!: string;

  @ApiProperty({
    description: 'Token expiration time in seconds',
    example: 3600,
  })
  readonly expiresIn!: number;

  @ApiProperty({
    description: 'Success message',
    example: 'Token refreshed successfully',
  })
  readonly message!: string;

  // Note: newRefreshToken is not included in response body for security
  // It will be set in HttpOnly cookie
  readonly newRefreshToken: string | undefined; // Internal use only

  constructor(
    userId: string,
    accessToken: string,
    expiresIn: number,
    message: string = 'Token refreshed successfully',
    newRefreshToken?: string,
  ) {
    this.userId = userId;
    this.accessToken = accessToken;
    this.expiresIn = expiresIn;
    this.message = message;
    this.newRefreshToken = newRefreshToken;
  }
}
