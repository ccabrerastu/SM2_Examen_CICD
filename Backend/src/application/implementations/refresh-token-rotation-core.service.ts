import { Injectable, Logger, Inject } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { RefreshToken } from '../../domain/entities/refresh-token.entity';
import { IRefreshTokenRepository } from '../interfaces/repositories/refresh-token-repository.interface';
import { IHashUtilityService } from '../interfaces/services/hash-utility-service.interface';
import { ITokenGenerationService } from '../interfaces/services/token-generation-service.interface';
import {
  TokenRotationResult,
  TokenValidationResult,
  RotationContext,
} from '../interfaces/services/refresh-token-rotation-service.interface';
import { TokenSecurityService } from './token-security.service';
import { TokenRevocationService } from './token-revocation.service';
import {
  TokenRotationException,
  InvalidTokenException,
  TokenRotationFailedException,
} from '../../shared/exceptions/token-rotation.exceptions';

@Injectable()
export class RefreshTokenRotationCoreService {
  private readonly logger = new Logger(RefreshTokenRotationCoreService.name);

  constructor(
    @Inject('IRefreshTokenRepository')
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    @Inject('IHashUtilityService')
    private readonly hashUtilityService: IHashUtilityService,
    @Inject('ITokenGenerationService')
    private readonly tokenGenerationService: ITokenGenerationService,
    private readonly dataSource: DataSource,
    private readonly tokenSecurityService: TokenSecurityService,
    private readonly tokenRevocationService: TokenRevocationService,
  ) {}

  async rotateToken(oldTokenHash: string, context?: RotationContext): Promise<TokenRotationResult> {
    const startTime = Date.now();
    this.logger.debug(`Starting token rotation for hash: ${oldTokenHash.substring(0, 10)}...`);

    return await this.dataSource.transaction(async _transactionalEntityManager => {
      try {
        // Find the existing token
        const existingToken = await this.refreshTokenRepository.findByTokenHash(oldTokenHash);
        if (!existingToken) {
          this.logger.warn(`Token not found for rotation: ${oldTokenHash.substring(0, 10)}...`);
          throw new InvalidTokenException('Token not found');
        }

        // Check if token is already revoked
        if (existingToken.isRevoked()) {
          this.logger.warn(
            `Attempted rotation of revoked token: ${oldTokenHash.substring(0, 10)}...`,
          );
          throw new InvalidTokenException('Token is revoked');
        }

        // Check if token is expired
        if (existingToken.isExpired()) {
          this.logger.warn(
            `Attempted rotation of expired token: ${oldTokenHash.substring(0, 10)}...`,
          );
          throw new InvalidTokenException('Token is expired');
        }

        // Generate new token
        const newTokenValue = this.tokenGenerationService.generateOpaqueRefreshToken();
        const newTokenHash = this.hashUtilityService.hashRefreshToken(newTokenValue);

        // Create new token entity
        const newToken = new RefreshToken();
        newToken.tokenHash = newTokenHash;
        newToken.userId = existingToken.userId;
        newToken.familyId = existingToken.familyId; // Same family
        newToken.jti = uuidv4(); // New unique JTI
        newToken.deviceInfo = existingToken.deviceInfo;
        newToken.userAgent = existingToken.userAgent;
        newToken.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
        newToken.revokedAt = null;
        newToken.reason = null;
        newToken.replacedBy = null;

        // Update device info and IP if provided in context
        if (context?.deviceInfo) {
          newToken.deviceInfo = context.deviceInfo;
        }
        if (context?.ipAddress) {
          newToken.ipHash = this.hashUtilityService.hashIPAddress(context.ipAddress).hash;
        }
        if (context?.userAgent) {
          newToken.userAgent = context.userAgent;
        }

        // Save new token first
        await this.refreshTokenRepository.save(newToken);

        // Mark old token as replaced (revoked)
        existingToken.revokedAt = new Date();
        existingToken.reason = context?.reason || 'ROTATED';
        existingToken.replacedBy = newToken.tokenHash;
        await this.refreshTokenRepository.save(existingToken);

        const duration = Date.now() - startTime;
        this.logger.debug(`Token rotation completed in ${duration}ms`);

        return {
          oldToken: {
            jti: existingToken.jti,
            familyId: existingToken.familyId,
            revoked: true,
          },
          newToken: {
            jti: newToken.jti,
            tokenHash: newTokenHash,
            expiresAt: newToken.expiresAt,
            familyId: newToken.familyId,
          },
        };
      } catch (error: unknown) {
        this.logger.error(
          `Token rotation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          error instanceof Error ? error.stack : undefined,
        );
        if (error instanceof TokenRotationException) {
          throw error;
        }
        throw new TokenRotationFailedException(
          `Token rotation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        );
      }
    });
  }

  async validateAndRotateToken(
    presentedToken: string,
    context?: RotationContext,
  ): Promise<TokenValidationResult & { rotation?: TokenRotationResult }> {
    this.logger.debug('Validating and rotating token');

    try {
      // Hash the presented token
      const tokenHash = this.hashUtilityService.hashRefreshToken(presentedToken);

      // Check for token reuse first
      const reuseDetected = await this.tokenSecurityService.detectTokenReuse(tokenHash);
      if (reuseDetected) {
        return {
          isValid: false,
          reason: 'TOKEN_REUSE_DETECTED',
          shouldRevokeFamily: true,
        };
      }

      // Check if token exists and is valid
      const token = await this.refreshTokenRepository.findByTokenHash(tokenHash);
      if (!token) {
        this.logger.warn(`Token validation failed: token not found`);
        throw new InvalidTokenException('Token not found');
      }

      if (token.isRevoked()) {
        this.logger.warn(`Token validation failed: token is revoked (Family: ${token.familyId})`);

        // This might indicate token reuse - handle it
        await this.tokenRevocationService.handleTokenReuse(
          token.familyId,
          tokenHash,
          'VALIDATION_OF_REVOKED_TOKEN',
        );

        return {
          isValid: false,
          reason: 'TOKEN_REVOKED',
          shouldRevokeFamily: true,
        };
      }

      if (token.isExpired()) {
        this.logger.warn(`Token validation failed: token is expired`);
        return {
          isValid: false,
          reason: 'TOKEN_EXPIRED',
          shouldRevokeFamily: false,
        };
      }

      // Apply rate limiting
      await this.tokenSecurityService.checkRateLimit(token.familyId, 'rotation');

      // Token is valid - perform rotation
      const rotation = await this.rotateToken(tokenHash, context);

      this.logger.debug(`Token validated and rotated successfully for family: ${token.familyId}`);

      return {
        isValid: true,
        token: {
          sub: token.userId,
          iss: 'english-app-backend',
          aud: 'english-app-client',
          jti: token.jti,
          iat: Math.floor(token.createdAt.getTime() / 1000),
          exp: Math.floor(token.expiresAt.getTime() / 1000),
          type: 'refresh' as const,
          role: '', // This will be populated from user data if needed
        },
        reason: 'VALID_AND_ROTATED',
        shouldRevokeFamily: false,
        rotation,
      };
    } catch (error: unknown) {
      this.logger.error(
        `Token validation and rotation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      );
      if (error instanceof TokenRotationException) {
        throw error;
      }
      throw new TokenRotationFailedException(
        `Token validation and rotation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
}
