import { IUserRepository } from '../../../domain/repositories/user.repository.interface.js';
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
    });
  }

  private seedDemoUsers(): void {
    // 1. مدیر سایت (Admin / SuperAdmin)
    const adminUser = new User({
      id: '00000000-0000-4000-a000-000000000001',
      name: 'مدیر سایت',
      email: Email.create('admin@fonix-academic.ir'),
      phone: PhoneNumber.create('09162947221'),
      phoneVerifiedAt: new Date(),
      isActive: true,
      role: 'admin',
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
      security: {
        twoFactorEnabled: false,
        twoFactorMethod: 'PIN',
      },
    });
    this.users.set(adminUser.id, adminUser);

    const adminUserLegacy = new User({
      id: '00000000-0000-4000-a000-000000000099',
      name: 'ادمین آزمایشی',
      email: Email.create('admin-test@fonix-academic.ir'),
      phone: PhoneNumber.create('09129999999'),
      phoneVerifiedAt: new Date(),
      isActive: true,
      role: 'admin',
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
      security: {
        twoFactorEnabled: false,
        twoFactorMethod: 'PIN',
      },
    });
    this.users.set(adminUserLegacy.id, adminUserLegacy);

    // 2. همکار سازمانی (Partner / B2B)
    const partnerUser = new User({
      id: '00000000-0000-4000-a000-000000000002',
      name: 'همکار سازمانی (شرکت کهکشان)',
      email: Email.create('partner@kahkeshan-net.ir'),
      phone: PhoneNumber.create('09162947222'),
      phoneVerifiedAt: new Date(),
      isActive: true,
      role: 'partner',
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
      security: {
        twoFactorEnabled: false,
        twoFactorMethod: 'PIN',
      },
    });
    this.users.set(partnerUser.id, partnerUser);

    const partnerUserLegacy = new User({
      id: '00000000-0000-4000-a000-000000000033',
      name: 'همکار آزمایشی',
      email: Email.create('partner-test@kahkeshan-net.ir'),
      phone: PhoneNumber.create('09123333333'),
      phoneVerifiedAt: new Date(),
      isActive: true,
      role: 'partner',
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
      security: {
        twoFactorEnabled: false,
        twoFactorMethod: 'PIN',
      },
    });
    this.users.set(partnerUserLegacy.id, partnerUserLegacy);

    // 3. کاربر ساده (Customer)
    const customerUser = new User({
      id: '00000000-0000-4000-a000-000000000003',
      name: 'کاربر ساده',
      email: Email.create('customer@fonix-academic.ir'),
      phone: PhoneNumber.create('09162947223'),
      phoneVerifiedAt: new Date(),
      isActive: true,
      role: 'customer',
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
      security: {
        twoFactorEnabled: false,
        twoFactorMethod: 'PIN',
      },
    });
    this.users.set(customerUser.id, customerUser);

    // Fixtures for automated test suites
    const u1 = new User({
      id: '00000000-0000-4000-8000-000000000001',
      name: 'تست مشتری ۱',
      email: Email.create('customer@velox.local'),
      phone: PhoneNumber.create('09121111111'),
      phoneVerifiedAt: new Date(),
      isActive: true,
      role: 'customer',
      status: 'ACTIVE',
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
      status: 'ACTIVE',
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
