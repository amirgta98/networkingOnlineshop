# پرامپت ۱۱: حذف کامل صفحه و دسترسی‌های گارانتی همکار (`/partner/warranty`)

## مشخصات و مسیرهای مرتبط
- پیج روت: `frontend/src/app/(partner)/partner/warranty/page.tsx`
- کامپوننت ویو: `frontend/src/features/partner/components/partner-warranty-view.tsx`
- کانفیگ منو: `frontend/src/shared/config/navigation/partner-navigation.ts`
- سایدبار همکار: `frontend/src/features/partner/components/partner-sidebar.tsx`
- ریدایرکت‌ها: `frontend/next.config.ts`

---

## متن پرامپت جهت ارسال به توسعه‌دهنده یا AI

```markdown
صفحه گارانتی و RMA همکاران مازاد بوده و باید به صورت کامل از فرانت‌اند حذف شود.

فایل‌های مورد نظر برای پاکسازی:
۱. حذف فایل پیج: `frontend/src/app/(partner)/partner/warranty/page.tsx`
۲. حذف کامپوننت ویو: `frontend/src/features/partner/components/partner-warranty-view.tsx`
۳. پاکسازی منوهای ناوبری:
   - در `frontend/src/shared/config/navigation/partner-navigation.ts` آیتم مربوط به `/partner/warranty` را حذف کن.
   - در `frontend/src/features/partner/components/partner-sidebar.tsx` هرگونه لینک یا آیکون مربوط به خدمات گارانتی / RMA را بردار.
۴. در `frontend/next.config.ts` در بخش redirects، ریدایرکت از `/partner/warranty` به صفحه اصلی همکار `/partner` با وضعیت `permanent: false` اضافه کن تا کاربرانی که بوکمارک دارند با صفحه 404 مواجه نشوند.
```
