# فهرست پرامپت‌های اختصاصی رفع باگ‌ها و نیازمندی‌های پروژه

این پوشه شامل ۱۷ پرامپت فوق‌العاده دقیق و فنی است که بر اساس تحلیل مستقیم سورس‌کد پروژه (`frontend` مبتنی بر Next.js 15 و `backend` مبتنی بر NestJS + Prisma) آماده شده‌اند. هر فایل به طور مجزا قابل ارسال به توسعه‌دهنده یا ابزارهای هوش مصنوعی جهت پیاده‌سازی سریع و بدون ابهام است.

> **نکته:** مورد مربوط به «شخصی‌سازی ثبت درخواست در `admin/installation` بدون ریدایرکت به صفحه اصلی» به تایید کارفرما از قبل حل شده و در این لیست مستثنی شده است.

---

### بخش اول: ماژول اینترنت و تسویه‌حساب (Internet & Checkout)
1. [`01-fix-internet-b2b-payment.md`](./01-fix-internet-b2b-payment.md): رفع خطای شیوه پرداخت «اعتبار سازمانی B2B» در تسویه اینترنت
2. [`02-add-partner-internet-purchase.md`](./02-add-partner-internet-purchase.md): افزودن بخش خرید اینترنت برای همکار سازمانی در `/internet`
3. [`03-add-receipt-upload-card-to-card.md`](./03-add-receipt-upload-card-to-card.md): ایجاد فیلد آپلود فیش در شیوه پرداخت «کارت به کارت» در تسویه‌حساب اینترنت
4. [`04-fix-checkout-intermittent-error.md`](./04-fix-checkout-intermittent-error.md): رفع خطای متناوب و ناپایدار مرحله نهایی خرید در `/checkout`

### بخش دوم: ماژول همکاران سازمانی (Partners & B2B)
5. [`05-fix-telegram-recruitment-button.md`](./05-fix-telegram-recruitment-button.md): اصلاح دکمه «ارتباط با واحد جذب تلگرام» در صفحه همکاری
6. [`06-fix-admin-partner-document-404.md`](./06-fix-admin-partner-document-404.md): رفع خطای 404 هنگام باز کردن تصاویر مدارک در پنل ادمین
7. [`07-fix-partner-orders-delivered-tab.md`](./07-fix-partner-orders-delivered-tab.md): اصلاح ظاهر تب «تحویل قطعی» در سفارشات همکار (`/partner/orders`)
8. [`08-add-partner-wallet-tab-counts.md`](./08-add-partner-wallet-tab-counts.md): افزودن شمارنده‌ها به تب‌های «پرداخت سفارشات» و «پاداش و کش‌بک» در `/partner/wallet`
9. [`09-remove-partner-credit-tier-section.md`](./09-remove-partner-credit-tier-section.md): حذف بخش «سقف اعتبار بازرگانی شما» در صفحه اعتبار همکار (`/partner/credit`)
10. [`10-fix-partner-project-site-edit.md`](./10-fix-partner-project-site-edit.md): رفع باگ ذخیره نشدن ویرایش سایت پروژه در `/partner/projects`
11. [`11-remove-partner-warranty-page.md`](./11-remove-partner-warranty-page.md): حذف کامل صفحه و دسترسی‌های گارانتی همکار (`/partner/warranty`)

### بخش سوم: پنل مدیریت و هدر سایت (Admin Dashboard & Header)
12. [`12-add-admin-wallet-settled-tab-count.md`](./12-add-admin-wallet-settled-tab-count.md): نمایش شمارنده در تب «تسویه شده» و سایر تب‌های درخواست‌های واریز در `/admin/wallet`
13. [`13-unify-admin-orders-rfq-card-list-view.md`](./13-unify-admin-orders-rfq-card-list-view.md): یکپارچه‌سازی و رفع باگ نمای کارتی/فهرستی در `/admin/orders` و `/admin/rfq`
14. [`14-remove-featured-products-homepage-sort.md`](./14-remove-featured-products-homepage-sort.md): حذف «منتخب صفحه اول» و مرتب‌سازی محصولات بر اساس جدیدترین کالا
15. [`15-add-admin-installation-assigned-count.md`](./15-add-admin-installation-assigned-count.md): افزودن شمارنده به تب «تخصیص کارشناس» در `/admin/installation`
16. [`16-fix-admin-portfolio-category-filter-crash.md`](./16-fix-admin-portfolio-category-filter-crash.md): اصلاح فیلتر دسته‌بندی و رفع خطای بارگذاری پروژه‌ها در `/admin/portfolio`
17. [`17-fix-header-profile-menu-display.md`](./17-fix-header-profile-menu-display.md): اصلاح نمایش و هماهنگ‌سازی منوی پروفایل در هدر (ادمین، همکار، کاربر)
