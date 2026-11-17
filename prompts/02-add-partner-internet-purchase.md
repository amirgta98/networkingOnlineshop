# پرامپت ۲: افزودن بخش خرید اینترنت برای همکار سازمانی

## مشخصات و مسیرهای مرتبط
- صفحه اینترنت: `frontend/src/features/internet/components/internet-page-client.tsx`
- گرید پلن‌ها: `frontend/src/features/internet/components/internet-plans-grid.tsx`
- فرم سفارش: `frontend/src/features/internet/components/internet-order-form.tsx`
- تایپ‌ها: `frontend/src/features/internet/types/index.ts`
- پروژه‌های همکار: `frontend/src/features/partner/api/partner-projects-api.ts`

---

## متن پرامپت جهت ارسال به توسعه‌دهنده یا AI

```markdown
در صفحه اینترنت به آدرس `frontend/src/features/internet/components/internet-page-client.tsx` و کامپوننت‌های تابعه:
- `frontend/src/features/internet/components/internet-plans-grid.tsx`
- `frontend/src/features/internet/components/internet-order-form.tsx`
- `frontend/src/features/internet/types/index.ts`

نیاز است بخش اختصاصی «خرید اینترنت برای همکار سازمانی» (B2B Partner Fiber/Broadband) اضافه شود:
۱. در `internet-plans-grid.tsx`، یک تب یا فیلتر اختصاصی جهت نمایش «طرح‌های سازمانی و همکاران B2B» اضافه کن (با امکان نمایش پهنای باند اختصاصی، پورسیون همکار و پورسانت بازاریابی که در `internetSettings` ذخیره شده است).
۲. در فرم ثبت سفارش `internet-order-form.tsx`، برای همکاران لاگین‌شده (با استفاده از `useAffiliate().isPartner` یا `useAuth().isPartner`)، امکان انتخاب «سایت پروژه همکار» از طریق متد `partnerProjectsApi.getMyProjects()` را فعال کن تا همکار بتواند اینترنت را مستقیماً برای یکی از پروژه‌ها یا کارگاه‌های ثبت‌شده خود سفارش دهد.
۳. در صورت لاگین نبودن به عنوان همکار، یک بنر معرفی مزایای اینترنت سازمانی با دکمه هدایت به پنل همکاری `/partners/apply` یا `/dashboard/upgrade-partner` در صفحه قرار بگیرد.
```
