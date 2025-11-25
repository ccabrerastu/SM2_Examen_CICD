import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { QuizQuestion } from '../../domain/entities/quiz-question.entity';

@Injectable()
export class QuizQuestionRepository {
  constructor(
    @InjectRepository(QuizQuestion)
    private readonly quizQuestionRepository: Repository<QuizQuestion>,
  ) {}

  async findAll(): Promise<QuizQuestion[]> {
    return await this.quizQuestionRepository.find({
      order: { order: 'ASC' },
    });
  }

  async findById(id: string): Promise<QuizQuestion | null> {
    return await this.quizQuestionRepository.findOne({
      where: { id },
    });
  }

  async findByReadingContentId(readingContentId: string): Promise<QuizQuestion[]> {
    return await this.quizQuestionRepository.find({
      where: { readingContentId },
      order: { order: 'ASC' },
    });
  }

  async findByReadingContentIdAndOrder(
    readingContentId: string,
    order: number,
  ): Promise<QuizQuestion | null> {
    return await this.quizQuestionRepository.findOne({
      where: { readingContentId, order },
    });
  }

  async create(quizQuestionData: Partial<QuizQuestion>): Promise<QuizQuestion> {
    const quizQuestion = this.quizQuestionRepository.create(quizQuestionData);
    return await this.quizQuestionRepository.save(quizQuestion);
  }

  async update(
    id: string,
    quizQuestionData: Partial<Omit<QuizQuestion, 'readingContent'>>,
  ): Promise<QuizQuestion> {
    await this.quizQuestionRepository.update(id, quizQuestionData as any);
    const updated = await this.findById(id);

    if (!updated) {
      throw new Error('Quiz question not found after update');
    }

    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.quizQuestionRepository.delete(id);
    return (result.affected || 0) > 0;
  }

  async countByReadingContentId(readingContentId: string): Promise<number> {
    return await this.quizQuestionRepository.count({
      where: { readingContentId },
    });
  }
}
