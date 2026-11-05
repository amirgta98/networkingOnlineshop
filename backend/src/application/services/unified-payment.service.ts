import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Inject,
  Optional,
} from '@nestjs/common';
import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { ConfigService } from '@nestjs/config';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsIn,
} from 'class-validator';
import { PrismaService } from '../../infrastructure/database/prisma/prisma.service.js';
import { ZarinpalPaymentService } from '../../infrastructure/payment/zarinpal.service.js';
import { ORDER_REPOSITORY_TOKEN } from '../../shared/constants/tokens.js';
import type { IOrderRepository } from '../../domain/repositories/order.repository.interface.js';
import {
  PaymentGatewayType,
  PaymentRecordStatus,
  PaymentTargetType,
  OrderStatus,
  WalletTransactionType,
} from '@prisma/client';

export class InitiatePaymentDto {
  @IsNotEmpty({ message: 'نوع هدف پرداخت الزامی است.' })
  @IsString()
  @IsIn(['ORDER', 'INTERNET_ORDER', 'WALLET', 'INVOICE'])
  targetType!: 'ORDER' | 'INTERNET_ORDER' | 'WALLET' | 'INVOICE';

  @IsNotEmpty({ message: 'شناسه هدف پرداخت الزامی است.' })
  @IsString()
  targetId!: string;

  @IsNotEmpty({ message: 'روش پرداخت الزامی است.' })
  @IsString()
  @IsIn(['online_gateway', 'wallet', 'card_to_card', 'bank_transfer', 'corporate_credit', 'sayad_cheque'])
  paymentMethod!: 'online_gateway' | 'wallet' | 'card_to_card' | 'bank_transfer' | 'corporate_credit' | 'sayad_cheque';

  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsString()
  gatewayId?: string;

  @IsOptional()
  @IsString()
  bankAccountId?: string;

  @IsOptional()
  @IsString()
  callbackUrl?: string;

  @IsOptional()
  @IsString()
  chequeNumber?: string;

  @IsOptional()
  @IsString()
  chequeSayadId?: string;

  @IsOptional()
  @IsString()
  chequeDueDate?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  receiptNumber?: string;

  @IsOptional()
  @IsString()
  receiptUrl?: string;
}

export class CreateGatewayConfigDto {
  @IsNotEmpty({ message: 'نام درگاه الزامی است.' })
  @IsString()
  name!: string;

  @IsNotEmpty({ message: 'ارائه‌دهنده درگاه الزامی است.' })
  @IsString()
  provider!: string;

  @IsNotEmpty({ message: 'شناسه مرچنت الزامی است.' })
  @IsString()
  merchantId!: string;

  @IsOptional()
  @IsString()
  terminalId?: string;

  @IsOptional()
  @IsString()
  apiKey?: string;

  @IsOptional()
  @IsBoolean()
  isSandbox?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateGatewayConfigDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  provider?: string;

  @IsOptional()
  @IsString()
  merchantId?: string;

  @IsOptional()
  @IsString()
  terminalId?: string;

  @IsOptional()
  @IsString()
  apiKey?: string;

  @IsOptional()
  @IsBoolean()
  isSandbox?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @IsOptional()
  @IsString()
  description?: string;
}

export class CreateBankAccountDto {
  @IsNotEmpty({ message: 'نام بانک الزامی است.' })
  @IsString()
  bankName!: string;

  @IsNotEmpty({ message: 'نام صاحب حساب الزامی است.' })
  @IsString()
  accountOwner!: string;

  @IsNotEmpty({ message: 'شماره کارت الزامی است.' })
  @IsString()
  cardNumber!: string;

  @IsNotEmpty({ message: 'شماره شبا الزامی است.' })
  @IsString()
  shebaNumber!: string;

  @IsOptional()
  @IsString()
  accountNumber?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @IsOptional()
  @IsNumber()
  displayOrder?: number;
}

export class UpdateBankAccountDto {
  @IsOptional()
  @IsString()
  bankName?: string;

  @IsOptional()
  @IsString()
  accountOwner?: string;

  @IsOptional()
  @IsString()
  cardNumber?: string;

  @IsOptional()
  @IsString()
  shebaNumber?: string;

  @IsOptional()
  @IsString()
  accountNumber?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @IsOptional()
  @IsNumber()
  displayOrder?: number;
}

export class UpdatePaymentSettingsDto {
  @IsOptional()
  @IsBoolean()
  global_sandbox_mode?: boolean;

  @IsOptional()
  @IsBoolean()
  is_wallet_payment_enabled?: boolean;

  @IsOptional()
  @IsBoolean()
  is_card_to_card_enabled?: boolean;

  @IsOptional()
  @IsBoolean()
  is_cheque_payment_enabled?: boolean;

  @IsOptional()
  @IsBoolean()
  is_corporate_credit_enabled?: boolean;

  @IsOptional()
  @IsNumber()
  min_wallet_recharge?: number;

  @IsOptional()
  @IsNumber()
  max_wallet_recharge?: number;
}

@Injectable()
export class UnifiedPaymentService {
  private readonly logger = new Logger(UnifiedPaymentService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly zarinpalService: ZarinpalPaymentService,
    private readonly configService: ConfigService,
    @Inject(ORDER_REPOSITORY_TOKEN) @Optional() private readonly orderRepo?: IOrderRepository,
  ) {}

  // ─── Initialization & Default Seeding ──────────────────────────

  async ensureDefaultConfigs() {
    try {
      const gatewaysCount = await this.prisma.paymentGatewayConfig.count();
      if (gatewaysCount === 0) {
        await this.prisma.paymentGatewayConfig.create({
          data: {
            name: 'درگاه پرداخت امن زرین‌پال شاپرک',
            provider: 'zarinpal',
            merchantId: '4ced0c52-2f31-11e7-9da8-000c295eb8fc',
            isSandbox: true,
            isActive: true,
            isDefault: true,
            description: 'درگاه پرداخت شاپرک زرین‌پال با پشتیبانی از کلیه کارت‌های عضو شتاب',
          },
        });
      }

      const banksCount = await this.prisma.paymentBankAccount.count();
      if (banksCount === 0) {
        await this.prisma.paymentBankAccount.createMany({
          data: [
            {
              bankName: 'بانک سامان',
              accountOwner: 'شرکت ققنوس عصر داده ورزان',
              cardNumber: '۶۲۱۹-۸۶۱۰-۴۳۲۱-۹۸۷۶',
              shebaNumber: 'IR890560000000001234567890',
              accountNumber: '890-560-1234567-1',
              isActive: true,
              isDefault: true,
              displayOrder: 1,
            },
            {
              bankName: 'بانک ملی ایران',
              accountOwner: 'شرکت ققنوس عصر داده ورزان',
              cardNumber: '۶۰۳۷-۹۹۱۸-۵۴۳۲-۱۰۹۸',
              shebaNumber: 'IR120170000000009876543210',
              accountNumber: '0109876543002',
              isActive: true,
              isDefault: false,
              displayOrder: 2,
            },
          ],
        });
      }

      const settingsCount = await this.prisma.paymentSetting.count();
      if (settingsCount === 0) {
        const defaults: Record<string, string> = {
          global_sandbox_mode: 'true',
          is_wallet_payment_enabled: 'true',
          is_card_to_card_enabled: 'true',
          is_cheque_payment_enabled: 'true',
          is_corporate_credit_enabled: 'true',
          min_wallet_recharge: '10000',
          max_wallet_recharge: '500000000',
        };
        for (const [key, value] of Object.entries(defaults)) {
          await this.prisma.paymentSetting.upsert({
            where: { key },
            update: {},
            create: { key, value },
          });
        }
      }
    } catch (err) {
      this.logger.warn('Could not ensure default payment configs:', err);
    }
  }

  // ─── Public Config ─────────────────────────────────────────────

  async getPublicPaymentConfig(userId?: string) {
    await this.ensureDefaultConfigs();

    const [gateways, bankAccounts, settingsList] = await Promise.all([
      this.prisma.paymentGatewayConfig.findMany({
        where: { isActive: true },
        orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }],
        select: {
          id: true,
          name: true,
          provider: true,
          isSandbox: true,
          isDefault: true,
          description: true,
        },
      }),
      this.prisma.paymentBankAccount.findMany({
        where: { isActive: true },
        orderBy: [{ isDefault: 'desc' }, { displayOrder: 'asc' }],
      }),
      this.prisma.paymentSetting.findMany(),
    ]);

    const settingsMap: Record<string, string> = {};
    for (const s of settingsList) {
      settingsMap[s.key] = s.value;
    }

    let userWallet: { balance: number; lockedBalance: number; totalUsable: number } | null = null;
    if (userId) {
      const wallet = await this.prisma.wallet.findUnique({
        where: { userId },
      });
      if (wallet) {
        const balance = Number(wallet.balance) || 0;
        const lockedBalance = Number(wallet.lockedBalance) || 0;
        userWallet = {
          balance,
          lockedBalance,
          totalUsable: Math.max(0, balance - lockedBalance),
        };
      }
    }

    return {
      gateways,
      bankAccounts,
      settings: {
        isSandboxMode: settingsMap['global_sandbox_mode'] !== 'false',
        isWalletEnabled: settingsMap['is_wallet_payment_enabled'] !== 'false',
        isCardToCardEnabled: settingsMap['is_card_to_card_enabled'] !== 'false',
        isChequeEnabled: settingsMap['is_cheque_payment_enabled'] !== 'false',
        isCorporateCreditEnabled: settingsMap['is_corporate_credit_enabled'] !== 'false',
        minWalletRecharge: Number(settingsMap['min_wallet_recharge']) || 10000,
        maxWalletRecharge: Number(settingsMap['max_wallet_recharge']) || 500000000,
      },
      userWallet,
    };
  }

  // ─── Initiate Unified Payment ──────────────────────────────────

  async initiatePayment(dto: InitiatePaymentDto, userId: string, userMeta?: any) {
    if (!userId) {
      throw new BadRequestException('شناسه کاربر برای ثبت پرداخت الزامی است.');
    }

    await this.ensureDefaultConfigs();

    // 1. Resolve Target Details and Required Amount
    let targetAmount = dto.amount || 0;
    let targetTitle = '';
    let trackingCode = '';
    let customerPhone = userMeta?.phone || '';
    const paymentTxTracking = `PAY-${Math.floor(10000000 + Math.random() * 90000000)}`;

    if (dto.targetType === 'INTERNET_ORDER') {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(dto.targetId);
      const internetOrder = await this.prisma.internetOrder.findFirst({
        where: isUuid ? { id: dto.targetId } : { trackingCode: dto.targetId },
        include: { plan: true },
      });

      if (!internetOrder) {
        throw new NotFoundException(`سفارش اینترنت با شناسه ${dto.targetId} یافت نشد.`);
      }

      if (internetOrder.status === 'ACTIVE') {
        throw new BadRequestException('این سفارش اینترنت قبلاً پرداخت و فعال شده است.');
      }

      if (internetOrder.userId) {
        userId = internetOrder.userId;
      }

      targetAmount = Number(internetOrder.finalAmount) || Number(dto.amount) || 0;
      targetTitle = `سفارش اینترنت سازمانی ${internetOrder.plan?.title || ''} (${internetOrder.trackingCode})`;
      trackingCode = internetOrder.trackingCode;
      customerPhone = internetOrder.phoneNumber || customerPhone;
    } else if (dto.targetType === 'ORDER') {
      const order = await this.findOrder(dto.targetId);

      if (!order) {
        throw new NotFoundException(`سفارش با شناسه ${dto.targetId} یافت نشد.`);
      }

      if (order.userId) {
        userId = order.userId;
      }

      targetAmount = Number(order.payableAmount || order.totalAmount) || Number(dto.amount) || 0;
      targetTitle = `پرداخت سفارش تجهیزات شبکه ${order.orderNumber}`;
      trackingCode = order.trackingCode || order.orderNumber;
      customerPhone = order.phoneNumber || customerPhone;
    } else if (dto.targetType === 'WALLET') {
      const amountVal = Number(dto.amount) || 0;
      if (amountVal < 1000) {
        throw new BadRequestException('حداقل مبلغ شارژ کیف پول ۱,۰۰۰ تومان می‌باشد.');
      }
      targetAmount = amountVal;
      trackingCode = `WAL-${Date.now().toString().slice(-8)}`;
      targetTitle = `افزایش موجودی کیف پول کاربری (${targetAmount.toLocaleString('fa-IR')} تومان)`;
    } else if (dto.targetType === 'INVOICE') {
      targetAmount = Number(dto.amount) || 10000;
      trackingCode = `INV-${Date.now().toString().slice(-8)}`;
      targetTitle = `تسویه آنلاین فاکتور رسمی`;
    }

    if (!targetAmount || targetAmount <= 0) {
      throw new BadRequestException('مبلغ پرداخت نامعتبر است.');
    }

    // ─── 2. Handle Payment Method: WALLET ──────────────────────────
    if (dto.paymentMethod === 'wallet') {
      const wallet = await this.prisma.wallet.findUnique({
        where: { userId },
      });

      const currentBalance = Number(wallet?.balance || 0);

      if (currentBalance < targetAmount) {
        throw new BadRequestException(
          `موجودی کیف پول شما (${currentBalance.toLocaleString('fa-IR')} تومان) کمتر از مبلغ سفارش (${targetAmount.toLocaleString('fa-IR')} تومان) است. لطفاً ابتدا کیف پول خود را شارژ فرمایید یا از درگاه شاپرک استفاده کنید.`,
        );
      }

      // Deduct from wallet and activate target in transaction
      return await this.prisma.$transaction(async (tx) => {
        // Debit wallet
        const updatedWallet = await tx.wallet.update({
          where: { userId },
          data: {
            balance: { decrement: targetAmount },
          },
        });

        // Record wallet purchase transaction
        const balanceBefore = currentBalance;
        const balanceAfter = currentBalance - targetAmount;
        const walletTxTracking = `WTX-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

        await tx.walletTransaction.create({
          data: {
            walletId: updatedWallet.id,
            amount: targetAmount,
            balanceBefore,
            balanceAfter,
            trackingCode: walletTxTracking,
            type: WalletTransactionType.PURCHASE,
            referenceType: dto.targetType,
            referenceId: trackingCode,
            description: `پرداخت ${targetTitle} از طریق کیف پول`,
          },
        });

        // Record successful payment transaction
        const txRecord = await tx.paymentTransaction.create({
          data: {
            userId,
            type: dto.targetType as PaymentTargetType,
            targetId: dto.targetId,
            amount: BigInt(targetAmount),
            currency: 'IRT',
            gateway: PaymentGatewayType.ZARINPAL,
            status: PaymentRecordStatus.SUCCESS,
            authority: `WALLET-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
            refId: `WAL-REF-${Date.now()}`,
            trackingCode,
            description: `پرداخت موفق از طریق کیف پول اعتباری`,
            verifiedAt: new Date(),
          },
        });

        // Target Activation
        if (dto.targetType === 'INTERNET_ORDER') {
          const activatedOrder = await tx.internetOrder.update({
            where: { id: dto.targetId },
            data: {
              status: 'ACTIVE',
            },
            include: { plan: true, site: true },
          });

          // Credit partner commission if applicable
          if (Number(activatedOrder.partnerCommission) > 0) {
            const partner = await tx.affiliatePartner.findFirst({
              where: { userId },
            });
            if (partner) {
              const commAmount = Number(activatedOrder.partnerCommission);
              const partnerWallet = await tx.wallet.update({
                where: { userId },
                data: { balance: { increment: commAmount } },
              });
              const commTracking = `COMM-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
              await tx.walletTransaction.create({
                data: {
                  walletId: partnerWallet.id,
                  amount: commAmount,
                  balanceBefore: Number(partnerWallet.balance) - commAmount,
                  balanceAfter: Number(partnerWallet.balance),
                  trackingCode: commTracking,
                  type: WalletTransactionType.DEPOSIT,
                  referenceType: 'COMMISSION',
                  referenceId: activatedOrder.trackingCode,
                  description: `پورسانت فروش همکار برای سفارش اینترنت ${activatedOrder.trackingCode}`,
                },
              });
            }
          }

          return {
            success: true,
            paymentMethod: 'wallet',
            status: 'ACTIVE',
            trackingCode: activatedOrder.trackingCode,
            amount: targetAmount,
            message: 'مبلغ با موفقیت از کیف پول شما کسر و سفارش اینترنت فعال شد.',
            order: activatedOrder,
          };
        } else if (dto.targetType === 'ORDER') {
          const updatedOrder = await tx.order.update({
            where: { id: dto.targetId },
            data: {
              status: OrderStatus.PROCESSING_WAREHOUSE,
              paymentMethod: 'wallet',
            },
          });
          return {
            success: true,
            paymentMethod: 'wallet',
            status: 'PROCESSING',
            trackingCode,
            amount: targetAmount,
            message: 'سفارش شما با موفقیت از طریق کیف پول پرداخت گردید.',
            order: updatedOrder,
          };
        }

        return {
          success: true,
          paymentMethod: 'wallet',
          status: 'SUCCESS',
          trackingCode,
          amount: targetAmount,
          message: 'پرداخت با موفقیت انجام شد.',
        };
      });
    }

    // ─── 3. Handle Payment Method: CORPORATE CREDIT ──────────────
    if (dto.paymentMethod === 'corporate_credit') {
      const isPartner =
        userMeta?.role === 'partner' ||
        userMeta?.role === 'partner_b2b' ||
        userMeta?.isPartner === true;

      if (!isPartner) {
        throw new ForbiddenException('روش پرداخت اعتباری فقط برای همکاران تجاری و حساب‌های سازمانی معتبر فعال است.');
      }

      await this.prisma.paymentTransaction.create({
        data: {
          userId,
          type: dto.targetType as PaymentTargetType,
          targetId: dto.targetId,
          amount: BigInt(targetAmount),
          currency: 'IRT',
          gateway: PaymentGatewayType.ZARINPAL,
          status: PaymentRecordStatus.SUCCESS,
          authority: `CREDIT-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
          refId: `B2B-CREDIT-${Date.now()}`,
          trackingCode: paymentTxTracking,
          description: `تسویه اعتباری سازمانی B2B`,
          verifiedAt: new Date(),
        },
      });

      if (dto.targetType === 'INTERNET_ORDER') {
        const activeOrder = await this.prisma.internetOrder.update({
          where: { id: dto.targetId },
          data: { status: 'ACTIVE' },
          include: { plan: true, site: true },
        });
        return {
          success: true,
          paymentMethod: 'corporate_credit',
          status: 'ACTIVE',
          trackingCode,
          amount: targetAmount,
          message: 'سفارش تحت حساب اعتباری سازمانی تایید و فعال شد.',
          order: activeOrder,
        };
      }

      return {
        success: true,
        paymentMethod: 'corporate_credit',
        status: 'SUCCESS',
        trackingCode,
        amount: targetAmount,
        message: 'سفارش تحت حساب اعتباری ثبت شد.',
      };
    }

    // ─── 4. Handle Payment Method: BANK TRANSFER (Card-to-Card) ──
    if (dto.paymentMethod === 'bank_transfer' || dto.paymentMethod === 'card_to_card') {
      const isBankUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(dto.bankAccountId || '');
      const bankAccount = dto.bankAccountId
        ? isBankUuid
          ? await this.prisma.paymentBankAccount.findUnique({ where: { id: dto.bankAccountId } })
          : await this.prisma.paymentBankAccount.findFirst({
              where: {
                OR: [
                  { bankName: { contains: dto.bankAccountId, mode: 'insensitive' } },
                ],
                isActive: true,
              },
            })
        : await this.prisma.paymentBankAccount.findFirst({ where: { isDefault: true, isActive: true } });

      const descParts = [
        `واریز به حساب / کارت به کارت: ${bankAccount?.bankName || 'بانک مرکزی'}`,
        dto.receiptNumber ? `شماره فیش/رهگیری: ${dto.receiptNumber}` : '',
      ].filter(Boolean);

      await this.prisma.paymentTransaction.create({
        data: {
          userId,
          type: dto.targetType as PaymentTargetType,
          targetId: dto.targetId,
          amount: BigInt(targetAmount),
          currency: 'IRT',
          gateway: PaymentGatewayType.ZARINPAL_SANDBOX,
          status: PaymentRecordStatus.PENDING,
          authority: `WIRE-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
          trackingCode: paymentTxTracking,
          description: descParts.join(' | '),
          receiptUrl: dto.receiptUrl,
          receiptNumber: dto.receiptNumber,
        },
      });

      // If target is ORDER, update order with receipt details
      if (dto.targetType === 'ORDER' && (dto.receiptUrl || dto.receiptNumber)) {
        try {
          const isOrderUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(dto.targetId);
          await this.prisma.order.updateMany({
            where: {
              OR: [
                ...(isOrderUuid ? [{ id: dto.targetId }] : []),
                { orderNumber: dto.targetId },
                { trackingCode: dto.targetId },
              ],
            },
            data: {
              paymentMethod: 'bank_transfer',
              ...(dto.receiptUrl ? { paymentReceiptUrl: dto.receiptUrl } : {}),
              ...(dto.receiptNumber ? { paymentReceiptNumber: dto.receiptNumber } : {}),
            },
          });
        } catch (orderUpdateErr) {
          this.logger.warn(`Failed to update order receipt in initiatePayment: ${orderUpdateErr}`);
        }
      }

      return {
        success: true,
        paymentMethod: 'bank_transfer',
        status: 'PENDING',
        trackingCode: paymentTxTracking,
        amount: targetAmount,
        bankAccount,
        receiptUrl: dto.receiptUrl,
        receiptNumber: dto.receiptNumber,
        message: dto.receiptUrl
          ? 'اطلاعات پرداخت و فیش واریز کارت به کارت با موفقیت دریافت و جهت بررسی به واحد مالی ارسال شد.'
          : 'اطلاعات حساب بانکی جهت واریز وجه ثبت شد. پس از واریز، فیش توسط واحد مالی تایید می‌گردد.',
      };
    }

    // ─── 5. Handle Payment Method: SAYAD CHEQUE ──────────────────
    if (dto.paymentMethod === 'sayad_cheque') {
      await this.prisma.paymentTransaction.create({
        data: {
          userId,
          type: dto.targetType as PaymentTargetType,
          targetId: dto.targetId,
          amount: BigInt(targetAmount),
          currency: 'IRT',
          gateway: PaymentGatewayType.ZARINPAL_SANDBOX,
          status: PaymentRecordStatus.PENDING,
          authority: `CHQ-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
          trackingCode: paymentTxTracking,
          description: `چک صیادی شماره: ${dto.chequeSayadId || dto.chequeNumber || 'نامشخص'} - سررسید: ${dto.chequeDueDate || 'توافقی'}`,
        },
      });

      return {
        success: true,
        paymentMethod: 'sayad_cheque',
        status: 'PENDING',
        trackingCode: paymentTxTracking,
        amount: targetAmount,
        message: 'مشخصات چک صیادی با موفقیت ثبت شد و پس از استعلام در سامانه صیاد، سفارش تایید خواهد شد.',
      };
    }

    // ─── 6. Handle Payment Method: ONLINE GATEWAY (SHAPARAK / ZARINPAL) 
    const isGatewayUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(dto.gatewayId || '');
    const gateway = dto.gatewayId
      ? isGatewayUuid
        ? await this.prisma.paymentGatewayConfig.findUnique({ where: { id: dto.gatewayId } })
        : await this.prisma.paymentGatewayConfig.findFirst({
            where: {
              OR: [
                { provider: dto.gatewayId.toLowerCase() },
                { name: { contains: dto.gatewayId, mode: 'insensitive' } },
              ],
              isActive: true,
            },
          })
      : await this.prisma.paymentGatewayConfig.findFirst({ where: { isDefault: true, isActive: true } });

    const isSandbox = gateway ? gateway.isSandbox : true;
    const merchantId = gateway ? gateway.merchantId : '4ced0c52-2f31-11e7-9da8-000c295eb8fc';

    const frontendBase = this.getFrontendUrl();
    const backendBase = this.getBackendUrl();

    // Callback URL to verify endpoint
    const callbackUrl =
      dto.callbackUrl ||
      `${backendBase}/api/v1/payments/verify`;

    const authorityCode = `AU00000000000000000000000000${Math.floor(10000000 + Math.random() * 90000000)}`;

    let paymentUrl = '';

    if (!isSandbox) {
      // LIVE PRODUCTION GATEWAY
      try {
        const liveRes = await fetch('https://payment.zarinpal.com/pg/v4/payment/request.json', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            merchant_id: merchantId,
            amount: targetAmount,
            currency: 'IRT',
            description: targetTitle,
            callback_url: callbackUrl,
            metadata: { mobile: customerPhone },
          }),
          signal: AbortSignal.timeout(10000),
        });

        const liveJson = await liveRes.json();
        if (liveJson?.data?.code === 100 || liveJson?.data?.code === 101) {
          const auth = liveJson.data.authority;
          paymentUrl = `https://payment.zarinpal.com/pg/StartPay/${auth}`;
        } else {
          throw new Error(liveJson?.errors?.message || 'خطا در اتصال به درگاه زرین‌پال');
        }
      } catch (err: any) {
        this.logger.error(`Live Zarinpal connection error: ${err.message}`);
        // Fallback to interactive simulator if live gateway rejected merchant
        paymentUrl = `${backendBase}/api/v1/payments/mock-gateway?authority=${authorityCode}&amount=${targetAmount}&callbackUrl=${encodeURIComponent(
          callbackUrl,
        )}`;
      }
    } else {
      // SANDBOX MODE: Try official Zarinpal Sandbox, fallback to interactive gateway
      try {
        const sandboxRes = await fetch('https://sandbox.zarinpal.com/pg/v4/payment/request.json', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            merchant_id: merchantId,
            amount: targetAmount,
            currency: 'IRT',
            description: targetTitle,
            callback_url: callbackUrl,
            metadata: { mobile: customerPhone },
          }),
          signal: AbortSignal.timeout(6000),
        });

        const sandboxJson = await sandboxRes.json();
        if (sandboxJson?.data?.code === 100 || sandboxJson?.data?.code === 101) {
          const auth = sandboxJson.data.authority;
          paymentUrl = `https://sandbox.zarinpal.com/pg/StartPay/${auth}`;
        } else {
          paymentUrl = `${backendBase}/api/v1/payments/mock-gateway?authority=${authorityCode}&amount=${targetAmount}&callbackUrl=${encodeURIComponent(
            callbackUrl,
          )}`;
        }
      } catch {
        paymentUrl = `${backendBase}/api/v1/payments/mock-gateway?authority=${authorityCode}&amount=${targetAmount}&callbackUrl=${encodeURIComponent(
          callbackUrl,
        )}`;
      }
    }

    // Save pending payment transaction
    await this.prisma.paymentTransaction.create({
      data: {
        userId,
        type: dto.targetType as PaymentTargetType,
        targetId: dto.targetId,
        amount: BigInt(targetAmount),
        currency: 'IRT',
        gateway: isSandbox ? PaymentGatewayType.ZARINPAL_SANDBOX : PaymentGatewayType.ZARINPAL,
        status: PaymentRecordStatus.PENDING,
        authority: authorityCode,
        trackingCode: paymentTxTracking,
        description: targetTitle,
        callbackUrl,
      },
    });

    return {
      success: true,
      paymentMethod: 'online_gateway',
      authority: authorityCode,
      paymentUrl,
      trackingCode: paymentTxTracking,
      amount: targetAmount,
      isSandbox,
    };
  }

  // ─── Admin Gateway Management ──────────────────────────────────

  async getAdminGateways() {
    await this.ensureDefaultConfigs();
    return this.prisma.paymentGatewayConfig.findMany({
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async createGateway(dto: CreateGatewayConfigDto) {
    if (dto.isDefault) {
      await this.prisma.paymentGatewayConfig.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      });
    }

    return this.prisma.paymentGatewayConfig.create({
      data: {
        name: dto.name,
        provider: dto.provider.toLowerCase(),
        merchantId: dto.merchantId.trim(),
        terminalId: dto.terminalId?.trim() || null,
        apiKey: dto.apiKey?.trim() || null,
        isSandbox: dto.isSandbox ?? true,
        isActive: dto.isActive ?? true,
        isDefault: dto.isDefault ?? false,
        description: dto.description || null,
      },
    });
  }

  async updateGateway(id: string, dto: UpdateGatewayConfigDto) {
    const existing = await this.prisma.paymentGatewayConfig.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('درگاه پرداخت مورد نظر یافت نشد.');
    }

    if (dto.isDefault) {
      await this.prisma.paymentGatewayConfig.updateMany({
        where: { isDefault: true, id: { not: id } },
        data: { isDefault: false },
      });
    }

    return this.prisma.paymentGatewayConfig.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.provider !== undefined && { provider: dto.provider.toLowerCase() }),
        ...(dto.merchantId !== undefined && { merchantId: dto.merchantId.trim() }),
        ...(dto.terminalId !== undefined && { terminalId: dto.terminalId?.trim() || null }),
        ...(dto.apiKey !== undefined && { apiKey: dto.apiKey?.trim() || null }),
        ...(dto.isSandbox !== undefined && { isSandbox: dto.isSandbox }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
        ...(dto.isDefault !== undefined && { isDefault: dto.isDefault }),
        ...(dto.description !== undefined && { description: dto.description || null }),
      },
    });
  }

  async deleteGateway(id: string) {
    const count = await this.prisma.paymentGatewayConfig.count();
    if (count <= 1) {
      throw new BadRequestException('حداقل یک درگاه پرداخت باید در سامانه فعال باقی بماند.');
    }
    return this.prisma.paymentGatewayConfig.delete({ where: { id } });
  }

  // ─── Admin Bank Account Management ─────────────────────────────

  async getAdminBankAccounts() {
    await this.ensureDefaultConfigs();
    return this.prisma.paymentBankAccount.findMany({
      orderBy: [{ isDefault: 'desc' }, { displayOrder: 'asc' }],
    });
  }

  async createBankAccount(dto: CreateBankAccountDto) {
    if (dto.isDefault) {
      await this.prisma.paymentBankAccount.updateMany({
        where: { isDefault: true },
        data: { isDefault: false },
      });
    }

    return this.prisma.paymentBankAccount.create({
      data: {
        bankName: dto.bankName.trim(),
        accountOwner: dto.accountOwner.trim(),
        cardNumber: dto.cardNumber.trim(),
        shebaNumber: dto.shebaNumber.trim().toUpperCase(),
        accountNumber: dto.accountNumber?.trim() || null,
        isActive: dto.isActive ?? true,
        isDefault: dto.isDefault ?? false,
        displayOrder: dto.displayOrder ?? 0,
      },
    });
  }

  async updateBankAccount(id: string, dto: UpdateBankAccountDto) {
    const existing = await this.prisma.paymentBankAccount.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException('حساب بانکی مورد نظر یافت نشد.');
    }

    if (dto.isDefault) {
      await this.prisma.paymentBankAccount.updateMany({
        where: { isDefault: true, id: { not: id } },
        data: { isDefault: false },
      });
    }

    return this.prisma.paymentBankAccount.update({
      where: { id },
      data: {
        ...(dto.bankName !== undefined && { bankName: dto.bankName.trim() }),
        ...(dto.accountOwner !== undefined && { accountOwner: dto.accountOwner.trim() }),
        ...(dto.cardNumber !== undefined && { cardNumber: dto.cardNumber.trim() }),
        ...(dto.shebaNumber !== undefined && { shebaNumber: dto.shebaNumber.trim().toUpperCase() }),
        ...(dto.accountNumber !== undefined && { accountNumber: dto.accountNumber?.trim() || null }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
        ...(dto.isDefault !== undefined && { isDefault: dto.isDefault }),
        ...(dto.displayOrder !== undefined && { displayOrder: dto.displayOrder }),
      },
    });
  }

  async deleteBankAccount(id: string) {
    const count = await this.prisma.paymentBankAccount.count();
    if (count <= 1) {
      throw new BadRequestException('حداقل یک حساب بانکی باید در سامانه تعریف شده باشد.');
    }
    return this.prisma.paymentBankAccount.delete({ where: { id } });
  }

  // ─── Admin Payment Settings ────────────────────────────────────

  async getAdminPaymentSettings() {
    await this.ensureDefaultConfigs();
    const settingsList = await this.prisma.paymentSetting.findMany();
    const map: Record<string, string> = {};
    for (const s of settingsList) {
      map[s.key] = s.value;
    }

    return {
      global_sandbox_mode: map['global_sandbox_mode'] !== 'false',
      is_wallet_payment_enabled: map['is_wallet_payment_enabled'] !== 'false',
      is_card_to_card_enabled: map['is_card_to_card_enabled'] !== 'false',
      is_cheque_payment_enabled: map['is_cheque_payment_enabled'] !== 'false',
      is_corporate_credit_enabled: map['is_corporate_credit_enabled'] !== 'false',
      min_wallet_recharge: Number(map['min_wallet_recharge']) || 10000,
      max_wallet_recharge: Number(map['max_wallet_recharge']) || 500000000,
    };
  }

  async updateAdminPaymentSettings(dto: UpdatePaymentSettingsDto) {
    for (const [key, val] of Object.entries(dto)) {
      if (val !== undefined) {
        await this.prisma.paymentSetting.upsert({
          where: { key },
          update: { value: String(val) },
          create: { key, value: String(val) },
        });
      }
    }
    return this.getAdminPaymentSettings();
  }

  // ─── Receipt Management ──────────────────────────────────────────

  async saveReceiptFile(file: any) {
    if (!file) {
      throw new BadRequestException('فایلی برای آپلود فیش انتخاب نشده است.');
    }
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.pdf'];
    const originalName = file.originalname || 'receipt.jpg';
    const safeExt = path.extname(originalName).toLowerCase() || '.jpg';
    if (!allowedExtensions.includes(safeExt)) {
      throw new BadRequestException('فرمت فایل مجاز نیست. لطفاً تصویر (JPG, PNG, WEBP) یا فایل PDF ارسال فرمایید.');
    }
    if (file.size > 10 * 1024 * 1024) {
      throw new BadRequestException('حجم فایل بیش از حد مجاز (حداکثر ۱۰ مگابایت) است.');
    }

    const uploadsBase = fs.existsSync(path.resolve(process.cwd(), 'backend'))
      ? path.resolve(process.cwd(), 'backend', 'uploads')
      : path.resolve(process.cwd(), 'uploads');
    const receiptsDir = path.join(uploadsBase, 'receipts');
    if (!fs.existsSync(receiptsDir)) {
      fs.mkdirSync(receiptsDir, { recursive: true });
    }

    const uniqueFilename = `receipt-${Date.now()}-${randomUUID().substring(0, 8)}${safeExt}`;
    const destinationPath = path.join(receiptsDir, uniqueFilename);
    await fs.promises.writeFile(destinationPath, file.buffer);

    return {
      success: true,
      url: `/uploads/receipts/${uniqueFilename}`,
      fileName: uniqueFilename,
      originalName,
      fileSize: file.size,
    };
  }

  async getAdminReceipts() {
    const orders = await this.prisma.order.findMany({
      where: {
        OR: [
          { paymentMethod: { in: ['card_to_card', 'bank_transfer', 'bank_wire'] } },
          { paymentReceiptUrl: { not: null } },
          { paymentReceiptNumber: { not: null } },
        ],
      },
      include: {
        items: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    const txs = await this.prisma.paymentTransaction.findMany({
      where: {
        OR: [
          { description: { contains: 'کارت به کارت' } },
          { description: { contains: 'واریز به حساب' } },
          { authority: { startsWith: 'WIRE-' } },
          { receiptUrl: { not: null } },
        ],
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    const txMap = new Map<string, any>();
    for (const tx of txs) {
      if (tx.targetId) {
        txMap.set(tx.targetId, tx);
      }
    }

    const statusMap: Record<string, { label: string; badge: string }> = {
      PENDING_FINANCIAL: { label: 'در انتظار بررسی مالی', badge: 'rose' },
      PROCESSING_WAREHOUSE: { label: 'تایید شده (ارسال به انبار)', badge: 'emerald' },
      SHIPPING: { label: 'تحویل به ناوگان ارسال', badge: 'sky' },
      DELIVERED: { label: 'تکمیل و تحویل شده', badge: 'emerald' },
      CANCELLED: { label: 'لغو شده / رد فیش', badge: 'neutral' },
    };

    return orders.map((o) => {
      const relatedTx = txMap.get(o.id) || txMap.get(o.orderNumber) || txMap.get(o.trackingCode);
      const receiptUrl = o.paymentReceiptUrl || relatedTx?.receiptUrl || null;
      const receiptNumber = o.paymentReceiptNumber || relatedTx?.receiptNumber || null;
      const st = statusMap[o.status] || { label: o.status, badge: 'default' };

      return {
        id: o.id,
        orderId: o.id,
        orderNumber: o.orderNumber,
        trackingCode: o.trackingCode,
        customerName: o.customerName,
        companyName: o.companyName,
        phoneNumber: o.phoneNumber,
        payableAmount: Number(o.payableAmount),
        paymentMethod: o.paymentMethod,
        paymentReceiptUrl: receiptUrl,
        paymentReceiptNumber: receiptNumber,
        status: o.status,
        statusLabel: st.label,
        statusBadge: st.badge,
        isVerified: o.status !== 'PENDING_FINANCIAL' && o.status !== 'CANCELLED',
        adminNotes: o.deliveryNotes,
        createdAt: o.createdAt.toISOString(),
        updatedAt: o.updatedAt.toISOString(),
        itemsCount: o.items.length,
      };
    });
  }

  async approveOrderReceipt(orderId: string, adminNotes?: string) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderId);
    const order = await this.prisma.order.findFirst({
      where: isUuid ? { id: orderId } : { orderNumber: orderId },
    });

    if (!order) {
      throw new NotFoundException(`سفارش با شناسه یا شماره ${orderId} یافت نشد.`);
    }

    const updatedNotes = adminNotes
      ? order.deliveryNotes
        ? `${order.deliveryNotes} | تایید مالی: ${adminNotes}`
        : `تایید مالی: ${adminNotes}`
      : order.deliveryNotes;

    const updatedOrder = await this.prisma.order.update({
      where: { id: order.id },
      data: {
        status: OrderStatus.PROCESSING_WAREHOUSE,
        deliveryNotes: updatedNotes,
        updatedAt: new Date(),
      },
    });

    try {
      await this.prisma.paymentTransaction.updateMany({
        where: {
          OR: [
            { targetId: order.id },
            { targetId: order.orderNumber },
            { targetId: order.trackingCode },
          ],
        },
        data: {
          status: PaymentRecordStatus.SUCCESS,
          verifiedAt: new Date(),
        },
      });
    } catch (txErr) {
      this.logger.warn(`Could not update payment transaction status for order ${order.orderNumber}: ${txErr}`);
    }

    return {
      success: true,
      message: `فیش واریزی سفارش ${order.orderNumber} با موفقیت تایید و سفارش به مرحله انبار و بسته‌بندی منتقل شد.`,
      order: {
        id: updatedOrder.id,
        orderNumber: updatedOrder.orderNumber,
        status: updatedOrder.status,
        statusLabel: 'بسته‌بندی و انبار',
      },
    };
  }

  async rejectOrderReceipt(orderId: string, reason?: string) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderId);
    const order = await this.prisma.order.findFirst({
      where: isUuid ? { id: orderId } : { orderNumber: orderId },
    });

    if (!order) {
      throw new NotFoundException(`سفارش با شناسه یا شماره ${orderId} یافت نشد.`);
    }

    const note = reason || 'فیش بانکی مورد تایید واقع نشد یا مبلغ واریزی نامطابق است.';
    const updatedNotes = order.deliveryNotes ? `${order.deliveryNotes} | رد فیش: ${note}` : `رد فیش: ${note}`;

    await this.prisma.order.update({
      where: { id: order.id },
      data: {
        deliveryNotes: updatedNotes,
        updatedAt: new Date(),
      },
    });

    return {
      success: true,
      message: `فیش سفارش ${order.orderNumber} رد شد و توضیحات برای مشتری ثبت گردید.`,
      orderId: order.id,
      orderNumber: order.orderNumber,
    };
  }

  // ─── Helpers ───────────────────────────────────────────────────

  async findOrder(targetId: string) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(targetId);
    let order: any = await this.prisma.order.findFirst({
      where: isUuid ? { id: targetId } : { orderNumber: targetId },
    });

    if (!order && this.orderRepo) {
      try {
        const domainOrder =
          (await this.orderRepo.findById(targetId)) ||
          (await this.orderRepo.findByOrderNumber(targetId));
        if (domainOrder) {
          order = {
            id: domainOrder.id,
            orderNumber: domainOrder.orderNumber,
            trackingCode: domainOrder.trackingCode,
            userId: domainOrder.userId,
            status: domainOrder.status,
            customerName: domainOrder.customerName,
            phoneNumber: domainOrder.phoneNumber,
            payableAmount: domainOrder.payableAmount,
            totalAmount: domainOrder.totalAmount,
            paymentMethod: domainOrder.paymentMethod,
            paymentReceiptUrl: domainOrder.paymentReceiptUrl,
            paymentReceiptNumber: domainOrder.paymentReceiptNumber,
            deliveryNotes: domainOrder.deliveryNotes,
          };
        }
      } catch (repoErr) {
        this.logger.warn(`Could not find order via orderRepo: ${repoErr}`);
      }
    }

    return order;
  }

  async findInternetOrder(targetId: string) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(targetId);
    return this.prisma.internetOrder.findFirst({
      where: isUuid ? { id: targetId } : { trackingCode: targetId },
      include: { plan: true },
    });
  }

  async resolveFallbackUserId(): Promise<string> {
    const user = await this.prisma.user.findFirst();
    if (user) return user.id;
    return 'e0000000-0000-0000-0000-000000000001';
  }

  private getFrontendUrl(): string {
    const configured =
      this.configService.get<string>('FRONTEND_URL') ||
      this.configService.get<string>('CORS_ORIGIN') ||
      process.env.FRONTEND_URL;
    return configured ? configured.replace(/\/$/, '') : 'http://localhost:3000';
  }

  private getBackendUrl(): string {
    const configured =
      this.configService.get<string>('API_BASE_URL') ||
      process.env.API_BASE_URL;
    return configured ? configured.replace(/\/$/, '') : 'http://localhost:3001';
  }
}
