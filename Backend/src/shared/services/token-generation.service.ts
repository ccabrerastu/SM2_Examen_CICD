import { Injectable } from '@nestjs/common';
import { randomBytes } from 'crypto';
import {
  ITokenGenerationService,
  TokenInfo,
} from '../../application/interfaces/services/token-generation-service.interface';

@Injectable()
export class TokenGenerationService implements ITokenGenerationService {
  /**
   * Generate a cryptographically secure opaque refresh token (256-bit)
   * As per runbook specifications, refresh tokens should be opaque
   * @returns string Base64URL encoded 256-bit random token
   */
  generateOpaqueRefreshToken(): string {
    return randomBytes(32).toString('base64url'); // 32 bytes = 256 bits
  }

  /**
   * Generate an email verification token with expiration
   * @param expirationHours Hours until token expires (default: 24)
   * @returns TokenInfo object with token and expiration
   */
  generateEmailVerificationToken(expirationHours: number = 24): TokenInfo {
    const token = randomBytes(32).toString('base64url');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + expirationHours);

    return {
      token,
      expiresAt,
    };
  }

  /**
   * Generate a password reset token with expiration
   * @param expirationHours Hours until token expires (default: 1)
   * @returns TokenInfo object with token and expiration
   */
  generatePasswordResetToken(expirationHours: number = 1): TokenInfo {
    const token = randomBytes(32).toString('base64url');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + expirationHours);

    return {
      token,
      expiresAt,
    };
  }

  /**
   * Generate a generic secure token
   * @param lengthBytes Number of random bytes to generate (default: 32 for 256-bit)
   * @param encoding Encoding format (default: 'base64url')
   * @returns string Encoded secure random token
   */
  generateSecureToken(lengthBytes: number = 32, encoding: BufferEncoding = 'base64url'): string {
    return randomBytes(lengthBytes).toString(encoding);
  }

  /**
   * Generate a token with custom expiration
   * @param lengthBytes Number of random bytes (default: 32)
   * @param expirationMinutes Minutes until expiration (default: 60)
   * @returns TokenInfo object with token and expiration
   */
  generateTokenWithExpiration(lengthBytes: number = 32, expirationMinutes: number = 60): TokenInfo {
    const token = randomBytes(lengthBytes).toString('base64url');
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + expirationMinutes);

    return {
      token,
      expiresAt,
    };
  }

  /**
   * Generate a numeric OTP (One Time Password)
   * @param length Number of digits (default: 6)
   * @returns string Numeric OTP
   */
  generateNumericOTP(length: number = 6): string {
    const digits = '0123456789';
    let otp = '';

    // Ensure first digit is not 0 for better UX
    otp += digits.charAt(Math.floor(Math.random() * 9) + 1);

    for (let i = 1; i < length; i++) {
      const randomByte = randomBytes(1)[0];
      otp += digits.charAt(randomByte % 10);
    }

    return otp;
  }

  /**
   * Validate if a token has expired
   * @param expiresAt Expiration date
   * @returns boolean True if token is still valid
   */
  isTokenValid(expiresAt: Date): boolean {
    return new Date() < expiresAt;
  }
}
