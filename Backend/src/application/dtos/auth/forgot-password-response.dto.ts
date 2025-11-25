import { ApiProperty } from '@nestjs/swagger';

export class ForgotPasswordResponseDto {
  @ApiProperty({
    description: 'Success status of password reset request',
    example: true,
  })
  readonly success!: boolean;

  @ApiProperty({
    description: 'Email address where reset instructions were sent',
    example: 'user@example.com',
  })
  readonly email!: string;

  @ApiProperty({
    description: 'Success message for password reset request',
    example: 'Password reset instructions sent to your email',
  })
  readonly message!: string;

  @ApiProperty({
    description: 'Expiration time for the reset code in minutes',
    example: 15,
  })
  readonly expiresInMinutes!: number;

  constructor(success: boolean, email: string, message: string, expiresInMinutes: number) {
    this.success = success;
    this.email = email;
    this.message = message;
    this.expiresInMinutes = expiresInMinutes;
  }
}
