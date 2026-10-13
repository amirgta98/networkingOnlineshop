import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
} from 'class-validator';

export class UpdateAddressRequestDto {
  @ApiPropertyOptional({ description: 'عنوان نشانی', example: 'دفتر مرکزی' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: 'نوع یا تگ نشانی', example: 'central_office' })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({ description: 'تگ نشانی در فرانت‌اند', example: 'central_office' })
  @IsOptional()
  @IsString()
  tag?: string;

  @ApiPropertyOptional({ description: 'نام کوچک تحویل‌گیرنده', example: 'عرفان' })
  @IsOptional()
  @IsString()
  recipientFirstName?: string;

  @ApiPropertyOptional({ description: 'نام خانوادگی تحویل‌گیرنده', example: 'رضایی' })
  @IsOptional()
  @IsString()
  recipientLastName?: string;

  @ApiPropertyOptional({ description: 'نام کامل تحویل‌گیرنده', example: 'مهندس عرفان رضایی' })
  @IsOptional()
  @IsString()
  recipientName?: string;

  @ApiPropertyOptional({ description: 'شماره تلفن همراه تحویل‌گیرنده', example: '09121234567' })
  @IsOptional()
  @IsString()
  recipientMobile?: string;

  @ApiPropertyOptional({ description: 'شماره تلفن (فرانت‌اند)', example: '09121234567' })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiPropertyOptional({ description: 'استان مقصد', example: 'تهران' })
  @IsOptional()
  @IsString()
  province?: string;

  @ApiPropertyOptional({ description: 'شهر مقصد', example: 'تهران' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ description: 'نشانی دقیق پستی', example: 'خیابان ولیعصر، برج پارس' })
  @IsOptional()
  @IsString()
  detailedAddress?: string;

  @ApiPropertyOptional({ description: 'نشانی دقیق پستی (فرانت‌اند fullAddress)', example: 'خیابان ولیعصر، برج پارس' })
  @IsOptional()
  @IsString()
  fullAddress?: string;

  @ApiPropertyOptional({ description: 'نشانی دقیق پستی (فرانت‌اند address)', example: 'خیابان ولیعصر، برج پارس' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ description: 'پلاک ساختمان', example: '۳۴' })
  @IsOptional()
  @IsString()
  plaque?: string;

  @ApiPropertyOptional({ description: 'شماره ساختمان / پلاک (فرانت‌اند)', example: '۳۴' })
  @IsOptional()
  @IsString()
  buildingNumber?: string;

  @ApiPropertyOptional({ description: 'واحد / طبقه', example: 'واحد ۱۰' })
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiPropertyOptional({ description: 'کد پستی ۱۰ رقمی', example: '1998765432' })
  @IsOptional()
  @IsString()
  postalCode?: string;

  @ApiPropertyOptional({ description: 'توضیحات تحویل', example: 'هماهنگی با حراست دیتا سنتر' })
  @IsOptional()
  @IsString()
  deliveryNotes?: string;

  @ApiPropertyOptional({ description: 'عرض جغرافیایی' })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({ description: 'طول جغرافیایی' })
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiPropertyOptional({ description: 'آیا آدرس پیش‌فرض است؟', example: true })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
