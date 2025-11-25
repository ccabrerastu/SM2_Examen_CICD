import { IsUUID, IsNumber, IsOptional, IsObject, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProgressDto {
  @ApiProperty({
    description: 'ID of the chapter',
    example: '550e8400-e29b-41d4-a716-446655440000',
    format: 'uuid',
  })
  @IsUUID(4, { message: 'Chapter ID must be a valid UUID' })
  readonly chapterId!: string;

  @ApiProperty({
    description: 'Score obtained by the user',
    example: 85.5,
    minimum: 0,
    maximum: 100,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'Score must be a number' })
  @Min(0, { message: 'Score cannot be negative' })
  @Max(100, { message: 'Score cannot exceed 100' })
  readonly score?: number;

  @ApiProperty({
    description: 'Additional data in JSON format',
    example: {
      vocab: { chapter: 2, lastWord: 'apple' },
      reading: { chapter: 1, lastParagraph: 5 },
      interview: { lastQuestion: 3 },
    },
    required: false,
  })
  @IsOptional()
  @IsObject({ message: 'Extra data must be an object' })
  readonly extraData?: Record<string, unknown>;
}
