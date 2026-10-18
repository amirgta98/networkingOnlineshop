import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateOrderStatusRequestDto {
  @ApiProperty({
    example: 'PROCESSING_WAREHOUSE',
    description: 'وضعیت جدید سفارش (PENDING_FINANCIAL, PROCESSING_WAREHOUSE, SHIPPING, DELIVERED, CANCELLED)',
  })
  @IsString()
  @IsNotEmpty()
  status!: string;

  @ApiPropertyOptional({ example: 'NET-18492041' })
  @IsOptional()
  @IsString()
  trackingCode?: string;

  @ApiPropertyOptional({ example: 'tipax' })
  @IsOptional()
  @IsString()
  carrier?: string;

  @ApiPropertyOptional({ example: 'فیش واریزی تأیید شد' })
  @IsOptional()
  @IsString()
  notes?: string;
}
