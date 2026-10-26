import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RequestWithdrawalDto {
  @ApiProperty({ description: 'مبلغ برداشت به تومان (برای همکار حداقل ۱۰,۰۰۰,۰۰۰ تومان)', example: 1500000 })
  amount: number;

  @ApiPropertyOptional({ description: 'شماره کارت ۱۶ رقمی بانکی شتاب (اختیاری در صورت ثبت قبلی در پروفایل)', example: '6037991122334455' })
  cardNumber?: string;

  @ApiPropertyOptional({ description: 'شماره شبا بانکی با پیشوند IR (اختیاری در صورت ثبت قبلی در پروفایل)', example: 'IR120170000000123456789012' })
  shabaNumber?: string;

  @ApiPropertyOptional({ description: 'نام و نام خانوادگی صاحب حساب', example: 'علیرضا حسینی' })
  accountHolder?: string;

  @ApiPropertyOptional({ description: 'نام بانک صادرکننده کارت', example: 'بانک ملی ایران' })
  bankName?: string;
}

export class UpdateWithdrawalStatusDto {
  @ApiProperty({
    description: 'وضعیت جدید درخواست تسویه',
    enum: ['PROCESSING', 'COMPLETED', 'REJECTED', 'CANCELLED'],
    example: 'COMPLETED',
  })
  status: 'PROCESSING' | 'COMPLETED' | 'REJECTED' | 'CANCELLED';

  @ApiPropertyOptional({ description: 'شناسه پیگیری واریز پایا یا ساتنا', example: 'PAYA-9876543210' })
  payoutReference?: string;

  @ApiPropertyOptional({ description: 'علت عدم تایید یا رد درخواست برداشت', example: 'عدم تطابق شماره شبا با مشخصات کارت' })
  rejectionReason?: string;
}
