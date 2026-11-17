import * as React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import {
  FileCheck2,
  ShieldCheck,
  ReceiptText,
  Wrench,
  KeyRound,
  RotateCcw,
  ChevronLeft,
  Home,
} from "lucide-react";
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
  title: "شرایط و قوانین استفاده از خدمات | ققنوس آکادمی",
  description:
    "قوانین خرید تجهیزات شبکه، صدور فاکتور رسمی، گارانتی تعویض، شرایط بازگشت کالا و ضوابط ارائه خدمات نصب و اینترنت سازمانی در ققنوس آکادمی.",
  path: "/terms",
});

export default async function TermsPage() {
  const contact = await getCachedContactSettings();
  const mainPhone = contact?.mainPhone || contact?.supportPhone1 || "09134761097";
  const generalEmail = contact?.generalEmail || "info@ghoghnoos.academy";

  const jsonLd = sanitizeJsonLd({
    "@context": "https://schema.org",
    "@graph": [
      createBreadcrumbJsonLd([
        { name: "صفحه اصلی", path: "/" },
        { name: "شرایط و قوانین استفاده", path: "/terms" },
      ]),
      {
        "@type": "WebPage",
        "@id": `${buildCanonicalUrl("/terms")}#webpage`,
        url: buildCanonicalUrl("/terms"),
        name: "شرایط و قوانین استفاده از خدمات ققنوس آکادمی",
        inLanguage: "fa-IR",
      },
    ],
  });

  const sections = [
    {
      icon: KeyRound,
      title: "۱. عضویت، احراز هویت و مسئولیت حساب کاربری",
      items: [
        "ثبت سفارش و استفاده از بخش‌های کاربری سایت از طریق ورود با شماره موبایل و کد یک‌بارمصرف (OTP) و در صورت فعال‌سازی کاربر با تایید دو مرحله‌ای انجام می‌شود.",
        "کاربر متعهد است اطلاعات هویتی، شماره تماس و نشانی تحویل را به‌صورت صحیح و دقیق ثبت نماید و از در اختیار گذاشتن کد تایید ورود به افراد غیرمجاز خودداری کند.",
      ],
    },
    {
      icon: ReceiptText,
      title: "۲. ثبت سفارش، قیمت‌گذاری و فاکتور رسمی",
      items: [
        "قیمت تجهیزات شبکه و بسته‌های اینترنت بر اساس نرخ‌های نمایش‌داده‌شده در لحظه نهایی‌سازی سفارش محاسبه می‌شود. در صورت بروز نوسان یا اتمام موجودی پیش از تایید نهایی، مراتب پیش از پردازش به خریدار اطلاع داده خواهد شد.",
        "امکان صدور پیش‌فاکتور و فاکتور رسمی برای سفارش‌های شرکتی و همکاران تجاری (B2B) پس از ثبت اطلاعات حقوقی معتبر توسط خریدار فراهم است.",
      ],
    },
    {
      icon: ShieldCheck,
      title: "۳. اصالت کالا و گارانتی",
      items: [
        "کلیه تجهیزات ارائه‌شده در ققنوس آکادمی با تضمین اصالت عرضه می‌شوند و جزئیات پوشش گارانتی (تا ۱۸ ماه گارانتی تعویض مطابق شرایط درج‌شده در مشخصات کالا) در فاکتور یا صفحه محصول ثبت می‌گردد.",
        "آسیب‌های ناشی از نوسان برق غیراستاندارد، ضربه فیزیکی، نفوذ رطوبت یا دستکاری سخت‌افزاری خارج از ضوابط فنی شامل پوشش گارانتی نخواهند بود.",
      ],
    },
    {
      icon: RotateCcw,
      title: "۴. شرایط بازگشت کالا (تا ۳۰ روز مطابق ضوابط)",
      items: [
        "امکان درخواست مرجوعی تا ۳۰ روز برای کالاهایی که از نظر فنی دچار ایراد اولیه باشند یا مغایر با مشخصات سفارش ارسال شده باشند وجود دارد.",
        "برای بررسی مرجوعی کالاهای غیرمعیوب یا تعویض، سلامت کامل فیزیکی محصول، حفظ بسته‌بندی اصلی، متعلقات، هولوگرام و تطابق شماره سریال با فاکتور فروش الزامی است.",
      ],
    },
    {
      icon: Wrench,
      title: "۵. خدمات نصب، کابل‌کشی و اینترنت سازمانی",
      items: [
        "درخواست‌های ثبت‌شده در بخش نصب، کابل‌کشی ساخت‌یافته، تجهیز دیتاسنتر و اینترنت سازمانی پس از امکان‌سنجی و کارشناسی فنی توسط تیم مهندسی ققنوس آکادمی زمان‌بندی و قیمت‌گذاری نهایی می‌شوند.",
        "موارد حقوقی و ضمانت نگهداری (SLA) در قراردادهای سازمانی به‌صورت اختصاصی و مکتوب میان کارفرما و ققنوس آکادمی توافق می‌گردد.",
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
          <span className="text-neutral-200 font-medium">شرایط و قوانین استفاده</span>
        </nav>

        {/* Header */}
        <header className="rounded-3xl border border-neutral-800 bg-[#111114]/90 p-6 sm:p-8 space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-3.5 py-1 text-xs font-semibold text-orange-400">
            <FileCheck2 className="h-3.5 w-3.5" />
            <span>ضوابط خرید، خدمات فنی و استفاده از پلتفرم</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            شرایط و قوانین استفاده از خدمات ققنوس آکادمی
          </h1>
          <p className="text-sm text-neutral-300 leading-relaxed">
            استفاده از وب‌سایت، ثبت سفارش تجهیزات شبکه، خرید سرویس اینترنت و ثبت درخواست پروژه‌های اجرایی در ققنوس آکادمی به منزله مطالعه و پذیرش ضوابط زیر است. قوانین جاری تجارت الکترونیک و مقررات جمهوری اسلامی ایران در تمامی مراحل حاکم خواهد بود.
          </p>
        </header>

        {/* Terms Sections */}
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

        {/* Support Footer Box */}
        <section className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-5 sm:p-6 space-y-3">
          <h2 className="text-base font-bold text-white">پاسخگویی و پیگیری مغایرت‌ها</h2>
          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
            در صورت وجود هرگونه سوال درباره مفاد این صفحه، وضعیت سفارش، گارانتی یا فاکتور، از طریق شماره{" "}
            <span className="font-mono text-white" dir="ltr">{toPersianDigits(mainPhone)}</span>{" "}
            یا نشانی ایمیل{" "}
            <span className="font-mono text-white" dir="ltr">{generalEmail}</span>{" "}
            با واحد پشتیبانی تماس بگیرید.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-neutral-800/80 text-xs">
            <Link href="/privacy" className="text-orange-400 hover:text-orange-300 transition-colors">
              مطالعه سیاست حفظ حریم خصوصی ←
            </Link>
            <Link href="/products" className="text-neutral-400 hover:text-white transition-colors">
              مشاهده کاتالوگ محصولات
            </Link>
          </div>
        </section>
      </Container>
    </div>
  );
}
