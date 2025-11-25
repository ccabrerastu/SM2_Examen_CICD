import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID, IsInt, Min, Max } from 'class-validator';

export class SubmitQuizAnswerDto {
  @ApiProperty({
    description: 'Question ID',
    example: 'uuid-question-id',
  })
  @IsNotEmpty()
  @IsUUID()
  questionId!: string;

  @ApiProperty({
    description: 'Selected answer index (0-3)',
    example: 0,
  })
  @IsNotEmpty()
  @IsInt()
  @Min(0)
  @Max(3)
  answerIndex!: number;
}

export class QuizAnswerResultDto {
  @ApiProperty({ description: 'Whether answer is correct', example: true })
  isCorrect!: boolean;

  @ApiProperty({
    description: 'Hint for the question (if incorrect)',
    example: 'Think about data storage',
  })
  hint!: string | null;

  @ApiProperty({ description: 'Explanation (optional)', example: 'Variables store data values...' })
  explanation!: string | null;

  @ApiProperty({
    description: 'Correct answer text (only if incorrect)',
    example: 'A container for data',
  })
  correctAnswer!: string | null;
}

export class SubmitQuizAnswerResponseDto {
  @ApiProperty({ description: 'Success indicator', example: true })
  success!: boolean;

  @ApiProperty({ description: 'Answer result', type: QuizAnswerResultDto })
  data!: QuizAnswerResultDto;

  @ApiProperty({ description: 'Response message', example: 'Answer submitted successfully' })
  message!: string;
}
