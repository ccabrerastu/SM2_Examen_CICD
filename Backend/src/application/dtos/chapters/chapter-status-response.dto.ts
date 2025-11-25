import { ApiProperty } from '@nestjs/swagger';
import { ChapterLevel } from '../../../domain/enums/chapter-level.enum';

export class ChapterStatusDto {
  @ApiProperty({ description: 'Chapter ID', example: 'uuid-chapter-id' })
  id!: string;

  @ApiProperty({ description: 'Chapter title', example: 'Animals I' })
  title!: string;

  @ApiProperty({ description: 'Chapter description', example: 'Learn basic animal vocabulary' })
  description!: string | null;

  @ApiProperty({
    description: 'Chapter difficulty level',
    enum: ChapterLevel,
    example: ChapterLevel.BASIC,
  })
  level!: ChapterLevel;

  @ApiProperty({ description: 'Chapter order in sequence', example: 1 })
  order!: number;

  @ApiProperty({ description: 'Chapter image URL', example: 'https://example.com/animals.jpg' })
  imageUrl!: string | null;

  @ApiProperty({ description: 'Whether chapter is unlocked for user', example: true })
  isUnlocked!: boolean;

  @ApiProperty({ description: 'Whether chapter is completed', example: false })
  isCompleted!: boolean;

  @ApiProperty({ description: 'Progress percentage (0-100)', example: 45 })
  progressPercentage!: number;

  @ApiProperty({ description: 'Number of vocabulary items learned', example: 12 })
  vocabularyItemsLearned!: number;

  @ApiProperty({ description: 'Total vocabulary items in chapter', example: 25 })
  totalVocabularyItems!: number;

  @ApiProperty({ description: 'Last activity date', example: '2025-09-11T10:00:00Z' })
  lastActivity!: Date | null;

  @ApiProperty({ description: 'Chapter completion date', example: null })
  completionDate!: Date | null;
}

export class ChaptersStatusResponseDto {
  @ApiProperty({ description: 'Success indicator', example: true })
  success!: boolean;

  @ApiProperty({
    description: 'List of chapters with their status',
    type: [ChapterStatusDto],
  })
  data!: {
    chapters: ChapterStatusDto[];
    totalChapters: number;
    unlockedChapters: number;
    completedChapters: number;
  };

  @ApiProperty({ description: 'Response message', example: 'Chapters retrieved successfully' })
  message!: string;
}
