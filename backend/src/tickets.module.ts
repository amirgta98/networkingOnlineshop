import { Module } from '@nestjs/common';
import { PrismaService } from './infrastructure/database/prisma/prisma.service.js';
import { JwtSessionService } from './infrastructure/auth/jwt-session.service.js';
import { AuthGuard } from './presentation/guards/auth.guard.js';
import { RolesGuard } from './presentation/guards/roles.guard.js';
import { TICKET_REPOSITORY_TOKEN } from './shared/constants/tokens.js';
import { InMemoryTicketRepository } from './infrastructure/database/in-memory/in-memory-ticket.repository.js';
import { PrismaTicketRepository } from './infrastructure/database/prisma/repositories/prisma-ticket.repository.js';
import {
  CreateTicketUseCase,
  GetUserTicketsUseCase,
  GetTicketByIdUseCase,
  GetAllTicketsUseCase,
  SendMessageUseCase,
  UpdateTicketStatusUseCase,
  UpdateTicketPriorityUseCase,
  UpdateTicketDepartmentUseCase,
  GetTicketMessagesUseCase,
} from './application/use-cases/ticket/ticket.use-cases.js';
import { TicketController } from './presentation/controllers/ticket.controller.js';
import { TicketGateway } from './presentation/gateways/ticket.gateway.js';

@Module({
  controllers: [TicketController],
  providers: [
    PrismaService,
    JwtSessionService,
    AuthGuard,
    RolesGuard,
    {
      provide: TICKET_REPOSITORY_TOKEN,
      useFactory: (prisma: PrismaService) => {
        if (process.env.USE_PRISMA_REPO === 'true' || (process.env.DATABASE_URL && process.env.NODE_ENV !== 'test')) {
          return new PrismaTicketRepository(prisma);
        }
        return new InMemoryTicketRepository();
      },
      inject: [PrismaService],
    },
    {
      provide: CreateTicketUseCase,
      useFactory: (repo: any) => new CreateTicketUseCase(repo),
      inject: [TICKET_REPOSITORY_TOKEN],
    },
    {
      provide: GetUserTicketsUseCase,
      useFactory: (repo: any) => new GetUserTicketsUseCase(repo),
      inject: [TICKET_REPOSITORY_TOKEN],
    },
    {
      provide: GetTicketByIdUseCase,
      useFactory: (repo: any) => new GetTicketByIdUseCase(repo),
      inject: [TICKET_REPOSITORY_TOKEN],
    },
    {
      provide: GetAllTicketsUseCase,
      useFactory: (repo: any) => new GetAllTicketsUseCase(repo),
      inject: [TICKET_REPOSITORY_TOKEN],
    },
    {
      provide: SendMessageUseCase,
      useFactory: (repo: any) => new SendMessageUseCase(repo),
      inject: [TICKET_REPOSITORY_TOKEN],
    },
    {
      provide: UpdateTicketStatusUseCase,
      useFactory: (repo: any) => new UpdateTicketStatusUseCase(repo),
      inject: [TICKET_REPOSITORY_TOKEN],
    },
    {
      provide: UpdateTicketPriorityUseCase,
      useFactory: (repo: any) => new UpdateTicketPriorityUseCase(repo),
      inject: [TICKET_REPOSITORY_TOKEN],
    },
    {
      provide: UpdateTicketDepartmentUseCase,
      useFactory: (repo: any) => new UpdateTicketDepartmentUseCase(repo),
      inject: [TICKET_REPOSITORY_TOKEN],
    },
    {
      provide: GetTicketMessagesUseCase,
      useFactory: (repo: any) => new GetTicketMessagesUseCase(repo),
      inject: [TICKET_REPOSITORY_TOKEN],
    },
    TicketGateway,
  ],
  exports: [TicketGateway],
})
export class TicketsModule {}
