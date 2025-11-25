import { Injectable, Inject, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { IApprovalRuleRepository } from '../../interfaces/repositories/approval-rule-repository.interface';
import { ApprovalRule } from '../../../domain/entities/approval-rule.entity';
import { ConfigureApprovalRuleResponse } from './configure-approval-rule.use-case';

export interface UpdateApprovalRuleRequest {
  minScoreThreshold?: number;
  maxAttempts?: number;
  allowErrorCarryover?: boolean;
  isActive?: boolean;
  specialRequirements?: Record<string, unknown>;
  description?: string;
}

@Injectable()
export class UpdateApprovalRuleUseCase {
  private readonly logger = new Logger(UpdateApprovalRuleUseCase.name);

  constructor(
    @Inject('IApprovalRuleRepository')
    private readonly approvalRuleRepository: IApprovalRuleRepository,
  ) {}

  async execute(
    ruleId: string,
    request: UpdateApprovalRuleRequest,
  ): Promise<ConfigureApprovalRuleResponse> {
    this.logger.log(`Updating approval rule: ${ruleId}`);

    try {
      // Check if rule exists
      const existingRule = await this.approvalRuleRepository.findById(ruleId);
      if (!existingRule) {
        throw new NotFoundException('Approval rule not found');
      }

      // Validate input if provided
      this.validateRequest(request, existingRule.chapterId || undefined);

      // Prepare update data (only include provided fields)
      const updateData: Partial<ApprovalRule> = {};

      if (request.minScoreThreshold !== undefined) {
        updateData.minScoreThreshold = request.minScoreThreshold;
      }

      if (request.maxAttempts !== undefined) {
        updateData.maxAttempts = request.maxAttempts;
      }

      if (request.allowErrorCarryover !== undefined) {
        updateData.allowErrorCarryover = request.allowErrorCarryover;
      }

      if (request.isActive !== undefined) {
        updateData.isActive = request.isActive;
      }

      if (request.specialRequirements !== undefined) {
        updateData.metadata = request.specialRequirements;
      }

      if (request.description !== undefined) {
        updateData.description = request.description;
      }

      // Update the rule
      const updatedRule = await this.approvalRuleRepository.update(ruleId, updateData);

      this.logger.log(`Approval rule updated successfully: ${ruleId}`);

      return this.mapToResponse(updatedRule);
    } catch (error) {
      this.logger.error(
        `Error updating approval rule: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  private validateRequest(request: UpdateApprovalRuleRequest, chapterId?: string): void {
    if (request.minScoreThreshold !== undefined) {
      if (request.minScoreThreshold < 0 || request.minScoreThreshold > 100) {
        throw new BadRequestException('Minimum score threshold must be between 0 and 100');
      }

      // Validate special requirements for chapters 4 and 5
      if (chapterId && ['4', '5'].includes(chapterId)) {
        if (request.minScoreThreshold < 100) {
          throw new BadRequestException('Chapters 4 and 5 require 100% threshold');
        }
      }
    }

    if (request.maxAttempts !== undefined) {
      if (request.maxAttempts < 1 || request.maxAttempts > 10) {
        throw new BadRequestException('Maximum attempts must be between 1 and 10');
      }
    }
  }

  private mapToResponse(rule: ApprovalRule): ConfigureApprovalRuleResponse {
    return {
      id: rule.id,
      ...(rule.chapterId && { chapterId: rule.chapterId }),
      minScoreThreshold: rule.minScoreThreshold,
      maxAttempts: rule.maxAttempts,
      allowErrorCarryover: rule.allowErrorCarryover,
      isActive: rule.isActive,
      ...(rule.metadata && { specialRequirements: rule.metadata }),
      ...(rule.description && { description: rule.description }),
      createdAt: rule.createdAt,
      updatedAt: rule.updatedAt,
    };
  }
}
