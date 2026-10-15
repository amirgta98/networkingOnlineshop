import { InvoiceEntity } from '../../../domain/entities/invoice.entity.js';
import {
  InvoiceNotFoundException,
  InvalidInvoiceOperationException,
} from '../../../domain/exceptions/invoice.exceptions.js';
import type { IInvoiceRepository } from '../../../domain/repositories/invoice.repository.interface.js';

export interface RejectOfficialInvoiceCommand {
  invoiceId: string;
  reason: string;
  rejectedBy?: string;
}

export class RejectOfficialInvoiceUseCase {
  constructor(private readonly invoiceRepository: IInvoiceRepository) {}

  async execute(command: RejectOfficialInvoiceCommand): Promise<InvoiceEntity> {
    const invoice = await this.invoiceRepository.findById(command.invoiceId);
    if (!invoice) {
      throw new InvoiceNotFoundException(command.invoiceId);
    }

    if (invoice.type !== 'OFFICIAL') {
      throw new InvalidInvoiceOperationException(
        'تنها صورتحساب‌های رسمی قابلیت رد درخواست را دارند.',
      );
    }

    const reason = command.reason?.trim() || 'نقص در مدارک و عدم تطابق اطلاعات ثبتی سازمان با سامانه ثبت شرکت‌ها';
    invoice.rejectOfficial(reason, command.rejectedBy);

    return await this.invoiceRepository.save(invoice);
  }
}
