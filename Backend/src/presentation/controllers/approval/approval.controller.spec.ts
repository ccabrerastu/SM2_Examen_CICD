import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ApprovalController, AuthenticatedRequest } from './approval.controller';
import { ApprovalEngineService } from '../../../application/services/approval-engine.service';
import {
  EvaluateApprovalDto,
  EvaluateApprovalResponseDto,
  BatchEvaluateApprovalDto,
  BatchEvaluateApprovalResponseDto,
  ConfigureApprovalRuleDto,
  ApprovalRuleResponseDto,
} from '../../../application/dtos/approval';
import { EvaluationStatus } from '../../../domain/entities/approval-evaluation.entity';

describe('ApprovalController', () => {
  let controller: ApprovalController;
  let approvalEngineService: jest.Mocked<ApprovalEngineService>;

  const mockRequest = {
    user: {
      userId: 'user-123',
      email: 'test@example.com',
      role: 'student',
    },
  } as AuthenticatedRequest;

  const mockEvaluationResponse: EvaluateApprovalResponseDto = {
    evaluationId: 'eval-123',
    status: EvaluationStatus.APPROVED,
    score: 85,
    adjustedScore: 85,
    threshold: 80,
    attemptNumber: 1,
    errorsCarriedOver: 0,
    feedback: 'Evaluation completed successfully',
    canRetry: true,
    maxAttempts: 3,
  };

  const mockApprovalRule: ApprovalRuleResponseDto = {
    id: 'rule-123',
    chapterId: '1',
    minScoreThreshold: 80,
    maxAttempts: 3,
    allowErrorCarryover: true,
    isActive: true,
    description: 'Test rule',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    approvalEngineService = {
      evaluateApproval: jest.fn(),
      batchEvaluateApproval: jest.fn(),
      configureRule: jest.fn(),
      updateRule: jest.fn(),
      getRules: jest.fn(),
      deleteRule: jest.fn(),
      getUserEvaluationHistory: jest.fn(),
      getLatestEvaluation: jest.fn(),
      getChapterStats: jest.fn(),
      getEngineStats: jest.fn(),
      getUserApprovalSummary: jest.fn(),
      canUserAttemptChapter: jest.fn(),
    } as unknown as jest.Mocked<ApprovalEngineService>;

    controller = new ApprovalController(approvalEngineService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('evaluateApproval', () => {
    it('should successfully evaluate approval', async () => {
      // Arrange
      const dto: EvaluateApprovalDto = {
        userId: 'user-123',
        chapterId: '1',
        score: 85,
        additionalData: { timeSpent: 300 },
      };

      approvalEngineService.evaluateApproval.mockResolvedValue(mockEvaluationResponse);

      // Act
      const result = await controller.evaluateApproval(dto, mockRequest);

      // Assert
      expect(result.evaluationId).toBe('eval-123');
      expect(result.status).toBe(EvaluationStatus.APPROVED);
      expect(approvalEngineService.evaluateApproval).toHaveBeenCalledWith(dto);
    });

    it('should handle rejection with error carry over', async () => {
      // Arrange
      const dto: EvaluateApprovalDto = {
        userId: 'user-123',
        chapterId: '1',
        score: 75,
      };
      const rejectedResponse: EvaluateApprovalResponseDto = {
        ...mockEvaluationResponse,
        status: EvaluationStatus.REJECTED,
        score: 75,
        errorsCarriedOver: 5,
      };

      approvalEngineService.evaluateApproval.mockResolvedValue(rejectedResponse);

      // Act
      const result = await controller.evaluateApproval(dto, mockRequest);

      // Assert
      expect(result.status).toBe(EvaluationStatus.REJECTED);
      expect(result.errorsCarriedOver).toBe(5);
    });

    it('should handle BadRequestException', async () => {
      // Arrange
      const dto: EvaluateApprovalDto = {
        userId: 'user-123',
        chapterId: '1',
        score: -5,
      };

      approvalEngineService.evaluateApproval.mockRejectedValue(
        new BadRequestException('Invalid score'),
      );

      // Act & Assert
      await expect(controller.evaluateApproval(dto, mockRequest)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should handle NotFoundException', async () => {
      // Arrange
      const dto: EvaluateApprovalDto = {
        userId: 'user-123',
        chapterId: '999',
        score: 80,
      };

      approvalEngineService.evaluateApproval.mockRejectedValue(
        new NotFoundException('Chapter not found'),
      );

      // Act & Assert
      await expect(controller.evaluateApproval(dto, mockRequest)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('batchEvaluateApproval', () => {
    it('should successfully process batch evaluation', async () => {
      // Arrange
      const batchRequest: BatchEvaluateApprovalDto = {
        evaluations: [
          { userId: 'user-123', chapterId: '1', score: 85, additionalData: { timeSpent: 300 } },
          { userId: 'user-456', chapterId: '2', score: 90, additionalData: { timeSpent: 250 } },
        ],
      };
      const batchResult: BatchEvaluateApprovalResponseDto = {
        results: [mockEvaluationResponse],
        errors: [
          {
            request: batchRequest.evaluations[1],
            error: 'Evaluation failed',
          },
        ],
      };

      approvalEngineService.batchEvaluateApproval.mockResolvedValue(batchResult);

      // Act
      const result = await controller.batchEvaluateApproval(batchRequest, mockRequest);

      // Assert
      expect(result.results).toHaveLength(1);
      expect(result.errors).toHaveLength(1);
      expect(result.results[0]).toEqual(mockEvaluationResponse);
      expect(approvalEngineService.batchEvaluateApproval).toHaveBeenCalledWith(
        batchRequest.evaluations,
      );
    });
  });

  describe('configureRule', () => {
    it('should successfully configure approval rule', async () => {
      const ruleDto: ConfigureApprovalRuleDto = {
        chapterId: '1',
        minScoreThreshold: 80,
        maxAttempts: 3,
        allowErrorCarryover: true,
        isActive: true,
      };

      jest.spyOn(approvalEngineService, 'configureRule').mockResolvedValue(mockApprovalRule);

      const result = await controller.configureRule(ruleDto, mockRequest);

      expect(approvalEngineService.configureRule).toHaveBeenCalledWith(ruleDto);
      expect(result).toEqual(mockApprovalRule);
    });
  });

  describe('getRules', () => {
    it('should successfully get approval rules', async () => {
      const rulesResponse = [mockApprovalRule];
      const chapterId = '1';

      jest.spyOn(approvalEngineService, 'getRules').mockResolvedValue(rulesResponse);

      const result = await controller.getRules(chapterId);

      expect(approvalEngineService.getRules).toHaveBeenCalledWith(chapterId, undefined);
      expect(result).toEqual(rulesResponse);
    });
  });

  describe('deleteRule', () => {
    it('should successfully delete approval rule', async () => {
      const ruleId = 'rule-123';
      jest.spyOn(approvalEngineService, 'deleteRule').mockResolvedValue(undefined);

      const result = await controller.deleteRule(ruleId, mockRequest);

      expect(approvalEngineService.deleteRule).toHaveBeenCalledWith(ruleId);
      expect(result).toBeUndefined();
    });
  });

  describe('error handling', () => {
    it('should handle service errors gracefully', async () => {
      const dto: EvaluateApprovalDto = {
        userId: 'user-123',
        chapterId: '1',
        score: 85,
      };

      jest
        .spyOn(approvalEngineService, 'evaluateApproval')
        .mockRejectedValue(new Error('Database connection failed'));

      await expect(controller.evaluateApproval(dto, mockRequest)).rejects.toThrow(
        'Database connection failed',
      );
    });

    it('should handle invalid input data', async () => {
      const invalidDto: EvaluateApprovalDto = {
        userId: 'user-123',
        chapterId: '0',
        score: -1,
      };

      jest
        .spyOn(approvalEngineService, 'evaluateApproval')
        .mockRejectedValue(new Error('Invalid input data'));

      await expect(controller.evaluateApproval(invalidDto, mockRequest)).rejects.toThrow(
        'Invalid input data',
      );
    });
  });
});
