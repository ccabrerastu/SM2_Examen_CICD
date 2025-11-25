import { Injectable, Logger, Inject } from '@nestjs/common';
import { IRefreshTokenRotationService } from '../../interfaces/services/refresh-token-rotation-service.interface';
import { IJwtService } from '../../interfaces/services/jwt-service.interface';
import { IUserRepository } from '../../interfaces/repositories/user-repository.interface';
import { RefreshResponseDto } from '../../dtos/auth/refresh-response.dto';
import {
  TokenReuseDetectedException,
  TokenFamilyCompromisedException,
  InvalidTokenException,
} from '../../../shared/exceptions/token-rotation.exceptions';

export interface RefreshTokenRequest {
  refreshToken: string;
  deviceInfo?: string | undefined;
  userAgent?: string | undefined;
  ipAddress?: string | undefined;
}

export interface RefreshTokenResponse {
  accessToken: string;
  expiresIn: number;
  tokenType: string;
}

export interface RefreshTokenResult {
  response: RefreshTokenResponse;
  newRefreshToken: string;
}

@Injectable()
export class RefreshTokenUseCase {
  private readonly logger = new Logger(RefreshTokenUseCase.name);

  constructor(
    @Inject('IRefreshTokenRotationService')
    private readonly refreshTokenRotationService: IRefreshTokenRotationService,
    @Inject('IJwtService')
    private readonly jwtService: IJwtService,
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(request: RefreshTokenRequest): Promise<RefreshResponseDto> {
    const { refreshToken, deviceInfo, userAgent, ipAddress } = request;

    this.logger.debug(`Processing refresh token request for device: ${deviceInfo}`);

    try {
      // Validate and rotate the refresh token
      const validationResult = await this.refreshTokenRotationService.validateAndRotateToken(
        refreshToken,
        {
          deviceInfo: deviceInfo || undefined,
          userAgent: userAgent || undefined,
          ipAddress: ipAddress || undefined,
          reason: 'TOKEN_REFRESH',
        },
      );

      // Handle validation failures
      if (!validationResult.isValid) {
        if (validationResult.shouldRevokeFamily) {
          this.logger.error(`Token family compromised during refresh: ${validationResult.reason}`);
          throw new TokenFamilyCompromisedException(
            '',
            '',
            'Token family has been revoked due to security violation',
          );
        }

        this.logger.warn(`Token validation failed: ${validationResult.reason}`);
        throw new InvalidTokenException(`Token validation failed: ${validationResult.reason}`);
      }

      // Ensure rotation was successful
      if (!validationResult.rotation) {
        this.logger.error('Token validation succeeded but rotation failed');
        throw new InvalidTokenException('Failed to rotate token');
      }

      // Get user information for the new access token
      if (!validationResult.token) {
        this.logger.error('Token validation succeeded but token payload is missing');
        throw new InvalidTokenException('Token payload missing');
      }

      const user = await this.userRepository.findById(validationResult.token.sub);
      if (!user) {
        this.logger.error(`User not found for token rotation: ${validationResult.token.sub}`);
        throw new InvalidTokenException('User not found');
      }

      // Generate new access token
      const accessToken = await this.jwtService.createAccessToken(user.id, user.role, user.email);

      // Get access token expiration time
      const expiresIn = this.jwtService.getAccessTokenExpirationTime();

      this.logger.log(`Successfully refreshed tokens for user: ${user.id}`);

      // Return DTO with new refresh token for cookie setting
      return new RefreshResponseDto(
        user.id,
        accessToken,
        expiresIn,
        'Token refreshed successfully',
        validationResult.rotation.newToken.tokenHash,
      );
    } catch (error: unknown) {
      if (error instanceof TokenReuseDetectedException) {
        this.logger.error(`Token reuse detected for family: ${error.familyId}`);

        // Revoke the entire family
        await this.refreshTokenRotationService.revokeFamilyTokens(
          error.familyId,
          'TOKEN_REUSE_DETECTED',
        );

        throw new TokenFamilyCompromisedException(
          error.familyId,
          '',
          'Token reuse detected - all tokens in family have been revoked',
        );
      }

      this.logger.error(
        `Token refresh failed: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  /**
   * Revoke all tokens for a user (e.g., during logout from all devices)
   */
  async revokeAllUserTokens(
    userId: string,
    reason: string = 'USER_INITIATED_LOGOUT',
  ): Promise<number> {
    this.logger.log(`Revoking all tokens for user: ${userId}`);

    try {
      const revokedCount = await this.refreshTokenRotationService.revokeUserTokens(userId, reason);
      this.logger.log(`Successfully revoked ${revokedCount} tokens for user: ${userId}`);
      return revokedCount;
    } catch (error: unknown) {
      this.logger.error(
        `Failed to revoke user tokens: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  /**
   * Revoke a specific token family (e.g., during logout from specific device)
   */
  async revokeTokenFamily(familyId: string, reason: string = 'DEVICE_LOGOUT'): Promise<number> {
    this.logger.log(`Revoking token family: ${familyId}`);

    try {
      const revokedCount = await this.refreshTokenRotationService.revokeFamilyTokens(
        familyId,
        reason,
      );
      this.logger.log(`Successfully revoked ${revokedCount} tokens in family: ${familyId}`);
      return revokedCount;
    } catch (error: unknown) {
      this.logger.error(
        `Failed to revoke token family: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  /**
   * Get active token families for a user (for device management)
   */
  async getUserActiveSessions(userId: string) {
    this.logger.debug(`Getting active sessions for user: ${userId}`);

    try {
      const activeFamilies = await this.refreshTokenRotationService.getActiveFamilies(userId);
      this.logger.debug(`Found ${activeFamilies.length} active sessions for user: ${userId}`);

      return activeFamilies.map(family => ({
        familyId: family.familyId,
        deviceInfo: family.deviceInfo,
        userAgent: family.userAgent,
        // Don't expose IP hash for security
      }));
    } catch (error: unknown) {
      this.logger.error(
        `Failed to get user active sessions: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  /**
   * Clean up expired tokens (background task)
   */
  async cleanupExpiredTokens(): Promise<number> {
    this.logger.debug('Starting cleanup of expired tokens');

    try {
      const cleanedCount = await this.refreshTokenRotationService.cleanupExpiredTokens();
      if (cleanedCount > 0) {
        this.logger.log(`Cleaned up ${cleanedCount} expired tokens`);
      }
      return cleanedCount;
    } catch (error: unknown) {
      this.logger.error(
        `Failed to cleanup expired tokens: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      return 0;
    }
  }

  /**
   * Generate initial tokens for login
   * Creates a new refresh token for the user after login
   */
  async generateInitialTokens(
    userId: string,
    deviceInfo?: string,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<{ refreshToken: string; familyId: string }> {
    this.logger.debug(`Generating initial tokens for user: ${userId}`);

    try {
      // Create initial refresh token for this login session
      const familyInfo = await this.refreshTokenRotationService.createTokenFamily(
        userId,
        deviceInfo,
        userAgent,
        ipAddress,
      );

      // For now, return placeholder values - this should be handled by the login flow
      const tokenResult = {
        tokenHash: 'placeholder', // This should be generated by the calling use case
        familyId: familyInfo.familyId,
      };

      this.logger.debug(`Initial tokens created for user: ${userId}`);

      return {
        refreshToken: tokenResult.tokenHash,
        familyId: tokenResult.familyId,
      };
    } catch (error: unknown) {
      this.logger.error(
        `Failed to generate initial tokens for user ${userId}: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  /**
   * Validate a refresh token without rotating it
   * Used for checking current session information
   */
  async validateToken(refreshToken: string): Promise<{
    isValid: boolean;
    token?: import('../../../shared/services/jwt.service').JwtPayload;
  }> {
    this.logger.debug('Validating refresh token');

    try {
      const validationResult =
        await this.refreshTokenRotationService.validateAndRotateToken(refreshToken);

      const result: {
        isValid: boolean;
        token?: import('../../../shared/services/jwt.service').JwtPayload;
      } = {
        isValid: validationResult.isValid,
      };

      if (validationResult.token) {
        result.token = validationResult.token;
      }

      return result;
    } catch (error: unknown) {
      this.logger.debug(
        `Token validation failed: ${error instanceof Error ? error.message : String(error)}`,
      );
      return { isValid: false };
    }
  }
}
