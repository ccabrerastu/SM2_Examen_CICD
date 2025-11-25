import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VocabularyItem } from '../../domain/entities/vocabulary-item.entity';

@Injectable()
export class VocabularyItemRepository {
  private readonly logger = new Logger(VocabularyItemRepository.name);

  constructor(
    @InjectRepository(VocabularyItem)
    private readonly repository: Repository<VocabularyItem>,
  ) {}

  async findByChapterId(
    chapterId: string,
    skip: number = 0,
    take: number = 10,
  ): Promise<[VocabularyItem[], number]> {
    this.logger.log(
      `Finding vocabulary items for chapter ${chapterId} (skip: ${skip}, take: ${take})`,
    );

    return await this.repository.findAndCount({
      where: { chapterId },
      skip,
      take,
      order: {
        createdAt: 'ASC',
      },
    });
  }

  async findById(id: string): Promise<VocabularyItem | null> {
    this.logger.log(`Finding vocabulary item by ID: ${id}`);
    return await this.repository.findOne({ where: { id } });
  }

  async countByChapterId(chapterId: string): Promise<number> {
    this.logger.log(`Counting vocabulary items for chapter ${chapterId}`);
    return await this.repository.count({ where: { chapterId } });
  }

  async save(vocabularyItem: VocabularyItem): Promise<VocabularyItem> {
    this.logger.log(`Saving vocabulary item: ${vocabularyItem.englishTerm}`);
    return await this.repository.save(vocabularyItem);
  }

  async saveMany(vocabularyItems: VocabularyItem[]): Promise<VocabularyItem[]> {
    this.logger.log(`Saving ${vocabularyItems.length} vocabulary items`);
    return await this.repository.save(vocabularyItems);
  }
}
