import { DomainException } from './domain.exception.js';

export class SpecialOfferNotFoundException extends DomainException {
  constructor(id: string) {
    super(`کمپین فروش ویژه با شناسه ${id} یافت نشد.`);
  }
}

export class InvalidSpecialOfferException extends DomainException {
  constructor(message: string) {
    super(message);
  }
}
