import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CategoryResponseDto {
  @ApiProperty({ description: 'شناسه یکتای دسته‌بندی' })
  id: string;

  @ApiProperty({ description: 'عنوان کوتاه دسته‌بندی' })
  shortName: string;

  @ApiProperty({ description: 'نام کامل و تفصیلی' })
  longName: string;

  @ApiProperty({ description: 'پیوند یکتا (اسلاگ)' })
  slug: string;

  @ApiPropertyOptional({ description: 'توضیحات دسته‌بندی' })
  description?: string;

  @ApiPropertyOptional({ description: 'نام یا آدرس آیکون' })
  icon?: string;

  @ApiPropertyOptional({ description: 'برچسب ویژه' })
  badge?: string;

  @ApiPropertyOptional({ description: 'شناسه دسته والد' })
  parentId?: string | null;

  @ApiProperty({ description: 'ترتیب نمایش' })
  sortOrder: number;

  @ApiProperty({ description: 'وضعیت فعال/غیرفعال بودن' })
  isActive: boolean;

  @ApiProperty({ description: 'تعداد محصولات متصل به این دسته‌بندی' })
  productCount: number;

  @ApiProperty({ description: 'تاریخ ایجاد' })
  createdAt: string;

  @ApiProperty({ description: 'تاریخ بروزرسانی' })
  updatedAt: string;
}
