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
import { Response } from 'express';
import * as crypto from 'crypto';
import { SecurityConfig } from '../../infrastructure/config/security/security.config';
import { ExtendedRequest } from '../types/request.types';

// Decorator to skip CSRF protection
export const SkipCSRF = () => SetMetadata('skipCSRF', true);

@Injectable()
export class CSRFGuard implements CanActivate {
  private readonly logger = new Logger(CSRFGuard.name);
  private readonly securityConfig: SecurityConfig;

  constructor(
    private readonly configService: ConfigService,
    private readonly reflector: Reflector,
  ) {
    this.securityConfig = this.configService.get<SecurityConfig>('security')!;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<ExtendedRequest>();
    const response = context.switchToHttp().getResponse<Response>();

    // Skip if CSRF is disabled globally
    if (!this.securityConfig.csrf.enabled) {
      return true;
    }

    // Skip if explicitly marked to skip CSRF
    const skipCSRF = this.reflector.getAllAndOverride<boolean>('skipCSRF', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (skipCSRF) {
      return true;
    }

    // Skip CSRF for safe HTTP methods
    const method = request.method.toLowerCase();
    if (['get', 'head', 'options'].includes(method)) {
      return true;
    }

    // Generate or validate CSRF token
    return this.validateCSRFToken(request, response);
  }

  /**
   * Validate CSRF token for state-changing requests
   */
  private validateCSRFToken(request: ExtendedRequest, response: Response): boolean {
    const { csrf } = this.securityConfig;

    // Check for X-Requested-With header (AJAX indicator)
    const requestedWith = request.headers['x-requested-with'];
    if (!requestedWith || requestedWith !== 'XMLHttpRequest') {
      this.logger.warn('CSRF validation failed: Missing or invalid X-Requested-With header', {
        ip: request.realIP || request.ip,
        method: request.method,
        path: request.path,
        userAgent: request.headers['user-agent'],
      });

      throw new ForbiddenException({
        error: 'CSRF_VALIDATION_FAILED',
        message: 'CSRF validation failed: X-Requested-With header is required',
        timestamp: new Date().toISOString(),
      });
    }

    // Get CSRF token from cookie
    const csrfCookie = request.cookies?.[csrf.cookie.name];

    // Get CSRF token from header or body
    const csrfHeader = request.headers['x-csrf-token'] || request.headers['x-xsrf-token'];
    const csrfBody = request.body?.['_csrf'] || request.body?.['csrf_token'];
    const csrfToken = csrfHeader || csrfBody;

    // If no cookie exists, generate one
    if (!csrfCookie) {
      this.generateCSRFToken(response);

      // For cookie-based endpoints, require token on subsequent requests
      throw new ForbiddenException({
        error: 'CSRF_TOKEN_REQUIRED',
        message: 'CSRF token is required. Please retry the request.',
        timestamp: new Date().toISOString(),
      });
    }

    // Validate the token
    if (!csrfToken || !this.isValidCSRFToken(csrfCookie, csrfToken)) {
      this.logger.warn('CSRF validation failed: Invalid token', {
        ip: request.realIP || request.ip,
        method: request.method,
        path: request.path,
        hasToken: !!csrfToken,
        hasCookie: !!csrfCookie,
        userAgent: request.headers['user-agent'],
      });

      throw new ForbiddenException({
        error: 'CSRF_VALIDATION_FAILED',
        message: 'CSRF validation failed: Invalid or missing token',
        timestamp: new Date().toISOString(),
      });
    }

    return true;
  }

  /**
   * Generate a new CSRF token and set it as a cookie
   */
  private generateCSRFToken(response: Response): string {
    const { csrf } = this.securityConfig;

    // Generate a cryptographically secure random token
    const token = crypto.randomBytes(32).toString('hex');

    // Set the token as an HTTP-only cookie
    response.cookie(csrf.cookie.name, token, {
      httpOnly: csrf.cookie.httpOnly,
      secure: csrf.cookie.secure,
      sameSite: csrf.cookie.sameSite,
      maxAge: csrf.cookie.maxAge,
      path: '/',
    });

    return token;
  }

  /**
   * Validate CSRF token using timing-safe comparison
   */
  private isValidCSRFToken(cookieToken: string, providedToken: string): boolean {
    if (!cookieToken || !providedToken) {
      return false;
    }

    // Ensure both tokens are strings and of the same length
    if (typeof cookieToken !== 'string' || typeof providedToken !== 'string') {
      return false;
    }

    if (cookieToken.length !== providedToken.length) {
      return false;
    }

    // Use timing-safe comparison to prevent timing attacks
    return crypto.timingSafeEqual(
      Buffer.from(cookieToken, 'hex'),
      Buffer.from(providedToken, 'hex'),
    );
  }
}
