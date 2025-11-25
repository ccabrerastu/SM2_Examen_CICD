import { IsEmail, IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({
    description: 'Email address of the user requesting password reset',
    example: 'user@example.com',
    format: 'email',
    maxLength: 255,
  })
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Email must be a valid email address' })
  @MaxLength(255, { message: 'Email cannot exceed 255 characters' })
  readonly email!: string;

  @ApiProperty({
    description: 'Password reset verification code',
    example: '123456',
    minLength: 4,
    maxLength: 20,
  })
  @IsNotEmpty({ message: 'Code is required' })
  @IsString({ message: 'Code must be a string' })
  @MinLength(4, { message: 'Code must be at least 4 characters long' })
  @MaxLength(20, { message: 'Code cannot exceed 20 characters' })
  readonly code!: string;

  @ApiProperty({
    description: 'New password for the user account',
    example: 'MyNewSecurePassword123',
    minLength: 12,
    maxLength: 128,
  })
  @IsNotEmpty({ message: 'New password is required' })
  @IsString({ message: 'New password must be a string' })
  @MinLength(12, { message: 'New password must be at least 12 characters long' })
  @MaxLength(128, { message: 'New password cannot exceed 128 characters' })
  readonly newPassword!: string;
}
