import { Test, TestingModule } from '@nestjs/testing';
import { ApprovalEngineService } from './approval-engine.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { EvaluateApprovalUseCase } from '../use-cases/approval/evaluate-approval.use-case';
import { ConfigureApprovalRuleUseCase } from '../use-cases/approval/configure-approval-rule.use-case';
import { UpdateApprovalRuleUseCase } from '../use-cases/approval/update-approval-rule.use-case';
import { GetApprovalRulesUseCase } from '../use-cases/approval/configure-approval-rule.use-case';
import { DeleteApprovalRuleUseCase } from '../use-cases/approval/configure-approval-rule.use-case';
import { GetEvaluationHistoryUseCase } from '../use-cases/approval/get-evaluation-history.use-case';
import { GetChapterEvaluationStatsUseCase } from '../use-cases/approval/get-evaluation-history.use-case';
import { GetLatestEvaluationUseCase } from '../use-cases/approval/get-evaluation-history.use-case';

describe('ApprovalEngineService', () => {
  let service: ApprovalEngineService;

  // Mock use cases
  const evaluateApprovalUseCase = {
    execute: jest.fn(),
  };

  const configureApprovalRuleUseCase = {
    execute: jest.fn(),
  };

  const getApprovalRulesUseCase = {
    execute: jest.fn(),
  };

  const deleteApprovalRuleUseCase = {
    execute: jest.fn(),
  };

  const updateApprovalRuleUseCase = {
    execute: jest.fn(),
  };

  const getEvaluationHistoryUseCase = {
    execute: jest.fn(),
  };

  const getChapterEvaluationStatsUseCase = {
    execute: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApprovalEngineService,
        {
          provide: EvaluateApprovalUseCase,
          useValue: evaluateApprovalUseCase,
        },
        {
          provide: ConfigureApprovalRuleUseCase,
          useValue: configureApprovalRuleUseCase,
        },
        {
          provide: UpdateApprovalRuleUseCase,
          useValue: updateApprovalRuleUseCase,
        },
        {
          provide: GetApprovalRulesUseCase,
          useValue: getApprovalRulesUseCase,
        },
        {
          provide: DeleteApprovalRuleUseCase,
          useValue: deleteApprovalRuleUseCase,
        },
        {
          provide: GetEvaluationHistoryUseCase,
          useValue: getEvaluationHistoryUseCase,
        },
        {
          provide: GetChapterEvaluationStatsUseCase,
          useValue: getChapterEvaluationStatsUseCase,
        },
        {
          provide: GetLatestEvaluationUseCase,
          useValue: { execute: jest.fn() },
        },
        {
          provide: 'IApprovalMetricsRepository',
          useValue: {
            save: jest.fn(),
            findAll: jest.fn(),
            findById: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ApprovalEngineService>(ApprovalEngineService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('evaluateApproval', () => {
    it('should approve when score meets threshold', async () => {
      // Arrange
      const request = {
        userId: 'user-123',
        chapterId: '1',
        score: 85,
        errors: [],
      };

      evaluateApprovalUseCase.execute.mockResolvedValue({
        id: 'eval-123',
        userId: 'user-123',
        chapterId: '1',
        score: 85,
        adjustedScore: 85,
        threshold: 80,
        status: 'approved',
        feedback: 'Great job!',
        errors: [],
        evaluatedAt: new Date(),
        nextAttemptAllowed: true,
        remainingAttempts: 2,
      });

      // Act
      const result = await service.evaluateApproval(request);

      // Assert
      expect(result.status).toBe('approved');
      expect(result.score).toBe(85);
      expect(result.threshold).toBe(80);
      expect(evaluateApprovalUseCase.execute).toHaveBeenCalledWith(request);
    });

    it('should reject when score does not meet threshold', async () => {
      // Arrange
      const request = {
        userId: 'user-123',
        chapterId: '1',
        score: 75,
        errors: [],
      };

      evaluateApprovalUseCase.execute.mockResolvedValue({
        id: 'eval-123',
        userId: 'user-123',
        chapterId: 1,
        score: 75,
        adjustedScore: 75,
        threshold: 80,
        status: 'rejected',
        feedback: 'Needs improvement',
        errors: [],
        evaluatedAt: new Date(),
        nextAttemptAllowed: true,
        remainingAttempts: 2,
      });

      // Act
      const result = await service.evaluateApproval(request);

      // Assert
      expect(result.status).toBe('rejected');
      expect(result.score).toBe(75);
      expect(result.threshold).toBe(80);
    });

    it('should require 100% for chapters 4 and 5', async () => {
      // Arrange
      const request = {
        userId: 'user-123',
        chapterId: '4',
        score: 95,
        errors: [],
      };

      evaluateApprovalUseCase.execute.mockResolvedValue({
        id: 'eval-123',
        userId: 'user-123',
        chapterId: '4',
        score: 95,
        adjustedScore: 95,
        threshold: 100,
        status: 'rejected',
        feedback: 'Critical chapter requires 100%',
        errors: [],
        evaluatedAt: new Date(),
        nextAttemptAllowed: true,
        remainingAttempts: 2,
      });

      // Act
      const result = await service.evaluateApproval(request);

      // Assert
      expect(result.status).toBe('rejected');
      expect(result.threshold).toBe(100);
    });

    it('should handle error carry over from previous attempts', async () => {
      // Arrange
      const request = {
        userId: 'user-123',
        chapterId: '1',
        score: 82,
        errors: [{ type: 'grammar', description: 'Verb tense error' }],
      };

      evaluateApprovalUseCase.execute.mockResolvedValue({
        id: 'eval-123',
        userId: 'user-123',
        chapterId: 1,
        score: 82,
        adjustedScore: 79,
        threshold: 80,
        status: 'rejected',
        feedback: 'Score adjusted due to error carryover',
        errors: [{ type: 'grammar', description: 'Verb tense error' }],
        evaluatedAt: new Date(),
        nextAttemptAllowed: true,
        remainingAttempts: 1,
      });

      // Act
      const result = await service.evaluateApproval(request);

      // Assert
      expect(result.status).toBe('rejected');
      expect(result.adjustedScore).toBe(79);
    });

    it('should throw NotFoundException when user not found', async () => {
      // Arrange
      const request = {
        userId: 'invalid-user',
        chapterId: '1',
        score: 80,
        errors: [],
      };

      evaluateApprovalUseCase.execute.mockRejectedValue(new NotFoundException('User not found'));

      // Act & Assert
      await expect(service.evaluateApproval(request)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when approval rule not found', async () => {
      // Arrange
      const request = {
        userId: 'user-123',
        chapterId: '999',
        score: 80,
        errors: [],
      };

      evaluateApprovalUseCase.execute.mockRejectedValue(
        new NotFoundException('Approval rule not found'),
      );

      // Act & Assert
      await expect(service.evaluateApproval(request)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for invalid score', async () => {
      // Arrange
      const invalidRequest1 = {
        userId: 'user-123',
        chapterId: '1',
        score: -5,
        errors: [],
      };

      const invalidRequest2 = {
        userId: 'user-123',
        chapterId: '1',
        score: 105,
        errors: [],
      };

      evaluateApprovalUseCase.execute.mockRejectedValue(new BadRequestException('Invalid score'));

      // Act & Assert
      await expect(service.evaluateApproval(invalidRequest1)).rejects.toThrow(BadRequestException);

      await expect(service.evaluateApproval(invalidRequest2)).rejects.toThrow(BadRequestException);
    });
  });

  describe('configureRule', () => {
    it('should create new rule when none exists', async () => {
      // Arrange
      const ruleData = {
        chapterId: '1',
        minScoreThreshold: 85,
        maxAttempts: 5,
        allowErrorCarryover: false,
        isActive: true,
        description: 'Test rule',
      };

      configureApprovalRuleUseCase.execute.mockResolvedValue({
        id: 'rule-123',
        chapterId: '1',
        minScoreThreshold: 85,
        maxAttempts: 5,
        allowErrorCarryover: false,
        isActive: true,
        description: 'Test rule',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Act
      const result = await service.configureRule(ruleData);

      // Assert
      expect(result.id).toBe('rule-123');
      expect(result.chapterId).toBe('1');
      expect(result.minScoreThreshold).toBe(85);
      expect(configureApprovalRuleUseCase.execute).toHaveBeenCalledWith(ruleData);
    });

    it('should update existing rule', async () => {
      // Arrange
      const updateData = {
        chapterId: '1',
        minScoreThreshold: 85,
        maxAttempts: 5,
        allowErrorCarryover: false,
        isActive: true,
        description: 'Updated rule',
      };

      configureApprovalRuleUseCase.execute.mockResolvedValue({
        id: 'rule-123',
        chapterId: '1',
        minScoreThreshold: 85,
        maxAttempts: 5,
        allowErrorCarryover: false,
        isActive: true,
        description: 'Updated rule',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Act
      const result = await service.configureRule(updateData);

      // Assert
      expect(result.minScoreThreshold).toBe(85);
      expect(result.maxAttempts).toBe(5);
      expect(result.allowErrorCarryover).toBe(false);
      expect(configureApprovalRuleUseCase.execute).toHaveBeenCalledWith(updateData);
    });
  });
});
