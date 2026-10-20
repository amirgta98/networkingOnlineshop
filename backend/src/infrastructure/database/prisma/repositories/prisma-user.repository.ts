import { Injectable } from '@nestjs/common';
import { IUserRepository, UserFilterOptions } from '../../../../domain/repositories/user.repository.interface.js';
import { User } from '../../../../domain/entities/user.entity.js';
import { Email } from '../../../../domain/value-objects/email.vo.js';
import { PhoneNumber } from '../../../../domain/value-objects/phone-number.vo.js';
import { UserAddressEntity } from '../../../../domain/entities/user-address.entity.js';
import type {
  UserCartDetails,
  UserOrderDetails,
  UserWalletDetails,
  UserFavoriteDetails,
  UserRfqDetails,
  UserAuthenticityDetails,
  UserLoyaltyDetails,
  UserSessionDetails,
} from '../../../../domain/entities/user-detail.types.js';
import { PrismaService } from '../prisma.service.js';

@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<User | null> {
    const raw = await this.prisma.user.findUnique({
      where: { id },
      include: {
        profile: true,
        security: true,
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
