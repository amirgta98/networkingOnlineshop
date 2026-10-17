import { User } from '../../../domain/entities/user.entity.js';

export interface UserOutputDto {
  id: string;
  email: string;
  name: string;
  fullName?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  phone?: string | null;
  role?: string;
  status?: string;
  nationalCode?: string | null;
  nationalCodeVerified?: boolean;
  twoFactorActive?: boolean;
  twoFactorMethod?: string;
  companyName?: string | null;
  userTier?: 'gold' | 'silver' | 'bronze';
  notes?: string | null;
  walletBalance?: number;
  totalSpent?: number;
  ordersCount?: number;
  registeredAt?: string;
  lastLogin?: string;
  activities?: Array<{
    id: string;
    action: string;
    timestamp: string;
    ip: string;
    device?: string;
  }>;
}

export class UserOutputMapper {
  public static toDto(user: User): UserOutputDto {
    const formattedDate = user.createdAt ? new Date(user.createdAt).toLocaleDateString('fa-IR') : '۱۴۰۲/۰۱/۰۱';
    const lastLoginStr = user.lastLogin
      ? (typeof user.lastLogin === 'string' ? user.lastLogin : new Date(user.lastLogin).toLocaleDateString('fa-IR'))
      : 'ثبت نشده';

    return {
      id: user.id,
      email: user.email.value,
      name: user.name,
      fullName: user.name,
      isActive: user.isActive,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      phone: user.phone?.value ?? null,
      role: user.role,
      status: user.status,
      nationalCode: user.nationalCode,
      nationalCodeVerified: user.nationalCodeVerified,
      twoFactorActive: user.isTwoFactorEnabled,
      twoFactorMethod: user.twoFactorMethod,
      companyName: user.companyName,
      userTier: user.userTier,
      notes: user.notes,
      walletBalance: user.walletBalance,
      totalSpent: user.totalSpent,
      ordersCount: user.ordersCount,
      registeredAt: formattedDate,
      lastLogin: lastLoginStr,
      activities: user.activities,
    };
  }
}
