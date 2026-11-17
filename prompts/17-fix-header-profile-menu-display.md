# پرامپت ۱۷: اصلاح نمایش و هماهنگ‌سازی منوی پروفایل در هدر (ادمین، همکار، کاربر)

## مشخصات و مسیرهای مرتبط
- کامپوننت منوی کاربر: `frontend/src/features/auth/components/user-menu.tsx`
- لی‌اوت ادمین: `frontend/src/features/admin/components/admin-layout-client.tsx`
- لی‌اوت همکار: `frontend/src/features/partner/components/partner-layout-client.tsx`
- لی‌اوت فروشگاه و کاربر عادی: `frontend/src/app/(shop)/layout.tsx`

---

## متن پرامپت جهت ارسال به توسعه‌دهنده یا AI

```markdown
در کامپوننت‌های هدر پروژه:
- `frontend/src/features/auth/components/user-menu.tsx`
- `frontend/src/features/admin/components/admin-layout-client.tsx`
- `frontend/src/features/partner/components/partner-layout-client.tsx`
- `frontend/src/app/(shop)/layout.tsx`

مشکل: همان‌طور که در تصویر مشخص است، دکمه پروفایل کاربری در هدر ادمین به دلیل تراکم بالای لینک‌های منو (`navItems` در `admin-layout-client.tsx`) فشرده شده، متن نام کاربر دچار شکستگی نامناسب شده و دکمه آواتار ناقص رندر می‌شود.

اقدامات اصلاحی:
۱. در `admin-layout-client.tsx`: نوار منوی بالای صفحه را مرتب کن؛ لینک‌های با اولویت پایین‌تر را داخل سایدبار نگه دار و برای نوار ناوبری کلاس `min-w-0 flex-1 overflow-x-auto scrollbar-none` بگذار تا بخش `<UserMenu />` به صورت `shrink-0` فضای ثابت خود را در انتهای سمت چپ/راست هدر حفظ کند.
۲. در `user-menu.tsx`: به دکمه تریگر عرض مناسب و کلاس `shrink-0 min-w-max` بده. متن نام کاربر را با کلاس `max-w-[120px] truncate` محافظت کن تا نام‌های طولانی فونت یا دایره آواتار را خرد نکنند.
۳. بررسی کن ظاهر و پدینگ‌های منوی دراپ‌داون در هر سه سناریو (ادمین، پنل همکار و فروشگاه) یکسان، زیبا و بدون پرش یا اسکرول افقی ناخواسته در صفحه باشد.
```
