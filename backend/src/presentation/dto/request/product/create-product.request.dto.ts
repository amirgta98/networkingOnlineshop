import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  Min,
  IsOptional,
  IsArray,
  IsBoolean,
  IsIn,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ProductFeatureRequestDto {
  @ApiPropertyOptional({ description: 'شناسه اختیاری ویژگی' })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty({ description: 'عنوان ویژگی', example: 'نوع پورت‌ها' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'توضیحات و مقدار ویژگی', example: '۲۴ پورت گیگابیت اترنت PoE+' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional({ description: 'آدرس آیکون آپلودشده', example: '/uploads/icons/icon-1.svg' })
  @IsOptional()
  @IsString()
  iconUrl?: string;

  @ApiPropertyOptional({ description: 'نام آیکون پیش‌فرض سیستم', example: 'network' })
  @IsOptional()
  @IsString()
  iconName?: string;

  @ApiPropertyOptional({ description: 'ترتیب نمایش ویژگی', example: 0 })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}

export class CreateProductRequestDto {
  @ApiProperty({ description: 'نام کامل کالا', example: 'سوئیچ ۲۴ پورت سیسکو Catalyst 2960-X' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ description: 'اسلاگ پیوند یکتا', example: 'cisco-catalyst-2960x' })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiProperty({ description: 'شناسه یکتای کالا (SKU / پارت‌نامبر)', example: 'WS-C2960X-24PS-L' })
  @IsString()
  @IsNotEmpty()
  sku: string;

  @ApiProperty({ description: 'دسته‌بندی محصول', example: 'switches' })
  @IsString()
  @IsNotEmpty()
  category: string;

  @ApiProperty({ description: 'برند کالا', example: 'Cisco' })
  @IsString()
  @IsNotEmpty()
  brand: string;

  @ApiProperty({ description: 'قیمت فروش (تومان)', example: 48500000 })
  @IsNumber()
  @IsPositive()
  price: number;

  @ApiPropertyOptional({ description: 'قیمت اصلی قبل از تخفیف (تومان)', example: 52000000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  originalPrice?: number;

  @ApiPropertyOptional({ description: 'بهای تمام‌شده خرید (تومان)', example: 41000000 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  costPrice?: number;

  @ApiProperty({ description: 'موجودی فیزیکی در انبار', example: 14 })
  @IsNumber()
  @Min(0)
  stock: number;

  @ApiPropertyOptional({ description: 'حداقل هشدار کسری انبار', example: 5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minStockAlert?: number;

  @ApiPropertyOptional({ description: 'موجودی رزرو شده در سفارشات جاری', example: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  reservedStock?: number;

  @ApiPropertyOptional({ description: 'محل قفسه در انبار', example: 'انبار مرکزی تهران - قفسه A1' })
  @IsOptional()
  @IsString()
  warehouseLocation?: string;

  @ApiPropertyOptional({ description: 'وضعیت در فروشگاه', enum: ['active', 'inactive', 'out_of_stock', 'discontinued'] })
  @IsOptional()
  @IsIn(['active', 'inactive', 'out_of_stock', 'discontinued'])
  status?: 'active' | 'inactive' | 'out_of_stock' | 'discontinued';

  @ApiPropertyOptional({ description: 'کالای ویژه', example: false })
  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @ApiPropertyOptional({ description: 'نمایش در فروش ویژه', example: false })
  @IsOptional()
  @IsBoolean()
  isSpecialOffer?: boolean;

  @ApiPropertyOptional({ description: 'امتیاز محصول', example: 5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  rating?: number;

  @ApiPropertyOptional({ description: 'تعداد نظرات', example: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  reviewCount?: number;

  @ApiPropertyOptional({ description: 'درصد تخفیف', example: 10 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  discountPercent?: number;

  @ApiPropertyOptional({ description: 'شناسه محصول اختیاری' })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiPropertyOptional({ description: 'آدرس تصاویر محصول', example: ['/uploads/products/image-1.webp'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiPropertyOptional({ description: 'شرایط گارانتی', example: 'گارانتی ۳۶ ماهه تعویض درجا طلایی ققنوس' })
  @IsOptional()
  @IsString()
  warranty?: string;

  @ApiPropertyOptional({ description: 'برچسب‌های تبلیغاتی', example: ['پرفروش', 'گارانتی طلایی'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  badges?: string[];

  @ApiPropertyOptional({ description: 'مشخصات کوتاه', example: ['۲۴ پورت گیگابیت', 'PoE+'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  specs?: string[];

  @ApiPropertyOptional({
    description: 'ویژگی‌های داینامیک و اختصاصی کالا',
    type: [ProductFeatureRequestDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProductFeatureRequestDto)
  features?: ProductFeatureRequestDto[];

  @ApiPropertyOptional({
    description: 'شناسه‌های محصولات مرتبط',
    example: ['prod-cisco-2960x'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  relatedProductIds?: string[];

  @ApiPropertyOptional({ description: 'توضیحات کوتاه', example: 'سوئیچ ۲۴ پورت مدیریتی لایه ۲' })
  @IsOptional()
  @IsString()
  shortDescription?: string;

  @ApiPropertyOptional({ description: 'توضیحات کامل فنی', example: 'توضیحات جامع پیرامون استانداردهای شبکه...' })
  @IsOptional()
  @IsString()
  fullDescription?: string;

  @ApiPropertyOptional({ description: 'وضعیت موجودی در انبار' })
  @IsOptional()
  @IsBoolean()
  inStock?: boolean;

  @ApiPropertyOptional({ description: 'تاریخ ایجاد' })
  @IsOptional()
  @IsString()
  createdAt?: string;

  @ApiPropertyOptional({ description: 'تاریخ بروزرسانی' })
  @IsOptional()
  @IsString()
  updatedAt?: string;

  @ApiPropertyOptional({ description: 'گروه‌های مشخصات فنی' })
  @IsOptional()
  @IsArray()
  specGroups?: any[];

  @ApiPropertyOptional({ description: 'قیمت‌گذاری پلکانی' })
  @IsOptional()
  @IsArray()
  tieredPricing?: any[];

  @ApiPropertyOptional({ description: 'تاریخچه ورود و خروج انبار' })
  @IsOptional()
  @IsArray()
  inventoryLogs?: any[];
}
