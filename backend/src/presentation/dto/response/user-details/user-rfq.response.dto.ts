import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { UserRfqDetails, UserRfqItem } from '../../../../domain/entities/user-detail.types.js';

export class UserRfqItemResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  sku: string;

  @ApiProperty()
  title: string;

  @ApiPropertyOptional()
  brand?: string;

  @ApiPropertyOptional()
  category?: string;

  @ApiProperty()
  requestedQty: number;

  @ApiProperty()
  unitPrice: number;

  @ApiProperty()
  stockStatus: string;

  @ApiPropertyOptional()
  suggestedAlternative?: string;

  @ApiPropertyOptional()
  specsSummary?: string;

  static fromDomain(item: UserRfqItem): UserRfqItemResponseDto {
    return {
      id: item.id,
      sku: item.sku,
      title: item.title,
      brand: item.brand,
      category: item.category,
      requestedQty: item.requestedQty,
      unitPrice: item.unitPrice,
      stockStatus: item.stockStatus,
      suggestedAlternative: item.suggestedAlternative,
      specsSummary: item.specsSummary,
    };
  }
}

export class UserRfqResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  rfqNumber: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  projectTitle: string;

  @ApiPropertyOptional()
  companyName?: string;

  @ApiProperty()
  clientPhone: string;

  @ApiPropertyOptional()
  clientEmail?: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  statusLabel: string;

  @ApiProperty()
  urgent: boolean;

  @ApiProperty()
  deadlineHours: number;

  @ApiProperty()
  discountPercent: number;

  @ApiProperty()
  validityDays: number;

  @ApiProperty()
  estimatedValue: number;

  @ApiPropertyOptional()
  finalQuotedAmount?: number;

  @ApiPropertyOptional()
  quotationIssuedAt?: string;

  @ApiPropertyOptional()
  projectLocation?: string;

  @ApiPropertyOptional()
  notes?: string;

  @ApiProperty()
  createdAt: string;

  @ApiProperty({ type: [UserRfqItemResponseDto] })
  items: UserRfqItemResponseDto[];

  static fromDomain(rfq: UserRfqDetails): UserRfqResponseDto {
    return {
      id: rfq.id,
      rfqNumber: rfq.rfqNumber,
      userId: rfq.userId,
      projectTitle: rfq.projectTitle,
      companyName: rfq.companyName,
      clientPhone: rfq.clientPhone,
      clientEmail: rfq.clientEmail,
      status: rfq.status,
      statusLabel: rfq.statusLabel,
      urgent: rfq.urgent,
      deadlineHours: rfq.deadlineHours,
      discountPercent: rfq.discountPercent,
      validityDays: rfq.validityDays,
      estimatedValue: rfq.estimatedValue,
      finalQuotedAmount: rfq.finalQuotedAmount,
      quotationIssuedAt: rfq.quotationIssuedAt ? new Date(rfq.quotationIssuedAt).toLocaleDateString('fa-IR') : undefined,
      projectLocation: rfq.projectLocation,
      notes: rfq.notes,
      createdAt: rfq.createdAt ? new Date(rfq.createdAt).toLocaleDateString('fa-IR') : 'نامشخص',
      items: (rfq.items || []).map(UserRfqItemResponseDto.fromDomain),
    };
  }
}
