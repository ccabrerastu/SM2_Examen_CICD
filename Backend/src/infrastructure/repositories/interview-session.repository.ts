import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InterviewSession, InterviewStatus } from '../../domain/entities/interview-session.entity';

@Injectable()
export class InterviewSessionRepository {
  constructor(
    @InjectRepository(InterviewSession)
    private readonly repository: Repository<InterviewSession>,
  ) {}

  /**
   * Create a new interview session
   */
  async create(session: InterviewSession): Promise<InterviewSession> {
    return this.repository.save(session);
  }

  /**
   * Find session by ID
   */
  async findById(id: string): Promise<InterviewSession | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['user', 'topic'],
    });
  }

  /**
   * Find session by ID (without relations for performance)
   */
  async findByIdSimple(id: string): Promise<InterviewSession | null> {
    return this.repository.findOne({ where: { id } });
  }

  /**
   * Find all sessions for a user
   */
  async findByUserId(userId: string): Promise<InterviewSession[]> {
    return this.repository.find({
      where: { userId },
      relations: ['topic'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Find active (in-progress) session for a user and topic
   */
  async findActiveSessionByUserAndTopic(userId: string, topicId: string): Promise<InterviewSession | null> {
    return this.repository.findOne({
      where: {
        userId,
        topicId,
        status: InterviewStatus.IN_PROGRESS,
      },
      relations: ['topic'],
    });
  }

  /**
   * Find completed sessions for a user
   */
  async findCompletedByUserId(userId: string): Promise<InterviewSession[]> {
    return this.repository.find({
      where: { userId, status: InterviewStatus.COMPLETED },
      relations: ['topic'],
      order: { completedAt: 'DESC' },
    });
  }

  /**
   * Update session
   */
  async update(session: InterviewSession): Promise<InterviewSession> {
    return this.repository.save(session);
  }

  /**
   * Count sessions by user ID
   */
  async countByUserId(userId: string): Promise<number> {
    return this.repository.count({ where: { userId } });
  }

  /**
   * Count completed sessions by user ID
   */
  async countCompletedByUserId(userId: string): Promise<number> {
    return this.repository.count({
      where: { userId, status: InterviewStatus.COMPLETED },
    });
  }

  /**
   * Get average score for user
   */
  async getAverageScoreByUserId(userId: string): Promise<number> {
    const result = await this.repository
      .createQueryBuilder('session')
      .select('AVG(session.overall_score)', 'avgScore')
      .where('session.user_id = :userId', { userId })
      .andWhere('session.status = :status', { status: InterviewStatus.COMPLETED })
      .getRawOne();

    return result?.avgScore ? parseFloat(result.avgScore) : 0;
  }

  /**
   * Delete session (hard delete - for cleanup)
   */
  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected !== undefined && result.affected !== null && result.affected > 0);
  }
}
