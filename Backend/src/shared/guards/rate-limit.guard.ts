import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Logger,
  HttpException,
  HttpStatus,
  SetMetadata,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';

import { SecurityConfig } from '../../infrastructure/config/security/security.config';
import { ExtendedRequest } from '../types/request.types';

// Rate limit configuration interface
interface RateLimitConfig {
  windowMs: number;
  max: number;
  keyGenerator?: (request: ExtendedRequest) => string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

// Decorator to configure rate limiting for specific endpoints
export const RateLimit = (config: RateLimitConfig) => SetMetadata('rateLimit', config);

// Decorator to skip rate limiting
export const SkipRateLimit = () => Reflector.createDecorator<boolean>();

// Predefined rate limit configurations
export const RATE_LIMITS = {
  REGISTRATION: 'registration',
  LOGIN: 'login',
  LOGIN_PER_ACCOUNT: 'loginPerAccount',
  FORGOT_PASSWORD: 'forgotPassword',
  TOKEN_REFRESH: 'tokenRefresh',
  EMAIL_VERIFICATION: 'emailVerification',
  LOGOUT: 'logout',
  SESSION_REVOCATION: 'sessionRevocation',
  GENERAL: 'general',
} as const;

export type RateLimitType = (typeof RATE_LIMITS)[keyof typeof RATE_LIMITS];

// Decorator for predefined rate limits
export const UseRateLimit = (type: RateLimitType) => SetMetadata('useRateLimit', type);

@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly logger = new Logger(RateLimitGuard.name);
  private readonly securityConfig: SecurityConfig;

  // In-memory store for rate limiting (in production, use Redis)
  private readonly store = new Map<string, { count: number; resetTime: number }>();

  // Cleanup interval to remove expired entries
  private readonly cleanupInterval: NodeJS.Timeout;

  constructor(
    private readonly configService: ConfigService,
    private readonly reflector: Reflector,
  ) {
    this.securityConfig = this.configService.get<SecurityConfig>('security')!;

    // Cleanup expired entries every 5 minutes
    this.cleanupInterval = setInterval(
      () => {
        this.cleanupExpiredEntries();
      },
      5 * 60 * 1000,
    );
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<ExtendedRequest>();

    // Skip if explicitly marked to skip rate limiting
    const skipRateLimit = this.reflector.getAllAndOverride<boolean>('skipRateLimit', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (skipRateLimit) {
      return true;
    }

    // Get rate limit configuration
    const rateLimitConfig = this.getRateLimitConfig(context);
    if (!rateLimitConfig) {
      // Default to general rate limiting if no specific config
      return this.applyRateLimit(request, this.getGeneralRateLimitConfig(), 'general');
    }

    const rateLimitType = this.reflector.getAllAndOverride<RateLimitType>('useRateLimit', [
      context.getHandler(),
      context.getClass(),
    ]);

    return this.applyRateLimit(request, rateLimitConfig, rateLimitType || 'general');
  }

  /**
   * Get rate limit configuration for the current request
   */
  private getRateLimitConfig(context: ExecutionContext): RateLimitConfig | null {
    // Check for custom rate limit configuration
    const customConfig = this.reflector.getAllAndOverride<RateLimitConfig>('rateLimit', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (customConfig) {
      return customConfig;
    }

    // Check for predefined rate limit type
    const rateLimitType = this.reflector.getAllAndOverride<RateLimitType>('useRateLimit', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (rateLimitType) {
      return this.getPredefinedRateLimitConfig(rateLimitType);
    }

    return null;
  }

  /**
   * Get predefined rate limit configuration
   */
  private getPredefinedRateLimitConfig(type: RateLimitType): RateLimitConfig {
    const { rateLimit } = this.securityConfig;

    switch (type) {
      case RATE_LIMITS.REGISTRATION:
        return {
          windowMs: rateLimit.registration.windowMs,
          max: rateLimit.registration.max,
          keyGenerator: req => this.getIPKey(req, 'registration'),
        };

      case RATE_LIMITS.LOGIN:
        return {
          windowMs: rateLimit.login.windowMs,
          max: rateLimit.login.max,
          keyGenerator: req => this.getIPKey(req, 'login'),
        };

      case RATE_LIMITS.LOGIN_PER_ACCOUNT:
        return {
          windowMs: rateLimit.login.perAccount.windowMs,
          max: rateLimit.login.perAccount.max,
          keyGenerator: req => this.getAccountKey(req, 'login'),
        };

      case RATE_LIMITS.FORGOT_PASSWORD:
        return {
          windowMs: rateLimit.forgotPassword.windowMs,
          max: rateLimit.forgotPassword.max,
          keyGenerator: req => this.getIPKey(req, 'forgot-password'),
        };

      case RATE_LIMITS.TOKEN_REFRESH:
        return {
          windowMs: rateLimit.tokenRefresh.windowMs,
          max: rateLimit.tokenRefresh.max,
          keyGenerator: req => this.getIPKey(req, 'token-refresh'),
        };

      case RATE_LIMITS.EMAIL_VERIFICATION:
        return {
          windowMs: rateLimit.emailVerification.windowMs,
          max: rateLimit.emailVerification.max,
          keyGenerator: req => this.getIPKey(req, 'email-verification'),
        };

      case RATE_LIMITS.GENERAL:
      default:
        return this.getGeneralRateLimitConfig();
    }
  }

  /**
   * Get general rate limit configuration
   */
  private getGeneralRateLimitConfig(): RateLimitConfig {
    const { rateLimit } = this.securityConfig;

    return {
      windowMs: rateLimit.general.windowMs,
      max: rateLimit.general.max,
      keyGenerator: req => this.getIPKey(req, 'general'),
    };
  }

  /**
   * Apply rate limiting to the request
   */
  private applyRateLimit(request: ExtendedRequest, config: RateLimitConfig, type: string): boolean {
    const key = config.keyGenerator ? config.keyGenerator(request) : this.getIPKey(request, type);
    const now = Date.now();
    const resetTime = now + config.windowMs;

    // Get or create rate limit entry
    let entry = this.store.get(key);
    if (!entry || now > entry.resetTime) {
      entry = { count: 0, resetTime };
      this.store.set(key, entry);
    }

    // Increment request count
    entry.count++;

    // Check if limit exceeded
    if (entry.count > config.max) {
      const remainingTime = Math.ceil((entry.resetTime - now) / 1000);

      this.logger.warn('Rate limit exceeded', {
        key,
        type,
        count: entry.count,
        limit: config.max,
        remainingTime,
        ip: this.getAnonymizedIP(request),
        path: request.path,
        userAgent: request.headers['user-agent'],
      });

      throw new HttpException(
        {
          error: 'RATE_LIMIT_EXCEEDED',
          message: `Rate limit exceeded. Try again in ${remainingTime} seconds.`,
          retryAfter: remainingTime,
          limit: config.max,
          remaining: 0,
          resetTime: new Date(entry.resetTime).toISOString(),
          timestamp: new Date().toISOString(),
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    // Add rate limit headers to response
    const response = request.res;
    if (response) {
      response.setHeader('X-RateLimit-Limit', config.max);
      response.setHeader('X-RateLimit-Remaining', Math.max(0, config.max - entry.count));
      response.setHeader('X-RateLimit-Reset', Math.ceil(entry.resetTime / 1000));
      response.setHeader('X-RateLimit-Window', Math.ceil(config.windowMs / 1000));
    }

    return true;
  }

  /**
   * Generate IP-based key for rate limiting
   */
  private getIPKey(request: ExtendedRequest, type: string): string {
    const ip = this.getAnonymizedIP(request);
    return `ip:${ip}:${type}`;
  }

  /**
   * Generate account-based key for rate limiting
   */
  private getAccountKey(request: ExtendedRequest, type: string): string {
    // Try to get account identifier from request body or user
    const email = request.body?.email || request.user?.email;
    const userId = request.user?.id;

    if (userId) {
      return `user:${userId}:${type}`;
    }

    if (email) {
      return `email:${this.hashString(email)}:${type}`;
    }

    // Fallback to IP-based limiting
    return this.getIPKey(request, type);
  }

  /**
   * Get anonymized IP for privacy preservation
   */
  private getAnonymizedIP(request: ExtendedRequest): string {
    const ip = request.realIP || request.ip;

    if (!ip) {
      return 'unknown';
    }

    // For IPv4, mask the last octet
    if (ip.includes('.') && !ip.includes(':')) {
      const parts = ip.split('.');
      if (parts.length === 4) {
        return `${parts[0]}.${parts[1]}.${parts[2]}.0`;
      }
    }

    // For IPv6, mask the last 64 bits
    if (ip.includes(':')) {
      const parts = ip.split(':');
      if (parts.length >= 4) {
        return `${parts.slice(0, 4).join(':')}::/64`;
      }
    }

    return this.hashString(ip).substring(0, 8);
  }

  /**
   * Hash a string for privacy
   */
  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * Cleanup expired entries from store
   */
  private cleanupExpiredEntries(): void {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [key, entry] of Array.from(this.store.entries())) {
      if (now > entry.resetTime) {
        this.store.delete(key);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      this.logger.debug(`Cleaned up ${cleanedCount} expired rate limit entries`);
    }
  }

  /**
   * Clean up resources on module destroy
   */
  onModuleDestroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.store.clear();
  }
}
