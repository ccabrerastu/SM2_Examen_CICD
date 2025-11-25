import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ReadingPractice } from '../../../../domain/entities/reading-practice.entity';
import { IReadingPracticeRepository } from '../../../interfaces/repositories/reading-practice-repository.interface';
import { AddVocabularyDto } from '../../../dtos/reading-practice.dto';

@Injectable()
export class AddVocabularyUseCase {
  constructor(private readonly readingPracticeRepository: IReadingPracticeRepository) {}

  async execute(
    practiceId: string,
    userId: string,
    vocabularyDto: AddVocabularyDto,
  ): Promise<ReadingPractice> {
    const practice = await this.readingPracticeRepository.findById(practiceId);

    if (!practice) {
      throw new NotFoundException('Reading practice not found');
    }

    if (practice.practiceSession.userId !== userId) {
      throw new BadRequestException('You do not have access to this practice');
    }

    // Add vocabulary word
    practice.addVocabularyWord(
      vocabularyDto.word,
      vocabularyDto.context,
      vocabularyDto.position,
      vocabularyDto.definition,
    );

    // Update practice
    const updateData: Partial<ReadingPractice> = {};
    if (practice.vocabularyEncountered) {
      updateData.vocabularyEncountered = practice.vocabularyEncountered;
    }

    const updatedPractice = await this.readingPracticeRepository.update(practice.id, updateData);

    return updatedPractice;
  }

  async removeVocabulary(
    practiceId: string,
    userId: string,
    word: string,
  ): Promise<ReadingPractice> {
    const practice = await this.readingPracticeRepository.findById(practiceId);

    if (!practice) {
      throw new NotFoundException('Reading practice not found');
    }

    if (practice.practiceSession.userId !== userId) {
      throw new BadRequestException('You do not have access to this practice');
    }

    // Remove vocabulary word
    if (practice.vocabularyEncountered) {
      practice.vocabularyEncountered = practice.vocabularyEncountered.filter(
        vocab => vocab.word !== word,
      );
    }

    // Update practice
    const updateData: Partial<ReadingPractice> = {};
    if (practice.vocabularyEncountered) {
      updateData.vocabularyEncountered = practice.vocabularyEncountered;
    }

    const updatedPractice = await this.readingPracticeRepository.update(practice.id, updateData);

    return updatedPractice;
  }
}
