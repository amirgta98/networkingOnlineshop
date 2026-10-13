import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module.js';
import { DomainExceptionFilter } from './presentation/filters/domain-exception.filter.js';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // 1. CORS Configuration for Secure Cookie & Frontend Access
  app.enableCors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
  });

  // 2. API Route Prefix
  app.setGlobalPrefix('api/v1');

  // 2.1 Static Uploads Serving
  const expressModule = (await import('express')).default;
  const pathModule = (await import('node:path')).default;
  const fsModule = (await import('node:fs')).default;
  const uploadsDir = fsModule.existsSync(pathModule.resolve(process.cwd(), 'backend'))
    ? pathModule.resolve(process.cwd(), 'backend', 'uploads')
    : pathModule.resolve(process.cwd(), 'uploads');
  if (!fsModule.existsSync(uploadsDir)) {
    fsModule.mkdirSync(uploadsDir, { recursive: true });
  }
  app.use('/uploads', expressModule.static(uploadsDir));

  // 3. Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // 4. Global Exception Filter (Domain exceptions -> HTTP status codes)
  app.useGlobalFilters(new DomainExceptionFilter());

  // 5. OpenAPI / Swagger Documentation
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Fonix Academic API | وب‌سرویس ققنوس آکادمی')
    .setDescription(
      'سامانه جامع تجهیزات شبکه و آکادمی تخصصی ققنوس آکادمی (Fonix Academic) - احراز هویت پیامکی امن و نشست‌های سازمانی',
    )
    .setVersion('1.0.0')
    .addTag('Authentication', 'Secure OTP and Session management endpoints')
    .addTag('Users', 'User management endpoints')
    .addTag('Products', 'مدیریت محصولات، آپلود و برش ۱:۱ تصاویر، واترمارک و ویژگی‌های داینامیک')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  // 6. Start Server
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') ?? 3001;
  await app.listen(port, '0.0.0.0');

  logger.log(`=======================================================`);
  logger.log(`🚀 Application running at:  http://localhost:${port}/api/v1`);
  logger.log(`📚 Swagger docs available:  http://localhost:${port}/api/docs`);
  logger.log(`=======================================================`);
}

await bootstrap();
