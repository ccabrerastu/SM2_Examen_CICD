import { IsUUID, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SessionType } from '../../../domain/entities/chapter-repetition.entity';

export class CreateRepetitionDto {
  @ApiProperty({
    description: 'ID of the chapter to repeat',
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  @IsUUID(4, { message: 'Chapter ID must be a valid UUID' })
  readonly chapterId!: string;

  @ApiProperty({
    description: 'ID of the original progress record',
    example: '660e8400-e29b-41d4-a716-446655440001',
    format: 'uuid',
  })
  @IsUUID(4, { message: 'Original progress ID must be a valid UUID' })
  readonly originalProgressId!: string;

  @ApiProperty({
    description: 'Type of repetition session',
    enum: SessionType,
    example: SessionType.PRACTICE,
    required: false,
    default: SessionType.PRACTICE,
  })
  @IsOptional()
  @IsEnum(SessionType, { message: 'Session type must be a valid SessionType' })
  readonly sessionType?: SessionType;
}
