import { IUserRepository, UserFilterOptions } from '../../../domain/repositories/user.repository.interface.js';
import { User } from '../../../domain/entities/user.entity.js';
import { PhoneNumber } from '../../../domain/value-objects/phone-number.vo.js';
import { UserAddressEntity } from '../../../domain/entities/user-address.entity.js';
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
} from '../../../domain/entities/user-detail.types.js';

function toEnglishDigits(str?: string): string {
  if (!str) return '';
  return str
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 1776))
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 1632));
}

export class InMemoryUserRepository implements IUserRepository {
  private readonly users = new Map<string, User>();
  private readonly addresses = new Map<string, UserAddressEntity[]>();
  private readonly carts = new Map<string, UserCartDetails>();
  private readonly orders = new Map<string, UserOrderDetails[]>();
  private readonly invoices = new Map<string, any[]>();
  private readonly wallets = new Map<string, UserWalletDetails>();
  private readonly favorites = new Map<string, UserFavoriteDetails[]>();
  private readonly rfqInquiries = new Map<string, UserRfqDetails[]>();
  private readonly authenticityInquiries = new Map<string, UserAuthenticityDetails[]>();
  private readonly cheques = new Map<string, any[]>();
  private readonly loyaltyAccounts = new Map<string, UserLoyaltyDetails>();
  private readonly sessions = new Map<string, UserSessionDetails[]>();

  constructor() {
    // Initialized completely empty — zero mock data
  }

  public async findById(id: string): Promise<User | null> {
    const user = this.users.get(id);
    return user ? this.clone(user) : null;
  }

  public async findByEmail(email: string): Promise<User | null> {
    const normalized = email.trim().toLowerCase();
    for (const user of this.users.values()) {
      if (user.email.value === normalized) {
        return this.clone(user);
      }
    }
    return null;
  }

  public async findByPhone(phone: string): Promise<User | null> {
    const normalized = PhoneNumber.normalize(phone);
    for (const user of this.users.values()) {
      if (user.phone && user.phone.value === normalized) {
        return this.clone(user);
      }
    }
    return null;
  }

  public async findAll(filter?: UserFilterOptions): Promise<User[]> {
    let result = Array.from(this.users.values()).map((u) => this.clone(u));

    if (filter?.role && filter.role !== 'all') {
      const targetRole = filter.role.toLowerCase();
      result = result.filter((u) => {
        const uRole = u.role.toLowerCase();
        if (targetRole === 'admin') {
          return uRole === 'admin' || uRole === 'super_admin';
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

    if (filter?.status && filter.status !== 'all') {
      const targetStatus = filter.status.toLowerCase();
      result = result.filter((u) => {
        const uStatus = u.status.toLowerCase();
        return uStatus === targetStatus;
      });
    }

    if (filter?.search && filter.search.trim()) {
      const q = filter.search.toLowerCase().trim();
      result = result.filter((u) => {
        const nameMatch = u.name.toLowerCase().includes(q);
        const phoneMatch = u.phone?.value.includes(q) ?? false;
        const emailMatch = u.email.value.toLowerCase().includes(q);
        const nationalMatch = u.nationalCode?.includes(q) ?? false;
        const companyMatch = u.companyName?.toLowerCase().includes(q) ?? false;
        return nameMatch || phoneMatch || emailMatch || nationalMatch || companyMatch;
      });
    }

    // Sort by createdAt descending
    result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return result;
  }

  public async save(user: User): Promise<void> {
    this.users.set(user.id, this.clone(user));
  }

  public async delete(id: string): Promise<void> {
    this.users.delete(id);
    this.addresses.delete(id);
    this.carts.delete(id);
    this.orders.delete(id);
    this.invoices.delete(id);
    this.wallets.delete(id);
    this.favorites.delete(id);
    this.rfqInquiries.delete(id);
    this.authenticityInquiries.delete(id);
    this.loyaltyAccounts.delete(id);
    this.sessions.delete(id);
  }

  public clear(): void {
    this.users.clear();
    this.addresses.clear();
    this.carts.clear();
    this.orders.clear();
    this.invoices.clear();
    this.wallets.clear();
    this.favorites.clear();
    this.rfqInquiries.clear();
    this.authenticityInquiries.clear();
    this.loyaltyAccounts.clear();
    this.sessions.clear();
  }

  private clone(user: User): User {
    return new User({
      id: user.id,
      email: user.email,
      name: user.name,
      isActive: user.isActive,
      createdAt: new Date(user.createdAt.getTime()),
      updatedAt: new Date(user.updatedAt.getTime()),
      phone: user.phone ? PhoneNumber.create(user.phone.value) : null,
      phoneVerifiedAt: user.phoneVerifiedAt ? new Date(user.phoneVerifiedAt.getTime()) : null,
      status: user.status,
      role: user.role,
      security: user.security
        ? {
            ...user.security,
            pinLockedUntil: user.security.pinLockedUntil
              ? new Date(user.security.pinLockedUntil.getTime())
              : null,
          }
        : null,
      nationalCode: user.nationalCode,
      nationalCodeVerified: user.nationalCodeVerified,
      avatarUrl: user.avatarUrl,
      avatarStorageKey: user.avatarStorageKey,
      firstName: user.firstName,
      lastName: user.lastName,
      bio: user.bio,
      companyName: user.companyName,
      userTier: user.userTier,
      notes: user.notes,
      canBuyInternet: user.canBuyInternet,
      walletBalance: user.walletBalance,
      totalSpent: user.totalSpent,
      ordersCount: user.ordersCount,
      lastLogin: user.lastLogin,
      activities: user.activities ? [...user.activities] : [],
      cardNumber: user.cardNumber,
      shebaNumber: user.shebaNumber,
      bankName: user.bankName,
      accountHolderName: user.accountHolderName,
    });
  }

  // --- Subsystem Query Methods (Zero Mock Data) ---

  public async getUserAddresses(userId: string): Promise<UserAddressEntity[]> {
    return this.addresses.get(userId) || [];
  }

  public async getUserCart(userId: string): Promise<UserCartDetails | null> {
    return this.carts.get(userId) || null;
  }

  public async getUserOrders(userId: string): Promise<UserOrderDetails[]> {
    return this.orders.get(userId) || [];
  }

  public async getUserInvoices(userId: string): Promise<any[]> {
    return this.invoices.get(userId) || [];
  }

  public async getUserWallet(userId: string): Promise<UserWalletDetails | null> {
    return this.wallets.get(userId) || null;
  }

  public async creditUserWallet(
    userId: string,
    amount: number,
    trackingCode: string,
    refId: string,
  ): Promise<UserWalletDetails> {
    let wallet = this.wallets.get(userId);
    if (!wallet) {
      wallet = {
        id: `wal-${Date.now()}`,
        userId,
        balance: 0,
        lockedBalance: 0,
        currency: 'IRT',
        isActive: true,
        transactions: [],
        withdrawals: [],
      };
      this.wallets.set(userId, wallet);
    }
    const balanceBefore = wallet.balance;
    const balanceAfter = balanceBefore + amount;
    wallet.balance = balanceAfter;
    wallet.transactions.unshift({
      id: `tx-${Date.now()}`,
      type: 'DEPOSIT',
      typeLabel: 'افزایش موجودی',
      amount,
      balanceBefore,
      balanceAfter,
      trackingCode,
      referenceType: 'GATEWAY_CHARGE',
      referenceId: refId,
      description: `شارژ آنلاین کیف پول از طریق درگاه تستی زرین‌پال (شماره ارجاع: ${refId})`,
      createdAt: new Date(),
    });
    return wallet;
  }

  public async requestWalletWithdrawal(
    userId: string,
    data: {
      amount: number;
      cardNumber: string;
      shabaNumber: string;
      accountHolder?: string;
      bankName?: string;
    },
  ): Promise<UserWalletWithdrawal> {
    let wallet = this.wallets.get(userId);
    if (!wallet) {
      wallet = {
        id: `wal-${Date.now()}`,
        userId,
        balance: 0,
        lockedBalance: 0,
        currency: 'IRT',
        isActive: true,
        transactions: [],
        withdrawals: [],
      };
      this.wallets.set(userId, wallet);
    }

    if (wallet.balance < data.amount) {
      throw new Error('موجودی نقدی کیف پول برای این مبلغ تسویه کافی نیست.');
    }

    const trackingCode = `WDR-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;
    const balanceBefore = wallet.balance;
    const balanceAfter = balanceBefore - data.amount;
    wallet.balance = balanceAfter;

    const user = this.users.get(userId);
    const cardNum = data.cardNumber || user?.cardNumber || '';
    const shabaNum = data.shabaNumber || user?.shebaNumber || '';
    const holder = data.accountHolder || user?.accountHolderName || user?.name || 'صاحب حساب';
    const bName = data.bankName || user?.bankName || 'بانک مقصد';

    const cleanCard = toEnglishDigits(cardNum).replace(/[\s-]/g, '').replace(/\D/g, '');
    let cleanShaba = toEnglishDigits(shabaNum).replace(/[\s-]/g, '').toUpperCase();
    if (cleanShaba && !cleanShaba.startsWith('IR')) {
      cleanShaba = 'IR' + cleanShaba.replace(/^IR/i, '');
    }

    const withdrawal: UserWalletWithdrawal = {
      id: `wdr-${Date.now()}`,
      amount: data.amount,
      status: 'PENDING',
      statusLabel: 'در انتظار پردازش',
      bankAccountTitle: bName,
      shabaNumber: cleanShaba,
      cardNumber: cleanCard,
      accountHolder: holder,
      trackingCode,
      requestedAt: new Date(),
    };

    wallet.withdrawals.unshift(withdrawal);

    wallet.transactions.unshift({
      id: `tx-${Date.now()}`,
      type: 'WITHDRAWAL',
      typeLabel: 'برداشت وجه',
      amount: -data.amount,
      balanceBefore,
      balanceAfter,
      trackingCode,
      referenceType: 'WITHDRAWAL',
      referenceId: withdrawal.id,
      description: `درخواست تسویه وجه به کارت ${cleanCard || 'پروفایل'} و شبا ${cleanShaba}`,
      createdAt: new Date(),
    });

    return withdrawal;
  }

  public async getAdminWithdrawals(query: {
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
    const allWithdrawals: any[] = [];
    for (const [uid, wal] of this.wallets.entries()) {
      const user = this.users.get(uid);
      for (const w of wal.withdrawals || []) {
        allWithdrawals.push({
          ...w,
          user: user
            ? {
                id: user.id,
                name: user.name,
                phone: user.phone?.value || '',
                isPartner: false,
                role: 'مشتری عادی',
              }
            : null,
        });
      }
    }

    let filtered = allWithdrawals;
    if (query.status && query.status !== 'all') {
      filtered = filtered.filter((w) => w.status === query.status?.toUpperCase());
    }
    if (query.search?.trim()) {
      const q = query.search.trim().toLowerCase();
      filtered = filtered.filter(
        (w) =>
          w.trackingCode?.toLowerCase().includes(q) ||
          w.cardNumber?.includes(q) ||
          w.shabaNumber?.toLowerCase().includes(q) ||
          w.user?.name?.toLowerCase().includes(q) ||
          w.user?.phone?.includes(q),
      );
    }

    let pendingCount = 0;
    let pendingAmount = 0;
    let completedCount = 0;
    let completedAmount = 0;

    for (const w of allWithdrawals) {
      if (w.status === 'PENDING' || w.status === 'PROCESSING') {
        pendingCount++;
        pendingAmount += w.amount;
      } else if (w.status === 'COMPLETED') {
        completedCount++;
        completedAmount += w.amount;
      }
    }

    const start = query.skip || 0;
    const end = start + (query.take || 20);

    return {
      total: filtered.length,
      metrics: {
        pendingCount,
        pendingAmount,
        completedCount,
        completedAmount,
      },
      items: filtered.slice(start, end),
    };
  }

  public async getAdminDeposits(query: {
    search?: string;
    skip?: number;
    take?: number;
  }): Promise<{ items: any[]; total: number; totalAmount: number }> {
    const allDeposits: any[] = [];
    for (const [uid, wal] of this.wallets.entries()) {
      const user = this.users.get(uid);
      for (const tx of wal.transactions || []) {
        if (tx.type === 'DEPOSIT') {
          allDeposits.push({
            ...tx,
            user: user
              ? {
                  id: user.id,
                  name: user.name,
                  phone: user.phone?.value || '',
                  isPartner: false,
                  role: 'مشتری عادی',
                }
              : null,
          });
        }
      }
    }

    let filtered = allDeposits;
    if (query.search?.trim()) {
      const q = query.search.trim().toLowerCase();
      filtered = filtered.filter(
        (d) =>
          d.trackingCode?.toLowerCase().includes(q) ||
          d.description?.toLowerCase().includes(q) ||
          d.user?.name?.toLowerCase().includes(q) ||
          d.user?.phone?.includes(q),
      );
    }

    const totalAmount = allDeposits.reduce((acc, cur) => acc + (cur.amount || 0), 0);
    const start = query.skip || 0;
    const end = start + (query.take || 20);

    return {
      total: filtered.length,
      totalAmount,
      items: filtered.slice(start, end),
    };
  }

  public async updateWithdrawalStatus(
    withdrawalId: string,
    status: 'PROCESSING' | 'COMPLETED' | 'REJECTED' | 'CANCELLED',
    payoutReference?: string,
    rejectionReason?: string,
    adminUserId?: string,
  ): Promise<UserWalletWithdrawal> {
    for (const [_, wal] of this.wallets.entries()) {
      const w = wal.withdrawals.find((x) => x.id === withdrawalId);
      if (w) {
        if (
          (status === 'REJECTED' || status === 'CANCELLED') &&
          w.status !== 'REJECTED' &&
          w.status !== 'CANCELLED'
        ) {
          const balanceBefore = wal.balance;
          const balanceAfter = balanceBefore + w.amount;
          wal.balance = balanceAfter;
          wal.transactions.unshift({
            id: `tx-${Date.now()}`,
            type: 'REFUND',
            typeLabel: 'استرداد وجه',
            amount: w.amount,
            balanceBefore,
            balanceAfter,
            trackingCode: `REF-${Date.now().toString().slice(-6)}`,
            referenceType: 'WITHDRAWAL_REFUND',
            referenceId: w.id,
            description: `استرداد وجه تسویه رد شده (کد: ${w.trackingCode || w.id})${
              rejectionReason ? ` - علت: ${rejectionReason}` : ''
            }`,
            createdAt: new Date(),
          });
        }
        w.status = status;
        w.statusLabel =
          status === 'COMPLETED'
            ? 'تسویه موفق بانکی'
            : status === 'REJECTED'
            ? 'رد درخواست تسویه'
            : status === 'PROCESSING'
            ? 'در حال ارسال حواله پایا/ساتنا'
            : 'لغو شده';
        w.payoutReference = payoutReference;
        w.rejectionReason = rejectionReason;
        if (status === 'COMPLETED') w.processedAt = new Date();
        return w;
      }
    }
    throw new Error('درخواست برداشت یافت نشد.');
  }

  public async getUserFavorites(userId: string): Promise<UserFavoriteDetails[]> {
    return this.favorites.get(userId) || [];
  }

  public async addFavorite(userId: string, productId: string): Promise<UserFavoriteDetails> {
    const list = this.favorites.get(userId) || [];
    let existing = list.find((f) => f.productId === productId || f.id === productId || f.slug === productId);
    if (!existing) {
      existing = {
        id: crypto.randomUUID(),
        productId,
        title: 'محصول تستی شبکه',
        slug: `prod-${productId}`,
        basePrice: 15000000,
        ratingAvg: 5,
        inStock: true,
        images: ['/uploads/products/sample-switch-1.webp'],
        imageUrl: '/uploads/products/sample-switch-1.webp',
        addedAt: new Date(),
      };
      list.unshift(existing);
      this.favorites.set(userId, list);
    }
    return existing;
  }

  public async removeFavorite(userId: string, productId: string): Promise<boolean> {
    const list = this.favorites.get(userId) || [];
    const filtered = list.filter((f) => f.productId !== productId && f.id !== productId && f.slug !== productId);
    const deleted = filtered.length < list.length;
    this.favorites.set(userId, filtered);
    return deleted;
  }

  public async isFavorite(userId: string, productId: string): Promise<boolean> {
    const list = this.favorites.get(userId) || [];
    return list.some((f) => f.productId === productId || f.id === productId || f.slug === productId);
  }

  public async getUserRfqInquiries(userId: string): Promise<UserRfqDetails[]> {
    return this.rfqInquiries.get(userId) || [];
  }

  public async addRfqInquiry(userId: string, rfq: Partial<UserRfqDetails>): Promise<UserRfqDetails> {
    const list = this.rfqInquiries.get(userId) || [];
    const created: UserRfqDetails = {
      id: rfq.id || `rfq_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      rfqNumber: rfq.rfqNumber || `RFQ-1403-0${Math.floor(Math.random() * 900) + 100}`,
      userId,
      projectTitle: rfq.projectTitle || 'پروژه سازمانی ققنوس',
      companyName: rfq.companyName,
      clientPhone: rfq.clientPhone || '۰۹۱۲۰۰۰۰۰۰۰',
      clientEmail: rfq.clientEmail,
      status: rfq.status || 'pending_quote',
      statusLabel: rfq.statusLabel || 'در صف بررسی مهندسی فروش',
      urgent: !!rfq.urgent,
      deadlineHours: rfq.deadlineHours || 48,
      discountPercent: rfq.discountPercent || 0,
      validityDays: rfq.validityDays || 7,
      estimatedValue: rfq.estimatedValue || 0,
      finalQuotedAmount: rfq.finalQuotedAmount,
      quotationIssuedAt: rfq.quotationIssuedAt,
      projectLocation: rfq.projectLocation,
      notes: rfq.notes,
      createdAt: rfq.createdAt || new Date(),
      items: rfq.items || [],
    };
    list.unshift(created);
    this.rfqInquiries.set(userId, list);
    return created;
  }

  public async getAllRfqInquiries(): Promise<UserRfqDetails[]> {
    const all: UserRfqDetails[] = [];
    for (const list of this.rfqInquiries.values()) {
      all.push(...list);
    }
    return all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public async getRfqById(id: string): Promise<UserRfqDetails | null> {
    for (const list of this.rfqInquiries.values()) {
      const found = list.find((r) => r.id === id || r.rfqNumber === id);
      if (found) return found;
    }
    return null;
  }

  public async updateRfqQuote(
    id: string,
    quote: {
      finalQuotedAmount: number;
      discountPercent?: number;
      validityDays?: number;
      notes?: string;
      status?: string;
    },
  ): Promise<UserRfqDetails> {
    for (const [userId, list] of this.rfqInquiries.entries()) {
      const idx = list.findIndex((r) => r.id === id || r.rfqNumber === id);
      if (idx !== -1) {
        const item = list[idx];
        const updated: UserRfqDetails = {
          ...item,
          finalQuotedAmount: quote.finalQuotedAmount,
          discountPercent: quote.discountPercent !== undefined ? quote.discountPercent : item.discountPercent,
          validityDays: quote.validityDays !== undefined ? quote.validityDays : item.validityDays,
          quotationIssuedAt: new Date(),
          status: 'quoted',
          statusLabel: 'پیش‌فاکتور صادر شده است',
          notes: quote.notes !== undefined ? quote.notes : item.notes,
        };
        list[idx] = updated;
        this.rfqInquiries.set(userId, list);
        return updated;
      }
    }
    throw new Error(`RFQ not found: ${id}`);
  }

  public async updateRfqStatus(id: string, status: string): Promise<UserRfqDetails> {
    for (const [userId, list] of this.rfqInquiries.entries()) {
      const idx = list.findIndex((r) => r.id === id || r.rfqNumber === id);
      if (idx !== -1) {
        const item = list[idx];
        const st = status.toLowerCase() as any;
        const updated: UserRfqDetails = {
          ...item,
          status: st,
          statusLabel: st === 'quoted' ? 'پیش‌فاکتور صادر شده است' : st === 'converted' ? 'تبدیل به سفارش قطعی' : st === 'expired' ? 'منقضی شده' : 'در صف بررسی مهندسی فروش',
        };
        list[idx] = updated;
        this.rfqInquiries.set(userId, list);
        return updated;
      }
    }
    throw new Error(`RFQ not found: ${id}`);
  }

  public async deleteRfq(id: string, userId?: string): Promise<boolean> {
    for (const [uid, list] of this.rfqInquiries.entries()) {
      if (userId && uid !== userId) continue;
      const filtered = list.filter((r) => r.id !== id && r.rfqNumber !== id);
      if (filtered.length !== list.length) {
        this.rfqInquiries.set(uid, filtered);
        return true;
      }
    }
    return false;
  }

  public async getUserAuthenticityInquiries(userId: string): Promise<UserAuthenticityDetails[]> {
    return this.authenticityInquiries.get(userId) || [];
  }

  public async addAuthenticityInquiry(inquiry: Partial<UserAuthenticityDetails>): Promise<UserAuthenticityDetails> {
    const targetUserId = inquiry.userId || 'guest';
    const list = this.authenticityInquiries.get(targetUserId) || [];
    const created: UserAuthenticityDetails = {
      id: inquiry.id || `auth_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      userId: inquiry.userId,
      serialNumber: (inquiry.serialNumber || '').trim().toUpperCase(),
      hologramCode: inquiry.hologramCode,
      productName: inquiry.productName || 'تجهیزات شبکه ققنوس',
      brand: inquiry.brand || 'Cisco',
      model: inquiry.model,
      warrantyType: inquiry.warrantyType || 'گارانتی طلایی ۳۶ ماهه تعویض درجا ققنوس',
      status: inquiry.status || 'active',
      statusLabel: inquiry.statusLabel || 'اصیل - دارای گارانتی فعال معتبر',
      isAuthentic: inquiry.isAuthentic !== false,
      startDate: inquiry.startDate || new Date(),
      endDate: inquiry.endDate || new Date(Date.now() + 365 * 24 * 3600 * 1000 * 3),
      daysRemaining: inquiry.daysRemaining ?? 1095,
      inquiryIp: inquiry.inquiryIp,
      notes: inquiry.notes,
      createdAt: inquiry.createdAt || new Date(),
    };
    list.unshift(created);
    this.authenticityInquiries.set(targetUserId, list);
    return created;
  }

  public async findAuthenticityBySerial(serialNumber: string): Promise<UserAuthenticityDetails | null> {
    const cleanSerial = serialNumber.trim().toUpperCase();
    for (const list of this.authenticityInquiries.values()) {
      const match = list.find((a) => a.serialNumber.toUpperCase() === cleanSerial);
      if (match) return match;
    }
    return null;
  }

  public async getUserCheques(userId: string): Promise<any[]> {
    return this.cheques.get(userId) || [];
  }

  public async addCheque(userId: string, cheque: any): Promise<any> {
    const list = this.cheques.get(userId) || [];
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
    this.cheques.set(userId, list);
    return created;
  }

  public async getUserLoyalty(userId: string): Promise<UserLoyaltyDetails | null> {
    return this.loyaltyAccounts.get(userId) || null;
  }

  public async getUserSessions(userId: string): Promise<UserSessionDetails[]> {
    return this.sessions.get(userId) || [];
  }

  public async revokeUserSession(userId: string, sessionId: string): Promise<boolean> {
    const list = this.sessions.get(userId);
    if (!list) return false;
    const sess = list.find((s) => s.id === sessionId);
    if (sess) {
      sess.isRevoked = true;
      return true;
    }
    return false;
  }

  // --- Test Fixture Setters (For Unit Tests Only) ---

  public setAddresses(userId: string, addresses: UserAddressEntity[]): void {
    this.addresses.set(userId, addresses);
  }

  public setCart(userId: string, cart: UserCartDetails): void {
    this.carts.set(userId, cart);
  }

  public setOrders(userId: string, orders: UserOrderDetails[]): void {
    this.orders.set(userId, orders);
  }

  public setInvoices(userId: string, invoices: any[]): void {
    this.invoices.set(userId, invoices);
  }

  public setWallet(userId: string, wallet: UserWalletDetails): void {
    this.wallets.set(userId, wallet);
  }

  public setFavorites(userId: string, favorites: UserFavoriteDetails[]): void {
    this.favorites.set(userId, favorites);
  }

  public setRfqInquiries(userId: string, inquiries: UserRfqDetails[]): void {
    this.rfqInquiries.set(userId, inquiries);
  }

  public setAuthenticityInquiries(userId: string, inquiries: UserAuthenticityDetails[]): void {
    this.authenticityInquiries.set(userId, inquiries);
  }

  public setLoyalty(userId: string, loyalty: UserLoyaltyDetails): void {
    this.loyaltyAccounts.set(userId, loyalty);
  }

  public setSessions(userId: string, sessions: UserSessionDetails[]): void {
    this.sessions.set(userId, sessions);
  }
}
