import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { SignOptions, VerifyOptions } from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import type { StringValue } from 'ms';
import { IJwtService } from '../../application/interfaces/services/jwt-service.interface';

export interface JwtPayload {
  sub: string; // Subject (user ID)
  iss: string; // Issuer
  aud: string; // Audience
  jti: string; // JWT ID
  iat: number; // Issued at
  exp: number; // Expires at
  type: 'access' | 'refresh';
  role: string; // User role
  email?: string; // Optional email
}

@Injectable()
export class JwtService implements IJwtService {
  private readonly accessTokenSecret: string;
  private readonly refreshTokenSecret: string;
  private readonly accessTokenExpiresIn: string;
  private readonly refreshTokenExpiresIn: string;
  private readonly issuer: string;
  private readonly audience: string;
  private readonly keyId?: string | undefined;
  private readonly algorithm: string;

  constructor(private readonly configService: ConfigService) {
    this.accessTokenSecret =
      this.configService.get<string>('jwt.accessTokenSecret') || 'access-secret';
    this.refreshTokenSecret =
      this.configService.get<string>('jwt.refreshTokenSecret') || 'refresh-secret';
    this.accessTokenExpiresIn = this.configService.get<string>('jwt.accessTokenExpiresIn') || '15m';
    this.refreshTokenExpiresIn =
      this.configService.get<string>('jwt.refreshTokenExpiresIn') || '7d';
    this.issuer = this.configService.get<string>('jwt.issuer') || 'english-app-backend';
    this.audience = this.configService.get<string>('jwt.audience') || 'english-app-client';
    this.keyId = this.configService.get<string>('jwt.keyId');
    this.algorithm = this.configService.get<string>('jwt.algorithm') || 'HS256';
  }

  /**
   * Create an access token with proper JWT claims
   */
  async createAccessToken(userId: string, role: string, email?: string): Promise<string> {
    const now = Math.floor(Date.now() / 1000);
    const exp = now + this.parseExpirationTime(this.accessTokenExpiresIn);

    const payload: JwtPayload = {
      sub: userId,
      iss: this.issuer,
      aud: this.audience,
      jti: uuidv4(),
      iat: now,
      exp,
      type: 'access',
      role,
      ...(email && { email }),
    };

    const signOptions: SignOptions = {
      algorithm: this.algorithm as jwt.Algorithm,
      ...(this.keyId && { keyid: this.keyId }),
    };

    return jwt.sign(payload, this.accessTokenSecret, signOptions);
  }

  /**
   * Create a refresh token (note: refresh tokens should be opaque as per runbook)
   * This is kept for compatibility but refresh tokens should use the TokenGenerationService
   */
  async createRefreshToken(userId: string, role: string): Promise<string> {
    const now = Math.floor(Date.now() / 1000);
    const exp = now + this.parseExpirationTime(this.refreshTokenExpiresIn);

    const payload: JwtPayload = {
      sub: userId,
      iss: this.issuer,
      aud: this.audience,
      jti: uuidv4(),
      iat: now,
      exp,
      type: 'refresh',
      role,
    };

    const signOptions: SignOptions = {
      algorithm: this.algorithm as jwt.Algorithm,
      ...(this.keyId && { keyid: this.keyId }),
    };

    return jwt.sign(payload, this.refreshTokenSecret, signOptions);
  }

  /**
   * Legacy method for backward compatibility
   */
  async sign(payload: object, options?: { expiresIn?: string }): Promise<string> {
    const expiresIn = options?.expiresIn || this.accessTokenExpiresIn;
    const signOptions: SignOptions = {
      expiresIn: expiresIn as StringValue,
      algorithm: this.algorithm as jwt.Algorithm,
      ...(this.keyId && { keyid: this.keyId }),
    };
    return jwt.sign(payload, this.accessTokenSecret, signOptions);
  }

  /**
   * Verify an access token
   */
  async verify(token: string): Promise<JwtPayload> {
    try {
      const verifyOptions: VerifyOptions = {
        issuer: this.issuer,
        audience: this.audience,
        algorithms: [this.algorithm as jwt.Algorithm],
      };
      return jwt.verify(token, this.accessTokenSecret, verifyOptions) as JwtPayload;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Invalid access token: ${errorMessage}`);
    }
  }

  /**
   * Verify a refresh token
   */
  async verifyRefreshToken(token: string): Promise<JwtPayload> {
    try {
      const verifyOptions: VerifyOptions = {
        issuer: this.issuer,
        audience: this.audience,
        algorithms: [this.algorithm as jwt.Algorithm],
      };
      const payload = jwt.verify(token, this.refreshTokenSecret, verifyOptions) as JwtPayload;

      if (payload.type !== 'refresh') {
        throw new Error('Invalid token type');
      }

      return payload;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Invalid refresh token: ${errorMessage}`);
    }
  }

  /**
   * Decode a token without verification (for debugging/inspection)
   */
  decode(token: string): jwt.Jwt | null {
    return jwt.decode(token, { complete: true });
  }

  /**
   * Get access token expiration time in seconds
   */
  getAccessTokenExpirationTime(): number {
    return this.parseExpirationTime(this.accessTokenExpiresIn);
  }

  /**
   * Get refresh token expiration time in seconds
   */
  getRefreshTokenExpirationTime(): number {
    return this.parseExpirationTime(this.refreshTokenExpiresIn);
  }

  /**
   * Parse expiration time string to seconds
   */
  private parseExpirationTime(expiresIn: string): number {
    if (expiresIn.endsWith('m')) {
      return parseInt(expiresIn.slice(0, -1)) * 60;
    } else if (expiresIn.endsWith('h')) {
      return parseInt(expiresIn.slice(0, -1)) * 3600;
    } else if (expiresIn.endsWith('d')) {
      return parseInt(expiresIn.slice(0, -1)) * 86400;
    } else {
      return parseInt(expiresIn);
    }
  }
}
