import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

export class CategoryQueryRequestDto {
  @ApiPropertyOptional({ description: 'جستجو در عنوان، اسلاگ و توضیحات' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'فیلتر بر اساس فعال/غیرفعال بودن' })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return undefined;
  })
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'شناسه دسته والد' })
  @IsOptional()
  @IsString()
  parentId?: string;

  @ApiPropertyOptional({ description: 'شماره صفحه' })
  @IsOptional()
  @Transform(({ value }) => (value !== undefined && value !== null ? Number(value) : undefined))
  page?: number;

  @ApiPropertyOptional({ description: 'تعداد در هر صفحه' })
  @IsOptional()
  @Transform(({ value }) => (value !== undefined && value !== null ? Number(value) : undefined))
  limit?: number;
}
