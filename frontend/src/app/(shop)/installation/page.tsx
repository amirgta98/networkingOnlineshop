import * as React from "react";
import type { Metadata } from "next";
import { InstallationPageClient } from "@/features/installation";
import { INSTALLATION_FAQS } from "@/features/installation/mock-data/installation-data";
import {
  buildPublicMetadata,
  createBreadcrumbJsonLd,
  createFaqJsonLd,
  createServiceJsonLd,
  sanitizeJsonLd,
} from "@/shared/lib/seo";

export const metadata: Metadata = buildPublicMetadata({
  title: "درخواست نصب، کابل‌کشی و راه‌اندازی شبکه سازمانی | ققنوس آکادمی",
  description:
    "ثبت آنلاین درخواست نصب شبکه، کابل‌کشی ساختاریافته Cat6A، آرایش رک و دیتاسنتر، فیبر نوری، دوربین مداربسته و امنیت شبکه با تضمین تست فلوک و ۱۸ ماه گارانتی مکتوب.",
  path: "/installation",
  keywords: [
    "درخواست نصب شبکه",
    "کابل کشی شبکه",
    "تست فلوک",
    "آرایش رک",
    "نصب دوربین مداربسته",
    "فیوژن فیبر نوری",
    "خدمات پسیو شبکه",
    "راه‌اندازی اتاق سرور",
  ],
});

export default function InstallationPage() {
  const faqSchema = createFaqJsonLd(
    INSTALLATION_FAQS.map((item) => ({ question: item.q, answer: item.a }))
  );

  const jsonLd = sanitizeJsonLd({
    "@context": "https://schema.org",
    "@graph": [
      createBreadcrumbJsonLd([
        { name: "صفحه اصلی", path: "/" },
        { name: "نصب و اجرای زیرساخت شبکه", path: "/installation" },
      ]),
      createServiceJsonLd({
        name: "نصب، کابل‌کشی ساختاریافته و راه‌اندازی شبکه سازمانی",
        description:
          "اجرای صفر تا صد شبکه پسیو و اکتیو، آرایش رک، فیوژن فیبر نوری، نصب دوربین تحت شبکه و تست صددرصدی فلوک DSX-8000 با ۱۸ ماه گارانتی.",
        path: "/installation",
        serviceType: "Network Installation & Structured Cabling",
      }),
      ...(faqSchema ? [faqSchema] : []),
    ],
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <React.Suspense fallback={null}>
        <InstallationPageClient />
      </React.Suspense>
    </>
  );
}
