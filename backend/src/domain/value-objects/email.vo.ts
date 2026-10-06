import { InvalidEmailException } from '../exceptions/invalid-email.exception.js';

/**
 * Value Object representing an Email.
 * Encapsulates validation and immutability rules.
 */
export class Email {
  private static readonly EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
  }

  public static create(value: string): Email {
    if (!value || typeof value !== 'string') {
      throw new InvalidEmailException(value ?? '');
    }

    const trimmed = value.trim().toLowerCase();
    if (!Email.EMAIL_REGEX.test(trimmed)) {
      throw new InvalidEmailException(value);
    }

    return new Email(trimmed);
  }

  public get value(): string {
    return this._value;
  }

  public equals(other?: Email | null): boolean {
    if (!other) {
      return false;
    }
    return this._value === other.value;
  }

  public toString(): string {
    return this._value;
  }
}
