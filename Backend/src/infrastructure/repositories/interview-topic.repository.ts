import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InterviewTopic } from '../../domain/entities/interview-topic.entity';

@Injectable()
export class InterviewTopicRepository {
  constructor(
    @InjectRepository(InterviewTopic)
    private readonly repository: Repository<InterviewTopic>,
  ) {}

  /**
   * Find all active topics with their questions
   */
  async findAllActive(): Promise<InterviewTopic[]> {
    return this.repository.find({
      where: { isActive: true },
      relations: ['questions'],
      order: { order: 'ASC' },
    });
  }

  /**
   * Find a topic by ID with its questions
   */
  async findById(id: string): Promise<InterviewTopic | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['questions'],
    });
  }

  /**
   * Find active questions for a specific topic
   */
  async findActiveQuestionsForTopic(topicId: string): Promise<InterviewTopic | null> {
    return this.repository.findOne({
      where: { id: topicId, isActive: true },
      relations: ['questions'],
    });
  }

  /**
   * Create a new topic
   */
  async create(topic: InterviewTopic): Promise<InterviewTopic> {
    return this.repository.save(topic);
  }

  /**
   * Update an existing topic
   */
  async update(id: string, updates: Partial<InterviewTopic>): Promise<InterviewTopic | null> {
    await this.repository.update(id, updates);
    return this.findById(id);
  }

  /**
   * Delete a topic (soft delete by setting isActive = false)
   */
  async softDelete(id: string): Promise<boolean> {
    const result = await this.repository.update(id, { isActive: false });
    return result.affected !== undefined && result.affected > 0;
  }

  /**
   * Count total topics
   */
  async count(): Promise<number> {
    return this.repository.count({ where: { isActive: true } });
  }
}
