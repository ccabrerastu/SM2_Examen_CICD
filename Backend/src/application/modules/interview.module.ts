import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InterviewTopic } from '../../domain/entities/interview-topic.entity';
import { InterviewQuestion } from '../../domain/entities/interview-question.entity';
import { InterviewSession } from '../../domain/entities/interview-session.entity';
import { InterviewTopicRepository } from '../../infrastructure/repositories/interview-topic.repository';
import { InterviewQuestionRepository } from '../../infrastructure/repositories/interview-question.repository';
import { InterviewSessionRepository } from '../../infrastructure/repositories/interview-session.repository';
import { AIEvaluationService } from '../services/interview/ai-evaluation.service';
import { InterviewService } from '../services/interview/interview.service';
import { InterviewController } from '../../presentation/controllers/interview/interview.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      InterviewTopic,
      InterviewQuestion,
      InterviewSession,
    ]),
  ],
  controllers: [InterviewController],
  providers: [
    InterviewTopicRepository,
    InterviewQuestionRepository,
    InterviewSessionRepository,
    AIEvaluationService,
    InterviewService,
  ],
  exports: [InterviewService],
})
export class InterviewModule {}
