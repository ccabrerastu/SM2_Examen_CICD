import { Test, TestingModule } from '@nestjs/testing';
import { GetRepetitionsUseCase } from './get-repetitions.use-case';
import { IUserRepository } from '../../interfaces/repositories/user-repository.interface';
import { IChapterRepetitionRepository } from '../../interfaces/repositories/chapter-repetition-repository.interface';
import { User } from '../../../domain/entities/user.entity';
import { ChapterRepetition } from '../../../domain/entities/chapter-repetition.entity';
import { UserProgress } from '../../../domain/entities/user-progress.entity';
import { SessionType, RepetitionStatus } from '../../../domain/entities/chapter-repetition.entity';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('GetRepetitionsUseCase', () => {
  let useCase: GetRepetitionsUseCase;
  let userRepository: jest.Mocked<IUserRepository>;
  let chapterRepetitionRepository: jest.Mocked<IChapterRepetitionRepository>;

  const mockUser: User = {
    id: 'user-1',
    email: 'test@example.com',
    password: 'hashedpassword',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    refreshTokens: [],
    progress: [],
  } as any;

  const mockProgress: UserProgress = {
    id: 'progress-1',
    userId: 'user-1',
    chapterId: 'chapter-1',
    score: 85,
    lastActivity: new Date(),
    extraData: {},
    createdAt: new Date(),
    updatedAt: new Date(),
    user: mockUser,
    chapter: null,
    isApproved: jest.fn().mockReturnValue(true),
    getScorePercentage: jest.fn().mockReturnValue(85),
    updateScore: jest.fn(),
    markAsCompleted: jest.fn(),
  } as any;

  const mockRepetition: ChapterRepetition = {
    id: 'repetition-1',
    userId: 'user-1',
    chapterId: 'chapter-1',
    originalProgressId: 'progress-1',
    sessionType: SessionType.PRACTICE,
    status: RepetitionStatus.COMPLETED,
    repetitionScore: 85,
    exerciseResults: {},
    startedAt: new Date(),
    completedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    user: mockUser,
    originalProgress: mockProgress,
    chapter: null,
    markAsCompleted: jest.fn(),
    markAsAbandoned: jest.fn(),
    isActive: jest.fn().mockReturnValue(false),
    isCompleted: jest.fn().mockReturnValue(true),
    getImprovementRate: jest.fn().mockReturnValue(0),
    getDurationInMinutes: jest.fn().mockReturnValue(30),
    updateExerciseResults: jest.fn(),
  } as any;

  const mockRepetitions = [mockRepetition];

  beforeEach(async () => {
    const mockUserRepository = {
      findById: jest.fn(),
    };

    const mockChapterRepetitionRepository = {
      findByUserId: jest.fn(),
      findById: jest.fn(),
      findRecentRepetitions: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetRepetitionsUseCase,
        {
          provide: 'IUserRepository',
          useValue: mockUserRepository,
        },
        {
          provide: 'IChapterRepetitionRepository',
          useValue: mockChapterRepetitionRepository,
        },
      ],
    }).compile();

    useCase = module.get<GetRepetitionsUseCase>(GetRepetitionsUseCase);
    userRepository = module.get('IUserRepository');
    chapterRepetitionRepository = module.get('IChapterRepetitionRepository');
  });

  describe('execute', () => {
    it('should return user repetitions with pagination', async () => {
      // Arrange
      const options = { limit: 10, chapterId: 'chapter-1' };
      const expectedFilters = { userId: 'user-1', limit: 10, chapterId: 'chapter-1' };
      userRepository.findById.mockResolvedValue(mockUser);
      chapterRepetitionRepository.findByUserId.mockResolvedValue(mockRepetitions);

      // Act
      const result = await useCase.execute('user-1', options);

      // Assert
      expect(result).toBeDefined();
      expect(result.repetitions).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(userRepository.findById).toHaveBeenCalledWith('user-1');
      expect(chapterRepetitionRepository.findByUserId).toHaveBeenCalledWith(
        'user-1',
        expectedFilters,
      );
    });

    it('should throw NotFoundException when user does not exist', async () => {
      // Arrange
      const options = { page: 1, limit: 10 };
      userRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute('user-1', options)).rejects.toThrow(NotFoundException);
      expect(userRepository.findById).toHaveBeenCalledWith('user-1');
    });
  });

  describe('getRepetitionById', () => {
    it('should return repetition by id when user owns it', async () => {
      // Arrange
      userRepository.findById.mockResolvedValue(mockUser);
      chapterRepetitionRepository.findById.mockResolvedValue(mockRepetition);

      // Act
      const result = await useCase.getRepetitionById('user-1', 'repetition-1');

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBe('repetition-1');
      expect(userRepository.findById).toHaveBeenCalledWith('user-1');
      expect(chapterRepetitionRepository.findById).toHaveBeenCalledWith('repetition-1');
    });

    it('should throw NotFoundException when user does not exist', async () => {
      // Arrange
      userRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.getRepetitionById('user-1', 'repetition-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when repetition does not exist', async () => {
      // Arrange
      userRepository.findById.mockResolvedValue(mockUser);
      chapterRepetitionRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.getRepetitionById('user-1', 'repetition-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException when repetition does not belong to user', async () => {
      // Arrange
      const otherUserRepetition = {
        ...mockRepetition,
        userId: 'other-user',
        id: 'repetition-2',
        markAsCompleted: jest.fn(),
        markAsAbandoned: jest.fn(),
        isActive: jest.fn().mockReturnValue(false),
        isCompleted: jest.fn().mockReturnValue(true),
        getImprovementRate: jest.fn().mockReturnValue(0),
        getDurationInMinutes: jest.fn().mockReturnValue(30),
        updateExerciseResults: jest.fn(),
      } as any;
      userRepository.findById.mockResolvedValue(mockUser);
      chapterRepetitionRepository.findById.mockResolvedValue(otherUserRepetition);

      // Act & Assert
      await expect(useCase.getRepetitionById('user-1', 'repetition-1')).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('getRecentRepetitions', () => {
    it('should return recent repetitions for user', async () => {
      // Arrange
      userRepository.findById.mockResolvedValue(mockUser);
      chapterRepetitionRepository.findRecentRepetitions.mockResolvedValue(mockRepetitions);

      // Act
      const result = await useCase.getRecentRepetitions('user-1', 5);

      // Assert
      expect(result).toBeDefined();
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('repetition-1');
      expect(userRepository.findById).toHaveBeenCalledWith('user-1');
      expect(chapterRepetitionRepository.findRecentRepetitions).toHaveBeenCalledWith('user-1', 5);
    });

    it('should throw NotFoundException when user does not exist', async () => {
      // Arrange
      userRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.getRecentRepetitions('user-1', 5)).rejects.toThrow(NotFoundException);
    });

    it('should use default limit when not provided', async () => {
      // Arrange
      userRepository.findById.mockResolvedValue(mockUser);
      chapterRepetitionRepository.findRecentRepetitions.mockResolvedValue(mockRepetitions);

      // Act
      const result = await useCase.getRecentRepetitions('user-1');

      // Assert
      expect(result).toBeDefined();
      expect(chapterRepetitionRepository.findRecentRepetitions).toHaveBeenCalledWith('user-1', 10);
    });
  });
});
