import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ReadingQuiz } from '../../domain/entities/reading-quiz.entity';

@Injectable()
export class ReadingQuizRepository {
  constructor(
    @InjectRepository(ReadingQuiz)
    private readonly readingQuizRepository: Repository<ReadingQuiz>,
  ) {}

  async findAll(): Promise<ReadingQuiz[]> {
    return this.readingQuizRepository.find();
  }

  async findById(id: string): Promise<ReadingQuiz | null> {
    return this.readingQuizRepository.findOne({ where: { id } });
  }

  async findByReadingContentId(readingContentId: string): Promise<ReadingQuiz[]> {
    return this.readingQuizRepository.find({
      where: { readingContentId },
      order: { createdAt: 'ASC' },
    });
  }

  async create(readingQuiz: Partial<ReadingQuiz>): Promise<ReadingQuiz> {
    const newReadingQuiz = this.readingQuizRepository.create(readingQuiz);
    return this.readingQuizRepository.save(newReadingQuiz);
  }

  async update(
    id: string,
    readingQuizData: Partial<Record<string, unknown>>,
  ): Promise<ReadingQuiz | null> {
    await this.readingQuizRepository.update(id, readingQuizData);
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    await this.readingQuizRepository.delete(id);
  }
}
