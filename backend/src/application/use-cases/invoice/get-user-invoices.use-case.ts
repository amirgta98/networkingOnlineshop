import { InvoiceEntity } from '../../../domain/entities/invoice.entity.js';
import type { IInvoiceRepository } from '../../../domain/repositories/invoice.repository.interface.js';

export class GetUserInvoicesUseCase {
  constructor(private readonly invoiceRepository: IInvoiceRepository) {}

  async execute(userId: string): Promise<InvoiceEntity[]> {
    return await this.invoiceRepository.findByUserId(userId);
  }
}
