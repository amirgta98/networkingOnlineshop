import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, Min, IsOptional, IsString, IsPositive } from 'class-validator';

export class UpdateProductStockRequestDto {
  @ApiProperty({ description: 'تعداد موجودی جدید', example: 20 })
  @IsNumber()
  @Min(0)
  stock: number;

  @ApiPropertyOptional({ description: 'قیمت فروش جدید (اختیاری)', example: 49000000 })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  price?: number;

  @ApiPropertyOptional({ description: 'یادداشت یا علت تغییر موجودی', example: 'ورود بار جدید به انبار' })
  @IsOptional()
  @IsString()
  note?: string;
}
