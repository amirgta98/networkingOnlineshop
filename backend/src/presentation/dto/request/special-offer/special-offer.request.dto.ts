import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsDateString,
  IsNumber,
  IsBoolean,
  IsIn,
  Min,
  Max,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SpecialOfferItemInputDto {
  @ApiProperty({ description: 'شناسه یکتای محصول در کاتالوگ' })
  @IsString()
  @IsNotEmpty()
  productId!: string;

  @ApiPropertyOptional({ description: 'نوع تخفیف', enum: ['PERCENTAGE', 'FIXED_AMOUNT'], default: 'PERCENTAGE' })
  @IsOptional()
  @IsIn(['PERCENTAGE', 'FIXED_AMOUNT'])
  discountType?: 'PERCENTAGE' | 'FIXED_AMOUNT';

  @ApiPropertyOptional({ description: 'مقدار تخفیف (در صورت عدم ارسال، خودکار از کاتالوگ خوانده می‌شود)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discountValue?: number;

  @ApiPropertyOptional({ description: 'سقف موجودی اختصاص‌یافته به فروش ویژه' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  stockQuota?: number;

  @ApiPropertyOptional({ description: 'حداکثر تعداد قابل سفارش در هر سبد خرید', default: 5 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  maxPerOrder?: number;

  @ApiPropertyOptional({ description: 'ترتیب نمایش محصول در اسلایدر', default: 0 })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}

export class CreateSpecialOfferRequestDto {
  @ApiProperty({ description: 'عنوان کمپین فروش ویژه', example: 'فروش ویژه تجهیزات شبکه' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiPropertyOptional({ description: 'شعار یا برچسب بالای عنوان', example: 'تخفیف ویژه زیرساخت و شبکه' })
  @IsOptional()
  @IsString()
  tagline?: string;

  @ApiPropertyOptional({ description: 'توضیحات تکمیلی کمپین' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'آدرس بنر اختصاصی کمپین' })
  @IsOptional()
  @IsString()
  bannerUrl?: string;

  @ApiProperty({ description: 'تاریخ و ساعت شروع کمپین (ISO string)' })
  @IsDateString()
  startDate!: string;

  @ApiProperty({ description: 'تاریخ و ساعت پایان کمپین (ISO string)' })
  @IsDateString()
  endDate!: string;

  @ApiPropertyOptional({ description: 'وضعیت اولیه کمپین', enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' })
  @IsOptional()
  @IsIn(['ACTIVE', 'INACTIVE'])
  status?: 'ACTIVE' | 'INACTIVE';

  @ApiPropertyOptional({ description: 'اولویت نمایش (کمپین‌های با عدد بالاتر اولویت دارند)', default: 0 })
  @IsOptional()
  @IsNumber()
  priority?: number;

  @ApiPropertyOptional({ description: 'وضعیت انتشار در فرانت‌اند', default: true })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @ApiProperty({ description: 'لیست کالاهای مشمول کمپین فروش ویژه', type: [SpecialOfferItemInputDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SpecialOfferItemInputDto)
  items!: SpecialOfferItemInputDto[];
}

export class UpdateSpecialOfferRequestDto {
  @ApiPropertyOptional({ description: 'عنوان کمپین فروش ویژه' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: 'شعار یا برچسب بالای عنوان' })
  @IsOptional()
  @IsString()
  tagline?: string;

  @ApiPropertyOptional({ description: 'توضیحات تکمیلی کمپین' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'آدرس بنر اختصاصی کمپین' })
  @IsOptional()
  @IsString()
  bannerUrl?: string;

  @ApiPropertyOptional({ description: 'تاریخ و ساعت شروع کمپین' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'تاریخ و ساعت پایان کمپین' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'وضعیت کمپین', enum: ['ACTIVE', 'INACTIVE'] })
  @IsOptional()
  @IsIn(['ACTIVE', 'INACTIVE'])
  status?: 'ACTIVE' | 'INACTIVE';

  @ApiPropertyOptional({ description: 'اولویت نمایش' })
  @IsOptional()
  @IsNumber()
  priority?: number;

  @ApiPropertyOptional({ description: 'وضعیت انتشار در سایت' })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @ApiPropertyOptional({ description: 'لیست به‌روزشده کالاهای مشمول', type: [SpecialOfferItemInputDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SpecialOfferItemInputDto)
  items?: SpecialOfferItemInputDto[];
}

export class UpdateSpecialOfferStatusRequestDto {
  @ApiProperty({ description: 'وضعیت جدید', enum: ['ACTIVE', 'INACTIVE'] })
  @IsIn(['ACTIVE', 'INACTIVE'])
  status!: 'ACTIVE' | 'INACTIVE';

  @ApiPropertyOptional({ description: 'وضعیت انتشار' })
  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;
}

export class SpecialOfferQueryDto {
  @ApiPropertyOptional({ description: 'فیلتر وضعیت: all, active, scheduled, expired, inactive', default: 'all' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: 'جستجو در عنوان یا کالاهای کمپین' })
  @IsOptional()
  @IsString()
  search?: string;
}
