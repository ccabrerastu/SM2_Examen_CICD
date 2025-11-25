import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsString, MinLength, IsInt, IsOptional, Min } from 'class-validator';

export class SubmitAnswerDto {
  @ApiProperty({ example: 'uuid-session-123', description: 'Interview session ID' })
  @IsUUID()
  sessionId!: string;

  @ApiProperty({ example: 'uuid-question-123', description: 'Question ID being answered' })
  @IsUUID()
  questionId!: string;

  @ApiProperty({ example: 'JavaScript is a high-level programming language...', description: 'User answer text' })
  @IsString()
  @MinLength(10, { message: 'Answer must be at least 10 characters long' })
  answerText!: string;

  @ApiProperty({ example: 85, description: 'Time spent answering in seconds', required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  timeSpentSeconds?: number;
}

export class AnswerEvaluationDto {
  @ApiProperty({ example: 'uuid-question-123', description: 'Question ID' })
  questionId!: string;

  @ApiProperty({ example: 'What is JavaScript?', description: 'Question text' })
  questionText!: string;

  @ApiProperty({ example: 'JavaScript is a high-level programming language...', description: 'User answer' })
  answerText!: string;

  @ApiProperty({ example: 120, description: 'Answer length in characters' })
  answerLength!: number;

  @ApiProperty({ example: '2025-09-12T10:05:30Z', description: 'Answer submission timestamp' })
  submittedAt!: Date;

  // AI Evaluation Scores (0-100) - PLACEHOLDER for future AI integration
  @ApiProperty({ example: 85, description: 'Fluency score (0-100) - AI PLACEHOLDER', required: false })
  fluencyScore?: number;

  @ApiProperty({ example: 78, description: 'Grammar score (0-100) - AI PLACEHOLDER', required: false })
  grammarScore?: number;

  @ApiProperty({ example: 82, description: 'Vocabulary score (0-100) - AI PLACEHOLDER', required: false })
  vocabularyScore?: number;

  @ApiProperty({ example: 80, description: 'Pronunciation score (0-100) - AI PLACEHOLDER', required: false })
  pronunciationScore?: number;

  @ApiProperty({ example: 88, description: 'Coherence score (0-100) - AI PLACEHOLDER', required: false })
  coherenceScore?: number;

  @ApiProperty({ example: 83, description: 'Overall question score (0-100)', required: false })
  overallQuestionScore?: number;

  // AI Feedback - PLACEHOLDER for future AI integration
  @ApiProperty({
    example: 'Good answer! Your explanation shows understanding. Consider expanding on the event loop.',
    description: 'AI-generated feedback - PLACEHOLDER',
    required: false,
  })
  aiFeedback?: string;

  @ApiProperty({
    example: ['Minor grammar issue: "is used for" should be "is used to"'],
    description: 'Detected issues in the answer - AI PLACEHOLDER',
    required: false,
  })
  detectedIssues?: string[];

  @ApiProperty({
    example: ['Try to provide more specific examples', 'Expand on the event loop concept'],
    description: 'Suggestions for improvement - AI PLACEHOLDER',
    required: false,
  })
  suggestedImprovements?: string[];

  @ApiProperty({ example: 85, description: 'Time spent on this question in seconds', required: false })
  timeSpentSeconds?: number;

  @ApiProperty({ example: 1, description: 'Attempt number for this question', required: false })
  attemptNumber?: number;
}

export class SubmitAnswerResponseDto {
  @ApiProperty({ example: true, description: 'Whether submission was successful' })
  success!: boolean;

  @ApiProperty({ type: AnswerEvaluationDto, description: 'Evaluation of the submitted answer' })
  evaluation!: AnswerEvaluationDto;

  @ApiProperty({ example: 1, description: 'Current question index (0-based)' })
  currentQuestionIndex!: number;

  @ApiProperty({ example: 2, description: 'Number of questions answered so far' })
  questionsAnswered!: number;

  @ApiProperty({ example: 5, description: 'Total questions in interview' })
  totalQuestions!: number;

  @ApiProperty({ example: false, description: 'Whether the interview is now complete' })
  isCompleted!: boolean;

  @ApiProperty({
    example: { questionId: 'uuid-next-question', questionText: 'What is Python?' },
    description: 'Next question details (null if interview completed)',
    required: false,
  })
  nextQuestion?: {
    questionId: string;
    questionText: string;
    category: string;
    difficulty: string;
  };
}
