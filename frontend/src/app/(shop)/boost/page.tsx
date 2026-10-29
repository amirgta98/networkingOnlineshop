import * as React from "react";
import { SpecialOfferSection } from "@/features/special-offers";
import { CatalogSection } from "@/features/catalog";

export const metadata = {
  title: "پیشنهادات شگفت‌انگیز و تخفیف‌های ویژه (Boost) | تجهیزات شبکه ققنوس",
  description:
    "بهترین تخفیف‌ها و پیشنهادهای شگفت‌انگیز تجهیزات شبکه سازمانی — سوئیچ، روتر، اکسس‌پوینت و کابل شبکه با ضمانت اصالت و تحویل فوری.",
};

export default function BoostPage() {
  return (
    <div className="min-h-screen py-4 sm:py-8" dir="rtl">
      {/* ── Boost / Special Offers Flash Sale ────────────────────────────── */}
      <SpecialOfferSection />

      {/* ── All Catalog Products ─────────────────────────────────────────── */}
      <CatalogSection limit={12} showViewAllButton={true} viewAllHref="/products" />
    </div>
  );
}
