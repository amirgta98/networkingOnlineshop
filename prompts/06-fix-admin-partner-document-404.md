# پرامپت ۶: رفع خطای 404 (Cannot GET /uploads/partners/...) هنگام باز کردن تصاویر مدارک در پنل ادمین

## مشخصات و مسیرهای مرتبط
- دراور مدارک ادمین: `frontend/src/features/admin/components/partners/partner-detail-drawer-content.tsx`
- ویو همکاران ادمین: `frontend/src/features/admin/components/partners/admin-partners-view.tsx`
- سرو استاتیک در بک‌اند: `backend/src/main.ts`
- سرویس همکاران: `backend/src/application/services/partners.service.ts`
- ریرایت‌های نکست: `frontend/next.config.ts`

---

## متن پرامپت جهت ارسال به توسعه‌دهنده یا AI

```markdown
در پنل مدیریت همکاران در آدرس `/admin/partners`، وقتی ادمین در دراور `frontend/src/features/admin/components/partners/partner-detail-drawer-content.tsx` روی تصویر یا دکمه «مشاهده مستقیم سند در تب جدید» کلیک می‌کند، خطای `Cannot GET /uploads/partners/doc-sample-national.jpg` از اکسپرس دریافت می‌شود.

ریشه فنی و راه‌حل بر اساس پروژه:
۱. بک‌اند: در `backend/src/main.ts` خط ۵۰ به بعد، میدل‌ور سرو استاتیک آپلودها به شکل زیر است:
`app.use('/uploads', expressModule.static(uploadsDir));`
در صورتی که پوشه فیزیکی `uploads/partners` در مسیر جاری ایجاد نشده باشد یا تصویر نمونه/تست روی سرور ذخیره نشده باشد، اکسپرس خطای 404 با فرمت متنی `Cannot GET /uploads/...` بازمی‌گرداند.
۲. بک‌اند: در `backend/src/application/services/partners.service.ts` متد `uploadDocument` مسیر فیزیکی فایل را در `uploads/partners` ذخیره می‌کند، اما در کنترلر `partners.controller.ts` یا هنگام بازگرداندن اطلاعات همکار در `getAdminPartners`، باید اطمینان حاصل شود در صورت عدم وجود فایل در دیسک، آدرس یک تصویر پیش‌فرض (Placeholder) برگردد.
۳. فرانت‌اند: در `partner-detail-drawer-content.tsx` (خطوط ۳۱۰ تا ۳۳۵ و ۴۳۵)، آدرس `doc.fileUrl` به صورت نسبی است (`/uploads/partners/...`). در صورتی که فرانت‌اند در پورت ۳۰۰۰ و بک‌اند در ۳۰۰۱ باشد، ریرایت `next.config.ts` یا آدرس دامین بک‌اند را اضافه کن یا از هلپر یوتیلیتی آدرس‌های مدیا (`resolveMediaUrl(doc.fileUrl)`) استفاده کن تا آدرس‌ها به پورت یا دامین اصلی متصل شوند.
```
