import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class RejectInvoiceRequestDto {
  @ApiProperty({
    description: 'علت رد درخواست صدور فاکتور رسمی',
    example: 'عدم تطابق شناسه ملی با کد پستی ثبت شده در روزنامه رسمی',
  })
  @IsString()
  @IsNotEmpty({ message: 'دلیل رد درخواست الزامی است.' })
  reason: string;

  @ApiProperty({
    description: 'نام کاربر یا مدیر بررسی‌کننده',
    required: false,
  })
  @IsOptional()
  @IsString()
  rejectedBy?: string;
}
