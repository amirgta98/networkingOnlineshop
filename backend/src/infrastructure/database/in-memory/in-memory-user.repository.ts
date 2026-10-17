import { IUserRepository, UserFilterOptions } from '../../../domain/repositories/user.repository.interface.js';
import { User } from '../../../domain/entities/user.entity.js';
import { Email } from '../../../domain/value-objects/email.vo.js';
import { PhoneNumber } from '../../../domain/value-objects/phone-number.vo.js';

/**
 * In-Memory implementation of IUserRepository.
 * Used for development, testing, and isolated execution.
 */
export class InMemoryUserRepository implements IUserRepository {
  private readonly users = new Map<string, User>();

  constructor() {
    this.seedDemoUsers();
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
}
