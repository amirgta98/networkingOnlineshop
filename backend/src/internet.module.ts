import { Module, OnModuleInit } from '@nestjs/common';
import {
  InternetController,
  AdminInternetController,
} from './presentation/controllers/internet.controller.js';
import { InternetService } from './application/services/internet.service.js';
import { PrismaService } from './infrastructure/database/prisma/prisma.service.js';
import { JwtSessionService } from './infrastructure/auth/jwt-session.service.js';
import { OptionalAuthGuard } from './presentation/guards/optional-auth.guard.js';
import { AuthGuard } from './presentation/guards/auth.guard.js';
import { RolesGuard } from './presentation/guards/roles.guard.js';

@Module({
  controllers: [InternetController, AdminInternetController],
  providers: [
    PrismaService,
    InternetService,
    JwtSessionService,
    OptionalAuthGuard,
    AuthGuard,
    RolesGuard,
  ],
  exports: [InternetService],
})
export class InternetModule implements OnModuleInit {
  constructor(private readonly internetService: InternetService) {}

  async onModuleInit() {
    try {
      await this.internetService.seedInitialPlansAndSettingsIfEmpty();
    } catch (err) {
      console.error('Failed to seed internet initial plans and settings:', err);
    }
  }
}
