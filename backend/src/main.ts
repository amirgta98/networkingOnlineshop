import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module.js';
import { DomainExceptionFilter } from './presentation/filters/domain-exception.filter.js';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // 1. API Route Prefix
  app.setGlobalPrefix('api/v1');

  // 2. Global Validation Pipe
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

  // 3. Global Exception Filter (Domain exceptions -> HTTP status codes)
  app.useGlobalFilters(new DomainExceptionFilter());

  // 4. OpenAPI / Swagger Documentation
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Clean Architecture NestJS API')
    .setDescription(
      'Production-ready Clean Architecture backend foundation built with NestJS and TypeScript',
    )
    .setVersion('1.0.0')
    .addTag('Users', 'User management endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  // 5. Start Server
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') ?? 3001;
  await app.listen(port);

  logger.log(`=======================================================`);
  logger.log(`🚀 Application running at:  http://localhost:${port}/api/v1`);
  logger.log(`📚 Swagger docs available:  http://localhost:${port}/api/docs`);
  logger.log(`=======================================================`);
}

await bootstrap();
