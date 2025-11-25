import { Injectable, Inject, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { RegisterDto } from '../../dtos/auth/register.dto';
import { RegisterResponseDto } from '../../dtos/auth/register-response.dto';
import { IPersonRepository } from '../../interfaces/repositories/person-repository.interface';
import { IUserRepository } from '../../interfaces/repositories/user-repository.interface';
import { IRefreshTokenRepository } from '../../interfaces/repositories/refresh-token-repository.interface';
import { IJwtService } from '../../interfaces/services/jwt-service.interface';
import { IHashService } from '../../interfaces/services/hash-service.interface';
import { ITokenGenerationService } from '../../interfaces/services/token-generation-service.interface';
import { Person } from '../../../domain/entities/person.entity';
import { User } from '../../../domain/entities/user.entity';
import { RefreshToken } from '../../../domain/entities/refresh-token.entity';
import { ConflictException, ValidationException } from '../../../domain/errors/domain.errors';

@Injectable()
export class RegisterUserUseCase {
  private readonly logger = new Logger(RegisterUserUseCase.name);

  constructor(
    @Inject('IPersonRepository')
    private readonly personRepository: IPersonRepository,
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('IRefreshTokenRepository')
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    @Inject('IJwtService')
    private readonly jwtService: IJwtService,
    @Inject('IHashService')
    private readonly hashService: IHashService,
    @Inject('ITokenGenerationService')
    private readonly tokenGenerationService: ITokenGenerationService,
  ) {}

  async execute(
    registerDto: RegisterDto,
    deviceInfo?: string,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<RegisterResponseDto> {
    this.logger.log(`Registration attempt for email: ${registerDto.email}`);

    try {
      await this.validateRegistrationData(registerDto);

      // Enhanced password hashing with proper cost factor
      const hashedPassword = await this.hashService.hash(registerDto.password);

      const person = await this.createPerson(registerDto);
      const user = await this.createUser(registerDto, hashedPassword, person.id);

      // Generate email verification token
      await this.generateEmailVerificationToken(user.id);

      // Generate access token only (no refresh token in response body)
      const accessToken = await this.jwtService.createAccessToken(user.id, user.role, user.email);
      const expiresIn = this.jwtService.getAccessTokenExpirationTime();

      // Generate and store refresh token separately
      const refreshToken = await this.jwtService.createRefreshToken(user.id, user.role);
      await this.saveRefreshToken(user.id, refreshToken, deviceInfo, userAgent, ipAddress);

      this.logger.log(`User registered successfully: ${user.id}`);

      // TODO: Send email verification email with emailVerificationToken
      // await this.emailService.sendVerificationEmail(user.email, emailVerificationToken);

      return new RegisterResponseDto(
        user.id,
        user.email,
        person.fullName,
        user.isEmailVerified,
        accessToken,
        expiresIn,
        'Registration successful. Please check your email to verify your account.',
      );
    } catch (error: unknown) {
      this.logger.error(
        `Registration failed for email: ${registerDto.email}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  private async validateRegistrationData(registerDto: RegisterDto): Promise<void> {
    if (registerDto.password !== registerDto.confirmPassword) {
      this.logger.warn(`Password mismatch during registration for email: ${registerDto.email}`);
      throw new ValidationException('Passwords do not match');
    }

    // Additional password strength validation could be added here
    if (registerDto.password.length < 12) {
      this.logger.warn(`Weak password attempt for email: ${registerDto.email}`);
      throw new ValidationException('Password must be at least 12 characters long');
    }

    const existingUserByEmail = await this.userRepository.findByEmail(registerDto.email);
    if (existingUserByEmail) {
      this.logger.warn(`Registration attempt with existing email: ${registerDto.email}`);
      throw new ConflictException('Email already exists');
    }
  }

  private async createPerson(registerDto: RegisterDto): Promise<Person> {
    const createPersonDto = {
      fullName: registerDto.fullName.trim(),
    };

    return await this.personRepository.create(createPersonDto);
  }

  private async createUser(
    registerDto: RegisterDto,
    hashedPassword: string,
    personId: string,
  ): Promise<User> {
    const createUserDto = {
      username: registerDto.email.split('@')[0], // Generate username from email
      email: registerDto.email.toLowerCase().trim(),
      password: hashedPassword,
      authProvider: 'EMAIL_PASSWORD' as const,
      role: 'STUDENT' as const,
      personId: personId,
      person: {
        fullName: registerDto.fullName,
      },
    };

    return await this.userRepository.create(createUserDto);
  }

  private async generateEmailVerificationToken(userId: string): Promise<string> {
    const { token } = this.tokenGenerationService.generateEmailVerificationToken(24); // 24 hours expiration

    // Store token in user entity
    await this.userRepository.update(userId, {
      emailVerificationToken: token,
    });

    return token;
  }

  private async saveRefreshToken(
    userId: string,
    token: string,
    deviceInfo?: string,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<void> {
    const refreshToken = new RefreshToken();
    refreshToken.tokenHash = await this.hashService.hash(token);
    refreshToken.userId = userId;
    refreshToken.familyId = uuidv4(); // Generate new family ID for this session/device
    refreshToken.jti = uuidv4(); // Generate unique JTI
    refreshToken.deviceInfo = deviceInfo || null;
    refreshToken.ipHash = ipAddress ? await this.hashService.hash(ipAddress) : null;
    refreshToken.userAgent = userAgent || null;
    refreshToken.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    refreshToken.revokedAt = null;
    refreshToken.reason = null;
    refreshToken.replacedBy = null;

    await this.refreshTokenRepository.save(refreshToken);
    this.logger.debug(`Refresh token saved for user: ${userId}`);
  }
}
