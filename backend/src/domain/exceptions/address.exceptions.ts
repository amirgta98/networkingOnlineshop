import { DomainException } from './domain.exception.js';

export class AddressNotFoundException extends DomainException {
  constructor(id: string) {
    super(`نشانی با شناسه '${id}' یافت نشد.`);
  }
}

export class AddressOwnershipException extends DomainException {
  constructor() {
    super('شما دسترسی مجاز برای مشاهده یا ویرایش این نشانی را ندارید.');
  }
}

export class InvalidAddressDataException extends DomainException {
  constructor(message: string) {
    super(message);
  }
}
