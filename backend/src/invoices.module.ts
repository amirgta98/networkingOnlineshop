import { Module } from '@nestjs/common';
import { InvoiceController } from './presentation/controllers/invoice.controller.js';
import { CreateInvoiceUseCase } from './application/use-cases/invoice/create-invoice.use-case.js';
import { GetUserInvoicesUseCase } from './application/use-cases/invoice/get-user-invoices.use-case.js';
import { GetInvoiceByIdUseCase } from './application/use-cases/invoice/get-invoice-by-id.use-case.js';
import { GetAllInvoicesUseCase } from './application/use-cases/invoice/get-all-invoices.use-case.js';
import { ApproveOfficialInvoiceUseCase } from './application/use-cases/invoice/approve-official-invoice.use-case.js';
import { RejectOfficialInvoiceUseCase } from './application/use-cases/invoice/reject-official-invoice.use-case.js';
import { InMemoryInvoiceRepository } from './infrastructure/database/in-memory/in-memory-invoice.repository.js';
import { PrismaInvoiceRepository } from './infrastructure/database/prisma/repositories/prisma-invoice.repository.js';
import { PrismaService } from './infrastructure/database/prisma/prisma.service.js';
import { AuthModule } from './auth.module.js';
import { INVOICE_REPOSITORY_TOKEN } from './shared/constants/tokens.js';
import type { IInvoiceRepository } from './domain/repositories/invoice.repository.interface.js';

@Module({
  imports: [AuthModule],
  controllers: [InvoiceController],
  providers: [
    PrismaService,
    {
      provide: INVOICE_REPOSITORY_TOKEN,
      useFactory: (prisma: PrismaService) => {
        if (process.env.USE_PRISMA_REPO === 'true' || (process.env.DATABASE_URL && process.env.NODE_ENV !== 'test')) {
          return new PrismaInvoiceRepository(prisma);
        }
        return new InMemoryInvoiceRepository();
      },
      inject: [PrismaService],
    },
    {
      provide: CreateInvoiceUseCase,
      useFactory: (repo: IInvoiceRepository) => new CreateInvoiceUseCase(repo),
      inject: [INVOICE_REPOSITORY_TOKEN],
    },
    {
      provide: GetUserInvoicesUseCase,
      useFactory: (repo: IInvoiceRepository) => new GetUserInvoicesUseCase(repo),
      inject: [INVOICE_REPOSITORY_TOKEN],
    },
    {
      provide: GetInvoiceByIdUseCase,
      useFactory: (repo: IInvoiceRepository) => new GetInvoiceByIdUseCase(repo),
      inject: [INVOICE_REPOSITORY_TOKEN],
    },
    {
      provide: GetAllInvoicesUseCase,
      useFactory: (repo: IInvoiceRepository) => new GetAllInvoicesUseCase(repo),
      inject: [INVOICE_REPOSITORY_TOKEN],
    },
    {
      provide: ApproveOfficialInvoiceUseCase,
      useFactory: (repo: IInvoiceRepository) => new ApproveOfficialInvoiceUseCase(repo),
      inject: [INVOICE_REPOSITORY_TOKEN],
    },
    {
      provide: RejectOfficialInvoiceUseCase,
      useFactory: (repo: IInvoiceRepository) => new RejectOfficialInvoiceUseCase(repo),
      inject: [INVOICE_REPOSITORY_TOKEN],
    },
  ],
  exports: [
    INVOICE_REPOSITORY_TOKEN,
    CreateInvoiceUseCase,
    GetUserInvoicesUseCase,
    GetInvoiceByIdUseCase,
    GetAllInvoicesUseCase,
    ApproveOfficialInvoiceUseCase,
    RejectOfficialInvoiceUseCase,
  ],
})
export class InvoicesModule {}
