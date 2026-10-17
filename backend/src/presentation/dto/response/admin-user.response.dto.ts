import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { User } from '../../../domain/entities/user.entity.js';

export class AdminUserActivityResponseDto {
  @ApiProperty({ example: 'act-1' })
  id: string;

  @ApiProperty({ example: 'ورود موفق به سیستم' })
  action: string;

  @ApiProperty({ example: 'امروز - ۱۰:۴۸' })
  timestamp: string;

  @ApiProperty({ example: '185.143.232.14' })
  ip: string;

  @ApiPropertyOptional({ example: 'Chrome / Windows 11' })
  device?: string;
}

export class AdminUserResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ example: 'عرفان سعیدی' })
  fullName: string;

  @ApiPropertyOptional({ example: 'عرفان سعیدی' })
  name?: string;

  @ApiProperty({ example: '09162947221' })
  phone: string;

  @ApiPropertyOptional({ example: 'admin@fonix-academic.ir' })
  email?: string;

  @ApiProperty({ example: '۰۰۷۹۸۲۳۴۰۱' })
  nationalCode: string;

  @ApiProperty({ example: 'admin', enum: ['admin', 'sales_manager', 'partner_b2b', 'customer'] })
  role: string;

  @ApiProperty({ example: 'active', enum: ['active', 'suspended', 'pending_verification'] })
  status: string;

  @ApiPropertyOptional({ example: true })
  isActive?: boolean;

  @ApiProperty({ example: true })
  nationalCodeVerified: boolean;

  @ApiProperty({ example: false })
  twoFactorActive: boolean;

  @ApiProperty({ example: 48 })
  ordersCount: number;

  @ApiProperty({ example: 840000000 })
  totalSpent: number;

  @ApiProperty({ example: 25000000 })
  walletBalance: number;

  @ApiProperty({ example: '۱۴۰۲/۰۱/۱۵' })
  registeredAt: string;

  @ApiProperty({ example: 'امروز - ۱۰:۴۸' })
  lastLogin: string;

  @ApiPropertyOptional({ example: 'تجهیزات شبکه ققنوس آکادمی' })
  companyName?: string;

  @ApiPropertyOptional({ example: 'gold', enum: ['gold', 'silver', 'bronze'] })
  userTier?: string;

  @ApiPropertyOptional({ example: 'دسترسی مدیر ارشد سیستم' })
  notes?: string;

  @ApiProperty({ type: [AdminUserActivityResponseDto] })
  activities: AdminUserActivityResponseDto[];

  public static fromDomain(user: User | any): AdminUserResponseDto {
    const emailStr = typeof user.email === 'string' ? user.email : user.email?.value;
    const phoneStr = typeof user.phone === 'string' ? user.phone : (user.phone ? user.phone.value : '');
    const createdAtDate = user.createdAt ? new Date(user.createdAt) : new Date();
    const formattedDate = createdAtDate ? createdAtDate.toLocaleDateString('fa-IR') : '۱۴۰۲/۰۱/۰۱';
    const lastLoginStr = user.lastLogin
      ? (typeof user.lastLogin === 'string' ? user.lastLogin : new Date(user.lastLogin).toLocaleDateString('fa-IR'))
      : 'ثبت نشده';

    let role = (user.role || 'customer').toLowerCase();
    if (role === 'partner') role = 'partner_b2b';
    if (role === 'super_admin' || role === 'staff_manager') role = 'admin';

    let status = (user.status || (user.isActive ? 'active' : 'suspended')).toLowerCase();
    if (status === 'active') status = 'active';
    else if (status === 'suspended') status = 'suspended';
    else if (status === 'pending_verification') status = 'pending_verification';

    const is2fa = 'isTwoFactorEnabled' in user ? user.isTwoFactorEnabled : Boolean(user.twoFactorActive);

    return {
      id: user.id,
      fullName: user.fullName || user.name,
      name: user.name,
      phone: phoneStr,
      email: emailStr,
      nationalCode: user.nationalCode || '',
      role,
      status,
      isActive: user.isActive,
      nationalCodeVerified: Boolean(user.nationalCodeVerified),
      twoFactorActive: is2fa,
      ordersCount: user.ordersCount ?? 0,
      totalSpent: user.totalSpent ?? 0,
      walletBalance: user.walletBalance ?? 0,
      registeredAt: formattedDate,
      lastLogin: lastLoginStr,
      companyName: user.companyName ?? undefined,
      userTier: user.userTier ?? 'bronze',
      notes: user.notes ?? undefined,
      activities: (user.activities || []).map((a: any) => ({
        id: a.id,
        action: a.action,
        timestamp: a.timestamp,
        ip: a.ip,
        device: a.device,
      })),
    };
  }
}
