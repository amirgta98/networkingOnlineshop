import { ApiProperty } from '@nestjs/swagger';

export class BulkUpdateProductStatusResponseDto {
  @ApiProperty({ example: true, description: 'وضعیت کلی عملیات' })
  success: boolean;

  @ApiProperty({ example: 5, description: 'تعداد کالاهای به‌روزرسانی‌شده' })
  updatedCount: number;

  @ApiProperty({
    example: ['prod-cisco-2960x', 'prod-mikrotik-ccr2004'],
    description: 'شناسه‌های کالاهایی که با موفقیت تغییر وضعیت یافتند',
    type: [String],
  })
  ids: string[];
}

export class BulkDeleteProductsResponseDto {
  @ApiProperty({ example: true, description: 'وضعیت کلی عملیات' })
  success: boolean;

  @ApiProperty({ example: 3, description: 'تعداد کالاهای حذف‌شده' })
  deletedCount: number;

  @ApiProperty({
    example: ['prod-cisco-2960x', 'prod-mikrotik-ccr2004'],
    description: 'شناسه‌های کالاهایی که با موفقیت حذف شدند',
    type: [String],
  })
  ids: string[];
}
