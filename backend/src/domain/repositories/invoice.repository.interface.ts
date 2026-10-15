import { InvoiceEntity, InvoiceType, InvoiceStatus } from '../entities/invoice.entity.js';

export interface InvoiceFilterOptions {
  type?: InvoiceType;
  status?: InvoiceStatus;
  search?: string;
}

export interface IInvoiceRepository {
  save(invoice: InvoiceEntity): Promise<InvoiceEntity>;
  findById(id: string): Promise<InvoiceEntity | null>;
  findByInvoiceNumber(invoiceNumber: string): Promise<InvoiceEntity | null>;
  findByUserId(userId: string): Promise<InvoiceEntity[]>;
  findAll(filter?: InvoiceFilterOptions): Promise<InvoiceEntity[]>;
  delete(id: string): Promise<boolean>;
}
