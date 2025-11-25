import { ApiProperty } from '@nestjs/swagger';

export class InterviewQuestionDto {
  @ApiProperty({ example: 'uuid-123', description: 'Question ID' })
  id!: string;

  @ApiProperty({ example: 'What is JavaScript?', description: 'Question text' })
  question!: string;

  @ApiProperty({ example: 'conceptual', description: 'Question category' })
  category!: string;

  @ApiProperty({ example: 'easy', description: 'Question difficulty' })
  difficulty!: string;

  @ApiProperty({ example: 'Conceptual', description: 'Category label' })
  categoryLabel!: string;

  @ApiProperty({ example: 60, description: 'Minimum answer length expected' })
  minimumAnswerLength!: number;

  @ApiProperty({ example: 120, description: 'Recommended time in seconds' })
  recommendedTimeSeconds!: number;

  @ApiProperty({ example: 1, description: 'Question order in interview' })
  order!: number;

  @ApiProperty({
    example: ['JavaScript is a programming language...'],
    description: 'Sample answers (only for frontend hints, not for cheating)',
    required: false,
  })
  sampleAnswers?: string[];
}
