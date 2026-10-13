import { ApiProperty } from '@nestjs/swagger';
import { UserAddressEntity } from '../../../../domain/entities/user-address.entity.js';

export class AddressResponseDto {
  @ApiProperty({ description: 'شناسه یکتای آدرس', example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ description: 'شناسه کاربر مالک آدرس', example: '550e8400-e29b-41d4-a716-446655440000' })
  userId: string;

  @ApiProperty({ description: 'عنوان نشانی', example: 'دفتر مرکزی' })
  title: string;

  @ApiProperty({ description: 'نوع نشانی در دیتابیس', example: 'CENTRAL_OFFICE' })
  type: string;

  @ApiProperty({ description: 'تگ نشانی سازگار با فرانت‌اند', example: 'central_office' })
  tag: string;

  @ApiProperty({ description: 'عنوان فارسی نوع آدرس', example: 'دفتر مرکزی' })
  tagLabel: string;

  @ApiProperty({ description: 'نام کوچک تحویل‌گیرنده', example: 'عرفان' })
  recipientFirstName: string;

  @ApiProperty({ description: 'نام خانوادگی تحویل‌گیرنده', example: 'رضایی' })
  recipientLastName: string;

  @ApiProperty({ description: 'نام کامل تحویل‌گیرنده', example: 'مهندس عرفان رضایی' })
  recipientName: string;

  @ApiProperty({ description: 'شماره تلفن همراه تحویل‌گیرنده', example: '09121234567' })
  recipientMobile: string;

  @ApiProperty({ description: 'شماره تلفن (نام سازگار با فرانت)', example: '09121234567' })
  phoneNumber: string;

  @ApiProperty({ description: 'استان', example: 'تهران' })
  province: string;

  @ApiProperty({ description: 'شهر', example: 'تهران' })
  city: string;

  @ApiProperty({ description: 'نشانی دقیق پستی', example: 'خیابان ولیعصر، برج پارس' })
  detailedAddress: string;

  @ApiProperty({ description: 'نشانی پستی (سازگار با fullAddress)', example: 'خیابان ولیعصر، برج پارس' })
  fullAddress: string;

  @ApiProperty({ description: 'نشانی پستی (سازگار با address در چک‌اوت)', example: 'خیابان ولیعصر، برج پارس' })
  address: string;

  @ApiProperty({ description: 'پلاک', example: '۳۴' })
  plaque: string;

  @ApiProperty({ description: 'پلاک / شماره ساختمان (سازگار با buildingNumber)', example: '۳۴' })
  buildingNumber: string;

  @ApiProperty({ description: 'واحد / طبقه', example: 'واحد ۱۰' })
  unit?: string | null;

  @ApiProperty({ description: 'کد پستی ۱۰ رقمی', example: '1998765432' })
  postalCode: string;

  @ApiProperty({ description: 'یادداشت یا راهنمای تحویل', example: 'تحویل به حراست' })
  deliveryNotes?: string | null;

  @ApiProperty({ description: 'عرض جغرافیایی' })
  latitude?: number | null;

  @ApiProperty({ description: 'طول جغرافیایی' })
  longitude?: number | null;

  @ApiProperty({ description: 'آدرس پیش‌فرض است؟', example: true })
  isDefault: boolean;

  @ApiProperty({ description: 'تاریخ ثبت', example: '2026-10-13T12:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ description: 'تاریخ بروزرسانی', example: '2026-10-13T12:00:00.000Z' })
  updatedAt: string;

  static fromDomain(entity: UserAddressEntity): AddressResponseDto {
    const dto = new AddressResponseDto();
    dto.id = entity.id;
    dto.userId = entity.userId;
    dto.title = entity.title;
    dto.type = entity.type;
    dto.tag = entity.tag;
    dto.tagLabel = entity.tagLabel;
    dto.recipientFirstName = entity.recipientFirstName;
    dto.recipientLastName = entity.recipientLastName;
    dto.recipientName = entity.recipientFullName;
    dto.recipientMobile = entity.recipientMobile;
    dto.phoneNumber = entity.recipientMobile;
    dto.province = entity.province;
    dto.city = entity.city;
    dto.detailedAddress = entity.detailedAddress;
    dto.fullAddress = entity.detailedAddress;
    dto.address = entity.detailedAddress;
    dto.plaque = entity.plaque;
    dto.buildingNumber = entity.plaque;
    dto.unit = entity.unit ?? null;
    dto.postalCode = entity.postalCode;
    dto.deliveryNotes = entity.deliveryNotes ?? null;
    dto.latitude = entity.latitude ?? null;
    dto.longitude = entity.longitude ?? null;
    dto.isDefault = entity.isDefault;
    dto.createdAt = entity.createdAt.toISOString();
    dto.updatedAt = entity.updatedAt.toISOString();
    return dto;
  }
}
