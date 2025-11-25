import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateProgressUseCase } from '../create-progress.use-case';
import { IUserProgressRepository } from '../../../interfaces/repositories/user-progress-repository.interface';
import { IUserRepository } from '../../../interfaces/repositories/user-repository.interface';
import { CreateProgressDto } from '../../../dtos/progress/create-progress.dto';
import { User } from '../../../../domain/entities/user.entity';
import { Person } from '../../../../domain/entities/person.entity';
import { Chapter } from '../../../../domain/entities/chapter.entity';
import { UserProgress } from '../../../../domain/entities/user-progress.entity';

describe('CreateProgressUseCase', () => {
  let useCase: CreateProgressUseCase;
  let mockUserProgressRepository: jest.Mocked<IUserProgressRepository>;
  let mockUserRepository: jest.Mocked<IUserRepository>;

  beforeEach(async () => {
    const mockUserProgressRepo = {
      createOrUpdate: jest.fn(),
    };

    const mockUserRepo = {
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateProgressUseCase,
        {
          provide: 'IUserProgressRepository',
          useValue: mockUserProgressRepo,
        },
        {
          provide: 'IUserRepository',
          useValue: mockUserRepo,
        },
      ],
    }).compile();

    useCase = module.get<CreateProgressUseCase>(CreateProgressUseCase);
    mockUserProgressRepository = module.get('IUserProgressRepository');
    mockUserRepository = module.get('IUserRepository');
  });

  describe('execute', () => {
    const mockUserId = 'user-123';
    const mockChapterId = 'chapter-456';

    const validCreateProgressDto: CreateProgressDto = {
      chapterId: mockChapterId,
      score: 85.5,
      extraData: { vocab: { chapter: 2, lastWord: 'apple' } },
    };

    const mockPerson: Person = {
      id: 'person-123',
      fullName: 'Test User',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockUser = {
      id: mockUserId,
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
      person: mockPerson,
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
    } as User;

    const mockChapter: Chapter = {
      id: mockChapterId,
      title: 'Test Chapter',
      level: 1,
      order: 1,
      isUnlocked: true,
      description: 'Test chapter description',
      imageUrl: null,
      metadata: null,
      vocabularyItems: [],
      userProgresses: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      canBeUnlocked: jest.fn().mockReturnValue(true),
      getDisplayLevel: jest.fn().mockReturnValue('Basic'),
      isFirstChapter: jest.fn().mockReturnValue(true),
    };

const mockProgress = {
  id: 'progress-789',
  userId: mockUserId,
  chapterId: mockChapterId,
  score: 85.5,
  lastActivity: new Date(),
  chapterCompleted: false,
  chapterCompletionDate: null,
  vocabularyItemsLearned: 5,
  totalVocabularyItems: 20,
  extraData: { vocab: { chapter: 2, lastWord: 'apple' } },
  createdAt: new Date(),
  updatedAt: new Date(),

  // Relations
  user: mockUser,
  chapter: mockChapter,

  // Métodos
  getProgressPercentage: jest.fn().mockReturnValue(25),
  markChapterCompleted: jest.fn(),
  incrementVocabularyLearned: jest.fn(),
  isChapterInProgress: jest.fn().mockReturnValue(true),
  canCompleteChapter: jest.fn().mockReturnValue(false),
} as unknown as UserProgress;

    it('should create progress successfully when user exists', async () => {
      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockUserProgressRepository.createOrUpdate.mockResolvedValue(mockProgress);

      const result = await useCase.execute(mockUserId, validCreateProgressDto);

      expect(mockUserRepository.findById).toHaveBeenCalledWith(mockUserId);
      expect(mockUserProgressRepository.createOrUpdate).toHaveBeenCalledWith(
        mockUserId,
        validCreateProgressDto,
      );
      expect(result).toEqual({
        id: mockProgress.id,
        userId: mockProgress.userId,
        chapterId: mockProgress.chapterId,
        score: mockProgress.score,
        lastActivity: mockProgress.lastActivity,
        extraData: mockProgress.extraData,
        createdAt: mockProgress.createdAt,
        updatedAt: mockProgress.updatedAt,
      });
    });

    it('should throw NotFoundException when user does not exist', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute(mockUserId, validCreateProgressDto)).rejects.toThrow(
        NotFoundException,
      );

      expect(mockUserRepository.findById).toHaveBeenCalledWith(mockUserId);
      expect(mockUserProgressRepository.createOrUpdate).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when score is out of range', async () => {
      const invalidDto = { ...validCreateProgressDto, score: 150 };
      mockUserRepository.findById.mockResolvedValue(mockUser);

      await expect(useCase.execute(mockUserId, invalidDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when score is negative', async () => {
      const invalidDto = { ...validCreateProgressDto, score: -10 };
      mockUserRepository.findById.mockResolvedValue(mockUser);

      await expect(useCase.execute(mockUserId, invalidDto)).rejects.toThrow(BadRequestException);
    });

    it('should handle progress without score', async () => {
      const dtoWithoutScore = { chapterId: mockChapterId };
      const progressWithoutScore = {
        ...mockProgress,
        score: null,
        // Relations
        user: mockUser,
        chapter: mockChapter,
        // Ensure all methods are properly mocked
        getProgressPercentage: jest.fn().mockReturnValue(25),
        markChapterCompleted: jest.fn(),
        incrementVocabularyLearned: jest.fn(),
        isChapterInProgress: jest.fn().mockReturnValue(true),
        canCompleteChapter: jest.fn().mockReturnValue(false),
      };

      mockUserRepository.findById.mockResolvedValue(mockUser);
      mockUserProgressRepository.createOrUpdate.mockResolvedValue(progressWithoutScore);

      const result = await useCase.execute(mockUserId, dtoWithoutScore);

      expect(result.score).toBeNull();
      expect(mockUserProgressRepository.createOrUpdate).toHaveBeenCalledWith(
        mockUserId,
        dtoWithoutScore,
      );
    });
  });
});
