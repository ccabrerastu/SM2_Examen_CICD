export interface TokenInfo {
  token: string;
  expiresAt: Date;
}

export interface ITokenGenerationService {
  generateOpaqueRefreshToken(): string;
  generateEmailVerificationToken(expirationHours?: number): TokenInfo;
  generatePasswordResetToken(expirationHours?: number): TokenInfo;
  generateSecureToken(lengthBytes?: number, encoding?: BufferEncoding): string;
  generateTokenWithExpiration(lengthBytes?: number, expirationMinutes?: number): TokenInfo;
  generateNumericOTP(length?: number): string;
  isTokenValid(expiresAt: Date): boolean;
}
