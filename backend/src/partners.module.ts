import { Module } from '@nestjs/common';
import {
  PartnersController,
  AdminPartnersController,
} from './presentation/controllers/partners.controller.js';
import { PartnersService } from './application/services/partners.service.js';
import { PrismaService } from './infrastructure/database/prisma/prisma.service.js';
import { JwtSessionService } from './infrastructure/auth/jwt-session.service.js';
import { OptionalAuthGuard } from './presentation/guards/optional-auth.guard.js';
import { AuthGuard } from './presentation/guards/auth.guard.js';

@Module({
  controllers: [PartnersController, AdminPartnersController],
  providers: [
    PrismaService,
    PartnersService,
    JwtSessionService,
    OptionalAuthGuard,
    AuthGuard,
  ],
  exports: [PartnersService],
})
export class PartnersModule {}
