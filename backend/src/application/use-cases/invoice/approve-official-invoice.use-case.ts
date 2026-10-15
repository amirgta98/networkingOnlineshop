import { InvoiceEntity } from '../../../domain/entities/invoice.entity.js';
import {
  InvoiceNotFoundException,
  InvalidInvoiceOperationException,
} from '../../../domain/exceptions/invoice.exceptions.js';
import type { IInvoiceRepository } from '../../../domain/repositories/invoice.repository.interface.js';

export interface ApproveOfficialInvoiceCommand {
  invoiceId: string;
  taxSystemId?: string;
  approvedBy?: string;
}

export class ApproveOfficialInvoiceUseCase {
  constructor(private readonly invoiceRepository: IInvoiceRepository) {}

  async execute(command: ApproveOfficialInvoiceCommand): Promise<InvoiceEntity> {
    const invoice = await this.invoiceRepository.findById(command.invoiceId);
    if (!invoice) {
      throw new InvoiceNotFoundException(command.invoiceId);
    }

    if (invoice.type !== 'OFFICIAL') {
      throw new InvalidInvoiceOperationException(
        'تنها صورتحساب‌های رسمی قابلیت ثبت در سامانه مودیان و تایید رسمی را دارند.',
      );
    }

    // Generate simulated 22-character fiscal tax code if not provided
    let taxSystemId = command.taxSystemId;
    if (!taxSystemId || taxSystemId.trim().length === 0) {
      const randomPart = Math.random().toString(36).substring(2, 10).toUpperCase() +
        Math.random().toString(36).substring(2, 10).toUpperCase();
      taxSystemId = (`TX1403${randomPart}000000`).substring(0, 22);
    }

    invoice.approveOfficial(taxSystemId, command.approvedBy || 'مدیر مالی ققنوس');

    return await this.invoiceRepository.save(invoice);
  }
}
