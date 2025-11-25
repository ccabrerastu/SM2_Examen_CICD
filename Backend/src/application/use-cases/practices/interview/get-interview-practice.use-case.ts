import { Injectable, NotFoundException, ForbiddenException, Inject } from '@nestjs/common';
import { InterviewPractice } from '../../../../domain/entities/interview-practice.entity';
import { IInterviewPracticeRepository } from '../../../interfaces/repositories/interview-practice-repository.interface';

@Injectable()
export class GetInterviewPracticeUseCase {
  constructor(
    @Inject('IInterviewPracticeRepository')
    private readonly interviewPracticeRepository: IInterviewPracticeRepository,
  ) {}

  async execute(practiceId: string, userId: string): Promise<InterviewPractice> {
    const practice = await this.interviewPracticeRepository.findById(practiceId);

    if (!practice) {
      throw new NotFoundException('Interview practice not found');
    }

    // Verify that the practice belongs to the user
    if (practice.practiceSession.userId !== userId) {
      throw new ForbiddenException('You do not have access to this practice');
    }

    return practice;
  }

  async getBySessionId(sessionId: string, userId: string): Promise<InterviewPractice> {
    const practice = await this.interviewPracticeRepository.findByPracticeSessionId(sessionId);

    if (!practice) {
      throw new NotFoundException('Interview practice not found for this session');
    }

    // Verify that the practice belongs to the user
    if (practice.practiceSession.userId !== userId) {
      throw new ForbiddenException('You do not have access to this practice');
    }

    return practice;
  }
}
