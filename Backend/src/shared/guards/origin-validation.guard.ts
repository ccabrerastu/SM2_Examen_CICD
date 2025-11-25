import {
  Injectable,
  CanActivate,
  ExecutionContext,
  Logger,
  ForbiddenException,
  SetMetadata,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';

import { SecurityConfig } from '../../infrastructure/config/security/security.config';
import { ExtendedRequest } from '../types/request.types';

// Decorator to skip origin validation
export const SkipOriginValidation = () => SetMetadata('skipOriginValidation', true);

// Decorator to specify additional allowed origins for specific endpoints
export const AllowedOrigins = (...origins: string[]) => SetMetadata('allowedOrigins', origins);

@Injectable()
export class OriginValidationGuard implements CanActivate {
  private readonly logger = new Logger(OriginValidationGuard.name);
  private readonly securityConfig: SecurityConfig;

  constructor(
    private readonly configService: ConfigService,
    private readonly reflector: Reflector,
  ) {
    this.securityConfig = this.configService.get<SecurityConfig>('security')!;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<ExtendedRequest>();

    // Skip if explicitly marked to skip origin validation
    const skipOriginValidation = this.reflector.getAllAndOverride<boolean>('skipOriginValidation', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (skipOriginValidation) {
      return true;
    }

    // Skip for safe methods unless strict validation is enabled
    const method = request.method.toLowerCase();
    if (
      !this.securityConfig.originValidation.strict &&
      ['get', 'head', 'options'].includes(method)
    ) {
      return true;
    }

    return this.validateOrigin(context, request);
  }

  /**
   * Validate the request origin
   */
  private validateOrigin(context: ExecutionContext, request: ExtendedRequest): boolean {
    const origin = request.headers.origin as string;
    const referer = request.headers.referer as string;
    const { originValidation } = this.securityConfig;

    // Get additional allowed origins for this specific endpoint
    const endpointOrigins = this.reflector.getAllAndOverride<string[]>('allowedOrigins', [
      context.getHandler(),
      context.getClass(),
    ]);

    const allowedOrigins = [...originValidation.allowedOrigins, ...(endpointOrigins || [])];

    // Check Origin header
    if (originValidation.requireOriginHeader || origin) {
      if (!origin) {
        this.logger.warn('Origin validation failed: Missing Origin header', {
          ip: request.realIP || request.ip,
          method: request.method,
          path: request.path,
          userAgent: request.headers['user-agent'],
        });

        throw new ForbiddenException({
          error: 'ORIGIN_VALIDATION_FAILED',
          message: 'Origin header is required',
          timestamp: new Date().toISOString(),
        });
      }

      if (!this.isOriginAllowed(origin, allowedOrigins)) {
        this.logger.warn('Origin validation failed: Origin not allowed', {
          origin,
          allowedOrigins: this.sanitizeOriginsForLogging(allowedOrigins),
          ip: request.realIP || request.ip,
          method: request.method,
          path: request.path,
          userAgent: request.headers['user-agent'],
        });

        throw new ForbiddenException({
          error: 'ORIGIN_VALIDATION_FAILED',
          message: 'Origin not allowed',
          timestamp: new Date().toISOString(),
        });
      }
    }

    // Check Referer header if required
    if (originValidation.requireRefererHeader) {
      if (!referer) {
        this.logger.warn('Origin validation failed: Missing Referer header', {
          ip: request.realIP || request.ip,
          method: request.method,
          path: request.path,
          userAgent: request.headers['user-agent'],
        });

        throw new ForbiddenException({
          error: 'ORIGIN_VALIDATION_FAILED',
          message: 'Referer header is required',
          timestamp: new Date().toISOString(),
        });
      }

      try {
        const refererOrigin = new URL(referer).origin;
        if (!this.isOriginAllowed(refererOrigin, allowedOrigins)) {
          this.logger.warn('Origin validation failed: Referer origin not allowed', {
            referer,
            refererOrigin,
            allowedOrigins: this.sanitizeOriginsForLogging(allowedOrigins),
            ip: request.realIP || request.ip,
            method: request.method,
            path: request.path,
            userAgent: request.headers['user-agent'],
          });

          throw new ForbiddenException({
            error: 'ORIGIN_VALIDATION_FAILED',
            message: 'Referer origin not allowed',
            timestamp: new Date().toISOString(),
          });
        }
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        this.logger.warn('Origin validation failed: Invalid Referer format', {
          referer,
          error: errorMessage,
          ip: request.realIP || request.ip,
          method: request.method,
          path: request.path,
          userAgent: request.headers['user-agent'],
        });

        throw new ForbiddenException({
          error: 'ORIGIN_VALIDATION_FAILED',
          message: 'Invalid Referer format',
          timestamp: new Date().toISOString(),
        });
      }
    }

    // Additional security checks for cross-origin requests
    if (origin && !this.isSameOrigin(origin, request)) {
      this.performCrossOriginSecurityChecks(request, origin);
    }

    return true;
  }

  /**
   * Check if an origin is allowed
   */
  private isOriginAllowed(origin: string, allowedOrigins: string[]): boolean {
    // TEMPORARY: Allow all origins for testing in development mode (REMOVE IN PRODUCTION)
    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'dev') {
      this.logger.debug(`OriginValidation: Allowing origin ${origin} (development mode)`);
      return true;
    }

    // Allow same-origin requests (when origin is null or undefined)
    if (!origin || origin === 'null') {
      return true;
    }

    // Normalize origin (remove trailing slash)
    const normalizedOrigin = origin.replace(/\/$/, '');

    // Check against allowed origins (also normalized)
    return allowedOrigins.some(allowed => {
      const normalizedAllowed = allowed.replace(/\/$/, '');
      return normalizedAllowed === normalizedOrigin || normalizedAllowed === '*';
    });
  }

  /**
   * Check if the request is same-origin
   */
  private isSameOrigin(origin: string, request: ExtendedRequest): boolean {
    try {
      const requestUrl = new URL(`${request.protocol}://${request.get('host')}`);
      const originUrl = new URL(origin);

      return requestUrl.origin === originUrl.origin;
    } catch (error) {
      return false;
    }
  }

  /**
   * Perform additional security checks for cross-origin requests
   */
  private performCrossOriginSecurityChecks(request: ExtendedRequest, origin: string): void {
    // Check for suspicious patterns in cross-origin requests
    const userAgent = request.headers['user-agent'] as string;
    const contentType = request.headers['content-type'] as string;

    // Log cross-origin requests for monitoring
    this.logger.log('Cross-origin request detected', {
      origin,
      ip: request.realIP || request.ip,
      method: request.method,
      path: request.path,
      userAgent,
      contentType,
    });

    // Additional checks can be implemented here based on security requirements
    // For example:
    // - Rate limiting for cross-origin requests
    // - Additional headers validation
    // - Suspicious user agent detection
  }

  /**
   * Sanitize origins for logging (remove sensitive information)
   */
  private sanitizeOriginsForLogging(origins: string[]): string[] {
    return origins.map(origin => {
      if (origin === '*') {
        return '*';
      }

      try {
        const url = new URL(origin);
        return `${url.protocol}//${url.hostname}:${url.port}`;
      } catch (error) {
        return '[INVALID_ORIGIN]';
      }
    });
  }
}
