export interface IHashUtilityService {
  hashIPAddress(ipAddress: string, salt?: string): { hash: string; salt: string };
  sha256(data: string): string;
  sha512(data: string): string;
  hmac(data: string, secret: string, algorithm?: string): string;
  hashRefreshToken(token: string): string;
  hashEmailVerificationToken(token: string): string;
  hashPasswordResetToken(token: string): string;
  generateSalt(lengthBytes?: number): string;
  saltedHash(data: string, salt: string): string;
  createSessionFingerprint(
    userAgent: string,
    ipAddress: string,
    acceptLanguage?: string,
    acceptEncoding?: string,
    salt?: string,
  ): { fingerprint: string; salt: string };
  verifyHash(data: string, hash: string, salt?: string): boolean;
  createRateLimitHash(identifier: string, window: string, salt?: string): string;
}
