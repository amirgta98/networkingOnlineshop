import { DomainException } from './domain.exception.js';

export class UserNotFoundException extends DomainException {
  constructor(identifier: string) {
    super(`User with identifier '${identifier}' was not found.`);
  }
}
