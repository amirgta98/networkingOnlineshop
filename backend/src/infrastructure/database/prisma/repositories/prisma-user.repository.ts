import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { IUserRepository, UserFilterOptions } from '../../../../domain/repositories/user.repository.interface.js';
import { User } from '../../../../domain/entities/user.entity.js';
import { Email } from '../../../../domain/value-objects/email.vo.js';
import { PhoneNumber } from '../../../../domain/value-objects/phone-number.vo.js';
import { UserAddressEntity } from '../../../../domain/entities/user-address.entity.js';
import type {
  UserCartDetails,
  UserOrderDetails,
  UserWalletDetails,
  UserWalletWithdrawal,
  UserFavoriteDetails,
  UserRfqDetails,
  UserAuthenticityDetails,
  UserLoyaltyDetails,
  UserSessionDetails,
} from '../../../../domain/entities/user-detail.types.js';
import { PrismaService } from '../prisma.service.js';

function toEnglishDigits(str?: string): string {
  if (!str) return '';
  return str
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 1776))
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 1632));
}

function detectBankNameFromCard(cardNumber: string): string {
  const clean = toEnglishDigits(cardNumber).replace(/[\s-]/g, '').replace(/\D/g, '');
  const prefix6 = clean.slice(0, 6);
  const map: Record<string, string> = {
    '603799': 'بانک ملی ایران',
    '589210': 'بانک سپه',
    '627648': 'بانک توسعه صادرات',
    '627961': 'بانک صنعت و معدن',
    '603770': 'بانک کشاورزی',
    '628023': 'بانک مسکن',
    '627760': 'پست بانک ایران',
    '502908': 'بانک توسعه تعاون',
    '627412': 'بانک اقتصاد نوین',
    '622106': 'بانک پارسیان',
    '502229': 'بانک پاسارگاد',
    '627488': 'بانک کارآفرین',
    '621986': 'بانک سامان',
    '639346': 'بانک سینا',
    '639607': 'بانک سرمایه',
    '636214': 'بانک آینده',
    '502806': 'بانک شهر',
    '502938': 'بانک دی',
    '603769': 'بانک صادرات ایران',
    '610433': 'بانک ملت',
    '627353': 'بانک تجارت',
    '589463': 'بانک رفاه کارگران',
    '504172': 'بانک رسالت',
    '606373': 'بانک مهر ایران',
  };
  return map[prefix6] || 'شبکه بانکی شتاب';
}

@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<User | null> {
    const raw = await this.prisma.user.findUnique({
      where: { id },
      include: {
        profile: true,
        security: true,
        bankAccounts: {
          orderBy: { isDefault: 'desc' },
          take: 1,
        },
        roles: {
          include: {
            role: true,
          },
        },
        organizationMemberships: {
          include: {
            organization: true,
          },
        },
        wallet: true,
        invoices: true,
        sessions: {
          orderBy: { lastActiveAt: 'desc' },
          take: 5,
        },
      },
    });
    return raw ? this.toDomain(raw) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const raw = await this.prisma.user.findUnique({
      where: { email },
      include: {
        profile: true,
        security: true,
        bankAccounts: {
          orderBy: { isDefault: 'desc' },
          take: 1,
        },
        roles: {
          include: {
            role: true,
          },
        },
      },
    });
    return raw ? this.toDomain(raw) : null;
  }

  async findByPhone(phone: string): Promise<User | null> {
    const normalized = PhoneNumber.normalize(phone);
    const raw = await this.prisma.user.findUnique({
      where: { phone: normalized },
      include: {
        profile: true,
        security: true,
        bankAccounts: {
          orderBy: { isDefault: 'desc' },
          take: 1,
        },
        roles: {
          include: {
            role: true,
          },
        },
      },
    });
    return raw ? this.toDomain(raw) : null;
  }

  async findAll(filter?: UserFilterOptions): Promise<User[]> {
    const where: any = {};

    if (filter?.status && filter.status !== 'all') {
      where.status = filter.status.toUpperCase();
    }

    if (filter?.search && filter.search.trim()) {
      const q = filter.search.trim();
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { phone: { contains: q } },
        { email: { contains: q, mode: 'insensitive' } },
        { profile: { nationalCode: { contains: q } } },
      ];
    }

    const rawUsers = await this.prisma.user.findMany({
      where,
      include: {
        profile: true,
        security: true,
        bankAccounts: {
          orderBy: { isDefault: 'desc' },
          take: 1,
        },
        roles: {
          include: {
            role: true,
          },
        },
        organizationMemberships: {
          include: {
            organization: true,
          },
        },
        wallet: true,
        invoices: true,
        sessions: {
          orderBy: { lastActiveAt: 'desc' },
          take: 5,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    let users = rawUsers.map((raw) => this.toDomain(raw));

    if (filter?.role && filter.role !== 'all') {
      const targetRole = filter.role.toLowerCase();
      users = users.filter((u) => {
        const uRole = u.role.toLowerCase();
        if (targetRole === 'admin') {
          return uRole === 'admin' || uRole === 'super_admin' || uRole === 'staff_manager' || uRole === 'sales_manager';
        }
        if (targetRole === 'sales_manager') {
          return uRole === 'sales_manager';
        }
        if (targetRole === 'partner_b2b' || targetRole === 'partner') {
          return uRole === 'partner_b2b' || uRole === 'partner';
        }
        if (targetRole === 'customer') {
          return uRole === 'customer';
        }
        return uRole === targetRole;
      });
    }

    return users;
  }

  async save(user: User): Promise<void> {
    await this.prisma.user.upsert({
      where: { id: user.id },
      create: {
        id: user.id,
        email: user.email.value,
        phone: user.phone?.value ?? null,
        phoneVerifiedAt: user.phoneVerifiedAt,
        name: user.name,
        isActive: user.isActive,
        status: user.status.toUpperCase() as any,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        profile: (user.nationalCode || user.avatarUrl || user.firstName || user.lastName || user.bio)
          ? {
              create: {
                nationalCode: user.nationalCode,
                nationalCodeVerified: user.nationalCodeVerified,
                avatarUrl: user.avatarUrl,
                avatarStorageKey: user.avatarStorageKey,
                firstName: user.firstName,
                lastName: user.lastName,
                bio: user.bio,
              },
            }
          : undefined,
      },
      update: {
        email: user.email.value,
        phone: user.phone?.value ?? null,
        phoneVerifiedAt: user.phoneVerifiedAt,
        name: user.name,
        isActive: user.isActive,
        status: user.status.toUpperCase() as any,
        updatedAt: user.updatedAt,
        profile: (user.nationalCode || user.avatarUrl || user.firstName || user.lastName || user.bio)
          ? {
              upsert: {
                create: {
                  nationalCode: user.nationalCode,
                  nationalCodeVerified: user.nationalCodeVerified,
                  avatarUrl: user.avatarUrl,
                  avatarStorageKey: user.avatarStorageKey,
                  firstName: user.firstName,
                  lastName: user.lastName,
                  bio: user.bio,
                },
                update: {
                  nationalCode: user.nationalCode,
                  nationalCodeVerified: user.nationalCodeVerified,
                  avatarUrl: user.avatarUrl,
                  avatarStorageKey: user.avatarStorageKey,
                  firstName: user.firstName,
                  lastName: user.lastName,
                  bio: user.bio,
                },
              },
            }
          : undefined,
      },
    });

    if (user.role) {
      const roleMap: Record<string, string> = {
        admin: 'SUPER_ADMIN',
        super_admin: 'SUPER_ADMIN',
        staff_manager: 'STAFF_MANAGER',
        sales_manager: 'STAFF_MANAGER',
        partner_b2b: 'PARTNER_B2B',
        partner: 'PARTNER_B2B',
        customer: 'CUSTOMER',
      };
      const targetCode = roleMap[user.role.toLowerCase()] || 'CUSTOMER';
      const dbRole = await this.prisma.role.findUnique({ where: { code: targetCode } });
      if (dbRole) {
        await this.prisma.userRoleMapping.deleteMany({ where: { userId: user.id } });
        await this.prisma.userRoleMapping.create({
          data: {
            userId: user.id,
            roleId: dbRole.id,
          },
        });
      }
    }
  }

  async delete(id: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.productReviewLike.deleteMany({ where: { userId: id } });
      await tx.productReview.deleteMany({ where: { userId: id } });

      const wallet = await tx.wallet.findUnique({ where: { userId: id } });
      if (wallet) {
        await tx.walletTransaction.deleteMany({ where: { walletId: wallet.id } });
        await tx.walletWithdrawal.deleteMany({ where: { walletId: wallet.id } });
      }

      const loyalty = await tx.loyaltyAccount.findUnique({ where: { userId: id } });
      if (loyalty) {
        await tx.loyaltyTransaction.deleteMany({ where: { accountId: loyalty.id } });
        await tx.loyaltyTierHistory.deleteMany({ where: { accountId: loyalty.id } });
      }

      await tx.user.delete({
        where: { id },
      });
    });
  }

  private toDomain(raw: {
    id: string;
    email: string | null;
    phone: string | null;
    phoneVerifiedAt: Date | null;
    name: string;
    status: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    profile?: {
      nationalCode: string | null;
      nationalCodeVerified: boolean;
      avatarUrl?: string | null;
      avatarStorageKey?: string | null;
      firstName?: string | null;
      lastName?: string | null;
      bio?: string | null;
    } | null;
    security?: {
      twoFactorEnabled: boolean;
      twoFactorMethod: string;
      securityPinHash: string | null;
      passwordHash: string | null;
      pinFailedAttempts: number;
      pinLockedUntil: Date | null;
    } | null;
    roles?: Array<{
      role: {
        code: string;
      };
    }>;
    organizationMemberships?: Array<{
      organization?: {
        legalName: string;
        brandName?: string | null;
      };
    }>;
    wallet?: {
      balance: any;
    } | null;
    invoices?: Array<{
      totalAmount: any;
    }>;
    bankAccounts?: Array<{
      iban: string;
      cardNumber?: string | null;
      bankName?: string | null;
      accountHolderName?: string | null;
    }>;
    sessions?: Array<{
      id: string;
      ipAddress: string | null;
      deviceName: string | null;
      browser: string | null;
      lastActiveAt: Date;
    }>;
  }): User {
    let mappedRole = 'customer';
    if (raw.roles && raw.roles.length > 0) {
      const codes = raw.roles.map((r) => r.role?.code).filter(Boolean);
      if (codes.includes('SUPER_ADMIN') || codes.includes('STAFF_MANAGER')) {
        mappedRole = 'admin';
      } else if (codes.includes('PARTNER_B2B')) {
        mappedRole = 'partner_b2b';
      }
    }

    let companyName: string | undefined = undefined;
    if (raw.organizationMemberships && raw.organizationMemberships.length > 0) {
      companyName =
        raw.organizationMemberships[0].organization?.legalName ||
        raw.organizationMemberships[0].organization?.brandName ||
        undefined;
    }

    let ordersCount = 0;
    let totalSpent = 0;
    if (raw.invoices && Array.isArray(raw.invoices)) {
      ordersCount = raw.invoices.length;
      totalSpent = raw.invoices.reduce((sum, inv) => sum + (Number(inv.totalAmount) || 0), 0);
    }

    let walletBalance = 0;
    if (raw.wallet) {
      walletBalance = Number(raw.wallet.balance) || 0;
    }

    const activities = (raw.sessions || []).map((s, idx) => {
      let formattedTime = 'نامشخص';
      if (s.lastActiveAt) {
        try {
          const d = new Date(s.lastActiveAt);
          if (!isNaN(d.getTime())) {
            formattedTime = d.toLocaleString('fa-IR');
          }
        } catch {
          formattedTime = 'نامشخص';
        }
      }
      return {
        id: s.id || `act-${idx}`,
        action: `ورود موفق به سیستم ${s.browser ? `(${s.browser})` : ''}`,
        timestamp: formattedTime,
        ip: s.ipAddress || 'ثبت نشده',
        device: s.deviceName || undefined,
      };
    });

    let safeLastLogin: string | null = null;
    if (raw.sessions?.[0]?.lastActiveAt) {
      try {
        const d = new Date(raw.sessions[0].lastActiveAt);
        if (!isNaN(d.getTime())) {
          safeLastLogin = d.toLocaleString('fa-IR');
        }
      } catch {
        safeLastLogin = null;
      }
    }

    let safeEmail: Email;
    try {
      safeEmail = Email.create(raw.email || `user-${raw.id}@velox.local`);
    } catch {
      safeEmail = Email.create(`user-${raw.id}@velox.local`);
    }

    let safePhone: PhoneNumber | null = null;
    if (raw.phone) {
      try {
        safePhone = PhoneNumber.create(raw.phone);
      } catch {
        safePhone = null;
      }
    }

    const primaryBank = raw.bankAccounts?.[0];
    const shebaNumber = primaryBank?.iban
      ? (primaryBank.iban.startsWith('IR') ? primaryBank.iban : `IR${primaryBank.iban}`)
      : null;
    const cardNumber = primaryBank?.cardNumber || null;
    const bankName = primaryBank?.bankName || null;
    const accountHolderName = primaryBank?.accountHolderName || null;

    return new User({
      id: raw.id,
      email: safeEmail,
      phone: safePhone,
      phoneVerifiedAt: raw.phoneVerifiedAt,
      name: raw.name,
      isActive: raw.isActive,
      status: raw.status ? raw.status.toLowerCase() : 'active',
      role: mappedRole,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      security: raw.security
        ? {
            twoFactorEnabled: raw.security.twoFactorEnabled,
            twoFactorMethod: (raw.security.twoFactorMethod as 'PIN' | 'TOTP' | 'SMS') || 'PIN',
            securityPinHash: raw.security.securityPinHash,
            passwordHash: raw.security.passwordHash,
            pinFailedAttempts: raw.security.pinFailedAttempts,
            pinLockedUntil: raw.security.pinLockedUntil,
          }
        : null,
      nationalCode: raw.profile?.nationalCode || null,
      nationalCodeVerified: raw.profile?.nationalCodeVerified ?? false,
      avatarUrl: raw.profile?.avatarUrl || null,
      avatarStorageKey: raw.profile?.avatarStorageKey || null,
      firstName: raw.profile?.firstName || null,
      lastName: raw.profile?.lastName || null,
      bio: raw.profile?.bio || null,
      companyName,
      walletBalance,
      totalSpent,
      ordersCount,
      activities,
      lastLogin: safeLastLogin,
      cardNumber,
      shebaNumber,
      bankName,
      accountHolderName,
    });
  }

  async getUserAddresses(userId: string): Promise<UserAddressEntity[]> {
    const rows = await this.prisma.userAddress.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
    return rows.map(
      (r) =>
        new UserAddressEntity({
          id: r.id,
          userId: r.userId,
          title: r.title,
          type: r.type,
          recipientFirstName: r.recipientFirstName,
          recipientLastName: r.recipientLastName,
          recipientMobile: r.recipientMobile,
          province: r.province,
          city: r.city,
          detailedAddress: r.detailedAddress,
          plaque: r.plaque,
          unit: r.unit,
          postalCode: r.postalCode,
          latitude: r.latitude ? Number(r.latitude) : undefined,
          longitude: r.longitude ? Number(r.longitude) : undefined,
          deliveryNotes: r.deliveryNotes,
          isDefault: r.isDefault,
          createdAt: r.createdAt,
          updatedAt: r.updatedAt,
        }),
    );
  }

  async getUserCart(userId: string): Promise<UserCartDetails | null> {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: { where: { isPrimary: true }, take: 1 },
              },
            },
          },
        },
      },
    });
    if (!cart) {
      return null;
    }
    const items = cart.items.map((i) => ({
      id: i.id,
      productId: i.productId,
      title: i.product?.name || 'محصول بدون عنوان',
      sku: i.product?.sku || '',
      unitPrice: Number(i.unitPrice),
      quantity: i.quantity,
      totalPrice: Number(i.unitPrice) * i.quantity,
      imageUrl: i.product?.images?.[0]?.url,
      inStock: true,
    }));
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = items.reduce((sum, item) => sum + item.totalPrice, 0);
    return {
      id: cart.id,
      userId: cart.userId,
      totalItems,
      totalAmount,
      updatedAt: cart.updatedAt,
      items,
    };
  }

  async getUserOrders(userId: string): Promise<UserOrderDetails[]> {
    const orders = await this.prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: {
                  orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }],
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    const statusLabels: Record<string, string> = {
      PENDING_FINANCIAL: 'در انتظار تایید مالی',
      PROCESSING_WAREHOUSE: 'پردازش و بسته‌بندی انبار',
      SHIPPING: 'تحویل به ناوگان ارسال',
      DELIVERED: 'تحویل موفق',
      CANCELLED: 'لغو شده',
    };
    return orders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      trackingCode: o.trackingCode,
      userId: o.userId,
      status: (o.status.toLowerCase() as any),
      statusLabel: statusLabels[o.status] || o.status,
      customerType: (o.customerType as any) || 'retail',
      customerName: o.customerName,
      phoneNumber: o.phoneNumber,
      companyName: o.companyName || undefined,
      totalAmount: Number(o.totalAmount),
      discountAmount: Number(o.discountAmount),
      vatTaxAmount: Number(o.vatTaxAmount),
      payableAmount: Number(o.payableAmount),
      paymentMethod: o.paymentMethod,
      shippingCarrier: o.shippingCarrier || undefined,
      shippingCost: Number(o.shippingCost),
      deliveryNotes: o.deliveryNotes || undefined,
      createdAt: o.createdAt,
      items: o.items.map((it: any) => ({
        id: it.id,
        productId: it.productId || undefined,
        title: it.title,
        sku: it.sku,
        brand: it.brand || undefined,
        model: it.model || undefined,
        imageUrl: it.product?.images?.[0]?.url || undefined,
        unitPrice: Number(it.unitPrice),
        quantity: it.quantity,
        totalPrice: Number(it.totalPrice),
        warranty: it.warranty || undefined,
        serialNumbers: it.serialNumbers || [],
      })),
    }));
  }

  async getUserInvoices(userId: string): Promise<any[]> {
    const invoices = await this.prisma.invoice.findMany({
      where: { userId },
      include: {
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return invoices.map((inv) => ({
      id: inv.id,
      invoiceNumber: inv.invoiceNumber,
      trackingCode: inv.trackingCode,
      type: inv.type,
      typeLabel: inv.type === 'OFFICIAL' ? 'فاکتور رسمی مالیاتی' : 'پیش‌فاکتور / غیررسمی',
      status: inv.status,
      statusLabel: inv.status === 'ISSUED' ? 'صادر شده' : inv.status,
      paymentStatus: inv.paymentStatus,
      paymentStatusLabel: inv.paymentStatus === 'PAID' ? 'پرداخت شده' : 'پرداخت نشده',
      subtotal: Number(inv.subtotal),
      taxAmount: Number(inv.taxAmount),
      discountAmount: Number(inv.discountAmount),
      shippingCost: Number(inv.shippingCost),
      totalAmount: Number(inv.totalAmount),
      customerName: inv.customerName,
      customerPhone: inv.customerPhone,
      companyName: inv.companyName,
      createdAt: new Date(inv.createdAt).toLocaleDateString('fa-IR'),
      items: inv.items.map((it) => ({
        id: it.id,
        title: it.title,
        quantity: it.quantity,
        unitPrice: Number(it.unitPrice),
        totalPrice: Number(it.totalPrice),
        taxAmount: Number(it.taxAmount),
      })),
    }));
  }

  async getUserWallet(userId: string): Promise<UserWalletDetails | null> {
    const wallet = await this.prisma.wallet.findUnique({
      where: { userId },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 30,
        },
        withdrawals: {
          orderBy: { createdAt: 'desc' },
          include: {
            bankAccount: true,
          },
        },
      },
    });
    if (!wallet) return null;
    const txLabels: Record<string, string> = {
      DEPOSIT: 'افزایش موجودی',
      PURCHASE: 'خرید سفارش',
      REFUND: 'استرداد وجه',
      WITHDRAWAL: 'برداشت وجه',
      CASHBACK: 'پاداش کش‌بک',
      ADJUSTMENT: 'اصلاح حسابداری',
    };
    const wdLabels: Record<string, string> = {
      PENDING: 'در انتظار پردازش',
      PROCESSING: 'در حال واریز',
      COMPLETED: 'تسویه موفق',
      REJECTED: 'رد شده',
      CANCELLED: 'لغو شده',
    };
    return {
      id: wallet.id,
      userId: wallet.userId,
      balance: Number(wallet.balance),
      lockedBalance: Number(wallet.lockedBalance),
      currency: wallet.currency,
      isActive: wallet.isActive,
      transactions: wallet.transactions.map((tx) => ({
        id: tx.id,
        type: (tx.type as any),
        typeLabel: txLabels[tx.type] || tx.type,
        amount: Number(tx.amount),
        balanceBefore: Number(tx.balanceBefore),
        balanceAfter: Number(tx.balanceAfter),
        trackingCode: tx.trackingCode,
        referenceType: tx.referenceType || undefined,
        referenceId: tx.referenceId || undefined,
        description: tx.description || undefined,
        createdAt: tx.createdAt,
      })),
      withdrawals: wallet.withdrawals.map((w) => ({
        id: w.id,
        amount: Number(w.amount),
        status: (w.status as any),
        statusLabel: wdLabels[w.status] || w.status,
        bankAccountTitle: w.bankAccount?.bankName,
        shabaNumber: w.bankAccount?.iban,
        payoutReference: w.payoutReference || undefined,
        rejectionReason: w.rejectionReason || undefined,
        requestedAt: w.requestedAt,
        processedAt: w.processedAt || undefined,
      })),
    };
  }

  async creditUserWallet(
    userId: string,
    amount: number,
    trackingCode: string,
    refId: string,
  ): Promise<UserWalletDetails> {
    let wallet = await this.prisma.wallet.findUnique({
      where: { userId },
    });
    if (!wallet) {
      wallet = await this.prisma.wallet.create({
        data: {
          userId,
          balance: 0,
          lockedBalance: 0,
          currency: 'IRT',
          isActive: true,
        },
      });
    }

    const balanceBefore = Number(wallet.balance);
    const balanceAfter = balanceBefore + amount;

    await this.prisma.$transaction([
      this.prisma.wallet.update({
        where: { id: wallet.id },
        data: { balance: balanceAfter },
      }),
      this.prisma.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: 'DEPOSIT',
          amount,
          balanceBefore,
          balanceAfter,
          trackingCode: trackingCode || `TX-WAL-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
          referenceType: 'GATEWAY_CHARGE',
          referenceId: refId,
          description: `شارژ آنلاین کیف پول از طریق درگاه تستی زرین‌پال (شماره ارجاع: ${refId})`,
        },
      }),
    ]);

    const updated = await this.getUserWallet(userId);
    return updated!;
  }

  async requestWalletWithdrawal(
    userId: string,
    data: {
      amount: number;
      cardNumber: string;
      shabaNumber: string;
      accountHolder?: string | null;
      bankName?: string | null;
    },
  ): Promise<UserWalletWithdrawal> {
    let wallet = await this.prisma.wallet.findUnique({
      where: { userId },
    });
    if (!wallet) {
      wallet = await this.prisma.wallet.create({
        data: {
          userId,
          balance: 0,
          lockedBalance: 0,
          currency: 'IRT',
          isActive: true,
        },
      });
    }

    if (Number(wallet.balance) < data.amount) {
      throw new BadRequestException('موجودی نقدی کیف پول برای این مبلغ تسویه کافی نیست.');
    }

    let cardNum = data.cardNumber;
    let shabaNum = data.shabaNumber;
    let holder = data.accountHolder;
    let bName = data.bankName;

    if (!shabaNum || !cardNum) {
      const userBank = await this.prisma.userBankAccount.findFirst({
        where: { userId },
        orderBy: { isDefault: 'desc' },
      });
      if (userBank) {
        if (!shabaNum && userBank.iban) shabaNum = userBank.iban;
        if (!cardNum && userBank.cardNumber) cardNum = userBank.cardNumber;
        if (!holder && userBank.accountHolderName) holder = userBank.accountHolderName;
        if (!bName && userBank.bankName) bName = userBank.bankName;
      }
    }

    const cleanCard = toEnglishDigits(cardNum || '').replace(/[\s-]/g, '').replace(/\D/g, '');
    let cleanShaba = toEnglishDigits(shabaNum || '').replace(/[\s-]/g, '').toUpperCase();
    if (cleanShaba && !cleanShaba.startsWith('IR')) {
      cleanShaba = 'IR' + cleanShaba.replace(/^IR/i, '');
    }

    const trackingCode = `WDR-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;
    const balanceBefore = Number(wallet.balance);
    const balanceAfter = balanceBefore - data.amount;

    const [updatedWallet, withdrawalRecord] = await this.prisma.$transaction(async (tx) => {
      const w = await tx.wallet.update({
        where: { id: wallet.id },
        data: { balance: balanceAfter },
      });

      const withdrawal = await tx.walletWithdrawal.create({
        data: {
          walletId: wallet.id,
          amount: data.amount,
          status: 'PENDING',
          cardNumber: cleanCard,
          shabaNumber: cleanShaba,
          accountHolder: holder || data.accountHolder || 'صاحب حساب',
          bankName: bName || data.bankName || detectBankNameFromCard(cleanCard),
          trackingCode,
        },
      });

      await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: 'WITHDRAWAL',
          amount: -data.amount,
          balanceBefore,
          balanceAfter,
          trackingCode,
          referenceType: 'WITHDRAWAL',
          referenceId: withdrawal.id,
          description: `درخواست تسویه وجه به کارت ${cleanCard || 'پروفایل'} و شبا ${cleanShaba}`,
        },
      });

      return [w, withdrawal];
    });

    return {
      id: withdrawalRecord.id,
      amount: Number(withdrawalRecord.amount),
      status: 'PENDING',
      statusLabel: 'در انتظار پردازش',
      bankAccountTitle: withdrawalRecord.bankName || undefined,
      shabaNumber: withdrawalRecord.shabaNumber || undefined,
      cardNumber: withdrawalRecord.cardNumber || undefined,
      accountHolder: withdrawalRecord.accountHolder || undefined,
      trackingCode: withdrawalRecord.trackingCode || undefined,
      requestedAt: withdrawalRecord.requestedAt,
    };
  }

  async getAdminWithdrawals(query: {
    status?: string;
    search?: string;
    skip?: number;
    take?: number;
  }): Promise<{
    items: any[];
    total: number;
    metrics: {
      pendingCount: number;
      pendingAmount: number;
      completedCount: number;
      completedAmount: number;
    };
  }> {
    const where: any = {};
    if (query.status && query.status !== 'all') {
      where.status = query.status.toUpperCase();
    }
    if (query.search && query.search.trim()) {
      const q = query.search.trim();
      where.OR = [
        { trackingCode: { contains: q, mode: 'insensitive' } },
        { cardNumber: { contains: q } },
        { shabaNumber: { contains: q, mode: 'insensitive' } },
        { accountHolder: { contains: q, mode: 'insensitive' } },
        { wallet: { user: { name: { contains: q, mode: 'insensitive' } } } },
        { wallet: { user: { phone: { contains: q } } } },
      ];
    }

    const [items, total, allForMetrics] = await Promise.all([
      this.prisma.walletWithdrawal.findMany({
        where,
        include: {
          wallet: {
            include: {
              user: true,
            },
          },
        },
        orderBy: { requestedAt: 'desc' },
        skip: query.skip || 0,
        take: query.take || 20,
      }),
      this.prisma.walletWithdrawal.count({ where }),
      this.prisma.walletWithdrawal.findMany({
        select: { status: true, amount: true },
      }),
    ]);

    let pendingCount = 0;
    let pendingAmount = 0;
    let completedCount = 0;
    let completedAmount = 0;

    for (const w of allForMetrics) {
      if (w.status === 'PENDING' || w.status === 'PROCESSING') {
        pendingCount++;
        pendingAmount += Number(w.amount);
      } else if (w.status === 'COMPLETED') {
        completedCount++;
        completedAmount += Number(w.amount);
      }
    }

    const wdLabels: Record<string, string> = {
      PENDING: 'در انتظار پردازش',
      PROCESSING: 'در حال واریز',
      COMPLETED: 'تسویه موفق',
      REJECTED: 'رد شده',
      CANCELLED: 'لغو شده',
    };

    return {
      total,
      metrics: {
        pendingCount,
        pendingAmount,
        completedCount,
        completedAmount,
      },
      items: items.map((w) => ({
        id: w.id,
        amount: Number(w.amount),
        status: w.status,
        statusLabel: wdLabels[w.status] || w.status,
        bankAccountTitle: w.bankName || undefined,
        shabaNumber: w.shabaNumber || undefined,
        cardNumber: w.cardNumber || undefined,
        accountHolder: w.accountHolder || undefined,
        trackingCode: w.trackingCode || undefined,
        payoutReference: w.payoutReference || undefined,
        rejectionReason: w.rejectionReason || undefined,
        requestedAt: w.requestedAt,
        processedAt: w.processedAt || undefined,
        user: w.wallet.user
          ? {
              id: w.wallet.user.id,
              name: w.wallet.user.name,
              phone: w.wallet.user.phone,
              email: w.wallet.user.email,
            }
          : undefined,
      })),
    };
  }

  async getAdminDeposits(query: {
    search?: string;
    skip?: number;
    take?: number;
  }): Promise<{ items: any[]; total: number; totalAmount: number }> {
    const where: any = { type: 'DEPOSIT' };
    if (query.search && query.search.trim()) {
      const q = query.search.trim();
      where.OR = [
        { trackingCode: { contains: q, mode: 'insensitive' } },
        { referenceId: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { wallet: { user: { name: { contains: q, mode: 'insensitive' } } } },
        { wallet: { user: { phone: { contains: q } } } },
      ];
    }

    const [items, total, totalAmountAgg] = await Promise.all([
      this.prisma.walletTransaction.findMany({
        where,
        include: {
          wallet: {
            include: {
              user: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: query.skip || 0,
        take: query.take || 20,
      }),
      this.prisma.walletTransaction.count({ where }),
      this.prisma.walletTransaction.aggregate({
        where: { type: 'DEPOSIT' },
        _sum: { amount: true },
      }),
    ]);

    return {
      total,
      totalAmount: Number(totalAmountAgg._sum.amount || 0),
      items: items.map((tx) => ({
        id: tx.id,
        type: tx.type,
        typeLabel: 'افزایش موجودی',
        amount: Number(tx.amount),
        balanceBefore: Number(tx.balanceBefore),
        balanceAfter: Number(tx.balanceAfter),
        trackingCode: tx.trackingCode,
        referenceType: tx.referenceType || undefined,
        referenceId: tx.referenceId || undefined,
        description: tx.description || undefined,
        createdAt: tx.createdAt,
        user: tx.wallet.user
          ? {
              id: tx.wallet.user.id,
              name: tx.wallet.user.name,
              phone: tx.wallet.user.phone,
              email: tx.wallet.user.email,
            }
          : undefined,
      })),
    };
  }

  async updateWithdrawalStatus(
    withdrawalId: string,
    status: 'PROCESSING' | 'COMPLETED' | 'REJECTED' | 'CANCELLED',
    payoutReference?: string,
    rejectionReason?: string,
    adminUserId?: string,
  ): Promise<UserWalletWithdrawal> {
    const withdrawal = await this.prisma.walletWithdrawal.findUnique({
      where: { id: withdrawalId },
      include: { wallet: true },
    });
    if (!withdrawal) {
      throw new NotFoundException(`درخواست تسویه با شناسه ${withdrawalId} یافت نشد.`);
    }

    const newStatus = status.toUpperCase() as any;
    const oldStatus = withdrawal.status;

    await this.prisma.$transaction(async (tx) => {
      if ((newStatus === 'REJECTED' || newStatus === 'CANCELLED') && oldStatus !== 'REJECTED' && oldStatus !== 'CANCELLED') {
        const refundAmount = Number(withdrawal.amount);
        const balanceBefore = Number(withdrawal.wallet.balance);
        const balanceAfter = balanceBefore + refundAmount;

        await tx.wallet.update({
          where: { id: withdrawal.walletId },
          data: { balance: balanceAfter },
        });

        await tx.walletTransaction.create({
          data: {
            walletId: withdrawal.walletId,
            type: 'REFUND',
            amount: refundAmount,
            balanceBefore,
            balanceAfter,
            trackingCode: `REF-${withdrawal.trackingCode || withdrawal.id.slice(0, 8)}`,
            referenceType: 'WITHDRAWAL_REFUND',
            referenceId: withdrawal.id,
            description: `استرداد وجه تسویه رد شده: ${rejectionReason || 'عدم تأیید واحد مالی'}`,
          },
        });
      }

      await tx.walletWithdrawal.update({
        where: { id: withdrawalId },
        data: {
          status: newStatus,
          payoutReference: payoutReference,
          rejectionReason: rejectionReason,
          processedAt: new Date(),
          processedBy: adminUserId,
        },
      });
    });

    const updated = await this.prisma.walletWithdrawal.findUnique({
      where: { id: withdrawalId },
    });

    const wdLabels: Record<string, string> = {
      PENDING: 'در انتظار پردازش',
      PROCESSING: 'در حال واریز',
      COMPLETED: 'تسویه موفق',
      REJECTED: 'رد شده',
      CANCELLED: 'لغو شده',
    };

    return {
      id: updated!.id,
      amount: Number(updated!.amount),
      status: updated!.status as any,
      statusLabel: wdLabels[updated!.status] || updated!.status,
      bankAccountTitle: updated!.bankName || undefined,
      shabaNumber: updated!.shabaNumber || undefined,
      cardNumber: updated!.cardNumber || undefined,
      accountHolder: updated!.accountHolder || undefined,
      trackingCode: updated!.trackingCode || undefined,
      payoutReference: updated!.payoutReference || undefined,
      rejectionReason: updated!.rejectionReason || undefined,
      requestedAt: updated!.requestedAt,
      processedAt: updated!.processedAt || undefined,
    };
  }

  async getUserFavorites(userId: string): Promise<UserFavoriteDetails[]> {
    const favs = await this.prisma.userFavorite.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            brand: true,
            category: true,
            images: { where: { isPrimary: true }, take: 1 },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return favs.map((f) => ({
      id: f.id,
      productId: f.productId,
      title: f.product.name,
      slug: f.product.slug,
      sku: f.product.sku || undefined,
      brand: f.product.brand?.name,
      category: f.product.category?.shortName || f.product.category?.longName,
      basePrice: Number(f.product.basePrice),
      ratingAvg: Number(f.product.ratingAvg),
      inStock: f.product.status === 'ACTIVE',
      imageUrl: f.product.images?.[0]?.url,
      addedAt: f.createdAt,
    }));
  }

  async addFavorite(userId: string, productId: string): Promise<UserFavoriteDetails> {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(productId);
    let resolvedId = productId;
    if (!isUuid) {
      const prod = await this.prisma.product.findUnique({
        where: { slug: productId },
        select: { id: true },
      });
      if (prod) resolvedId = prod.id;
    }

    const fav = await this.prisma.userFavorite.upsert({
      where: {
        uq_user_favorite: {
          userId,
          productId: resolvedId,
        },
      },
      update: {},
      create: {
        userId,
        productId: resolvedId,
      },
      include: {
        product: {
          include: {
            brand: true,
            category: true,
            images: { where: { isPrimary: true }, take: 1 },
          },
        },
      },
    });

    return {
      id: fav.id,
      productId: fav.productId,
      title: fav.product.name,
      slug: fav.product.slug,
      sku: fav.product.sku || undefined,
      brand: fav.product.brand?.name,
      category: fav.product.category?.shortName || fav.product.category?.longName,
      basePrice: Number(fav.product.basePrice),
      ratingAvg: Number(fav.product.ratingAvg),
      inStock: fav.product.status === 'ACTIVE',
      imageUrl: fav.product.images?.[0]?.url,
      addedAt: fav.createdAt,
    };
  }

  async removeFavorite(userId: string, productId: string): Promise<boolean> {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(productId);
    let resolvedId = productId;
    if (!isUuid) {
      const prod = await this.prisma.product.findUnique({
        where: { slug: productId },
        select: { id: true },
      });
      if (prod) resolvedId = prod.id;
    }

    const res = await this.prisma.userFavorite.deleteMany({
      where: {
        userId,
        OR: [{ id: resolvedId }, { productId: resolvedId }],
      },
    });
    return res.count > 0;
  }

  async isFavorite(userId: string, productId: string): Promise<boolean> {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(productId);
    let resolvedId = productId;
    if (!isUuid) {
      const prod = await this.prisma.product.findUnique({
        where: { slug: productId },
        select: { id: true },
      });
      if (!prod) return false;
      resolvedId = prod.id;
    }

    const count = await this.prisma.userFavorite.count({
      where: { userId, productId: resolvedId },
    });
    return count > 0;
  }

  async getUserRfqInquiries(userId: string): Promise<UserRfqDetails[]> {
    const rfqs = await this.prisma.rfqInquiry.findMany({
      where: { userId },
      include: {
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    const statusLabels: Record<string, string> = {
      PENDING_QUOTE: 'در انتظار صدور پیش‌فاکتور',
      QUOTED: 'پیش‌فاکتور رسمی صادر شد',
      EXPIRED: 'منقضی شده',
      CONVERTED: 'تبدیل به خرید نهایی',
    };
    return rfqs.map((r) => ({
      id: r.id,
      rfqNumber: r.rfqNumber,
      userId: r.userId,
      projectTitle: r.projectTitle,
      companyName: r.companyName || undefined,
      clientPhone: r.clientPhone,
      clientEmail: r.clientEmail || undefined,
      status: (r.status.toLowerCase() as any),
      statusLabel: statusLabels[r.status] || r.status,
      urgent: r.urgent,
      deadlineHours: r.deadlineHours,
      discountPercent: Number(r.discountPercent),
      validityDays: r.validityDays,
      estimatedValue: Number(r.estimatedValue),
      finalQuotedAmount: r.finalQuotedAmount ? Number(r.finalQuotedAmount) : undefined,
      quotationIssuedAt: r.quotationIssuedAt || undefined,
      projectLocation: r.projectLocation || undefined,
      notes: r.notes || undefined,
      createdAt: r.createdAt,
      items: r.items.map((it) => ({
        id: it.id,
        sku: it.sku,
        title: it.title,
        brand: it.brand || undefined,
        category: it.category || undefined,
        requestedQty: it.requestedQty,
        unitPrice: Number(it.unitPrice),
        stockStatus: it.stockStatus,
        suggestedAlternative: it.suggestedAlternative || undefined,
        specsSummary: it.specsSummary || undefined,
      })),
    }));
  }

  async addRfqInquiry(userId: string, rfq: Partial<UserRfqDetails>): Promise<UserRfqDetails> {
    const created = await this.prisma.rfqInquiry.create({
      data: {
        rfqNumber: rfq.rfqNumber || `RFQ-1403-0${Math.floor(Math.random() * 900) + 100}`,
        userId,
        projectTitle: rfq.projectTitle || 'پروژه سازمانی ققنوس',
        companyName: rfq.companyName,
        clientPhone: rfq.clientPhone || '۰۹۱۲۰۰۰۰۰۰۰',
        clientEmail: rfq.clientEmail,
        status: 'PENDING_QUOTE',
        urgent: !!rfq.urgent,
        deadlineHours: rfq.deadlineHours || 48,
        discountPercent: rfq.discountPercent || 0,
        validityDays: rfq.validityDays || 7,
        estimatedValue: BigInt(rfq.estimatedValue || 0),
        finalQuotedAmount: rfq.finalQuotedAmount ? BigInt(rfq.finalQuotedAmount) : null,
        projectLocation: rfq.projectLocation,
        notes: rfq.notes,
        items: {
          create: (rfq.items || []).map((it) => ({
            sku: it.sku || 'SKU-UNKNOWN',
            title: it.title || 'قلم درخواستی',
            brand: it.brand,
            category: it.category,
            requestedQty: it.requestedQty || 1,
            unitPrice: BigInt(it.unitPrice || 0),
            stockStatus: it.stockStatus || 'available',
            suggestedAlternative: it.suggestedAlternative,
            specsSummary: it.specsSummary,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    return {
      id: created.id,
      rfqNumber: created.rfqNumber,
      userId: created.userId,
      projectTitle: created.projectTitle,
      companyName: created.companyName || undefined,
      clientPhone: created.clientPhone,
      clientEmail: created.clientEmail || undefined,
      status: 'pending_quote',
      statusLabel: 'در صف بررسی مهندسی فروش',
      urgent: created.urgent,
      deadlineHours: created.deadlineHours,
      discountPercent: Number(created.discountPercent),
      validityDays: created.validityDays,
      estimatedValue: Number(created.estimatedValue),
      finalQuotedAmount: created.finalQuotedAmount ? Number(created.finalQuotedAmount) : undefined,
      quotationIssuedAt: created.quotationIssuedAt || undefined,
      projectLocation: created.projectLocation || undefined,
      notes: created.notes || undefined,
      createdAt: created.createdAt,
      items: (created.items || []).map((it) => ({
        id: it.id,
        sku: it.sku,
        title: it.title,
        brand: it.brand || undefined,
        category: it.category || undefined,
        requestedQty: it.requestedQty,
        unitPrice: Number(it.unitPrice),
        stockStatus: it.stockStatus,
        suggestedAlternative: it.suggestedAlternative || undefined,
        specsSummary: it.specsSummary || undefined,
      })),
    };
  }

  async getAllRfqInquiries(): Promise<UserRfqDetails[]> {
    const rfqs = await this.prisma.rfqInquiry.findMany({
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
    return rfqs.map((r) => ({
      id: r.id,
      rfqNumber: r.rfqNumber,
      userId: r.userId,
      projectTitle: r.projectTitle,
      companyName: r.companyName || undefined,
      clientPhone: r.clientPhone,
      clientEmail: r.clientEmail || undefined,
      status: r.status === 'QUOTED' ? 'quoted' : r.status === 'EXPIRED' ? 'expired' : 'pending_quote',
      statusLabel: r.status === 'QUOTED' ? 'پیش‌فاکتور صادر شده است' : 'در صف بررسی مهندسی فروش',
      urgent: r.urgent,
      deadlineHours: r.deadlineHours,
      discountPercent: Number(r.discountPercent),
      validityDays: r.validityDays,
      estimatedValue: Number(r.estimatedValue),
      finalQuotedAmount: r.finalQuotedAmount ? Number(r.finalQuotedAmount) : undefined,
      quotationIssuedAt: r.quotationIssuedAt || undefined,
      projectLocation: r.projectLocation || undefined,
      notes: r.notes || undefined,
      createdAt: r.createdAt,
      items: (r.items || []).map((it) => ({
        id: it.id,
        sku: it.sku,
        title: it.title,
        brand: it.brand || undefined,
        category: it.category || undefined,
        requestedQty: it.requestedQty,
        unitPrice: Number(it.unitPrice),
        stockStatus: it.stockStatus,
        suggestedAlternative: it.suggestedAlternative || undefined,
        specsSummary: it.specsSummary || undefined,
      })),
    }));
  }

  async getRfqById(id: string): Promise<UserRfqDetails | null> {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    const rfq = await this.prisma.rfqInquiry.findFirst({
      where: isUuid ? { id } : { rfqNumber: id },
      include: { items: true },
    });
    if (!rfq) return null;

    const statusMap =
      rfq.status === 'QUOTED'
        ? { key: 'quoted' as const, label: 'پیش‌فاکتور صادر شده است' }
        : rfq.status === 'EXPIRED'
        ? { key: 'expired' as const, label: 'منقضی شده' }
        : rfq.status === 'CONVERTED'
        ? { key: 'converted' as const, label: 'تبدیل به سفارش قطعی' }
        : { key: 'pending_quote' as const, label: 'در صف بررسی مهندسی فروش' };

    return {
      id: rfq.id,
      rfqNumber: rfq.rfqNumber,
      userId: rfq.userId,
      projectTitle: rfq.projectTitle,
      companyName: rfq.companyName || undefined,
      clientPhone: rfq.clientPhone,
      clientEmail: rfq.clientEmail || undefined,
      status: statusMap.key,
      statusLabel: statusMap.label,
      urgent: rfq.urgent,
      deadlineHours: rfq.deadlineHours,
      discountPercent: Number(rfq.discountPercent),
      validityDays: rfq.validityDays,
      estimatedValue: Number(rfq.estimatedValue),
      finalQuotedAmount: rfq.finalQuotedAmount ? Number(rfq.finalQuotedAmount) : undefined,
      quotationIssuedAt: rfq.quotationIssuedAt || undefined,
      projectLocation: rfq.projectLocation || undefined,
      notes: rfq.notes || undefined,
      createdAt: rfq.createdAt,
      items: (rfq.items || []).map((it) => ({
        id: it.id,
        sku: it.sku,
        title: it.title,
        brand: it.brand || undefined,
        category: it.category || undefined,
        requestedQty: it.requestedQty,
        unitPrice: Number(it.unitPrice),
        stockStatus: it.stockStatus,
        suggestedAlternative: it.suggestedAlternative || undefined,
        specsSummary: it.specsSummary || undefined,
      })),
    };
  }

  async updateRfqQuote(
    id: string,
    quote: {
      finalQuotedAmount: number;
      discountPercent?: number;
      validityDays?: number;
      notes?: string;
      status?: string;
    },
  ): Promise<UserRfqDetails> {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    const existing = await this.prisma.rfqInquiry.findFirst({
      where: isUuid ? { id } : { rfqNumber: id },
    });
    if (!existing) {
      throw new Error(`استعلام با شناسه ${id} یافت نشد.`);
    }

    const updated = await this.prisma.rfqInquiry.update({
      where: { id: existing.id },
      data: {
        finalQuotedAmount: BigInt(Math.round(quote.finalQuotedAmount)),
        discountPercent: quote.discountPercent !== undefined ? quote.discountPercent : existing.discountPercent,
        validityDays: quote.validityDays !== undefined ? quote.validityDays : existing.validityDays,
        quotationIssuedAt: new Date(),
        status: (quote.status?.toUpperCase() || 'QUOTED') as any,
        notes: quote.notes !== undefined ? quote.notes : existing.notes,
      },
      include: { items: true },
    });

    return {
      id: updated.id,
      rfqNumber: updated.rfqNumber,
      userId: updated.userId,
      projectTitle: updated.projectTitle,
      companyName: updated.companyName || undefined,
      clientPhone: updated.clientPhone,
      clientEmail: updated.clientEmail || undefined,
      status: 'quoted',
      statusLabel: 'پیش‌فاکتور صادر شده است',
      urgent: updated.urgent,
      deadlineHours: updated.deadlineHours,
      discountPercent: Number(updated.discountPercent),
      validityDays: updated.validityDays,
      estimatedValue: Number(updated.estimatedValue),
      finalQuotedAmount: updated.finalQuotedAmount ? Number(updated.finalQuotedAmount) : undefined,
      quotationIssuedAt: updated.quotationIssuedAt || undefined,
      projectLocation: updated.projectLocation || undefined,
      notes: updated.notes || undefined,
      createdAt: updated.createdAt,
      items: (updated.items || []).map((it) => ({
        id: it.id,
        sku: it.sku,
        title: it.title,
        brand: it.brand || undefined,
        category: it.category || undefined,
        requestedQty: it.requestedQty,
        unitPrice: Number(it.unitPrice),
        stockStatus: it.stockStatus,
        suggestedAlternative: it.suggestedAlternative || undefined,
        specsSummary: it.specsSummary || undefined,
      })),
    };
  }

  async updateRfqStatus(id: string, status: string): Promise<UserRfqDetails> {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    const existing = await this.prisma.rfqInquiry.findFirst({
      where: isUuid ? { id } : { rfqNumber: id },
    });
    if (!existing) {
      throw new Error(`استعلام با شناسه ${id} یافت نشد.`);
    }

    const updated = await this.prisma.rfqInquiry.update({
      where: { id: existing.id },
      data: {
        status: status.toUpperCase() as any,
      },
      include: { items: true },
    });

    const statusMap =
      updated.status === 'QUOTED'
        ? { key: 'quoted' as const, label: 'پیش‌فاکتور صادر شده است' }
        : updated.status === 'EXPIRED'
        ? { key: 'expired' as const, label: 'منقضی شده' }
        : updated.status === 'CONVERTED'
        ? { key: 'converted' as const, label: 'تبدیل به سفارش قطعی' }
        : { key: 'pending_quote' as const, label: 'در صف بررسی مهندسی فروش' };

    return {
      id: updated.id,
      rfqNumber: updated.rfqNumber,
      userId: updated.userId,
      projectTitle: updated.projectTitle,
      companyName: updated.companyName || undefined,
      clientPhone: updated.clientPhone,
      clientEmail: updated.clientEmail || undefined,
      status: statusMap.key,
      statusLabel: statusMap.label,
      urgent: updated.urgent,
      deadlineHours: updated.deadlineHours,
      discountPercent: Number(updated.discountPercent),
      validityDays: updated.validityDays,
      estimatedValue: Number(updated.estimatedValue),
      finalQuotedAmount: updated.finalQuotedAmount ? Number(updated.finalQuotedAmount) : undefined,
      quotationIssuedAt: updated.quotationIssuedAt || undefined,
      projectLocation: updated.projectLocation || undefined,
      notes: updated.notes || undefined,
      createdAt: updated.createdAt,
      items: (updated.items || []).map((it) => ({
        id: it.id,
        sku: it.sku,
        title: it.title,
        brand: it.brand || undefined,
        category: it.category || undefined,
        requestedQty: it.requestedQty,
        unitPrice: Number(it.unitPrice),
        stockStatus: it.stockStatus,
        suggestedAlternative: it.suggestedAlternative || undefined,
        specsSummary: it.specsSummary || undefined,
      })),
    };
  }

  async deleteRfq(id: string, userId?: string): Promise<boolean> {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    const where: any = isUuid ? { id } : { rfqNumber: id };
    if (userId) where.userId = userId;

    const existing = await this.prisma.rfqInquiry.findFirst({ where });
    if (!existing) return false;

    await this.prisma.rfqInquiryItem.deleteMany({ where: { rfqId: existing.id } });
    await this.prisma.rfqInquiry.delete({ where: { id: existing.id } });
    return true;
  }

  async getUserAuthenticityInquiries(userId: string): Promise<UserAuthenticityDetails[]> {
    const inqs = await this.prisma.authenticityInquiry.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    const statusLabels: Record<string, string> = {
      GENUINE: 'اصیل - دارای گارانتی فعال معتبر',
      COUNTERFEIT: 'تقلبی / غیر اصیل',
      INVALID_CODE: 'سریال نامعتبر',
      EXPIRED: 'گارانتی منقضی شده',
    };
    return inqs.map((q) => {
      let days = 0;
      if (q.endDate) {
        const diff = q.endDate.getTime() - Date.now();
        days = Math.max(0, Math.ceil(diff / (1000 * 3600 * 24)));
      }
      return {
        id: q.id,
        userId: q.userId || undefined,
        serialNumber: q.serialNumber,
        hologramCode: q.hologramCode || undefined,
        productName: q.productName,
        brand: q.brand,
        model: q.model || undefined,
        warrantyType: q.warrantyType || 'گارانتی اصالت ققنوس',
        status: (q.status === 'GENUINE' ? (days > 30 ? 'active' : 'expiring_soon') : q.status === 'EXPIRED' ? 'expired' : 'invalid'),
        statusLabel: statusLabels[q.status] || q.status,
        isAuthentic: q.isAuthentic,
        startDate: q.startDate || undefined,
        endDate: q.endDate || undefined,
        daysRemaining: days,
        inquiryIp: q.inquiryIp || undefined,
        notes: q.notes || undefined,
        createdAt: q.createdAt,
      };
    });
  }

  async addAuthenticityInquiry(inquiry: Partial<UserAuthenticityDetails>): Promise<UserAuthenticityDetails> {
    const created = await this.prisma.authenticityInquiry.create({
      data: {
        userId: inquiry.userId || null,
        serialNumber: (inquiry.serialNumber || '').trim().toUpperCase(),
        hologramCode: inquiry.hologramCode,
        productName: inquiry.productName || 'تجهیزات شبکه ققنوس',
        brand: inquiry.brand || 'Cisco',
        model: inquiry.model,
        warrantyType: inquiry.warrantyType || 'گارانتی طلایی ۳۶ ماهه تعویض درجا ققنوس',
        status: 'GENUINE',
        isAuthentic: inquiry.isAuthentic !== false,
        startDate: inquiry.startDate || new Date(),
        endDate: inquiry.endDate || new Date(Date.now() + 365 * 24 * 3600 * 1000 * 3),
        inquiryIp: inquiry.inquiryIp,
        notes: inquiry.notes,
      },
    });

    return {
      id: created.id,
      userId: created.userId || undefined,
      serialNumber: created.serialNumber,
      hologramCode: created.hologramCode || undefined,
      productName: created.productName,
      brand: created.brand,
      model: created.model || undefined,
      warrantyType: created.warrantyType || 'گارانتی طلایی ۳۶ ماهه تعویض درجا ققنوس',
      status: 'active',
      statusLabel: 'اصیل - دارای گارانتی فعال معتبر',
      isAuthentic: created.isAuthentic,
      startDate: created.startDate || undefined,
      endDate: created.endDate || undefined,
      daysRemaining: 1095,
      inquiryIp: created.inquiryIp || undefined,
      notes: created.notes || undefined,
      createdAt: created.createdAt,
    };
  }

  async findAuthenticityBySerial(serialNumber: string): Promise<UserAuthenticityDetails | null> {
    const cleanSerial = serialNumber.trim().toUpperCase();
    const found = await this.prisma.authenticityInquiry.findFirst({
      where: {
        serialNumber: {
          equals: cleanSerial,
          mode: 'insensitive',
        },
      },
    });
    if (!found) return null;

    let days = 0;
    if (found.endDate) {
      const diff = found.endDate.getTime() - Date.now();
      days = Math.max(0, Math.ceil(diff / (1000 * 3600 * 24)));
    }

    return {
      id: found.id,
      userId: found.userId || undefined,
      serialNumber: found.serialNumber,
      hologramCode: found.hologramCode || undefined,
      productName: found.productName,
      brand: found.brand,
      model: found.model || undefined,
      warrantyType: found.warrantyType || 'گارانتی طلایی ۳۶ ماهه تعویض درجا ققنوس',
      status: (found.status === 'GENUINE' ? (days > 30 ? 'active' : 'expiring_soon') : found.status === 'EXPIRED' ? 'expired' : 'invalid'),
      statusLabel: found.status === 'GENUINE' ? 'اصیل - دارای گارانتی فعال معتبر' : 'نامعتبر',
      isAuthentic: found.isAuthentic,
      startDate: found.startDate || undefined,
      endDate: found.endDate || undefined,
      daysRemaining: days,
      inquiryIp: found.inquiryIp || undefined,
      notes: found.notes || undefined,
      createdAt: found.createdAt,
    };
  }

  private inMemoryCheques = new Map<string, any[]>();

  async getUserCheques(userId: string): Promise<any[]> {
    return this.inMemoryCheques.get(userId) || [];
  }

  async addCheque(userId: string, cheque: any): Promise<any> {
    const list = this.inMemoryCheques.get(userId) || [];
    const created = {
      id: cheque.id || `pchq_${Date.now()}`,
      userId,
      chequeId: cheque.chequeId,
      serialNumber: cheque.serialNumber || `چک صیادی شماره ۰۴/${Math.floor(Math.random() * 9000) + 1000}`,
      bank: cheque.bank || 'بانک ملت',
      branch: cheque.branch || 'شعبه مرکزی',
      dueDate: cheque.dueDate || '۱۴۰۳/۰۸/۳۰',
      amount: Number(cheque.amount) || 0,
      status: cheque.status || 'registered',
      statusLabel: cheque.statusLabel || 'ثبت در سامانه صیاد بانک مرکزی',
      sayadStatus: cheque.sayadStatus || 'verified',
      createdAt: new Date().toISOString(),
    };
    list.unshift(created);
    this.inMemoryCheques.set(userId, list);
    return created;
  }

  async getUserLoyalty(userId: string): Promise<UserLoyaltyDetails | null> {
    const loyalty = await this.prisma.loyaltyAccount.findUnique({
      where: { userId },
      include: {
        currentTier: true,
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 30,
        },
      },
    });
    if (!loyalty) return null;
    const txLabels: Record<string, string> = {
      EARN: 'کسب امتیاز',
      REDEEM: 'مصرف امتیاز',
      REFUND: 'استرداد امتیاز',
      EXPIRE: 'انقضای امتیاز',
      ADJUSTMENT: 'اصلاح دستی امتیاز',
    };
    return {
      id: loyalty.id,
      userId: loyalty.userId,
      pointsBalance: loyalty.pointsBalance,
      lifetimePoints: loyalty.lifetimePoints,
      tierCode: loyalty.currentTier?.code || 'BRONZE',
      tierTitle: loyalty.currentTier?.title || 'برنزی',
      cashbackPercent: Number(loyalty.currentTier?.cashbackPercent || 0),
      transactions: loyalty.transactions.map((tx) => ({
        id: tx.id,
        type: (tx.type as any),
        typeLabel: txLabels[tx.type] || tx.type,
        points: tx.points,
        pointsBefore: tx.pointsBefore,
        pointsAfter: tx.pointsAfter,
        referenceType: tx.referenceType || undefined,
        description: tx.description || undefined,
        createdAt: tx.createdAt,
      })),
    };
  }

  async getUserSessions(userId: string): Promise<UserSessionDetails[]> {
    const sessions = await this.prisma.userSession.findMany({
      where: { userId },
      orderBy: { lastActiveAt: 'desc' },
    });
    return sessions.map((s, idx) => ({
      id: s.id,
      userId: s.userId,
      deviceName: s.deviceName || undefined,
      browser: s.browser || undefined,
      os: s.os || undefined,
      ipAddress: s.ipAddress || undefined,
      location: s.location || undefined,
      isCurrent: idx === 0 && !s.isRevoked,
      isRevoked: s.isRevoked,
      createdAt: s.createdAt,
      lastActiveAt: s.lastActiveAt,
      expiresAt: s.expiresAt,
    }));
  }

  async revokeUserSession(userId: string, sessionId: string): Promise<boolean> {
    const res = await this.prisma.userSession.updateMany({
      where: { id: sessionId, userId },
      data: { isRevoked: true },
    });
    return res.count > 0;
  }
}
