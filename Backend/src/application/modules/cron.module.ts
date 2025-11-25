import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { DailyLivesModule } from './daily-lives.module';
import { DailyLivesResetService } from '../services/cron/daily-lives-reset.service';

@Module({
  imports: [
    // Schedule module for cron jobs
    ScheduleModule.forRoot(),

    // Import DailyLives module to get repository
    DailyLivesModule,
  ],
  providers: [
    // Cron services
    DailyLivesResetService,
  ],
  exports: [DailyLivesResetService],
})
export class CronModule {}
