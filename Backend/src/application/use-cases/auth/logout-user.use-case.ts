import { Injectable, Inject, Logger } from '@nestjs/common';
import { IRefreshTokenRotationService } from '../../interfaces/services/refresh-token-rotation-service.interface';

export interface LogoutRequest {
  refreshToken?: string;
  familyId?: string;
}

export interface LogoutFromDeviceRequest extends LogoutRequest {
  deviceInfo?: string | undefined;
  userAgent?: string | undefined;
  ipAddress?: string | undefined;
}

export interface LogoutResponse {
  success: boolean;
  message: string;
  revokedTokensCount: number;
}

@Injectable()
export class LogoutUserUseCase {
  private readonly logger = new Logger(LogoutUserUseCase.name);

  constructor(
    @Inject('IRefreshTokenRotationService')
    private readonly refreshTokenRotationService: IRefreshTokenRotationService,
  ) {}

  /**
   * Logout from current device (revoke specific token family)
   */
  async logoutFromDevice(request: LogoutFromDeviceRequest): Promise<LogoutResponse> {
    const { refreshToken, familyId, deviceInfo } = request;

    this.logger.log(`Processing logout from device: ${deviceInfo || 'Unknown'}`);

    try {
      let revokedCount = 0;
      let targetFamilyId = familyId;

      // If we have a refresh token, extract the family ID from it first
      if (refreshToken && !targetFamilyId) {
        try {
          const validationResult =
            await this.refreshTokenRotationService.validateAndRotateToken(refreshToken);
          if (validationResult.isValid && validationResult.rotation) {
            targetFamilyId = validationResult.rotation.oldToken.familyId;
          }
        } catch (error: unknown) {
          this.logger.warn(
            `Could not validate refresh token during logout: ${error instanceof Error ? error.message : String(error)}`,
          );
          // Continue with logout even if token is invalid
        }
      }

      if (targetFamilyId) {
        revokedCount = await this.refreshTokenRotationService.revokeFamilyTokens(
          targetFamilyId,
          'USER_INITIATED_LOGOUT',
        );
        this.logger.log(`Revoked ${revokedCount} tokens from family: ${targetFamilyId}`);
      } else {
        this.logger.warn('No family ID available for device logout');
      }

      return {
        success: true,
        message: 'Logout successful',
        revokedTokensCount: revokedCount,
      };
    } catch (error: unknown) {
      this.logger.error(
        `Device logout failed: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  /**
   * Logout from all devices (revoke all user tokens)
   */
  async logoutFromAllDevices(userId: string): Promise<LogoutResponse> {
    this.logger.log(`Processing logout from all devices for user: ${userId}`);

    try {
      const revokedCount = await this.refreshTokenRotationService.revokeUserTokens(
        userId,
        'USER_INITIATED_LOGOUT_ALL',
      );

      this.logger.log(`Revoked ${revokedCount} tokens for user: ${userId}`);

      return {
        success: true,
        message: 'Logged out from all devices successfully',
        revokedTokensCount: revokedCount,
      };
    } catch (error: unknown) {
      this.logger.error(
        `Logout from all devices failed for user ${userId}: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  /**
   * Emergency logout - revoke all tokens for a user (admin action)
   */
  async emergencyLogout(
    userId: string,
    reason: string = 'ADMIN_INITIATED_LOGOUT',
  ): Promise<LogoutResponse> {
    this.logger.log(`Processing emergency logout for user: ${userId}, reason: ${reason}`);

    try {
      const revokedCount = await this.refreshTokenRotationService.revokeUserTokens(userId, reason);

      this.logger.log(`Emergency logout: Revoked ${revokedCount} tokens for user: ${userId}`);

      return {
        success: true,
        message: 'Emergency logout completed',
        revokedTokensCount: revokedCount,
      };
    } catch (error: unknown) {
      this.logger.error(
        `Emergency logout failed for user ${userId}: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  /**
   * Revoke specific token family (for device management)
   */
  async revokeTokenFamily(
    familyId: string,
    reason: string = 'DEVICE_REMOVED',
  ): Promise<LogoutResponse> {
    this.logger.log(`Revoking token family: ${familyId}, reason: ${reason}`);

    try {
      const revokedCount = await this.refreshTokenRotationService.revokeFamilyTokens(
        familyId,
        reason,
      );

      this.logger.log(`Revoked ${revokedCount} tokens from family: ${familyId}`);

      return {
        success: true,
        message: 'Token family revoked successfully',
        revokedTokensCount: revokedCount,
      };
    } catch (error: unknown) {
      this.logger.error(
        `Token family revocation failed: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  /**
   * Revoke session by family ID for a specific user
   */
  async revokeSessionByFamilyId(
    userId: string,
    familyId: string,
    reason: string = 'USER_REVOCATION',
  ): Promise<LogoutResponse> {
    this.logger.log(`User ${userId} revoking session family: ${familyId}, reason: ${reason}`);

    try {
      // First verify the family belongs to the user by getting their active sessions
      const activeFamilies = await this.refreshTokenRotationService.getActiveFamilies(userId);
      const familyExists = activeFamilies.some(family => family.familyId === familyId);

      if (!familyExists) {
        this.logger.warn(`User ${userId} attempted to revoke non-existent family: ${familyId}`);
        throw new Error('Session family not found or not authorized');
      }

      const revokedCount = await this.refreshTokenRotationService.revokeFamilyTokens(
        familyId,
        reason,
      );

      this.logger.log(`User ${userId} revoked ${revokedCount} tokens from family: ${familyId}`);

      return {
        success: true,
        message: 'Session revoked successfully',
        revokedTokensCount: revokedCount,
      };
    } catch (error: unknown) {
      this.logger.error(
        `Session revocation failed: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }
}
