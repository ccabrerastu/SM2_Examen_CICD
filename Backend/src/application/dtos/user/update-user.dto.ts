import { IsEmail, IsOptional, IsEnum, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { UpdatePersonDto } from '../person/update-person.dto';

export class UpdateUserDto {
  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@example.com',
    required: false,
  })
  @IsOptional()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  readonly email?: string;

  @ApiProperty({
    description: 'User role',
    example: 'STUDENT',
    enum: ['STUDENT', 'TEACHER', 'ADMIN', 'SUPER_ADMIN'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['STUDENT', 'TEACHER', 'ADMIN', 'SUPER_ADMIN'], {
    message: 'Role must be one of: STUDENT, TEACHER, ADMIN, SUPER_ADMIN',
  })
  readonly role?: 'STUDENT' | 'TEACHER' | 'ADMIN' | 'SUPER_ADMIN';

  @ApiProperty({
    description: 'Person information to update',
    type: UpdatePersonDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdatePersonDto)
  readonly person?: UpdatePersonDto;

  // Internal fields for password reset functionality
  readonly passwordResetToken?: string | null;
  readonly passwordResetTokenExpires?: Date | null;
  readonly emailVerificationToken?: string | null;
  readonly isEmailVerified?: boolean;
  readonly lastLoginAt?: Date;
}
