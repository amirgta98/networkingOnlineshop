import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class SiteContactSettingsDto {
  @ApiPropertyOptional({
    description: 'آیدی تلگرام واحد جذب استعدادها و منابع انسانی (با یا بدون @)',
    example: '@ghoghnoos_academy',
  })
  @IsOptional()
  @IsString()
  recruitmentTelegram?: string;

  @ApiPropertyOptional({
    description: 'شماره تماس مستقیم واحد جذب و استخدام',
    example: '09134761097',
  })
  @IsOptional()
  @IsString()
  recruitmentPhone?: string;

  @ApiPropertyOptional({
    description: 'ایمیل اختصاصی ارسال رزومه و واحد جذب',
    example: 'careers@ghoghnoos.academy',
  })
  @IsOptional()
  @IsString()
  recruitmentEmail?: string;

  @ApiPropertyOptional({
    description: 'تلفن تماس اصلی هدر و فوتر سایت',
    example: '09134761097',
  })
  @IsOptional()
  @IsString()
  mainPhone?: string;

  @ApiPropertyOptional({
    description: 'خط پشتیبانی و فروش شماره ۱',
    example: '09224761097',
  })
  @IsOptional()
  @IsString()
  supportPhone1?: string;

  @ApiPropertyOptional({
    description: 'خط مشاوره فنی و زیرساخت شماره ۲',
    example: '09354761097',
  })
  @IsOptional()
  @IsString()
  supportPhone2?: string;

  @ApiPropertyOptional({
    description: 'خط تماس کشیک و حوادث بحرانی شبانه‌روزی ۲۴/۷',
    example: '09004761097',
  })
  @IsOptional()
  @IsString()
  emergencyPhone?: string;

  @ApiPropertyOptional({
    description: 'ایمیل عمومی و مکاتبات رسمی سایت',
    example: 'info@ghoghnoos.academy',
  })
  @IsOptional()
  @IsString()
  generalEmail?: string;

  @ApiPropertyOptional({
    description: 'شماره تماس یا اکانت واتساپ پشتیبانی',
    example: '09134761097',
  })
  @IsOptional()
  @IsString()
  whatsappNumber?: string;

  @ApiPropertyOptional({
    description: 'لینک صفحه رسمی اینستاگرام',
    example: 'https://instagram.com/ghoghnoos_academy',
  })
  @IsOptional()
  @IsString()
  instagramUrl?: string;

  @ApiPropertyOptional({
    description: 'لینک صفحه رسمی لینکدین',
    example: 'https://linkedin.com/company/ghoghnoos-academy',
  })
  @IsOptional()
  @IsString()
  linkedinUrl?: string;

  @ApiPropertyOptional({
    description: 'لینک کانال یوتیوب',
    example: 'https://youtube.com/@ghoghnoos_academy',
  })
  @IsOptional()
  @IsString()
  youtubeUrl?: string;

  @ApiPropertyOptional({
    description: 'لینک کانال رسمی آپارات',
    example: 'https://aparat.com/ghoghnoos_academy',
  })
  @IsOptional()
  @IsString()
  aparatUrl?: string;

  @ApiPropertyOptional({
    description: 'لینک کانال عمومی تلگرام ققنوس آکادمی',
    example: 'https://t.me/ghoghnoos_academy',
  })
  @IsOptional()
  @IsString()
  telegramChannelUrl?: string;

  @ApiPropertyOptional({
    description: 'نشانی پستی کامل دفتر مرکزی',
    example: 'تهران، خیابان ولیعصر، بالاتر از تقاطع میرداماد، مجتمع تجاری و اداری پایتخت، برج شماره ۲، طبقه ۷، واحد ۷۰۴',
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({
    description: 'کد پستی ۱۰ رقمی دفتر مرکزی',
    example: '1969764321',
  })
  @IsOptional()
  @IsString()
  postalCode?: string;

  @ApiPropertyOptional({
    description: 'لینک موقعیت مکانی در گوگل مپ',
    example: 'https://maps.google.com/?q=35.7592,51.4116',
  })
  @IsOptional()
  @IsString()
  googleMapsUrl?: string;

  @ApiPropertyOptional({
    description: 'لینک موقعیت مکانی در نقشه نشان',
    example: 'https://neshan.org/maps/@35.7592,51.4116,16z',
  })
  @IsOptional()
  @IsString()
  neshanUrl?: string;

  @ApiPropertyOptional({
    description: 'لینک موقعیت مکانی در نقشه بلد',
    example: 'https://balad.ir/location?latitude=35.7592&longitude=51.4116',
  })
  @IsOptional()
  @IsString()
  baladUrl?: string;
}
