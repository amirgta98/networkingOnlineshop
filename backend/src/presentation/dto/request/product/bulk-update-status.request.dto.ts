import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsIn, IsNotEmpty, IsString, ArrayNotEmpty } from 'class-validator';

export class BulkUpdateProductStatusRequestDto {
  @ApiProperty({
    description: 'لیست شناسه‌های محصولات برای تغییر وضعیت',
    type: [String],
    example: ['prod-cisco-2960x', 'prod-mikrotik-ccr2004'],
  })
  @IsArray({ message: 'فیلد ids باید یک آرایه باشد.' })
  @ArrayNotEmpty({ message: 'حداقل یک شناسه کالا باید انتخاب شود.' })
  @IsString({ each: true, message: 'شناسه هر کالا باید یک رشته معتبر باشد.' })
  ids: string[];

  @ApiProperty({
    description: 'وضعیت جدید در فروشگاه',
    enum: ['active', 'inactive', 'out_of_stock', 'discontinued'],
    example: 'active',
  })
  @IsNotEmpty({ message: 'وضعیت جدید کالا الزامی است.' })
  @IsIn(['active', 'inactive', 'out_of_stock', 'discontinued'], {
    message: 'وضعیت ارسالی نامعتبر است. مقادیر مجاز: active, inactive, out_of_stock, discontinued',
  })
  status: 'active' | 'inactive' | 'out_of_stock' | 'discontinued';
}
