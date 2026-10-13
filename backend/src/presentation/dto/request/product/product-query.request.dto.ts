import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, Min, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export class ProductQueryRequestDto {
  @ApiPropertyOptional({ description: 'جستجو در نام، SKU، برند یا موقعیت قفسه' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'فیلتر دسته‌بندی' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'فیلتر وضعیت کالا' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: 'فیلتر برند تجاری' })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiPropertyOptional({ description: 'شماره صفحه', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'تعداد آیتم در هر صفحه', default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 20;

  @ApiPropertyOptional({ description: 'ستون مرتب‌سازی' })
  @IsOptional()
  @IsString()
  sort?: string;

  @ApiPropertyOptional({ description: 'جهت مرتب‌سازی', enum: ['asc', 'desc'] })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  order?: 'asc' | 'desc' = 'desc';
}
