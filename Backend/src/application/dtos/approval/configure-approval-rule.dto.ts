import { IsString, IsNumber, IsBoolean, IsOptional, IsObject, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsValidThreshold,
  IsValidChapterId,
  IsValidAttemptCount,
} from '../../../presentation/validators/approval.validators';

export class ConfigureApprovalRuleDto {
  @ApiProperty({
    description: 'ID of the chapter (optional for global rules)',
    example: '4',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Chapter ID must be a string' })
  @IsValidChapterId({ message: 'Chapter ID must be a valid chapter number between 1 and 20' })
  readonly chapterId?: string;

  @ApiProperty({
    description: 'Minimum score threshold for approval',
    example: 80,
    minimum: 0,
    maximum: 100,
  })
  @IsValidThreshold({ message: 'Threshold must be valid for the specified chapter' })
  readonly minScoreThreshold!: number;

  @ApiProperty({
    description: 'Maximum number of attempts allowed',
    example: 3,
    minimum: 1,
    maximum: 10,
  })
  @IsValidAttemptCount({ message: 'Max attempts must be between 1 and 10' })
  readonly maxAttempts!: number;

  @ApiProperty({
    description: 'Whether to carry over errors from previous attempts',
    example: true,
  })
  @IsBoolean({ message: 'Allow error carryover must be a boolean' })
  readonly allowErrorCarryover!: boolean;

  @ApiProperty({
    description: 'Whether the rule is active',
    example: true,
  })
  @IsBoolean({ message: 'Is active must be a boolean' })
  readonly isActive!: boolean;

  @ApiProperty({
    description: 'Special requirements for the rule',
    example: {
      requirePerfectScore: true,
      timeLimit: 3600,
    },
    required: false,
  })
  @IsOptional()
  @IsObject({ message: 'Special requirements must be an object' })
  readonly specialRequirements?: Record<string, unknown>;

  @ApiProperty({
    description: 'Description of the rule',
    example: 'Special rule for chapter 4 requiring 100% score',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  readonly description?: string;
}

export class ApprovalRuleResponseDto {
  @ApiProperty({
    description: 'ID of the approval rule',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  readonly id!: string;

  @ApiProperty({
    description: 'ID of the chapter (null for global rules)',
    example: '4',
    nullable: true,
  })
  readonly chapterId?: string;

  @ApiProperty({
    description: 'Minimum score threshold for approval',
    example: 80,
  })
  readonly minScoreThreshold!: number;

  @ApiProperty({
    description: 'Maximum number of attempts allowed',
    example: 3,
  })
  readonly maxAttempts!: number;

  @ApiProperty({
    description: 'Whether to carry over errors from previous attempts',
    example: true,
  })
  readonly allowErrorCarryover!: boolean;

  @ApiProperty({
    description: 'Whether the rule is active',
    example: true,
  })
  readonly isActive!: boolean;

  @ApiProperty({
    description: 'Special requirements for the rule',
    example: {
      requirePerfectScore: true,
      timeLimit: 3600,
    },
    nullable: true,
  })
  readonly specialRequirements?: Record<string, unknown>;

  @ApiProperty({
    description: 'Description of the rule',
    example: 'Special rule for chapter 4 requiring 100% score',
    nullable: true,
  })
  readonly description?: string;

  @ApiProperty({
    description: 'Rule creation date',
    example: '2024-01-15T10:30:00Z',
  })
  readonly createdAt!: Date;

  @ApiProperty({
    description: 'Rule last update date',
    example: '2024-01-15T10:30:00Z',
  })
  readonly updatedAt!: Date;
}

export class UpdateApprovalRuleDto {
  @ApiProperty({
    description: 'Minimum score threshold for approval',
    example: 85,
    minimum: 0,
    maximum: 100,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Minimum score threshold must be a number' })
  @Min(0, { message: 'Threshold cannot be negative' })
  @Max(100, { message: 'Threshold cannot exceed 100' })
  readonly minScoreThreshold?: number;

  @ApiProperty({
    description: 'Maximum number of attempts allowed',
    example: 5,
    minimum: 1,
    maximum: 10,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Max attempts must be a number' })
  @Min(1, { message: 'Must allow at least 1 attempt' })
  @Max(10, { message: 'Cannot exceed 10 attempts' })
  readonly maxAttempts?: number;

  @ApiProperty({
    description: 'Whether to carry over errors from previous attempts',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'Allow error carryover must be a boolean' })
  readonly allowErrorCarryover?: boolean;

  @ApiProperty({
    description: 'Whether the rule is active',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean({ message: 'Is active must be a boolean' })
  readonly isActive?: boolean;

  @ApiProperty({
    description: 'Special requirements for the rule',
    example: {
      requirePerfectScore: false,
      timeLimit: 7200,
    },
    required: false,
  })
  @IsOptional()
  @IsObject({ message: 'Special requirements must be an object' })
  readonly specialRequirements?: Record<string, unknown>;

  @ApiProperty({
    description: 'Description of the rule',
    example: 'Updated rule description',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  readonly description?: string;
}
