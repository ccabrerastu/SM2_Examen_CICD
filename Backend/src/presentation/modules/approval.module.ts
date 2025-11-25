import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ApprovalController } from '../controllers/approval/approval.controller';
import { ApprovalEngineService } from '../../application/services/approval-engine.service';
import {
  EvaluateApprovalUseCase,
  ConfigureApprovalRuleUseCase,
  GetApprovalRulesUseCase,
  DeleteApprovalRuleUseCase,
  GetEvaluationHistoryUseCase,
  GetChapterEvaluationStatsUseCase,
  GetLatestEvaluationUseCase,
} from '../../application/use-cases/approval';
import { UpdateApprovalRuleUseCase } from '../../application/use-cases/approval/update-approval-rule.use-case';
import {
  ApprovalExceptionFilter,
  ApprovalHttpExceptionFilter,
} from '../filters/approval-exception.filter';
import { ApprovalAuditInterceptor } from '../interceptors/approval-audit.interceptor';
import { ApprovalRule, ApprovalEvaluation, ApprovalMetrics } from '../../domain/entities';
import {
  ApprovalRuleRepository,
  ApprovalEvaluationRepository,
  ApprovalMetricsRepository,
} from '../../infrastructure/repositories';
// Repository interfaces are used in providers below
import { UserRepository } from '../../infrastructure/repositories/user.repository';
import { User } from '../../domain/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ApprovalRule, ApprovalEvaluation, ApprovalMetrics, User])],
  controllers: [ApprovalController],
  providers: [
    // Service
    ApprovalEngineService,

    // Use Cases
    EvaluateApprovalUseCase,
    ConfigureApprovalRuleUseCase,
    UpdateApprovalRuleUseCase,
    GetApprovalRulesUseCase,
    DeleteApprovalRuleUseCase,
    GetEvaluationHistoryUseCase,
    GetChapterEvaluationStatsUseCase,
    GetLatestEvaluationUseCase,

    // Repository Providers
    {
      provide: 'IApprovalRuleRepository',
      useClass: ApprovalRuleRepository,
    },
    {
      provide: 'IApprovalEvaluationRepository',
      useClass: ApprovalEvaluationRepository,
    },
    {
      provide: 'IApprovalMetricsRepository',
      useClass: ApprovalMetricsRepository,
    },
    {
      provide: 'IUserRepository',
      useClass: UserRepository,
    },

    // Global Filters and Interceptors for Approval
    {
      provide: APP_FILTER,
      useClass: ApprovalExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: ApprovalHttpExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ApprovalAuditInterceptor,
    },
  ],
  exports: [
    ApprovalEngineService,
    EvaluateApprovalUseCase,
    ConfigureApprovalRuleUseCase,
    UpdateApprovalRuleUseCase,
    GetApprovalRulesUseCase,
    DeleteApprovalRuleUseCase,
    GetEvaluationHistoryUseCase,
    GetChapterEvaluationStatsUseCase,
    GetLatestEvaluationUseCase,
  ],
})
export class ApprovalModule {}
