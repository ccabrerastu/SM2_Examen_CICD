import { Module } from '@nestjs/common';
import { ChaptersModule as ChaptersApplicationModule } from '../../application/modules/chapters.module';
import { ChaptersController } from '../controllers/chapters/chapters.controller';

@Module({
  imports: [ChaptersApplicationModule],
  controllers: [ChaptersController],
})
export class ChaptersModule {}
