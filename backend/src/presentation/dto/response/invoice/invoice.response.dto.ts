import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type {
  InvoiceEntity,
  InvoiceLegalDetails,
} from '../../../../domain/entities/invoice.entity.js';
import { toInvoiceOutputDto } from '../../../../application/dto/invoice/invoice-output.dto.js';


export class InvoiceItemResponseDto {
  @ApiProperty()
  id: string;

  @ApiPropertyOptional()
  productId?: string | null;

  @ApiProperty()
  title: string;

  @ApiPropertyOptional()
  sku?: string | null;

  @ApiProperty()
  quantity: number;

  @ApiProperty()
  unitPrice: number;

  @ApiProperty()
  totalPrice: number;

  @ApiProperty()
  taxAmount: number;
}

export class LegalDetailsResponseDto {
  @ApiProperty()
  companyName: string;

  @ApiProperty()
  registrationNumber: string;

  @ApiProperty()
  nationalId: string;

  @ApiProperty()
  economicCode: string;

  @ApiProperty()
  postalCode: string;

  @ApiProperty()
  phoneNumber: string;

  @ApiProperty()
  address: string;
}

export class InvoiceResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  invoiceNumber: string;

  @ApiProperty()
  trackingCode: string;

  @ApiPropertyOptional()
  userId?: string | null;

  @ApiProperty({ enum: ['UNOFFICIAL', 'OFFICIAL'] })
  type: string;

  @ApiProperty()
  typeLabel: string;

  @ApiProperty({ enum: ['PENDING_APPROVAL', 'APPROVED', 'REJECTED', 'ISSUED', 'CANCELLED'] })
  status: string;

  @ApiProperty()
  statusLabel: string;

  @ApiProperty({ enum: ['UNPAID', 'PAID'] })
  paymentStatus: string;


  @ApiPropertyOptional()
  paymentMethod?: string | null;

  @ApiProperty()
  subtotal: number;

  @ApiProperty()
  taxRatePercent: number;

  @ApiProperty()
  taxAmount: number;

  @ApiProperty()
  discountAmount: number;

  @ApiProperty()
  shippingCost: number;

  @ApiProperty()
  totalAmount: number;

  @ApiPropertyOptional()
  customerName?: string | null;

  @ApiPropertyOptional()
  customerPhone?: string | null;

  @ApiPropertyOptional()
  customerAddress?: string | null;

  @ApiPropertyOptional()
  customerPostalCode?: string | null;

  @ApiPropertyOptional({ type: LegalDetailsResponseDto })
  legalDetails?: InvoiceLegalDetails | null;

  @ApiPropertyOptional()
  taxSystemId?: string | null;

  @ApiPropertyOptional()
  officialApprovedAt?: string | null;

  @ApiPropertyOptional()
  officialApprovedBy?: string | null;

  @ApiPropertyOptional()
  rejectionReason?: string | null;

  @ApiPropertyOptional()
  adminNotes?: string | null;

  @ApiProperty({ type: [InvoiceItemResponseDto] })
  items: InvoiceItemResponseDto[];

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;

  static fromDomain(entity: InvoiceEntity): InvoiceResponseDto {
    const dto = toInvoiceOutputDto(entity);
    return dto;
  }
}
