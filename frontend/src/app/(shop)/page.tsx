import * as React from "react";
import type { Metadata } from "next";
import { HeroSection } from "@/features/catalog/components/hero-section";
import { SpecialOfferSection } from "@/features/special-offers";
import {
  CatalogSection,
  InfrastructureCategoriesSection,
  BrandsCarouselSection,
} from "@/features/catalog";
import { CareersSection } from "@/features/careers";
import { PortfolioSection } from "@/features/portfolio";
import { ArticlesSection } from "@/features/articles";
import { InstallationBannerSection } from "@/features/installation";
import {
  buildPublicMetadata,
  createOrganizationJsonLd,
  createWebSiteJsonLd,
  sanitizeJsonLd,
} from "@/shared/lib/seo";
import {
  getCachedCatalogProducts,
  getCachedContactSettings,
  getCachedPublishedArticlesPage,
  getCachedPublishedProjectsPage,
} from "@/shared/lib/server-seo-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildPublicMetadata({
  title: "ققنوس آکادمی | تجهیزات شبکه، سوئیچ، روتر، فیبر نوری و زیرساخت",
  description:
    "فروشگاه تخصصی تجهیزات شبکه سازمانی — سوئیچ‌های مدیریت‌پذیر، روتر، فایروال، اکسس پوینت، کابل‌کشی و ابزار تست با برندهای سیسکو، میکروتیک، لگراند و نگزانس.",
  path: "/",
  keywords: [
    "ققنوس آکادمی",
    "تجهیزات شبکه",
    "سوئیچ سیسکو",
    "روتر میکروتیک",
    "فروشگاه تجهیزات دیتاسنتر",
    "زیرساخت اکتیو",
    "زیرساخت پسیو",
    "کابل Cat6",
    "فیبر نوری",
  ],
});

export default async function ShopPage() {
  const [contactSettings, initialProducts, articlesPage, projectsPage] =
    await Promise.all([
      getCachedContactSettings(),
      getCachedCatalogProducts({ sort: "newest" }),
      getCachedPublishedArticlesPage(1, 6),
      getCachedPublishedProjectsPage(1, 6),
    ]);

  const jsonLd = sanitizeJsonLd({
    "@context": "https://schema.org",
    "@graph": [
      createOrganizationJsonLd(contactSettings),
      createWebSiteJsonLd(),
    ],
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <HeroSection />

      {/* ── Special Offers / Flash Sale (Swiper JS + Countdown Timer) ─────── */}
      <SpecialOfferSection />

      {/* ── Product Catalog (Max 10 on Home + View All CTA) ──────────────── */}
      <CatalogSection
        limit={10}
        showViewAllButton={true}
        viewAllHref="/products"
        initialParams={{ sort: "newest" }}
        initialProducts={initialProducts}
      />

      {/* ── Specialized Infrastructure Equipment Categories ───────────────── */}
      <InfrastructureCategoriesSection />

      {/* ── Official Brands Infinite Carousel (Swiper JS) ─────────────────── */}
      <BrandsCarouselSection />

      {/* ── Careers & Resume Submission ───────────────────────────────────── */}
      <CareersSection />

      {/* ── Portfolio / Real Network Projects ─────────────────────────────── */}
      <PortfolioSection initialProjects={projectsPage.items} />

      {/* ── Network Installation & Cabling Services Banner ────────────────── */}
      <InstallationBannerSection />

      {/* ── Articles & Technical Network Insights ─────────────────────────── */}
      <ArticlesSection initialArticles={articlesPage.items} />
    </>
  );
}
