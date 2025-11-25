import { registerAs } from '@nestjs/config';

export interface AppConfig {
  nodeEnv: 'development' | 'production' | 'test';
  port: number;
  apiPrefix: string;
  corsOrigin: string[];
  trustProxy: boolean;
  enableSecurityMiddleware: boolean;
  enableRateLimiting: boolean;
}

export const appConfig = registerAs(
  'app',
  (): AppConfig => ({
    nodeEnv: (process.env.NODE_ENV as 'development' | 'production' | 'test') || 'development',
    port: parseInt(process.env.PORT || '3000', 10),
    apiPrefix: process.env.API_PREFIX || 'api/v1',
    corsOrigin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
    trustProxy: process.env.TRUST_PROXY === 'true',
    enableSecurityMiddleware: process.env.ENABLE_SECURITY_MIDDLEWARE !== 'false',
    enableRateLimiting: process.env.ENABLE_RATE_LIMITING !== 'false',
  }),
);
