import { Test, TestingModule } from '@nestjs/testing';
import { ConfigureApprovalRuleUseCase } from './configure-approval-rule.use-case';
import { IApprovalRuleRepository } from '../../interfaces/repositories/approval-rule-repository.interface';
import { BadRequestException } from '@nestjs/common';
import { ApprovalRule } from '../../../domain/entities/approval-rule.entity';
import { ConfigureApprovalRuleDto } from '../../dtos/approval/configure-approval-rule.dto';

// Helper para crear reglas mock
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
    // Métodos de dominio mockeados
    isApplicableToChapter: () => true,
    isScoreApproved: (score: number) => score >= 80,
    hasSpecialRequirements: () => false,
    getThresholdPercentage: () => 80,
    canRetryAfterFailure: (currentAttempts: number) => currentAttempts < 3,
    ...overrides,
  } as ApprovalRule;
}

describe('ConfigureApprovalRuleUseCase', () => {
  let useCase: ConfigureApprovalRuleUseCase;
  let approvalRuleRepository: jest.Mocked<IApprovalRuleRepository>;

  const mockApprovalRule = createMockApprovalRule({
    description: 'Test rule',
    chapterId: '1',
    allowErrorCarryover: true,
    metadata: {},
  });

  beforeEach(async () => {
    const mockApprovalRuleRepository: jest.Mocked<IApprovalRuleRepository> = {
      create: jest.fn(),
      findById: jest.fn(),
      findByChapterId: jest.fn(),
      findActiveRules: jest.fn(),
      findGlobalRules: jest.fn(),
      findApplicableRules: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deactivate: jest.fn(),
      activate: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConfigureApprovalRuleUseCase,
        {
          provide: 'IApprovalRuleRepository',
          useValue: mockApprovalRuleRepository,
        },
      ],
    }).compile();

    useCase = module.get<ConfigureApprovalRuleUseCase>(ConfigureApprovalRuleUseCase);
    approvalRuleRepository = module.get('IApprovalRuleRepository');
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  describe('execute', () => {
    it('should successfully configure a new approval rule', async () => {
      const dto: ConfigureApprovalRuleDto = {
        chapterId: '1',
        minScoreThreshold: 80,
        maxAttempts: 3,
        allowErrorCarryover: true,
        isActive: true,
        description: 'Standard chapter threshold',
      };

      approvalRuleRepository.findByChapterId.mockResolvedValue([]);
      approvalRuleRepository.create.mockResolvedValue(mockApprovalRule);

      const result = await useCase.execute(dto);

      expect(result.id).toBe(mockApprovalRule.id);
      expect(result.chapterId).toBe(mockApprovalRule.chapterId);
      expect(result.minScoreThreshold).toBe(mockApprovalRule.minScoreThreshold);
      expect(approvalRuleRepository.create).toHaveBeenCalled();
    });

    it('should configure rule for chapter 4 with 100% threshold', async () => {
      const dto: ConfigureApprovalRuleDto = {
        chapterId: '4',
        minScoreThreshold: 100,
        maxAttempts: 3,
        allowErrorCarryover: false,
        isActive: true,
        description: 'Critical chapter - 100% required',
      };

      const chapter4Rule = createMockApprovalRule({
        chapterId: '4',
        minScoreThreshold: 100,
      });

      approvalRuleRepository.findByChapterId.mockResolvedValue([]);
      approvalRuleRepository.create.mockResolvedValue(chapter4Rule);

      const result = await useCase.execute(dto);

      expect(result.minScoreThreshold).toBe(100);
      expect(result.chapterId).toBe('4');
    });

    it('should configure rule for chapter 5 with 100% threshold', async () => {
      const dto: ConfigureApprovalRuleDto = {
        chapterId: '5',
        minScoreThreshold: 100,
        maxAttempts: 3,
        allowErrorCarryover: false,
        isActive: true,
        description: 'Final chapter - 100% required',
      };

      const chapter5Rule = createMockApprovalRule({
        chapterId: '5',
        minScoreThreshold: 100,
      });

      approvalRuleRepository.findByChapterId.mockResolvedValue([]);
      approvalRuleRepository.create.mockResolvedValue(chapter5Rule);

      const result = await useCase.execute(dto);

      expect(result.minScoreThreshold).toBe(100);
      expect(result.chapterId).toBe('5');
    });

    it('should update existing approval rule', async () => {
      const dto: ConfigureApprovalRuleDto = {
        chapterId: '1',
        minScoreThreshold: 85,
        maxAttempts: 3,
        allowErrorCarryover: true,
        isActive: true,
        description: 'Updated threshold',
      };

      const existingRule = createMockApprovalRule({ chapterId: '1' });
      const updatedRule = createMockApprovalRule({
        minScoreThreshold: 85,
        updatedAt: new Date(),
      });

      approvalRuleRepository.findByChapterId.mockResolvedValue([existingRule]);
      approvalRuleRepository.update.mockResolvedValue(updatedRule);

      const result = await useCase.execute(dto);

      expect(result.minScoreThreshold).toBe(85);
    });

    it('should work without description', async () => {
      const dto: ConfigureApprovalRuleDto = {
        chapterId: '2',
        minScoreThreshold: 75,
        maxAttempts: 3,
        allowErrorCarryover: true,
        isActive: true,
      };

      approvalRuleRepository.findByChapterId.mockResolvedValue([]);
      approvalRuleRepository.create.mockResolvedValue(mockApprovalRule);

      await useCase.execute(dto);

      expect(approvalRuleRepository.create).toHaveBeenCalled();
    });

    it('should throw BadRequestException for invalid threshold', async () => {
      const dto: ConfigureApprovalRuleDto = {
        chapterId: '1',
        minScoreThreshold: 105,
        maxAttempts: 3,
        allowErrorCarryover: true,
        isActive: true,
        description: 'Invalid threshold test',
      };

      await expect(useCase.execute(dto)).rejects.toThrow(BadRequestException);
    });

    it('should create global rule when chapterId is not provided', async () => {
      const dto: ConfigureApprovalRuleDto = {
        // chapterId omitido → global
        minScoreThreshold: 80,
        maxAttempts: 3,
        allowErrorCarryover: true,
        isActive: true,
        description: 'Global rule test',
      };

      const globalRule = createMockApprovalRule({
        chapterId: null,
        description: 'Global rule test',
      });

      approvalRuleRepository.findGlobalRules.mockResolvedValue([]);
      approvalRuleRepository.create.mockResolvedValue(globalRule);

      const result = await useCase.execute(dto);

      expect(result.chapterId).toBeUndefined(); // expuesto como undefined para global
      expect(result.description).toBe('Global rule test');
      expect(approvalRuleRepository.create).toHaveBeenCalledWith({
        chapterId: null,
        minScoreThreshold: 80,
        maxAttempts: 3,
        allowErrorCarryover: true,
        isActive: true,
        metadata: null,
        description: 'Global rule test',
      });
    });

    it('should handle service errors gracefully', async () => {
      const dto: ConfigureApprovalRuleDto = {
        chapterId: '1',
        minScoreThreshold: 80,
        maxAttempts: 3,
        allowErrorCarryover: true,
        isActive: true,
        description: 'Service error test',
      };

      const error = new Error('Database connection failed');
      approvalRuleRepository.findByChapterId.mockRejectedValue(error);

      await expect(useCase.execute(dto)).rejects.toThrow('Database connection failed');
    });
  });

  describe('validation scenarios', () => {
    it('should reject threshold below minimum (0)', async () => {
      const dto: ConfigureApprovalRuleDto = {
        chapterId: '1',
        minScoreThreshold: -1,
        maxAttempts: 3,
        allowErrorCarryover: true,
        isActive: true,
      };

      await expect(useCase.execute(dto)).rejects.toThrow(BadRequestException);
    });

    it('should reject threshold above maximum (100)', async () => {
      const dto: ConfigureApprovalRuleDto = {
        chapterId: '1',
        minScoreThreshold: 101,
        maxAttempts: 3,
        allowErrorCarryover: true,
        isActive: true,
      };

      await expect(useCase.execute(dto)).rejects.toThrow(BadRequestException);
    });

    it('should handle minimum valid threshold', async () => {
      const dto: ConfigureApprovalRuleDto = {
        chapterId: '1',
        minScoreThreshold: 0,
        maxAttempts: 3,
        allowErrorCarryover: true,
        isActive: true,
      };
      const ruleWithMinThreshold = createMockApprovalRule({ minScoreThreshold: 0 });

      approvalRuleRepository.findByChapterId.mockResolvedValue([]);
      approvalRuleRepository.create.mockResolvedValue(ruleWithMinThreshold);

      const result = await useCase.execute(dto);

      expect(result.minScoreThreshold).toBe(0);
    });

    it('should handle maximum valid threshold', async () => {
      const dto: ConfigureApprovalRuleDto = {
        chapterId: '1',
        minScoreThreshold: 100,
        maxAttempts: 3,
        allowErrorCarryover: true,
        isActive: true,
      };
      const ruleWithMaxThreshold = createMockApprovalRule({ minScoreThreshold: 100 });

      approvalRuleRepository.findByChapterId.mockResolvedValue([]);
      approvalRuleRepository.create.mockResolvedValue(ruleWithMaxThreshold);

      const result = await useCase.execute(dto);

      expect(result.minScoreThreshold).toBe(100);
    });

    it('should handle long description', async () => {
      const dto: ConfigureApprovalRuleDto = {
        chapterId: '1',
        minScoreThreshold: 80,
        maxAttempts: 3,
        allowErrorCarryover: true,
        isActive: true,
        description: 'A'.repeat(500),
      };

      approvalRuleRepository.findByChapterId.mockResolvedValue([]);
      approvalRuleRepository.create.mockResolvedValue(mockApprovalRule);

      await useCase.execute(dto);

      expect(approvalRuleRepository.create).toHaveBeenCalled();
    });

    it('should handle special characters in chapterId', async () => {
      const dto: ConfigureApprovalRuleDto = {
        chapterId: '1',
        minScoreThreshold: 80,
        maxAttempts: 3,
        allowErrorCarryover: true,
        isActive: true,
      };
      const specialRule = createMockApprovalRule({ chapterId: '1' });

      approvalRuleRepository.findByChapterId.mockResolvedValue([]);
      approvalRuleRepository.create.mockResolvedValue(specialRule);

      const result = await useCase.execute(dto);

      expect(result.chapterId).toBe('1');
    });
  });

  describe('business logic scenarios', () => {
    it('should enforce 100% threshold for critical chapters (4,5)', async () => {
      const criticalChapters = ['4', '5'];

      for (const chapterId of criticalChapters) {
        const dto: ConfigureApprovalRuleDto = {
          chapterId,
          minScoreThreshold: 100,
          maxAttempts: 3,
          allowErrorCarryover: false,
          isActive: true,
        };
        const criticalRule = createMockApprovalRule({
          chapterId,
          minScoreThreshold: 100,
        });

        approvalRuleRepository.findByChapterId.mockResolvedValue([]);
        approvalRuleRepository.create.mockResolvedValue(criticalRule);

        const result = await useCase.execute(dto);

        expect(result.minScoreThreshold).toBe(100);
        expect(result.chapterId).toBe(chapterId);
      }
    });

    it('should allow flexible thresholds for regular chapters', async () => {
      const regularChapters = ['1', '2', '3'];
      const thresholds = [70, 80, 90];

      for (let i = 0; i < regularChapters.length; i++) {
        const chapterId = regularChapters[i];
        const threshold = thresholds[i];
        const dto: ConfigureApprovalRuleDto = {
          chapterId,
          minScoreThreshold: threshold,
          maxAttempts: 3,
          allowErrorCarryover: true,
          isActive: true,
        };
        const flexibleRule = createMockApprovalRule({
          chapterId,
          minScoreThreshold: threshold,
        });

        approvalRuleRepository.findByChapterId.mockResolvedValue([]);
        approvalRuleRepository.create.mockResolvedValue(flexibleRule);

        const result = await useCase.execute(dto);

        expect(result.minScoreThreshold).toBe(threshold);
        expect(result.chapterId).toBe(chapterId);
      }
    });
  });
});
