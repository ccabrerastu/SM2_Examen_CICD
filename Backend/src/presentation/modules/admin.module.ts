import { Module } from '@nestjs/common';
import { CronModule } from '../../application/modules/cron.module';
import { CronMonitorController } from '../controllers/admin/cron-monitor.controller';

@Module({
  imports: [CronModule],
  controllers: [CronMonitorController],
  providers: [],
  exports: [],
})
export class AdminModule {}
