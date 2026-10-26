import { Module } from '@nestjs/common';
import { PrismaService } from './infrastructure/database/prisma/prisma.service.js';
import { JwtSessionService } from './infrastructure/auth/jwt-session.service.js';
import { SecurityMonitorService } from './infrastructure/services/security-monitor.service.js';
import { SecurityController } from './presentation/controllers/security.controller.js';
import { SecurityGateway } from './presentation/gateways/security.gateway.js';

@Module({
  controllers: [SecurityController],
  providers: [
    PrismaService,
    JwtSessionService,
    SecurityMonitorService,
    SecurityGateway,
  ],
  exports: [SecurityMonitorService, SecurityGateway],
})
export class SecurityModule {}
