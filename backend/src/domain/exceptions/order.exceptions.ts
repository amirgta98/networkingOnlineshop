import { DomainException } from './domain.exception.js';

export class OrderNotFoundException extends DomainException {
  constructor(identifier: string) {
    super(`سفارش با مشخصه «${identifier}» در سامانه یافت نشد.`);
  }
}

export class InsufficientStockException extends DomainException {
  constructor(productName: string, requested: number, available: number) {
    super(
      `موجودی محصول «${productName}» برای سفارش کافی نیست. (تعداد درخواستی: ${requested}، موجودی انبار: ${available})`,
    );
  }
}

export class EmptyOrderException extends DomainException {
  constructor() {
    super('سبد خرید و اقلام سفارش نمی‌تواند خالی باشد.');
  }
}

export class InvalidOrderException extends DomainException {
  constructor(message: string) {
    super(message);
  }
}

export class DuplicateOrderException extends DomainException {
  constructor() {
    super('یک سفارش مشابه در چند ثانیه گذشته ثبت شده است. لطفاً چند لحظه صبر کنید.');
  }
}
