import { Module } from '@nestjs/common';
import { InterviewPracticeModule as InterviewPracticeApplicationModule } from '../../application/modules/interview-practice.module';
import { InterviewPracticeController } from '../controllers/practices/interview-practice.controller';

@Module({
  imports: [InterviewPracticeApplicationModule],
  controllers: [InterviewPracticeController],
})
export class InterviewPracticeModule {}
