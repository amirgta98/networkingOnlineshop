# پرامپت ۱۲: نمایش شمارنده در تب «تسویه شده» و سایر تب‌های درخواست‌های واریز در `/admin/wallet`

## مشخصات و مسیرهای مرتبط
- ویو ادمین کیف پول: `frontend/src/features/admin/components/wallet/admin-wallet-view.tsx`
- تایپ‌ها و API فرانت: `frontend/src/features/admin/api/admin-wallet-api.ts`
- ریپازیتوری کاربر/کیف پول: `backend/src/infrastructure/database/prisma/repositories/prisma-user.repository.ts`
- کنترلر کیف پول: `backend/src/presentation/controllers/wallet.controller.ts`

---

## متن پرامپت جهت ارسال به توسعه‌دهنده یا AI

```markdown
در پنل مدیریت کیف پول به آدرس `frontend/src/features/admin/components/wallet/admin-wallet-view.tsx` و ریپازیتوری بک‌اند `backend/src/infrastructure/database/prisma/repositories/prisma-user.repository.ts`:

ریشه مشکل در کد:
۱. در `admin-wallet-view.tsx` خطوط ۵۱۵ تا ۵۳۰ در تعریف `statusTabs`:
برای تب‌های `processing` («در حال انتقال پایا») و `rejected` («رد شده / مسترد»)، فیلد `count` اصلاً پاس داده نشده است! برای تب `completed` («تسویه شده») نیز مقدار `withdrawalsData.metrics.completedCount` پاس داده شده اما مقدار آن از بک‌اند undefined است؛ زیرا کامپوننت `AdminFilterToolbar` فقط در صورتی نشانگر عدد را رندر می‌کند که `tab.count !== undefined` باشد.
۲. در بک‌اند در `prisma-user.repository.ts` متد `getAdminWithdrawals` (خط ۱۲۳۵ به بعد):
شمارش برای وضعیت‌های `PROCESSING` و `REJECTED` در متغیرهای خروجی `metrics` قرار نگرفته است.

اقدامات اصلاحی:
- در `prisma-user.repository.ts` شمارش‌های `processingCount` و `rejectedCount` را به خروجی `metrics` اضافه کن و اطمینان حاصل کن `completedCount` به صورت دقیق برگردد.
- در `admin-wallet-view.tsx` پراپ `count` را برای تمام تب‌ها ست کن:
  - تب `processing`: مقدار `withdrawalsData.metrics.processingCount`
  - تب `completed`: مقدار `withdrawalsData.metrics.completedCount ?? 0`
  - تب `rejected`: مقدار `withdrawalsData.metrics.rejectedCount ?? 0`
```
