import { Test, TestingModule } from '@nestjs/testing';
import { UpdateRepetitionUseCase } from './update-repetition.use-case';
import { IUserRepository } from '../../interfaces/repositories/user-repository.interface';
import { IChapterRepetitionRepository } from '../../interfaces/repositories/chapter-repetition-repository.interface';
import { UpdateRepetitionDto } from '../../dtos/repetition/update-repetition.dto';
import { User } from '../../../domain/entities/user.entity';
import { ChapterRepetition } from '../../../domain/entities/chapter-repetition.entity';
import { UserProgress } from '../../../domain/entities/user-progress.entity';
import { SessionType, RepetitionStatus } from '../../../domain/entities/chapter-repetition.entity';
import { NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';

describe('UpdateRepetitionUseCase', () => {
  let useCase: UpdateRepetitionUseCase;
  let userRepository: jest.Mocked<IUserRepository>;
  let chapterRepetitionRepository: jest.Mocked<IChapterRepetitionRepository>;

  const mockUser: User = {
    id: 'user-1',
    email: 'test@example.com',
    role: 'STUDENT',
    isActive: true,
    authProvider: 'EMAIL_PASSWORD',
    isEmailVerified: false,
    password: 'hashedpassword',
    providerUserId: null,
    lastLoginAt: null,
    emailVerificationToken: null,
    passwordResetToken: null,
    passwordResetTokenExpires: null,
    personId: 'person-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  } as User;

  const mockProgress: UserProgress = {
    id: 'progress-1',
    userId: 'user-1',
    chapterId: 'chapter-1',
    score: 85,
    lastActivity: new Date(),
    chapterCompleted: false,
    chapterCompletionDate: null,
    vocabularyItemsLearned: 10,
    totalVocabularyItems: 20,
    extraData: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    getProgressPercentage: jest.fn().mockReturnValue(50),
    markChapterCompleted: jest.fn(),
    incrementVocabularyLearned: jest.fn(),
    isChapterInProgress: jest.fn().mockReturnValue(true),
    canCompleteChapter: jest.fn().mockReturnValue(false),
  } as any;

  const mockRepetition: ChapterRepetition = {
    id: 'repetition-1',
    userId: 'user-1',
    chapterId: 'chapter-1',
    originalProgressId: 'progress-1',
    sessionType: SessionType.PRACTICE,
    status: RepetitionStatus.ACTIVE,
    repetitionScore: null,
    exerciseResults: {},
    startedAt: new Date(),
    completedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    user: mockUser,
    originalProgress: mockProgress,
    markAsCompleted: jest.fn(),
    markAsAbandoned: jest.fn(),
    isActive: jest.fn().mockReturnValue(true),
    isCompleted: jest.fn().mockReturnValue(false),
    getImprovementRate: jest.fn().mockReturnValue(0),
    getDurationInMinutes: jest.fn().mockReturnValue(0),
    updateExerciseResults: jest.fn(),
  } as any;

  beforeEach(async () => {
    const mockUserRepository = {
      findById: jest.fn(),
    };

    const mockChapterRepetitionRepository = {
      findById: jest.fn(),
      update: jest.fn(),
      markAsCompleted: jest.fn(),
      markAsAbandoned: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateRepetitionUseCase,
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

    useCase = module.get<UpdateRepetitionUseCase>(UpdateRepetitionUseCase);
    userRepository = module.get('IUserRepository');
    chapterRepetitionRepository = module.get('IChapterRepetitionRepository');
  });

  describe('execute', () => {
    const updateDto: UpdateRepetitionDto = {
      repetitionScore: 88,
      exerciseResults: { exercise1: 'correct', exercise2: 'correct' },
    };

    it('should update repetition successfully', async () => {
      // Arrange
      const updatedRepetition = {
        ...mockRepetition,
        repetitionScore: 88,
        exerciseResults: updateDto.exerciseResults,
        updatedAt: new Date(),
        markAsCompleted: jest.fn(),
        markAsAbandoned: jest.fn(),
        isActive: jest.fn().mockReturnValue(true),
        isCompleted: jest.fn().mockReturnValue(false),
        getImprovementRate: jest.fn().mockReturnValue(0),
        getDurationInMinutes: jest.fn().mockReturnValue(0),
        updateExerciseResults: jest.fn(),
      } as any;

      userRepository.findById.mockResolvedValue(mockUser);
      chapterRepetitionRepository.findById.mockResolvedValue(mockRepetition);
      chapterRepetitionRepository.update.mockResolvedValue(updatedRepetition);

      // Act
      const result = await useCase.execute('user-1', 'repetition-1', updateDto);

      // Assert
      expect(result).toBeDefined();
      expect(result.repetitionScore).toBe(88);
      expect(userRepository.findById).toHaveBeenCalledWith('user-1');
      expect(chapterRepetitionRepository.findById).toHaveBeenCalledWith('repetition-1');
      expect(chapterRepetitionRepository.update).toHaveBeenCalled();
    });

    it('should throw NotFoundException when user does not exist', async () => {
      // Arrange
      userRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute('user-1', 'repetition-1', updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when repetition does not exist', async () => {
      // Arrange
      userRepository.findById.mockResolvedValue(mockUser);
      chapterRepetitionRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute('user-1', 'repetition-1', updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException when repetition does not belong to user', async () => {
      // Arrange
      const otherUserRepetition = {
        ...mockRepetition,
        userId: 'other-user',
        markAsCompleted: jest.fn(),
        markAsAbandoned: jest.fn(),
        isActive: jest.fn().mockReturnValue(true),
        isCompleted: jest.fn().mockReturnValue(false),
        getImprovementRate: jest.fn().mockReturnValue(0),
        getDurationInMinutes: jest.fn().mockReturnValue(0),
        updateExerciseResults: jest.fn(),
      } as any;
      userRepository.findById.mockResolvedValue(mockUser);
      chapterRepetitionRepository.findById.mockResolvedValue(otherUserRepetition);

      // Act & Assert
      await expect(useCase.execute('user-1', 'repetition-1', updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException when repetition is not updatable', async () => {
      // Arrange
      const completedRepetition = {
        ...mockRepetition,
        status: RepetitionStatus.COMPLETED,
        markAsCompleted: jest.fn(),
        markAsAbandoned: jest.fn(),
        isActive: jest.fn().mockReturnValue(false),
        isCompleted: jest.fn().mockReturnValue(true),
        getImprovementRate: jest.fn().mockReturnValue(0),
        getDurationInMinutes: jest.fn().mockReturnValue(0),
        updateExerciseResults: jest.fn(),
      } as any;
      userRepository.findById.mockResolvedValue(mockUser);
      chapterRepetitionRepository.findById.mockResolvedValue(completedRepetition);

      // Act & Assert
      await expect(useCase.execute('user-1', 'repetition-1', updateDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('completeRepetition', () => {
    const completeDto: UpdateRepetitionDto = {
      repetitionScore: 92,
      status: RepetitionStatus.COMPLETED,
      exerciseResults: { exercise1: 'correct', exercise2: 'correct' },
      completedAt: new Date(),
    };

    it('should complete repetition successfully', async () => {
      // Arrange
      const completedRepetition = {
        ...mockRepetition,
        status: RepetitionStatus.COMPLETED,
        repetitionScore: 92,
        completedAt: completeDto.completedAt,
        exerciseResults: completeDto.exerciseResults,
        markAsCompleted: jest.fn(),
        markAsAbandoned: jest.fn(),
        isActive: jest.fn().mockReturnValue(false),
        isCompleted: jest.fn().mockReturnValue(true),
        getImprovementRate: jest.fn().mockReturnValue(0),
        getDurationInMinutes: jest.fn().mockReturnValue(0),
        updateExerciseResults: jest.fn(),
      } as any;

      userRepository.findById.mockResolvedValue(mockUser);
      chapterRepetitionRepository.findById.mockResolvedValue(mockRepetition);
      chapterRepetitionRepository.markAsCompleted.mockResolvedValue(completedRepetition);

      // Act
      const result = await useCase.completeRepetition(
        'user-1',
        'repetition-1',
        92,
        completeDto.exerciseResults,
      );

      // Assert
      expect(result).toBeDefined();
      expect(result.status).toBe(RepetitionStatus.COMPLETED);
      expect(result.repetitionScore).toBe(92);
      expect(result.completedAt).toBeDefined();
    });

    it('should throw BadRequestException when trying to complete without score', async () => {
      // Arrange
      userRepository.findById.mockResolvedValue(mockUser);
      chapterRepetitionRepository.findById.mockResolvedValue(mockRepetition);

      // Act & Assert
      await expect(
        useCase.completeRepetition('user-1', 'repetition-1', null as any, {}),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when repetition is already completed', async () => {
      // Arrange
      const completedRepetition = {
        ...mockRepetition,
        status: RepetitionStatus.COMPLETED,
        markAsCompleted: jest.fn(),
        markAsAbandoned: jest.fn(),
        isActive: jest.fn().mockReturnValue(false),
        isCompleted: jest.fn().mockReturnValue(true),
        getImprovementRate: jest.fn().mockReturnValue(0),
        getDurationInMinutes: jest.fn().mockReturnValue(0),
        updateExerciseResults: jest.fn(),
      } as any;
      userRepository.findById.mockResolvedValue(mockUser);
      chapterRepetitionRepository.findById.mockResolvedValue(completedRepetition);

      // Act & Assert
      await expect(useCase.completeRepetition('user-1', 'repetition-1', 85)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('abandonRepetition', () => {
    it('should abandon repetition successfully', async () => {
      // Arrange
      const abandonedRepetition = {
        ...mockRepetition,
        status: RepetitionStatus.ABANDONED,
        completedAt: new Date(),
        markAsCompleted: jest.fn(),
        markAsAbandoned: jest.fn(),
        isActive: jest.fn().mockReturnValue(false),
        isCompleted: jest.fn().mockReturnValue(false),
        getImprovementRate: jest.fn().mockReturnValue(0),
        getDurationInMinutes: jest.fn().mockReturnValue(0),
        updateExerciseResults: jest.fn(),
      } as any;

      userRepository.findById.mockResolvedValue(mockUser);
      chapterRepetitionRepository.findById.mockResolvedValue(mockRepetition);
      chapterRepetitionRepository.markAsAbandoned.mockResolvedValue(abandonedRepetition);

      // Act
      const result = await useCase.abandonRepetition('user-1', 'repetition-1');

      // Assert
      expect(result).toBeDefined();
      expect(result.status).toBe(RepetitionStatus.ABANDONED);
      expect(result.completedAt).toBeDefined();
    });

    it('should throw BadRequestException when repetition is already completed', async () => {
      // Arrange
      const completedRepetition = {
        ...mockRepetition,
        status: RepetitionStatus.COMPLETED,
        markAsCompleted: jest.fn(),
        markAsAbandoned: jest.fn(),
        isActive: jest.fn().mockReturnValue(false),
        isCompleted: jest.fn().mockReturnValue(true),
        getImprovementRate: jest.fn().mockReturnValue(0),
        getDurationInMinutes: jest.fn().mockReturnValue(0),
        updateExerciseResults: jest.fn(),
      } as any;
      userRepository.findById.mockResolvedValue(mockUser);
      chapterRepetitionRepository.findById.mockResolvedValue(completedRepetition);

      // Act & Assert
      await expect(useCase.abandonRepetition('user-1', 'repetition-1')).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw BadRequestException when repetition is already abandoned', async () => {
      // Arrange
      const abandonedRepetition = {
        ...mockRepetition,
        status: RepetitionStatus.ABANDONED,
        markAsCompleted: jest.fn(),
        markAsAbandoned: jest.fn(),
        isActive: jest.fn().mockReturnValue(false),
        isCompleted: jest.fn().mockReturnValue(false),
        getImprovementRate: jest.fn().mockReturnValue(0),
        getDurationInMinutes: jest.fn().mockReturnValue(0),
        updateExerciseResults: jest.fn(),
      } as any;
      userRepository.findById.mockResolvedValue(mockUser);
      chapterRepetitionRepository.findById.mockResolvedValue(abandonedRepetition);

      // Act & Assert
      await expect(useCase.abandonRepetition('user-1', 'repetition-1')).rejects.toThrow(
        ConflictException,
      );
    });
  });
});
