# پرامپت ۴: رفع خطای متناوب و ناپایدار مرحله نهایی خرید در `/checkout`

## مشخصات و مسیرهای مرتبط
- صفحه چک‌اوت: `frontend/src/features/checkout/components/checkout-client.tsx`
- هوک چک‌اوت: `frontend/src/features/checkout/hooks/use-checkout.tsx`
- متد ثبت سفارش: `frontend/src/features/checkout/api/checkout-api.ts`
- باکس خلاصه سفارش: `frontend/src/features/checkout/components/checkout-order-summary.tsx`
- بک‌اند: `backend/src/application/services/unified-payment.service.ts`

---

## متن پرامپت جهت ارسال به توسعه‌دهنده یا AI

```markdown
در صفحه چک‌اوت فروشگاه کالا (`frontend/src/features/checkout`)، هنگام کلیک روی «پرداخت و ثبت نهایی سفارش» در فایل `checkout-order-summary.tsx` و هوک `use-checkout.tsx` خطاهای متناوب و متفاوتی (گاهی «سفارش با شناسه ... یافت نشد»، گاهی خطای درگاه و گاهی بدون ارور) رخ می‌دهد.

ریشه مشکل و راه‌حل بر اساس کد پروژه:
۱. در `frontend/src/features/checkout/api/checkout-api.ts` متد `placeOrder` (حدود خط ۳۶۲):
وقتی درخواست `apiClient.post("/orders", payload)` به هر دلیلی (مثل اعتبارسنجی فیلدهای آدرس، عدم تطابق استان یا دیسکانکت مقطعی توکن) در بک‌اند رد می‌شود، بلاک `catch` خطا را سایلنت کرده و یک آبجکت سفارش ماک با `orderNumber` رندوم در حافظه فرانت می‌سازد!
۲. سپس در `use-checkout.tsx` (خط ۶۱۶)، متد `paymentApi.initiatePayment` بلافاصله با `targetId: result.orderId || result.orderNumber` صدا زده می‌شود. بک‌اند با فراخوانی `findOrder(targetId)` در `unified-payment.service.ts` چون سفارشی با این شماره در دیتابیس ثبت نشده، خطای `NotFoundException` پرتاب می‌کند!
۳. اگر هم درخواست ثبت سفارش موفق بوده باشد، تماس دوباره برای پرداخت در کسری از ثانیه ارسال شده و با Race Condition مواجه می‌شود.

اقدامات اصلاحی:
- در `checkout-api.ts` مکانیزم Fail-Silent و Mock سازی سفارش را کاملاً حذف کن تا در صورت شکست درخواست ثبت سفارش، خطای واقعی به هوک برسد و `initiatePayment` با آیدی نامعتبر اجرا نشود.
- در `use-checkout.tsx` وضعیت `isSubmitting` را سخت‌گیرانه مدیریت کن و در صورتی که شیوه پرداخت آنلاین انتخاب شده، خطاها را با Toast دقیق از پیام پاسخ سرور (`err.response?.data?.message`) به کاربر نمایش بده.
```
