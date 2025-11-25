import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import { InterviewPractice } from '../../../../domain/entities/interview-practice.entity';
import { PracticeStatus } from '../../../../domain/entities/practice-session.entity';
import { IInterviewPracticeRepository } from '../../../interfaces/repositories/interview-practice-repository.interface';
import { UpdateConversationFlowDto } from '../../../dtos/interview-practice.dto';

@Injectable()
export class UpdateConversationFlowUseCase {
  constructor(
    @Inject('IInterviewPracticeRepository')
    private readonly interviewPracticeRepository: IInterviewPracticeRepository,
  ) {}

  async execute(
    practiceId: string,
    userId: string,
    _flowDto: UpdateConversationFlowDto,
  ): Promise<InterviewPractice> {
    const practice = await this.interviewPracticeRepository.findById(practiceId);

    if (!practice) {
      throw new NotFoundException('Interview practice not found');
    }

    if (practice.practiceSession.userId !== userId) {
      throw new ForbiddenException('You do not have access to this practice');
    }

    if (practice.practiceSession.status === PracticeStatus.COMPLETED) {
      throw new BadRequestException('Cannot update conversation flow in a completed practice');
    }

    // Note: Conversation flow is updated through answerQuestion method
    // This method could be used for updating specific flow properties if needed

    // Update practice (no changes needed for now)
    const updatedPractice = await this.interviewPracticeRepository.findById(practice.id);

    if (!updatedPractice) {
      throw new NotFoundException('Practice not found after update');
    }

    return updatedPractice;
  }

  async addAreaForImprovement(
    practiceId: string,
    userId: string,
    area: string,
  ): Promise<InterviewPractice> {
    const practice = await this.interviewPracticeRepository.findById(practiceId);

    if (!practice) {
      throw new NotFoundException('Interview practice not found');
    }

    if (practice.practiceSession.userId !== userId) {
      throw new ForbiddenException('You do not have access to this practice');
    }

    // Add area for improvement
    practice.addAreaForImprovement(area);

    // Update practice
    const updatedPractice = await this.interviewPracticeRepository.update(practice.id, {
      ...(practice.areasForImprovement && { areasForImprovement: practice.areasForImprovement }),
    });

    return updatedPractice;
  }

  async addStrength(
    practiceId: string,
    userId: string,
    strength: string,
  ): Promise<InterviewPractice> {
    const practice = await this.interviewPracticeRepository.findById(practiceId);

    if (!practice) {
      throw new NotFoundException('Interview practice not found');
    }

    if (practice.practiceSession.userId !== userId) {
      throw new ForbiddenException('You do not have access to this practice');
    }

    // Add strength
    practice.addStrength(strength);

    // Update practice
    const updatedPractice = await this.interviewPracticeRepository.update(practice.id, {
      ...(practice.strengthsIdentified && { strengthsIdentified: practice.strengthsIdentified }),
    });

    return updatedPractice;
  }
}
