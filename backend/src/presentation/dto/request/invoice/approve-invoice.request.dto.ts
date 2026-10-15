import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class ApproveInvoiceRequestDto {
  @ApiPropertyOptional({
    description: 'شناسه یکتای ۲۲ رقمی سامانه مودیان مالیاتی (در صورت خالی بودن خودکار تولید می‌شود)',
    example: 'TX1403A98B2C4D78912345',
  })
  @IsOptional()
  @IsString()
  taxSystemId?: string;

  @ApiPropertyOptional({
    description: 'نام یا شناسه مدیر تاییدکننده',
    example: 'مدیر مالی ققنوس',
  })
  @IsOptional()
  @IsString()
  approvedBy?: string;
}
