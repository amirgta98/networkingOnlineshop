import { DomainException } from './domain.exception.js';

export class InvalidPhoneNumberException extends DomainException {
  constructor(phone: string) {
    super(`شماره تلفن همراه وارد شده نامعتبر است: ${phone}`);
    this.name = 'InvalidPhoneNumberException';
  }
}
