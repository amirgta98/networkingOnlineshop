import * as React from "react";
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

export const metadata = {
  title: "تجهیزات شبکه | سوئیچ، روتر، فیبر نوری، تجهیزات اکتیو و پسیو",
  description:
    "فروشگاه تخصصی تجهیزات شبکه سازمانی — سوئیچ‌های مدیریت‌پذیر، روتر، فایروال، اکسس پوینت، کابل‌کشی و ابزار تست با برندهای سیسکو، میکروتیک، لگراند و نگزانس.",
};

export default function ShopPage() {
  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <HeroSection />

      {/* ── Special Offers / Flash Sale (Swiper JS + Countdown Timer) ─────── */}
      <SpecialOfferSection />

      {/* ── Product Catalog (Max 10 on Home + View All CTA) ──────────────── */}
      <CatalogSection limit={10} showViewAllButton={true} viewAllHref="/products" />

      {/* ── Specialized Infrastructure Equipment Categories ───────────────── */}
      <InfrastructureCategoriesSection />

      {/* ── Official Brands Infinite Carousel (Swiper JS) ─────────────────── */}
      <BrandsCarouselSection />

      {/* ── Careers & Resume Submission ───────────────────────────────────── */}
      <CareersSection />

      {/* ── Portfolio / Real Network Projects ─────────────────────────────── */}
      <PortfolioSection />

      {/* ── Network Installation & Cabling Services Banner ────────────────── */}
      <InstallationBannerSection />

      {/* ── Articles & Technical Network Insights ─────────────────────────── */}
      <ArticlesSection />
    </>
  );
}


