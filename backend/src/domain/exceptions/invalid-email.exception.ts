import { DomainException } from './domain.exception.js';

export class InvalidEmailException extends DomainException {
  constructor(email: string) {
    super(`'${email}' is not a valid email address.`);
  }
}
