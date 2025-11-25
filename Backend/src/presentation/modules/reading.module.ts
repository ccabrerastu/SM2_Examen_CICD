import { Module } from '@nestjs/common';
import { ReadingModule as ReadingApplicationModule } from '../../application/modules/reading.module';
import { ReadingController } from '../controllers/reading/reading.controller';

@Module({
  imports: [ReadingApplicationModule],
  controllers: [ReadingController],
})
export class ReadingModule {}
