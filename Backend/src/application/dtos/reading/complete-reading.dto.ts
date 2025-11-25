import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, Min, Max } from 'class-validator';

export class CompleteReadingChapterDto {
  @ApiProperty({
    description: 'Quiz score (0-100)',
    example: 80,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  @Max(100)
  score!: number;
}

export class CompleteReadingChapterResponseDto {
  @ApiProperty({ description: 'Success indicator', example: true })
  success!: boolean;

  @ApiProperty({
    description: 'Completion data',
    example: {
      chapterCompleted: true,
      nextChapterUnlocked: true,
      nextChapterId: 'uuid-next-chapter',
      score: 80,
    },
  })
  data!: {
    chapterCompleted: boolean;
    nextChapterUnlocked: boolean;
    nextChapterId: string | null;
    score: number;
  };

  @ApiProperty({
    description: 'Response message',
    example: 'Reading chapter completed successfully',
  })
  message!: string;
}
