import { IsEmail, IsString, MinLength, IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({
    description: 'Full name of the user',
    example: 'John Doe',
    minLength: 2,
    maxLength: 200,
  })
  @IsNotEmpty({ message: 'Name is required' })
  @IsString({ message: 'Name must be a string' })
  @MinLength(2, { message: 'Name must be at least 2 characters long' })
  @MaxLength(200, { message: 'Name cannot exceed 200 characters' })
  readonly fullName!: string;

  @ApiProperty({
    description: 'Email address of the user',
    example: 'user@example.com',
    format: 'email',
    maxLength: 255,
  })
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Email must be a valid email address' })
  @MaxLength(255, { message: 'Email cannot exceed 255 characters' })
  readonly email!: string;

  @ApiProperty({
    description: 'Password for the user account',
    example: 'MySecurePassword123',
    minLength: 12,
    maxLength: 128,
  })
  @IsNotEmpty({ message: 'Password is required' })
  @IsString({ message: 'Password must be a string' })
  @MinLength(12, { message: 'Password must be at least 12 characters long' })
  @MaxLength(128, { message: 'Password cannot exceed 128 characters' })
  readonly password!: string;

  @ApiProperty({
    description: 'Password confirmation to ensure passwords match',
    example: 'MySecurePassword123',
    minLength: 12,
    maxLength: 128,
  })
  @IsNotEmpty({ message: 'Password confirmation is required' })
  @IsString({ message: 'Password confirmation must be a string' })
  @MinLength(12, { message: 'Password confirmation must be at least 12 characters long' })
  @MaxLength(128, { message: 'Password confirmation cannot exceed 128 characters' })
  readonly confirmPassword!: string;
}
