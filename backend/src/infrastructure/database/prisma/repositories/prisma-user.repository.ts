import { Injectable } from '@nestjs/common';
import { IUserRepository } from '../../../../domain/repositories/user.repository.interface.js';
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

  async findByEmail(email: string): Promise<User | null> {
    const raw = await this.prisma.user.findUnique({
      where: { email },
      include: {
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
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      update: {
        email: user.email.value,
        phone: user.phone?.value ?? null,
        phoneVerifiedAt: user.phoneVerifiedAt,
        name: user.name,
        isActive: user.isActive,
        updatedAt: user.updatedAt,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({
      where: { id },
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
  }): User {
    // Map database roles to frontend role string
    let mappedRole = 'customer';
    if (raw.roles && raw.roles.length > 0) {
      const codes = raw.roles.map((r) => r.role.code);
      if (codes.includes('SUPER_ADMIN') || codes.includes('STAFF_MANAGER')) {
        mappedRole = 'admin';
      } else if (codes.includes('PARTNER_B2B')) {
        mappedRole = 'partner';
      }
    }

    return new User({
      id: raw.id,
      email: Email.create(raw.email || `user-${raw.id}@velox.local`),
      phone: raw.phone ? PhoneNumber.create(raw.phone) : null,
      phoneVerifiedAt: raw.phoneVerifiedAt,
      name: raw.name,
      isActive: raw.isActive,
      status: raw.status,
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
    });
  }
}
