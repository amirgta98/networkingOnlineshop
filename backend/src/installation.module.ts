import { Module, OnModuleInit } from '@nestjs/common';
import { InstallationController } from './presentation/controllers/installation.controller.js';
import { InstallationService } from './application/services/installation.service.js';
import { PrismaService } from './infrastructure/database/prisma/prisma.service.js';
import { JwtSessionService } from './infrastructure/auth/jwt-session.service.js';
import { OptionalAuthGuard } from './presentation/guards/optional-auth.guard.js';
import { AuthGuard } from './presentation/guards/auth.guard.js';
import { RolesGuard } from './presentation/guards/roles.guard.js';
import { USER_REPOSITORY_TOKEN } from './shared/constants/tokens.js';
import { PrismaUserRepository } from './infrastructure/database/prisma/repositories/prisma-user.repository.js';

@Module({
  controllers: [InstallationController],
  providers: [
    PrismaService,
    InstallationService,
    JwtSessionService,
    OptionalAuthGuard,
    AuthGuard,
    RolesGuard,
    {
      provide: USER_REPOSITORY_TOKEN,
      useClass: PrismaUserRepository,
    },
  ],
  exports: [InstallationService],
})
export class InstallationModule implements OnModuleInit {
  constructor(private readonly installationService: InstallationService) {}

  async onModuleInit() {
    try {
      await this.installationService.seedInitialDemoDataIfEmpty();
    } catch (err) {
      console.error('Failed to seed installation demo data:', err);
    }
  }
}
