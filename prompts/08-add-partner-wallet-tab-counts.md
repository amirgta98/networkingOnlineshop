# پرامپت ۸: افزودن شمارنده‌ها به تب‌های «پرداخت سفارشات» و «پاداش و کش‌بک» در `/partner/wallet`

## مشخصات و مسیرهای مرتبط
- ویو کیف پول مشترک: `frontend/src/features/dashboard/components/wallet-view.tsx`
- صفحه همکار: `frontend/src/app/(partner)/partner/wallet/page.tsx`
- کامپوننت پوششی: `frontend/src/features/partner/components/partner-wallet-view.tsx`

---

## متن پرامپت جهت ارسال به توسعه‌دهنده یا AI

```markdown
در کیف پول همکار (`/partner/wallet`) که از کامپوننت `frontend/src/features/dashboard/components/wallet-view.tsx` استفاده می‌کند:

ریشه مشکل در کد:
در فایل `wallet-view.tsx` (حدود خطوط ۵۶۵ تا ۵۸۰) در آرایه تب‌ها:
```tsx
{ key: "all", label: "همه تراکنش‌ها", count: ... },
{ key: "withdrawal", label: "برداشت‌ها و تسویه وجه", count: ... },
{ key: "payment", label: "پرداخت سفارشات" }, // هیچ count پاس داده نشده!
{ key: "cashback", label: "پاداش و کش‌بک" }, // هیچ count پاس داده نشده!
```
اقدام اصلاحی:
۱. شمارنده تب «پرداخت سفارشات» را با استفاده از فیلتر زیر اضافه کن:
`count: combinedFeed.filter((i) => i.kind === "transaction" && (i.data.type === "order_payment" || i.data.type === "purchase")).length`
۲. شمارنده تب «پاداش و کش‌بک» را با فیلتر زیر اضافه کن:
`count: combinedFeed.filter((i) => i.kind === "transaction" && (i.data.type === "cashback" || i.data.type === "reward" || i.data.type === "commission")).length`
```
