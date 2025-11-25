import { Test, TestingModule } from '@nestjs/testing';
import { UpdateApprovalRuleUseCase } from './update-approval-rule.use-case';
import { IApprovalRuleRepository } from '../../interfaces/repositories/approval-rule-repository.interface';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ApprovalRule } from '../../../domain/entities/approval-rule.entity';
import { UpdateApprovalRuleDto } from '../../dtos/approval/configure-approval-rule.dto';

// Helper function for creating mock objects
function createMockApprovalRule(overrides: Partial<ApprovalRule> = {}): ApprovalRule {
  return {
    id: 'rule-123',
    name: 'Test Rule',
    description: null,
    chapterId: null,
    minScoreThreshold: 80,
    maxAttempts: 3,
    allowErrorCarryover: false,
    isActive: true,
    metadata: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    isApplicableToChapter: () => true,
    canRetryAfterFailure: () => true,
    ...overrides,
  } as ApprovalRule;
}

describe('UpdateApprovalRuleUseCase', () => {
  let useCase: UpdateApprovalRuleUseCase;
  let approvalRuleRepository: jest.Mocked<IApprovalRuleRepository>;

  const mockApprovalRule = createMockApprovalRule({
    chapterId: '1',
    allowErrorCarryover: true,
    description: 'Test rule',
  });

  beforeEach(async () => {
    const mockRepository = {
      findById: jest.fn(),
      update: jest.fn(),
      findByChapterId: jest.fn(),
      findActiveRules: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateApprovalRuleUseCase,
        {
          provide: 'IApprovalRuleRepository',
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<UpdateApprovalRuleUseCase>(UpdateApprovalRuleUseCase);
    approvalRuleRepository = module.get('IApprovalRuleRepository');
  });

  describe('execute', () => {
    it('should update approval rule successfully', async () => {
      // Arrange
      const dto: UpdateApprovalRuleDto = {
        minScoreThreshold: 85,
        maxAttempts: 5,
        allowErrorCarryover: false,
        description: 'Updated rule',
      };

      approvalRuleRepository.findById.mockResolvedValue(mockApprovalRule);
      approvalRuleRepository.update.mockResolvedValue(
        createMockApprovalRule({
          ...mockApprovalRule,
          ...dto,
          updatedAt: new Date(),
        }),
      );

      // Act
      const result = await useCase.execute('rule-123', dto);

      // Assert
      expect(result.minScoreThreshold).toBe(85);
      expect(result.maxAttempts).toBe(5);
      expect(result.allowErrorCarryover).toBe(false);
      expect(result.description).toBe('Updated rule');
      expect(approvalRuleRepository.update).toHaveBeenCalled();
    });

    it('should throw NotFoundException when rule does not exist', async () => {
      // Arrange
      const dto: UpdateApprovalRuleDto = {
        minScoreThreshold: 85,
      };

      approvalRuleRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute('non-existent-rule', dto)).rejects.toThrow(NotFoundException);
    });

    it('should validate threshold range', async () => {
      // Arrange
      const dto: UpdateApprovalRuleDto = {
        minScoreThreshold: 150, // Invalid threshold
      };

      approvalRuleRepository.findById.mockResolvedValue(mockApprovalRule);

      // Act & Assert
      await expect(useCase.execute('rule-123', dto)).rejects.toThrow(BadRequestException);
    });

    it('should validate max attempts range', async () => {
      // Arrange
      const dto: UpdateApprovalRuleDto = {
        maxAttempts: 15, // Invalid max attempts
      };

      approvalRuleRepository.findById.mockResolvedValue(mockApprovalRule);

      // Act & Assert
      await expect(useCase.execute('rule-123', dto)).rejects.toThrow(BadRequestException);
    });

    it('should handle partial updates', async () => {
      // Arrange
      const dto: UpdateApprovalRuleDto = {
        description: 'Only description updated',
      };

      approvalRuleRepository.findById.mockResolvedValue(mockApprovalRule);
      approvalRuleRepository.update.mockResolvedValue(
        createMockApprovalRule({
          ...mockApprovalRule,
          description: 'Only description updated',
          updatedAt: new Date(),
        }),
      );

      // Act
      const result = await useCase.execute('rule-123', dto);

      // Assert
      expect(result.description).toBe('Only description updated');
      expect(result.minScoreThreshold).toBe(80); // Should remain unchanged
      expect(result.maxAttempts).toBe(3); // Should remain unchanged
    });
  });
});
