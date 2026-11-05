import { Module } from '@nestjs/common';
import {
  SiteSettingsController,
  AdminSiteSettingsController,
} from './presentation/controllers/site-settings.controller.js';
import { SiteSettingsService } from './application/services/site-settings/site-settings.service.js';
import { PrismaService } from './infrastructure/database/prisma/prisma.service.js';
import { JwtSessionService } from './infrastructure/auth/jwt-session.service.js';
import { AuthGuard } from './presentation/guards/auth.guard.js';
import { RolesGuard } from './presentation/guards/roles.guard.js';

@Module({
  controllers: [SiteSettingsController, AdminSiteSettingsController],
  providers: [
    SiteSettingsService,
    PrismaService,
    JwtSessionService,
    AuthGuard,
    RolesGuard,
  ],
  exports: [SiteSettingsService],
})
export class SiteSettingsModule {}
