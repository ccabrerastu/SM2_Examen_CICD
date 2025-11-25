import {
  IsEmail,
  IsString,
  MinLength,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  Matches,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CreatePersonDto } from '../person/create-person.dto';
import { Type } from 'class-transformer';

export class CreateUserDto {
  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@example.com',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  readonly email!: string;

  @ApiProperty({
    description: 'User password',
    example: 'SecurePass123!',
    minLength: 8,
  })
  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character',
  })
  readonly password!: string;

  @ApiProperty({
    description: 'Authentication provider',
    example: 'EMAIL_PASSWORD',
    enum: ['EMAIL_PASSWORD', 'GOOGLE', 'APPLE', 'FACEBOOK'],
    default: 'EMAIL_PASSWORD',
  })
  @IsOptional()
  @IsEnum(['EMAIL_PASSWORD', 'GOOGLE', 'APPLE', 'FACEBOOK'], {
    message: 'Auth provider must be one of: EMAIL_PASSWORD, GOOGLE, APPLE, FACEBOOK',
  })
  readonly authProvider?: 'EMAIL_PASSWORD' | 'GOOGLE' | 'APPLE' | 'FACEBOOK';

  @ApiProperty({
    description: 'Provider user ID (for social auth)',
    example: 'google_123456789',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Provider user ID must be a string' })
  readonly providerUserId?: string;

  @ApiProperty({
    description: 'User role',
    example: 'STUDENT',
    enum: ['STUDENT', 'TEACHER', 'ADMIN', 'SUPER_ADMIN'],
    default: 'STUDENT',
  })
  @IsOptional()
  @IsEnum(['STUDENT', 'TEACHER', 'ADMIN', 'SUPER_ADMIN'], {
    message: 'Role must be one of: STUDENT, TEACHER, ADMIN, SUPER_ADMIN',
  })
  readonly role?: 'STUDENT' | 'TEACHER' | 'ADMIN' | 'SUPER_ADMIN';

  @ApiProperty({
    description: 'Person ID reference',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID(4, { message: 'Person ID must be a valid UUID' })
  @IsNotEmpty({ message: 'Person ID is required' })
  readonly personId!: string;

  @ApiProperty({ type: () => CreatePersonDto })
  @ValidateNested()
  @Type(() => CreatePersonDto)
  readonly person!: CreatePersonDto;
}
