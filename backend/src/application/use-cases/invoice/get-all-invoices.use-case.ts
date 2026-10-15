import { InvoiceEntity } from '../../../domain/entities/invoice.entity.js';
import type {
  IInvoiceRepository,
  InvoiceFilterOptions,
} from '../../../domain/repositories/invoice.repository.interface.js';

export class GetAllInvoicesUseCase {
  constructor(private readonly invoiceRepository: IInvoiceRepository) {}

  async execute(filters?: InvoiceFilterOptions): Promise<InvoiceEntity[]> {
    return await this.invoiceRepository.findAll(filters);
  }
}
