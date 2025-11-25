import { ApiProperty } from '@nestjs/swagger';

export class QuizQuestionDto {
  @ApiProperty({ description: 'Question ID', example: 'uuid-question-id' })
  id!: string;

  @ApiProperty({ description: 'Reading content ID', example: 'uuid-content-id' })
  readingContentId!: string;

  @ApiProperty({ description: 'Question text', example: 'What is a variable in programming?' })
  questionText!: string;

  @ApiProperty({
    description: 'Answer options (array of 4 strings)',
    example: ['A container for data', 'A function', 'A loop', 'A condition'],
    type: [String],
  })
  options!: string[];

  @ApiProperty({ description: 'Index of correct answer (0-3)', example: 0 })
  correctAnswer!: number;

  @ApiProperty({ description: 'Hint for the question', example: 'Think about data storage' })
  hint!: string;

  @ApiProperty({ description: 'Question order (1-10)', example: 1 })
  order!: number;

  @ApiProperty({ description: 'Whether question has explanation', example: true })
  hasExplanation!: boolean;
}

export class QuizQuestionsResponseDto {
  @ApiProperty({ description: 'Success indicator', example: true })
  success!: boolean;

  @ApiProperty({
    description: 'List of quiz questions',
    type: [QuizQuestionDto],
  })
  data!: {
    questions: QuizQuestionDto[];
    totalQuestions: number;
  };

  @ApiProperty({
    description: 'Response message',
    example: 'Quiz questions retrieved successfully',
  })
  message!: string;
}
