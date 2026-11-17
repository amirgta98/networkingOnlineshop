# پرامپت ۱: رفع خطای شیوه پرداخت «اعتبار سازمانی B2B» در تسویه اینترنت

## مشخصات و مسیرهای مرتبط
- فرانت‌اند: `frontend/src/features/internet/components/internet-checkout-client.tsx`
- کامپوننت انتخاب پرداخت: `frontend/src/features/payment/components/unified-payment-selector.tsx`
- سرویس بک‌اند: `backend/src/application/services/unified-payment.service.ts`
- کنترلر پرداخت: `backend/src/presentation/controllers/payments.controller.ts`

---

## متن پرامپت جهت ارسال به توسعه‌دهنده یا AI

```markdown
در پروژه فروشگاه، در صفحه خرید و تسویه اینترنت هنگام انتخاب روش «اعتبار سازمانی B2B» خطای سرور دریافت می‌شود. پس از بررسی دقیق فایل‌های:
- `frontend/src/features/internet/components/internet-checkout-client.tsx`
- `frontend/src/features/payment/components/unified-payment-selector.tsx`
- `backend/src/application/services/unified-payment.service.ts`
- `backend/src/presentation/controllers/payments.controller.ts`

ریشه مشکل و اقدامات لازم به شرح زیر است:
۱. در `internet-checkout-client.tsx` (حدود خط ۷۲۰)، هنگام استفاده از `<UnifiedPaymentSelector />` پراپ `isPartner={isPartner}` پاس داده نشده است، در حالی که در `unified-payment-selector.tsx` شرط رندر شدن روش «اعتبار سازمانی B2B» نیازمند `isPartner` است.
۲. در بک‌اند در متد `initiatePayment` فایل `unified-payment.service.ts` (حدود خط ۶۱۳)، شرط `if (dto.paymentMethod === 'corporate_credit')` فقط نقش کاربر را از طریق `userMeta` موجود در JWT بررسی می‌کند. اگر سشن توکن شامل نقش همکار نباشد یا کاربر در دیتابیس همکار تایید شده باشد ولی توکن رفرش نشده باشد، `ForbiddenException` برمی‌گرداند. علاوه بر این، در این متد میزان سقف اعتبار یا مانده اعتبار بازرگانی کاربر از جدول `Organization` یا `AffiliatePartner` کسر/اعتبارسنجی نمی‌شود.
۳. در `payments.controller.ts` در اندپوینت `@Post('initiate')`، گارد به صورت `OptionalAuthGuard` است و `req.user` را به سرویس می‌فرستد. در صورتی که کاربر لاگین کرده باشد، وضعیت همکار بودن باید مستقیماً از روی جدول `User` / `AffiliatePartner` واکشی شود و فقط به داده‌های خام توکن اکتفا نگردد.

اقدام کن:
- پراپ `isPartner={isPartner}` را به `UnifiedPaymentSelector` در `internet-checkout-client.tsx` اضافه کن.
- در `unified-payment.service.ts` اعتبارسنجی همکار سازمانی را با دیتابیس تطبیق بده و در صورت مجاز بودن کاربر، سفارش اینترنت را روی حالت `ACTIVE` قرار داده و تراکنش آن را با وضعیت موفق ثبت کن.
- در فرانت‌اند اگر کاربری همکار نبود یا اعتبار ناکافی داشت، پیام Toast واضح نمایش داده شود و سیستم کرش نکند.
```
