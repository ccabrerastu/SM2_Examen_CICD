import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response, NextFunction } from 'express';
import { SecurityConfig } from '../../infrastructure/config/security/security.config';
import { ExtendedRequest } from '../types/request.types';

@Injectable()
export class SecurityMiddleware implements NestMiddleware {
  private readonly logger = new Logger(SecurityMiddleware.name);
  private readonly securityConfig: SecurityConfig;

  constructor(private readonly configService: ConfigService) {
    this.securityConfig = this.configService.get<SecurityConfig>('security')!;
  }

  use(req: ExtendedRequest, res: Response, next: NextFunction): void {
    // Extract real IP address
    this.extractRealIP(req);

    // Set security headers
    this.setSecurityHeaders(res);

    // Validate origin and referer
    if (!this.validateOriginAndReferer(req, res)) {
      return;
    }

    // Log security-focused request information
    this.logSecurityInfo(req);

    next();
  }

  /**
   * Extract the real IP address from the request
   */
  private extractRealIP(req: ExtendedRequest): void {
    let realIP = req.ip;

    if (
      this.securityConfig.ipExtraction.trustProxy &&
      this.securityConfig.ipExtraction.proxiedHeaders
    ) {
      for (const header of this.securityConfig.ipExtraction.proxiedHeaders) {
        const headerValue = req.headers[header.toLowerCase()];
        if (headerValue && typeof headerValue === 'string') {
          // Take the first IP from comma-separated list
          const firstIP = headerValue.split(',')[0].trim();
          if (this.isValidIP(firstIP)) {
            realIP = firstIP;
            break;
          }
        }
      }
    }

    // Fallback to connection remote address if available
    if (!realIP || realIP === '::1' || realIP === '127.0.0.1') {
      if (this.securityConfig.ipExtraction.fallbackToRemoteAddr && req.connection?.remoteAddress) {
        realIP = req.connection.remoteAddress;
      }
    }

    // Store real IP for later use
    if (realIP) {
      req.realIP = realIP;
    }
  }

  /**
   * Set comprehensive security headers
   */
  private setSecurityHeaders(res: Response): void {
    const { headers } = this.securityConfig;

    // HTTP Strict Transport Security (HSTS)
    const hstsValue = `max-age=${headers.hsts.maxAge}${
      headers.hsts.includeSubDomains ? '; includeSubDomains' : ''
    }${headers.hsts.preload ? '; preload' : ''}`;
    res.setHeader('Strict-Transport-Security', hstsValue);

    // Content Security Policy (CSP)
    const cspDirectives = Object.entries(headers.csp.directives)
      .map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
      .join('; ');
    res.setHeader('Content-Security-Policy', cspDirectives);

    // X-Content-Type-Options
    if (headers.xContentTypeOptions) {
      res.setHeader('X-Content-Type-Options', 'nosniff');
    }

    // Referrer Policy
    res.setHeader('Referrer-Policy', headers.referrerPolicy);

    // X-Frame-Options
    res.setHeader('X-Frame-Options', headers.xFrameOptions);

    // X-XSS-Protection
    res.setHeader('X-XSS-Protection', headers.xXssProtection);

    // Remove potentially sensitive headers
    res.removeHeader('X-Powered-By');
    res.removeHeader('Server');

    // Additional security headers
    res.setHeader('X-DNS-Prefetch-Control', 'off');
    res.setHeader('X-Download-Options', 'noopen');
    res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
  }

  /**
   * Validate origin and referer headers
   */
  private validateOriginAndReferer(req: Request, res: Response): boolean {
    const { originValidation } = this.securityConfig;

    if (!originValidation.strict) {
      return true;
    }

    const origin = req.headers.origin;
    const referer = req.headers.referer;
    const method = req.method.toLowerCase();

    // Skip validation for documentation paths (Swagger)
    if (req.path.startsWith('/api/docs')) {
      return true;
    }

    // Skip validation for safe methods unless explicitly required
    if (['get', 'head', 'options'].includes(method) && !originValidation.requireOriginHeader) {
      return true;
    }

    // Check Origin header
    if (originValidation.requireOriginHeader || origin) {
      if (!origin) {
        // Only log as warning for unsafe methods (POST, PUT, DELETE, PATCH)
        if (!['get', 'head', 'options'].includes(method)) {
          this.logger.warn(
            `Missing Origin header for ${method.toUpperCase()} request to ${req.path}`,
          );
        }
        // Don't block the request if it's a safe method and requireOriginHeader is false
        if (['get', 'head', 'options'].includes(method) && !originValidation.requireOriginHeader) {
          return true;
        }
        res.status(403).json({
          error: 'Forbidden',
          message: 'Origin header is required',
        });
        return false;
      }

      if (!this.isOriginAllowed(origin)) {
        this.logger.warn(
          `Invalid origin: ${origin} for ${method.toUpperCase()} request to ${req.path}`,
        );
        res.status(403).json({
          error: 'Forbidden',
          message: 'Origin not allowed',
        });
        return false;
      }
    }

    // Check Referer header if required
    if (originValidation.requireRefererHeader) {
      if (!referer) {
        this.logger.warn(
          `Missing Referer header for ${method.toUpperCase()} request to ${req.path}`,
        );
        res.status(403).json({
          error: 'Forbidden',
          message: 'Referer header is required',
        });
        return false;
      }

      try {
        const refererOrigin = new URL(referer).origin;
        if (!this.isOriginAllowed(refererOrigin)) {
          this.logger.warn(
            `Invalid referer: ${referer} for ${method.toUpperCase()} request to ${req.path}`,
          );
          res.status(403).json({
            error: 'Forbidden',
            message: 'Referer not allowed',
          });
          return false;
        }
      } catch (error) {
        this.logger.warn(
          `Invalid referer format: ${referer} for ${method.toUpperCase()} request to ${req.path}`,
        );
        res.status(403).json({
          error: 'Forbidden',
          message: 'Invalid referer format',
        });
        return false;
      }
    }

    return true;
  }

  /**
   * Log security-focused request information
   */
  private logSecurityInfo(req: ExtendedRequest): void {
    const { logging } = this.securityConfig;

    if (!logging.enabled || !logging.logRequests) {
      return;
    }

    // Check if path should be excluded
    if (logging.excludePaths.some(path => req.path.startsWith(path))) {
      return;
    }

    const logData: Record<string, unknown> = {
      method: req.method,
      path: req.path,
      timestamp: new Date().toISOString(),
    };

    if (logging.logIp) {
      logData.ip = req.realIP || req.ip;
    }

    if (logging.logUserAgent) {
      logData.userAgent = req.headers['user-agent'];
    }

    if (logging.logHeaders) {
      // Log security-relevant headers only
      const securityHeaders = [
        'origin',
        'referer',
        'authorization',
        'x-requested-with',
        'x-forwarded-for',
        'x-real-ip',
        'cf-connecting-ip',
      ];
      logData.headers = {} as Record<string, string | string[]>;
      securityHeaders.forEach(header => {
        const value = req.headers[header];
        if (value) {
          (logData.headers as Record<string, string | string[]>)[header] = value;
        }
      });
    }

    if (logging.logBody && req.method !== 'GET' && req.method !== 'HEAD') {
      if (req.body && Object.keys(req.body).length > 0) {
        // Sanitize sensitive data before logging
        logData.body = this.sanitizeLogData(req.body, logging.maxBodySize);
      }
    }

    this.logger.log(`Security request: ${JSON.stringify(logData)}`);
  }

  /**
   * Check if an origin is allowed
   */
  private isOriginAllowed(origin: string): boolean {
    const { originValidation } = this.securityConfig;

    // Always allow same-origin requests
    if (!origin || origin === 'null') {
      return true;
    }

    // TEMPORARY: Allow all origins for testing (REMOVE IN PRODUCTION)
    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'dev') {
      this.logger.debug(`Security: Allowing origin ${origin} (development mode)`);
      return true;
    }

    // Check if origin is in the allowed list
    if (originValidation.allowedOrigins.includes(origin)) {
      return true;
    }

    return false;
  }

  /**
   * Validate IP address format
   */
  private isValidIP(ip: string): boolean {
    const ipv4Regex =
      /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::1$|^::/;

    return ipv4Regex.test(ip) || ipv6Regex.test(ip);
  }

  /**
   * Sanitize sensitive data from logs
   */
  private sanitizeLogData(data: unknown, maxSize: number): Record<string, unknown> | unknown {
    if (!data || typeof data !== 'object' || data === null) {
      return data;
    }

    const sensitiveFields = ['password', 'token', 'secret', 'key', 'authorization'];
    const sanitized = { ...(data as Record<string, unknown>) };

    // Remove sensitive fields
    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });

    // Truncate if too large
    const jsonString = JSON.stringify(sanitized);
    if (jsonString.length > maxSize) {
      return { ...sanitized, _truncated: true, _originalSize: jsonString.length };
    }

    return sanitized;
  }
}
