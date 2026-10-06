import * as React from "react";
import Link from "next/link";
import { ChevronLeft, Home } from "lucide-react";
import { Product } from "@/features/catalog/types";

const CATEGORY_NAMES: Record<string, string> = {
  all: "همه محصولات",
  switches: "سوئیچ‌های شبکه",
  routers: "روترهای سازمانی",
  wireless: "تجهیزات وایرلس",
  fiber: "فیبر نوری و ماژول",
  cables: "کابل و پچ‌کورد",
  passive: "تجهیزات پسیو و رک",
  audio: "صوتی و کنفرانس",
  wearables: "گجت‌ها",
  workspace: "محیط کار",
  accessories: "لوازم جانبی",
};

export interface ProductBreadcrumbsProps {
  product: Product;
  className?: string;
}

export function ProductBreadcrumbs({ product, className = "" }: ProductBreadcrumbsProps) {
  const categoryLabel = CATEGORY_NAMES[product.category] || "تجهیزات شبکه";

  return (
    <nav
      className={`flex items-center gap-1.5 text-xs text-neutral-400 overflow-x-auto whitespace-nowrap py-1 ${className}`}
      aria-label="مسیر راهنما"
      dir="rtl"
    >
      <Link
        href="/"
        className="flex items-center gap-1 text-neutral-400 hover:text-neutral-200 transition-colors"
      >
        <Home className="h-3.5 w-3.5" />
        <span>خانه</span>
      </Link>

      <ChevronLeft className="h-3 w-3 text-neutral-600 shrink-0" aria-hidden="true" />

      <Link
        href="/products"
        className="text-neutral-400 hover:text-neutral-200 transition-colors"
      >
        محصولات
      </Link>

      <ChevronLeft className="h-3 w-3 text-neutral-600 shrink-0" aria-hidden="true" />

      <Link
        href={`/products?category=${product.category}`}
        className="text-neutral-400 hover:text-neutral-200 transition-colors"
      >
        {categoryLabel}
      </Link>

      <ChevronLeft className="h-3 w-3 text-neutral-600 shrink-0" aria-hidden="true" />

      <span
        className="font-medium text-orange-400 max-w-[220px] sm:max-w-[340px] truncate"
        aria-current="page"
        title={product.name}
      >
        {product.name}
      </span>
    </nav>
  );
}
