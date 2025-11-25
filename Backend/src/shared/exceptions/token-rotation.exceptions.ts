import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Base exception for token rotation operations
 */
export class TokenRotationException extends HttpException {
  constructor(message: string, status: HttpStatus = HttpStatus.UNAUTHORIZED) {
    super(message, status);
    this.name = 'TokenRotationException';
  }
}

/**
 * Thrown when a token is not found or invalid
 */
export class InvalidTokenException extends TokenRotationException {
  constructor(message: string = 'Invalid or expired token') {
    super(message, HttpStatus.UNAUTHORIZED);
    this.name = 'InvalidTokenException';
  }
}

/**
 * Thrown when token reuse is detected
 */
export class TokenReuseDetectedException extends TokenRotationException {
  public readonly familyId: string;
  public readonly tokenHash: string;

  constructor(
    familyId: string,
    tokenHash: string,
    message: string = 'Token reuse detected - security violation',
  ) {
    super(message, HttpStatus.UNAUTHORIZED);
    this.name = 'TokenReuseDetectedException';
    this.familyId = familyId;
    this.tokenHash = tokenHash;
  }
}

/**
 * Thrown when a token family has been compromised
 */
export class TokenFamilyCompromisedException extends TokenRotationException {
  public readonly familyId: string;
  public readonly userId: string;

  constructor(
    familyId: string,
    userId: string,
    message: string = 'Token family has been compromised',
  ) {
    super(message, HttpStatus.UNAUTHORIZED);
    this.name = 'TokenFamilyCompromisedException';
    this.familyId = familyId;
    this.userId = userId;
  }
}

/**
 * Thrown when token rotation fails
 */
export class TokenRotationFailedException extends TokenRotationException {
  constructor(message: string = 'Failed to rotate token') {
    super(message, HttpStatus.INTERNAL_SERVER_ERROR);
    this.name = 'TokenRotationFailedException';
  }
}

/**
 * Thrown when attempting to create a token family that already exists
 */
export class TokenFamilyConflictException extends TokenRotationException {
  public readonly familyId: string;

  constructor(familyId: string, message: string = 'Token family already exists') {
    super(message, HttpStatus.CONFLICT);
    this.name = 'TokenFamilyConflictException';
    this.familyId = familyId;
  }
}

/**
 * Thrown when maximum token families per user is exceeded
 */
export class TokenFamilyLimitExceededException extends TokenRotationException {
  public readonly userId: string;
  public readonly currentCount: number;
  public readonly maxAllowed: number;

  constructor(userId: string, currentCount: number, maxAllowed: number, message?: string) {
    const defaultMessage = `Maximum token families exceeded for user. Current: ${currentCount}, Max: ${maxAllowed}`;
    super(message || defaultMessage, HttpStatus.TOO_MANY_REQUESTS);
    this.name = 'TokenFamilyLimitExceededException';
    this.userId = userId;
    this.currentCount = currentCount;
    this.maxAllowed = maxAllowed;
  }
}

/**
 * Thrown when rate limiting is triggered for token operations
 */
export class TokenOperationRateLimitedException extends TokenRotationException {
  public readonly identifier: string;
  public readonly retryAfter: number;

  constructor(
    identifier: string,
    retryAfter: number,
    message: string = 'Token operation rate limit exceeded',
  ) {
    super(message, HttpStatus.TOO_MANY_REQUESTS);
    this.name = 'TokenOperationRateLimitedException';
    this.identifier = identifier;
    this.retryAfter = retryAfter;
  }
}
