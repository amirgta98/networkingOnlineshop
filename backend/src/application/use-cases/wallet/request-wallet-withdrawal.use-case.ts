import type { IUserRepository } from '../../../domain/repositories/user.repository.interface.js';
import type { UserWalletWithdrawal } from '../../../domain/entities/user-detail.types.js';
import { BadRequestException } from '@nestjs/common';

export interface RequestWithdrawalInput {
  userId: string;
  amount: number;
  cardNumber?: string;
  shabaNumber?: string;
  accountHolder?: string;
  bankName?: string;
}

function toEnglishDigits(str?: string): string {
  if (!str) return '';
  return str
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 1776))
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 1632));
}

export class RequestWalletWithdrawalUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(input: RequestWithdrawalInput): Promise<UserWalletWithdrawal> {
    if (!input.userId) {
      throw new BadRequestException('کاربر مشخص نشده است.');
    }

    const user = await this.userRepository.findById(input.userId);
    if (!user) {
      throw new BadRequestException('حساب کاربری مورد نظر یافت نشد.');
    }

    // Role-based minimum withdrawal validation:
    // Partner minimum: 10,000,000 Tomans.
    // Regular customer: can withdraw whenever they want (> 0).
    const isPartner = user.role === 'partner' || user.role === 'partner_b2b';
    if (isPartner) {
      const PARTNER_MIN_WITHDRAWAL = 10_000_000;
      if (!input.amount || input.amount < PARTNER_MIN_WITHDRAWAL) {
        throw new BadRequestException(
          'حداقل مبلغ قابل برداشت برای همکاران ۱۰,۰۰۰,۰۰۰ تومان (۱۰ میلیون تومان) است.',
        );
      }
    } else {
      if (!input.amount || input.amount <= 0) {
        throw new BadRequestException('مبلغ درخواستی برداشت باید بزرگتر از صفر باشد.');
      }
    }

    // Bank Account details: users do not need to enter Sheba/Card on every request;
    // they must be pre-registered in user profile.
    const rawCard = input.cardNumber || user.cardNumber || '';
    const cleanCard = toEnglishDigits(rawCard).replace(/[\s-]/g, '').replace(/\D/g, '');

    let rawShaba = input.shabaNumber || user.shebaNumber || '';
    rawShaba = toEnglishDigits(rawShaba).replace(/[\s-]/g, '').toUpperCase();
    if (rawShaba && !rawShaba.startsWith('IR')) {
      rawShaba = 'IR' + rawShaba.replace(/^IR/i, '');
    }

    if (!rawShaba) {
      throw new BadRequestException(
        'شماره شبای بانکی در پروفایل شما ثبت نشده یا نامعتبر است. لطفاً ابتدا در صفحه پروفایل شماره شبا و کارت خود را ثبت نمایید.',
      );
    }

    if (rawShaba.length !== 26 || !/^IR\d{24}$/.test(rawShaba)) {
      throw new BadRequestException('شماره شبا باید با IR آغاز شده و مجموعاً ۲۶ کاراکتر باشد.');
    }

    if (cleanCard && cleanCard.length !== 16) {
      throw new BadRequestException('شماره کارت بانکی باید دقیقاً ۱۶ رقم باشد.');
    }

    const resolvedHolder = input.accountHolder?.trim() || user.accountHolderName || user.name;
    const resolvedBankName = input.bankName?.trim() || user.bankName || undefined;

    return this.userRepository.requestWalletWithdrawal(input.userId, {
      amount: input.amount,
      cardNumber: cleanCard,
      shabaNumber: rawShaba,
      accountHolder: resolvedHolder,
      bankName: resolvedBankName,
    });
  }
}
