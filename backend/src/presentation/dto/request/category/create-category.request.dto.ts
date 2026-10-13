import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsNumber,
  Min,
} from 'class-validator';

export class CreateCategoryRequestDto {
  @ApiProperty({ description: 'عنوان کوتاه دسته‌بندی', example: 'سوئیچ‌های شبکه' })
  @IsString()
  @IsNotEmpty()
  shortName: string;

  @ApiPropertyOptional({
    description: 'نام کامل و تفصیلی دسته‌بندی',
    example: 'سوئیچ‌های مدیریتی و غیرمدیریتی سیسکو و میکروتیک',
  })
  @IsOptional()
  @IsString()
  longName?: string;

  @ApiPropertyOptional({ description: 'پیوند یکتا (اسلاگ)', example: 'switches' })
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional({
    description: 'توضیحات و کاربرد دسته‌بندی',
    example: 'تجهیزات سوئیچینگ لایه ۲ و ۳ با پورت‌های گیگابیت و PoE',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'آیکون دسته‌بندی', example: 'Layers' })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional({ description: 'برچسب ویژه', example: 'پرفروش' })
  @IsOptional()
  @IsString()
  badge?: string;

  @ApiPropertyOptional({ description: 'شناسه دسته والد (در صورت زیردسته بودن)' })
  @IsOptional()
  @IsString()
  parentId?: string | null;

  @ApiPropertyOptional({ description: 'ترتیب نمایش', example: 1 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  sortOrder?: number;

  @ApiPropertyOptional({ description: 'وضعیت فعال/غیرفعال بودن', example: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
