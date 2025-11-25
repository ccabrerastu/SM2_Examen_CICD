export abstract class DomainError extends Error {
  abstract readonly code: string;
  abstract readonly statusCode: number;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class PersonNotFoundError extends DomainError {
  readonly code = 'PERSON_NOT_FOUND';
  readonly statusCode = 404;

  constructor(id: string) {
    super(`Person with ID ${id} was not found`);
  }
}

export class PersonAlreadyExistsError extends DomainError {
  readonly code = 'PERSON_ALREADY_EXISTS';
  readonly statusCode = 409;

  constructor(email: string) {
    super(`Person with email ${email} already exists`);
  }
}

export class UserNotFoundError extends DomainError {
  readonly code = 'USER_NOT_FOUND';
  readonly statusCode = 404;

  constructor(id: string) {
    super(`User with ID ${id} was not found`);
  }
}

export class UserAlreadyExistsError extends DomainError {
  readonly code = 'USER_ALREADY_EXISTS';
  readonly statusCode = 409;

  constructor(identifier: string, type: 'email' | 'username' = 'email') {
    super(`User with ${type} ${identifier} already exists`);
  }
}

export class InvalidCredentialsError extends DomainError {
  readonly code = 'INVALID_CREDENTIALS';
  readonly statusCode = 401;

  constructor() {
    super('Invalid email or password');
  }
}

export class EmailNotVerifiedError extends DomainError {
  readonly code = 'EMAIL_NOT_VERIFIED';
  readonly statusCode = 403;

  constructor() {
    super('Email address is not verified');
  }
}

export class UserInactiveError extends DomainError {
  readonly code = 'USER_INACTIVE';
  readonly statusCode = 403;

  constructor() {
    super('User account is inactive');
  }
}

export class InvalidTokenError extends DomainError {
  readonly code = 'INVALID_TOKEN';
  readonly statusCode = 401;

  constructor(tokenType: string = 'token') {
    super(`Invalid or expired ${tokenType}`);
  }
}

export class UnauthorizedError extends DomainError {
  readonly code = 'UNAUTHORIZED';
  readonly statusCode = 401;

  constructor(message: string = 'Unauthorized access') {
    super(message);
  }
}

export class ForbiddenError extends DomainError {
  readonly code = 'FORBIDDEN';
  readonly statusCode = 403;

  constructor(message: string = 'Forbidden access') {
    super(message);
  }
}

export class ConflictException extends DomainError {
  readonly code = 'CONFLICT';
  readonly statusCode = 409;

  constructor(message: string = 'Conflict occurred') {
    super(message);
  }
}

export class ValidationException extends DomainError {
  readonly code = 'VALIDATION_ERROR';
  readonly statusCode = 400;

  constructor(message: string = 'Validation failed') {
    super(message);
  }
}
