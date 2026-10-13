import { DomainException } from './domain.exception.js';
export { InvalidPhoneNumberException } from './invalid-phone-number.exception.js';

export class OtpExpiredException extends DomainException {
  constructor() {
    super('کد تایید پیامکی منقضی شده است. لطفاً مجدداً درخواست ارسال کد دهید.');
    this.name = 'OtpExpiredException';
  }
}

export class OtpInvalidException extends DomainException {
  constructor(remainingAttempts?: number) {
    super(
      remainingAttempts !== undefined
        ? `کد تایید وارد شده نادرست است. (${remainingAttempts} تلاش باقی مانده است)`
        : 'کد تایید وارد شده نادرست است.',
    );
    this.name = 'OtpInvalidException';
  }
}

export class OtpMaxAttemptsExceededException extends DomainException {
  constructor() {
    super('تعداد دفعات تلاش مجاز برای این کد تایید به پایان رسید. لطفاً کد جدید دریافت کنید.');
    this.name = 'OtpMaxAttemptsExceededException';
  }
}

export class OtpCooldownActiveException extends DomainException {
  constructor(secondsRemaining: number) {
    super(`لطفاً قبل از درخواست مجدد پیامک، ${secondsRemaining} ثانیه صبر کنید.`);
    this.name = 'OtpCooldownActiveException';
  }
}

export class TwoFactorRequiredException extends DomainException {
  constructor() {
    super('این حساب کاربری نیاز به تایید هویت دو مرحله‌ای دارد.');
    this.name = 'TwoFactorRequiredException';
  }
}

export class TwoFactorInvalidException extends DomainException {
  constructor(remainingAttempts?: number) {
    super(
      remainingAttempts !== undefined
        ? `رمز دو مرحله‌ای یا PIN امنیتی وارد شده نادرست است. (${remainingAttempts} تلاش باقی مانده است)`
        : 'رمز دو مرحله‌ای یا PIN امنیتی وارد شده نادرست است.',
    );
    this.name = 'TwoFactorInvalidException';
  }
}

export class TwoFactorExpiredException extends DomainException {
  constructor() {
    super('مهلت تایید هویت دو مرحله‌ای به پایان رسیده است. لطفاً مجدداً از مرحله اول وارد شوید.');
    this.name = 'TwoFactorExpiredException';
  }
}

export class SessionRevokedException extends DomainException {
  constructor() {
    super('نشست کاربری شما نامعتبر یا منقضی شده است. لطفاً مجدداً وارد شوید.');
    this.name = 'SessionRevokedException';
  }
}

export class UserSuspendedException extends DomainException {
  constructor() {
    super('حساب کاربری شما غیرفعال یا مسدود شده است. لطفاً با پشتیبانی تماس بگیرید.');
    this.name = 'UserSuspendedException';
  }
}

export class RateLimitExceededException extends DomainException {
  constructor(retryAfterSeconds: number = 60) {
    super(`تعداد درخواست‌ها بیش از حد مجاز است. لطفاً پس از ${retryAfterSeconds} ثانیه مجدداً تلاش کنید.`);
    this.name = 'RateLimitExceededException';
  }
}
