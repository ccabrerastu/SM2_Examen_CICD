import { ApiProperty } from '@nestjs/swagger';

export class ResendVerificationResponseDto {
  @ApiProperty({
    description: 'Indicates if the verification email was sent successfully',
    example: true,
  })
  readonly success!: boolean;

  @ApiProperty({
    description: 'Human-readable message about the operation',
    example: 'If the email exists in our system, a verification email has been sent.',
  })
  readonly message!: string;

  @ApiProperty({
    description: 'Email address the verification was sent to',
    example: 'user@example.com',
  })
  readonly email!: string;

  constructor(success: boolean, message: string, email: string) {
    this.success = success;
    this.message = message;
    this.email = email;
  }
}
