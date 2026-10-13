import { InvalidPhoneNumberException } from '../exceptions/invalid-phone-number.exception.js';

export class PhoneNumber {
  private readonly _value: string;

  private constructor(normalizedPhone: string) {
    this._value = normalizedPhone;
  }

  public static create(rawPhone: string): PhoneNumber {
    const normalized = PhoneNumber.normalize(rawPhone);
    if (!PhoneNumber.isValid(normalized)) {
      throw new InvalidPhoneNumberException(rawPhone);
    }
    return new PhoneNumber(normalized);
  }

  public static normalize(input: string): string {
    if (!input || typeof input !== 'string') return '';

    // 1. Convert Persian/Arabic digits to Latin digits
    const persianToLatin: Record<string, string> = {
      '۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4',
      '۵': '5', '۶': '6', '۷': '7', '۸': '8', '۹': '9',
      '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
      '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9',
    };

    let cleaned = input.replace(/[۰-۹٠-٩]/g, (char) => persianToLatin[char] ?? char);

    // 2. Remove all non-numeric characters (except leading + for parsing)
    cleaned = cleaned.trim();
    if (cleaned.startsWith('+98')) {
      cleaned = '0' + cleaned.substring(3);
    } else if (cleaned.startsWith('0098')) {
      cleaned = '0' + cleaned.substring(4);
    } else if (cleaned.startsWith('98') && cleaned.length === 12) {
      cleaned = '0' + cleaned.substring(2);
    }

    // Strip everything else that isn't a digit
    cleaned = cleaned.replace(/\D/g, '');

    // If starts with 9 and has 10 digits (e.g. 9123456789), prepend 0
    if (cleaned.length === 10 && cleaned.startsWith('9')) {
      cleaned = '0' + cleaned;
    }

    return cleaned;
  }

  public static isValid(phone: string): boolean {
    const normalized = PhoneNumber.normalize(phone);
    return /^09\d{9}$/.test(normalized);
  }

  public get value(): string {
    return this._value;
  }

  public get masked(): string {
    if (this._value.length !== 11) return this._value;
    return `${this._value.substring(0, 4)}***${this._value.substring(7)}`;
  }

  public get maskedPersian(): string {
    const latinMasked = this.masked;
    const latinToPersian: Record<string, string> = {
      '0': '۰', '1': '۱', '2': '۲', '3': '۳', '4': '۴',
      '5': '۵', '6': '۶', '7': '۷', '8': '۸', '9': '۹',
    };
    return latinMasked.replace(/\d/g, (d) => latinToPersian[d] ?? d);
  }

  public equals(other: PhoneNumber): boolean {
    return this._value === other.value;
  }

  public toString(): string {
    return this._value;
  }
}
