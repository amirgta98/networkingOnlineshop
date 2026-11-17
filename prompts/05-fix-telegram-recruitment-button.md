# پرامپت ۵: اصلاح دکمه «ارتباط با واحد جذب تلگرام» در صفحه همکاری

## مشخصات و مسیرهای مرتبط
- بخش فرصت‌های شغلی: `frontend/src/features/careers/components/careers-section.tsx`
- مودال ارتباط تلگرام: `frontend/src/features/careers/components/recruitment-telegram-modal.tsx`
- مسیر پیج: `frontend/src/app/(shop)/careers/page.tsx`

---

## متن پرامپت جهت ارسال به توسعه‌دهنده یا AI

```markdown
در صفحه موقعیت‌های شغلی و همکاری آکادمی ققنوس:
فایل‌های `frontend/src/features/careers/components/careers-section.tsx` و `frontend/src/features/careers/components/recruitment-telegram-modal.tsx`:

مشکل: دکمه «ارتباط با واحد جذب در تلگرام» یا مودال `RecruitmentTelegramModal` لینک خروجی را باز نمی‌کند.
اقدامات مورد نیاز:
۱. در `careers-section.tsx` بررسی کن که استیت `isTelegramModalOpen` به درستی هنگام کلیک روی دکمه ست شود و ایونت دکمه با `e.stopPropagation()` یا `e.preventDefault()` دچار تداخل نشود.
۲. در `recruitment-telegram-modal.tsx` پراپ `telegramId` را بررسی کن؛ اگر به طور پیش‌فرض `@ghoghnoos_academy` است، اطمینان حاصل کن که لینک خروجی دکمه ارسال پیام در تلگرام مستقیماً به آدرس معتبر `https://t.me/ghoghnoos_academy` (بدون کاراکتر @ اضافه در URL) لینک شده و صفت‌های `target="_blank"` و `rel="noopener noreferrer"` روی آن ست باشد.
```
