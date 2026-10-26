import { randomUUID } from 'node:crypto';
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import type { IOrderRepository } from '../../../domain/repositories/order.repository.interface.js';
import type { IPaymentRepository } from '../../../domain/repositories/payment.repository.interface.js';
import { ZarinpalPaymentService } from '../../../infrastructure/payment/zarinpal.service.js';
import {
  PaymentTransactionEntity,
  PaymentType,
  PaymentStatus,
} from '../../../domain/entities/payment.entity.js';
import { OrderStatus } from '../../../domain/entities/order.entity.js';

export interface RequestOrderPaymentCommand {
  orderId: string;
  callbackUrl?: string;
}

export interface RequestOrderPaymentResult {
  authority: string;
  paymentUrl: string;
  orderId: string;
  orderNumber: string;
  trackingCode: string;
  amount: number;
}

@Injectable()
export class RequestOrderPaymentUseCase {
  constructor(
    private readonly orderRepository: IOrderRepository,
    private readonly paymentRepository: IPaymentRepository,
    private readonly zarinpalService: ZarinpalPaymentService,
  ) {}

  async execute(command: RequestOrderPaymentCommand): Promise<RequestOrderPaymentResult> {
    let order = await this.orderRepository.findById(command.orderId);
    if (!order) {
      order = await this.orderRepository.findByOrderNumber(command.orderId);
    }
    if (!order) {
      order = await this.orderRepository.findByTrackingCode(command.orderId);
    }

    if (!order) {
      throw new NotFoundException(`سفارش مورد نظر با شناسه ${command.orderId} یافت نشد.`);
    }

    if (order.status !== OrderStatus.PENDING_FINANCIAL) {
      throw new BadRequestException('این سفارش در وضعیت انتظار پرداخت مالی قرار ندارد.');
    }

    const amount = order.payableAmount;
    if (amount <= 0) {
      throw new BadRequestException('مبلغ قابل پرداخت سفارش نامعتبر است.');
    }

    const callbackUrl =
      command.callbackUrl ||
      `${process.env.API_BASE_URL || 'http://localhost:3001'}/api/v1/payments/verify`;

    const trackingCode = `PAY-${Math.floor(10000000 + Math.random() * 90000000)}`;

    const zarinpalResult = await this.zarinpalService.requestPayment({
      amount,
      description: `پرداخت سفارش تجهیزات شبکه ${order.orderNumber}`,
      callbackUrl,
      mobile: order.phoneNumber,
    });

    const paymentTx = new PaymentTransactionEntity({
      id: randomUUID(),
      userId: order.userId,
      type: PaymentType.ORDER,
      targetId: order.id,
      amount,
      currency: 'IRT',
      gateway: 'ZARINPAL_SANDBOX',
      status: PaymentStatus.PENDING,
      authority: zarinpalResult.authority,
      trackingCode,
      description: `پرداخت اینترنتی سفارش ${order.orderNumber} با درگاه زرین‌پال تستی`,
      callbackUrl,
    });

    await this.paymentRepository.create(paymentTx);

    return {
      authority: zarinpalResult.authority,
      paymentUrl: zarinpalResult.paymentUrl,
      orderId: order.id,
      orderNumber: order.orderNumber,
      trackingCode,
      amount,
    };
  }
}
