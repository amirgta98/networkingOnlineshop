import { DomainException } from './domain.exception.js';

export class CategoryNotFoundException extends DomainException {
  constructor(identifier: string) {
    super(`دسته‌بندی با مشخصه "${identifier}" یافت نشد.`);
  }
}

export class DuplicateCategorySlugException extends DomainException {
  constructor(slug: string) {
    super(`دسته‌بندی دیگری با پیوند یکتای (اسلاگ) "${slug}" قبلاً ثبت شده است.`);
  }
}

export class CategoryHasProductsException extends DomainException {
  constructor(categoryName: string, productCount: number) {
    super(`امکان حذف دسته‌بندی "${categoryName}" وجود ندارد، زیرا ${productCount} محصول به آن متصل است.`);
  }
}
