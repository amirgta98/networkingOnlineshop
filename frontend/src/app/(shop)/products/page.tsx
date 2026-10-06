import * as React from "react";
import Link from "next/link";
import { ChevronLeft, Home, Package } from "lucide-react";
import { Container } from "@/shared/components/ui/container";
import { ProductsCatalogClient } from "./products-catalog-client";

export const metadata = {
  title: "همه محصولات | فروشگاه تخصصی تجهیزات شبکه ققنوس آکادمی",
  description:
    "مشاهده لیست کامل محصولات و تجهیزات شبکه شامل انواع سوئیچ مدیریتی، روتر سازمانی، کابل شبکه، فیبر نوری و متعلقات پسیو با ضمانت اصالت کالا.",
};

export default function ProductsPage() {
  return (
    <div className="py-6 sm:py-10" dir="rtl">
      <Container>
        {/* ── Breadcrumb ──────────────────────────────────────────────────── */}
        <nav
          className="mb-4 flex items-center gap-1.5 text-xs text-neutral-400 overflow-x-auto whitespace-nowrap"
          aria-label="مسیر راهنما"
        >
          <Link
            href="/"
            className="flex items-center gap-1 hover:text-white transition-colors shrink-0"
          >
            <Home className="h-3.5 w-3.5" />
            <span>خانه</span>
          </Link>
          <ChevronLeft className="h-3 w-3 text-neutral-600 shrink-0" />
          <span className="text-orange-400 font-medium flex items-center gap-1 shrink-0">
            <Package className="h-3.5 w-3.5" />
            <span>همه محصولات</span>
          </span>
        </nav>

        {/* ── Page Header ─────────────────────────────────────────────────── */}
        <div className="mb-6 sm:mb-8 border-b border-neutral-800/80 pb-5 sm:pb-6">
          <h1 className="text-xl sm:text-3xl font-black text-white tracking-tight">
            تمامی محصولات و تجهیزات شبکه
          </h1>
          <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-neutral-400 max-w-2xl leading-relaxed">
            آرشیو کامل تجهیزات اکتیو و پسیو شبکه سازمانی با امکان فیلتر بر اساس برند، دسته‌بندی و قیمت
          </p>
        </div>
      </Container>

      {/* ── Client Catalog wrapped in Suspense for useSearchParams ────────── */}
      <React.Suspense fallback={null}>
        <ProductsCatalogClient />
      </React.Suspense>
    </div>
  );
}
