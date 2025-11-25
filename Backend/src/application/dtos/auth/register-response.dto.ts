import { ApiProperty } from '@nestjs/swagger';

export class RegisterResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the user',
    example: 'uuid-string-here',
  })
  readonly userId!: string;

  @ApiProperty({
    description: 'Email address of the registered user',
    example: 'user@example.com',
  })
  readonly email!: string;

  @ApiProperty({
    description: 'Full name of the registered user',
    example: 'John Doe',
  })
  readonly fullName!: string;

  @ApiProperty({
    description: 'Whether the user email has been verified',
    example: false,
  })
  readonly isEmailVerified!: boolean;

  @ApiProperty({
    description: 'JWT access token for authentication',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  readonly accessToken!: string;

  @ApiProperty({
    description: 'Token expiration time in seconds',
    example: 3600,
  })
  readonly expiresIn!: number;

  @ApiProperty({
    description: 'Success message for the registration',
    example: 'Registration successful',
  })
  readonly message!: string;

  constructor(
    userId: string,
    email: string,
    fullName: string,
    isEmailVerified: boolean,
    accessToken: string,
    expiresIn: number,
    message: string = 'Registration successful',
  ) {
    this.userId = userId;
    this.email = email;
    this.fullName = fullName;
    this.isEmailVerified = isEmailVerified;
    this.accessToken = accessToken;
    this.expiresIn = expiresIn;
    this.message = message;
  }
}
