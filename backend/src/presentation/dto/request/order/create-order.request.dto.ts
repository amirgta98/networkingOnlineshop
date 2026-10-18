import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsArray,
  ValidateNested,
  IsNumber,
  IsOptional,
  Min,
  ArrayMinSize,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOrderItemDto {
  @ApiPropertyOptional({ example: 'd0000000-0000-0000-0000-000000000001' })
  @IsOptional()
  @IsString()
  productId?: string;

  @ApiPropertyOptional({ example: 'WS-C2960X-24PS-L' })
  @IsOptional()
  @IsString()
  sku?: string;

  @ApiProperty({ example: 2 })
  @IsNumber()
  @Min(1, { message: 'تعداد هر محصول حداقل باید ۱ عدد باشد.' })
  quantity!: number;

  @ApiPropertyOptional({ example: 18200000 })
  @IsOptional()
  @IsNumber()
  unitPrice?: number;
}

export class OrderShippingAddressDto {
  @ApiProperty({ example: 'مهندس عرفان رضایی' })
  @IsString({ message: 'نام تحویل‌گیرنده الزامی است.' })
  recipientName!: string;

  @ApiProperty({ example: '09121234567' })
  @IsString({ message: 'شماره تلفن تحویل‌گیرنده الزامی است.' })
  phoneNumber!: string;

  @ApiProperty({ example: 'تهران' })
  @IsString({ message: 'استان تحویل الزامی است.' })
  province!: string;

  @ApiProperty({ example: 'تهران' })
  @IsString({ message: 'شهر تحویل الزامی است.' })
  city!: string;

  @ApiProperty({ example: '1998765432' })
  @IsString({ message: 'کد پستی ۱۰ رقمی الزامی است.' })
  postalCode!: string;

  @ApiProperty({ example: 'خیابان ولیعصر، بالاتر از طالقانی، پلاک ۳۴' })
  @IsString({ message: 'نشانی پستی الزامی است.' })
  address!: string;

  @ApiPropertyOptional({ example: '۳۴' })
  @IsOptional()
  @IsString()
  buildingNumber?: string;

  @ApiPropertyOptional({ example: '۱۰' })
  @IsOptional()
  @IsString()
  unit?: string;

  @ApiPropertyOptional({ example: 'تحویل واحد IT دیتاسنتر شود.' })
  @IsOptional()
  @IsString()
  deliveryNotes?: string;
}

export class LegalInvoiceRequestDto {
  @ApiProperty({ example: 'شرکت فناوران شبکه ققنوس' })
  @IsString()
  companyName!: string;

  @ApiPropertyOptional({ example: '10103567890' })
  @IsOptional()
  @IsString()
  nationalId?: string;

  @ApiPropertyOptional({ example: '411567894321' })
  @IsOptional()
  @IsString()
  economicCode?: string;

  @ApiPropertyOptional({ example: '456789' })
  @IsOptional()
  @IsString()
  registrationNumber?: string;

  @ApiPropertyOptional({ example: 'تهران' })
  @IsOptional()
  @IsString()
  province?: string;

  @ApiPropertyOptional({ example: 'تهران' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ example: '1998765432' })
  @IsOptional()
  @IsString()
  postalCode?: string;

  @ApiPropertyOptional({ example: 'خیابان ولیعصر، برج پارس' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: '02188776655' })
  @IsOptional()
  @IsString()
  phoneNumber?: string;
}

export class CreateOrderRequestDto {
  @ApiProperty({ type: [CreateOrderItemDto] })
  @IsArray()
  @ArrayMinSize(1, { message: 'سبد خرید و اقلام سفارش نمی‌تواند خالی باشد.' })
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items!: CreateOrderItemDto[];

  @ApiProperty({ type: OrderShippingAddressDto })
  @IsObject()
  @ValidateNested()
  @Type(() => OrderShippingAddressDto)
  shippingAddress!: OrderShippingAddressDto;

  @ApiPropertyOptional({ example: 'personal', enum: ['personal', 'legal'] })
  @IsOptional()
  @IsString()
  invoiceType?: string;

  @ApiPropertyOptional({ type: LegalInvoiceRequestDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => LegalInvoiceRequestDto)
  legalInvoice?: LegalInvoiceRequestDto;

  @ApiPropertyOptional({ example: 'express_courier' })
  @IsOptional()
  @IsString()
  deliveryMethodId?: string;

  @ApiPropertyOptional({ example: '2026-10-20' })
  @IsOptional()
  @IsString()
  deliveryDate?: string;

  @ApiPropertyOptional({ example: '۱۴۰۵/۰۷/۲۹' })
  @IsOptional()
  @IsString()
  deliveryDateJalali?: string;

  @ApiPropertyOptional({ example: 'morning' })
  @IsOptional()
  @IsString()
  deliveryTimeSlot?: string;

  @ApiPropertyOptional({ example: 'تحویل به نگهبانی' })
  @IsOptional()
  @IsString()
  specialDeliveryNotes?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  liftRequired?: boolean;

  @ApiPropertyOptional({ example: 'online_gateway' })
  @IsOptional()
  @IsString()
  paymentMethodId?: string;

  @ApiPropertyOptional({ example: 'saman' })
  @IsOptional()
  @IsString()
  selectedGatewayId?: string;

  @ApiPropertyOptional({ example: 'NETMARKET' })
  @IsOptional()
  @IsString()
  couponCode?: string;
}
