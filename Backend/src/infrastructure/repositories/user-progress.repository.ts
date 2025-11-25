import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserProgress } from '../../domain/entities/user-progress.entity';
import { IUserProgressRepository } from '../../application/interfaces/repositories/user-progress-repository.interface';
import { CreateProgressDto } from '../../application/dtos/progress/create-progress.dto';
import { UpdateProgressDto } from '../../application/dtos/progress/update-progress.dto';

@Injectable()
export class UserProgressRepository implements IUserProgressRepository {
  constructor(
    @InjectRepository(UserProgress)
    private readonly repository: Repository<UserProgress>,
  ) {}

  async create(userId: string, createProgressDto: CreateProgressDto): Promise<UserProgress> {
    const userProgress = this.repository.create({
      userId,
      chapterId: createProgressDto.chapterId,
      score: createProgressDto.score || null,
      lastActivity: new Date(),
      extraData: createProgressDto.extraData || null,
    });

    return await this.repository.save(userProgress);
  }

  async findById(id: string): Promise<UserProgress | null> {
    return await this.repository.findOne({
      where: { id },
      relations: ['user'],
    });
  }

  async findByUserId(userId: string): Promise<UserProgress[]> {
    return await this.repository.find({
      where: { userId },
      order: { lastActivity: 'DESC' },
    });
  }

  async findByUserAndChapter(userId: string, chapterId: string): Promise<UserProgress | null> {
    return await this.repository.findOne({
      where: { userId, chapterId },
    });
  }

  async update(id: string, updateProgressDto: UpdateProgressDto): Promise<UserProgress> {
    const existing = await this.repository.findOne({ where: { id } });
    if (!existing) {
      throw new Error('Progress record not found');
    }

    const updated = this.repository.merge(existing, {
      score: updateProgressDto.score !== undefined ? updateProgressDto.score : existing.score,
      extraData:
        updateProgressDto.extraData !== undefined
          ? updateProgressDto.extraData
          : existing.extraData,
      lastActivity: new Date(),
    });

    return await this.repository.save(updated);
  }

  async createOrUpdate(
    userId: string,
    createProgressDto: CreateProgressDto,
  ): Promise<UserProgress> {
    const existing = await this.findByUserAndChapter(userId, createProgressDto.chapterId);

    if (existing) {
      const updateData = {
        ...(createProgressDto.score !== undefined && { score: createProgressDto.score }),
        ...(createProgressDto.extraData !== undefined && {
          extraData: createProgressDto.extraData,
        }),
      } as UpdateProgressDto;

      return await this.update(existing.id, updateData);
    }

    return await this.create(userId, createProgressDto);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async getUserStats(userId: string): Promise<{ totalRecords: number; lastActivity: Date | null }> {
    const records = await this.findByUserId(userId);
    const lastActivity = records.length > 0 ? records[0].lastActivity : null;

    return {
      totalRecords: records.length,
      lastActivity,
    };
  }
}
