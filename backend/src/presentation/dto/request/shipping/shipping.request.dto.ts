import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsArray,
  Min,
  Max,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProvinceShippingRuleDto {
  @ApiProperty({ description: 'نام استان', example: 'تهران' })
  @IsString()
  @IsNotEmpty()
  province!: string;

  @ApiPropertyOptional({ description: 'هزینه ارسال اختصاصی این استان (تومان)', example: 35000 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  cost?: number;

  @ApiPropertyOptional({ description: 'زمان تخمینی تحویل اختصاصی این استان', example: 'امروز یا ۲۴ ساعت' })
  @IsString()
  @IsOptional()
  estimatedDeliveryTime?: string;

  @ApiPropertyOptional({ description: 'سقف ارسال رایگان اختصاصی این استان (تومان)', example: 4000000 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  freeThreshold?: number | null;

  @ApiPropertyOptional({ description: 'آیا برای این استان کاملاً رایگان است؟', example: false })
  @IsBoolean()
  @IsOptional()
  isFree?: boolean;
}

export class CreateShippingMethodRequestDto {
  @ApiPropertyOptional({ description: 'شناسه یکتای روش ارسال (اختیاری، در صورت خالی بودن خودکار ایجاد می‌شود)' })
  @IsString()
  @IsOptional()
  id?: string;

  @ApiProperty({ description: 'عنوان روش ارسال', example: 'پیک اختصاصی تهران' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiPropertyOptional({ description: 'زیرعنوان روش ارسال' })
  @IsString()
  @IsOptional()
  subtitle?: string;

  @ApiPropertyOptional({ description: 'توضیحات تکمیلی روش ارسال' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'هزینه ارسال (تومان)', example: 45000 })
  @IsNumber()
  @Min(0)
  cost!: number;

  @ApiPropertyOptional({ description: 'حداقل مبلغ خرید برای ارسال رایگان (تومان)', example: 5000000 })
  @IsNumber()
  @IsOptional()
  freeThreshold?: number | null;

  @ApiProperty({ description: 'زمان تخمینی تحویل', example: 'امروز یا ۲۴ ساعت کاری' })
  @IsString()
  @IsNotEmpty()
  estimatedDeliveryTime!: string;

  @ApiProperty({ description: 'نام آیکون یا شناسه آیکون', example: 'zap' })
  @IsString()
  @IsNotEmpty()
  iconName!: string;

  @ApiPropertyOptional({ description: 'آدرس آیکون یا لوگوی آپلودشده', example: '/uploads/icons/icon-carrier-1.png' })
  @IsString()
  @IsOptional()
  iconUrl?: string | null;

  @ApiPropertyOptional({ description: 'آیا این روش ارسال اکسپرس است؟', example: true })
  @IsBoolean()
  @IsOptional()
  isExpress?: boolean;

  @ApiPropertyOptional({ description: 'وضعیت فعال بودن روش ارسال', example: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'حداقل مبلغ سفارش برای نمایش این روش (تومان)', example: 0 })
  @IsNumber()
  @IsOptional()
  minOrderAmount?: number;

  @ApiPropertyOptional({ description: 'حداکثر وزن مجاز (کیلوگرم)', example: 30 })
  @IsNumber()
  @IsOptional()
  maxWeightKg?: number | null;

  @ApiPropertyOptional({ description: 'لیست استان‌های مجاز (خالی = سراسری)', example: ['تهران', 'البرز'] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  allowedProvinces?: string[];

  @ApiPropertyOptional({ description: 'قوانین و استثنائات اختصاصی استان‌ها', type: [ProvinceShippingRuleDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProvinceShippingRuleDto)
  @IsOptional()
  provinceRules?: ProvinceShippingRuleDto[];

  @ApiPropertyOptional({ description: 'ترتیب نمایش در لیست', example: 1 })
  @IsNumber()
  @IsOptional()
  displayOrder?: number;
}

export class UpdateShippingMethodRequestDto {
  @ApiPropertyOptional({ description: 'عنوان روش ارسال' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ description: 'زیرعنوان روش ارسال' })
  @IsString()
  @IsOptional()
  subtitle?: string;

  @ApiPropertyOptional({ description: 'توضیحات تکمیلی روش ارسال' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'هزینه ارسال (تومان)' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  cost?: number;

  @ApiPropertyOptional({ description: 'حداقل مبلغ خرید برای ارسال رایگان (تومان)' })
  @IsNumber()
  @IsOptional()
  freeThreshold?: number | null;

  @ApiPropertyOptional({ description: 'زمان تخمینی تحویل' })
  @IsString()
  @IsOptional()
  estimatedDeliveryTime?: string;

  @ApiPropertyOptional({ description: 'نام آیکون' })
  @IsString()
  @IsOptional()
  iconName?: string;

  @ApiPropertyOptional({ description: 'آدرس آیکون یا لوگوی آپلودشده' })
  @IsString()
  @IsOptional()
  iconUrl?: string | null;

  @ApiPropertyOptional({ description: 'آیا این روش ارسال اکسپرس است؟' })
  @IsBoolean()
  @IsOptional()
  isExpress?: boolean;

  @ApiPropertyOptional({ description: 'وضعیت فعال بودن روش ارسال' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'حداقل مبلغ سفارش برای نمایش این روش (تومان)' })
  @IsNumber()
  @IsOptional()
  minOrderAmount?: number;

  @ApiPropertyOptional({ description: 'حداکثر وزن مجاز (کیلوگرم)' })
  @IsNumber()
  @IsOptional()
  maxWeightKg?: number | null;

  @ApiPropertyOptional({ description: 'لیست استان‌های مجاز' })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  allowedProvinces?: string[];

  @ApiPropertyOptional({ description: 'قوانین و استثنائات اختصاصی استان‌ها', type: [ProvinceShippingRuleDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProvinceShippingRuleDto)
  @IsOptional()
  provinceRules?: ProvinceShippingRuleDto[];

  @ApiPropertyOptional({ description: 'ترتیب نمایش در لیست' })
  @IsNumber()
  @IsOptional()
  displayOrder?: number;
}

export class CreateTimeSlotRequestDto {
  @ApiPropertyOptional({ description: 'شناسه یکتای بازه' })
  @IsString()
  @IsOptional()
  id?: string;

  @ApiProperty({ description: 'عنوان بازه زمانی', example: 'صبح (ساعت ۹:۰۰ الی ۱۳:۰۰)' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ description: 'ساعت شروع (HH:mm)', example: '09:00' })
  @IsString()
  @IsNotEmpty()
  startTime!: string;

  @ApiProperty({ description: 'ساعت پایان (HH:mm)', example: '13:00' })
  @IsString()
  @IsNotEmpty()
  endTime!: string;

  @ApiPropertyOptional({ description: 'توضیحات بازه زمانی' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'حداکثر ظرفیت سفارش', example: 40 })
  @IsNumber()
  @Min(1)
  @IsOptional()
  maxCapacity?: number;

  @ApiPropertyOptional({ description: 'وضعیت فعال بودن', example: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'ترتیب نمایش', example: 1 })
  @IsNumber()
  @IsOptional()
  displayOrder?: number;
}

export class UpdateTimeSlotRequestDto {
  @ApiPropertyOptional({ description: 'عنوان بازه زمانی' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ description: 'ساعت شروع (HH:mm)' })
  @IsString()
  @IsOptional()
  startTime?: string;

  @ApiPropertyOptional({ description: 'ساعت پایان (HH:mm)' })
  @IsString()
  @IsOptional()
  endTime?: string;

  @ApiPropertyOptional({ description: 'توضیحات بازه زمانی' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: 'حداکثر ظرفیت سفارش' })
  @IsNumber()
  @Min(1)
  @IsOptional()
  maxCapacity?: number;

  @ApiPropertyOptional({ description: 'وضعیت فعال بودن' })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'ترتیب نمایش' })
  @IsNumber()
  @IsOptional()
  displayOrder?: number;
}

export class UpdateShippingConfigRequestDto {
  @ApiPropertyOptional({ description: 'ساعت قطع پذیرش ارسال روز جاری (۰ تا ۲۳)', example: 14 })
  @IsNumber()
  @Min(0)
  @Max(23)
  @IsOptional()
  sameDayCutoffHour?: number;

  @ApiPropertyOptional({ description: 'فاصله زمانی آماده‌سازی (روز)', example: 0 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  leadTimeDays?: number;

  @ApiPropertyOptional({ description: 'روزهای کاری هفته (۰=شنبه تا ۶=جمعه)', example: [0, 1, 2, 3, 4, 5] })
  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  workingDays?: number[];

  @ApiPropertyOptional({ description: 'تعداد روزهای آینده قابل انتخاب در تقویم', example: 7 })
  @IsNumber()
  @Min(1)
  @Max(30)
  @IsOptional()
  daysInAdvance?: number;

  @ApiPropertyOptional({ description: 'تاریخ‌های تعطیل رسمی (ISO YYYY-MM-DD)' })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  holidayDates?: string[];
}

export class CalculateShippingRequestDto {
  @ApiProperty({ description: 'شناسه روش ارسال', example: 'express_courier' })
  @IsString()
  @IsNotEmpty()
  methodId!: string;

  @ApiProperty({ description: 'جمع اقلام سفارش (تومان)', example: 4500000 })
  @IsNumber()
  @Min(0)
  subtotal!: number;

  @ApiPropertyOptional({ description: 'استان مقصد', example: 'تهران' })
  @IsString()
  @IsOptional()
  province?: string;
}
