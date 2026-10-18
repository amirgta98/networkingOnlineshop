import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { UserAuthenticityDetails } from '../../../../domain/entities/user-detail.types.js';

export class UserAuthenticityResponseDto {
  @ApiProperty()
  id: string;

  @ApiPropertyOptional()
  userId?: string;

  @ApiProperty()
  serialNumber: string;

  @ApiPropertyOptional()
  hologramCode?: string;

  @ApiProperty()
  productName: string;

  @ApiProperty()
  brand: string;

  @ApiPropertyOptional()
  model?: string;

  @ApiProperty()
  warrantyType: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  statusLabel: string;

  @ApiProperty()
  isAuthentic: boolean;

  @ApiPropertyOptional()
  startDate?: string;

  @ApiPropertyOptional()
  endDate?: string;

  @ApiProperty()
  daysRemaining: number;

  @ApiPropertyOptional()
  inquiryIp?: string;

  @ApiPropertyOptional()
  notes?: string;

  @ApiProperty()
  createdAt: string;

  static fromDomain(auth: UserAuthenticityDetails): UserAuthenticityResponseDto {
    return {
      id: auth.id,
      userId: auth.userId,
      serialNumber: auth.serialNumber,
      hologramCode: auth.hologramCode,
      productName: auth.productName,
      brand: auth.brand,
      model: auth.model,
      warrantyType: auth.warrantyType,
      status: auth.status,
      statusLabel: auth.statusLabel,
      isAuthentic: auth.isAuthentic,
      startDate: auth.startDate ? new Date(auth.startDate).toLocaleDateString('fa-IR') : undefined,
      endDate: auth.endDate ? new Date(auth.endDate).toLocaleDateString('fa-IR') : undefined,
      daysRemaining: auth.daysRemaining,
      inquiryIp: auth.inquiryIp,
      notes: auth.notes,
      createdAt: auth.createdAt ? new Date(auth.createdAt).toLocaleDateString('fa-IR') : 'نامشخص',
    };
  }
}
