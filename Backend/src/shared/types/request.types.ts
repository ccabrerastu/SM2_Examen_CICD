import { Request } from 'express';

export interface AuthenticatedUser {
  userId?: string;
  email?: string;
  role?: string;
  id: string; // Required since payload.sub is always present
  tokenId: string; // Required since payload.jti is always present
  issuedAt?: Date;
  expiresAt?: Date;
}

export interface ExtendedRequest extends Request {
  realIP?: string;
  user?: AuthenticatedUser;
}

export interface AuthenticatedRequest extends ExtendedRequest {
  user: AuthenticatedUser;
}
