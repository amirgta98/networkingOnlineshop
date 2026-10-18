import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AuthUserResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id!: string;

  @ApiProperty({ example: '09123456789' })
  phone!: string;

  @ApiProperty({ example: 'کاربر گرامی' })
  name!: string;

  @ApiProperty({ example: 'customer', enum: ['customer', 'partner', 'admin'] })
  role!: string;

  @ApiProperty({ example: false })
  twoFactorEnabled!: boolean;

  @ApiPropertyOptional({ example: 'pin' })
  twoFactorMethod?: string;

  @ApiPropertyOptional({ example: 'user@velox.local' })
  email?: string;

  @ApiPropertyOptional({ example: '/uploads/avatars/avatar-123.webp' })
  avatarUrl?: string | null;

  @ApiPropertyOptional({ example: 'شرکت فناوران شبکه' })
  companyName?: string | null;

  @ApiProperty({ example: '2026-10-10T12:00:00.000Z' })
  createdAt!: string;
}

export class AuthSessionResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  accessToken!: string;

  @ApiProperty({ example: 'f8d3...64hex' })
  refreshToken!: string;

  @ApiProperty({ example: 1728567890000 })
  expiresAt!: number;

  @ApiProperty({ type: AuthUserResponseDto })
  user!: AuthUserResponseDto;
}

export class RequestOtpResponseDto {
  @ApiProperty({ example: true })
  success!: boolean;

  @ApiProperty({ example: 'کد تایید ۵ رقمی به شماره ۰۹۱۲***۶۷۸۹ پیامک شد.' })
  message!: string;

  @ApiProperty({ example: 'chg_123456' })
  challengeTicket!: string;

  @ApiProperty({ example: '۰۹۱۲***۶۷۸۹' })
  maskedPhone!: string;

  @ApiProperty({ example: false })
  hasTwoFactor!: boolean;

  @ApiProperty({ example: 120 })
  expiresInSeconds!: number;

  @ApiPropertyOptional({ example: '54321', description: 'تنها در محیط تست و توسعه' })
  devCode?: string;
}

export class VerifyOtpResponseDto {
  @ApiProperty({ example: true })
  success!: boolean;

  @ApiProperty({ example: 'خوش آمدید' })
  message!: string;

  @ApiProperty({ example: false })
  requiresTwoFactor!: boolean;

  @ApiPropertyOptional({ example: '2fa_123456' })
  twoFactorTicket?: string;

  @ApiPropertyOptional({ example: 'pin' })
  twoFactorType?: string;

  @ApiPropertyOptional({ type: AuthSessionResponseDto })
  session?: AuthSessionResponseDto;
}

export class VerifyTwoFactorResponseDto {
  @ApiProperty({ example: true })
  success!: boolean;

  @ApiProperty({ example: 'احراز هویت دومرحله‌ای با موفقیت انجام شد.' })
  message!: string;

  @ApiProperty({ type: AuthSessionResponseDto })
  session!: AuthSessionResponseDto;
}

export class AuthMeResponseDto {
  @ApiProperty({ type: AuthUserResponseDto })
  user!: AuthUserResponseDto;
}
