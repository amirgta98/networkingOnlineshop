import { DomainException } from './domain.exception.js';

export class InvoiceNotFoundException extends DomainException {
  constructor(idOrNumber: string) {
    super(`فاکتور با مشخصه '${idOrNumber}' یافت نشد.`);
  }
}

export class InvoiceOwnershipException extends DomainException {
  constructor() {
    super('شما دسترسی مجاز برای مشاهده این فاکتور را ندارید.');
  }
}

export class OfficialInvoiceValidationException extends DomainException {
  constructor(message: string) {
    super(message);
  }
}

export class InvalidInvoiceOperationException extends DomainException {
  constructor(message: string) {
    super(message);
  }
}
