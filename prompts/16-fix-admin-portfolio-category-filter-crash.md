# پرامپت ۱۶: اصلاح فیلتر دسته‌بندی و رفع خطای بارگذاری پروژه‌ها در `/admin/portfolio`

## مشخصات و مسیرهای مرتبط
- ویو نمونه‌کارهای ادمین: `frontend/src/features/admin/components/portfolio/admin-portfolio-view.tsx`
- سرویس نمونه‌کارها در بک‌اند: `backend/src/application/services/portfolio.service.ts`
- کنترلر نمونه‌کارها: `backend/src/presentation/controllers/portfolio.controller.ts`

---

## متن پرامپت جهت ارسال به توسعه‌دهنده یا AI

```markdown
در صفحه نمونه‌کارهای ادمین (`/admin/portfolio`):
- `frontend/src/features/admin/components/portfolio/admin-portfolio-view.tsx`
- `backend/src/application/services/portfolio.service.ts`

دو مشکل اساسی وجود دارد:
۱. با تغییر فیلتر دسته‌بندی، خطای «خطا در بارگذاری پروژه‌ها از سرور» ظاهر می‌شود.
۲. نمونه کار مربوط به دسته‌بندی دیتاسنتر در سایر دسته‌بندی‌ها (مثلاً امنیت) نیز نمایش داده می‌شود.

ریشه مشکل در بک‌اند (`portfolio.service.ts` خطوط ۲۱۸ تا ۲۲۷):
```typescript
if (query.category) {
  where.OR = [
    { categoryId: query.category },
    { category: { slug: query.category } },
    { category: { slug: decCategory } },
  ];
}
```
فیلد `categoryId` در دیتابیس PostgreSQL از نوع UUID است. وقتی از سلکتور فرانت مقدار اسلاگ (مثلاً `"datacenter-server-room"` یا نام دسته‌بندی) ارسال می‌شود، پاس دادن رشته معمولی به `categoryId` باعث پرتاب خطای PostgreSQL با متن `invalid input syntax for type uuid` و در نتیجه کرش کوئری با وضعیت HTTP 500 می‌شود! علاوه بر این، شرط `query.search` چند خط پایین‌تر مقدار `where.OR` را بازنویسی (Overwrite) کرده و فیلتر دسته را خنثی می‌کند.

اقدام اصلاحی:
- در `portfolio.service.ts` اعتبارسنجی کن: تنها در صورتی که رشته ارسالی یک UUID معتبر باشد (`/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(query.category)`) شرط `categoryId` در فیلتر قرار گیرد؛ در غیر این صورت فیلتر فقط روی `category.slug` و `category.name` اعمال شود.
- ترکیب فیلترها را به جای انتساب مستقیم `where.OR` با آرایه `where.AND = [ ... ]` بنویس تا فیلتر دسته‌بندی، جستجوی متنی و وضعیت پروژه روی هم اثر بگذارند و نمونه‌کار دسته‌های دیگر نمایش داده نشوند.
```
