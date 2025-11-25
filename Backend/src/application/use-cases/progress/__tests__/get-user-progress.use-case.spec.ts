import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { GetUserProgressUseCase } from '../get-user-progress.use-case';
import { IUserProgressRepository } from '../../../interfaces/repositories/user-progress-repository.interface';
import { IUserRepository } from '../../../interfaces/repositories/user-repository.interface';
import { User } from '../../../../domain/entities/user.entity';
import { UserProgress } from '../../../../domain/entities/user-progress.entity';

describe('GetUserProgressUseCase', () => {
  let useCase: GetUserProgressUseCase;
  let mockUserProgressRepository: jest.Mocked<IUserProgressRepository>;
  let mockUserRepository: jest.Mocked<IUserRepository>;

  beforeEach(async () => {
    const mockUserProgressRepo = {
      findByUserId: jest.fn(),
      getUserStats: jest.fn(),
    };

    const mockUserRepo = {
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetUserProgressUseCase,
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

    useCase = module.get<GetUserProgressUseCase>(GetUserProgressUseCase);
    mockUserProgressRepository = module.get('IUserProgressRepository');
    mockUserRepository = module.get('IUserRepository');
  });

  describe('execute', () => {
    const targetUserId = 'target-user-123';
    const requestingUserId = 'requesting-user-456';
    const adminUserId = 'admin-user-789';

    const mockTargetUser = {
      id: targetUserId,
      email: 'target@example.com',
      role: 'STUDENT',
      isAdmin: false,
    } as User;

    const mockRequestingUser = {
      id: requestingUserId,
      email: 'requesting@example.com',
      role: 'STUDENT',
      isAdmin: false,
    } as User;

    const mockAdminUser = {
      id: adminUserId,
      email: 'admin@example.com',
      role: 'ADMIN',
      isAdmin: true,
    } as User;

    const mockProgressRecords = [
      {
        id: 'progress-1',
        userId: targetUserId,
        chapterId: 'chapter-1',
        score: 85.5,
        lastActivity: new Date('2025-09-08T17:00:00Z'),
        extraData: { vocab: { chapter: 1, lastWord: 'apple' } },
        createdAt: new Date('2025-09-08T15:00:00Z'),
        updatedAt: new Date('2025-09-08T17:00:00Z'),
      },
    ] as unknown as UserProgress[];

    const mockStats = {
      totalRecords: 1,
      lastActivity: new Date('2025-09-08T17:00:00Z'),
    };

    it('should return user progress when user requests their own progress', async () => {
      mockUserRepository.findById
        .mockResolvedValueOnce(mockTargetUser) // target user
        .mockResolvedValueOnce(mockTargetUser); // requesting user (same user)
      mockUserProgressRepository.findByUserId.mockResolvedValue(mockProgressRecords);
      mockUserProgressRepository.getUserStats.mockResolvedValue(mockStats);

      const result = await useCase.execute(targetUserId, targetUserId);

      expect(result).toEqual({
        userId: targetUserId,
        totalRecords: 1,
        lastActivity: mockStats.lastActivity,
        progress: mockProgressRecords.map(record => ({
          id: record.id,
          userId: record.userId,
          chapterId: record.chapterId,
          score: record.score,
          lastActivity: record.lastActivity,
          extraData: record.extraData,
          createdAt: record.createdAt,
          updatedAt: record.updatedAt,
        })),
      });
    });

    it('should allow admin to access any user progress', async () => {
      mockUserRepository.findById
        .mockResolvedValueOnce(mockTargetUser) // target user
        .mockResolvedValueOnce(mockAdminUser); // requesting user (admin)
      mockUserProgressRepository.findByUserId.mockResolvedValue(mockProgressRecords);
      mockUserProgressRepository.getUserStats.mockResolvedValue(mockStats);

      const result = await useCase.execute(targetUserId, adminUserId);

      expect(result.userId).toBe(targetUserId);
      expect(result.totalRecords).toBe(1);
    });

    it('should throw ForbiddenException when non-admin user tries to access other user progress', async () => {
      mockUserRepository.findById
        .mockResolvedValueOnce(mockTargetUser) // target user
        .mockResolvedValueOnce(mockRequestingUser); // requesting user (different, non-admin)

      await expect(useCase.execute(targetUserId, requestingUserId)).rejects.toThrow(
        ForbiddenException,
      );

      expect(mockUserProgressRepository.findByUserId).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when target user does not exist', async () => {
      mockUserRepository.findById.mockResolvedValueOnce(null); // target user not found

      await expect(useCase.execute(targetUserId, requestingUserId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when requesting user does not exist', async () => {
      mockUserRepository.findById
        .mockResolvedValueOnce(mockTargetUser) // target user exists
        .mockResolvedValueOnce(null); // requesting user not found

      await expect(useCase.execute(targetUserId, requestingUserId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should handle empty progress records', async () => {
      mockUserRepository.findById
        .mockResolvedValueOnce(mockTargetUser)
        .mockResolvedValueOnce(mockTargetUser);
      mockUserProgressRepository.findByUserId.mockResolvedValue([]);
      mockUserProgressRepository.getUserStats.mockResolvedValue({
        totalRecords: 0,
        lastActivity: null,
      });

      const result = await useCase.execute(targetUserId, targetUserId);

      expect(result.totalRecords).toBe(0);
      expect(result.lastActivity).toBeNull();
      expect(result.progress).toEqual([]);
    });
  });
});
