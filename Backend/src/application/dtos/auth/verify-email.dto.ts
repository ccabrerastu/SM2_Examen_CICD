import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyEmailDto {
  @ApiProperty({
    description: 'Email verification token',
    example: 'abc123def456ghi789jkl012mno345pqr678stu901vwx234yz567',
    minLength: 6,
    maxLength: 255,
  })
  @IsNotEmpty({ message: 'Token is required' })
  @IsString({ message: 'Token must be a string' })
  @MinLength(6, { message: 'Token must be at least 6 characters long' })
  @MaxLength(255, { message: 'Token cannot exceed 255 characters' })
  readonly token!: string;
}
