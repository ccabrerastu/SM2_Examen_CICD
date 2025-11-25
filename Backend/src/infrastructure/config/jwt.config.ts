import { registerAs } from '@nestjs/config';

export interface JwtConfig {
  accessTokenSecret: string;
  accessTokenExpiresIn: string;
  refreshTokenSecret: string;
  refreshTokenExpiresIn: string;
  issuer: string;
  audience: string;
  keyId?: string | undefined;
  algorithm: string;
}

export const jwtConfig = registerAs(
  'jwt',
  (): JwtConfig => ({
    accessTokenSecret:
      process.env.JWT_ACCESS_SECRET || 'default-access-secret-change-in-production',
    accessTokenExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshTokenSecret:
      process.env.JWT_REFRESH_SECRET || 'default-refresh-secret-change-in-production',
    refreshTokenExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    issuer: process.env.JWT_ISSUER || 'english-app-backend',
    audience: process.env.JWT_AUDIENCE || 'english-app-client',
    keyId: process.env.JWT_KEY_ID, // Optional for key rotation
    algorithm: process.env.JWT_ALGORITHM || 'HS256',
  }),
);
