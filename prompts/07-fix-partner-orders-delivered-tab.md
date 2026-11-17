# پرامپت ۷: اصلاح ظاهر تب «تحویل قطعی» در سفارشات همکار (`/partner/orders`)

## مشخصات و مسیرهای مرتبط
- ویو سفارشات همکار: `frontend/src/features/partner/components/partner-orders-view.tsx`
- پیج روت: `frontend/src/app/(partner)/partner/orders/page.tsx`
- ثابت وضعیت‌ها: آرایه `ORDER_STATUS_TABS` در `partner-orders-view.tsx`

---

## متن پرامپت جهت ارسال به توسعه‌دهنده یا AI

```markdown
در صفحه سفارشات همکار در مسیر `frontend/src/features/partner/components/partner-orders-view.tsx`:

مشکل: همان‌طور که در تصویر مشخص است، تب «تحویل قطعی» به علت کمبود عرض ظرف والد و فشرده شدن در کنار فیلد جستجو به درستی رندر نمی‌شود و بج یا استایل آن ناقص است.
اقدامات اصلاحی:
۱. در خط ۲۴۰ به بعد `partner-orders-view.tsx`، کانتینر تب‌ها دارای کلاس‌های:
`<div className="flex flex-col md:flex-row items-center justify-between gap-4 ...">`
است. در تبلت و لپ‌تاپ‌های با عرض متوسط، تب‌ها روی یک خط جا نمی‌شوند و سرریز افقی (Overflow) سرچ‌باکس با تب‌ها تداخل ایجاد می‌کند.
۲. نوار تب‌ها را به یک کانتینر با کلاس‌های `flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin w-full lg:w-auto shrink-0` تبدیل کن.
۳. به دکمه تب «تحویل قطعی» (`ORDER_STATUS_TABS` با آیدی `delivered`) کلاس‌های `shrink-0 whitespace-nowrap` بده و اطمینان حاصل کن که عدد شمارنده آن (`tabCounts['delivered']`) در بج کناری همواره با پدینگ و فاصله استاندارد نمایش داده شود.
```
