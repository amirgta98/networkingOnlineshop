import { Injectable } from '@nestjs/common';
import type {
  IInvoiceRepository,
  InvoiceFilterOptions,
} from '../../../../domain/repositories/invoice.repository.interface.js';
import {
  InvoiceEntity,
  InvoiceItemEntity,
  InvoiceType,
  InvoiceStatus,
  InvoicePaymentStatus,
  InvoiceLegalDetails,
} from '../../../../domain/entities/invoice.entity.js';
import { PrismaService } from '../prisma.service.js';
import type { Invoice as PrismaInvoice, InvoiceItem as PrismaInvoiceItem } from '@prisma/client';

type InvoiceWithItems = PrismaInvoice & {
  items: PrismaInvoiceItem[];
};

@Injectable()
export class PrismaInvoiceRepository implements IInvoiceRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(invoice: InvoiceEntity): Promise<InvoiceEntity> {
    const legal = invoice.legalDetails;

    // Check if exists
    const existing = await this.prisma.invoice.findUnique({
      where: { id: invoice.id },
      select: { id: true },
    });

    if (existing) {
      // Update
      const updated = await this.prisma.invoice.update({
        where: { id: invoice.id },
        data: {
          status: invoice.status as any,
          paymentStatus: invoice.paymentStatus as any,
          paymentMethod: invoice.paymentMethod,
          taxSystemId: invoice.taxSystemId,
          officialApprovedAt: invoice.officialApprovedAt,
          officialApprovedBy: invoice.officialApprovedBy,
          rejectionReason: invoice.rejectionReason,
          adminNotes: invoice.adminNotes,
          updatedAt: new Date(),
        },
        include: { items: true },
      });
      return this.toDomain(updated);
    }

    // Create with items
    const created = await this.prisma.invoice.create({
      data: {
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        trackingCode: invoice.trackingCode,
        userId: invoice.userId,
        type: invoice.type as any,
        status: invoice.status as any,
        paymentStatus: invoice.paymentStatus as any,
        paymentMethod: invoice.paymentMethod,
        subtotal: BigInt(Math.round(invoice.subtotal)),
        taxRatePercent: invoice.taxRatePercent,
        taxAmount: BigInt(Math.round(invoice.taxAmount)),
        discountAmount: BigInt(Math.round(invoice.discountAmount)),
        shippingCost: BigInt(Math.round(invoice.shippingCost)),
        totalAmount: BigInt(Math.round(invoice.totalAmount)),
        customerName: invoice.customerName,
        customerPhone: invoice.customerPhone,
        customerAddress: invoice.customerAddress,
        customerPostalCode: invoice.customerPostalCode,
        companyName: legal?.companyName,
        registrationNumber: legal?.registrationNumber,
        nationalId: legal?.nationalId,
        economicCode: legal?.economicCode,
        legalPostalCode: legal?.postalCode,
        legalPhone: legal?.phoneNumber,
        legalAddress: legal?.address,
        taxSystemId: invoice.taxSystemId,
        officialApprovedAt: invoice.officialApprovedAt,
        officialApprovedBy: invoice.officialApprovedBy,
        rejectionReason: invoice.rejectionReason,
        adminNotes: invoice.adminNotes,
        items: {
          create: invoice.items.map((it) => ({
            id: it.id,
            productId: it.productId,
            title: it.title,
            sku: it.sku,
            quantity: it.quantity,
            unitPrice: BigInt(Math.round(it.unitPrice)),
            totalPrice: BigInt(Math.round(it.totalPrice)),
            taxAmount: BigInt(Math.round(it.taxAmount)),
          })),
        },
      },
      include: { items: true },
    });

    return this.toDomain(created);
  }

  async findById(id: string): Promise<InvoiceEntity | null> {
    const raw = await this.prisma.invoice.findUnique({
      where: { id },
      include: { items: true },
    });
    return raw ? this.toDomain(raw) : null;
  }

  async findByInvoiceNumber(invoiceNumber: string): Promise<InvoiceEntity | null> {
    const raw = await this.prisma.invoice.findUnique({
      where: { invoiceNumber },
      include: { items: true },
    });
    return raw ? this.toDomain(raw) : null;
  }

  async findByUserId(userId: string): Promise<InvoiceEntity[]> {
    const list = await this.prisma.invoice.findMany({
      where: { userId },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
    return list.map((raw) => this.toDomain(raw));
  }

  async findAll(filter?: InvoiceFilterOptions): Promise<InvoiceEntity[]> {
    const where: any = {};

    if (filter?.type) {
      where.type = filter.type;
    }
    if (filter?.status) {
      where.status = filter.status;
    }
    if (filter?.search?.trim()) {
      const q = filter.search.trim();
      where.OR = [
        { invoiceNumber: { contains: q, mode: 'insensitive' } },
        { trackingCode: { contains: q, mode: 'insensitive' } },
        { taxSystemId: { contains: q, mode: 'insensitive' } },
        { customerName: { contains: q, mode: 'insensitive' } },
        { companyName: { contains: q, mode: 'insensitive' } },
        { nationalId: { contains: q, mode: 'insensitive' } },
      ];
    }

    const list = await this.prisma.invoice.findMany({
      where,
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });

    return list.map((raw) => this.toDomain(raw));
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.invoice.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }

  private toDomain(raw: InvoiceWithItems): InvoiceEntity {
    let legalDetails: InvoiceLegalDetails | null = null;
    if (raw.companyName && raw.nationalId) {
      legalDetails = {
        companyName: raw.companyName,
        registrationNumber: raw.registrationNumber || '',
        nationalId: raw.nationalId,
        economicCode: raw.economicCode || '',
        postalCode: raw.legalPostalCode || '',
        phoneNumber: raw.legalPhone || '',
        address: raw.legalAddress || '',
      };
    }

    return new InvoiceEntity({
      id: raw.id,
      invoiceNumber: raw.invoiceNumber,
      trackingCode: raw.trackingCode,
      userId: raw.userId,
      type: raw.type as InvoiceType,
      status: raw.status as InvoiceStatus,
      paymentStatus: raw.paymentStatus as InvoicePaymentStatus,
      paymentMethod: raw.paymentMethod,
      subtotal: Number(raw.subtotal),
      taxRatePercent: Number(raw.taxRatePercent),
      taxAmount: Number(raw.taxAmount),
      discountAmount: Number(raw.discountAmount),
      shippingCost: Number(raw.shippingCost),
      totalAmount: Number(raw.totalAmount),
      customerName: raw.customerName,
      customerPhone: raw.customerPhone,
      customerAddress: raw.customerAddress,
      customerPostalCode: raw.customerPostalCode,
      legalDetails,
      taxSystemId: raw.taxSystemId,
      officialApprovedAt: raw.officialApprovedAt,
      officialApprovedBy: raw.officialApprovedBy,
      rejectionReason: raw.rejectionReason,
      adminNotes: raw.adminNotes,
      items: (raw.items || []).map(
        (it) =>
          new InvoiceItemEntity({
            id: it.id,
            productId: it.productId,
            title: it.title,
            sku: it.sku,
            quantity: it.quantity,
            unitPrice: Number(it.unitPrice),
            totalPrice: Number(it.totalPrice),
            taxAmount: Number(it.taxAmount),
            createdAt: it.createdAt,
          }),
      ),
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    });
  }
}
