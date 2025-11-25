import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response, NextFunction } from 'express';
import { SecurityConfig } from '../../infrastructure/config/security/security.config';

@Injectable()
export class CorsMiddleware implements NestMiddleware {
  private readonly logger = new Logger(CorsMiddleware.name);
  private readonly securityConfig: SecurityConfig;

  constructor(private readonly configService: ConfigService) {
    this.securityConfig = this.configService.get<SecurityConfig>('security')!;
  }

  use(req: Request, res: Response, next: NextFunction): void {
    const origin = req.headers.origin;

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      this.handlePreflight(req, res, origin);
      return;
    }

    // Handle actual requests
    this.handleActualRequest(res, origin);
    next();
  }

  /**
   * Handle CORS preflight requests
   */
  private handlePreflight(req: Request, res: Response, origin?: string): void {
    const corsConfig = this.securityConfig.cors;

    // Check if origin is allowed
    if (!this.isOriginAllowed(origin)) {
      this.logger.warn(`CORS preflight rejected for origin: ${origin}`);
      res.status(403).json({
        error: 'Forbidden',
        message: 'CORS origin not allowed',
      });
      return;
    }

    // Set CORS headers for preflight
    if (origin) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }

    if (corsConfig.credentials) {
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }

    // Validate and set allowed methods
    const requestedMethod = req.headers['access-control-request-method'];
    if (requestedMethod && corsConfig.methods.includes(requestedMethod)) {
      res.setHeader('Access-Control-Allow-Methods', corsConfig.methods.join(', '));
    } else if (requestedMethod) {
      this.logger.warn(`CORS preflight rejected for method: ${requestedMethod}`);
      res.status(405).json({
        error: 'Method Not Allowed',
        message: 'Method not allowed by CORS policy',
      });
      return;
    }

    // Validate and set allowed headers
    const requestedHeaders = req.headers['access-control-request-headers'];
    if (requestedHeaders) {
      const requestedHeadersArray = requestedHeaders.split(',').map(h => h.trim());
      const allowedRequestedHeaders = requestedHeadersArray.filter(header =>
        corsConfig.allowedHeaders.some(allowed => allowed.toLowerCase() === header.toLowerCase()),
      );

      if (allowedRequestedHeaders.length === requestedHeadersArray.length) {
        res.setHeader('Access-Control-Allow-Headers', corsConfig.allowedHeaders.join(', '));
      } else {
        this.logger.warn(`CORS preflight rejected for headers: ${requestedHeaders}`);
        res.status(400).json({
          error: 'Bad Request',
          message: 'Headers not allowed by CORS policy',
        });
        return;
      }
    } else {
      res.setHeader('Access-Control-Allow-Headers', corsConfig.allowedHeaders.join(', '));
    }

    // Set max age for preflight caching
    res.setHeader('Access-Control-Max-Age', corsConfig.maxAge.toString());

    // Set exposed headers
    if (corsConfig.exposedHeaders.length > 0) {
      res.setHeader('Access-Control-Expose-Headers', corsConfig.exposedHeaders.join(', '));
    }

    // Respond to preflight
    res.status(204).end();
  }

  /**
   * Handle actual CORS requests
   */
  private handleActualRequest(res: Response, origin?: string): void {
    const corsConfig = this.securityConfig.cors;

    // Check if origin is allowed
    if (!this.isOriginAllowed(origin)) {
      this.logger.warn(`CORS request rejected for origin: ${origin}`);
      // Don't set CORS headers for disallowed origins
      return;
    }

    // Set CORS headers for actual request
    if (origin) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }

    if (corsConfig.credentials) {
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }

    // Set exposed headers
    if (corsConfig.exposedHeaders.length > 0) {
      res.setHeader('Access-Control-Expose-Headers', corsConfig.exposedHeaders.join(', '));
    }

    // Vary header to indicate origin affects the response
    res.setHeader('Vary', 'Origin');
  }

  /**
   * Check if an origin is allowed
   */
  private isOriginAllowed(origin?: string): boolean {
    const corsConfig = this.securityConfig.cors;

    // Allow requests without origin (same-origin or non-browser requests)
    if (!origin) {
      return true;
    }

    // TEMPORARY: Allow all origins for testing (REMOVE IN PRODUCTION)
    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'dev') {
      this.logger.debug(`CORS: Allowing origin ${origin} (development mode)`);
      return true;
    }

    // Check against allowed origins
    if (corsConfig.origins.includes(origin) || corsConfig.origins.includes('*')) {
      return true;
    }

    return false;
  }
}
