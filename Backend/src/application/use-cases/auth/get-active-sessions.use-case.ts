import { Injectable, Inject, Logger, UnauthorizedException } from '@nestjs/common';
import { ActiveSessionDto, ActiveSessionsResponseDto } from '../../dtos/auth/active-session.dto';
import { IRefreshTokenRotationService } from '../../interfaces/services/refresh-token-rotation-service.interface';
import { IUserRepository } from '../../interfaces/repositories/user-repository.interface';
import { ValidationException } from '../../../domain/errors/domain.errors';

export interface GetActiveSessionsRequest {
  userId: string;
  currentFamilyId?: string | undefined; // To mark which session is current
}

@Injectable()
export class GetActiveSessionsUseCase {
  private readonly logger = new Logger(GetActiveSessionsUseCase.name);

  constructor(
    @Inject('IRefreshTokenRotationService')
    private readonly refreshTokenRotationService: IRefreshTokenRotationService,
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(request: GetActiveSessionsRequest): Promise<ActiveSessionsResponseDto> {
    this.logger.debug(`Getting active sessions for user: ${request.userId}`);

    try {
      await this.validateRequest(request);

      // Verify user exists and is active
      const user = await this.userRepository.findById(request.userId);
      if (!user) {
        this.logger.warn(`Session request for non-existent user: ${request.userId}`);
        throw new UnauthorizedException('User not found');
      }

      if (!user.isActive) {
        this.logger.warn(`Session request for inactive user: ${request.userId}`);
        throw new UnauthorizedException('Account is deactivated');
      }

      // Get active token families from the rotation service
      const activeFamilies = await this.refreshTokenRotationService.getActiveFamilies(
        request.userId,
      );

      // Transform to DTOs with additional processing
      const sessionDtos = activeFamilies.map(family => {
        const location = this.extractLocationFromUserAgent(family.userAgent || null);
        const isCurrent = request.currentFamilyId === family.familyId;

        return new ActiveSessionDto(
          family.familyId,
          family.deviceInfo || null,
          family.userAgent || null,
          location, // In production, you might use IP geolocation
          family.createdAt || new Date(),
          family.lastUsedAt || new Date(),
          isCurrent,
        );
      });

      // Sort sessions - current session first, then by last used
      sessionDtos.sort((a, b) => {
        if (a.isCurrent && !b.isCurrent) return -1;
        if (!a.isCurrent && b.isCurrent) return 1;
        return new Date(b.lastUsedAt).getTime() - new Date(a.lastUsedAt).getTime();
      });

      this.logger.debug(`Found ${sessionDtos.length} active sessions for user: ${request.userId}`);

      return new ActiveSessionsResponseDto(sessionDtos, sessionDtos.length, request.userId);
    } catch (error: unknown) {
      this.logger.error(
        `Failed to get active sessions for user ${request.userId}: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      throw error;
    }
  }

  /**
   * Get active sessions count for a user (lightweight version)
   */
  async getSessionsCount(userId: string): Promise<number> {
    this.logger.debug(`Getting session count for user: ${userId}`);

    try {
      const activeFamilies = await this.refreshTokenRotationService.getActiveFamilies(userId);
      const count = activeFamilies.length;

      this.logger.debug(`User ${userId} has ${count} active sessions`);
      return count;
    } catch (error: unknown) {
      this.logger.error(
        `Failed to get session count for user ${userId}: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      return 0;
    }
  }

  /**
   * Check if a specific session is still active
   */
  async isSessionActive(userId: string, familyId: string): Promise<boolean> {
    this.logger.debug(`Checking if session ${familyId} is active for user: ${userId}`);

    try {
      const activeFamilies = await this.refreshTokenRotationService.getActiveFamilies(userId);
      const isActive = activeFamilies.some(family => family.familyId === familyId);

      this.logger.debug(
        `Session ${familyId} for user ${userId} is ${isActive ? 'active' : 'inactive'}`,
      );
      return isActive;
    } catch (error: unknown) {
      this.logger.error(
        `Failed to check session status: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      return false;
    }
  }

  /**
   * Get session details for a specific family ID
   */
  async getSessionDetails(userId: string, familyId: string): Promise<ActiveSessionDto | null> {
    this.logger.debug(`Getting session details for family: ${familyId}, user: ${userId}`);

    try {
      const activeFamilies = await this.refreshTokenRotationService.getActiveFamilies(userId);
      const family = activeFamilies.find(f => f.familyId === familyId);

      if (!family) {
        this.logger.debug(`Session ${familyId} not found for user ${userId}`);
        return null;
      }

      const location = this.extractLocationFromUserAgent(family.userAgent || null);

      return new ActiveSessionDto(
        family.familyId,
        family.deviceInfo || null,
        family.userAgent || null,
        location,
        family.createdAt || new Date(),
        family.lastUsedAt || new Date(),
        false, // We don't know if it's current without additional context
      );
    } catch (error: unknown) {
      this.logger.error(
        `Failed to get session details: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : undefined,
      );
      return null;
    }
  }

  private async validateRequest(request: GetActiveSessionsRequest): Promise<void> {
    if (!request.userId || request.userId.trim().length === 0) {
      throw new ValidationException('User ID is required');
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(request.userId)) {
      throw new ValidationException('Invalid user ID format');
    }
  }

  private extractLocationFromUserAgent(userAgent: string | null): string | null {
    if (!userAgent) return null;

    // Simple extraction - in production, use proper IP geolocation
    // For now, just extract browser/OS info
    try {
      if (userAgent.includes('iPhone')) return 'Mobile (iOS)';
      if (userAgent.includes('Android')) return 'Mobile (Android)';
      if (userAgent.includes('Windows')) return 'Desktop (Windows)';
      if (userAgent.includes('Macintosh')) return 'Desktop (macOS)';
      if (userAgent.includes('Linux')) return 'Desktop (Linux)';
      if (userAgent.includes('Chrome')) return 'Web Browser (Chrome)';
      if (userAgent.includes('Firefox')) return 'Web Browser (Firefox)';
      if (userAgent.includes('Safari')) return 'Web Browser (Safari)';

      return 'Unknown Device';
    } catch (error: unknown) {
      this.logger.debug(
        `Error extracting location from user agent: ${error instanceof Error ? error.message : String(error)}`,
      );
      return null;
    }
  }
}
