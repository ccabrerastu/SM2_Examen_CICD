import * as jwt from 'jsonwebtoken';
import { JwtPayload } from '../../../shared/services/jwt.service';

export interface IJwtService {
  // Enhanced methods with proper JWT claims
  createAccessToken(userId: string, role: string, email?: string): Promise<string>;
  createRefreshToken(userId: string, role: string): Promise<string>;
  verify(token: string): Promise<JwtPayload>;
  verifyRefreshToken(token: string): Promise<JwtPayload>;
  decode(token: string): jwt.Jwt | null;

  // Legacy method for backward compatibility
  sign(payload: object, options?: { expiresIn?: string }): Promise<string>;

  // Utility methods
  getAccessTokenExpirationTime(): number;
  getRefreshTokenExpirationTime(): number;
}
