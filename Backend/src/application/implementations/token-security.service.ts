import { Injectable, Logger, Inject } from '@nestjs/common';
import { IRefreshTokenRepository } from '../interfaces/repositories/refresh-token-repository.interface';
import { TokenOperationRateLimitedException } from '../../shared/exceptions/token-rotation.exceptions';

export interface SecurityEventDetails {
  familyId?: string;
  tokenHash?: string;
  context?: string;
  revokedTokens?: number;
  timestamp?: string;
  [key: string]: unknown;
}

@Injectable()
export class TokenSecurityService {
  private readonly logger = new Logger(TokenSecurityService.name);
  private readonly TOKEN_ROTATION_RATE_LIMIT = 5; // per minute
  private readonly rateLimitMap = new Map<string, { count: number; resetTime: number }>();

  constructor(
    @Inject('IRefreshTokenRepository')
    private readonly refreshTokenRepository: IRefreshTokenRepository,
  ) {}

  async detectTokenReuse(tokenHash: string): Promise<boolean> {
    try {
      // Check if the token exists and is revoked
      const token = await this.refreshTokenRepository.findByTokenHash(tokenHash);

      if (!token) {
        // Token doesn't exist, could be a reuse attempt with invalid token
        return false;
      }

      if (token.isRevoked()) {
        this.logger.error(
          `Token reuse detected: ${tokenHash.substring(0, 10)}... (Family: ${token.familyId})`,
        );
        return true;
      }

      return false;
    } catch (error: unknown) {
      this.logger.error(
        `Error detecting token reuse: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error instanceof Error ? error.stack : undefined,
      );
      return false;
    }
  }

  async checkRateLimit(identifier: string, operation: string): Promise<void> {
    const key = `${identifier}:${operation}`;
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute

    const current = this.rateLimitMap.get(key);

    if (current) {
      if (now < current.resetTime) {
        if (current.count >= this.TOKEN_ROTATION_RATE_LIMIT) {
          throw new TokenOperationRateLimitedException(
            identifier,
            Math.ceil((current.resetTime - now) / 1000),
          );
        }
        current.count++;
      } else {
        // Reset window
        this.rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
      }
    } else {
      // First request in window
      this.rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    }

    // Clean up old entries periodically
    if (Math.random() < 0.1) {
      // 10% chance to clean up
      this.cleanupRateLimitMap(now);
    }
  }

  logSecurityEvent(event: string, details: SecurityEventDetails): void {
    const logEntry = {
      timestamp: details.timestamp || new Date().toISOString(),
      event: event,
      service: 'TokenSecurityService',
      details: details,
    };

    // Log at appropriate level based on event severity
    if (event.includes('CRITICAL') || event.includes('REUSE')) {
      this.logger.error(`SECURITY EVENT: ${event}`, logEntry);
    } else if (event.includes('REVOKED')) {
      this.logger.warn(`SECURITY EVENT: ${event}`, logEntry);
    } else {
      this.logger.log(`SECURITY EVENT: ${event}`, logEntry);
    }

    // In production, you might want to send this to a security monitoring system
    // await this.securityMonitoringService.logEvent(logEntry);
  }

  private cleanupRateLimitMap(now: number): void {
    for (const [key, value] of this.rateLimitMap.entries()) {
      if (now >= value.resetTime) {
        this.rateLimitMap.delete(key);
      }
    }
  }
}
