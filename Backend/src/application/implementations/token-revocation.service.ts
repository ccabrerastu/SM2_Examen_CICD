import { Injectable, Logger, Inject } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { RefreshToken } from '../../domain/entities/refresh-token.entity';
import { IRefreshTokenRepository } from '../interfaces/repositories/refresh-token-repository.interface';
import { IHashUtilityService } from '../interfaces/services/hash-utility-service.interface';
import { ITokenGenerationService } from '../interfaces/services/token-generation-service.interface';
import { TokenSecurityService } from './token-security.service';
import { TokenFamilyInfo } from '../interfaces/services/refresh-token-rotation-service.interface';
import {
  TokenRotationException,
  TokenRotationFailedException,
  TokenFamilyLimitExceededException,
} from '../../shared/exceptions/token-rotation.exceptions';

@Injectable()
export class TokenRevocationService {
  private readonly logger = new Logger(TokenRevocationService.name);
  private readonly MAX_FAMILIES_PER_USER = 10;

  constructor(
    @Inject('IRefreshTokenRepository')
    private readonly refreshTokenRepository: IRefreshTokenRepository,
    @Inject('IHashUtilityService')
    private readonly hashUtilityService: IHashUtilityService,
    @Inject('ITokenGenerationService')
    private readonly tokenGenerationService: ITokenGenerationService,
    private readonly tokenSecurityService: TokenSecurityService,
  ) {}

  async revokeFamilyTokens(familyId: string, reason: string): Promise<number> {
    this.logger.warn(`Revoking all tokens in family: ${familyId}, reason: ${reason}`);

    try {
      // Get all tokens in the family before revoking
      const familyTokens = await this.refreshTokenRepository.findByFamilyId(familyId);
      const activeTokensCount = familyTokens.filter(token => !token.isRevoked()).length;

      // Revoke all tokens in the family
      await this.refreshTokenRepository.revokeByFamilyId(familyId, reason);

      // Log security event
      if (activeTokensCount > 0) {
        const firstToken = familyTokens[0];
        this.tokenSecurityService.logSecurityEvent('FAMILY_TOKENS_REVOKED', {
          familyId: familyId,
          reason: reason,
          revokedCount: activeTokensCount,
          userId: firstToken?.userId,
          deviceInfo: firstToken?.deviceInfo || 'Unknown',
        });
      }

      this.logger.log(`Successfully revoked ${activeTokensCount} tokens in family: ${familyId}`);
      return activeTokensCount;
    } catch (error: unknown) {
      this.logger.error(
        `Failed to revoke family tokens: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new TokenRotationFailedException(
        `Failed to revoke family tokens: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async revokeUserTokens(userId: string, reason: string): Promise<number> {
    this.logger.warn(`Revoking all tokens for user: ${userId}, reason: ${reason}`);

    try {
      // Get all active tokens before revoking
      const activeTokens = await this.refreshTokenRepository.findValidByUserId(userId);
      const activeCount = activeTokens.length;

      // Revoke all user tokens
      await this.refreshTokenRepository.revokeByUserId(userId, reason);

      // Log security event
      if (activeCount > 0) {
        this.tokenSecurityService.logSecurityEvent('USER_TOKENS_REVOKED', {
          userId: userId,
          reason: reason,
          revokedCount: activeCount,
        });
      }

      this.logger.log(`Successfully revoked ${activeCount} tokens for user: ${userId}`);
      return activeCount;
    } catch (error: unknown) {
      this.logger.error(
        `Failed to revoke user tokens: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new TokenRotationFailedException(
        `Failed to revoke user tokens: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async createTokenFamily(
    userId: string,
    deviceInfo?: string,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<TokenFamilyInfo> {
    try {
      // Check family limit
      const existingFamilies = await this.refreshTokenRepository.findValidByUserId(userId);
      const uniqueFamilyIds = new Set(existingFamilies.map(token => token.familyId));

      if (uniqueFamilyIds.size >= this.MAX_FAMILIES_PER_USER) {
        this.logger.warn(
          `Family limit exceeded for user ${userId}: ${uniqueFamilyIds.size}/${this.MAX_FAMILIES_PER_USER}`,
        );
        throw new TokenFamilyLimitExceededException(
          userId,
          uniqueFamilyIds.size,
          this.MAX_FAMILIES_PER_USER,
        );
      }

      // Generate new family ID and token
      const familyId = uuidv4();
      const tokenValue = this.tokenGenerationService.generateOpaqueRefreshToken();

      // Create the token
      const tokenEntity = new RefreshToken();
      tokenEntity.tokenHash = this.hashUtilityService.hashRefreshToken(tokenValue);
      tokenEntity.userId = userId;
      tokenEntity.familyId = familyId;
      tokenEntity.jti = uuidv4();
      tokenEntity.deviceInfo = deviceInfo || null;
      if (ipAddress) {
        tokenEntity.ipHash = this.hashUtilityService.hashIPAddress(ipAddress).hash;
      }
      tokenEntity.userAgent = userAgent || null;
      tokenEntity.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
      tokenEntity.revokedAt = null;
      tokenEntity.reason = null;
      tokenEntity.replacedBy = null;

      // Save the token
      await this.refreshTokenRepository.save(tokenEntity);

      this.logger.debug(`Created token family: ${familyId} for user: ${userId}`);

      return {
        familyId: familyId,
        userId: userId,
        deviceInfo: deviceInfo || null,
        userAgent: userAgent || null,
        ipHash: tokenEntity.ipHash,
        createdAt: tokenEntity.createdAt,
        lastUsedAt: tokenEntity.updatedAt,
      };
    } catch (error: unknown) {
      this.logger.error(
        `Failed to create token family: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      );
      if (error instanceof TokenRotationException) {
        throw error;
      }
      throw new TokenRotationFailedException(
        `Failed to create token family: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async handleTokenReuse(familyId: string, tokenHash: string, context: string): Promise<void> {
    this.logger.error(`Handling token reuse - Family: ${familyId}, Context: ${context}`);

    try {
      // Revoke all tokens in the compromised family
      const revokedCount = await this.revokeFamilyTokens(familyId, `REUSE_DETECTED_${context}`);

      // Log critical security event
      this.tokenSecurityService.logSecurityEvent('CRITICAL_TOKEN_REUSE', {
        familyId: familyId,
        tokenHash: tokenHash.substring(0, 16) + '...',
        context: context,
        revokedTokens: revokedCount,
        timestamp: new Date().toISOString(),
      });
    } catch (error: unknown) {
      this.logger.error(
        `Failed to handle token reuse: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      );
    }
  }
}
