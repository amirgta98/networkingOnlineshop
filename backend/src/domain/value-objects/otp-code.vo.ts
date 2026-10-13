import { randomInt, createHmac, timingSafeEqual } from 'node:crypto';

export class OtpCode {
  private readonly _code: string;

  private constructor(code: string) {
    this._code = code;
  }

  /**
   * Generates a cryptographically secure 5-digit code preserving leading zeros.
   */
  public static generate(length: number = 5): OtpCode {
    const min = 0;
    const max = Math.pow(10, length);
    const num = randomInt(min, max);
    const formatted = num.toString().padStart(length, '0');
    return new OtpCode(formatted);
  }

  /**
   * Wraps an existing string as an OTP code.
   */
  public static fromString(code: string): OtpCode {
    const trimmed = code.trim();
    if (!/^\d{5}$/.test(trimmed)) {
      throw new Error('کد تایید پیامکی باید دقیقاً ۵ رقم عددی باشد.');
    }
    return new OtpCode(trimmed);
  }

  public get value(): string {
    return this._code;
  }

  /**
   * Computes HMAC-SHA256 hash of the OTP using a server-side secret/pepper.
   */
  public hash(secret: string): string {
    return createHmac('sha256', secret)
      .update(this._code)
      .digest('hex');
  }

  /**
   * Timing-safe verification against stored hash.
   */
  public static verify(candidateCode: string, storedHash: string, secret: string): boolean {
    const candidateClean = candidateCode.trim();
    if (candidateClean.length !== 5) return false;

    const candidateHash = createHmac('sha256', secret)
      .update(candidateClean)
      .digest('hex');

    const candidateBuffer = Buffer.from(candidateHash, 'utf8');
    const storedBuffer = Buffer.from(storedHash, 'utf8');

    if (candidateBuffer.length !== storedBuffer.length) {
      return false;
    }

    return timingSafeEqual(candidateBuffer, storedBuffer);
  }
}
