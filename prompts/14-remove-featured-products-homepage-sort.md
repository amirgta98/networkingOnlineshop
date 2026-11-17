# پرامپت ۱۴: حذف «منتخب صفحه اول» و مرتب‌سازی محصولات بر اساس جدیدترین کالا

## مشخصات و مسیرهای مرتبط
- ویو محصولات ادمین: `frontend/src/features/admin/components/products/admin-products-view.tsx`
- فرم ایجاد/ویرایش کالا: `frontend/src/features/admin/components/products/product-form-view.tsx`
- هوک فیلتر کاتالوگ: `frontend/src/features/catalog/hooks/use-catalog-filter.ts`
- ریپازیتوری محصولات: `backend/src/infrastructure/database/prisma/repositories/prisma-product.repository.ts`

---

## متن پرامپت جهت ارسال به توسعه‌دهنده یا AI

```markdown
در سیستم مدیریت محصولات و کاتالوگ فروشگاه:
- `frontend/src/features/admin/components/products/admin-products-view.tsx`
- `frontend/src/features/admin/components/products/product-form-view.tsx`
- `frontend/src/features/catalog/hooks/use-catalog-filter.ts`
- `backend/src/infrastructure/database/prisma/repositories/prisma-product.repository.ts`

نیازمندی:
ویژگی «منتخب صفحه اول» (isFeatured / featured) نیاز نیست و صفحه اصلی فروشگاه باید همواره محصولات را بر اساس جدیدترین کالاها (Sort by createdAt DESC) نمایش دهد.

اقدامات مورد نیاز:
۱. در `use-catalog-filter.ts` (خط ۱۲): مقدار پیش‌فرض `sort` را از `"featured"` به `"newest"` تغییر بده.
۲. در `product-form-view.tsx` (خط ۸۰۷ تا ۸۳۸): چک‌باکس «کالای منتخب صفحه اول (Featured)» را حذف کن تا هنگام ایجاد محصول جدید این پراپرتی اضافه ثبت نشود.
۳. در `admin-products-view.tsx`: تب فیلتر «کالای منتخب صفحه اول» و برچسب‌های نشانگر ستاره/منتخب روی کارت‌ها را حذف یا تمیزکاری کن.
۴. در بک‌اند در کوئری محصولات ویترین کاتالوگ و صفحه اول، سورت پیش‌فرض را روی `orderBy: { createdAt: 'desc' }` قرار بده تا هر کالایی که اضافه می‌شود بلافاصله در ابتدای محصولات صفحه اول قرار گیرد.
```
