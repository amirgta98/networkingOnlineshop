import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsEmail,
  Matches,
  IsObject,
  ValidateNested,
  IsBoolean,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class UserNotificationPreferencesDto {
  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  smsOnOrderUpdates?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  smsOnInvoiceReady?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  newsletterSubscribed?: boolean;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  twoFactorLoginNotify?: boolean;
}

export class UpdateUserProfileRequestDto {
  @ApiPropertyOptional({ example: 'امیررضا رضایی' })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  fullName?: string;

  @ApiPropertyOptional({ example: 'امیررضا' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  firstName?: string;

  @ApiPropertyOptional({ example: 'رضایی' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  lastName?: string;

  @ApiPropertyOptional({ example: '09123456789' })
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' && value.trim() === '' ? undefined : value))
  @ValidateIf((o) => typeof o.phone === 'string' && o.phone.trim().length > 0)
  @IsString()
  @Matches(/^09[0-9]{9}$/, { message: 'شماره تلفن همراه باید با 09 شروع شده و ۱۱ رقم باشد.' })
  phone?: string;

  @ApiPropertyOptional({ example: '0079823401' })
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' && value.trim() === '' ? undefined : value))
  @ValidateIf((o) => typeof o.nationalCode === 'string' && o.nationalCode.trim().length > 0)
  @IsString()
  @Matches(/^[0-9]{10}$/, { message: 'کد ملی باید دقیقاً ۱۰ رقم باشد.' })
  nationalCode?: string;

  @ApiPropertyOptional({ example: 'user@velox.local' })
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' && value.trim() === '' ? undefined : value))
  @ValidateIf((o) => typeof o.email === 'string' && o.email.trim().length > 0)
  @IsEmail({}, { message: 'فرمت پست الکترونیک (ایمیل) نامعتبر است.' })
  email?: string;

  @ApiPropertyOptional({ example: 'درباره من یا بیوگرافی' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;

  // B2B Company info
  @ApiPropertyOptional({ example: 'شرکت فناوران شبکه ققنوس' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  companyName?: string;

  @ApiPropertyOptional({ example: '411567894321' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  economicCode?: string;

  @ApiPropertyOptional({ example: '10103567890' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  companyNationalId?: string;

  @ApiPropertyOptional({ example: '456789' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  registrationNumber?: string;

  @ApiPropertyOptional({ example: '02188776655' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  companyPhone?: string;

  @ApiPropertyOptional({ example: 'تهران، خیابان ولیعصر' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  companyAddress?: string;

  // Sheba bank account
  @ApiPropertyOptional({ example: 'IR120170000000123456789012' })
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' && value.trim() === '' ? undefined : value))
  @ValidateIf((o) => typeof o.shebaNumber === 'string' && o.shebaNumber.trim().length > 0)
  @IsString()
  @Matches(/^(IR)?[0-9]{24}$/, { message: 'شماره شبا باید ۲۴ رقم معتبر (با یا بدون پیشوند IR) باشد.' })
  shebaNumber?: string;

  @ApiPropertyOptional({ example: '6037991122334455' })
  @IsOptional()
  @IsString()
  cardNumber?: string;

  @ApiPropertyOptional({ example: 'بانک سامان' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  bankName?: string;

  @ApiPropertyOptional({ example: 'امیررضا رضایی' })
  @IsOptional()
  @IsString()
  @MaxLength(150)
  accountHolderName?: string;

  @ApiPropertyOptional({ type: UserNotificationPreferencesDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => UserNotificationPreferencesDto)
  preferences?: UserNotificationPreferencesDto;
}
