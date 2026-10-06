import { DomainException } from './domain.exception.js';

export class UserAlreadyExistsException extends DomainException {
  constructor(email: string) {
    super(`User with email '${email}' already exists.`);
  }
}
