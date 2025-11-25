import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordResponseDto {
  @ApiProperty({
    description: 'Success status of password reset',
    example: true,
  })
  readonly success!: boolean;

  @ApiProperty({
    description: 'User ID whose password was reset',
    example: 'uuid-string-here',
  })
  readonly userId!: string;

  @ApiProperty({
    description: 'Email address of the user',
    example: 'user@example.com',
  })
  readonly email!: string;

  @ApiProperty({
    description: 'Success message for password reset',
    example: 'Password reset successfully',
  })
  readonly message!: string;

  constructor(
    success: boolean,
    userId: string,
    email: string,
    message: string = 'Password reset successfully',
  ) {
    this.success = success;
    this.userId = userId;
    this.email = email;
    this.message = message;
  }
}
