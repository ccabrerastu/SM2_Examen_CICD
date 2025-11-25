import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './shared/filters/global-exception.filter';
import { SecurityMiddleware } from './shared/middleware/security.middleware';
import { CorsMiddleware } from './shared/middleware/cors.middleware';
import { DeviceDetectionMiddleware } from './shared/middleware/device-detection.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Trust proxy if configured
  if (configService.get<boolean>('app.trustProxy')) {
    app.getHttpAdapter().getInstance().set('trust proxy', 1);
  }

  // Cookie parser middleware (required for CSRF protection)
  app.use(cookieParser());

  // Security middleware (should be first)
  if (configService.get<boolean>('app.enableSecurityMiddleware')) {
    app.use(new SecurityMiddleware(configService).use.bind(new SecurityMiddleware(configService)));
  }

  // CORS middleware (should be before other middleware)
  app.use(new CorsMiddleware(configService).use.bind(new CorsMiddleware(configService)));

  // Device detection middleware
  app.use(new DeviceDetectionMiddleware().use.bind(new DeviceDetectionMiddleware()));

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global filters
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Disable default CORS as we handle it with custom middleware
  // CORS is now handled by CorsMiddleware above

  // API prefix
  const apiPrefix = configService.get<string>('app.apiPrefix');
  if (apiPrefix) {
    app.setGlobalPrefix(apiPrefix);
  }

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('English Learning App API')
    .setDescription('API documentation for English Learning App Backend')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Start server
  const port = configService.get<number>('app.port') || 3000;
  await app.listen(port);

  console.log(`🚀 Server is running on: http://localhost:${port}`);
  console.log(`📚 Swagger docs available at: http://localhost:${port}/api/docs`);
}

bootstrap();
