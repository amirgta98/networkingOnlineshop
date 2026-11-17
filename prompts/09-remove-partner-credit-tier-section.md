# پرامپت ۹: حذف بخش «سقف اعتبار بازرگانی شما» در صفحه اعتبار همکار (`/partner/credit`)

## مشخصات و مسیرهای مرتبط
- ویو اعتبار همکار: `frontend/src/features/partner/components/partner-credit-view.tsx`
- پیج روت: `frontend/src/app/(partner)/partner/credit/page.tsx`
- خطوط مورد ویرایش: خط ۱۵۹ تا ۱۷۰ در `partner-credit-view.tsx`

---

## متن پرامپت جهت ارسال به توسعه‌دهنده یا AI

```markdown
در صفحه اعتبار همکار به آدرس `frontend/src/features/partner/components/partner-credit-view.tsx`:

مشکل: طبق نیاز، بخش نمایش سقف اعتبار Tier A مازاد است و باید حذف شود.
اقدام اصلاحی:
در `partner-credit-view.tsx` خطوط ۱۵۹ تا ۱۷۰، کارت مربوط به:
`<span className="text-xs text-sky-400 font-semibold block mb-1">سقف اعتبار بازرگانی شما (Tier A):</span>`
و مبلغ متصل به آن `{formatPrice(creditInfo.creditLimit)}` را به طور کامل از ساختار JSX حذف کن.
چیدمان کارت‌های باقیمانده (شامل «مانده اعتبار در دسترس خرید» و «اعتبار مصرف‌شده جاری» و پراگرس‌بار مصرف اعتبار) را با کلاس‌های Grid تنظیم کن تا ظاهر صفحه منظم و متقارن بماند.
```
