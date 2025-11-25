import { Injectable, Inject, Logger, UnauthorizedException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { LoginDto } from '../../dtos/auth/login.dto';
import { LoginResponseDto } from '../../dtos/auth/login-response.dto';
import { IUserRepository } from '../../interfaces/repositories/user-repository.interface';
import { IRefreshTokenRepository } from '../../interfaces/repositories/refresh-token-repository.interface';
import { IJwtService } from '../../interfaces/services/jwt-service.interface';
import { IHashService } from '../../interfaces/services/hash-service.interface';
import { RefreshToken } from '../../../domain/entities/refresh-token.entity';
import { ValidationException } from '../../../domain/errors/domain.errors';

@Injectable()
export class LoginUserUseCase {
  private readonly logger = new Logger(LoginUserUseCase.name);

  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    @Inject('IRefreshTokenRepository')
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    @Inject('IJwtService')
    private readonly jwtService: IJwtService,
    @Inject('IHashService')
    private readonly hashService: IHashService,
  ) {}

  async execute(
    loginDto: LoginDto,
    deviceInfo?: string,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<LoginResponseDto> {
    this.logger.log(`Login attempt for email: ${loginDto.email}`);

    try {
      await this.validateLoginData(loginDto);

      // Find user with password field included
      const user = await this.userRepository.findByEmailWithPassword(loginDto.email);
      if (!user) {
        this.logger.warn(`Login attempt with non-existent email: ${loginDto.email}`);
        throw new UnauthorizedException('Invalid credentials');
      }

      // Verify password
      const isPasswordValid = await this.hashService.compare(loginDto.password, user.password);
      if (!isPasswordValid) {
        this.logger.warn(`Invalid password attempt for user: ${user.id}`);
        throw new UnauthorizedException('Invalid credentials');
      }

      // Check if user account is active
      if (!user.isActive) {
        this.logger.warn(`Login attempt for inactive user: ${user.id}`);
        throw new UnauthorizedException('Account is deactivated');
      }

      // Check if user is using correct auth provider
      if (user.authProvider !== 'EMAIL_PASSWORD') {
        this.logger.warn(`Email/password login attempt for ${user.authProvider} user: ${user.id}`);
        throw new UnauthorizedException(`Please use ${user.authProvider} to login`);
      }

      // Generate access token only (no refresh token in response body)
      const accessToken = await this.jwtService.createAccessToken(user.id, user.role, user.email);
      const expiresIn = this.jwtService.getAccessTokenExpirationTime();

      // Generate and store refresh token separately
      const refreshToken = await this.jwtService.createRefreshToken(user.id, user.role);
      await this.saveRefreshToken(user.id, refreshToken, deviceInfo, userAgent, ipAddress);

      // Update last login time
      await this.userRepository.update(user.id, {
        lastLoginAt: new Date(),
      });

      this.logger.log(`User logged in successfully: ${user.id}`);

      return new LoginResponseDto(
        user.id,
        user.email,
        user.person?.fullName || 'Unknown User',
        user.isEmailVerified,
        accessToken,
        expiresIn,
        'Login successful',
        refreshToken,
      );
    } catch (error: unknown) {
      this.logger.error(
        `Login failed for email: ${loginDto.email}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  private async validateLoginData(loginDto: LoginDto): Promise<void> {
    if (!loginDto.email || !loginDto.password) {
      throw new ValidationException('Email and password are required');
    }

    // Additional rate limiting checks could be implemented here
    // For now, we'll rely on controller-level rate limiting
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
