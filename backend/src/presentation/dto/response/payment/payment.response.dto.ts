import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PaymentInitiatedResponseDto {
  @ApiProperty({ description: 'شناسه اتوریتی تولید شده توسط درگاه زرین‌پال' })
  authority!: string;

  @ApiProperty({ description: 'لینک هدایت به صفحه پرداخت شاپرک زرین‌پال' })
  paymentUrl!: string;

  @ApiProperty({ description: 'کد پیگیری داخلی پرداخت' })
  trackingCode!: string;

  @ApiProperty({ description: 'مبلغ قابل پرداخت به تومان' })
  amount!: number;

  @ApiPropertyOptional({ description: 'شناسه سفارش مرتبط' })
  orderId?: string;

  @ApiPropertyOptional({ description: 'شماره سفارش مرتبط' })
  orderNumber?: string;

  @ApiPropertyOptional({ description: 'شناسه فاکتور مرتبط' })
  invoiceId?: string;

  @ApiPropertyOptional({ description: 'شماره فاکتور مرتبط' })
  invoiceNumber?: string;
}

export class PaymentVerificationResponseDto {
  @ApiProperty({ description: 'وضعیت موفقیت پرداخت' })
  success!: boolean;

  @ApiProperty({ description: 'کد رهگیری تراکنش' })
  trackingCode!: string;

  @ApiPropertyOptional({ description: 'شماره ارجاع رسمی بانکی (RefID)' })
  refId?: string;

  @ApiPropertyOptional({ description: 'شماره کارت ماسک شده پرداخت‌کننده' })
  cardPan?: string;

  @ApiProperty({ description: 'نوع تراکنش (ORDER, WALLET, INVOICE)' })
  type!: string;

  @ApiProperty({ description: 'شناسه هدف مرتبط' })
  targetId!: string;

  @ApiPropertyOptional({ description: 'شماره سفارش (در صورت خرید محصول)' })
  orderNumber?: string;

  @ApiPropertyOptional({ description: 'شماره فاکتور (در صورت تسویه فاکتور)' })
  invoiceNumber?: string;

  @ApiProperty({ description: 'مبلغ تراکنش به تومان' })
  amount!: number;

  @ApiProperty({ description: 'پیام نتیجه پرداخت' })
  message!: string;
}
