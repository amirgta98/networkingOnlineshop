import * as React from "react";
import type { Metadata } from "next";
import { InternetPageClient } from "@/features/internet";
import { internetApi } from "@/features/internet/api/internet-api";
import { INTERNET_FAQS } from "@/features/internet/mock-data/internet-data";
import type { InternetPlan, InternetSettings } from "@/features/internet/types";
import {
  buildPublicMetadata,
  createBreadcrumbJsonLd,
  createFaqJsonLd,
  createServiceJsonLd,
  sanitizeJsonLd,
} from "@/shared/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildPublicMetadata({
  title: "خرید اینترنت پرسرعت سازمانی و IP استاتیک اختصاصی | ققنوس آکادمی",
  description:
    "خرید آنلاین انواع پلن‌های اینترنت فیبر نوری (FTTH)، پهنای باند اختصاصی متقارن، اینترنت اداری VDSL و TD-LTE به همراه تخصیص رسمی IP استاتیک برای دوربین‌های مداربسته، فایروال و اتصال شعب.",
  path: "/internet",
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
  ],
});

export default async function InternetPage() {
  let initialPlans: InternetPlan[] = [];
  let initialSettings: InternetSettings | undefined = undefined;

  try {
    const [plans, settings] = await Promise.all([
      internetApi.getPlans(),
      internetApi.getSettings(),
    ]);
    initialPlans = plans || [];
    initialSettings = settings || undefined;
  } catch (err) {
    console.warn("SSR: Failed to pre-fetch internet plans from backend API:", err);
  }

  const faqSchema = createFaqJsonLd(
    INTERNET_FAQS.map((item) => ({ question: item.q, answer: item.a }))
  );

  const jsonLd = sanitizeJsonLd({
    "@context": "https://schema.org",
    "@graph": [
      createBreadcrumbJsonLd([
        { name: "صفحه اصلی", path: "/" },
        { name: "اینترنت سازمانی و IP استاتیک", path: "/internet" },
      ]),
      createServiceJsonLd({
        name: "سرویس اینترنت پرسرعت سازمانی و تخصیص IP استاتیک",
        description:
          "ارائه سرویس‌های اینترنت فیبر نوری FTTH، پهنای باند اختصاصی پوینت تو پوینت و بسته‌های آی‌پی استاتیک رسمی با پشتیبانی فنی NOC.",
        path: "/internet",
        serviceType: "Enterprise Internet & Static IP Service",
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
        <InternetPageClient initialPlans={initialPlans} initialSettings={initialSettings} />
      </React.Suspense>
    </>
  );
}
