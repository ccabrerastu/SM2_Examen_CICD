import { ApiProperty } from '@nestjs/swagger';
import { PersonResponseDto } from '../person/person-response.dto';

export class UserResponseDto {
  @ApiProperty({
    description: 'User unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  readonly id!: string;

  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@example.com',
  })
  readonly email!: string;

  @ApiProperty({
    description: 'Authentication provider',
    example: 'EMAIL_PASSWORD',
    enum: ['EMAIL_PASSWORD', 'GOOGLE', 'APPLE', 'FACEBOOK'],
  })
  readonly authProvider!: 'EMAIL_PASSWORD' | 'GOOGLE' | 'APPLE' | 'FACEBOOK';

  @ApiProperty({
    description: 'Provider user ID',
    example: 'google_123456789',
    nullable: true,
  })
  readonly providerUserId!: string | null;

  @ApiProperty({
    description: 'User role',
    example: 'STUDENT',
    enum: ['STUDENT', 'TEACHER', 'ADMIN', 'SUPER_ADMIN'],
  })
  readonly role!: 'STUDENT' | 'TEACHER' | 'ADMIN' | 'SUPER_ADMIN';

  @ApiProperty({
    description: 'Email verification status',
    example: false,
  })
  readonly isEmailVerified!: boolean;

  @ApiProperty({
    description: 'User active status',
    example: true,
  })
  readonly isActive!: boolean;

  @ApiProperty({
    description: 'Last login timestamp',
    example: '2023-12-01T10:00:00.000Z',
    nullable: true,
  })
  readonly lastLoginAt!: Date | null;

  @ApiProperty({
    description: 'User creation timestamp',
    example: '2023-12-01T10:00:00.000Z',
  })
  readonly createdAt!: Date;

  @ApiProperty({
    description: 'User last update timestamp',
    example: '2023-12-01T10:00:00.000Z',
  })
  readonly updatedAt!: Date;

  @ApiProperty({
    description: 'Person information',
    type: PersonResponseDto,
  })
  readonly person!: PersonResponseDto;
}
