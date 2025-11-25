import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { ReadingPractice } from '../../../../domain/entities/reading-practice.entity';
import { IReadingPracticeRepository } from '../../../interfaces/repositories/reading-practice-repository.interface';
import { AddBookmarkDto } from '../../../dtos/reading-practice.dto';

@Injectable()
export class AddBookmarkUseCase {
  constructor(private readonly readingPracticeRepository: IReadingPracticeRepository) {}

  async execute(
    practiceId: string,
    userId: string,
    bookmarkDto: AddBookmarkDto,
  ): Promise<ReadingPractice> {
    const practice = await this.readingPracticeRepository.findById(practiceId);

    if (!practice) {
      throw new NotFoundException('Reading practice not found');
    }

    if (practice.practiceSession.userId !== userId) {
      throw new ForbiddenException('You do not have access to this practice');
    }

    // Add bookmark
    practice.addBookmark(bookmarkDto.position, bookmarkDto.note);

    // Update practice
    const updateData: Partial<ReadingPractice> = {};
    if (practice.bookmarks) {
      updateData.bookmarks = practice.bookmarks;
    }

    const updatedPractice = await this.readingPracticeRepository.update(practice.id, updateData);

    return updatedPractice;
  }

  async removeBookmark(
    practiceId: string,
    userId: string,
    position: number,
  ): Promise<ReadingPractice> {
    const practice = await this.readingPracticeRepository.findById(practiceId);

    if (!practice) {
      throw new NotFoundException('Reading practice not found');
    }

    if (practice.practiceSession.userId !== userId) {
      throw new ForbiddenException('You do not have access to this practice');
    }

    // Remove bookmark
    if (practice.bookmarks) {
      practice.bookmarks = practice.bookmarks.filter(bookmark => bookmark.position !== position);
    }

    // Update practice
    const updateData: Partial<ReadingPractice> = {};
    if (practice.bookmarks) {
      updateData.bookmarks = practice.bookmarks;
    }

    const updatedPractice = await this.readingPracticeRepository.update(practice.id, updateData);

    return updatedPractice;
  }
}
