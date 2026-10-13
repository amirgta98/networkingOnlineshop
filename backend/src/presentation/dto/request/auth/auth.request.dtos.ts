import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length, IsOptional } from 'class-validator';

export class RequestOtpRequestDto {
  @ApiProperty({
    description: 'شماره تلفن همراه کاربر (۱۱ رقمی با پیش‌شماره ۰۹)',
    example: '09123456789',
  })
  @IsNotEmpty({ message: 'شماره تلفن همراه الزامی است' })
  @IsString({ message: 'شماره تلفن همراه باید به صورت رشته متنی باشد' })
  phone!: string;
}

export class VerifyOtpRequestDto {
  @ApiProperty({
    description: 'شناسه تیکت اعتبارسنجی ارسال شده در مرحله قبل',
    example: 'chg_123456789',
  })
  @IsNotEmpty({ message: 'تیکت اعتبارسنجی الزامی است' })
  @IsString()
  challengeTicket!: string;

  @ApiProperty({
    description: 'کد تایید پیامکی ۵ رقمی',
    example: '54321',
  })
  @IsNotEmpty({ message: 'کد تایید ۵ رقمی الزامی است' })
  @IsString()
  @Length(5, 5, { message: 'کد تایید باید دقیقاً ۵ رقم باشد' })
  code!: string;
}

export class VerifyTwoFactorRequestDto {
  @ApiProperty({
    description: 'شناسه تیکت اعتبارسنجی مرحله دوم',
    example: '2fa_123456789',
  })
  @IsNotEmpty({ message: 'تیکت تایید دو مرحله‌ای الزامی است' })
  @IsString()
  twoFactorTicket!: string;

  @ApiProperty({
    description: 'رمز دوم اختصاصی، کد Authenticator یا پسورد',
    example: '123456',
  })
  @IsNotEmpty({ message: 'رمز دوم الزامی است' })
  @IsString()
  codeOrPassword!: string;
}

export class RefreshTokenRequestDto {
  @ApiPropertyOptional({
    description: 'رفرش‌توکن اختیاری در صورت عدم استفاده از کوکی',
    example: 'a1b2c3d4...',
  })
  @IsOptional()
  @IsString()
  refreshToken?: string;
}
