import { Module } from '@nestjs/common';
import { PaymentsController } from './presentation/controllers/payments.controller.js';
import { WalletController } from './presentation/controllers/wallet.controller.js';
import { ZarinpalPaymentService } from './infrastructure/payment/zarinpal.service.js';
import { RequestOrderPaymentUseCase } from './application/use-cases/payment/request-order-payment.use-case.js';
import { RequestWalletChargeUseCase } from './application/use-cases/payment/request-wallet-charge.use-case.js';
import { RequestInvoicePaymentUseCase } from './application/use-cases/payment/request-invoice-payment.use-case.js';
import { VerifyPaymentUseCase } from './application/use-cases/payment/verify-payment.use-case.js';
import { RequestWalletWithdrawalUseCase } from './application/use-cases/wallet/request-wallet-withdrawal.use-case.js';
import { GetAdminWithdrawalsUseCase } from './application/use-cases/wallet/get-admin-withdrawals.use-case.js';
import { GetAdminDepositsUseCase } from './application/use-cases/wallet/get-admin-deposits.use-case.js';
import { UpdateWithdrawalStatusUseCase } from './application/use-cases/wallet/update-withdrawal-status.use-case.js';
import { InMemoryPaymentRepository } from './infrastructure/database/in-memory/in-memory-payment.repository.js';
import { PrismaPaymentRepository } from './infrastructure/database/prisma/repositories/prisma-payment.repository.js';
import { PrismaService } from './infrastructure/database/prisma/prisma.service.js';
import {
  PAYMENT_REPOSITORY_TOKEN,
  ORDER_REPOSITORY_TOKEN,
  USER_REPOSITORY_TOKEN,
  INVOICE_REPOSITORY_TOKEN,
  ORDER_NOTIFICATION_SERVICE_TOKEN,
} from './shared/constants/tokens.js';
import type { IPaymentRepository } from './domain/repositories/payment.repository.interface.js';
import type { IOrderRepository } from './domain/repositories/order.repository.interface.js';
import type { IUserRepository } from './domain/repositories/user.repository.interface.js';
import type { IInvoiceRepository } from './domain/repositories/invoice.repository.interface.js';
import type { IOrderNotificationService } from './application/services/order-notification.service.interface.js';
import { AuthModule } from './auth.module.js';
import { UsersModule } from './users.module.js';
import { OrdersModule } from './orders.module.js';
import { InvoicesModule } from './invoices.module.js';

@Module({
  imports: [AuthModule, UsersModule, OrdersModule, InvoicesModule],
  controllers: [PaymentsController, WalletController],
  providers: [
    PrismaService,
    ZarinpalPaymentService,
    {
      provide: PAYMENT_REPOSITORY_TOKEN,
      useFactory: (prisma: PrismaService) => {
        if (
          process.env.USE_PRISMA_REPO === 'true' ||
          (process.env.DATABASE_URL && process.env.NODE_ENV !== 'test')
        ) {
          return new PrismaPaymentRepository(prisma);
        }
        return new InMemoryPaymentRepository();
      },
      inject: [PrismaService],
    },
    {
      provide: RequestOrderPaymentUseCase,
      useFactory: (
        orderRepo: IOrderRepository,
        paymentRepo: IPaymentRepository,
        zarinpal: ZarinpalPaymentService,
      ) => new RequestOrderPaymentUseCase(orderRepo, paymentRepo, zarinpal),
      inject: [ORDER_REPOSITORY_TOKEN, PAYMENT_REPOSITORY_TOKEN, ZarinpalPaymentService],
    },
    {
      provide: RequestWalletChargeUseCase,
      useFactory: (
        userRepo: IUserRepository,
        paymentRepo: IPaymentRepository,
        zarinpal: ZarinpalPaymentService,
      ) => new RequestWalletChargeUseCase(userRepo, paymentRepo, zarinpal),
      inject: [USER_REPOSITORY_TOKEN, PAYMENT_REPOSITORY_TOKEN, ZarinpalPaymentService],
    },
    {
      provide: RequestInvoicePaymentUseCase,
      useFactory: (
        invoiceRepo: IInvoiceRepository,
        paymentRepo: IPaymentRepository,
        zarinpal: ZarinpalPaymentService,
      ) => new RequestInvoicePaymentUseCase(invoiceRepo, paymentRepo, zarinpal),
      inject: [INVOICE_REPOSITORY_TOKEN, PAYMENT_REPOSITORY_TOKEN, ZarinpalPaymentService],
    },
    {
      provide: VerifyPaymentUseCase,
      useFactory: (
        paymentRepo: IPaymentRepository,
        orderRepo: IOrderRepository,
        userRepo: IUserRepository,
        invoiceRepo: IInvoiceRepository,
        zarinpal: ZarinpalPaymentService,
        orderNotif?: IOrderNotificationService,
      ) =>
        new VerifyPaymentUseCase(
          paymentRepo,
          orderRepo,
          userRepo,
          invoiceRepo,
          zarinpal,
          orderNotif,
        ),
      inject: [
        PAYMENT_REPOSITORY_TOKEN,
        ORDER_REPOSITORY_TOKEN,
        USER_REPOSITORY_TOKEN,
        INVOICE_REPOSITORY_TOKEN,
        ZarinpalPaymentService,
        ORDER_NOTIFICATION_SERVICE_TOKEN,
      ],
    },
    {
      provide: RequestWalletWithdrawalUseCase,
      useFactory: (userRepo: IUserRepository) => new RequestWalletWithdrawalUseCase(userRepo),
      inject: [USER_REPOSITORY_TOKEN],
    },
    {
      provide: GetAdminWithdrawalsUseCase,
      useFactory: (userRepo: IUserRepository) => new GetAdminWithdrawalsUseCase(userRepo),
      inject: [USER_REPOSITORY_TOKEN],
    },
    {
      provide: GetAdminDepositsUseCase,
      useFactory: (userRepo: IUserRepository) => new GetAdminDepositsUseCase(userRepo),
      inject: [USER_REPOSITORY_TOKEN],
    },
    {
      provide: UpdateWithdrawalStatusUseCase,
      useFactory: (userRepo: IUserRepository) => new UpdateWithdrawalStatusUseCase(userRepo),
      inject: [USER_REPOSITORY_TOKEN],
    },
  ],
  exports: [
    ZarinpalPaymentService,
    PAYMENT_REPOSITORY_TOKEN,
    RequestOrderPaymentUseCase,
    RequestWalletChargeUseCase,
    RequestInvoicePaymentUseCase,
    VerifyPaymentUseCase,
    RequestWalletWithdrawalUseCase,
    GetAdminWithdrawalsUseCase,
    GetAdminDepositsUseCase,
    UpdateWithdrawalStatusUseCase,
  ],
})
export class PaymentsModule {}
