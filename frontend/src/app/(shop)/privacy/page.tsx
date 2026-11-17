import * as React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { Shield, Lock, Database, UserCheck, Cookie, PhoneCall, ChevronLeft, Home } from "lucide-react";
import { Container } from "@/shared/components/ui/container";
import {
  buildCanonicalUrl,
  buildPublicMetadata,
  createBreadcrumbJsonLd,
  sanitizeJsonLd,
} from "@/shared/lib/seo";
import { getCachedContactSettings } from "@/shared/lib/server-seo-data";
import { toPersianDigits } from "@/shared/lib/utils";

export const metadata: Metadata = buildPublicMetadata({
  title: "سیاست حفظ حریم خصوصی | ققنوس آکادمی",
  description:
    "نحوه جمع‌آوری، نگهداری، استفاده و حفاظت از اطلاعات کاربران، نشست‌های ورود و سفارش‌ها در فروشگاه و آکادمی ققنوس آکادمی.",
  path: "/privacy",
});

export default async function PrivacyPage() {
  const contact = await getCachedContactSettings();
  const supportPhone = contact?.supportPhone1 || contact?.mainPhone || "09134761097";
  const supportEmail = contact?.generalEmail || "info@ghoghnoos.academy";
  const officeAddress =
    contact?.address ||
    "تهران، خیابان سهروردی شمالی، نبش کوچه ققنوس، پلاک ۴۲، طبقه سوم";

  const jsonLd = sanitizeJsonLd({
    "@context": "https://schema.org",
    "@graph": [
      createBreadcrumbJsonLd([
        { name: "صفحه اصلی", path: "/" },
        { name: "سیاست حفظ حریم خصوصی", path: "/privacy" },
      ]),
      {
        "@type": "WebPage",
        "@id": `${buildCanonicalUrl("/privacy")}#webpage`,
        url: buildCanonicalUrl("/privacy"),
        name: "سیاست حفظ حریم خصوصی ققنوس آکادمی",
        inLanguage: "fa-IR",
      },
    ],
  });

  const sections = [
    {
      icon: Database,
      title: "۱. اطلاعاتی که هنگام استفاده از سایت ثبت می‌شوند",
      items: [
        "اطلاعات هویتی و تماس: شماره موبایل جهت ورود با کد یک‌بارمصرف (OTP)، نام و نام خانوادگی، و در سفارش‌های حقوقی/عمده اطلاعات شرکت یا کد اقتصادی که توسط خود کاربر وارد می‌شود.",
        "اطلاعات سفارش و ارسال: نشانی تحویل، کد پستی، شماره تماس گیرنده، اقلام سفارش و سابقه پرداخت برای پردازش و ارسال مرسولات.",
        "اطلاعات فرم‌های تخصصی: جزئیات فنی ثبت‌شده در درخواست‌های نصب و کابل‌کشی، خرید اینترنت سازمانی، استعلام قیمت B2B و فایل رزومه در صفحه استخدام.",
      ],
    },
    {
      icon: Cookie,
      title: "۲. کوکی‌ها و حافظه محلی مرورگر (Session Storage)",
      items: [
        "پلتفرم ققنوس آکادمی از کوکی نشست (velox_session_token) و حافظه محلی مرورگر (localStorage) صرفاً برای حفظ وضعیت ورود کاربر، سبد خرید، تنظیمات نمایشی و کنترل دسترسی بخش‌های کاربری/همکاران استفاده می‌کند.",
        "این داده‌ها برای ردیابی تبلیغاتی شخص ثالث به فروش نمی‌رسند و هنگام خروج از حساب کاربری پاک‌سازی می‌شوند.",
      ],
    },
    {
      icon: UserCheck,
      title: "۳. هدف از استفاده و پردازش داده‌ها",
      items: [
        "احراز هویت امن، مدیریت حساب کاربری، پیگیری سفارش‌ها، ارسال پیامک وضعیت مرسوله و ارائه پشتیبانی فنی.",
        "صدور پیش‌فاکتور، فاکتور رسمی، هماهنگی بازدید کارشناسی برای پروژه‌های شبکه و بررسی درخواست‌های همکاری.",
        "حفظ امنیت سرویس‌ها و جلوگیری از دسترسی غیرمجاز یا ثبت درخواست‌های جعلی.",
      ],
    },
    {
      icon: Lock,
      title: "۴. محرمانگی، حفاظت و اشتراک‌گذاری محدود",
      items: [
        "تبادل اطلاعات میان مرورگر کاربر و سرویس‌های سایت در بستر رمزنگاری‌شده انجام می‌شود و دسترسی به اطلاعات کاربری در پنل‌های مدیریتی محدود به نقش‌های مجاز است.",
        "اطلاعات مشتریان به هیچ فرد یا سازمان خارج از مجموعه واگذار نمی‌شود؛ مگر در مواردی که برای تحویل کالا/اجرای پروژه با پیمانکاران ارسال و نصب هماهنگی شود یا مرجع قضایی/قانونی ذی‌صلاح درخواست رسمی ارائه دهد.",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-neutral-100 py-10 sm:py-14" dir="rtl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Container className="max-w-4xl space-y-8">
        {/* Breadcrumb */}
        <nav className="flex flex-wrap items-center gap-2 text-xs text-neutral-400" aria-label="مسیر صفحه">
          <Link href="/" className="inline-flex items-center gap-1 hover:text-orange-400 transition-colors">
            <Home className="h-3.5 w-3.5" />
            <span>صفحه اصلی</span>
          </Link>
          <ChevronLeft className="h-3.5 w-3.5 text-neutral-600" />
          <span className="text-neutral-200 font-medium">سیاست حفظ حریم خصوصی</span>
        </nav>

        {/* Header */}
        <header className="rounded-3xl border border-neutral-800 bg-[#111114]/90 p-6 sm:p-8 space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-3.5 py-1 text-xs font-semibold text-orange-400">
            <Shield className="h-3.5 w-3.5" />
            <span>حریم خصوصی و امنیت داده‌های کاربران</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            سیاست حفظ حریم خصوصی ققنوس آکادمی
          </h1>
          <p className="text-sm text-neutral-300 leading-relaxed">
            ققنوس آکادمی متعهد به حفاظت از اطلاعات هویتی، تماس و سوابق سفارش کاربران خود است. در این صفحه چارچوب شفاف نحوه دریافت، نگهداری و بهره‌برداری از داده‌ها هنگام استفاده از خدمات فروشگاه و پرتال ققنوس آکادمی توضیح داده شده است.
          </p>
        </header>

        {/* Policy Sections */}
        <div className="space-y-5">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <section
                key={section.title}
                className="rounded-2xl border border-neutral-800/90 bg-[#111114]/80 p-5 sm:p-6 space-y-3"
              >
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400">
                    <Icon className="h-4 w-4" />
                  </span>
                  <h2 className="text-base sm:text-lg font-bold text-white">{section.title}</h2>
                </div>
                <ul className="space-y-2.5 pr-1 text-xs sm:text-sm text-neutral-300 leading-relaxed list-disc list-inside">
                  {section.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>

        {/* Contact & Legal Notice */}
        <section className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-5 sm:p-6 space-y-3">
          <div className="flex items-center gap-2 text-white font-bold text-base">
            <PhoneCall className="h-4 w-4 text-orange-400" />
            <h2>۵. حقوق کاربران و راه‌های ارتباطی</h2>
          </div>
          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
            شما می‌توانید در هر زمان از طریق پیشخوان کاربری اطلاعات حساب و نشانی‌های خود را ویرایش کنید یا برای طرح پرسش، درخواست اصلاح یا بررسی موارد مربوط به حریم خصوصی از راه‌های زیر با پشتیبانی ققنوس آکادمی تماس بگیرید:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-neutral-300 pt-1">
            <div className="rounded-xl border border-neutral-800 bg-[#0d0d10] p-3">
              <span className="text-neutral-500 block mb-1">تلفن پشتیبانی:</span>
              <span className="font-mono text-white" dir="ltr">{toPersianDigits(supportPhone)}</span>
            </div>
            <div className="rounded-xl border border-neutral-800 bg-[#0d0d10] p-3">
              <span className="text-neutral-500 block mb-1">پست الکترونیک:</span>
              <span className="font-mono text-white" dir="ltr">{supportEmail}</span>
            </div>
            <div className="sm:col-span-2 rounded-xl border border-neutral-800 bg-[#0d0d10] p-3">
              <span className="text-neutral-500 block mb-1">نشانی دفتر مرکزی:</span>
              <span className="text-neutral-200">{officeAddress}</span>
            </div>
          </div>
          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-neutral-800/80 text-xs">
            <Link href="/terms" className="text-orange-400 hover:text-orange-300 transition-colors">
              مشاهده شرایط و قوانین استفاده از خدمات ←
            </Link>
            <Link href="/about#contact-section" className="text-neutral-400 hover:text-white transition-colors">
              صفحه اطلاعات تماس و درباره ما
            </Link>
          </div>
        </section>
      </Container>
    </div>
  );
}
