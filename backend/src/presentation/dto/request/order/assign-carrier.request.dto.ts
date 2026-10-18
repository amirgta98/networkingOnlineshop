import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class AssignCarrierRequestDto {
  @ApiProperty({ example: 'tipax', description: 'شناسه شرکت حمل و نقل (tipax, chapar, express, heavy_freight)' })
  @IsString()
  @IsNotEmpty()
  carrier!: string;

  @ApiPropertyOptional({ example: 'TPX-982341', description: 'کد رهگیری بارنامه شرکت حمل' })
  @IsOptional()
  @IsString()
  trackingCode?: string;

  @ApiPropertyOptional({ example: 'بسته‌بندی ویژه کارتن ضدضربه' })
  @IsOptional()
  @IsString()
  notes?: string;
}
