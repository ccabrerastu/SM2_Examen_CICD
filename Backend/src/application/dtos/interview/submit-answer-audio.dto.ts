import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsInt, IsOptional, Min } from 'class-validator';

/**
 * DTO for submitting audio answer
 * The audio file is handled separately via multipart/form-data
 */
export class SubmitAnswerAudioDto {
  @ApiProperty({ example: 'uuid-session-123', description: 'Interview session ID' })
  @IsUUID()
  sessionId!: string;

  @ApiProperty({ example: 'uuid-question-123', description: 'Question ID being answered' })
  @IsUUID()
  questionId!: string;

  @ApiProperty({ example: 85, description: 'Time spent answering in seconds', required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  timeSpentSeconds?: number;
}
