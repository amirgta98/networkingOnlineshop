import type {
  IInvoiceRepository,
  InvoiceFilterOptions,
} from '../../../domain/repositories/invoice.repository.interface.js';
import {
  InvoiceEntity,
  InvoiceItemEntity,
} from '../../../domain/entities/invoice.entity.js';

export class InMemoryInvoiceRepository implements IInvoiceRepository {
  private readonly invoices = new Map<string, InvoiceEntity>();

  constructor() {
    this.seedDemoInvoices();
  }

  public async save(invoice: InvoiceEntity): Promise<InvoiceEntity> {
    this.invoices.set(invoice.id, invoice);
    return invoice;
  }

  public async findById(id: string): Promise<InvoiceEntity | null> {
    const found = this.invoices.get(id);
    return found ? this.clone(found) : null;
  }

  public async findByInvoiceNumber(invoiceNumber: string): Promise<InvoiceEntity | null> {
    for (const inv of this.invoices.values()) {
      if (inv.invoiceNumber.toLowerCase() === invoiceNumber.toLowerCase()) {
        return this.clone(inv);
      }
    }
    return null;
  }

  public async findByUserId(userId: string): Promise<InvoiceEntity[]> {
    const list: InvoiceEntity[] = [];
    for (const inv of this.invoices.values()) {
      if (inv.userId === userId) {
        list.push(this.clone(inv));
      }
    }
    return list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  public async findAll(filter?: InvoiceFilterOptions): Promise<InvoiceEntity[]> {
    let list = Array.from(this.invoices.values()).map((it) => this.clone(it));

    if (filter?.type) {
      list = list.filter((it) => it.type === filter.type);
    }
    if (filter?.status) {
      list = list.filter((it) => it.status === filter.status);
    }
    if (filter?.search?.trim()) {
      const q = filter.search.toLowerCase().trim();
      list = list.filter((it) => {
        const matchNum = it.invoiceNumber.toLowerCase().includes(q);
        const matchTracking = it.trackingCode.toLowerCase().includes(q);
        const matchTax = it.taxSystemId?.toLowerCase().includes(q) || false;
        const matchCustomer = it.customerName?.toLowerCase().includes(q) || false;
        const matchCompany = it.legalDetails?.companyName.toLowerCase().includes(q) || false;
        const matchNational = it.legalDetails?.nationalId.includes(q) || false;
        return matchNum || matchTracking || matchTax || matchCustomer || matchCompany || matchNational;
      });
    }

    return list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  public async delete(id: string): Promise<boolean> {
    return this.invoices.delete(id);
  }

  private clone(inv: InvoiceEntity): InvoiceEntity {
    return new InvoiceEntity({
      id: inv.id,
      invoiceNumber: inv.invoiceNumber,
      trackingCode: inv.trackingCode,
      userId: inv.userId,
      type: inv.type,
      status: inv.status,
      paymentStatus: inv.paymentStatus,
      paymentMethod: inv.paymentMethod,
      subtotal: inv.subtotal,
      taxRatePercent: inv.taxRatePercent,
      taxAmount: inv.taxAmount,
      discountAmount: inv.discountAmount,
      shippingCost: inv.shippingCost,
      totalAmount: inv.totalAmount,
      customerName: inv.customerName,
      customerPhone: inv.customerPhone,
      customerAddress: inv.customerAddress,
      customerPostalCode: inv.customerPostalCode,
      legalDetails: inv.legalDetails ? { ...inv.legalDetails } : null,
      taxSystemId: inv.taxSystemId,
      officialApprovedAt: inv.officialApprovedAt,
      officialApprovedBy: inv.officialApprovedBy,
      rejectionReason: inv.rejectionReason,
      adminNotes: inv.adminNotes,
      items: inv.items.map(
        (it) =>
          new InvoiceItemEntity({
            id: it.id,
            productId: it.productId,
            title: it.title,
            sku: it.sku,
            quantity: it.quantity,
            unitPrice: it.unitPrice,
            totalPrice: it.totalPrice,
            taxAmount: it.taxAmount,
            createdAt: it.createdAt,
          }),
      ),
      createdAt: inv.createdAt,
      updatedAt: inv.updatedAt,
    });
  }

  private seedDemoInvoices(): void {
    const demo1 = new InvoiceEntity({
      id: 'inv-demo-1',
      invoiceNumber: 'INV-1403-108420',
      trackingCode: 'NET-98421035',
      userId: '00000000-0000-4000-a000-000000000001',
      type: 'OFFICIAL',
      status: 'APPROVED',
      paymentStatus: 'PAID',
      paymentMethod: 'satna',
      subtotal: 184000000,
      taxRatePercent: 10,
      taxAmount: 18400000,
      discountAmount: 0,
      shippingCost: 0,
      totalAmount: 202400000,
      customerName: 'شرکت ارتباطات داده گستران نوین',
      customerPhone: '02188776655',
      customerAddress: 'تهران، خیابان ولیعصر، بالاتر از میدان ونک، برج پارس، طبقه ۹',
      customerPostalCode: '1998765432',
      legalDetails: {
        companyName: 'شرکت ارتباطات شبکه و داده گستران نوین (سهامی خاص)',
        registrationNumber: '۴۵۶۷۸۹',
        nationalId: '10103567890',
        economicCode: '411567894321',
        postalCode: '1998765432',
        phoneNumber: '02188776655',
        address: 'تهران، خیابان ولیعصر، بالاتر از میدان ونک، برج پارس، طبقه ۹، واحد ۹۰۲',
      },
      taxSystemId: 'TX1403A98B2C4D78912345',
      officialApprovedAt: new Date(Date.now() - 86400000 * 2),
      officialApprovedBy: 'مدیر مالی ققنوس',
      items: [
        new InvoiceItemEntity({
          id: 'item-1',
          title: 'سوئیچ مدیریتی ۲۴ پورت سیسکو Catalyst 9200L-24T-4G',
          sku: 'C9200L-24T-4G-E',
          quantity: 2,
          unitPrice: 92000000,
          totalPrice: 184000000,
          taxAmount: 18400000,
        }),
      ],
      createdAt: new Date(Date.now() - 86400000 * 2),
      updatedAt: new Date(Date.now() - 86400000 * 2),
    });

    const demo2 = new InvoiceEntity({
      id: 'inv-demo-2',
      invoiceNumber: 'INV-1403-108421',
      trackingCode: 'NET-98421036',
      userId: '00000000-0000-4000-a000-000000000003',
      type: 'OFFICIAL',
      status: 'PENDING_APPROVAL',
      paymentStatus: 'UNPAID',
      paymentMethod: 'paya',
      subtotal: 58000000,
      taxRatePercent: 10,
      taxAmount: 5800000,
      discountAmount: 0,
      shippingCost: 75000,
      totalAmount: 63875000,
      customerName: 'فناوری اطلاعات پیشگامان البرز',
      customerPhone: '02634455667',
      customerAddress: 'کرج، میدان سپاه، بلوار جمهوری، ساختمان اداری نگین، طبقه ۳',
      customerPostalCode: '3149876543',
      legalDetails: {
        companyName: 'فناوری اطلاعات و ارتباطات پیشگامان البرز (با مسئولیت محدود)',
        registrationNumber: '۲۳۴۵۶',
        nationalId: '10109876543',
        economicCode: '411234567890',
        postalCode: '3149876543',
        phoneNumber: '02634455667',
        address: 'کرج، میدان سپاه، بلوار جمهوری، ساختمان اداری نگین، طبقه ۳، واحد ۱۲',
      },
      taxSystemId: null,
      officialApprovedAt: null,
      officialApprovedBy: null,
      items: [
        new InvoiceItemEntity({
          id: 'item-2',
          title: 'روتر برد میکروتیک مدل RB5009UG+S+IN',
          sku: 'RB5009UG+S+IN',
          quantity: 2,
          unitPrice: 29000000,
          totalPrice: 58000000,
          taxAmount: 5800000,
        }),
      ],
      createdAt: new Date(Date.now() - 3600000 * 3),
      updatedAt: new Date(Date.now() - 3600000 * 3),
    });

    const demo3 = new InvoiceEntity({
      id: 'inv-demo-3',
      invoiceNumber: 'INV-1403-108422',
      trackingCode: 'NET-98421037',
      userId: '00000000-0000-4000-a000-000000000003',
      type: 'UNOFFICIAL',
      status: 'ISSUED',
      paymentStatus: 'PAID',
      paymentMethod: 'online_gateway',
      subtotal: 12500000,
      taxRatePercent: 0,
      taxAmount: 0,
      discountAmount: 500000,
      shippingCost: 45000,
      totalAmount: 12045000,
      customerName: 'عرفان رضایی',
      customerPhone: '09121234567',
      customerAddress: 'تهران، خیابان ولیعصر، نرسیده به میدان ونک، پلاک ۳۴',
      customerPostalCode: '1998765432',
      legalDetails: null,
      taxSystemId: null,
      items: [
        new InvoiceItemEntity({
          id: 'item-3',
          title: 'ماژول فیبر نوری سیسکو GLC-LH-SMD اورجینال',
          sku: 'GLC-LH-SMD',
          quantity: 5,
          unitPrice: 2500000,
          totalPrice: 12500000,
          taxAmount: 0,
        }),
      ],
      createdAt: new Date(Date.now() - 86400000 * 5),
      updatedAt: new Date(Date.now() - 86400000 * 5),
    });

    this.invoices.set(demo1.id, demo1);
    this.invoices.set(demo2.id, demo2);
    this.invoices.set(demo3.id, demo3);
  }
}
