import { Test, TestingModule } from '@nestjs/testing';
import { ProgressController } from './progress.controller';
import { CreateProgressUseCase } from '../../../application/use-cases/progress/create-progress.use-case';
import { GetUserProgressUseCase } from '../../../application/use-cases/progress/get-user-progress.use-case';
import { UpdateProgressUseCase } from '../../../application/use-cases/progress/update-progress.use-case';
import { RepeatChapterUseCase } from '../../../application/use-cases/repetition/repeat-chapter.use-case';
import { GetRepetitionsUseCase } from '../../../application/use-cases/repetition/get-repetitions.use-case';
import { UpdateRepetitionUseCase } from '../../../application/use-cases/repetition/update-repetition.use-case';
import { CreateRepetitionDto } from '../../../application/dtos/repetition/create-repetition.dto';
import { UpdateRepetitionDto } from '../../../application/dtos/repetition/update-repetition.dto';
import { RepetitionResponseDto } from '../../../application/dtos/repetition/repetition-response.dto';
import { SessionType, RepetitionStatus } from '../../../domain/entities/chapter-repetition.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { EnhancedJwtGuard } from '../../../shared/guards/enhanced-jwt.guard';

describe('ProgressController', () => {
  let controller: ProgressController;

  let repeatChapterUseCase: jest.Mocked<RepeatChapterUseCase>;
  let getRepetitionsUseCase: jest.Mocked<GetRepetitionsUseCase>;
  let updateRepetitionUseCase: jest.Mocked<UpdateRepetitionUseCase>;

  const mockRequest = {
    user: { userId: 'user-1' },
  } as any;

  const mockRepetitionResponse: RepetitionResponseDto = {
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
    originalProgress: {
      id: 'progress-1',
      userId: 'user-1',
      chapterId: 'chapter-1',
      score: 85,
      lastActivity: new Date(),
      extraData: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    chapter: {
      id: 'chapter-1',
      title: 'Test Chapter',
      level: 'beginner',
    },
    durationInMinutes: 0,
    improvementRate: 0,
    isActive: true,
  };
beforeEach(async () => {
  const mockCreateProgressUseCase = {
    execute: jest.fn(),
  };

  const mockGetUserProgressUseCase = {
    execute: jest.fn(),
  };

  const mockUpdateProgressUseCase = {
    execute: jest.fn(),
  };

  const mockRepeatChapterUseCase = {
    execute: jest.fn(),
  };

  const mockGetRepetitionsUseCase = {
    execute: jest.fn(),
    getRepetitionById: jest.fn(),
    getRecentRepetitions: jest.fn(),
  };

  const mockUpdateRepetitionUseCase = {
    execute: jest.fn(),
    completeRepetition: jest.fn(),
    abandonRepetition: jest.fn(),
  };

  const module: TestingModule = await Test.createTestingModule({
    controllers: [ProgressController],
    providers: [
      { provide: CreateProgressUseCase, useValue: mockCreateProgressUseCase },
      { provide: GetUserProgressUseCase, useValue: mockGetUserProgressUseCase },
      { provide: UpdateProgressUseCase, useValue: mockUpdateProgressUseCase },

      { provide: RepeatChapterUseCase, useValue: mockRepeatChapterUseCase },
      { provide: GetRepetitionsUseCase, useValue: mockGetRepetitionsUseCase },
      { provide: UpdateRepetitionUseCase, useValue: mockUpdateRepetitionUseCase },
    ],
  })
    .overrideGuard(ThrottlerGuard)
    .useValue({ canActivate: jest.fn(() => true) })
    .overrideGuard(EnhancedJwtGuard)
    .useValue({ canActivate: jest.fn(() => true) })
    .compile();

  controller = module.get<ProgressController>(ProgressController);

  repeatChapterUseCase = module.get(RepeatChapterUseCase);
  getRepetitionsUseCase = module.get(GetRepetitionsUseCase);
  updateRepetitionUseCase = module.get(UpdateRepetitionUseCase);
});


  describe('startRepetition', () => {
    const createRepetitionDto: CreateRepetitionDto = {
      chapterId: 'chapter-1',
      originalProgressId: 'progress-1',
      sessionType: SessionType.PRACTICE,
    };

    it('should start a new repetition successfully', async () => {
      // Arrange
      repeatChapterUseCase.execute.mockResolvedValue(mockRepetitionResponse);

      // Act
      const result = await controller.startRepetition(createRepetitionDto, mockRequest);

      // Assert
      expect(result).toBeDefined();
      expect(result).toEqual(mockRepetitionResponse);
      expect(repeatChapterUseCase.execute).toHaveBeenCalledWith('user-1', createRepetitionDto);
    });

    it('should handle BadRequestException', async () => {
      // Arrange
      repeatChapterUseCase.execute.mockRejectedValue(
        new BadRequestException('Chapter not approved'),
      );

      // Act & Assert
      await expect(controller.startRepetition(createRepetitionDto, mockRequest)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getUserRepetitions', () => {
    it('should return user repetitions with pagination', async () => {
      // Arrange
      const mockResult = {
        repetitions: [mockRepetitionResponse],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
        stats: undefined,
      };
      getRepetitionsUseCase.execute.mockResolvedValue(mockResult);

      // Act
      const result = await controller.getUserRepetitions(mockRequest);

      // Assert
      expect(result).toBeDefined();
      expect(result).toEqual([mockRepetitionResponse]);
      expect(getRepetitionsUseCase.execute).toHaveBeenCalledWith('user-1');
    });

    it('should use default pagination values', async () => {
      // Arrange
      const mockResult = {
        repetitions: [mockRepetitionResponse],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
        stats: undefined,
      };
      getRepetitionsUseCase.execute.mockResolvedValue(mockResult);

      // Act
      await controller.getUserRepetitions(mockRequest);

      // Assert
      expect(getRepetitionsUseCase.execute).toHaveBeenCalledWith('user-1');
    });
  });

  describe('getRecentRepetitions', () => {
    it('should return recent repetitions', async () => {
      // Arrange
      getRepetitionsUseCase.getRecentRepetitions.mockResolvedValue([mockRepetitionResponse]);

      // Act
      const result = await controller.getRecentRepetitions(mockRequest);

      // Assert
      expect(result).toBeDefined();
      expect(result).toEqual([mockRepetitionResponse]);
      expect(getRepetitionsUseCase.getRecentRepetitions).toHaveBeenCalledWith('user-1');
    });

    it('should use default limit', async () => {
      // Arrange
      getRepetitionsUseCase.getRecentRepetitions.mockResolvedValue([mockRepetitionResponse]);

      // Act
      await controller.getRecentRepetitions(mockRequest);

      // Assert
      expect(getRepetitionsUseCase.getRecentRepetitions).toHaveBeenCalledWith('user-1');
    });
  });

  describe('getRepetitionById', () => {
    it('should return repetition by id', async () => {
      // Arrange
      getRepetitionsUseCase.getRepetitionById.mockResolvedValue(mockRepetitionResponse);

      // Act
      const result = await controller.getRepetitionById('repetition-1', mockRequest);

      // Assert
      expect(result).toBeDefined();
      expect(result).toEqual(mockRepetitionResponse);
      expect(getRepetitionsUseCase.getRepetitionById).toHaveBeenCalledWith(
        'user-1',
        'repetition-1',
      );
    });

    it('should handle NotFoundException', async () => {
      // Arrange
      getRepetitionsUseCase.getRepetitionById.mockRejectedValue(
        new NotFoundException('Repetition not found'),
      );

      // Act & Assert
      await expect(controller.getRepetitionById('repetition-1', mockRequest)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateRepetition', () => {
    const updateDto: UpdateRepetitionDto = {
      repetitionScore: 88,
      exerciseResults: { exercise1: 'correct' },
    };

    it('should update repetition successfully', async () => {
      // Arrange
      const updatedRepetition = { ...mockRepetitionResponse, repetitionScore: 88 };
      updateRepetitionUseCase.execute.mockResolvedValue(updatedRepetition);

      // Act
      const result = await controller.updateRepetition('repetition-1', updateDto, mockRequest);

      // Assert
      expect(result).toBeDefined();
      expect(result).toEqual(updatedRepetition);
      expect(updateRepetitionUseCase.execute).toHaveBeenCalledWith(
        'user-1',
        'repetition-1',
        updateDto,
      );
    });
  });

  describe('completeRepetition', () => {
    const completeBody = {
      score: 92,
      exerciseResults: { exercise1: 'correct', exercise2: 'correct' },
    };

    it('should complete repetition successfully', async () => {
      // Arrange
      const completedRepetition = {
        ...mockRepetitionResponse,
        status: RepetitionStatus.COMPLETED,
        repetitionScore: 92,
        completedAt: new Date(),
      };
      updateRepetitionUseCase.completeRepetition.mockResolvedValue(completedRepetition);

      // Act
      const result = await controller.completeRepetition('repetition-1', completeBody, mockRequest);

      // Assert
      expect(result).toBeDefined();
      expect(result).toEqual(completedRepetition);
      expect(updateRepetitionUseCase.completeRepetition).toHaveBeenCalledWith(
        'user-1',
        'repetition-1',
        92,
        completeBody.exerciseResults,
      );
    });
  });

  describe('abandonRepetition', () => {
    it('should abandon repetition successfully', async () => {
      // Arrange
      const abandonedRepetition = {
        ...mockRepetitionResponse,
        status: RepetitionStatus.ABANDONED,
        completedAt: new Date(),
      };
      updateRepetitionUseCase.abandonRepetition.mockResolvedValue(abandonedRepetition);

      // Act
      const result = await controller.abandonRepetition('repetition-1', mockRequest);

      // Assert
      expect(result).toBeDefined();
      expect(result).toEqual(abandonedRepetition);
      expect(updateRepetitionUseCase.abandonRepetition).toHaveBeenCalledWith(
        'user-1',
        'repetition-1',
      );
    });
  });
});
