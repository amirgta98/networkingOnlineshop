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
      startDate: auth.startDate ? (auth.startDate instanceof Date ? auth.startDate.toISOString() : new Date(auth.startDate).toISOString()) : undefined,
      endDate: auth.endDate ? (auth.endDate instanceof Date ? auth.endDate.toISOString() : new Date(auth.endDate).toISOString()) : undefined,
      daysRemaining: auth.daysRemaining,
      inquiryIp: auth.inquiryIp,
      notes: auth.notes,
      createdAt: auth.createdAt ? (auth.createdAt instanceof Date ? auth.createdAt.toISOString() : new Date(auth.createdAt).toISOString()) : new Date().toISOString(),
    };
  }
}
