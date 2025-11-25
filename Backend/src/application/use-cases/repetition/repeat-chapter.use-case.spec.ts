import { Test, TestingModule } from '@nestjs/testing';
import { RepeatChapterUseCase } from './repeat-chapter.use-case';
import { IUserRepository } from '../../interfaces/repositories/user-repository.interface';
import { IUserProgressRepository } from '../../interfaces/repositories/user-progress-repository.interface';
import { IChapterRepetitionRepository } from '../../interfaces/repositories/chapter-repetition-repository.interface';
import { CreateRepetitionDto } from '../../dtos/repetition/create-repetition.dto';
import { User } from '../../../domain/entities/user.entity';
import { UserProgress } from '../../../domain/entities/user-progress.entity';
import { ChapterRepetition } from '../../../domain/entities/chapter-repetition.entity';
import { SessionType, RepetitionStatus } from '../../../domain/entities/chapter-repetition.entity';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
// import { ConflictException } from '@nestjs/common';
describe('RepeatChapterUseCase', () => {
  let useCase: RepeatChapterUseCase;
  let userRepository: jest.Mocked<IUserRepository>;
  let userProgressRepository: jest.Mocked<IUserProgressRepository>;
  let chapterRepetitionRepository: jest.Mocked<IChapterRepetitionRepository>;

const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  password: 'hashedpassword',
  isActive: true,
  role: 'STUDENT',
  createdAt: new Date(),
  updatedAt: new Date(),
  refreshTokens: [],
} as unknown as User;

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
    extraData: {},
    createdAt: new Date(),
    updatedAt: new Date(),
    user: mockUser,
    chapter: null,
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
    chapter: null,
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

    const mockUserProgressRepository = {
      findById: jest.fn(),
    };

    const mockChapterRepetitionRepository = {
      create: jest.fn(),
      findActiveRepetition: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RepeatChapterUseCase,
        {
          provide: 'IUserRepository',
          useValue: mockUserRepository,
        },
        {
          provide: 'IUserProgressRepository',
          useValue: mockUserProgressRepository,
        },
        {
          provide: 'IChapterRepetitionRepository',
          useValue: mockChapterRepetitionRepository,
        },
      ],
    }).compile();

    useCase = module.get<RepeatChapterUseCase>(RepeatChapterUseCase);
    userRepository = module.get('IUserRepository');
    userProgressRepository = module.get('IUserProgressRepository');
    chapterRepetitionRepository = module.get('IChapterRepetitionRepository');
  });

  describe('execute', () => {
    const createRepetitionDto: CreateRepetitionDto = {
      chapterId: 'chapter-1',
      originalProgressId: 'progress-1',
      sessionType: SessionType.PRACTICE,
    };

    it('should create a new repetition successfully', async () => {
      // Arrange
      userRepository.findById.mockResolvedValue(mockUser);
      userProgressRepository.findById.mockResolvedValue(mockProgress);
      chapterRepetitionRepository.findActiveRepetition.mockResolvedValue(null);
      chapterRepetitionRepository.create.mockResolvedValue(mockRepetition);

      // Act
      const result = await useCase.execute('user-1', createRepetitionDto);

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBe('repetition-1');
      expect(result.status).toBe(RepetitionStatus.ACTIVE);
      expect(userRepository.findById).toHaveBeenCalledWith('user-1');
      expect(userProgressRepository.findById).toHaveBeenCalledWith('progress-1');
      expect(chapterRepetitionRepository.findActiveRepetition).toHaveBeenCalledWith(
        'user-1',
        'chapter-1',
      );
      expect(chapterRepetitionRepository.create).toHaveBeenCalled();
    });

    it('should throw NotFoundException when user does not exist', async () => {
      // Arrange
      userRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute('user-1', createRepetitionDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(userRepository.findById).toHaveBeenCalledWith('user-1');
    });

    it('should throw NotFoundException when original progress does not exist', async () => {
      // Arrange
      userRepository.findById.mockResolvedValue(mockUser);
      userProgressRepository.findById.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute('user-1', createRepetitionDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(userProgressRepository.findById).toHaveBeenCalledWith('progress-1');
    });

    it('should throw BadRequestException when progress does not belong to user', async () => {
      // Arrange
      const otherUserProgress = {
        ...mockProgress,
        userId: 'other-user',
        getProgressPercentage: jest.fn().mockReturnValue(50),
        markChapterCompleted: jest.fn(),
        incrementVocabularyLearned: jest.fn(),
        isChapterInProgress: jest.fn().mockReturnValue(true),
        canCompleteChapter: jest.fn().mockReturnValue(false),
      } as any;
      userRepository.findById.mockResolvedValue(mockUser);
      userProgressRepository.findById.mockResolvedValue(otherUserProgress);

      // Act & Assert
      await expect(useCase.execute('user-1', createRepetitionDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when chapter is not approved', async () => {
      // Arrange
      const unapprovedProgress = {
        ...mockProgress,
        score: 65, // Below 70 threshold
        getProgressPercentage: jest.fn().mockReturnValue(50),
        markChapterCompleted: jest.fn(),
        incrementVocabularyLearned: jest.fn(),
        isChapterInProgress: jest.fn().mockReturnValue(true),
        canCompleteChapter: jest.fn().mockReturnValue(false),
      };
      userRepository.findById.mockResolvedValue(mockUser);
      userProgressRepository.findById.mockResolvedValue(unapprovedProgress);

      // Act & Assert
      await expect(useCase.execute('user-1', createRepetitionDto)).rejects.toThrow(
        BadRequestException,
      );
    });

it('should throw ConflictException when there is an active repetition', async () => {
  userRepository.findById.mockResolvedValue(mockUser);
  userProgressRepository.findById.mockResolvedValue(mockProgress);
  chapterRepetitionRepository.findActiveRepetition.mockResolvedValue(mockRepetition);

  await expect(useCase.execute('user-1', createRepetitionDto)).rejects.toThrow(
    ConflictException,
  );

  expect(chapterRepetitionRepository.findActiveRepetition).toHaveBeenCalledWith(
    'user-1',
    'chapter-1',
  );
});
    it('should throw BadRequestException when chapter IDs do not match', async () => {
      // Arrange
      const mismatchedDto = { ...createRepetitionDto, chapterId: 'different-chapter' };
      userRepository.findById.mockResolvedValue(mockUser);
      userProgressRepository.findById.mockResolvedValue(mockProgress);

      // Act & Assert
      await expect(useCase.execute('user-1', mismatchedDto)).rejects.toThrow(BadRequestException);
    });
  });
});
