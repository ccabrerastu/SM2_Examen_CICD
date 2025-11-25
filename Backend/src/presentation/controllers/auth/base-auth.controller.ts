import { Logger } from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Base controller with common utilities for authentication controllers
 */
export abstract class BaseAuthController {
  protected readonly logger = new Logger(this.constructor.name);

  /**
   * Cookie configuration for refresh tokens
   */
  protected readonly REFRESH_TOKEN_COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    sameSite: 'lax' as const,
    path: '/auth',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };

  /**
   * Extract client IP address with proper handling of proxies
   */
  protected extractIpAddress(request: Request): string {
    const xForwardedFor = request.headers['x-forwarded-for'];
    const xRealIp = request.headers['x-real-ip'];

    return (
      (Array.isArray(xForwardedFor) ? xForwardedFor[0] : xForwardedFor)?.split(',')[0] ||
      (Array.isArray(xRealIp) ? xRealIp[0] : xRealIp) ||
      request.ip ||
      request.connection.remoteAddress ||
      'unknown'
    );
  }

  /**
   * Extract device information from user agent
   */
  protected extractDeviceInfo(userAgent?: string): string {
    if (!userAgent) return 'Unknown Device';

    try {
      // Simple device detection - in production, consider using a proper user-agent parser
      if (userAgent.includes('iPhone')) return 'iPhone';
      if (userAgent.includes('iPad')) return 'iPad';
      if (userAgent.includes('Android')) return 'Android Device';
      if (userAgent.includes('Windows')) return 'Windows PC';
      if (userAgent.includes('Macintosh')) return 'Mac';
      if (userAgent.includes('Linux')) return 'Linux PC';
      if (userAgent.includes('Chrome')) return 'Chrome Browser';
      if (userAgent.includes('Firefox')) return 'Firefox Browser';
      if (userAgent.includes('Safari')) return 'Safari Browser';

      return 'Unknown Device';
    } catch (error: unknown) {
      this.logger.debug(
        `Error extracting device info: ${error instanceof Error ? error.message : String(error)}`,
      );
      return 'Unknown Device';
    }
  }

  /**
   * Handle authentication-related errors with proper logging and response
   */
  protected handleAuthError(error: unknown): never {
    if (error instanceof Error) {
      this.logger.error(`Authentication error: ${error.message}`, error.stack);

      // Handle specific error types
      if (error.message.includes('rate limit') || error.message.includes('too many')) {
        throw error; // Let rate limiting middleware handle it
      }

      if (error.message.includes('email') && error.message.includes('exists')) {
        throw error; // Let validation handle it
      }

      if (error.message.includes('invalid') || error.message.includes('not found')) {
        throw error; // Let business logic errors pass through
      }
    }

    // Generic error for unexpected cases
    this.logger.error(`Unexpected authentication error: ${String(error)}`);
    throw error;
  }

  /**
   * Set refresh token cookie in response
   */
  protected setRefreshTokenCookie(response: Response, refreshToken: string): void {
    response.cookie('refreshToken', refreshToken, this.REFRESH_TOKEN_COOKIE_OPTIONS);
  }

  /**
   * Clear refresh token cookie
   */
  protected clearRefreshTokenCookie(response: Response): void {
    response.clearCookie('refreshToken', {
      path: this.REFRESH_TOKEN_COOKIE_OPTIONS.path,
    });
  }
}
