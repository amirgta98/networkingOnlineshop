# پرامپت ۱۳: یکپارچه‌سازی و رفع باگ نمای کارتی/فهرستی در `/admin/orders` و `/admin/rfq`

## مشخصات و مسیرهای مرتبط
- ویو سفارشات ادمین: `frontend/src/features/admin/components/orders/admin-orders-view.tsx`
- ویو استعلام قیمت: `frontend/src/features/admin/components/rfq/admin-rfq-view.tsx`
- کامپوننت مشترک جدول: `frontend/src/features/admin/components/shared/admin-data-table.tsx`
- کامپوننت چندنمایی: `frontend/src/features/admin/components/shared/admin-data-view.tsx`

---

## متن پرامپت جهت ارسال به توسعه‌دهنده یا AI

```markdown
در صفحات مدیریت سفارشات (`/admin/orders`) و استعلام قیمت (`/admin/rfq`) در پنل ادمین، ناهماهنگی در نمایش حالت کارتی (Cards) و فهرستی (Table) وجود دارد. 

تحلیل فنی کد:
- در `frontend/src/features/admin/components/orders/admin-orders-view.tsx` از کامپوننت `AdminDataTable` استفاده شده که در آن حالت دسکتاپ به صورت اجباری با کلاس `hidden md:block` جدول است و در موبایل با `block md:hidden` به کارت تبدیل می‌شود و دکمه سوئیچ بین حالت‌ها وجود ندارد.
- اما در `frontend/src/features/admin/components/rfq/admin-rfq-view.tsx` از `AdminDataView` با قابلیت `viewMode` استفاده شده است.
- این عدم تطابق باعث شده در برخی صفحات حالت کارت و جدول همزمان یا با رفتارهای غیرمنتظره و بدون دکمه انتخاب نمایش داده شوند.

اقدام اصلاحی:
۱. کامپوننت نمایش در `admin-orders-view.tsx` را به `AdminDataView` مهاجرت بده یا در بالای هر دو صفحه دکمه‌های سوئیچ اختصاصی (نمای کارتی / نمای جدولی) با ذخیره‌سازی در `localStorage` پیاده‌سازی کن.
۲. اطمینان حاصل کن بریک‌پوینت‌های مدیاکوئری `md` تداخل نداشته باشند و در صفحه دسکتاپ فقط یکی از حالت‌های انتخاب‌شده رندر شود.
```
