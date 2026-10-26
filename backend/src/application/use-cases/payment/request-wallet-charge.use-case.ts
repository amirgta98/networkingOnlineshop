import { randomUUID } from 'node:crypto';
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import type { IUserRepository } from '../../../domain/repositories/user.repository.interface.js';
import type { IPaymentRepository } from '../../../domain/repositories/payment.repository.interface.js';
import { ZarinpalPaymentService } from '../../../infrastructure/payment/zarinpal.service.js';
import {
  PaymentTransactionEntity,
  PaymentType,
  PaymentStatus,
} from '../../../domain/entities/payment.entity.js';

export interface RequestWalletChargeCommand {
  userId: string;
  amount: number; // in Tomans
  callbackUrl?: string;
}

export interface RequestWalletChargeResult {
  authority: string;
  paymentUrl: string;
  trackingCode: string;
  amount: number;
}

@Injectable()
export class RequestWalletChargeUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly paymentRepository: IPaymentRepository,
    private readonly zarinpalService: ZarinpalPaymentService,
  ) {}

  async execute(command: RequestWalletChargeCommand): Promise<RequestWalletChargeResult> {
    if (!command.amount || command.amount < 1000) {
      throw new BadRequestException('حداقل مبلغ شارژ کیف پول ۱,۰۰۰ تومان می‌باشد.');
    }

    const user = await this.userRepository.findById(command.userId);
    if (!user) {
      throw new NotFoundException(`کاربر با شناسه ${command.userId} یافت نشد.`);
    }

    const callbackUrl =
      command.callbackUrl ||
      `${process.env.API_BASE_URL || 'http://localhost:3001'}/api/v1/payments/verify`;

    const trackingCode = `WAL-PAY-${Math.floor(10000000 + Math.random() * 90000000)}`;

    const userPhoneStr = user.phone
      ? typeof user.phone === 'string'
        ? user.phone
        : (user.phone as any).value || ''
      : '';

    const zarinpalResult = await this.zarinpalService.requestPayment({
      amount: command.amount,
      description: `افزایش اعتبار کیف پول کاربر ${user.name || userPhoneStr}`,
      callbackUrl,
      mobile: userPhoneStr,
      email: user.email ? (typeof user.email === 'string' ? user.email : (user.email as any).value) : undefined,
    });

    const paymentTx = new PaymentTransactionEntity({
      id: randomUUID(),
      userId: user.id,
      type: PaymentType.WALLET,
      targetId: user.id,
      amount: command.amount,
      currency: 'IRT',
      gateway: 'ZARINPAL_SANDBOX',
      status: PaymentStatus.PENDING,
      authority: zarinpalResult.authority,
      trackingCode,
      description: `شارژ آنلاین کیف پول با درگاه زرین‌پال تستی شاپرک`,
      callbackUrl,
    });

    await this.paymentRepository.create(paymentTx);

    return {
      authority: zarinpalResult.authority,
      paymentUrl: zarinpalResult.paymentUrl,
      trackingCode,
      amount: command.amount,
    };
  }
}
