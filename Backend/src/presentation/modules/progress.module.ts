import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserProgress } from '../../domain/entities/user-progress.entity';
import { User } from '../../domain/entities/user.entity';
import { ChapterRepetition } from '../../domain/entities/chapter-repetition.entity';
import { ProgressController } from '../controllers/progress/progress.controller';
import { CreateProgressUseCase } from '../../application/use-cases/progress/create-progress.use-case';
import { GetUserProgressUseCase } from '../../application/use-cases/progress/get-user-progress.use-case';
import { UpdateProgressUseCase } from '../../application/use-cases/progress/update-progress.use-case';
import { RepeatChapterUseCase } from '../../application/use-cases/repetition/repeat-chapter.use-case';
import { GetRepetitionsUseCase } from '../../application/use-cases/repetition/get-repetitions.use-case';
import { UpdateRepetitionUseCase } from '../../application/use-cases/repetition/update-repetition.use-case';
import { UserProgressRepository } from '../../infrastructure/repositories/user-progress.repository';
import { UserRepository } from '../../infrastructure/repositories/user.repository';
import { ChapterRepetitionRepository } from '../../infrastructure/repositories/chapter-repetition.repository';

@Module({
  imports: [TypeOrmModule.forFeature([UserProgress, User, ChapterRepetition])],
  controllers: [ProgressController],
  providers: [
    // Progress Use Cases
    CreateProgressUseCase,
    GetUserProgressUseCase,
    UpdateProgressUseCase,

    // Repetition Use Cases
    RepeatChapterUseCase,
    GetRepetitionsUseCase,
    UpdateRepetitionUseCase,

    // Repositories
    UserProgressRepository,
    UserRepository,
    ChapterRepetitionRepository,

    // Interface bindings
    {
      provide: 'IUserProgressRepository',
      useClass: UserProgressRepository,
    },
    {
      provide: 'IUserRepository',
      useClass: UserRepository,
    },
    {
      provide: 'IChapterRepetitionRepository',
      useClass: ChapterRepetitionRepository,
    },
  ],
  exports: [
    // Progress Use Cases
    CreateProgressUseCase,
    GetUserProgressUseCase,
    UpdateProgressUseCase,
    UserProgressRepository,
    UserRepository,
    // Repetition Use Cases
    RepeatChapterUseCase,
    GetRepetitionsUseCase,
    UpdateRepetitionUseCase,

    'IUserProgressRepository',
    'IUserRepository',
    'IChapterRepetitionRepository',
  ],
})
export class ProgressModule {}
