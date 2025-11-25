import { ApiProperty } from '@nestjs/swagger';

export class VerifyEmailResponseDto {
  @ApiProperty({
    description: 'Success status of email verification',
    example: true,
  })
  readonly success!: boolean;

  @ApiProperty({
    description: 'Unique identifier for the user',
    example: 'uuid-string-here',
  })
  readonly userId!: string;

  @ApiProperty({
    description: 'Email address that was verified',
    example: 'user@example.com',
  })
  readonly email!: string;

  @ApiProperty({
    description: 'Success message for email verification',
    example: 'Email verified successfully',
  })
  readonly message!: string;

  constructor(
    success: boolean,
    userId: string,
    email: string,
    message: string = 'Email verified successfully',
  ) {
    this.success = success;
    this.userId = userId;
    this.email = email;
    this.message = message;
  }
}
