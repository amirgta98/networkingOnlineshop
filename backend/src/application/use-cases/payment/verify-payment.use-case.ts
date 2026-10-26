import { randomUUID } from 'node:crypto';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import type { IPaymentRepository } from '../../../domain/repositories/payment.repository.interface.js';
import type { IOrderRepository } from '../../../domain/repositories/order.repository.interface.js';
import type { IUserRepository } from '../../../domain/repositories/user.repository.interface.js';
import type { IInvoiceRepository } from '../../../domain/repositories/invoice.repository.interface.js';
import type { IOrderNotificationService } from '../../services/order-notification.service.interface.js';
import { ZarinpalPaymentService } from '../../../infrastructure/payment/zarinpal.service.js';
import { PaymentStatus, PaymentType, PaymentTransactionEntity } from '../../../domain/entities/payment.entity.js';
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
    private readonly orderNotificationService?: IOrderNotificationService,
  ) {}

  async execute(command: VerifyPaymentCommand): Promise<VerifyPaymentResult> {
    const { authority, status } = command;

    let paymentTx = await this.paymentRepository.findByAuthority(authority);

    // If transaction wasn't pre-registered in DB (e.g. initiated by Next.js API route), register it dynamically
    if (!paymentTx && command.amount && command.type) {
      let resolvedUserId = command.userId;
      if (!resolvedUserId) {
        const allUsers = await this.userRepository.findAll();
        if (allUsers && allUsers.length > 0) {
          resolvedUserId = allUsers[0].id;
        }
      }

      if (resolvedUserId) {
        const rawType = (command.type || 'WALLET').toUpperCase();
        const paymentType =
          rawType === 'WALLET'
            ? PaymentType.WALLET
            : rawType === 'INVOICE'
            ? PaymentType.INVOICE
            : PaymentType.ORDER;

        paymentTx = new PaymentTransactionEntity({
          id: randomUUID(),
          userId: resolvedUserId,
          type: paymentType,
          targetId: command.targetId || resolvedUserId,
          amount: command.amount,
          currency: 'IRT',
          gateway: 'ZARINPAL_SANDBOX',
          status: PaymentStatus.PENDING,
          authority,
          trackingCode: command.trackingCode || `WAL-PAY-${Math.floor(10000000 + Math.random() * 90000000)}`,
          description: `شارژ آنلاین کیف پول با درگاه تستی زرین‌پال`,
        });

        await this.paymentRepository.create(paymentTx);
        this.logger.log(`Created dynamic PaymentTransactionEntity for authority=${authority}, type=${paymentType}, amount=${command.amount}`);
      }
    }

    if (!paymentTx) {
      throw new NotFoundException(`تراکنش پرداختی با شناسه ${authority} یافت نشد.`);
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

    // Verify with ZarinPal Sandbox API
    const verifyResult = await this.zarinpalService.verifyPayment({
      amount: paymentTx.amount,
      authority,
    });

    if (!verifyResult.success) {
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
    if (paymentTx.type === PaymentType.ORDER) {
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
      }
    } else if (paymentTx.type === PaymentType.WALLET) {
      if (paymentTx.userId) {
        try {
          await this.userRepository.creditUserWallet(
            paymentTx.userId,
            paymentTx.amount,
            paymentTx.trackingCode,
            verifyResult.refId,
          );
        } catch (e) {
          this.logger.error(`Error crediting wallet for user ${paymentTx.userId}: ${(e as any)?.message}`);
        }
      }
    } else if (paymentTx.type === PaymentType.INVOICE) {
      const invoice = await this.invoiceRepository.findById(paymentTx.targetId);
      if (invoice) {
        invoiceNumber = invoice.invoiceNumber;
        invoice.markAsPaid();
        await this.invoiceRepository.save(invoice);
      }
    }

    return {
      success: true,
      trackingCode: paymentTx.trackingCode,
      refId: verifyResult.refId,
      cardPan: verifyResult.cardPan,
      type: paymentTx.type,
      targetId: paymentTx.targetId,
      orderNumber,
      invoiceNumber,
      amount: paymentTx.amount,
      message: 'پرداخت با موفقیت در درگاه تستی زرین‌پال تأیید گردید.',
    };
  }
}
