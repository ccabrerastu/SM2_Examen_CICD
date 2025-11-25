import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InterviewQuestion, QuestionCategory, QuestionDifficulty } from '../../domain/entities/interview-question.entity';

@Injectable()
export class InterviewQuestionRepository {
  constructor(
    @InjectRepository(InterviewQuestion)
    private readonly repository: Repository<InterviewQuestion>,
  ) {}

  /**
   * Find all active questions for a specific topic
   */
  async findByTopicId(topicId: string): Promise<InterviewQuestion[]> {
    return this.repository.find({
      where: { topicId, isActive: true },
      order: { order: 'ASC' },
    });
  }

  /**
   * Find a question by ID
   */
  async findById(id: string): Promise<InterviewQuestion | null> {
    return this.repository.findOne({ where: { id } });
  }

  /**
   * Find questions by category
   */
  async findByCategory(topicId: string, category: QuestionCategory): Promise<InterviewQuestion[]> {
    return this.repository.find({
      where: { topicId, category, isActive: true },
      order: { order: 'ASC' },
    });
  }

  /**
   * Find questions by difficulty
   */
  async findByDifficulty(topicId: string, difficulty: QuestionDifficulty): Promise<InterviewQuestion[]> {
    return this.repository.find({
      where: { topicId, difficulty, isActive: true },
      order: { order: 'ASC' },
    });
  }

  /**
   * Create a new question
   */
  async create(question: InterviewQuestion): Promise<InterviewQuestion> {
    return this.repository.save(question);
  }

  /**
   * Update an existing question
   */
  async update(id: string, updates: Partial<InterviewQuestion>): Promise<InterviewQuestion | null> {
    await this.repository.update(id, updates);
    return this.findById(id);
  }

  /**
   * Delete a question (soft delete)
   */
  async softDelete(id: string): Promise<boolean> {
    const result = await this.repository.update(id, { isActive: false });
    return result.affected !== undefined && result.affected > 0;
  }

  /**
   * Count questions for a topic
   */
  async countByTopicId(topicId: string): Promise<number> {
    return this.repository.count({ where: { topicId, isActive: true } });
  }

  /**
   * Find multiple questions by IDs (for session creation)
   */
  async findByIds(ids: string[]): Promise<InterviewQuestion[]> {
    return this.repository.findByIds(ids);
  }
}
