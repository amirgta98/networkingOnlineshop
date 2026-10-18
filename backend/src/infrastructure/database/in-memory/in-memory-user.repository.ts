import { IUserRepository, UserFilterOptions } from '../../../domain/repositories/user.repository.interface.js';
import { User } from '../../../domain/entities/user.entity.js';
import { Email } from '../../../domain/value-objects/email.vo.js';
import { PhoneNumber } from '../../../domain/value-objects/phone-number.vo.js';
import { UserAddressEntity } from '../../../domain/entities/user-address.entity.js';
import type {
  UserCartDetails,
  UserOrderDetails,
  UserWalletDetails,
  UserFavoriteDetails,
  UserRfqDetails,
  UserAuthenticityDetails,
  UserLoyaltyDetails,
  UserSessionDetails,
} from '../../../domain/entities/user-detail.types.js';

/**
 * In-Memory implementation of IUserRepository.
 * Used for development, testing, and isolated execution.
 */
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
  private readonly loyaltyAccounts = new Map<string, UserLoyaltyDetails>();
  private readonly sessions = new Map<string, UserSessionDetails[]>();

  constructor() {
    this.seedDemoUsers();
    this.seedSubsystems();
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
  }

  public clear(): void {
    this.users.clear();
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
      companyName: user.companyName,
      userTier: user.userTier,
      notes: user.notes,
      walletBalance: user.walletBalance,
      totalSpent: user.totalSpent,
      ordersCount: user.ordersCount,
      lastLogin: user.lastLogin,
      activities: user.activities,
    });
  }

  private seedDemoUsers(): void {
    // 1. عرفان سعیدی (مدیر سایت / SuperAdmin)
    const adminUser = new User({
      id: '00000000-0000-4000-a000-000000000001',
      name: 'عرفان سعیدی',
      email: Email.create('admin@fonix-academic.ir'),
      phone: PhoneNumber.create('09162947221'),
      phoneVerifiedAt: new Date(),
      isActive: true,
      role: 'admin',
      status: 'active',
      createdAt: new Date(Date.now() - 365 * 24 * 3600 * 1000),
      updatedAt: new Date(),
      nationalCode: '۰۰۷۹۸۲۳۴۰۱',
      nationalCodeVerified: true,
      companyName: 'تجهیزات شبکه ققنوس آکادمی (صاحب وبسایت)',
      userTier: 'gold',
      notes: 'دسترسی مدیر ارشد و مالک کل سیستم (SuperAdmin & Root).',
      ordersCount: 48,
      totalSpent: 840000000,
      walletBalance: 25000000,
      lastLogin: 'امروز - ۱۰:۴۸',
      activities: [
        {
          id: 'act-1',
          action: 'ورود موفق با اعتبارسنجی دو مرحله‌ای ۲FA',
          timestamp: 'امروز - ۱۰:۴۸',
          ip: '185.143.232.14',
          device: 'Chrome / Windows 11',
        },
        {
          id: 'act-2',
          action: 'تغییر وضعیت سفارش VX-9421 به تایید مالی',
          timestamp: 'امروز - ۱۰:۲۰',
          ip: '185.143.232.14',
        },
      ],
      security: {
        twoFactorEnabled: true,
        twoFactorMethod: 'PIN',
      },
    });
    this.users.set(adminUser.id, adminUser);

    // 2. صاحب سایت (مدیر ارشد)
    const adminUserOwner = new User({
      id: '00000000-0000-4000-a000-000000000097',
      name: 'صاحب وبسایت و مدیر ارشد',
      email: Email.create('owner@fonix-academic.ir'),
      phone: PhoneNumber.create('09134761097'),
      phoneVerifiedAt: new Date(),
      isActive: true,
      role: 'admin',
      status: 'active',
      createdAt: new Date(Date.now() - 400 * 24 * 3600 * 1000),
      updatedAt: new Date(),
      nationalCode: '۱۰۹۷۰۰۰۰۰۱',
      nationalCodeVerified: true,
      companyName: 'تجهیزات شبکه ققنوس آکادمی (مالک کل سیستم)',
      userTier: 'gold',
      notes: 'دسترسی تام صاحب وبسایت و مدیر ارشد (SuperAdmin & Owner).',
      ordersCount: 65,
      totalSpent: 1250000000,
      walletBalance: 50000000,
      lastLogin: 'امروز - ۱۲:۳۰',
      activities: [
        {
          id: 'act-owner-1',
          action: 'بررسی داشبورد فروش و تایید فاکتورهای رسمی',
          timestamp: 'امروز - ۱۲:۳۰',
          ip: '185.143.232.1',
          device: 'Chrome / Desktop',
        },
      ],
      security: {
        twoFactorEnabled: false,
        twoFactorMethod: 'PIN',
      },
    });
    this.users.set(adminUserOwner.id, adminUserOwner);

    // 3. مهندس کامران رستمی (همکار سازمانی B2B)
    const partnerUser = new User({
      id: '00000000-0000-4000-a000-000000000002',
      name: 'مهندس کامران رستمی',
      email: Email.create('rostami@pars-data.com'),
      phone: PhoneNumber.create('09162947222'),
      phoneVerifiedAt: new Date(),
      isActive: true,
      role: 'partner_b2b',
      status: 'active',
      createdAt: new Date(Date.now() - 200 * 24 * 3600 * 1000),
      updatedAt: new Date(),
      nationalCode: '۱۰۱۰۳۸۴۹۲۰۱',
      nationalCodeVerified: true,
      companyName: 'ارتباطات داده‌گستر پارس (همکار حقوقی)',
      userTier: 'gold',
      notes: 'همکار حقوقی مجاز با سقف اعتباری ۵۰۰ میلیون تومان و ثبت چک صیادی.',
      ordersCount: 19,
      totalSpent: 420000000,
      walletBalance: 12000000,
      lastLogin: 'امروز - ۰۹:۱۵',
      activities: [
        {
          id: 'act-3',
          action: 'ثبت استعلام قیمت جدید RFQ-501 برای دیتاسنتر نفت پارس',
          timestamp: 'امروز - ۰۹:۱۵',
          ip: '89.165.12.90',
          device: 'Firefox / MacOS',
        },
      ],
      security: {
        twoFactorEnabled: false,
        twoFactorMethod: 'PIN',
      },
    });
    this.users.set(partnerUser.id, partnerUser);

    // 4. خانم دکتر مریم شمس (همکار B2B)
    const shamsUser = new User({
      id: '00000000-0000-4000-a000-000000000004',
      name: 'خانم دکتر مریم شمس',
      email: Email.create('shams@it-org.ir'),
      phone: PhoneNumber.create('09128881234'),
      phoneVerifiedAt: new Date(),
      isActive: true,
      role: 'partner_b2b',
      status: 'active',
      createdAt: new Date(Date.now() - 150 * 24 * 3600 * 1000),
      updatedAt: new Date(),
      nationalCode: '۱۴۰۰۳۹۹۲۸۱۱',
      nationalCodeVerified: true,
      companyName: 'سازمان فناوری اطلاعات و ارتباطات',
      userTier: 'silver',
      notes: 'خرید عمده کابل‌های فیبر نوری و نگزنس با فاکتور رسمی نوع ۱.',
      ordersCount: 8,
      totalSpent: 195000000,
      walletBalance: 0,
      lastLogin: 'دیروز - ۱۶:۴۰',
      activities: [
        {
          id: 'act-4',
          action: 'دانلود نسخه PDF صورتحساب رسمی INV-1403-9418',
          timestamp: 'دیروز - ۱۶:۴۰',
          ip: '2.188.45.112',
        },
      ],
      security: {
        twoFactorEnabled: false,
        twoFactorMethod: 'PIN',
      },
    });
    this.users.set(shamsUser.id, shamsUser);

    // 5. علیرضا رضوانی (مشتری عادی)
    const customerUser = new User({
      id: '00000000-0000-4000-a000-000000000003',
      name: 'علیرضا رضوانی',
      email: Email.create('rezvani.ali@gmail.com'),
      phone: PhoneNumber.create('09162947223'),
      phoneVerifiedAt: new Date(),
      isActive: true,
      role: 'customer',
      status: 'active',
      createdAt: new Date(Date.now() - 90 * 24 * 3600 * 1000),
      updatedAt: new Date(),
      nationalCode: '۰۰۷۸۹۲۳۴۱۱',
      nationalCodeVerified: true,
      userTier: 'silver',
      notes: 'کاربر عادی فروشگاه؛ خریدار تجهیزات میکروتیک و روترهای رومیزی.',
      ordersCount: 5,
      totalSpent: 48500000,
      walletBalance: 1500000,
      lastLogin: 'امروز - ۰۸:۵۰',
      activities: [
        {
          id: 'act-5',
          action: 'پرداخت آنلاین سفارش VX-9415 از درگاه پرداخت شاپرک',
          timestamp: 'امروز - ۰۸:۵۰',
          ip: '151.242.88.19',
        },
      ],
      security: {
        twoFactorEnabled: false,
        twoFactorMethod: 'PIN',
      },
    });
    this.users.set(customerUser.id, customerUser);

    // 6. مهندس فرزاد معتمدی (در انتظار تایید)
    const pendingUser = new User({
      id: '00000000-0000-4000-a000-000000000005',
      name: 'مهندس فرزاد معتمدی',
      email: Email.create('motamedi@ertebat.ir'),
      phone: PhoneNumber.create('09122224444'),
      phoneVerifiedAt: new Date(),
      isActive: true,
      role: 'partner_b2b',
      status: 'pending_verification',
      createdAt: new Date(Date.now() - 20 * 24 * 3600 * 1000),
      updatedAt: new Date(),
      nationalCode: '۰۰۶۴۴۸۹۱۲۰',
      nationalCodeVerified: false,
      companyName: 'شرکت ارتباط‌گستر پیشتاز',
      userTier: 'bronze',
      notes: 'مدارک روزنامه رسمی بارگذاری شده؛ در انتظار تایید احراز هویت شاهکار.',
      ordersCount: 1,
      totalSpent: 15000000,
      walletBalance: 0,
      lastLogin: 'امروز - ۰۹:۱۰',
      activities: [
        {
          id: 'act-6',
          action: 'بارگذاری مدارک ثبتی شرکت در پرتال سازمانی',
          timestamp: 'امروز - ۰۹:۱۰',
          ip: '91.99.112.44',
        },
      ],
      security: {
        twoFactorEnabled: false,
        twoFactorMethod: 'PIN',
      },
    });
    this.users.set(pendingUser.id, pendingUser);

    // 7. حساب مسدود شده
    const suspendedUser = new User({
      id: '00000000-0000-4000-a000-000000000006',
      name: 'حساب مشکوک (IP مسدود)',
      email: Email.create('suspended@fonix-academic.ir'),
      phone: PhoneNumber.create('09350001122'),
      phoneVerifiedAt: null,
      isActive: false,
      role: 'customer',
      status: 'suspended',
      createdAt: new Date(Date.now() - 40 * 24 * 3600 * 1000),
      updatedAt: new Date(),
      nationalCode: '۰۰۱۹۸۳۴۲۱۱',
      nationalCodeVerified: false,
      userTier: 'bronze',
      notes: 'تلاش‌های مکرر ناموفق برای ورود و ثبت سفارش فیک با کارت‌های مسروقه.',
      ordersCount: 0,
      totalSpent: 0,
      walletBalance: 0,
      lastLogin: '۱۴۰۳/۰۷/۰۲',
      activities: [
        {
          id: 'act-7',
          action: 'تلاش برای پرداخت با خطای عدم تطابق مالک کارت',
          timestamp: '۱۴۰۳/۰۷/۰۲ - ۲۳:۱۴',
          ip: '185.220.101.5',
        },
      ],
      security: {
        twoFactorEnabled: false,
        twoFactorMethod: 'PIN',
      },
    });
    this.users.set(suspendedUser.id, suspendedUser);

    // 8. Fixtures for automated test suites
    const u1 = new User({
      id: '00000000-0000-4000-8000-000000000001',
      name: 'تست مشتری ۱',
      email: Email.create('customer@velox.local'),
      phone: PhoneNumber.create('09121111111'),
      phoneVerifiedAt: new Date(),
      isActive: true,
      role: 'customer',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
      security: {
        twoFactorEnabled: false,
        twoFactorMethod: 'PIN',
      },
    });
    this.users.set(u1.id, u1);

    const u2 = new User({
      id: '00000000-0000-4000-8000-000000000002',
      name: 'تست مشتری ۲ (۲FA)',
      email: Email.create('customer2fa@velox.local'),
      phone: PhoneNumber.create('09122222222'),
      phoneVerifiedAt: new Date(),
      isActive: true,
      role: 'customer',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
      security: {
        twoFactorEnabled: true,
        twoFactorMethod: 'PIN',
        securityPinHash: '123456',
      },
    });
    this.users.set(u2.id, u2);
  }

  public async getUserAddresses(userId: string): Promise<UserAddressEntity[]> {
    const list = this.addresses.get(userId);
    if (list && list.length > 0) return list;

    const user = this.users.get(userId);
    const userName = user?.name || 'کاربر سیستم';
    const userPhone = user?.phone?.value || '09121111111';

    return [
      new UserAddressEntity({
        id: `addr-def-${userId}`,
        userId,
        title: 'دفتر مرکزی',
        type: 'CENTRAL_OFFICE',
        recipientFirstName: userName.split(' ')[0] || 'عرفان',
        recipientLastName: userName.split(' ').slice(1).join(' ') || 'سعیدی',
        recipientMobile: userPhone,
        province: 'تهران',
        city: 'تهران',
        detailedAddress: 'خیابان ولیعصر، بالاتر از میدان ونک، برج نگار، طبقه ۱۴، واحد ۱۴۰۲',
        plaque: '۱۲',
        unit: '۱۴۰۲',
        postalCode: '1969713111',
        latitude: 35.7592,
        longitude: 51.4083,
        isDefault: true,
      }),
    ];
  }

  public async getUserCart(userId: string): Promise<UserCartDetails | null> {
    if (this.carts.has(userId)) {
      return this.carts.get(userId)!;
    }
    return {
      id: `cart-${userId}`,
      userId,
      totalItems: 0,
      totalAmount: 0,
      updatedAt: new Date(),
      items: [],
    };
  }

  public async getUserOrders(userId: string): Promise<UserOrderDetails[]> {
    return this.orders.get(userId) || [];
  }

  public async getUserInvoices(userId: string): Promise<any[]> {
    return this.invoices.get(userId) || [];
  }

  public async getUserWallet(userId: string): Promise<UserWalletDetails | null> {
    if (this.wallets.has(userId)) {
      return this.wallets.get(userId)!;
    }
    const user = this.users.get(userId);
    return {
      id: `wallet-${userId}`,
      userId,
      balance: user?.walletBalance ?? 0,
      lockedBalance: 0,
      currency: 'IRT',
      isActive: true,
      transactions: [],
      withdrawals: [],
    };
  }

  public async getUserFavorites(userId: string): Promise<UserFavoriteDetails[]> {
    return this.favorites.get(userId) || [];
  }

  public async getUserRfqInquiries(userId: string): Promise<UserRfqDetails[]> {
    return this.rfqInquiries.get(userId) || [];
  }

  public async getUserAuthenticityInquiries(userId: string): Promise<UserAuthenticityDetails[]> {
    return this.authenticityInquiries.get(userId) || [];
  }

  public async getUserLoyalty(userId: string): Promise<UserLoyaltyDetails | null> {
    if (this.loyaltyAccounts.has(userId)) {
      return this.loyaltyAccounts.get(userId)!;
    }
    const user = this.users.get(userId);
    const tier = user?.userTier || 'bronze';
    const tierTitle = tier === 'gold' ? 'طلایی' : tier === 'silver' ? 'نقره‌ای' : 'برنزی';
    return {
      id: `loyalty-${userId}`,
      userId,
      pointsBalance: tier === 'gold' ? 1450 : tier === 'silver' ? 450 : 80,
      lifetimePoints: tier === 'gold' ? 3200 : tier === 'silver' ? 950 : 150,
      tierCode: tier.toUpperCase(),
      tierTitle,
      cashbackPercent: tier === 'gold' ? 5 : tier === 'silver' ? 3 : 1,
      minPointsForNextTier: tier === 'gold' ? undefined : 1000,
      transactions: [],
    };
  }

  public async getUserSessions(userId: string): Promise<UserSessionDetails[]> {
    const list = this.sessions.get(userId);
    if (list && list.length > 0) return list;

    const user = this.users.get(userId);
    return [
      {
        id: `sess-act-${userId}`,
        userId,
        deviceName: 'مرورگر پیش‌فرض سیستم',
        browser: 'Chrome 128.0',
        os: 'Windows 11',
        ipAddress: '185.143.232.14',
        location: 'تهران، ایران',
        isCurrent: true,
        isRevoked: false,
        createdAt: user?.createdAt || new Date(),
        lastActiveAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 86400000),
      },
    ];
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

  private seedSubsystems(): void {
    const erfanId = '00000000-0000-4000-a000-000000000001';

    // 1. Addresses
    this.addresses.set(erfanId, [
      new UserAddressEntity({
        id: 'addr-erfan-1',
        userId: erfanId,
        title: 'دفتر مرکزی تهران',
        type: 'CENTRAL_OFFICE',
        recipientFirstName: 'عرفان',
        recipientLastName: 'سعیدی',
        recipientMobile: '09162947221',
        province: 'تهران',
        city: 'تهران',
        detailedAddress: 'خیابان ولیعصر، بالاتر از میدان ونک، برج نگار، طبقه ۱۴، واحد ۱۴۰۲',
        plaque: '۱۲',
        unit: '۱۴۰۲',
        postalCode: '1969713111',
        latitude: 35.7592,
        longitude: 51.4083,
        isDefault: true,
      }),
      new UserAddressEntity({
        id: 'addr-erfan-2',
        userId: erfanId,
        title: 'انبار مرکزی تجهیزات شبکه',
        type: 'CENTRAL_WAREHOUSE',
        recipientFirstName: 'انباردار',
        recipientLastName: 'ققنوس',
        recipientMobile: '09134761097',
        province: 'اصفهان',
        city: 'اصفهان',
        detailedAddress: 'خیابان شیخ بهایی، نرسیده به چهارراه آذر، پلاک ۴۵، انبار مرکزی فونیکس',
        plaque: '۴۵',
        postalCode: '8134710000',
        latitude: 32.6546,
        longitude: 51.668,
        isDefault: false,
      }),
    ]);

    // 2. Active Cart
    this.carts.set(erfanId, {
      id: 'cart-erfan-1',
      userId: erfanId,
      totalItems: 6,
      totalAmount: 159000000,
      updatedAt: new Date(),
      items: [
        {
          id: 'ci-1',
          productId: 'p-cisco-2960x',
          title: 'سوئیچ ۲۴ پورت سیسکو Catalyst 2960X-24PS-L POE+',
          sku: 'WS-C2960X-24PS-L',
          unitPrice: 42500000,
          quantity: 2,
          totalPrice: 85000000,
          imageUrl: '/uploads/products/cisco-2960x.webp',
          inStock: true,
        },
        {
          id: 'ci-2',
          productId: 'p-mikrotik-ccr2004',
          title: 'روتر برد میکروتیک Cloud Core Router CCR2004-16G-2S+',
          sku: 'CCR2004-16G-2S+',
          unitPrice: 38000000,
          quantity: 1,
          totalPrice: 38000000,
          imageUrl: '/uploads/products/mikrotik-ccr2004.webp',
          inStock: true,
        },
        {
          id: 'ci-3',
          productId: 'p-nexans-cat6',
          title: 'کابل شبکه نکسنس Cat6 SFTP تمام مس تست فلوک چنل ۵۰۰ متری',
          sku: 'N100.451',
          unitPrice: 12000000,
          quantity: 3,
          totalPrice: 36000000,
          imageUrl: '/uploads/products/nexans-cat6.webp',
          inStock: true,
        },
      ],
    });

    // 3. Orders
    this.orders.set(erfanId, [
      {
        id: 'ord-1',
        orderNumber: 'VX-9421',
        trackingCode: 'TRK-9421-TEH',
        userId: erfanId,
        status: 'delivered',
        statusLabel: 'تحویل موفق',
        customerType: 'b2b',
        customerName: 'عرفان سعیدی',
        phoneNumber: '09162947221',
        companyName: 'تجهیزات شبکه ققنوس آکادمی',
        totalAmount: 94000000,
        discountAmount: 4000000,
        vatTaxAmount: 9000000,
        payableAmount: 99000000,
        paymentMethod: 'online_gateway',
        shippingCarrier: 'تیپاکس اکسپرس',
        shippingCost: 450000,
        createdAt: new Date(Date.now() - 7 * 86400000),
        items: [
          {
            id: 'oi-1',
            title: 'سوئیچ سیسکو ۲۴ پورت PoE+ مدل 2960X',
            sku: 'WS-C2960X-24PS-L',
            brand: 'Cisco',
            model: 'Catalyst 2960X',
            unitPrice: 42500000,
            quantity: 2,
            totalPrice: 85000000,
            warranty: 'گارانتی ۱۸ ماهه طلایی ققنوس',
            serialNumbers: ['FOC2140S09A', 'FOC2140S09B'],
          },
          {
            id: 'oi-2',
            title: 'پچ کورد ۳ متری نگزنس Cat6 SFTP اورجینال',
            sku: 'N100.123',
            brand: 'Nexans',
            unitPrice: 4500000,
            quantity: 2,
            totalPrice: 9000000,
            warranty: 'ضمانت اصالت فیزیکی کالا',
          },
        ],
      },
      {
        id: 'ord-2',
        orderNumber: 'VX-9410',
        trackingCode: 'TRK-9410-ESF',
        userId: erfanId,
        status: 'shipping',
        statusLabel: 'تحویل به ناوگان حمل و نقل',
        customerType: 'b2b',
        customerName: 'عرفان سعیدی',
        phoneNumber: '09162947221',
        companyName: 'تجهیزات شبکه ققنوس آکادمی',
        totalAmount: 38000000,
        discountAmount: 0,
        vatTaxAmount: 3800000,
        payableAmount: 41800000,
        paymentMethod: 'bank_transfer_satna',
        shippingCarrier: 'چاپار هوایی',
        shippingCost: 350000,
        createdAt: new Date(Date.now() - 2 * 86400000),
        items: [
          {
            id: 'oi-3',
            title: 'روتر برد میکروتیک Cloud Core Router CCR2004',
            sku: 'CCR2004-16G-2S+',
            brand: 'MikroTik',
            model: 'CCR2004-16G-2S+',
            unitPrice: 38000000,
            quantity: 1,
            totalPrice: 38000000,
            warranty: 'گارانتی ۱۲ ماهه فونیکس',
            serialNumbers: ['MT7829104882'],
          },
        ],
      },
      {
        id: 'ord-3',
        orderNumber: 'VX-8930',
        trackingCode: 'TRK-8930-TEH',
        userId: erfanId,
        status: 'processing_warehouse',
        statusLabel: 'پردازش و بسته‌بندی انبار',
        customerType: 'b2b',
        customerName: 'عرفان سعیدی',
        phoneNumber: '09162947221',
        totalAmount: 12000000,
        discountAmount: 1000000,
        vatTaxAmount: 1100000,
        payableAmount: 12100000,
        paymentMethod: 'online_gateway',
        shippingCarrier: 'پیک موتوری فوری',
        shippingCost: 250000,
        createdAt: new Date(Date.now() - 1 * 86400000),
        items: [
          {
            id: 'oi-4',
            title: 'پچ پنل ۲۴ پورت لگراند Cat6 UTP',
            sku: 'LEG-033561',
            brand: 'Legrand',
            unitPrice: 3000000,
            quantity: 4,
            totalPrice: 12000000,
            warranty: 'ضمانت اصالت فیزیکی',
          },
        ],
      },
    ]);

    // 4. Invoices
    this.invoices.set(erfanId, [
      {
        id: 'inv-1',
        invoiceNumber: 'INV-1403-089',
        trackingCode: 'TRK-9421-TEH',
        type: 'OFFICIAL',
        typeLabel: 'فاکتور رسمی مالیاتی',
        status: 'ISSUED',
        statusLabel: 'صادر شده',
        paymentStatus: 'PAID',
        paymentStatusLabel: 'پرداخت شده',
        subtotal: 90000000,
        taxAmount: 9000000,
        discountAmount: 4000000,
        shippingCost: 450000,
        totalAmount: 95450000,
        customerName: 'عرفان سعیدی',
        customerPhone: '09162947221',
        companyName: 'تجهیزات شبکه ققنوس آکادمی',
        economicCode: '411478956321',
        nationalId: '10103849201',
        createdAt: new Date(Date.now() - 7 * 86400000).toLocaleDateString('fa-IR'),
        items: [
          {
            id: 'ii-1',
            title: 'سوئیچ سیسکو ۲۴ پورت PoE+ مدل 2960X',
            quantity: 2,
            unitPrice: 42500000,
            totalPrice: 85000000,
            taxAmount: 8500000,
          },
        ],
      },
      {
        id: 'inv-2',
        invoiceNumber: 'INV-1403-042',
        trackingCode: 'TRK-9410-ESF',
        type: 'UNOFFICIAL',
        typeLabel: 'پیش‌فاکتور / غیررسمی',
        status: 'ISSUED',
        statusLabel: 'صادر شده',
        paymentStatus: 'PAID',
        paymentStatusLabel: 'پرداخت شده',
        subtotal: 38000000,
        taxAmount: 0,
        discountAmount: 0,
        shippingCost: 350000,
        totalAmount: 38350000,
        customerName: 'عرفان سعیدی',
        customerPhone: '09162947221',
        createdAt: new Date(Date.now() - 2 * 86400000).toLocaleDateString('fa-IR'),
        items: [
          {
            id: 'ii-2',
            title: 'روتر برد میکروتیک CCR2004-16G-2S+',
            quantity: 1,
            unitPrice: 38000000,
            totalPrice: 38000000,
            taxAmount: 0,
          },
        ],
      },
    ]);

    // 5. Wallet
    this.wallets.set(erfanId, {
      id: 'wallet-erfan',
      userId: erfanId,
      balance: 25000000,
      lockedBalance: 0,
      currency: 'IRT',
      isActive: true,
      transactions: [
        {
          id: 'wtx-1',
          type: 'DEPOSIT',
          typeLabel: 'افزایش موجودی',
          amount: 50000000,
          balanceBefore: 0,
          balanceAfter: 50000000,
          trackingCode: 'WTX-10192',
          description: 'شارژ آنلاین کیف پول از طریق درگاه سامان',
          createdAt: new Date(Date.now() - 10 * 86400000),
        },
        {
          id: 'wtx-2',
          type: 'PURCHASE',
          typeLabel: 'خرید سفارش',
          amount: -38000000,
          balanceBefore: 50000000,
          balanceAfter: 12000000,
          trackingCode: 'WTX-10245',
          description: 'پرداخت صورتحساب سفارش VX-9410',
          referenceType: 'ORDER',
          referenceId: 'VX-9410',
          createdAt: new Date(Date.now() - 5 * 86400000),
        },
        {
          id: 'wtx-3',
          type: 'CASHBACK',
          typeLabel: 'پاداش کش‌بک',
          amount: 3000000,
          balanceBefore: 12000000,
          balanceAfter: 15000000,
          trackingCode: 'WTX-10301',
          description: 'پاداش کش‌بک خرید ۵٪ سطوح طلایی باشگاه مشتریان',
          createdAt: new Date(Date.now() - 3 * 86400000),
        },
        {
          id: 'wtx-4',
          type: 'DEPOSIT',
          typeLabel: 'اصلاح حسابداری',
          amount: 10000000,
          balanceBefore: 15000000,
          balanceAfter: 25000000,
          trackingCode: 'WTX-10389',
          description: 'واریز بستانکاری و اصلاح مغایرت مالی توسط مدیریت',
          createdAt: new Date(Date.now() - 1 * 86400000),
        },
      ],
      withdrawals: [
        {
          id: 'wd-1',
          amount: 10000000,
          status: 'COMPLETED',
          statusLabel: 'تسویه موفق ساتنا',
          bankAccountTitle: 'بانک ملت - حساب حقوقی ققنوس',
          shabaNumber: 'IR120120000000001234567890',
          payoutReference: 'SATNA-994821',
          requestedAt: new Date(Date.now() - 20 * 86400000),
          processedAt: new Date(Date.now() - 19 * 86400000),
        },
      ],
    });

    // 6. Favorites
    this.favorites.set(erfanId, [
      {
        id: 'fav-1',
        productId: 'p-cisco-2960x',
        title: 'سوئیچ ۲۴ پورت سیسکو Catalyst 2960X-24PS-L POE+',
        slug: 'cisco-catalyst-2960x-24ps-l',
        sku: 'WS-C2960X-24PS-L',
        brand: 'Cisco',
        category: 'سوئیچ شبکه مدیریتی',
        basePrice: 42500000,
        ratingAvg: 4.8,
        inStock: true,
        imageUrl: '/uploads/products/cisco-2960x.webp',
        addedAt: new Date(Date.now() - 30 * 86400000),
      },
      {
        id: 'fav-2',
        productId: 'p-mikrotik-ccr2004',
        title: 'روتر برد میکروتیک Cloud Core Router CCR2004-16G-2S+',
        slug: 'mikrotik-ccr2004-16g-2s-plus',
        sku: 'CCR2004-16G-2S+',
        brand: 'MikroTik',
        category: 'روتر بورد شبکه',
        basePrice: 38000000,
        ratingAvg: 4.7,
        inStock: true,
        imageUrl: '/uploads/products/mikrotik-ccr2004.webp',
        addedAt: new Date(Date.now() - 15 * 86400000),
      },
      {
        id: 'fav-3',
        productId: 'p-cisco-sfp-10g',
        title: 'ماژول فیبر نوری سیسکو SFP-10G-SR مالتی مود ۱۰ گیگابیت',
        slug: 'cisco-sfp-10g-sr',
        sku: 'SFP-10G-SR',
        brand: 'Cisco',
        category: 'ماژول فیبر نوری',
        basePrice: 6500000,
        ratingAvg: 4.9,
        inStock: true,
        imageUrl: '/uploads/products/sfp-10g.webp',
        addedAt: new Date(Date.now() - 5 * 86400000),
      },
    ]);

    // 7. RFQ Inquiries
    this.rfqInquiries.set(erfanId, [
      {
        id: 'rfq-1',
        rfqNumber: 'RFQ-1403-012',
        userId: erfanId,
        projectTitle: 'طرح ارتقای زیرساخت سوئیچینگ و هسته دیتاسنتر نفت و گاز',
        companyName: 'تجهیزات شبکه ققنوس آکادمی',
        clientPhone: '09162947221',
        clientEmail: 'admin@fonix-academic.ir',
        status: 'quoted',
        statusLabel: 'پیش‌فاکتور رسمی صادر شد',
        urgent: true,
        deadlineHours: 24,
        discountPercent: 8.5,
        validityDays: 7,
        estimatedValue: 340000000,
        finalQuotedAmount: 311100000,
        quotationIssuedAt: new Date(Date.now() - 1 * 86400000),
        projectLocation: 'منطقه ویژه اقتصادی عسلویه',
        notes: 'نیاز به تحویل فوری با هولوگرام اصالت کالا و برگه گارانتی شرکتی.',
        createdAt: new Date(Date.now() - 3 * 86400000),
        items: [
          {
            id: 'rfq-item-1',
            sku: 'WS-C3850-24T-L',
            title: 'سوئیچ هسته لایه ۳ سیسکو ۳۸۵۰ بیست و چهار پورت',
            brand: 'Cisco',
            category: 'Core Switch',
            requestedQty: 2,
            unitPrice: 120000000,
            stockStatus: 'available',
            suggestedAlternative: 'WS-C9300-24T-A',
            specsSummary: '24 Port Data IP Base Layer 3 Switch with 480Gbps Stacking',
          },
        ],
      },
      {
        id: 'rfq-2',
        rfqNumber: 'RFQ-1403-008',
        userId: erfanId,
        projectTitle: 'تامین تجهیزات پسیو، رک‌های سروری و کابل‌کشی ساختاریافته',
        companyName: 'تجهیزات شبکه ققنوس آکادمی',
        clientPhone: '09162947221',
        status: 'converted',
        statusLabel: 'تبدیل به فاکتور نهایی و خرید',
        urgent: false,
        deadlineHours: 48,
        discountPercent: 5,
        validityDays: 14,
        estimatedValue: 85000000,
        finalQuotedAmount: 80750000,
        quotationIssuedAt: new Date(Date.now() - 15 * 86400000),
        createdAt: new Date(Date.now() - 20 * 86400000),
        items: [
          {
            id: 'rfq-item-2',
            sku: 'RACK-42U-1000',
            title: 'رک سروری ۴۲ یونیت عمق ۱۰۰ سانتیمتر با درب توری مشبک',
            brand: 'HPI',
            category: 'Server Racks',
            requestedQty: 3,
            unitPrice: 22000000,
            stockStatus: 'available',
          },
        ],
      },
    ]);

    // 8. Authenticity Inquiries
    this.authenticityInquiries.set(erfanId, [
      {
        id: 'auth-inq-1',
        userId: erfanId,
        serialNumber: 'FOC2140S09A',
        hologramCode: 'FONIX-SEC-9981',
        productName: 'سوئیچ ۲۴ پورت سیسکو Catalyst 2960X-24PS-L',
        brand: 'Cisco',
        model: 'WS-C2960X-24PS-L',
        warrantyType: 'گارانتی طلایی ۱۸ ماهه ققنوس با تعویض آنی',
        status: 'active',
        statusLabel: 'اصیل - دارای گارانتی فعال معتبر',
        isAuthentic: true,
        startDate: new Date(Date.now() - 90 * 86400000),
        endDate: new Date(Date.now() + 450 * 86400000),
        daysRemaining: 450,
        inquiryIp: '185.143.232.14',
        createdAt: new Date(Date.now() - 10 * 86400000),
      },
      {
        id: 'auth-inq-2',
        userId: erfanId,
        serialNumber: 'MT7829104882',
        hologramCode: 'FONIX-SEC-8721',
        productName: 'روتر برد کلود کور میکروتیک CCR2004-16G-2S+',
        brand: 'MikroTik',
        model: 'CCR2004-16G-2S+',
        warrantyType: 'گارانتی ۱۲ ماهه رسمی فونیکس',
        status: 'active',
        statusLabel: 'اصیل - دارای گارانتی فعال معتبر',
        isAuthentic: true,
        startDate: new Date(Date.now() - 30 * 86400000),
        endDate: new Date(Date.now() + 335 * 86400000),
        daysRemaining: 335,
        inquiryIp: '185.143.232.14',
        createdAt: new Date(Date.now() - 5 * 86400000),
      },
      {
        id: 'auth-inq-3',
        userId: erfanId,
        serialNumber: 'FOC19020088X',
        hologramCode: 'INVALID-HLG-00',
        productName: 'ماژول فیبر نوری ۱۰ گیگ سیسکو SFP-10G-SR',
        brand: 'Cisco',
        model: 'SFP-10G-SR',
        warrantyType: 'فاقد گارانتی رسمی',
        status: 'invalid',
        statusLabel: 'سریال نامعتبر / مشکوک به تقلبی',
        isAuthentic: false,
        daysRemaining: 0,
        inquiryIp: '185.143.232.14',
        notes: 'شماره سریال و بارکد روی بدنه ماژول با دیتابیس رسمی سیسکو تطابق ندارد.',
        createdAt: new Date(Date.now() - 2 * 86400000),
      },
    ]);

    // 9. Loyalty Account
    this.loyaltyAccounts.set(erfanId, {
      id: 'loyalty-erfan',
      userId: erfanId,
      pointsBalance: 1450,
      lifetimePoints: 3200,
      tierCode: 'GOLD',
      tierTitle: 'باشگاه طلایی VIP',
      cashbackPercent: 5,
      transactions: [
        {
          id: 'ltx-1',
          type: 'EARN',
          typeLabel: 'کسب امتیاز خرید',
          points: 500,
          pointsBefore: 950,
          pointsAfter: 1450,
          referenceType: 'ORDER_PURCHASE',
          description: 'امتیاز خرید سازمانی سفارش شماره VX-9421',
          createdAt: new Date(Date.now() - 7 * 86400000),
        },
        {
          id: 'ltx-2',
          type: 'EARN',
          typeLabel: 'کسب امتیاز هویت‌سنجی',
          points: 250,
          pointsBefore: 700,
          pointsAfter: 950,
          referenceType: 'PROFILE_COMPLETION',
          description: 'تایید مدارک هویتی و ثبت کد اقتصادی شرکت',
          createdAt: new Date(Date.now() - 20 * 86400000),
        },
        {
          id: 'ltx-3',
          type: 'REDEEM',
          typeLabel: 'مصرف امتیاز و تخفیف',
          points: -200,
          pointsBefore: 900,
          pointsAfter: 700,
          referenceType: 'VOUCHER',
          description: 'استفاده از کد تخفیف ارسال رایگان ویژه اعضای طلایی',
          createdAt: new Date(Date.now() - 40 * 86400000),
        },
      ],
    });

    // 10. Sessions
    this.sessions.set(erfanId, [
      {
        id: 'sess-1',
        userId: erfanId,
        deviceName: 'کامپیوتر رومیزی - گوگل کروم',
        browser: 'Chrome 128.0.6613.138',
        os: 'Windows 11 Pro 64-bit',
        ipAddress: '185.143.232.14',
        location: 'تهران، ایران (مخابرات ایران)',
        isCurrent: true,
        isRevoked: false,
        createdAt: new Date(Date.now() - 4 * 3600000),
        lastActiveAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 86400000),
      },
      {
        id: 'sess-2',
        userId: erfanId,
        deviceName: 'گوشی موبایل آیفون - مرورگر سافاری',
        browser: 'Mobile Safari 18.0',
        os: 'iOS 18.0.1 (iPhone 15 Pro)',
        ipAddress: '5.120.98.22',
        location: 'تهران، ایران (همراه اول)',
        isCurrent: false,
        isRevoked: false,
        createdAt: new Date(Date.now() - 24 * 3600000),
        lastActiveAt: new Date(Date.now() - 2 * 3600000),
        expiresAt: new Date(Date.now() + 29 * 86400000),
      },
      {
        id: 'sess-3',
        userId: erfanId,
        deviceName: 'مک‌بوک پرو - مرورگر فایرفاکس',
        browser: 'Firefox 130.0',
        os: 'macOS Sonoma 14.6',
        ipAddress: '185.143.232.14',
        location: 'تهران، ایران',
        isCurrent: false,
        isRevoked: false,
        createdAt: new Date(Date.now() - 72 * 3600000),
        lastActiveAt: new Date(Date.now() - 48 * 3600000),
        expiresAt: new Date(Date.now() + 27 * 86400000),
      },
      {
        id: 'sess-4',
        userId: erfanId,
        deviceName: 'تبلت اندروید - مرورگر سامسونگ',
        browser: 'Samsung Internet 25.0',
        os: 'Android 14 (Galaxy Tab S9)',
        ipAddress: '91.98.112.50',
        location: 'اصفهان، ایران',
        isCurrent: false,
        isRevoked: true,
        createdAt: new Date(Date.now() - 120 * 3600000),
        lastActiveAt: new Date(Date.now() - 100 * 3600000),
        expiresAt: new Date(Date.now() - 10 * 86400000),
      },
    ]);
  }
}
