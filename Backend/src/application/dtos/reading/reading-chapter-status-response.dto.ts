import { ApiProperty } from '@nestjs/swagger';
import { ChapterLevel } from '../../../domain/enums/chapter-level.enum';

export class ReadingChapterStatusDto {
  @ApiProperty({ description: 'Reading chapter ID', example: 'uuid-chapter-id' })
  id!: string;

  @ApiProperty({ description: 'Chapter title', example: 'Introduction to JavaScript' })
  title!: string;

  @ApiProperty({ description: 'Chapter description', example: 'Learn JavaScript fundamentals' })
  description!: string | null;

  @ApiProperty({
    description: 'Chapter difficulty level',
    enum: ChapterLevel,
    example: ChapterLevel.BASIC,
  })
  level!: ChapterLevel;

  @ApiProperty({ description: 'Chapter order in sequence', example: 1 })
  order!: number;

  @ApiProperty({ description: 'Chapter image URL', example: 'https://example.com/js.jpg' })
  imageUrl!: string | null;

  @ApiProperty({ description: 'Chapter topic', example: 'Programming' })
  topic!: string | null;

  @ApiProperty({ description: 'Whether chapter is unlocked for user', example: true })
  isUnlocked!: boolean;

  @ApiProperty({ description: 'Whether chapter is completed', example: false })
  isCompleted!: boolean;

  @ApiProperty({ description: 'Progress percentage (0-100)', example: 60 })
  progressPercentage!: number;

  @ApiProperty({ description: 'Estimated reading time in minutes', example: 10 })
  estimatedReadingTime!: number | null;

  @ApiProperty({ description: 'Last activity date', example: '2025-09-11T10:00:00Z' })
  lastActivity!: Date | null;

  @ApiProperty({ description: 'Chapter completion date', example: null })
  completionDate!: Date | null;
}

export class ReadingChaptersStatusResponseDto {
  @ApiProperty({ description: 'Success indicator', example: true })
  success!: boolean;

  @ApiProperty({
    description: 'List of reading chapters with their status',
    type: [ReadingChapterStatusDto],
  })
  data!: {
    chapters: ReadingChapterStatusDto[];
    totalChapters: number;
    unlockedChapters: number;
    completedChapters: number;
    overallProgress: number;
  };

  @ApiProperty({
    description: 'Response message',
    example: 'Reading chapters retrieved successfully',
  })
  message!: string;
}
