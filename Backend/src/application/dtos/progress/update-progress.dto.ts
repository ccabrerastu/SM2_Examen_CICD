import { IsNumber, IsOptional, IsObject, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProgressDto {
  @ApiProperty({
    description: 'Score obtained by the user',
    example: 92.0,
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
      vocab: { chapter: 3, lastWord: 'banana' },
      reading: { chapter: 1, lastParagraph: 8 },
      interview: { lastQuestion: 5 },
    },
    required: false,
  })
  @IsOptional()
  @IsObject({ message: 'Extra data must be an object' })
  readonly extraData?: Record<string, unknown>;
}
