import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chapter } from '../../domain/entities/chapter.entity';
import { UserProgress } from '../../domain/entities/user-progress.entity';
import { VocabularyItem } from '../../domain/entities/vocabulary-item.entity';
import { ChapterRepository } from '../../infrastructure/repositories/chapter.repository';
import { VocabularyItemRepository } from '../../infrastructure/repositories/vocabulary-item.repository';
import { GetChaptersStatusUseCase } from '../use-cases/chapters/get-chapters-status.use-case';
import { CompleteChapterUseCase } from '../use-cases/chapters/complete-chapter.use-case';
import { GetVocabularyItemsUseCase } from '../use-cases/chapters/get-vocabulary-items.use-case';

@Module({
  imports: [TypeOrmModule.forFeature([Chapter, UserProgress, VocabularyItem])],
  providers: [
    ChapterRepository,
    {
      provide: 'IChapterRepository',
      useExisting: ChapterRepository,
    },
    VocabularyItemRepository,
    GetChaptersStatusUseCase,
    CompleteChapterUseCase,
    GetVocabularyItemsUseCase,
  ],
  exports: [
    ChapterRepository,
    'IChapterRepository',
    VocabularyItemRepository,
    GetChaptersStatusUseCase,
    CompleteChapterUseCase,
    GetVocabularyItemsUseCase,
  ],
})
export class ChaptersModule {}
