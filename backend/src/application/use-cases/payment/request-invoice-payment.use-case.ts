import { randomUUID } from 'node:crypto';
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import type { IInvoiceRepository } from '../../../domain/repositories/invoice.repository.interface.js';
import type { IPaymentRepository } from '../../../domain/repositories/payment.repository.interface.js';
import { ZarinpalPaymentService } from '../../../infrastructure/payment/zarinpal.service.js';
import {
  PaymentTransactionEntity,
  PaymentType,
  PaymentStatus,
} from '../../../domain/entities/payment.entity.js';

export interface RequestInvoicePaymentCommand {
  invoiceId: string;
  callbackUrl?: string;
}

export interface RequestInvoicePaymentResult {
  authority: string;
  paymentUrl: string;
  invoiceId: string;
  invoiceNumber: string;
  trackingCode: string;
  amount: number;
}

@Injectable()
export class RequestInvoicePaymentUseCase {
  constructor(
    private readonly invoiceRepository: IInvoiceRepository,
    private readonly paymentRepository: IPaymentRepository,
    private readonly zarinpalService: ZarinpalPaymentService,
  ) {}

  async execute(command: RequestInvoicePaymentCommand): Promise<RequestInvoicePaymentResult> {
    let invoice = await this.invoiceRepository.findById(command.invoiceId);
    if (!invoice) {
      invoice = await this.invoiceRepository.findByInvoiceNumber(command.invoiceId);
    }

    if (!invoice) {
      throw new NotFoundException(`فاکتور مورد نظر با شناسه ${command.invoiceId} یافت نشد.`);
    }

    if (invoice.paymentStatus === 'PAID') {
      throw new BadRequestException('این فاکتور قبلاً پرداخت و تسویه شده است.');
    }

    const amount = invoice.totalAmount;
    if (amount <= 0) {
      throw new BadRequestException('مبلغ قابل پرداخت فاکتور نامعتبر است.');
    }

    const callbackUrl =
      command.callbackUrl ||
      `${process.env.API_BASE_URL || 'http://localhost:3001'}/api/v1/payments/verify`;

    const trackingCode = `INV-PAY-${Math.floor(10000000 + Math.random() * 90000000)}`;

    const zarinpalResult = await this.zarinpalService.requestPayment({
      amount,
      description: `تسویه آنلاین فاکتور رسمی ${invoice.invoiceNumber}`,
      callbackUrl,
      mobile: invoice.customerPhone || undefined,
    });

    const paymentTx = new PaymentTransactionEntity({
      id: randomUUID(),
      userId: invoice.userId,
      type: PaymentType.INVOICE,
      targetId: invoice.id,
      amount,
      currency: 'IRT',
      gateway: 'ZARINPAL_SANDBOX',
      status: PaymentStatus.PENDING,
      authority: zarinpalResult.authority,
      trackingCode,
      description: `تسویه آنلاین فاکتور ${invoice.invoiceNumber} با درگاه زرین‌پال تستی`,
      callbackUrl,
    });

    await this.paymentRepository.create(paymentTx);

    return {
      authority: zarinpalResult.authority,
      paymentUrl: zarinpalResult.paymentUrl,
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      trackingCode,
      amount,
    };
  }
}
