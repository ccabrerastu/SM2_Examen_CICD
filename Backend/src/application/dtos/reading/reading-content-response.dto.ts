import { ApiProperty } from '@nestjs/swagger';

export class HighlightedWordDto {
  @ApiProperty({ description: 'Highlighted word', example: 'variable' })
  word!: string;

  @ApiProperty({ description: 'Word definition', example: 'A container for storing data values' })
  definition!: string;

  @ApiProperty({ description: 'Page number where word appears', example: 1 })
  page!: number;
}

export class ReadingContentDto {
  @ApiProperty({ description: 'Reading content ID', example: 'uuid-content-id' })
  id!: string;

  @ApiProperty({ description: 'Reading chapter ID', example: 'uuid-chapter-id' })
  readingChapterId!: string;

  @ApiProperty({ description: 'Content title', example: 'Introduction to JavaScript' })
  title!: string;

  @ApiProperty({
    description: 'Content pages (array of 3 strings)',
    example: ['Page 1 content...', 'Page 2 content...', 'Page 3 content...'],
    type: [String],
  })
  content!: string[];

  @ApiProperty({
    description: 'Highlighted words with definitions',
    type: [HighlightedWordDto],
  })
  highlightedWords!: HighlightedWordDto[];

  @ApiProperty({ description: 'Total number of pages', example: 3 })
  totalPages!: number;

  @ApiProperty({ description: 'Estimated reading time in minutes', example: 10 })
  estimatedReadingTime!: number | null;

  @ApiProperty({ description: 'Content topic', example: 'Programming' })
  topic!: string | null;

  @ApiProperty({ description: 'Content level', example: 'BASIC' })
  level!: string;
}

export class ReadingContentResponseDto {
  @ApiProperty({ description: 'Success indicator', example: true })
  success!: boolean;

  @ApiProperty({ description: 'Reading content data', type: ReadingContentDto })
  data!: ReadingContentDto;

  @ApiProperty({
    description: 'Response message',
    example: 'Reading content retrieved successfully',
  })
  message!: string;
}
