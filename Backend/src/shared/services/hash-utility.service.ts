import { Injectable } from '@nestjs/common';
import { createHash, createHmac, randomBytes } from 'crypto';
import { IHashUtilityService } from '../../application/interfaces/services/hash-utility-service.interface';

@Injectable()
export class HashUtilityService implements IHashUtilityService {
  /**
   * Hash an IP address for privacy protection
   * Uses SHA-256 with a salt for consistent but privacy-preserving IP hashing
   * @param ipAddress The IP address to hash
   * @param salt Optional salt (if not provided, generates a new one)
   * @returns object containing the hash and salt used
   */
  hashIPAddress(ipAddress: string, salt?: string): { hash: string; salt: string } {
    const usedSalt = salt || randomBytes(16).toString('hex');
    const hash = createHmac('sha256', usedSalt).update(ipAddress).digest('hex');

    return {
      hash,
      salt: usedSalt,
    };
  }

  /**
   * Hash a string using SHA-256
   * @param data The data to hash
   * @returns string Hex-encoded SHA-256 hash
   */
  sha256(data: string): string {
    return createHash('sha256').update(data).digest('hex');
  }

  /**
   * Hash a string using SHA-512
   * @param data The data to hash
   * @returns string Hex-encoded SHA-512 hash
   */
  sha512(data: string): string {
    return createHash('sha512').update(data).digest('hex');
  }

  /**
   * Create an HMAC hash with a secret key
   * @param data The data to hash
   * @param secret The secret key
   * @param algorithm The hash algorithm (default: 'sha256')
   * @returns string Hex-encoded HMAC hash
   */
  hmac(data: string, secret: string, algorithm: string = 'sha256'): string {
    return createHmac(algorithm, secret).update(data).digest('hex');
  }

  /**
   * Hash a refresh token for secure storage
   * Uses SHA-256 to hash opaque refresh tokens before database storage
   * @param token The refresh token to hash
   * @returns string Hex-encoded hash suitable for database storage
   */
  hashRefreshToken(token: string): string {
    return this.sha256(token);
  }

  /**
   * Hash an email verification token for secure storage
   * @param token The email verification token to hash
   * @returns string Hex-encoded hash suitable for database storage
   */
  hashEmailVerificationToken(token: string): string {
    return this.sha256(token);
  }

  /**
   * Hash a password reset token for secure storage
   * @param token The password reset token to hash
   * @returns string Hex-encoded hash suitable for database storage
   */
  hashPasswordResetToken(token: string): string {
    return this.sha256(token);
  }

  /**
   * Generate a salt for hashing operations
   * @param lengthBytes Number of bytes for the salt (default: 16)
   * @returns string Hex-encoded salt
   */
  generateSalt(lengthBytes: number = 16): string {
    return randomBytes(lengthBytes).toString('hex');
  }

  /**
   * Hash data with a salt using SHA-256
   * @param data The data to hash
   * @param salt The salt to use
   * @returns string Hex-encoded salted hash
   */
  saltedHash(data: string, salt: string): string {
    return createHash('sha256')
      .update(data + salt)
      .digest('hex');
  }

  /**
   * Create a fingerprint hash for session tracking
   * Combines multiple data points to create a unique but privacy-preserving fingerprint
   * @param userAgent User agent string
   * @param ipAddress IP address
   * @param acceptLanguage Accept-Language header
   * @param acceptEncoding Accept-Encoding header
   * @param salt Optional salt for consistent hashing
   * @returns object containing fingerprint hash and salt
   */
  createSessionFingerprint(
    userAgent: string,
    ipAddress: string,
    acceptLanguage?: string,
    acceptEncoding?: string,
    salt?: string,
  ): { fingerprint: string; salt: string } {
    const usedSalt = salt || this.generateSalt();

    // Normalize inputs to reduce false negatives
    const normalizedUserAgent = userAgent.toLowerCase().trim();
    const normalizedLanguage = acceptLanguage?.toLowerCase().trim() || '';
    const normalizedEncoding = acceptEncoding?.toLowerCase().trim() || '';

    // Create fingerprint from combined normalized data
    const fingerprintData = [
      normalizedUserAgent,
      ipAddress,
      normalizedLanguage,
      normalizedEncoding,
    ].join('|');

    const fingerprint = createHmac('sha256', usedSalt).update(fingerprintData).digest('hex');

    return {
      fingerprint,
      salt: usedSalt,
    };
  }

  /**
   * Verify if a hash matches the original data
   * @param data The original data
   * @param hash The hash to verify against
   * @param salt The salt used (if applicable)
   * @returns boolean True if hash matches
   */
  verifyHash(data: string, hash: string, salt?: string): boolean {
    if (salt) {
      return this.saltedHash(data, salt) === hash;
    }
    return this.sha256(data) === hash;
  }

  /**
   * Create a rate limiting key hash
   * Used for rate limiting based on IP or user ID while maintaining privacy
   * @param identifier The identifier to hash (IP, user ID, etc.)
   * @param window The time window for rate limiting
   * @param salt Optional salt
   * @returns string Hash suitable for rate limiting keys
   */
  createRateLimitHash(identifier: string, window: string, salt?: string): string {
    const data = `${identifier}:${window}`;
    if (salt) {
      return this.hmac(data, salt);
    }
    return this.sha256(data);
  }
}
