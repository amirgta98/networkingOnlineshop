# پرامپت ۱۰: رفع باگ ذخیره نشدن ویرایش سایت پروژه در `/partner/projects`

## مشخصات و مسیرهای مرتبط
- ویو پروژه‌های همکار: `frontend/src/features/partner/components/partner-projects-view.tsx`
- سرویس API فرانت‌اند: `frontend/src/features/partner/api/partner-projects-api.ts`
- کنترلر بک‌اند: `backend/src/presentation/controllers/projects.controller.ts`
- ریپازیتوری آدرس‌ها: `backend/src/infrastructure/database/prisma/repositories/prisma-user-address.repository.ts`

---

## متن پرامپت جهت ارسال به توسعه‌دهنده یا AI

```markdown
در صفحه پروژه‌های همکار به آدرس `frontend/src/features/partner/components/partner-projects-view.tsx` و بک‌اند `backend/src/presentation/controllers/projects.controller.ts`:

مشکل: در مودال «ویرایش مشخصات سایت پروژه»، پس از تغییر فیلدها و زدن دکمه «ذخیره تغییرات سایت»، اطلاعات ذخیره نمی‌شود.
ریشه مشکل در کد:
۱. در `partner-projects-view.tsx` در متد `handleSubmitSite` (خطوط ۱۳۶ تا ۱۵۴)، هنگام ساخت `payload` برای `editingSite`، فیلدهای `plaque`، `postalCode` و `supervisorPhone` به دلیل نام‌گذاری متفاوت یا مقادیر پیش‌فرض ناقص ارسال می‌شوند یا در بک‌اند کنترلر `projects.controller.ts` در متد `@Patch(':id')` شرط دسترسی `existing.userId !== userId` با شکست مواجه می‌شود.
۲. در `backend/src/presentation/controllers/projects.controller.ts` (خط ۳۲۵ به بعد):
متد `updateProject` مقدار `body.province` و `body.city` و `body.detailedAddress` را دریافت می‌کند، اما اگر نام مقادیر به صورت `address` یا `fullAddress` ارسال شود به درستی نگاشت نمی‌شود.
۳. در `prisma-user-address.repository.ts` متد `update` بررسی کن که اگر مقادیر `undefined` باشند کلیدها حذف شوند.

اقدام کن:
- در `partner-projects-view.tsx` مطمئن شو تمام فیلدهای فرم (نام، استان، شهر، نشانی کامل، پلاک، واحد، کدپستی ۱۰ رقمی، نام ناظر و شماره تماس ناظر) به درستی در پی‌لود متد `partnerProjectsApi.updateProject(editingSite.id, payload)` قرار گیرند.
- در صورت دریافت ارور از API، متن خطای ارسالی از سرور با Toast قرمز به کاربر نشان داده شود نه اینکه فرم بدون فیدبک بماند.
- پس از آپدیت موفق، مودال بسته شده و `await fetchSites()` لیست را بدون رفرش صفحه به‌روز کند.
```
