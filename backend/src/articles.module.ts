import { Module } from '@nestjs/common';
import { ArticlesController } from './presentation/controllers/articles.controller.js';
import { ArticlesService } from './application/services/articles.service.js';
import { SharpImageProcessingService } from './infrastructure/services/sharp-image-processing.service.js';
import { IMAGE_PROCESSING_SERVICE_TOKEN } from './shared/constants/tokens.js';
import { JwtSessionService } from './infrastructure/auth/jwt-session.service.js';
import { AuthGuard } from './presentation/guards/auth.guard.js';
import { RolesGuard } from './presentation/guards/roles.guard.js';
import { OptionalAuthGuard } from './presentation/guards/optional-auth.guard.js';

import { PrismaService } from './infrastructure/database/prisma/prisma.service.js';

@Module({
  controllers: [ArticlesController],
  providers: [
    PrismaService,
    ArticlesService,
    JwtSessionService,
    AuthGuard,
    RolesGuard,
    OptionalAuthGuard,
    {
      provide: IMAGE_PROCESSING_SERVICE_TOKEN,
      useClass: SharpImageProcessingService,
    },
  ],
  exports: [ArticlesService],
})
export class ArticlesModule {}
