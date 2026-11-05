import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString, ArrayNotEmpty } from 'class-validator';

export class BulkDeleteProductsRequestDto {
  @ApiProperty({
    description: 'لیست شناسه‌های محصولات برای حذف دسته‌ای',
    type: [String],
    example: ['prod-cisco-2960x', 'prod-mikrotik-ccr2004'],
  })
  @IsArray({ message: 'فیلد ids باید یک آرایه باشد.' })
  @ArrayNotEmpty({ message: 'حداقل یک شناسه کالا برای حذف دسته‌ای الزامی است.' })
  @IsString({ each: true, message: 'شناسه هر کالا باید یک رشته معتبر باشد.' })
  ids: string[];
}
