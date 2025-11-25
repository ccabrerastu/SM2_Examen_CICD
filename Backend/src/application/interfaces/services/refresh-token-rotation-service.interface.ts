export interface TokenRotationResult {
  oldToken: {
    jti: string;
    familyId: string;
    revoked: boolean;
  };
  newToken: {
    jti: string;
    tokenHash: string;
    expiresAt: Date;
    familyId: string;
  };
}

import { JwtPayload } from '../../../shared/services/jwt.service';

export interface TokenValidationResult {
  isValid: boolean;
  token?: JwtPayload;
  reason?: string;
  shouldRevokeFamily?: boolean;
}

export interface TokenFamilyInfo {
  familyId: string;
  userId: string;
  deviceInfo?: string | null;
  userAgent?: string | null;
  ipHash?: string | null;
  createdAt?: Date;
  lastUsedAt?: Date;
}

export interface RotationContext {
  deviceInfo?: string | undefined;
  userAgent?: string | undefined;
  ipAddress?: string | undefined;
  reason?: string;
}

export interface IRefreshTokenRotationService {
  /**
   * Rotates a refresh token by invalidating the old one and creating a new one
   * @param oldTokenHash Hash of the token to be rotated
   * @param context Additional context for the rotation
   * @returns Promise with rotation result containing old and new token information
   */
  rotateToken(oldTokenHash: string, context?: RotationContext): Promise<TokenRotationResult>;

  /**
   * Validates a presented token and rotates it if valid
   * @param presentedToken The raw token being presented
   * @param context Additional context for validation and rotation
   * @returns Promise with validation and rotation result
   */
  validateAndRotateToken(
    presentedToken: string,
    context?: RotationContext,
  ): Promise<TokenValidationResult & { rotation?: TokenRotationResult }>;

  /**
   * Detects if a token is being reused (already rotated/revoked)
   * @param tokenHash Hash of the token to check
   * @returns Promise indicating if reuse was detected
   */
  detectTokenReuse(tokenHash: string): Promise<boolean>;

  /**
   * Revokes all tokens in a family due to security incident
   * @param familyId ID of the token family to revoke
   * @param reason Reason for revocation
   * @returns Promise with count of revoked tokens
   */
  revokeFamilyTokens(familyId: string, reason: string): Promise<number>;

  /**
   * Revokes all tokens for a user
   * @param userId ID of the user whose tokens should be revoked
   * @param reason Reason for revocation
   * @returns Promise with count of revoked tokens
   */
  revokeUserTokens(userId: string, reason: string): Promise<number>;

  /**
   * Creates a new token family for device/session management
   * @param userId ID of the user
   * @param deviceInfo Device information
   * @param userAgent User agent string
   * @param ipAddress IP address (will be hashed)
   * @returns Promise with family information
   */
  createTokenFamily(
    userId: string,
    deviceInfo?: string,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<TokenFamilyInfo>;

  /**
   * Gets active token families for a user
   * @param userId ID of the user
   * @returns Promise with array of active families
   */
  getActiveFamilies(userId: string): Promise<TokenFamilyInfo[]>;

  /**
   * Validates token expiration
   * @param expiresAt Expiration date to check
   * @returns Boolean indicating if token is expired
   */
  isTokenExpired(expiresAt: Date): boolean;

  /**
   * Cleans up expired tokens (background task)
   * @returns Promise with count of cleaned tokens
   */
  cleanupExpiredTokens(): Promise<number>;
}
