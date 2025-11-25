import { Injectable } from '@nestjs/common';
import {
  IRefreshTokenRotationService,
  TokenRotationResult,
  TokenValidationResult,
  TokenFamilyInfo,
  RotationContext,
} from '../interfaces/services/refresh-token-rotation-service.interface';
import { RefreshTokenRotationCoreService } from './refresh-token-rotation-core.service';
import { TokenSecurityService } from './token-security.service';
import { TokenRevocationService } from './token-revocation.service';
import { SessionManagementService } from './session-management.service';

@Injectable()
export class RefreshTokenRotationService implements IRefreshTokenRotationService {
  constructor(
    private readonly coreRotationService: RefreshTokenRotationCoreService,
    private readonly securityService: TokenSecurityService,
    private readonly revocationService: TokenRevocationService,
    private readonly sessionService: SessionManagementService,
  ) {}

  async rotateToken(oldTokenHash: string, context?: RotationContext): Promise<TokenRotationResult> {
    return this.coreRotationService.rotateToken(oldTokenHash, context);
  }

  async validateAndRotateToken(
    presentedToken: string,
    context?: RotationContext,
  ): Promise<TokenValidationResult & { rotation?: TokenRotationResult }> {
    return this.coreRotationService.validateAndRotateToken(presentedToken, context);
  }

  async detectTokenReuse(tokenHash: string): Promise<boolean> {
    return this.securityService.detectTokenReuse(tokenHash);
  }

  async revokeFamilyTokens(familyId: string, reason: string): Promise<number> {
    return this.revocationService.revokeFamilyTokens(familyId, reason);
  }

  async revokeUserTokens(userId: string, reason: string): Promise<number> {
    return this.revocationService.revokeUserTokens(userId, reason);
  }

  async createTokenFamily(
    userId: string,
    deviceInfo?: string,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<TokenFamilyInfo> {
    return this.revocationService.createTokenFamily(userId, deviceInfo, userAgent, ipAddress);
  }

  async getActiveFamilies(userId: string): Promise<TokenFamilyInfo[]> {
    return this.sessionService.getActiveFamilies(userId);
  }

  isTokenExpired(expiresAt: Date): boolean {
    return this.sessionService.isTokenExpired(expiresAt);
  }

  async cleanupExpiredTokens(): Promise<number> {
    return this.sessionService.cleanupExpiredTokens();
  }
}
