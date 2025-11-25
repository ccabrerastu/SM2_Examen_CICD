import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { SecurityMiddleware } from './middleware/security.middleware';
import { CorsMiddleware } from './middleware/cors.middleware';
import { CSRFGuard } from './guards/csrf.guard';
import { EnhancedJwtGuard } from './guards/enhanced-jwt.guard';
import { OriginValidationGuard } from './guards/origin-validation.guard';
import { RateLimitGuard } from './guards/rate-limit.guard';
import { JwtService } from './services/jwt.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    // Middleware
    SecurityMiddleware,
    CorsMiddleware,

    // Guards
    CSRFGuard,
    EnhancedJwtGuard,
    OriginValidationGuard,
    RateLimitGuard,

    // Services
    JwtService,

    // Global guards registration
    {
      provide: APP_GUARD,
      useClass: EnhancedJwtGuard,
    },
    {
      provide: APP_GUARD,
      useClass: OriginValidationGuard,
    },
    {
      provide: APP_GUARD,
      useClass: CSRFGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RateLimitGuard,
    },
  ],
  exports: [
    // Export for use in other modules
    SecurityMiddleware,
    CorsMiddleware,
    CSRFGuard,
    EnhancedJwtGuard,
    OriginValidationGuard,
    RateLimitGuard,
    JwtService,
  ],
})
export class SecurityModule {}
