import { Test, TestingModule } from '@nestjs/testing';
import { EvaluateApprovalUseCase, EvaluateApprovalRequest } from './evaluate-approval.use-case';
import {
  EvaluationStatus,
  ApprovalEvaluation,
} from '../../../domain/entities/approval-evaluation.entity';
import { ApprovalRule } from '../../../domain/entities/approval-rule.entity';
import { User } from '../../../domain/entities/user.entity';
import { Person } from '../../../domain/entities/person.entity';
import { IApprovalRuleRepository } from '../../interfaces/repositories/approval-rule-repository.interface';
import { IApprovalEvaluationRepository } from '../../interfaces/repositories/approval-evaluation-repository.interface';
import { IApprovalMetricsRepository } from '../../interfaces/repositories/approval-metrics-repository.interface';
import { IUserRepository } from '../../interfaces/repositories/user-repository.interface';

// Helper functions for creating mock objects
function createMockPerson(overrides: Partial<Person> = {}): Person {
  return {
    id: 'person-123',
    fullName: 'Test User',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

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
    person: createMockPerson(),
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
  };
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
    isApplicableToChapter: jest.fn().mockReturnValue(true),
    isScoreApproved: jest.fn().mockReturnValue(true),
    hasSpecialRequirements: jest.fn().mockReturnValue(false),
    getThresholdPercentage: jest.fn().mockReturnValue(80),
    canRetryAfterFailure: jest.fn().mockReturnValue(true),
    ...overrides,
  };
}

// Helper function to create complete ApprovalEvaluation mock objects
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
    status: EvaluationStatus.REJECTED,
    attemptNumber: 1,
    errorsFromPreviousAttempts: 0,
    feedback: null,
    evaluationData: null,
    evaluatedAt: new Date(),
    user: createMockUser(),
    rule: createMockApprovalRule(),
    createdAt: new Date(),
    updatedAt: new Date(),
    isApproved: jest.fn().mockReturnValue(false),
    isRejected: jest.fn().mockReturnValue(true),
    isPending: jest.fn().mockReturnValue(false),
    getAdjustedScore: jest.fn().mockReturnValue(85),
    approve: jest.fn(),
    reject: jest.fn(),
    hasErrorCarryover: jest.fn().mockReturnValue(false),
    getScoreWithPenalty: jest.fn().mockReturnValue(85),
    ...overrides,
  };
}

describe('EvaluateApprovalUseCase - Edge Cases QA', () => {
  let useCase: EvaluateApprovalUseCase;
  let mockApprovalRuleRepository: jest.Mocked<IApprovalRuleRepository>;
  let mockApprovalEvaluationRepository: jest.Mocked<IApprovalEvaluationRepository>;
  let mockApprovalMetricsRepository: jest.Mocked<IApprovalMetricsRepository>;
  let mockUserRepository: jest.Mocked<IUserRepository>;

  beforeEach(async () => {
    // Mock repositories
    mockApprovalRuleRepository = {
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
    };

    mockApprovalEvaluationRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByUserId: jest.fn(),
      findByUserAndChapter: jest.fn(),
      findLatestByUserAndChapter: jest.fn(),
      findByStatus: jest.fn(),
      findPreviousAttempts: jest.fn(),
      countAttempts: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      getEvaluationHistory: jest.fn(),
      getChapterEvaluationStats: jest.fn(),
    };

    mockApprovalMetricsRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByUserId: jest.fn(),
      findByUserAndChapter: jest.fn(),
      findByMetricType: jest.fn(),
      findByUserChapterAndType: jest.fn(),
      findRecentMetrics: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      getAverageMetricValue: jest.fn(),
      getUserMetricsSummary: jest.fn(),
      getChapterMetricsSummary: jest.fn(),
      createBulkMetrics: jest.fn(),
    };

    mockUserRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByIdWithPerson: jest.fn(),
      findByEmail: jest.fn(),
      findByEmailWithPerson: jest.fn(),
      findByEmailWithPassword: jest.fn(),
      findByEmailVerificationToken: jest.fn(),
      findAll: jest.fn(),
      update: jest.fn(),
      updatePassword: jest.fn(),
      updateRefreshToken: jest.fn(),
      updateLastLoginAt: jest.fn(),
      updateEmailVerificationStatus: jest.fn(),
      setPasswordResetToken: jest.fn(),
      clearPasswordResetToken: jest.fn(),
      setEmailVerificationToken: jest.fn(),
      clearEmailVerificationToken: jest.fn(),
      delete: jest.fn(),
      exists: jest.fn(),
      existsByEmail: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EvaluateApprovalUseCase,
        { provide: 'IApprovalRuleRepository', useValue: mockApprovalRuleRepository },
        { provide: 'IApprovalEvaluationRepository', useValue: mockApprovalEvaluationRepository },
        { provide: 'IApprovalMetricsRepository', useValue: mockApprovalMetricsRepository },
        { provide: 'IUserRepository', useValue: mockUserRepository },
      ],
    }).compile();

    useCase = module.get<EvaluateApprovalUseCase>(EvaluateApprovalUseCase);
  });

  describe('QA Edge Cases - Threshold Boundaries', () => {
    beforeEach(() => {
      // Setup common mocks
      mockUserRepository.findById.mockResolvedValue(createMockUser({ id: 'user-123' }));
      mockApprovalRuleRepository.findApplicableRules.mockResolvedValue([
        createMockApprovalRule({
          id: 'rule-123',
          minScoreThreshold: 80,
          maxAttempts: 3,
          allowErrorCarryover: false,
          canRetryAfterFailure: jest.fn().mockReturnValue(true),
        }),
      ]);
      mockApprovalEvaluationRepository.countAttempts.mockResolvedValue(0);
      mockApprovalEvaluationRepository.create.mockResolvedValue(
        createMockApprovalEvaluation({
          id: 'eval-123',
          evaluatedAt: new Date(),
        }),
      );
      mockApprovalEvaluationRepository.update.mockResolvedValue(createMockApprovalEvaluation());
      mockApprovalMetricsRepository.createBulkMetrics.mockResolvedValue([]);
    });

    it('should REJECT score of 79% (below 80% threshold)', async () => {
      // Arrange
      const request: EvaluateApprovalRequest = {
        userId: 'user-123',
        chapterId: '1',
        score: 79,
      };

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result.status).toBe(EvaluationStatus.REJECTED);
      expect(result.score).toBe(79);
      expect(result.adjustedScore).toBe(79);
      expect(result.threshold).toBe(80);
      expect(result.canRetry).toBe(true);
    });

    it('should APPROVE score of 80% (exactly at 80% threshold)', async () => {
      // Arrange
      const request: EvaluateApprovalRequest = {
        userId: 'user-123',
        chapterId: '1',
        score: 80,
      };

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result.status).toBe(EvaluationStatus.APPROVED);
      expect(result.score).toBe(80);
      expect(result.adjustedScore).toBe(80);
      expect(result.threshold).toBe(80);
    });

    it('should APPROVE score of 100% (above 80% threshold)', async () => {
      // Arrange
      const request: EvaluateApprovalRequest = {
        userId: 'user-123',
        chapterId: '1',
        score: 100,
      };

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result.status).toBe(EvaluationStatus.APPROVED);
      expect(result.score).toBe(100);
      expect(result.adjustedScore).toBe(100);
      expect(result.threshold).toBe(80);
    });
  });

  describe('QA Edge Cases - Critical Chapters 4 & 5', () => {
    beforeEach(() => {
      // Setup common mocks for critical chapters
      mockUserRepository.findById.mockResolvedValue(createMockUser({ id: 'user-123' }));
      mockApprovalRuleRepository.findApplicableRules.mockResolvedValue([
        createMockApprovalRule({
          id: 'rule-critical',
          minScoreThreshold: 80, // This should be overridden to 100 for chapters 4 & 5
          maxAttempts: 3,
          allowErrorCarryover: false,
          canRetryAfterFailure: jest.fn().mockReturnValue(true),
        }),
      ]);
      mockApprovalEvaluationRepository.countAttempts.mockResolvedValue(0);
      mockApprovalEvaluationRepository.create.mockResolvedValue(
        createMockApprovalEvaluation({
          id: 'eval-critical',
          evaluatedAt: new Date(),
        }),
      );
      mockApprovalEvaluationRepository.update.mockResolvedValue(createMockApprovalEvaluation());
      mockApprovalMetricsRepository.createBulkMetrics.mockResolvedValue([]);
    });

    it('should REJECT 99% score for Chapter 4 (requires 100%)', async () => {
      // Arrange
      const request: EvaluateApprovalRequest = {
        userId: 'user-123',
        chapterId: '4',
        score: 99,
      };

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result.status).toBe(EvaluationStatus.REJECTED);
      expect(result.score).toBe(99);
      expect(result.adjustedScore).toBe(99);
      expect(result.threshold).toBe(100); // Critical chapter threshold
      expect(result.canRetry).toBe(true);
    });

    it('should APPROVE 100% score for Chapter 4', async () => {
      // Arrange
      const request: EvaluateApprovalRequest = {
        userId: 'user-123',
        chapterId: '4',
        score: 100,
      };

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result.status).toBe(EvaluationStatus.APPROVED);
      expect(result.score).toBe(100);
      expect(result.adjustedScore).toBe(100);
      expect(result.threshold).toBe(100);
    });

    it('should REJECT 99% score for Chapter 5 (requires 100%)', async () => {
      // Arrange
      const request: EvaluateApprovalRequest = {
        userId: 'user-123',
        chapterId: '5',
        score: 99,
      };

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result.status).toBe(EvaluationStatus.REJECTED);
      expect(result.score).toBe(99);
      expect(result.adjustedScore).toBe(99);
      expect(result.threshold).toBe(100); // Critical chapter threshold
    });

    it('should APPROVE 100% score for Chapter 5', async () => {
      // Arrange
      const request: EvaluateApprovalRequest = {
        userId: 'user-123',
        chapterId: '5',
        score: 100,
      };

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result.status).toBe(EvaluationStatus.APPROVED);
      expect(result.score).toBe(100);
      expect(result.adjustedScore).toBe(100);
      expect(result.threshold).toBe(100);
    });
  });

  describe('QA Edge Cases - Error Carryover Logic', () => {
    beforeEach(() => {
      mockUserRepository.findById.mockResolvedValue(createMockUser({ id: 'user-123' }));
      mockApprovalRuleRepository.findApplicableRules.mockResolvedValue([
        createMockApprovalRule({
          id: 'rule-carryover',
          minScoreThreshold: 80,
          maxAttempts: 3,
          allowErrorCarryover: true, // Enable error carryover
          canRetryAfterFailure: jest.fn().mockReturnValue(true),
        }),
      ]);
      mockApprovalEvaluationRepository.create.mockResolvedValue(
        createMockApprovalEvaluation({
          id: 'eval-carryover',
          evaluatedAt: new Date(),
        }),
      );
      mockApprovalEvaluationRepository.update.mockResolvedValue(createMockApprovalEvaluation());
      mockApprovalMetricsRepository.createBulkMetrics.mockResolvedValue([]);
    });

    it('should correctly calculate error carryover without double penalization', async () => {
      // Arrange - Simulate second attempt after first failure
      mockApprovalEvaluationRepository.countAttempts.mockResolvedValue(1); // Second attempt
      mockApprovalEvaluationRepository.findPreviousAttempts.mockResolvedValue([
        createMockApprovalEvaluation({
          score: 70, // Original score (not adjusted)
          threshold: 80,
          status: EvaluationStatus.REJECTED,
          errorsFromPreviousAttempts: 0, // First attempt had no previous errors
        }),
      ]);

      const request: EvaluateApprovalRequest = {
        userId: 'user-123',
        chapterId: '1',
        score: 85, // Good score on second attempt
      };

      // Act
      const result = await useCase.execute(request);

      // Assert
      // Previous attempt: deficit = 80 - 70 = 10 → penalty = ceil(10/10) = 1
      // Current attempt: 85 - 1 = 84 → should APPROVE (84 >= 80)
      expect(result.status).toBe(EvaluationStatus.APPROVED);
      expect(result.score).toBe(85);
      expect(result.adjustedScore).toBe(84); // 85 - 1 penalty
      expect(result.errorsCarriedOver).toBe(1);
      expect(result.threshold).toBe(80);
    });

    it('should cap error carryover at 50 points maximum', async () => {
      // Arrange - Simulate multiple failed attempts
      mockApprovalEvaluationRepository.countAttempts.mockResolvedValue(2);
      mockApprovalEvaluationRepository.findPreviousAttempts.mockResolvedValue([
        createMockApprovalEvaluation({
          score: 0, // Very low score
          threshold: 80,
          status: EvaluationStatus.REJECTED,
          errorsFromPreviousAttempts: 0,
        }),
        createMockApprovalEvaluation({
          score: 10, // Another very low score
          threshold: 80,
          status: EvaluationStatus.REJECTED,
          errorsFromPreviousAttempts: 8, // Had some previous penalty
        }),
      ]);

      const request: EvaluateApprovalRequest = {
        userId: 'user-123',
        chapterId: '1',
        score: 100, // Perfect score
      };

      // Act
      const result = await useCase.execute(request);

      // Assert
      // First attempt: deficit = 80 - 0 = 80 → penalty = ceil(80/10) = 8
      // Second attempt: deficit = 80 - 10 = 70 → penalty = ceil(70/10) = 7
      // Total penalty = 8 + 7 = 15, but should be capped at 50
      expect(result.errorsCarriedOver).toBeLessThanOrEqual(50);
      expect(result.adjustedScore).toBeGreaterThanOrEqual(50); // 100 - 50 = 50 minimum
    });
  });
});
