import { Module } from '@nestjs/common';
import { CareersController } from './presentation/controllers/careers/careers.controller.js';
import { CareersService } from './application/services/careers/careers.service.js';
import { PrismaService } from './infrastructure/database/prisma/prisma.service.js';
import { JwtSessionService } from './infrastructure/auth/jwt-session.service.js';
import { AuthGuard } from './presentation/guards/auth.guard.js';
import { RolesGuard } from './presentation/guards/roles.guard.js';
import { OptionalAuthGuard } from './presentation/guards/optional-auth.guard.js';

@Module({
  controllers: [CareersController],
  providers: [
    PrismaService,
    CareersService,
    JwtSessionService,
    AuthGuard,
    RolesGuard,
    OptionalAuthGuard,
  ],
  exports: [CareersService],
})
export class CareersModule {}
