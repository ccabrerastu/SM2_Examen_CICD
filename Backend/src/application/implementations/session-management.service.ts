import { Injectable, Logger, Inject } from '@nestjs/common';
import { IRefreshTokenRepository } from '../interfaces/repositories/refresh-token-repository.interface';
import { TokenFamilyInfo } from '../interfaces/services/refresh-token-rotation-service.interface';

@Injectable()
export class SessionManagementService {
  private readonly logger = new Logger(SessionManagementService.name);

  constructor(
    @Inject('IRefreshTokenRepository')
    private readonly refreshTokenRepository: IRefreshTokenRepository,
  ) {}

  async getActiveFamilies(userId: string): Promise<TokenFamilyInfo[]> {
    try {
      const activeTokens = await this.refreshTokenRepository.findValidByUserId(userId);

      // Group tokens by family and get unique families
      const familyMap = new Map<string, TokenFamilyInfo>();

      activeTokens.forEach(token => {
        if (!familyMap.has(token.familyId)) {
          familyMap.set(token.familyId, {
            familyId: token.familyId,
            userId: token.userId,
            deviceInfo: token.deviceInfo || null,
            userAgent: token.userAgent || null,
            ipHash: token.ipHash || null,
            createdAt: token.createdAt,
            lastUsedAt: token.updatedAt,
          });
        }
      });

      return Array.from(familyMap.values());
    } catch (error: unknown) {
      this.logger.error(
        `Failed to get active families: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      );
      return [];
    }
  }

  isTokenExpired(expiresAt: Date): boolean {
    return new Date() > expiresAt;
  }

  async cleanupExpiredTokens(): Promise<number> {
    this.logger.debug('Starting cleanup of expired tokens');

    try {
      await this.refreshTokenRepository.revokeExpiredTokens();
      this.logger.log('Expired tokens cleanup completed');
      return 0; // Repository method doesn't return count, but operation completed
    } catch (error: unknown) {
      this.logger.error(
        `Failed to cleanup expired tokens: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      );
      return 0;
    }
  }
}
