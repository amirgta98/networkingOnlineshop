import * as React from "react";
import type { Metadata } from "next";
import { InternetPageClient } from "@/features/internet";

export const metadata: Metadata = {
  title: "خرید اینترنت پرسرعت سازمانی و IP استاتیک اختصاصی | ققنوس آکادمی",
  description:
    "خرید آنلاین انواع پلن‌های اینترنت فیبر نوری (FTTH)، پهنای باند اختصاصی متقارن، اینترنت اداری VDSL و TD-LTE به همراه تخصیص رسمی IP استاتیک برای دوربین‌های مداربسته، فایروال و اتصال شعب با تضمین پایداری ۹۹.۹٪.",
  keywords: [
    "خرید اینترنت",
    "اینترنت سازمانی",
    "خرید ای پی استاتیک",
    "آی پی استاتیک",
    "اینترنت فیبر نوری",
    "پهنای باند اختصاصی",
    "Static IP",
    "انتقال تصویر دوربین",
    "VDSL اداری",
    "اینترنت شرکت ها",
  ],
  openGraph: {
    title: "خرید اینترنت پرسرعت سازمانی و IP استاتیک اختصاصی | ققنوس آکادمی",
    description:
      "تخصیص آنلاین اینترنت فیبر نوری و بسته‌های IP استاتیک سازمانی با پشتیبانی ۲۴ ساعته NOC.",
    locale: "fa_IR",
    type: "website",
  },
};

export default function InternetPage() {
  return (
    <React.Suspense fallback={null}>
      <InternetPageClient />
    </React.Suspense>
  );
}
