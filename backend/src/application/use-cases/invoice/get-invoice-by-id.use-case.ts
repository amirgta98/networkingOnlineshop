import { InvoiceEntity } from '../../../domain/entities/invoice.entity.js';
import {
  InvoiceNotFoundException,
  InvoiceOwnershipException,
} from '../../../domain/exceptions/invoice.exceptions.js';
import type { IInvoiceRepository } from '../../../domain/repositories/invoice.repository.interface.js';

export class GetInvoiceByIdUseCase {
  constructor(private readonly invoiceRepository: IInvoiceRepository) {}

  async execute(id: string, userId?: string, isAdmin = false): Promise<InvoiceEntity> {
    const invoice = await this.invoiceRepository.findById(id);
    if (!invoice) {
      throw new InvoiceNotFoundException(id);
    }

    if (!isAdmin && userId && invoice.userId && invoice.userId !== userId) {
      throw new InvoiceOwnershipException();
    }

    return invoice;
  }
}
