import { ApprovalRule } from '../../../domain/entities/approval-rule.entity';

export interface IApprovalRuleRepository {
  create(approvalRule: Partial<ApprovalRule>): Promise<ApprovalRule>;
  findById(id: string): Promise<ApprovalRule | null>;
  findByChapterId(chapterId: string): Promise<ApprovalRule[]>;
  findActiveRules(): Promise<ApprovalRule[]>;
  findGlobalRules(): Promise<ApprovalRule[]>;
  findApplicableRules(chapterId?: string): Promise<ApprovalRule[]>;
  update(id: string, updateData: Partial<ApprovalRule>): Promise<ApprovalRule>;
  delete(id: string): Promise<void>;
  deactivate(id: string): Promise<ApprovalRule>;
  activate(id: string): Promise<ApprovalRule>;
}
