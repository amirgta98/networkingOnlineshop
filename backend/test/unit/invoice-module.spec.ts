import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryInvoiceRepository } from '../../src/infrastructure/database/in-memory/in-memory-invoice.repository.js';
import { CreateInvoiceUseCase } from '../../src/application/use-cases/invoice/create-invoice.use-case.js';
import { GetUserInvoicesUseCase } from '../../src/application/use-cases/invoice/get-user-invoices.use-case.js';
import { GetInvoiceByIdUseCase } from '../../src/application/use-cases/invoice/get-invoice-by-id.use-case.js';
import { GetAllInvoicesUseCase } from '../../src/application/use-cases/invoice/get-all-invoices.use-case.js';
import { ApproveOfficialInvoiceUseCase } from '../../src/application/use-cases/invoice/approve-official-invoice.use-case.js';
import { RejectOfficialInvoiceUseCase } from '../../src/application/use-cases/invoice/reject-official-invoice.use-case.js';
import {
  OfficialInvoiceValidationException,
  InvalidInvoiceOperationException,
} from '../../src/domain/exceptions/invoice.exceptions.js';

describe('Invoices Module Unit Tests', () => {
  let repository: InMemoryInvoiceRepository;
  let createInvoiceUseCase: CreateInvoiceUseCase;
  let getUserInvoicesUseCase: GetUserInvoicesUseCase;
  let getInvoiceByIdUseCase: GetInvoiceByIdUseCase;
  let getAllInvoicesUseCase: GetAllInvoicesUseCase;
  let approveOfficialInvoiceUseCase: ApproveOfficialInvoiceUseCase;
  let rejectOfficialInvoiceUseCase: RejectOfficialInvoiceUseCase;

  const USER_ID = '00000000-0000-4000-a000-000000000001';

  beforeEach(() => {
    repository = new InMemoryInvoiceRepository();
    createInvoiceUseCase = new CreateInvoiceUseCase(repository);
    getUserInvoicesUseCase = new GetUserInvoicesUseCase(repository);
    getInvoiceByIdUseCase = new GetInvoiceByIdUseCase(repository);
    getAllInvoicesUseCase = new GetAllInvoicesUseCase(repository);
    approveOfficialInvoiceUseCase = new ApproveOfficialInvoiceUseCase(repository);
    rejectOfficialInvoiceUseCase = new RejectOfficialInvoiceUseCase(repository);
  });

  describe('Unofficial Invoice (غیر رسمی)', () => {
    it('should create an unofficial invoice with 0% tax, no company details, and ISSUED status', async () => {
      const invoice = await createInvoiceUseCase.execute({
        userId: USER_ID,
        type: 'UNOFFICIAL',
        items: [
          {
            title: 'ماژول فیبر نوری GLC-LH-SMD',
            sku: 'GLC-LH-SMD',
            quantity: 2,
            unitPrice: 2500000,
          },
        ],
        customerName: 'عرفان رضایی',
        customerPhone: '09121234567',
        shippingCost: 45000,
        discountAmount: 100000,
      });

      expect(invoice.id).toBeDefined();
      expect(invoice.type).toBe('UNOFFICIAL');
      expect(invoice.status).toBe('ISSUED');
      expect(invoice.subtotal).toBe(5000000);
      expect(invoice.taxRatePercent).toBe(0);
      expect(invoice.taxAmount).toBe(0);
      expect(invoice.discountAmount).toBe(100000);
      expect(invoice.shippingCost).toBe(45000);
      // Total = (5,000,000 - 100,000) + 45,000 + 0 = 4,945,000
      expect(invoice.totalAmount).toBe(4945000);
      expect(invoice.legalDetails).toBeNull();
      expect(invoice.taxSystemId).toBeNull();
    });
  });

  describe('Official Invoice (رسمی)', () => {
    const validLegalDetails = {
      companyName: 'شرکت ارتباطات شبکه و داده گستران نوین (سهامی خاص)',
      registrationNumber: '۴۵۶۷۸۹',
      nationalId: '10103567890',
      economicCode: '411567894321',
      postalCode: '1998765432',
      phoneNumber: '02188776655',
      address: 'تهران، خیابان ولیعصر، بالاتر از میدان ونک، برج پارس، طبقه ۹، واحد ۹۰۲',
    };

    it('should create an official invoice with 10% tax and PENDING_APPROVAL status', async () => {
      const invoice = await createInvoiceUseCase.execute({
        userId: USER_ID,
        type: 'OFFICIAL',
        items: [
          {
            title: 'سوئیچ مدیریتی ۲۴ پورت سیسکو',
            sku: 'C9200L-24T-4G',
            quantity: 1,
            unitPrice: 100000000,
          },
        ],
        customerName: 'شرکت داده گستران',
        shippingCost: 0,
        discountAmount: 0,
        legalDetails: validLegalDetails,
      });

      expect(invoice.id).toBeDefined();
      expect(invoice.type).toBe('OFFICIAL');
      expect(invoice.status).toBe('PENDING_APPROVAL');
      expect(invoice.subtotal).toBe(100000000);
      expect(invoice.taxRatePercent).toBe(10);
      expect(invoice.taxAmount).toBe(10000000); // 10% of 100,000,000
      expect(invoice.totalAmount).toBe(110000000); // 100,000,000 + 10,000,000
      expect(invoice.legalDetails).toEqual(validLegalDetails);
      expect(invoice.taxSystemId).toBeNull();
      expect(invoice.officialApprovedAt).toBeNull();
    });

    it('should fail if company name is missing', async () => {
      await expect(
        createInvoiceUseCase.execute({
          type: 'OFFICIAL',
          items: [{ title: 'تست', quantity: 1, unitPrice: 1000 }],
          legalDetails: { ...validLegalDetails, companyName: '' },
        }),
      ).rejects.toThrow(OfficialInvoiceValidationException);
    });

    it('should fail if national ID is not 11 digits', async () => {
      await expect(
        createInvoiceUseCase.execute({
          type: 'OFFICIAL',
          items: [{ title: 'تست', quantity: 1, unitPrice: 1000 }],
          legalDetails: { ...validLegalDetails, nationalId: '12345' },
        }),
      ).rejects.toThrow('شناسه ملی شرکت باید دقیقاً ۱۱ رقم باشد.');
    });

    it('should fail if economic code is less than 12 digits', async () => {
      await expect(
        createInvoiceUseCase.execute({
          type: 'OFFICIAL',
          items: [{ title: 'تست', quantity: 1, unitPrice: 1000 }],
          legalDetails: { ...validLegalDetails, economicCode: '123' },
        }),
      ).rejects.toThrow('کد اقتصادی جدید سازمان باید حداقل ۱۲ رقم باشد.');
    });

    it('should fail if postal code is not 10 digits', async () => {
      await expect(
        createInvoiceUseCase.execute({
          type: 'OFFICIAL',
          items: [{ title: 'تست', quantity: 1, unitPrice: 1000 }],
          legalDetails: { ...validLegalDetails, postalCode: '123' },
        }),
      ).rejects.toThrow('کد پستی ۱۰ رقمی دفتر مرکزی شرکت الزامی است.');
    });
  });

  describe('Admin Official Approval Workflow (ثبت رسمی)', () => {
    it('should approve an official invoice, assign 22-digit tax system id, and set status to APPROVED', async () => {
      // 1. Create official invoice
      const invoice = await createInvoiceUseCase.execute({
        userId: USER_ID,
        type: 'OFFICIAL',
        items: [
          {
            title: 'روتر میکروتیک CCR2004',
            quantity: 1,
            unitPrice: 50000000,
          },
        ],
        legalDetails: {
          companyName: 'سازمان فناوری اطلاعات',
          registrationNumber: '۱۱۱۱',
          nationalId: '10101111111',
          economicCode: '411111111111',
          postalCode: '1998765432',
          phoneNumber: '02188888888',
          address: 'تهران، خیابان شریعتی، بالاتر از ملک',
        },
      });

      expect(invoice.status).toBe('PENDING_APPROVAL');
      expect(invoice.taxSystemId).toBeNull();

      // 2. Admin approves (ثبت رسمی)
      const approved = await approveOfficialInvoiceUseCase.execute({
        invoiceId: invoice.id,
        approvedBy: 'حسابداری مرکزی ققنوس',
      });

      expect(approved.status).toBe('APPROVED');
      expect(approved.taxSystemId).toBeDefined();
      expect(approved.taxSystemId!.length).toBe(22);
      expect(approved.officialApprovedAt).toBeInstanceOf(Date);
      expect(approved.officialApprovedBy).toBe('حسابداری مرکزی ققنوس');
    });

    it('should reject an official invoice with specified reason', async () => {
      const invoice = await createInvoiceUseCase.execute({
        userId: USER_ID,
        type: 'OFFICIAL',
        items: [{ title: 'روتر میکروتیک', quantity: 1, unitPrice: 50000000 }],
        legalDetails: {
          companyName: 'شرکت تست',
          registrationNumber: '۲۲۲',
          nationalId: '10102222222',
          economicCode: '411222222222',
          postalCode: '1998765432',
          phoneNumber: '02122222222',
          address: 'تهران، خیابان آزادی',
        },
      });

      const rejected = await rejectOfficialInvoiceUseCase.execute({
        invoiceId: invoice.id,
        reason: 'کد اقتصادی در سامانه مودیان فعال نمی‌باشد.',
        rejectedBy: 'ادمین سیستم',
      });

      expect(rejected.status).toBe('REJECTED');
      expect(rejected.rejectionReason).toBe('کد اقتصادی در سامانه مودیان فعال نمی‌باشد.');
    });

    it('should throw error when attempting to approve an unofficial invoice', async () => {
      const unofficial = await createInvoiceUseCase.execute({
        type: 'UNOFFICIAL',
        items: [{ title: 'کابل شبکه', quantity: 1, unitPrice: 500000 }],
      });

      await expect(
        approveOfficialInvoiceUseCase.execute({ invoiceId: unofficial.id }),
      ).rejects.toThrow(InvalidInvoiceOperationException);
    });
  });

  describe('Invoice Query & Retrieval', () => {
    it('should retrieve all invoices with status filter', async () => {
      const all = await getAllInvoicesUseCase.execute();
      expect(all.length).toBeGreaterThanOrEqual(3);

      const pendingOnly = await getAllInvoicesUseCase.execute({ status: 'PENDING_APPROVAL' });
      expect(pendingOnly.every((i) => i.status === 'PENDING_APPROVAL')).toBe(true);

      const officialOnly = await getAllInvoicesUseCase.execute({ type: 'OFFICIAL' });
      expect(officialOnly.every((i) => i.type === 'OFFICIAL')).toBe(true);
    });

    it('should retrieve single invoice by id', async () => {
      const inv = await getInvoiceByIdUseCase.execute('inv-demo-1');
      expect(inv.invoiceNumber).toBe('INV-1403-108420');
      expect(inv.legalDetails?.companyName).toContain('شرکت ارتباطات');
    });
  });
});
