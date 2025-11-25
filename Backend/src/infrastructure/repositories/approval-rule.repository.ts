import { Injectable } from '@nestjs/common';
import { Repository, IsNull } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ApprovalRule } from '../../domain/entities/approval-rule.entity';
import { IApprovalRuleRepository } from '../../application/interfaces/repositories/approval-rule-repository.interface';

@Injectable()
export class ApprovalRuleRepository implements IApprovalRuleRepository {
  constructor(
    @InjectRepository(ApprovalRule)
    private readonly repository: Repository<ApprovalRule>,
  ) {}

  async create(approvalRule: Partial<ApprovalRule>): Promise<ApprovalRule> {
    const rule = this.repository.create(approvalRule);
    return await this.repository.save(rule);
  }

  async findById(id: string): Promise<ApprovalRule | null> {
    return await this.repository.findOne({
      where: { id },
    });
  }

  async findByChapterId(chapterId: string): Promise<ApprovalRule[]> {
    return await this.repository.find({
      where: { chapterId, isActive: true },
      order: { createdAt: 'ASC' },
    });
  }

  async findActiveRules(): Promise<ApprovalRule[]> {
    return await this.repository.find({
      where: { isActive: true },
      order: { createdAt: 'ASC' },
    });
  }

  async findGlobalRules(): Promise<ApprovalRule[]> {
    return await this.repository.find({
      where: { chapterId: IsNull(), isActive: true },
      order: { createdAt: 'ASC' },
    });
  }

  async findApplicableRules(chapterId?: string): Promise<ApprovalRule[]> {
    if (!chapterId) {
      return await this.findGlobalRules();
    }

    // Find both global rules and chapter-specific rules
    const globalRules = await this.findGlobalRules();
    const chapterRules = await this.findByChapterId(chapterId);

    // Chapter-specific rules take precedence over global rules
    return chapterRules.length > 0 ? chapterRules : globalRules;
  }

  async update(id: string, updateData: Partial<ApprovalRule>): Promise<ApprovalRule> {
    const existing = await this.repository.findOne({ where: { id } });
    if (!existing) {
      throw new Error('Approval rule not found');
    }

    const updated = this.repository.merge(existing, updateData);
    return await this.repository.save(updated);
  }

  async delete(id: string): Promise<void> {
    await this.repository.delete(id);
  }

  async deactivate(id: string): Promise<ApprovalRule> {
    return await this.update(id, { isActive: false });
  }

  async activate(id: string): Promise<ApprovalRule> {
    return await this.update(id, { isActive: true });
  }
}
