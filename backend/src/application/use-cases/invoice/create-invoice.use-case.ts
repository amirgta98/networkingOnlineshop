import {
  InvoiceEntity,
  InvoiceItemEntity,
  InvoiceType,
  InvoiceStatus,
  InvoiceLegalDetails,
} from '../../../domain/entities/invoice.entity.js';
import { OfficialInvoiceValidationException } from '../../../domain/exceptions/invoice.exceptions.js';
import type { IInvoiceRepository } from '../../../domain/repositories/invoice.repository.interface.js';
import { CreateInvoiceCommand } from '../../dto/invoice/create-invoice.dto.js';

export class CreateInvoiceUseCase {
  constructor(private readonly invoiceRepository: IInvoiceRepository) {}

  async execute(command: CreateInvoiceCommand): Promise<InvoiceEntity> {
    // 1. Normalize Type
    const rawType = String(command.type || '').toUpperCase();
    const isOfficial = rawType === 'OFFICIAL' || rawType === 'LEGAL';
    const invoiceType: InvoiceType = isOfficial ? 'OFFICIAL' : 'UNOFFICIAL';

    // 2. Validate Items
    if (!command.items || command.items.length === 0) {
      throw new OfficialInvoiceValidationException('فاکتور باید حداقل شامل یک ردیف کالا باشد.');
    }

    // 3. Official Legal Fields Validation
    let legalDetails: InvoiceLegalDetails | null = null;
    if (isOfficial) {
      const legal = command.legalDetails;
      if (!legal) {
        throw new OfficialInvoiceValidationException('اطلاعات حقوقی شرکت جهت صدور فاکتور رسمی الزامی است.');
      }
      if (!legal.companyName || legal.companyName.trim().length === 0) {
        throw new OfficialInvoiceValidationException('نام کامل ثبتی شرکت یا ارگان دولتی الزامی است.');
      }
      if (!legal.registrationNumber || legal.registrationNumber.trim().length === 0) {
        throw new OfficialInvoiceValidationException('شماره ثبت شرکت الزامی است.');
      }
      const nationalIdClean = (legal.nationalId || '').replace(/\D/g, '');
      if (nationalIdClean.length !== 11) {
        throw new OfficialInvoiceValidationException('شناسه ملی شرکت باید دقیقاً ۱۱ رقم باشد.');
      }
      const economicClean = (legal.economicCode || '').replace(/\D/g, '');
      if (economicClean.length < 12) {
        throw new OfficialInvoiceValidationException('کد اقتصادی جدید سازمان باید حداقل ۱۲ رقم باشد.');
      }
      const postalClean = (legal.postalCode || '').replace(/\D/g, '');
      if (postalClean.length !== 10) {
        throw new OfficialInvoiceValidationException('کد پستی ۱۰ رقمی دفتر مرکزی شرکت الزامی است.');
      }
      if (!legal.phoneNumber || legal.phoneNumber.trim().length < 8) {
        throw new OfficialInvoiceValidationException('شماره تلفن ثابت شرکت (با پیش‌شماره) الزامی است.');
      }
      if (!legal.address || legal.address.trim().length < 10) {
        throw new OfficialInvoiceValidationException('نشانی کامل دفتر مرکزی مطابق روزنامه رسمی الزامی است.');
      }

      legalDetails = {
        companyName: legal.companyName.trim(),
        registrationNumber: legal.registrationNumber.trim(),
        nationalId: nationalIdClean,
        economicCode: economicClean,
        postalCode: postalClean,
        phoneNumber: legal.phoneNumber.trim(),
        address: legal.address.trim(),
      };
    }

    // 4. Calculate Subtotal & Tax
    let subtotal = 0;
    const items: InvoiceItemEntity[] = [];

    const taxRatePercent = isOfficial
      ? Number(process.env.OFFICIAL_INVOICE_TAX_RATE || 10)
      : 0;

    for (const item of command.items) {
      const unitPrice = Math.max(0, Number(item.unitPrice) || 0);
      const quantity = Math.max(1, Number(item.quantity) || 1);
      const rowTotal = unitPrice * quantity;
      subtotal += rowTotal;

      const rowTax = isOfficial ? Math.round(rowTotal * (taxRatePercent / 100)) : 0;

      items.push(
        new InvoiceItemEntity({
          id: crypto.randomUUID(),
          productId: item.productId,
          title: item.title,
          sku: item.sku,
          quantity,
          unitPrice,
          totalPrice: rowTotal,
          taxAmount: rowTax,
        }),
      );
    }

    const discountAmount = Math.max(0, Number(command.discountAmount) || 0);
    const shippingCost = Math.max(0, Number(command.shippingCost) || 0);
    const taxableBase = Math.max(0, subtotal - discountAmount);
    const taxAmount = isOfficial ? Math.round(taxableBase * (taxRatePercent / 100)) : 0;
    const totalAmount = taxableBase + shippingCost + taxAmount;

    // 5. Determine Initial Status
    // Unofficial: no extra process needed -> ISSUED
    // Official: not issued immediately, requires admin approval -> PENDING_APPROVAL
    const initialStatus: InvoiceStatus = isOfficial ? 'PENDING_APPROVAL' : 'ISSUED';

    // 6. Generate Invoice Number & Tracking Code
    const now = new Date();
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const invoiceNumber = `INV-1403-${randomSuffix}`;
    const trackingCode = `NET-${Math.floor(10000000 + Math.random() * 90000000)}`;

    const invoice = new InvoiceEntity({
      id: crypto.randomUUID(),
      invoiceNumber,
      trackingCode,
      userId: command.userId,
      type: invoiceType,
      status: initialStatus,
      paymentStatus: 'UNPAID',
      paymentMethod: command.paymentMethod || 'online_gateway',
      subtotal,
      taxRatePercent,
      taxAmount,
      discountAmount,
      shippingCost,
      totalAmount,
      customerName: command.customerName,
      customerPhone: command.customerPhone,
      customerAddress: command.customerAddress,
      customerPostalCode: command.customerPostalCode,
      legalDetails,
      taxSystemId: null,
      officialApprovedAt: null,
      officialApprovedBy: null,
      rejectionReason: null,
      adminNotes: command.notes,
      items,
      createdAt: now,
      updatedAt: now,
    });

    return await this.invoiceRepository.save(invoice);
  }
}
