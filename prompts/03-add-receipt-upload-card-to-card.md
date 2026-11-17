# پرامپت ۳: ایجاد فیلد آپلود فیش در شیوه پرداخت «کارت به کارت» در تسویه‌حساب اینترنت

## مشخصات و مسیرهای مرتبط
- تسویه اینترنت: `frontend/src/features/internet/components/internet-checkout-client.tsx`
- سلکتور پرداخت: `frontend/src/features/payment/components/unified-payment-selector.tsx`
- سرویس پرداخت بک‌اند: `backend/src/application/services/unified-payment.service.ts`
- جدول دیتابیس: `PaymentTransaction` در `backend/prisma/schema.prisma`

---

## متن پرامپت جهت ارسال به توسعه‌دهنده یا AI

```markdown
در تسویه‌حساب اینترنت واقع در `frontend/src/features/internet/components/internet-checkout-client.tsx` و کامپوننت `frontend/src/features/payment/components/unified-payment-selector.tsx`:

هنگام انتخاب روش پرداخت «کارت به کارت / حواله شبا»:
۱. ریشه مشکل: در حال حاضر در `internet-checkout-client.tsx` (حدود خط ۲۵۰) شرطی قرار داده شده که `if ((paymentMethod === "card_to_card" || paymentMethod === "bank_transfer") && !receiptUrl)` ارور می‌دهد، اما در رابط کاربری `UnifiedPaymentSelector` برای تارگت `INTERNET_ORDER` فیلد آپلود تصویر فیش رندر نمی‌شود یا در صورت رندر شدن، آدرس بازگشتی با استیت فرم همگام‌سازی نمی‌شود.
۲. اقدام در `unified-payment-selector.tsx`: در بخش مربوط به `selectedMethod === "card_to_card" || selectedMethod === "bank_transfer"`، اطمینان حاصل کن که کامپوننت آپلودر فایل تصویر فیش (با متد `paymentApi.uploadReceipt(file)`) همیشه فعال باشد، پیش‌نمایش تصویر را نشان دهد و آدرس بازگشتی `res.url` را از طریق کال‌بک `onReceiptUrlChange` به استیت `receiptUrl` در والد بفرستد.
۳. اقدام در بک‌اند `unified-payment.service.ts`: در بلاک `Handle Payment Method: BANK TRANSFER (Card-to-Card)`، مقدار `dto.receiptUrl` و `dto.receiptNumber` در فیلدهای `receiptUrl` و `receiptNumber` جدول `PaymentTransaction` ذخیره شود تا در پنل مدیریت ادمین در `/admin/payments` و `/admin/internet` عکس فیش قابل مشاهده و تایید باشد.
```
