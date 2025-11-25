import { ApiProperty } from '@nestjs/swagger';

export class InterviewTopicDto {
  @ApiProperty({ example: 'uuid-123', description: 'Topic ID' })
  id!: string;

  @ApiProperty({ example: 'JavaScript', description: 'Topic name' })
  name!: string;

  @ApiProperty({
    example: 'Technical interview focused on JavaScript programming language',
    description: 'Topic description',
  })
  description?: string;

  @ApiProperty({ example: 'programming_language', description: 'Topic category' })
  category!: string;

  @ApiProperty({ example: 'intermediate', description: 'Difficulty level' })
  difficulty!: string;

  @ApiProperty({ example: 'javascript', description: 'Icon name' })
  iconName?: string;

  @ApiProperty({ example: 'https://example.com/icons/js.png', description: 'Icon URL' })
  iconUrl?: string;

  @ApiProperty({ example: 8, description: 'Estimated duration in minutes' })
  estimatedDurationMinutes!: number;

  @ApiProperty({ example: 5, description: 'Total number of questions' })
  totalQuestions!: number;

  @ApiProperty({ example: 1, description: 'Display order' })
  order!: number;

  @ApiProperty({ example: true, description: 'Whether topic is active' })
  isActive!: boolean;
}

export class GetTopicsResponseDto {
  @ApiProperty({ example: true, description: 'Success status' })
  success!: boolean;

  @ApiProperty({ type: [InterviewTopicDto], description: 'List of available interview topics' })
  topics!: InterviewTopicDto[];

  @ApiProperty({ example: 4, description: 'Total number of topics' })
  totalTopics!: number;
}
