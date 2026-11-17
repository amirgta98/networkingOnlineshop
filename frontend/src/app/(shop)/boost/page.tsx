import * as React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, Home, Sparkles } from "lucide-react";
import { Container } from "@/shared/components/ui/container";
import { SpecialOfferSection } from "@/features/special-offers";
import { CatalogSection } from "@/features/catalog";
import {
  buildPublicMetadata,
  createBreadcrumbJsonLd,
  sanitizeJsonLd,
} from "@/shared/lib/seo";
import { getCachedCatalogProducts } from "@/shared/lib/server-seo-data";

export const dynamic = "force-dynamic";

export const metadata: Metadata = buildPublicMetadata({
  title: "پیشنهادات شگفت‌انگیز و تخفیف‌های ویژه تجهیزات شبکه | ققنوس آکادمی",
  description:
    "بهترین تخفیف‌ها و پیشنهادهای شگفت‌انگیز تجهیزات شبکه سازمانی — سوئیچ، روتر، اکسس‌پوینت و کابل شبکه با ضمانت اصالت و تحویل فوری از ققنوس آکادمی.",
  path: "/boost",
  keywords: [
    "تخفیف تجهیزات شبکه",
    "فروش ویژه سوئیچ",
    "پیشنهاد شگفت‌انگیز ققنوس آکادمی",
    "خرید سوئیچ با تخفیف",
  ],
});

export default async function BoostPage() {
  const initialProducts = await getCachedCatalogProducts({ sort: "newest" });

  const jsonLd = sanitizeJsonLd({
    "@context": "https://schema.org",
    "@graph": [
      createBreadcrumbJsonLd([
        { name: "صفحه اصلی", path: "/" },
        { name: "پیشنهادات شگفت‌انگیز", path: "/boost" },
      ]),
    ],
  });

  return (
    <div className="min-h-screen py-6 sm:py-10" dir="rtl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Container>
        <nav
          className="mb-4 flex items-center gap-1.5 text-xs text-neutral-400"
          aria-label="مسیر راهنما"
        >
          <Link href="/" className="flex items-center gap-1 hover:text-white transition-colors">
            <Home className="h-3.5 w-3.5" />
            <span>خانه</span>
          </Link>
          <ChevronLeft className="h-3 w-3 text-neutral-600" aria-hidden="true" />
          <span className="text-orange-400 font-medium flex items-center gap-1">
            <Sparkles className="h-3.5 w-3.5" />
            <span>پیشنهادات شگفت‌انگیز</span>
          </span>
        </nav>

        <header className="mb-6 border-b border-neutral-800/80 pb-5">
          <h1 className="text-xl sm:text-3xl font-black text-white tracking-tight">
            پیشنهادات شگفت‌انگیز و تخفیف‌های ویژه تجهیزات شبکه
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-neutral-400 max-w-2xl leading-relaxed">
            فروش ویژه و تخفیف‌های زمان‌دار تجهیزات اکتیو و پسیو شبکه با گارانتی معتبر و ارسال سریع از انبار مرکزی ققنوس آکادمی.
          </p>
        </header>
      </Container>

      {/* ── Boost / Special Offers Flash Sale ────────────────────────────── */}
      <SpecialOfferSection />

      {/* ── All Catalog Products ─────────────────────────────────────────── */}
      <CatalogSection
        limit={12}
        showViewAllButton={true}
        viewAllHref="/products"
        initialParams={{ sort: "newest" }}
        initialProducts={initialProducts}
      />
    </div>
  );
}
