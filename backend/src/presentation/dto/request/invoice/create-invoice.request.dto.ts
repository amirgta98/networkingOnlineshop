import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  ValidateNested,
  IsNumber,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateInvoiceItemRequestDto {
  @ApiPropertyOptional({ description: 'شناسه محصول' })
  @IsOptional()
  @IsString()
  productId?: string;

  @ApiProperty({ description: 'عنوان کالا یا خدمت', example: 'روتر برد میکروتیک RB5009' })
  @IsString()
  @IsNotEmpty({ message: 'عنوان کالا الزامی است.' })
  title: string;

  @ApiPropertyOptional({ description: 'کد کالا یا شناسه انبار', example: 'RB5009UG+S+IN' })
  @IsOptional()
  @IsString()
  sku?: string;

  @ApiProperty({ description: 'تعداد', example: 1 })
  @IsNumber()
  @Min(1, { message: 'تعداد باید حداقل ۱ باشد.' })
  quantity: number;

  @ApiProperty({ description: 'قیمت واحد (ریال یا تومان)', example: 29000000 })
  @IsNumber()
  @Min(0)
  unitPrice: number;
}

export class LegalDetailsRequestDto {
  @ApiProperty({
    description: 'نام کامل ثبتی شرکت یا ارگان دولتی',
    example: 'شرکت ارتباطات شبکه و داده گستران نوین (سهامی خاص)',
  })
  @IsString()
  @IsNotEmpty({ message: 'نام کامل ثبتی شرکت یا ارگان دولتی الزامی است.' })
  companyName: string;

  @ApiProperty({
    description: 'شماره ثبت شرکت',
    example: '۴۵۶۷۸۹',
  })
  @IsString()
  @IsNotEmpty({ message: 'شماره ثبت شرکت الزامی است.' })
  registrationNumber: string;

  @ApiProperty({
    description: 'شناسه ملی شرکت (۱۱ رقم)',
    example: '۱۰۱۰۳۵۶۷۸۹۰',
  })
  @IsString()
  @IsNotEmpty({ message: 'شناسه ملی شرکت الزامی است.' })
  nationalId: string;

  @ApiProperty({
    description: 'کد اقتصادی جدید سازمان (۱۲ یا ۱۴ رقم)',
    example: '۴۱۱۵۶۷۸۹۴۳۲۱',
  })
  @IsString()
  @IsNotEmpty({ message: 'کد اقتصادی سازمان الزامی است.' })
  economicCode: string;

  @ApiProperty({
    description: 'کد پستی ۱۰ رقمی دفتر مرکزی شرکت',
    example: '۱۹۹۸۷۶۵۴۳۲',
  })
  @IsString()
  @IsNotEmpty({ message: 'کد پستی دفتر مرکزی الزامی است.' })
  postalCode: string;

  @ApiProperty({
    description: 'شماره تلفن ثابت شرکت (با پیششماره)',
    example: '۰۲۱۸۸۷۷۶۶۵۵',
  })
  @IsString()
  @IsNotEmpty({ message: 'شماره تلفن ثابت شرکت الزامی است.' })
  phoneNumber: string;

  @ApiProperty({
    description: 'نشانی کامل دفتر مرکزی مطابق روزنامه رسمی',
    example: 'تهران، خیابان ولیعصر، بالاتر از میدان ونک، برج پارس، طبقه ۹، واحد ۹۰۲',
  })
  @IsString()
  @IsNotEmpty({ message: 'نشانی کامل دفتر مرکزی الزامی است.' })
  address: string;
}

export class CreateInvoiceRequestDto {
  @ApiProperty({
    description: 'نوع فاکتور (UNOFFICIAL یا OFFICIAL)',
    example: 'OFFICIAL',
    enum: ['UNOFFICIAL', 'OFFICIAL', 'personal', 'legal'],
  })
  @IsString()
  @IsNotEmpty({ message: 'نوع فاکتور الزامی است.' })
  type: 'UNOFFICIAL' | 'OFFICIAL' | 'personal' | 'legal';

  @ApiProperty({ description: 'اقلام سفارش', type: [CreateInvoiceItemRequestDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateInvoiceItemRequestDto)
  items: CreateInvoiceItemRequestDto[];

  @ApiPropertyOptional({ description: 'نام خریدار / کاربر', example: 'مهندس عرفان رضایی' })
  @IsOptional()
  @IsString()
  customerName?: string;

  @ApiPropertyOptional({ description: 'شماره تماس خریدار', example: '09121234567' })
  @IsOptional()
  @IsString()
  customerPhone?: string;

  @ApiPropertyOptional({ description: 'نشانی تحویل کالا', example: 'تهران، خیابان ولیعصر، پلاک ۳۴' })
  @IsOptional()
  @IsString()
  customerAddress?: string;

  @ApiPropertyOptional({ description: 'کد پستی خریدار', example: '1998765432' })
  @IsOptional()
  @IsString()
  customerPostalCode?: string;

  @ApiPropertyOptional({ description: 'هزینه ارسال', example: 45000 })
  @IsOptional()
  @IsNumber()
  shippingCost?: number;

  @ApiPropertyOptional({ description: 'مبلغ تخفیف یا کوپن', example: 500000 })
  @IsOptional()
  @IsNumber()
  discountAmount?: number;

  @ApiPropertyOptional({ description: 'شیوه پرداخت', example: 'online_gateway' })
  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @ApiPropertyOptional({ description: 'توضیحات فاکتور', example: 'ارسال فوری همراه با تحویل برگ گارانتی' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    description: 'اطلاعات حقوقی شرکت (برای فاکتور رسمی الزامی است)',
    type: LegalDetailsRequestDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => LegalDetailsRequestDto)
  legalDetails?: LegalDetailsRequestDto;
}
