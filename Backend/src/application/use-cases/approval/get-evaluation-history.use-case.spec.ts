import { Test, TestingModule } from '@nestjs/testing';
import {
  GetEvaluationHistoryUseCase,
  GetChapterEvaluationStatsUseCase,
  GetLatestEvaluationUseCase,
} from './get-evaluation-history.use-case';
import { IApprovalEvaluationRepository } from '../../interfaces/repositories/approval-evaluation-repository.interface';
import {
  ApprovalEvaluation,
  EvaluationStatus,
} from '../../../domain/entities/approval-evaluation.entity';
import { User } from '../../../domain/entities/user.entity';
import { ApprovalRule } from '../../../domain/entities/approval-rule.entity';
import { ChapterEvaluationStatsDto } from '../../dtos/approval/evaluation-history.dto';

// Helper functions for creating mock objects
function createMockUser(overrides: Partial<User> = {}): User {
  return {
    id: 'user-123',
    email: 'test@example.com',
    isEmailVerified: true,
    password: 'hashedPassword',
    authProvider: 'EMAIL_PASSWORD',
    providerUserId: null,
    role: 'STUDENT',
    isActive: true,
    lastLoginAt: null,
    emailVerificationToken: null,
    passwordResetToken: null,
    passwordResetTokenExpires: null,
    personId: 'person-123',
    person: {} as unknown,
    refreshTokens: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    get isGoogleAuth() {
      return false;
    },
    get isAppleAuth() {
      return false;
    },
    get isEmailPasswordAuth() {
      return true;
    },
    get isAdmin() {
      return false;
    },
    get isSuperAdmin() {
      return false;
    },
    ...overrides,
  } as User;
}

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

function createMockApprovalEvaluation(
  overrides: Partial<ApprovalEvaluation> = {},
): ApprovalEvaluation {
  return {
    id: 'eval-123',
    userId: 'user-123',
    ruleId: 'rule-123',
    chapterId: 'chapter-123',
    score: 85,
    threshold: 80,
    status: EvaluationStatus.APPROVED,
    attemptNumber: 1,
    errorsFromPreviousAttempts: 0,
    feedback: null,
    evaluationData: null,
    evaluatedAt: new Date(),
    user: createMockUser(),
    rule: createMockApprovalRule(),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  } as ApprovalEvaluation;
}

describe('GetEvaluationHistoryUseCase', () => {
  let useCase: GetEvaluationHistoryUseCase;
  let approvalEvaluationRepository: jest.Mocked<IApprovalEvaluationRepository>;

  const mockEvaluation: ApprovalEvaluation = createMockApprovalEvaluation({
    chapterId: '1',
    feedback: 'Good job!',
    evaluationData: { timeSpent: 300 },
  });

  beforeEach(async () => {
    const mockRepository = {
      findByUserId: jest.fn(),
      findByUserAndChapter: jest.fn(),
      findByStatus: jest.fn(),
      findLatestByUserAndChapter: jest.fn(),
      getChapterEvaluationStats: jest.fn(),
      save: jest.fn(),
      findById: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetEvaluationHistoryUseCase,
        {
          provide: 'IApprovalEvaluationRepository',
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<GetEvaluationHistoryUseCase>(GetEvaluationHistoryUseCase);
    approvalEvaluationRepository = module.get('IApprovalEvaluationRepository');
  });

  describe('execute', () => {
    it('should get evaluation history with pagination', async () => {
      // Arrange
      const request = {
        userId: 'user-123',
        limit: 10,
        offset: 0,
      };

      approvalEvaluationRepository.findByUserId.mockResolvedValue([mockEvaluation]);

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result.evaluations).toHaveLength(1);
      expect(result.evaluations[0].id).toBe('eval-123');
      expect(result.hasMore).toBe(false);
      expect(approvalEvaluationRepository.findByUserId).toHaveBeenCalledWith('user-123');
    });

    it('should filter by chapter and status', async () => {
      // Arrange
      const request = {
        userId: 'user-123',
        chapterId: '1',
        status: EvaluationStatus.APPROVED,
        limit: 10,
        offset: 0,
      };

      approvalEvaluationRepository.findByUserAndChapter.mockResolvedValue([mockEvaluation]);

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result.evaluations).toHaveLength(1);
      expect(approvalEvaluationRepository.findByUserAndChapter).toHaveBeenCalledWith(
        'user-123',
        '1',
      );
    });

    it('should handle hasMore pagination correctly', async () => {
      // Arrange
      const request = {
        userId: 'user-123',
        limit: 2,
        offset: 0,
      };

      const mockEvaluations = [mockEvaluation, mockEvaluation, mockEvaluation]; // 3 items
      approvalEvaluationRepository.findByUserId.mockResolvedValue(mockEvaluations);

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result.evaluations).toHaveLength(2); // Should return only limit items
      expect(result.hasMore).toBe(true); // Should indicate more items available
    });
  });
});

describe('GetChapterEvaluationStatsUseCase', () => {
  let useCase: GetChapterEvaluationStatsUseCase;
  let approvalEvaluationRepository: jest.Mocked<IApprovalEvaluationRepository>;

  beforeEach(async () => {
    const mockRepository = {
      getChapterEvaluationStats: jest.fn(),
      findByUserAndChapter: jest.fn(),
      findByStatus: jest.fn(),
      findByUserId: jest.fn(),
      findLatestByUserAndChapter: jest.fn(),
      getEvaluationHistory: jest.fn(),
      save: jest.fn(),
      findById: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetChapterEvaluationStatsUseCase,
        {
          provide: 'IApprovalEvaluationRepository',
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<GetChapterEvaluationStatsUseCase>(GetChapterEvaluationStatsUseCase);
    approvalEvaluationRepository = module.get('IApprovalEvaluationRepository');
  });

  describe('execute', () => {
    it('should get chapter evaluation statistics', async () => {
      // Arrange
      const mockRepositoryStats = {
        totalEvaluations: 100,
        approvedCount: 85,
        rejectedCount: 15,
        averageScore: 82.5,
        averageAttempts: 1.2,
      };

      const expectedResult: ChapterEvaluationStatsDto = {
        chapterId: '1',
        totalEvaluations: 100,
        approvedCount: 85,
        failedCount: 15,
        pendingCount: 0,
        averageScore: 82.5,
        averageAdjustedScore: 82.5,
        approvalRate: 85,
        averageAttempts: 1.2,
      };

      approvalEvaluationRepository.getChapterEvaluationStats.mockResolvedValue(mockRepositoryStats);

      // Act
      const result = await useCase.execute('1');

      // Assert
      expect(result).toEqual(expectedResult);
      expect(approvalEvaluationRepository.getChapterEvaluationStats).toHaveBeenCalledWith('1');
    });
  });
});

describe('GetLatestEvaluationUseCase', () => {
  let useCase: GetLatestEvaluationUseCase;
  let approvalEvaluationRepository: jest.Mocked<IApprovalEvaluationRepository>;

  const mockEvaluation: ApprovalEvaluation = {
    id: 'eval-123',
    userId: 'user-123',
    ruleId: 'rule-123',
    chapterId: '1',
    score: 85,
    threshold: 80,
    status: EvaluationStatus.APPROVED,
    attemptNumber: 1,
    errorsFromPreviousAttempts: 0,
    feedback: 'Good job!',
    evaluatedAt: new Date(),
    evaluationData: { timeSpent: 300 },
    user: {} as never,
    rule: {} as never,
    createdAt: new Date(),
    updatedAt: new Date(),
    isApproved: jest.fn(),
    isRejected: jest.fn(),
    isPending: jest.fn(),
    getAdjustedScore: jest.fn(),
    approve: jest.fn(),
    reject: jest.fn(),
    hasErrorCarryover: jest.fn(),
    getScoreWithPenalty: jest.fn(),
  } as ApprovalEvaluation;

  beforeEach(async () => {
    const mockRepository = {
      findLatestByUserAndChapter: jest.fn(),
      getChapterEvaluationStats: jest.fn(),
      findByUserAndChapter: jest.fn(),
      findByStatus: jest.fn(),
      findByUserId: jest.fn(),
      getEvaluationHistory: jest.fn(),
      save: jest.fn(),
      findById: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetLatestEvaluationUseCase,
        {
          provide: 'IApprovalEvaluationRepository',
          useValue: mockRepository,
        },
      ],
    }).compile();

    useCase = module.get<GetLatestEvaluationUseCase>(GetLatestEvaluationUseCase);
    approvalEvaluationRepository = module.get('IApprovalEvaluationRepository');
  });

  describe('execute', () => {
    it('should get latest evaluation for user and chapter', async () => {
      // Arrange
      approvalEvaluationRepository.findLatestByUserAndChapter.mockResolvedValue(mockEvaluation);

      // Act
      const result = await useCase.execute('user-123', '1');

      // Assert
      expect(result).toBeDefined();
      expect(result!.id).toBe('eval-123');
      expect(result!.chapterId).toBe('1');
      expect(approvalEvaluationRepository.findLatestByUserAndChapter).toHaveBeenCalledWith(
        'user-123',
        '1',
      );
    });

    it('should return null when no evaluation found', async () => {
      // Arrange
      approvalEvaluationRepository.findLatestByUserAndChapter.mockResolvedValue(null);

      // Act
      const result = await useCase.execute('user-123', '1');

      // Assert
      expect(result).toBeNull();
    });
  });
});
