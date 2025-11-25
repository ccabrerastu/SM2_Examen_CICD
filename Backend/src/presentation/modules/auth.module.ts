import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../../domain/entities/user.entity';
import { Person } from '../../domain/entities/person.entity';
import { RefreshToken } from '../../domain/entities/refresh-token.entity';
// Split controllers for better organization
import { UserAuthController } from '../controllers/auth/user-auth.controller';
import { EmailPasswordController } from '../controllers/auth/email-password.controller';
import { SessionManagementController } from '../controllers/auth/session-management.controller';
import { RegisterUserUseCase } from '../../application/use-cases/auth/register-user.use-case';
import { LoginUserUseCase } from '../../application/use-cases/auth/login-user.use-case';
import { RefreshTokenUseCase } from '../../application/use-cases/auth/refresh-token.use-case';
import { LogoutUserUseCase } from '../../application/use-cases/auth/logout-user.use-case';
import { VerifyEmailUseCase } from '../../application/use-cases/auth/verify-email.use-case';
import { ForgotPasswordUseCase } from '../../application/use-cases/auth/forgot-password.use-case';
import { ResetPasswordUseCase } from '../../application/use-cases/auth/reset-password.use-case';
import { GetActiveSessionsUseCase } from '../../application/use-cases/auth/get-active-sessions.use-case';
import { UserRepository } from '../../infrastructure/repositories/user.repository';
import { PersonRepository } from '../../infrastructure/repositories/person.repository';
import { RefreshTokenRepository } from '../../infrastructure/repositories/refresh-token.repository';
import { HashingService } from '../../shared/services/hashing.service';
import { HashUtilityService } from '../../shared/services/hash-utility.service';
import { TokenGenerationService } from '../../shared/services/token-generation.service';
import { JwtService } from '../../shared/services/jwt.service';
import { RefreshTokenRotationService } from '../../application/implementations/refresh-token-rotation.service';
import { RefreshTokenRotationCoreService } from '../../application/implementations/refresh-token-rotation-core.service';
import { TokenSecurityService } from '../../application/implementations/token-security.service';
import { TokenRevocationService } from '../../application/implementations/token-revocation.service';
import { SessionManagementService } from '../../application/implementations/session-management.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, Person, RefreshToken])],
  controllers: [UserAuthController, EmailPasswordController, SessionManagementController],
  providers: [
    RegisterUserUseCase,
    LoginUserUseCase,
    RefreshTokenUseCase,
    LogoutUserUseCase,
    VerifyEmailUseCase,
    ForgotPasswordUseCase,
    ResetPasswordUseCase,
    GetActiveSessionsUseCase,
    UserRepository,
    PersonRepository,
    RefreshTokenRepository,
    HashingService,
    HashUtilityService,
    TokenGenerationService,
    JwtService,
    RefreshTokenRotationService,
    RefreshTokenRotationCoreService,
    TokenSecurityService,
    TokenRevocationService,
    SessionManagementService,
    {
      provide: 'IUserRepository',
      useClass: UserRepository,
    },
    {
      provide: 'IPersonRepository',
      useClass: PersonRepository,
    },
    {
      provide: 'IRefreshTokenRepository',
      useClass: RefreshTokenRepository,
    },
    {
      provide: 'IHashService',
      useClass: HashingService,
    },
    {
      provide: 'IHashUtilityService',
      useClass: HashUtilityService,
    },
    {
      provide: 'ITokenGenerationService',
      useClass: TokenGenerationService,
    },
    {
      provide: 'IJwtService',
      useClass: JwtService,
    },
    {
      provide: 'IRefreshTokenRotationService',
      useClass: RefreshTokenRotationService,
    },
  ],
  exports: [
    RegisterUserUseCase,
    LoginUserUseCase,
    RefreshTokenUseCase,
    LogoutUserUseCase,
    VerifyEmailUseCase,
    ForgotPasswordUseCase,
    ResetPasswordUseCase,
    GetActiveSessionsUseCase,
    'IUserRepository',
    'IPersonRepository',
    'IRefreshTokenRepository',
    'IHashService',
    'IHashUtilityService',
    'ITokenGenerationService',
    'IJwtService',
    'IRefreshTokenRotationService',
  ],
})
export class AuthModule {}
