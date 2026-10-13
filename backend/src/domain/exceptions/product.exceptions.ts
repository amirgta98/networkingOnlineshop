import { DomainException } from './domain.exception.js';

export class ProductNotFoundException extends DomainException {
  constructor(identifier: string) {
    super(`محصول مورد نظر با شناسه «${identifier}» در سیستم یافت نشد.`);
    this.name = 'ProductNotFoundException';
  }
}

export class DuplicateSkuException extends DomainException {
  constructor(sku: string) {
    super(`کد شناسایی انبار (SKU) «${sku}» تکراری است و قبلاً ثبت شده است.`);
    this.name = 'DuplicateSkuException';
  }
}

export class InvalidProductDataException extends DomainException {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidProductDataException';
  }
}

export class ImageProcessingException extends DomainException {
  constructor(reason: string) {
    super(`خطا در پردازش و ذخیره تصویر: ${reason}`);
    this.name = 'ImageProcessingException';
  }
}
