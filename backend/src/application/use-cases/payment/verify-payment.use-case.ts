import { Injectable, Logger, NotFoundException, BadRequestException, ForbiddenException, Optional } from '@nestjs/common';
import type { IPaymentRepository } from '../../../domain/repositories/payment.repository.interface.js';
import type { IOrderRepository } from '../../../domain/repositories/order.repository.interface.js';
import type { IUserRepository } from '../../../domain/repositories/user.repository.interface.js';
import type { IInvoiceRepository } from '../../../domain/repositories/invoice.repository.interface.js';
import type { IOrderNotificationService } from '../../services/order-notification.service.interface.js';
import type { PrismaService } from '../../../infrastructure/database/prisma/prisma.service.js';
import { ZarinpalPaymentService } from '../../../infrastructure/payment/zarinpal.service.js';
import { PaymentStatus, PaymentType } from '../../../domain/entities/payment.entity.js';
import { OrderStatus } from '../../../domain/entities/order.entity.js';

export interface VerifyPaymentCommand {
  authority: string;
  status?: string; // 'OK' | 'NOK'
  amount?: number;
  type?: string;
  targetId?: string;
  userId?: string;
  trackingCode?: string;
}

export interface VerifyPaymentResult {
  success: boolean;
  trackingCode: string;
  refId?: string;
  cardPan?: string;
  type: string;
  targetId: string;
  orderNumber?: string;
  invoiceNumber?: string;
  amount: number;
  message: string;
}

@Injectable()
export class VerifyPaymentUseCase {
  private readonly logger = new Logger(VerifyPaymentUseCase.name);

  constructor(
    private readonly paymentRepository: IPaymentRepository,
    private readonly orderRepository: IOrderRepository,
    private readonly userRepository: IUserRepository,
    private readonly invoiceRepository: IInvoiceRepository,
    private readonly zarinpalService: ZarinpalPaymentService,
    @Optional()
    private readonly orderNotificationService?: IOrderNotificationService,
    @Optional()
    private readonly prisma?: PrismaService,
  ) {}

  async execute(command: VerifyPaymentCommand): Promise<VerifyPaymentResult> {
    const { authority, status } = command;

    if (!authority || typeof authority !== 'string' || authority.trim().length === 0) {
      throw new BadRequestException('شناسه تراکنش (Authority) الزامی است.');
    }

    const paymentTx = await this.paymentRepository.findByAuthority(authority);

    // Dynamic registration without a pre-existing transaction entity in the database is strictly disallowed.
    // Every valid payment must be initiated via the corresponding request use case.
    if (!paymentTx) {
      throw new BadRequestException(`تراکنش پرداختی با شناسه ${authority} نامعتبر است یا ثبت نشده است.`);
    }

    // Check if user cancelled in gateway
    if (status && status.toUpperCase() === 'NOK') {
      paymentTx.markAsCancelled();
      await this.paymentRepository.update(paymentTx);

      return {
        success: false,
        trackingCode: paymentTx.trackingCode,
        type: paymentTx.type,
        targetId: paymentTx.targetId,
        amount: paymentTx.amount,
        message: 'تراکنش پرداخت توسط کاربر در درگاه بانکی لغو گردید.',
      };
    }

    // Already verified
    if (paymentTx.status === PaymentStatus.SUCCESS && paymentTx.refId) {
      return {
        success: true,
        trackingCode: paymentTx.trackingCode,
        refId: paymentTx.refId,
        cardPan: paymentTx.cardPan || undefined,
        type: paymentTx.type,
        targetId: paymentTx.targetId,
        amount: paymentTx.amount,
        message: 'این تراکنش قبلاً با موفقیت تأیید شده است.',
      };
    }

    // Verify with ZarinPal API
    const verifyResult = await this.zarinpalService.verifyPayment({
      amount: paymentTx.amount,
      authority,
    });

    if (!verifyResult.success || !verifyResult.refId) {
      const errorMsg = verifyResult.message || 'خطا در تایید تراکنش در درگاه زرین‌پال';
      paymentTx.markAsFailed(errorMsg);
      await this.paymentRepository.update(paymentTx);

      return {
        success: false,
        trackingCode: paymentTx.trackingCode,
        type: paymentTx.type,
        targetId: paymentTx.targetId,
        amount: paymentTx.amount,
        message: errorMsg,
      };
    }

    // Success! Update payment transaction entity
    paymentTx.markAsSuccessful(verifyResult.refId, verifyResult.cardPan, verifyResult.cardHash);
    await this.paymentRepository.update(paymentTx);

    let orderNumber: string | undefined;
    let invoiceNumber: string | undefined;

    // Handle fulfillment based on PaymentType
    if (paymentTx.type === PaymentType.INTERNET_ORDER) {
      if (this.prisma) {
        try {
          const internetOrder = await this.prisma.internetOrder.findFirst({
            where: {
              OR: [{ id: paymentTx.targetId }, { trackingCode: paymentTx.targetId }],
            },
            include: { plan: true, user: true },
          });

          if (internetOrder) {
            orderNumber = internetOrder.trackingCode;
            await this.prisma.internetOrder.update({
              where: { id: internetOrder.id },
              data: {
                status: 'ACTIVE',
                notes: `${internetOrder.notes ? internetOrder.notes + ' | ' : ''}پرداخت آنلاین شاپرک تایید شد (شماره ارجاع: ${verifyResult.refId})`,
              },
            });

            // Credit partner commission if applicable
            if (Number(internetOrder.partnerCommission) > 0 && internetOrder.userId) {
              try {
                await this.prisma.wallet.upsert({
                  where: { userId: internetOrder.userId },
                  create: {
                    userId: internetOrder.userId,
                    balance: Number(internetOrder.partnerCommission),
                    currency: 'IRT',
                  },
                  update: {
                    balance: { increment: Number(internetOrder.partnerCommission) },
                  },
                });
              } catch (commErr) {
                this.logger.warn(`Failed to credit partner commission: ${commErr}`);
              }
            }
          }
        } catch (intErr) {
          this.logger.warn(`Failed to process internet order payment: ${intErr}`);
        }
      }
    } else if (paymentTx.type === PaymentType.ORDER) {
      const order = await this.orderRepository.findById(paymentTx.targetId);
      if (order) {
        orderNumber = order.orderNumber;
        await this.orderRepository.updateStatus(order.id, OrderStatus.PROCESSING_WAREHOUSE);

        // Find associated invoice if exists and mark as paid
        try {
          const invoices = await this.invoiceRepository.findAll({ search: order.orderNumber });
          if (invoices && invoices.length > 0) {
            const inv = invoices[0];
            inv.markAsPaid();
            await this.invoiceRepository.save(inv);
            invoiceNumber = inv.invoiceNumber;
          }
        } catch {
          // ignore
        }

        // Notify admins and customer
        if (this.orderNotificationService) {
          try {
            await this.orderNotificationService.notifyAdminsOfNewOrder(order);
          } catch (e) {
            this.logger.warn(`Failed to notify admins of paid order: ${(e as any)?.message}`);
          }
        }
      } else if (this.prisma) {
        try {
          const internetOrder = await this.prisma.internetOrder.findUnique({
            where: { id: paymentTx.targetId },
            include: { plan: true, user: true },
          });

          if (internetOrder) {
            orderNumber = internetOrder.trackingCode;
            await this.prisma.internetOrder.update({
              where: { id: internetOrder.id },
              data: {
                status: 'ACTIVE',
                notes: `${internetOrder.notes ? internetOrder.notes + ' | ' : ''}پرداخت آنلاین شاپرک تایید شد (شماره ارجاع: ${verifyResult.refId})`,
              },
            });

            // Credit partner commission if applicable
            if (Number(internetOrder.partnerCommission) > 0 && internetOrder.userId) {
              try {
                await this.prisma.wallet.upsert({
                  where: { userId: internetOrder.userId },
                  create: {
                    userId: internetOrder.userId,
                    balance: Number(internetOrder.partnerCommission),
                    currency: 'IRT',
                  },
                  update: {
                    balance: { increment: Number(internetOrder.partnerCommission) },
                  },
                });
              } catch (commErr) {
                this.logger.warn(`Failed to credit partner commission: ${commErr}`);
              }
            }
          }
        } catch (intErr) {
          this.logger.warn(`Failed to process internet order payment: ${intErr}`);
        }
      }
    } else if (paymentTx.type === PaymentType.WALLET) {
      if (!paymentTx.userId) {
        this.logger.error(`Cannot credit wallet: Payment transaction ${paymentTx.id} has no associated userId.`);
        throw new BadRequestException('تراکنش شارژ کیف پول فاقد شناسه کاربر است.');
      }

      // If an explicit userId was supplied in command, ensure it belongs to the authenticated user of the transaction
      if (command.userId && command.userId !== paymentTx.userId) {
        this.logger.error(
          `Security violation: User ${command.userId} attempted to verify wallet transaction belonging to ${paymentTx.userId}`,
        );
        throw new ForbiddenException('شما مجاز به تأیید تراکنش شارژ کیف پول کاربر دیگری نیستید.');
      }

      const user = await this.userRepository.findById(paymentTx.userId);
      if (!user) {
        this.logger.error(`Cannot credit wallet: User ${paymentTx.userId} does not exist in database.`);
        throw new NotFoundException('کاربر مربوط به تراکنش شارژ کیف پول یافت نشد.');
      }

      try {
        await this.userRepository.creditUserWallet(
          paymentTx.userId,
          paymentTx.amount,
          paymentTx.trackingCode,
          verifyResult.refId,
        );
        this.logger.log(
          `[Wallet] Successfully credited ${paymentTx.amount} IRT to user ${paymentTx.userId} (RefId: ${verifyResult.refId})`,
        );
      } catch (e) {
        this.logger.error(`Error crediting wallet for user ${paymentTx.userId}: ${(e as any)?.message}`);
        throw e;
      }
    } else if (paymentTx.type === PaymentType.INVOICE) {
      const invoice = await this.invoiceRepository.findById(paymentTx.targetId);
      if (invoice) {
        invoiceNumber = invoice.invoiceNumber;
        invoice.markAsPaid();
        await this.invoiceRepository.save(invoice);
      }
    }

    const isInternet = Boolean(orderNumber && orderNumber.startsWith('NET-ISP-'));

    return {
      success: true,
      trackingCode: paymentTx.trackingCode,
      refId: verifyResult.refId,
      cardPan: verifyResult.cardPan,
      type: isInternet ? 'INTERNET_ORDER' : paymentTx.type,
      targetId: paymentTx.targetId,
      orderNumber,
      invoiceNumber,
      amount: paymentTx.amount,
      message: isInternet
        ? 'پرداخت اشتراک اینترنت سازمانی با موفقیت انجام شد و سرویس فعال گردید.'
        : 'پرداخت با موفقیت در درگاه زرین‌پال تأیید گردید.',
    };
  }
}
