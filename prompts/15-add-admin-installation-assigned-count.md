# پرامپت ۱۵: افزودن شمارنده به تب «تخصیص کارشناس» در `/admin/installation`

## مشخصات و مسیرهای مرتبط
- ویو ادمین نصب و راه‌اندازی: `frontend/src/features/admin/components/installation/admin-installation-view.tsx`
- تایپ‌های نصب: `frontend/src/features/installation/types/index.ts`
- سرویس نصب در بک‌اند: `backend/src/application/services/installation.service.ts`
- کنترلر نصب: `backend/src/presentation/controllers/installation.controller.ts`

---

## متن پرامپت جهت ارسال به توسعه‌دهنده یا AI

```markdown
در صفحه مدیریت درخواست‌های نصب و راه‌اندازی در پنل ادمین:
- `frontend/src/features/admin/components/installation/admin-installation-view.tsx`
- `backend/src/application/services/installation.service.ts`

ریشه مشکل در کد:
۱. در `admin-installation-view.tsx` خط ۲۱۷:
```tsx
const filterTabs: FilterTabOption[] = [
  { id: "all", label: "همه درخواست‌ها", count: stats?.total },
  { id: "PENDING_REVIEW", label: "در انتظار بررسی", count: stats?.pending },
  { id: "ASSIGNED", label: "تخصیص کارشناس" }, // پراپ count کامپوننت جا افتاده است!
  { id: "IN_PROGRESS", label: "در حال اجرا", count: stats?.inProgress },
...
```
۲. در بک‌اند در `installation.service.ts` خط ۱۰۱۹ در متد `getAdminStats`:
وضعیت `ASSIGNED` با `PENDING_REVIEW` ترکیب شده است و فیلد مستقلی برای تعداد درخواست‌های در وضعیت تخصیص کارشناس برگردانده نمی‌شود.

اقدام اصلاحی:
- در متد `getAdminStats` فایل `installation.service.ts`، یک کوئری شمارش مجزا برای وضعیت `InstallationStatus.ASSIGNED` با نام `assignedCount` قرار بده و در خروجی آبجکت آمار اضافه کن.
- تایپ `InstallationStats` را به‌روزرسانی کن و در `admin-installation-view.tsx` خط ۲۱۷ پراپ را به صورت `{ id: "ASSIGNED", label: "تخصیص کارشناس", count: stats?.assigned }` تنظیم کن.
```
