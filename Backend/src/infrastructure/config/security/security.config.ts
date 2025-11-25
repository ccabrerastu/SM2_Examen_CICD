import { registerAs } from '@nestjs/config';

export interface SecurityConfig {
  // CORS Configuration
  cors: {
    origins: string[];
    credentials: boolean;
    methods: string[];
    allowedHeaders: string[];
    exposedHeaders: string[];
    maxAge: number;
  };

  // Security Headers
  headers: {
    hsts: {
      maxAge: number;
      includeSubDomains: boolean;
      preload: boolean;
    };
    csp: {
      directives: Record<string, string[]>;
    };
    referrerPolicy: string;
    xFrameOptions: string;
    xContentTypeOptions: boolean;
    xXssProtection: string;
  };

  // CSRF Protection
  csrf: {
    enabled: boolean;
    cookie: {
      name: string;
      httpOnly: boolean;
      secure: boolean;
      sameSite: 'strict' | 'lax' | 'none';
      maxAge: number;
    };
  };

  // Rate Limiting
  rateLimit: {
    registration: {
      windowMs: number;
      max: number;
    };
    login: {
      windowMs: number;
      max: number;
      perAccount: {
        windowMs: number;
        max: number;
      };
    };
    forgotPassword: {
      windowMs: number;
      max: number;
    };
    tokenRefresh: {
      windowMs: number;
      max: number;
    };
    emailVerification: {
      windowMs: number;
      max: number;
    };
    general: {
      windowMs: number;
      max: number;
    };
  };

  // IP Extraction
  ipExtraction: {
    trustProxy: boolean;
    proxiedHeaders: string[];
    fallbackToRemoteAddr: boolean;
  };

  // Request Logging
  logging: {
    enabled: boolean;
    logRequests: boolean;
    logResponses: boolean;
    logHeaders: boolean;
    logBody: boolean;
    logIp: boolean;
    logUserAgent: boolean;
    excludePaths: string[];
    maxBodySize: number;
  };

  // Origin Validation
  originValidation: {
    strict: boolean;
    allowedOrigins: string[];
    requireOriginHeader: boolean;
    requireRefererHeader: boolean;
  };
}

export const securityConfig = registerAs(
  'security',
  (): SecurityConfig => ({
    // CORS Configuration
    cors: {
      origins: process.env.CORS_ORIGINS?.split(',') || [
        'http://localhost:3000',
        'http://localhost:3001',
      ],
      credentials: process.env.CORS_CREDENTIALS === 'true' || true,
      methods: process.env.CORS_METHODS?.split(',') || [
        'GET',
        'HEAD',
        'PUT',
        'PATCH',
        'POST',
        'DELETE',
        'OPTIONS',
      ],
      allowedHeaders: process.env.CORS_ALLOWED_HEADERS?.split(',') || [
        'Origin',
        'X-Requested-With',
        'Content-Type',
        'Accept',
        'Authorization',
        'X-CSRF-Token',
        'X-Forwarded-For',
      ],
      exposedHeaders: process.env.CORS_EXPOSED_HEADERS?.split(',') || [
        'X-Total-Count',
        'X-Page-Count',
      ],
      maxAge: parseInt(process.env.CORS_MAX_AGE || '86400', 10), // 24 hours
    },

    // Security Headers
    headers: {
      hsts: {
        maxAge: parseInt(process.env.HSTS_MAX_AGE || '31536000', 10), // 1 year
        includeSubDomains: process.env.HSTS_INCLUDE_SUBDOMAINS !== 'false',
        preload: process.env.HSTS_PRELOAD === 'true',
      },
      csp: {
        directives: {
          'default-src': ["'self'"],
          'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
          'style-src': ["'self'", "'unsafe-inline'"],
          'img-src': ["'self'", 'data:', 'https:'],
          'font-src': ["'self'", 'data:', 'https:'],
          'connect-src': ["'self'"],
          'object-src': ["'none'"],
          'frame-src': ["'none'"],
          'base-uri': ["'self'"],
          'form-action': ["'self'"],
        },
      },
      referrerPolicy: process.env.REFERRER_POLICY || 'strict-origin-when-cross-origin',
      xFrameOptions: process.env.X_FRAME_OPTIONS || 'DENY',
      xContentTypeOptions: process.env.X_CONTENT_TYPE_OPTIONS !== 'false',
      xXssProtection: process.env.X_XSS_PROTECTION || '1; mode=block',
    },

    // CSRF Protection
    csrf: {
      enabled: process.env.CSRF_ENABLED !== 'false',
      cookie: {
        name: process.env.CSRF_COOKIE_NAME || '_csrf',
        httpOnly: process.env.CSRF_HTTP_ONLY !== 'false',
        secure: process.env.NODE_ENV === 'production',
        sameSite: (process.env.CSRF_SAME_SITE as 'strict' | 'lax' | 'none') || 'strict',
        maxAge: parseInt(process.env.CSRF_MAX_AGE || '3600000', 10), // 1 hour
      },
    },

    // Rate Limiting (times in milliseconds)
    rateLimit: {
      registration: {
        windowMs: parseInt(process.env.RATE_LIMIT_REGISTRATION_WINDOW || '3600000', 10), // 1 hour
        max: parseInt(process.env.RATE_LIMIT_REGISTRATION_MAX || '3', 10),
      },
      login: {
        windowMs: parseInt(process.env.RATE_LIMIT_LOGIN_WINDOW || '60000', 10), // 1 minute
        max: parseInt(process.env.RATE_LIMIT_LOGIN_MAX || '5', 10),
        perAccount: {
          windowMs: parseInt(process.env.RATE_LIMIT_LOGIN_ACCOUNT_WINDOW || '3600000', 10), // 1 hour
          max: parseInt(process.env.RATE_LIMIT_LOGIN_ACCOUNT_MAX || '20', 10),
        },
      },
      forgotPassword: {
        windowMs: parseInt(process.env.RATE_LIMIT_FORGOT_PASSWORD_WINDOW || '3600000', 10), // 1 hour
        max: parseInt(process.env.RATE_LIMIT_FORGOT_PASSWORD_MAX || '3', 10),
      },
      tokenRefresh: {
        windowMs: parseInt(process.env.RATE_LIMIT_TOKEN_REFRESH_WINDOW || '300000', 10), // 5 minutes
        max: parseInt(process.env.RATE_LIMIT_TOKEN_REFRESH_MAX || '30', 10),
      },
      emailVerification: {
        windowMs: parseInt(process.env.RATE_LIMIT_EMAIL_VERIFICATION_WINDOW || '300000', 10), // 5 minutes
        max: parseInt(process.env.RATE_LIMIT_EMAIL_VERIFICATION_MAX || '10', 10),
      },
      general: {
        windowMs: parseInt(process.env.RATE_LIMIT_GENERAL_WINDOW || '900000', 10), // 15 minutes
        max: parseInt(process.env.RATE_LIMIT_GENERAL_MAX || '100', 10),
      },
    },

    // IP Extraction
    ipExtraction: {
      trustProxy: process.env.TRUST_PROXY === 'true',
      proxiedHeaders: process.env.PROXIED_HEADERS?.split(',') || [
        'X-Forwarded-For',
        'X-Real-IP',
        'X-Client-IP',
        'CF-Connecting-IP',
      ],
      fallbackToRemoteAddr: process.env.FALLBACK_TO_REMOTE_ADDR !== 'false',
    },

    // Request Logging
    logging: {
      enabled: process.env.SECURITY_LOGGING_ENABLED !== 'false',
      logRequests: process.env.LOG_REQUESTS !== 'false',
      logResponses: process.env.LOG_RESPONSES === 'true',
      logHeaders: process.env.LOG_HEADERS === 'true',
      logBody: process.env.LOG_BODY === 'true' && process.env.NODE_ENV === 'development',
      logIp: process.env.LOG_IP !== 'false',
      logUserAgent: process.env.LOG_USER_AGENT !== 'false',
      excludePaths: process.env.LOG_EXCLUDE_PATHS?.split(',') || ['/health', '/metrics'],
      maxBodySize: parseInt(process.env.LOG_MAX_BODY_SIZE || '1024', 10), // 1KB
    },

    // Origin Validation
    originValidation: {
      strict: process.env.ORIGIN_VALIDATION_STRICT !== 'false',
      allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || [
        'http://localhost:3000',
        'http://localhost:3001',
      ],
      requireOriginHeader: process.env.REQUIRE_ORIGIN_HEADER !== 'false',
      requireRefererHeader: process.env.REQUIRE_REFERER_HEADER === 'true',
    },
  }),
);
