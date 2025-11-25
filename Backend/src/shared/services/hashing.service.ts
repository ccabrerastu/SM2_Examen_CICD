import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { IHashService } from '../../application/interfaces/services/hash-service.interface';

@Injectable()
export class HashingService implements IHashService {
  private readonly saltRounds = 12; // Minimum cost factor 12 as specified

  /**
   * Hash a password using bcrypt with secure cost factor
   * @param plainText The plain text password to hash
   * @returns Promise<string> The hashed password
   */
  async hash(plainText: string): Promise<string> {
    return await bcrypt.hash(plainText, this.saltRounds);
  }

  /**
   * Compare a plain text password with a hashed password
   * @param plainText The plain text password
   * @param hashedText The hashed password to compare against
   * @returns Promise<boolean> True if passwords match
   */
  async compare(plainText: string, hashedText: string): Promise<boolean> {
    return await bcrypt.compare(plainText, hashedText);
  }

  /**
   * Generate a cryptographically secure random token
   * @param length Number of bytes to generate (default: 32 for 256-bit)
   * @returns string Base64URL encoded secure random token
   */
  generateSecureToken(length: number = 32): string {
    return randomBytes(length).toString('base64url');
  }
}
