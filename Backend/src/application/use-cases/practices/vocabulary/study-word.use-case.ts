import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { VocabularyPractice } from '../../../../domain/entities/vocabulary-practice.entity';
import { PracticeStatus } from '../../../../domain/entities/practice-session.entity';
import { IVocabularyPracticeRepository } from '../../../interfaces/repositories/vocabulary-practice-repository.interface';
import { IPracticeSessionRepository } from '../../../interfaces/repositories/practice-session-repository.interface';
import { StudyWordDto } from '../../../dtos/vocabulary-practice.dto';

@Injectable()
export class StudyWordUseCase {
  constructor(
    private readonly vocabularyPracticeRepository: IVocabularyPracticeRepository,
    private readonly practiceSessionRepository: IPracticeSessionRepository,
  ) {}

  async execute(
    practiceId: string,
    userId: string,
    studyWordDto: StudyWordDto,
  ): Promise<VocabularyPractice> {
    const practice = await this.vocabularyPracticeRepository.findById(practiceId);

    if (!practice) {
      throw new NotFoundException('Vocabulary practice not found');
    }

    if (practice.practiceSession.userId !== userId) {
      throw new ForbiddenException('You do not have access to this practice');
    }

    if (practice.practiceSession.status === PracticeStatus.COMPLETED) {
      throw new BadRequestException('Cannot study words in a completed practice');
    }

    // Study the word
    practice.studyWord(studyWordDto.wordId, studyWordDto.timeSpentSeconds);

    // Update practice
    const updatedPractice = await this.vocabularyPracticeRepository.update(practice.id, {
      wordsStudied: practice.wordsStudied,
      currentWordIndex: practice.currentWordIndex,
      studiedWords: practice.studiedWords || [],
    });

    // Update session progress and time
    const newProgress = practice.getProgress();
    const totalTimeSpent =
      practice.practiceSession.timeSpentSeconds + studyWordDto.timeSpentSeconds;

    await this.practiceSessionRepository.update(practice.practiceSession.id, {
      progress: newProgress,
      timeSpentSeconds: totalTimeSpent,
    });

    return updatedPractice;
  }
}
