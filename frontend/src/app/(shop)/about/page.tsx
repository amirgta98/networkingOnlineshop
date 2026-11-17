import * as React from "react";
import type { Metadata } from "next";
import { AboutPageClient } from "@/features/about";
import { ABOUT_FAQS } from "@/features/about/mock-data/about-data";
import {
  buildCanonicalUrl,
  buildPublicMetadata,
  createBreadcrumbJsonLd,
  createFaqJsonLd,
  createOrganizationJsonLd,
  sanitizeJsonLd,
} from "@/shared/lib/seo";
import { getCachedContactSettings } from "@/shared/lib/server-seo-data";

export const metadata: Metadata = buildPublicMetadata({
  title: "درباره ما و اطلاعات تماس | فروشگاه تخصصی تجهیزات شبکه ققنوس آکادمی",
  description:
    "آشنایی با تاریخچه، ماموریت، تیم مهندسی CCIE، انبار مکانیزه، تست فلوک DSX-8000، گارانتی تعویض ۱۸ ماهه و اطلاعات تماس و آدرس دفتر مرکزی ققنوس آکادمی.",
  path: "/about",
  keywords: [
    "درباره ققنوس آکادمی",
    "تماس با ققنوس آکادمی",
    "تجهیزات شبکه تهران",
    "سوئیچ سیسکو اصل",
    "نمایندگی میکروتیک",
    "کابل شبکه لگراند اورجینال",
    "تست فلوک شبکه",
    "پشتیبانی فنی دیتاسنتر",
    "دفتر فروش ققنوس آکادمی",
  ],
});

export default async function AboutPage() {
  const contactSettings = await getCachedContactSettings();
  const faqSchema = createFaqJsonLd(
    ABOUT_FAQS.map((item) => ({ question: item.question, answer: item.answer }))
  );

  const jsonLd = sanitizeJsonLd({
    "@context": "https://schema.org",
    "@graph": [
      createBreadcrumbJsonLd([
        { name: "صفحه اصلی", path: "/" },
        { name: "درباره ما و اطلاعات تماس", path: "/about" },
      ]),
      {
        "@type": "AboutPage",
        "@id": `${buildCanonicalUrl("/about")}#webpage`,
        url: buildCanonicalUrl("/about"),
        name: "درباره ققنوس آکادمی و اطلاعات تماس",
        inLanguage: "fa-IR",
        mainEntity: createOrganizationJsonLd(contactSettings),
      },
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
        <AboutPageClient />
      </React.Suspense>
    </>
  );
}
