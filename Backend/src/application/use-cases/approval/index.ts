// Approval Use Cases
export * from './evaluate-approval.use-case';
export * from './configure-approval-rule.use-case';
export * from './update-approval-rule.use-case';
export * from './get-evaluation-history.use-case';

// Re-export specific classes for easier imports
export { EvaluateApprovalUseCase } from './evaluate-approval.use-case';
export {
  ConfigureApprovalRuleUseCase,
  GetApprovalRulesUseCase,
  DeleteApprovalRuleUseCase,
} from './configure-approval-rule.use-case';
export { UpdateApprovalRuleUseCase } from './update-approval-rule.use-case';
export {
  GetEvaluationHistoryUseCase,
  GetChapterEvaluationStatsUseCase,
  GetLatestEvaluationUseCase,
} from './get-evaluation-history.use-case';
