import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class RequestOrderPaymentDto {
  @ApiPropertyOptional({ description: 'آدرس بازگشت پس از پرداخت (کالبک)' })
  @IsOptional()
  @IsString()
  callbackUrl?: string;
}

export class RequestWalletChargeDto {
  @ApiProperty({ description: 'مبلغ شارژ به تومان (حداقل ۱۰۰۰ تومان)', example: 5000000 })
  @IsNotEmpty({ message: 'مبلغ شارژ الزامی است.' })
  @IsNumber({}, { message: 'مبلغ شارژ باید عددی معتبر باشد.' })
  @Min(1000, { message: 'حداقل مبلغ شارژ ۱,۰۰۰ تومان است.' })
  amount!: number;

  @ApiPropertyOptional({ description: 'آدرس بازگشت پس از پرداخت' })
  @IsOptional()
  @IsString()
  callbackUrl?: string;
}

export class RequestInvoicePaymentDto {
  @ApiPropertyOptional({ description: 'آدرس بازگشت پس از پرداخت' })
  @IsOptional()
  @IsString()
  callbackUrl?: string;
}

export class DirectVerifyPaymentDto {
  @ApiProperty({ description: 'شناسه اتوریتی زرین‌پال' })
  @IsNotEmpty({ message: 'شناسه Authority الزامی است.' })
  @IsString()
  authority!: string;

  @ApiPropertyOptional({ description: 'وضعیت بازگشتی زرین‌پال (OK یا NOK)', example: 'OK' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ description: 'مبلغ تراکنش به تومان' })
  @IsOptional()
  @IsNumber()
  amount?: number;

  @ApiPropertyOptional({ description: 'نوع تراکنش (WALLET, ORDER, INVOICE)' })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({ description: 'شناسه هدف تراکنش' })
  @IsOptional()
  @IsString()
  targetId?: string;

  @ApiPropertyOptional({ description: 'شناسه کاربر' })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({ description: 'کد رهگیری تراکنش' })
  @IsOptional()
  @IsString()
  trackingCode?: string;
}
