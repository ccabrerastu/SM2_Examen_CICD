import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Translation } from '../../domain/entities/translation.entity';
import { VocabularyItem } from '../../domain/entities/vocabulary-item.entity';
import { TranslationService } from '../services/translation.service';
import { TranslationController } from '../../presentation/controllers/translation/translation.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Translation, VocabularyItem])],
  providers: [TranslationService],
  controllers: [TranslationController],
  exports: [TranslationService],
})
export class TranslationModule {}
