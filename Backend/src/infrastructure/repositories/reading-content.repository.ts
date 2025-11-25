import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ReadingContent } from '../../domain/entities/reading-content.entity';

@Injectable()
export class ReadingContentRepository {
  constructor(
    @InjectRepository(ReadingContent)
    private readonly readingContentRepository: Repository<ReadingContent>,
  ) {}

  async findAll(): Promise<ReadingContent[]> {
    return await this.readingContentRepository.find();
  }

  async findById(id: string): Promise<ReadingContent | null> {
    return await this.readingContentRepository.findOne({
      where: { id },
      relations: ['quizQuestions'],
    });
  }

  async findByReadingChapterId(readingChapterId: string): Promise<ReadingContent | null> {
    return await this.readingContentRepository.findOne({
      where: { readingChapterId },
      relations: ['quizQuestions'],
    });
  }

  async findAllByReadingChapterId(readingChapterId: string): Promise<ReadingContent[]> {
    return await this.readingContentRepository.find({
      where: { readingChapterId },
      relations: ['quizQuestions'],
    });
  }

  async create(readingContentData: Partial<ReadingContent>): Promise<ReadingContent> {
    const readingContent = this.readingContentRepository.create(readingContentData);
    return await this.readingContentRepository.save(readingContent);
  }

  async update(
    id: string,
    readingContentData: Partial<Omit<ReadingContent, 'readingChapter' | 'quizQuestions'>>,
  ): Promise<ReadingContent> {
    await this.readingContentRepository.update(id, readingContentData as any);
    const updated = await this.findById(id);

    if (!updated) {
      throw new Error('Reading content not found after update');
    }

    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.readingContentRepository.delete(id);
    return (result.affected || 0) > 0;
  }
}
