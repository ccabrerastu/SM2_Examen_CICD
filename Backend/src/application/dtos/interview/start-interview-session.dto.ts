import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class StartInterviewSessionDto {
  @ApiProperty({ example: 'uuid-topic-123', description: 'Topic ID to start interview' })
  @IsUUID()
  topicId!: string;
}

export class InterviewQuestionInSessionDto {
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

export class StartInterviewSessionResponseDto {
  @ApiProperty({ example: 'uuid-session-123', description: 'Interview session ID' })
  sessionId!: string;

  @ApiProperty({ example: 'uuid-topic-123', description: 'Topic ID' })
  topicId!: string;

  @ApiProperty({ example: 'JavaScript', description: 'Topic name' })
  topicName!: string;

  @ApiProperty({ example: 5, description: 'Total number of questions in this interview' })
  totalQuestions!: number;

  @ApiProperty({ example: 5, description: 'Estimated duration in minutes' })
  estimatedDurationMinutes!: number;

  @ApiProperty({ type: [InterviewQuestionInSessionDto], description: 'List of interview questions' })
  questions!: InterviewQuestionInSessionDto[];

  @ApiProperty({ example: '2025-09-12T10:00:00Z', description: 'Session started timestamp' })
  startedAt!: Date;

  @ApiProperty({ example: 0, description: 'Current question index (for resuming sessions)', required: false })
  currentQuestionIndex?: number;
}
