import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UserProfilePreferencesResponseDto {
  @ApiProperty({ example: true })
  smsOnOrderUpdates!: boolean;

  @ApiProperty({ example: true })
  smsOnInvoiceReady!: boolean;

  @ApiProperty({ example: false })
  newsletterSubscribed!: boolean;

  @ApiProperty({ example: true })
  twoFactorLoginNotify!: boolean;
}

export class UserProfileResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id!: string;

  @ApiProperty({ example: 'عرفان سعیدی' })
  fullName!: string;

  @ApiPropertyOptional({ example: 'عرفان' })
  firstName?: string;

  @ApiPropertyOptional({ example: 'سعیدی' })
  lastName?: string;

  @ApiPropertyOptional({ example: '0079823401' })
  nationalCode?: string;

  @ApiProperty({ example: '09162947221' })
  mobileNumber!: string;

  @ApiProperty({ example: 'admin@fonix-academic.ir' })
  email!: string;

  @ApiPropertyOptional({ example: '/uploads/avatars/avatar-123.webp' })
  avatarUrl?: string | null;

  @ApiPropertyOptional({ example: 'مهندس ارشد زیرساخت' })
  bio?: string | null;

  @ApiPropertyOptional({ example: 'شرکت فناوران شبکه ققنوس' })
  companyName?: string | null;

  @ApiPropertyOptional({ example: '411567894321' })
  economicCode?: string | null;

  @ApiPropertyOptional({ example: '10103567890' })
  companyNationalId?: string | null;

  @ApiPropertyOptional({ example: '456789' })
  registrationNumber?: string | null;

  @ApiPropertyOptional({ example: '02188776655' })
  companyPhone?: string | null;

  @ApiPropertyOptional({ example: 'تهران، خیابان ولیعصر' })
  companyAddress?: string | null;

  @ApiProperty({ example: 'IR120170000000123456789012' })
  shebaNumber!: string;

  @ApiProperty({ example: 'بانک سامان' })
  bankName!: string;

  @ApiProperty({ example: 'عرفان سعیدی' })
  accountHolderName!: string;

  @ApiProperty({ example: true })
  isShebaVerified!: boolean;

  @ApiProperty({ type: UserProfilePreferencesResponseDto })
  preferences!: UserProfilePreferencesResponseDto;
}
