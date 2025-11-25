import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { JwtService, JwtPayload } from '../services/jwt.service';
import { ExtendedRequest, AuthenticatedUser } from '../types/request.types';

interface ExtendedJwtPayload extends JwtPayload {
  nbf?: number; // Not before claim
}

// Decorator to make endpoints public (skip JWT validation)
export const Public = () => SetMetadata('public', true);

// Decorator to specify required roles
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);

@Injectable()
export class EnhancedJwtGuard implements CanActivate {
  private readonly logger = new Logger(EnhancedJwtGuard.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Check if the route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>('public', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<ExtendedRequest>();

    // Extract and validate JWT token
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      this.logger.warn('JWT validation failed: No token provided', {
        ip: request.realIP || request.ip,
        method: request.method,
        path: request.path,
        userAgent: request.headers['user-agent'],
      });

      throw new UnauthorizedException({
        error: 'UNAUTHORIZED',
        message: 'Access token is required',
        timestamp: new Date().toISOString(),
      });
    }

    try {
      // Verify the token
      const payload = await this.jwtService.verify(token);

      // Validate token type
      if (payload.type !== 'access') {
        this.logger.warn('JWT validation failed: Invalid token type', {
          tokenType: payload.type,
          userId: payload.sub,
          ip: request.realIP || request.ip,
        });

        throw new UnauthorizedException({
          error: 'INVALID_TOKEN_TYPE',
          message: 'Invalid token type. Access token required.',
          timestamp: new Date().toISOString(),
        });
      }

      // Validate token claims
      if (!this.validateTokenClaims(payload)) {
        this.logger.warn('JWT validation failed: Invalid token claims', {
          userId: payload.sub,
          tokenId: payload.jti,
          ip: request.realIP || request.ip,
        });

        throw new UnauthorizedException({
          error: 'INVALID_TOKEN_CLAIMS',
          message: 'Invalid token claims',
          timestamp: new Date().toISOString(),
        });
      }

      // Check role-based access control
      const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
        context.getHandler(),
        context.getClass(),
      ]);

      if (requiredRoles && !this.hasRequiredRole(payload.role, requiredRoles)) {
        this.logger.warn('JWT validation failed: Insufficient permissions', {
          userId: payload.sub,
          userRole: payload.role,
          requiredRoles,
          path: request.path,
          ip: request.realIP || request.ip,
        });

        throw new UnauthorizedException({
          error: 'INSUFFICIENT_PERMISSIONS',
          message: 'Insufficient permissions to access this resource',
          timestamp: new Date().toISOString(),
        });
      }

      // Store user information in request for downstream use
      const user: AuthenticatedUser = {
        id: payload.sub,
        tokenId: payload.jti,
      };

      // Add optional properties only if they exist
      if (payload.sub) user.userId = payload.sub;
      if (payload.role) user.role = payload.role;
      if (payload.email) user.email = payload.email;
      if (payload.iat) user.issuedAt = new Date(payload.iat * 1000);
      if (payload.exp) user.expiresAt = new Date(payload.exp * 1000);

      request.user = user;

      // Log successful authentication
      this.logger.debug('JWT validation successful', {
        userId: payload.sub,
        role: payload.role,
        tokenId: payload.jti,
        path: request.path,
      });

      return true;
    } catch (error: unknown) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      this.logger.warn('JWT validation failed: Token verification error', {
        error: error instanceof Error ? error.message : 'Unknown error',
        ip: request.realIP || request.ip,
        method: request.method,
        path: request.path,
        userAgent: request.headers['user-agent'],
      });

      // Determine the specific error type
      if (error instanceof Error ? error.message : 'Unknown error'.includes('expired')) {
        throw new UnauthorizedException({
          error: 'TOKEN_EXPIRED',
          message: 'Access token has expired',
          timestamp: new Date().toISOString(),
        });
      }

      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (errorMessage.includes('invalid signature') || errorMessage.includes('invalid token')) {
        throw new UnauthorizedException({
          error: 'INVALID_TOKEN',
          message: 'Invalid access token',
          timestamp: new Date().toISOString(),
        });
      }

      if (error instanceof Error ? error.message : 'Unknown error'.includes('malformed')) {
        throw new UnauthorizedException({
          error: 'MALFORMED_TOKEN',
          message: 'Malformed access token',
          timestamp: new Date().toISOString(),
        });
      }

      throw new UnauthorizedException({
        error: 'TOKEN_VALIDATION_FAILED',
        message: 'Access token validation failed',
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Extract Bearer token from Authorization header
   */
  private extractTokenFromHeader(request: Request): string | undefined {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      return undefined;
    }

    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' ? token : undefined;
  }

  /**
   * Validate token claims for security
   */
  private validateTokenClaims(payload: ExtendedJwtPayload): boolean {
    const now = Math.floor(Date.now() / 1000);

    // Check required claims
    if (!payload.sub || !payload.iss || !payload.aud || !payload.jti) {
      return false;
    }

    // Check expiration
    if (payload.exp && payload.exp <= now) {
      return false;
    }

    // Check not before (if present)
    if (payload.nbf && payload.nbf > now) {
      return false;
    }

    // Check issued at (prevent tokens from the future)
    if (payload.iat && payload.iat > now + 60) {
      // Allow 1 minute clock skew
      return false;
    }

    return true;
  }

  /**
   * Check if user has required role
   */
  private hasRequiredRole(userRole: string, requiredRoles: string[]): boolean {
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    return requiredRoles.includes(userRole);
  }
}
