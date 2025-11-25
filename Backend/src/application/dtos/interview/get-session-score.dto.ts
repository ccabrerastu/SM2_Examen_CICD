import { ApiProperty } from '@nestjs/swagger';

export class SessionScoreBreakdownDto {
  @ApiProperty({ example: 85.5, description: 'Fluency average score (0-100)' })
  fluencyScore!: number;

  @ApiProperty({ example: 78.3, description: 'Grammar average score (0-100)' })
  grammarScore!: number;

  @ApiProperty({ example: 82.1, description: 'Vocabulary average score (0-100)' })
  vocabularyScore!: number;

  @ApiProperty({ example: 80.7, description: 'Pronunciation average score (0-100)' })
  pronunciationScore!: number;

  @ApiProperty({ example: 88.2, description: 'Coherence average score (0-100)' })
  coherenceScore!: number;

  @ApiProperty({ example: 83.4, description: 'Overall weighted average score (0-100)' })
  overallScore!: number;
}

export class QuestionAnswerSummaryDto {
  @ApiProperty({ example: 'uuid-question-123', description: 'Question ID' })
  questionId!: string;

  @ApiProperty({ example: 'What is JavaScript?', description: 'Question text' })
  questionText!: string;

  @ApiProperty({ example: 'conceptual', description: 'Question category' })
  category!: string;

  @ApiProperty({ example: 'JavaScript is a high-level programming language...', description: 'User answer' })
  answerText!: string;

  @ApiProperty({ example: 83, description: 'Score for this question (0-100)' })
  score!: number;

  @ApiProperty({
    example: 'Good explanation showing understanding of the concept.',
    description: 'AI feedback for this answer',
    required: false,
  })
  feedback?: string;
}

export class GetSessionScoreResponseDto {
  @ApiProperty({ example: 'uuid-session-123', description: 'Session ID' })
  sessionId!: string;

  @ApiProperty({ example: 'uuid-topic-123', description: 'Topic ID' })
  topicId!: string;

  @ApiProperty({ example: 'JavaScript', description: 'Topic name' })
  topicName!: string;

  @ApiProperty({ example: 'completed', description: 'Session status' })
  status!: string;

  @ApiProperty({ type: SessionScoreBreakdownDto, description: 'Detailed score breakdown' })
  scores!: SessionScoreBreakdownDto;

  @ApiProperty({ example: true, description: 'Whether the user passed (score >= 70)' })
  passed!: boolean;

  @ApiProperty({
    example: 'Great job! Your English level is very good, keep practicing.',
    description: 'Overall feedback for the interview',
  })
  finalFeedback!: string;

  @ApiProperty({
    example: ['Strong vocabulary usage', 'Clear pronunciation', 'Good sentence structure'],
    description: 'Identified strengths',
  })
  strengths!: string[];

  @ApiProperty({
    example: ['Work on grammar accuracy', 'Try to speak more fluently without pauses'],
    description: 'Areas needing improvement',
  })
  areasForImprovement!: string[];

  @ApiProperty({ type: [QuestionAnswerSummaryDto], description: 'Summary of all answered questions' })
  questionAnswers!: QuestionAnswerSummaryDto[];

  @ApiProperty({ example: 5, description: 'Total questions in interview' })
  totalQuestions!: number;

  @ApiProperty({ example: 5, description: 'Number of questions answered' })
  questionsAnswered!: number;

  @ApiProperty({ example: 420, description: 'Total time spent in seconds' })
  totalTimeSpentSeconds!: number;

  @ApiProperty({ example: '2025-09-12T10:00:00Z', description: 'Interview start timestamp' })
  startedAt!: Date;

  @ApiProperty({ example: '2025-09-12T10:07:00Z', description: 'Interview completion timestamp' })
  completedAt!: Date;
}
