import { IsOptional, IsString, IsNumber, IsObject } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CompleteChapterDto {
  @ApiPropertyOptional({
    description: 'Final score for the chapter completion',
    example: 85.5,
  })
  @IsOptional()
  @IsNumber()
  finalScore?: number;

  @ApiPropertyOptional({
    description: 'Additional completion notes',
    example: 'Chapter completed with all vocabulary items learned',
  })
  @IsOptional()
  @IsString()
  completionNotes?: string;

  @ApiPropertyOptional({
    description: 'Extra metadata for chapter completion',
    example: { timeSpent: 1200, mistakesCount: 3 },
  })
  @IsOptional()
  @IsObject()
  extraData?: Record<string, unknown>;
}
