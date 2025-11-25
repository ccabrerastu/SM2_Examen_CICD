import { Module } from '@nestjs/common';
import { DailyLivesModule } from '../../application/modules/daily-lives.module';
import { DailyLivesController } from '../controllers/lives/daily-lives.controller';

@Module({
  imports: [DailyLivesModule],
  controllers: [DailyLivesController],
})
export class LivesModule {}
