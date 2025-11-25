import { Injectable, Inject, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { IApprovalRuleRepository } from '../../interfaces/repositories/approval-rule-repository.interface';
import { ApprovalRule } from '../../../domain/entities/approval-rule.entity';

export interface ConfigureApprovalRuleRequest {
  chapterId?: string; // Optional for global rules
  minScoreThreshold: number;
  maxAttempts: number;
  allowErrorCarryover: boolean;
  isActive: boolean;
  specialRequirements?: Record<string, unknown>;
  description?: string;
}

export interface ConfigureApprovalRuleResponse {
  id: string;
  chapterId?: string;
  minScoreThreshold: number;
  maxAttempts: number;
  allowErrorCarryover: boolean;
  isActive: boolean;
  specialRequirements?: Record<string, unknown>;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class ConfigureApprovalRuleUseCase {
  private readonly logger = new Logger(ConfigureApprovalRuleUseCase.name);

  constructor(
    @Inject('IApprovalRuleRepository')
    private readonly approvalRuleRepository: IApprovalRuleRepository,
  ) {}

  async execute(request: ConfigureApprovalRuleRequest): Promise<ConfigureApprovalRuleResponse> {
    this.logger.log(
      `Configuring approval rule for chapter: ${request.chapterId || 'global'}, threshold: ${request.minScoreThreshold}%`,
    );

    try {
      // Validate input
      this.validateRequest(request);

      // Check if rule already exists for this chapter
      const existingRules = request.chapterId
        ? await this.approvalRuleRepository.findByChapterId(request.chapterId)
        : await this.approvalRuleRepository.findGlobalRules();

      let rule: ApprovalRule;

      if (existingRules.length > 0) {
        // Update existing rule
        const existingRule = existingRules[0];
        rule = await this.approvalRuleRepository.update(existingRule.id, {
          minScoreThreshold: request.minScoreThreshold,
          maxAttempts: request.maxAttempts,
          allowErrorCarryover: request.allowErrorCarryover,
          isActive: request.isActive,
          metadata: request.specialRequirements ?? null,
          description: request.description ?? null,
        });

        this.logger.log(`Updated existing approval rule: ${rule.id}`);
      } else {
        // Create new rule
        rule = await this.approvalRuleRepository.create({
          chapterId: request.chapterId ?? null,
          minScoreThreshold: request.minScoreThreshold,
          maxAttempts: request.maxAttempts,
          allowErrorCarryover: request.allowErrorCarryover,
          isActive: request.isActive,
          metadata: request.specialRequirements ?? null,
          description: request.description ?? null,
        });

        this.logger.log(`Created new approval rule: ${rule.id}`);
      }

      return this.mapToResponse(rule);
    } catch (error) {
      this.logger.error(
        `Error configuring approval rule: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }

  private validateRequest(request: ConfigureApprovalRuleRequest): void {
    if (request.minScoreThreshold < 0 || request.minScoreThreshold > 100) {
      throw new BadRequestException('Minimum score threshold must be between 0 and 100');
    }

    if (request.maxAttempts < 1 || request.maxAttempts > 10) {
      throw new BadRequestException('Maximum attempts must be between 1 and 10');
    }

    // Validate chapterId is not null or empty string
    if (request.chapterId === null || request.chapterId === '') {
      throw new BadRequestException('Chapter ID cannot be null or empty');
    }

    // Validate special requirements for chapters 4 and 5
    if (request.chapterId && ['4', '5'].includes(request.chapterId)) {
      if (request.minScoreThreshold < 100) {
        throw new BadRequestException('Chapters 4 and 5 require 100% threshold');
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

@Injectable()
export class GetApprovalRulesUseCase {
  private readonly logger = new Logger(GetApprovalRulesUseCase.name);

  constructor(
    @Inject('IApprovalRuleRepository')
    private readonly approvalRuleRepository: IApprovalRuleRepository,
  ) {}

  async execute(chapterId?: string): Promise<ConfigureApprovalRuleResponse[]> {
    this.logger.log(`Getting approval rules for chapter: ${chapterId || 'all'}`);

    try {
      let rules: ApprovalRule[];

      if (chapterId) {
        rules = await this.approvalRuleRepository.findByChapterId(chapterId);
      } else {
        rules = await this.approvalRuleRepository.findActiveRules();
      }

      return rules.map(rule => ({
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
      }));
    } catch (error) {
      this.logger.error(
        `Error getting approval rules: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }
}

@Injectable()
export class DeleteApprovalRuleUseCase {
  private readonly logger = new Logger(DeleteApprovalRuleUseCase.name);

  constructor(
    @Inject('IApprovalRuleRepository')
    private readonly approvalRuleRepository: IApprovalRuleRepository,
  ) {}

  async execute(ruleId: string): Promise<void> {
    this.logger.log(`Deleting approval rule: ${ruleId}`);

    try {
      const rule = await this.approvalRuleRepository.findById(ruleId);
      if (!rule) {
        throw new NotFoundException('Approval rule not found');
      }

      await this.approvalRuleRepository.delete(ruleId);

      this.logger.log(`Approval rule deleted successfully: ${ruleId}`);
    } catch (error) {
      this.logger.error(
        `Error deleting approval rule: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
  }
}
