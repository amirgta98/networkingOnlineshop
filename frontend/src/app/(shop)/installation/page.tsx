import * as React from "react";
import type { Metadata } from "next";
import { InstallationPageClient } from "@/features/installation";

export const metadata: Metadata = {
  title: "درخواست نصب، کابل‌کشی و راه‌اندازی شبکه سازمانی | ققنوس آکادمی",
  description:
    "ثبت آنلاین درخواست نصب شبکه، کابل‌کشی ساختاریافته Cat6A، آرایش رک و دیتاسنتر، فیبر نوری، دوربین مداربسته و امنیت شبکه با تضمین تست فلوک و ۱۸ ماه گارانتی مکتوب.",
  keywords: [
    "درخواست نصب شبکه",
    "کابل کشی شبکه",
    "تست فلوک",
    "آرایش رک",
    "نصب دوربین مداربسته",
    "فیوژن فیبر نوری",
    "خدمات پسیو شبکه",
    "راه‌اندازی اتاق سرور",
    "تجهیزات شبکه ققنوس آکادمی",
  ],
  openGraph: {
    title: "درخواست نصب، کابل‌کشی و راه‌اندازی شبکه سازمانی | ققنوس آکادمی",
    description:
      "پیاده‌سازی صفر تا صد زیرساخت شبکه با مهندسان دارای مدارک بین‌المللی و تست صددرصدی فلوک.",
    locale: "fa_IR",
    type: "website",
  },
};

export default function InstallationPage() {
  return (
    <React.Suspense fallback={null}>
      <InstallationPageClient />
    </React.Suspense>
  );
}
