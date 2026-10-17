import { Injectable } from '@nestjs/common';
import { IUserRepository, UserFilterOptions } from '../../../../domain/repositories/user.repository.interface.js';
import { User } from '../../../../domain/entities/user.entity.js';
import { Email } from '../../../../domain/value-objects/email.vo.js';
import { PhoneNumber } from '../../../../domain/value-objects/phone-number.vo.js';
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
        profile: user.nationalCode
          ? {
              create: {
                nationalCode: user.nationalCode,
                nationalCodeVerified: user.nationalCodeVerified,
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
        profile: user.nationalCode
          ? {
              upsert: {
                create: {
                  nationalCode: user.nationalCode,
                  nationalCodeVerified: user.nationalCodeVerified,
                },
                update: {
                  nationalCode: user.nationalCode,
                  nationalCodeVerified: user.nationalCodeVerified,
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
      const codes = raw.roles.map((r) => r.role.code);
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

    const activities = (raw.sessions || []).map((s, idx) => ({
      id: s.id || `act-${idx}`,
      action: `ورود موفق به سیستم ${s.browser ? `(${s.browser})` : ''}`,
      timestamp: s.lastActiveAt ? new Date(s.lastActiveAt).toLocaleString('fa-IR') : 'نامشخص',
      ip: s.ipAddress || '127.0.0.1',
      device: s.deviceName || undefined,
    }));

    return new User({
      id: raw.id,
      email: Email.create(raw.email || `user-${raw.id}@velox.local`),
      phone: raw.phone ? PhoneNumber.create(raw.phone) : null,
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
      companyName,
      walletBalance,
      totalSpent,
      ordersCount,
      activities,
      lastLogin: raw.sessions?.[0]?.lastActiveAt ? new Date(raw.sessions[0].lastActiveAt).toLocaleString('fa-IR') : null,
    });
  }
}
