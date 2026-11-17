import * as React from "react";
import type { Metadata } from "next";
import { CareersPageClient } from "@/features/careers";
import { CAREERS_FAQS } from "@/features/careers/data/careers-faqs";
import {
  buildPublicMetadata,
  createBreadcrumbJsonLd,
  createFaqJsonLd,
  sanitizeJsonLd,
} from "@/shared/lib/seo";

export const metadata: Metadata = buildPublicMetadata({
  title: "همکاری با ما و ارسال رزومه کاری | ققنوس آکادمی",
  description:
    "موقعیت‌های شغلی فعال، مزایای سازمانی و فرم آنلاین ارسال رزومه کاری در فروشگاه تخصصی تجهیزات شبکه ققنوس آکادمی.",
  path: "/careers",
  keywords: [
    "استخدام مهندس شبکه",
    "فرصت شغلی ققنوس آکادمی",
    "ارسال رزومه",
    "تکنسین پسیو شبکه",
    "همکاری با ققنوس آکادمی",
  ],
});

export default function CareersPage() {
  const faqSchema = createFaqJsonLd(
    CAREERS_FAQS.map((item) => ({ question: item.q, answer: item.a }))
  );

  const jsonLd = sanitizeJsonLd({
    "@context": "https://schema.org",
    "@graph": [
      createBreadcrumbJsonLd([
        { name: "صفحه اصلی", path: "/" },
        { name: "همکاری با ما و استخدام", path: "/careers" },
      ]),
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
        <CareersPageClient />
      </React.Suspense>
    </>
  );
}
