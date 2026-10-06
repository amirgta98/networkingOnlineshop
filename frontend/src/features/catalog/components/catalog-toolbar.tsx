"use client";

import * as React from "react";
import { SlidersHorizontal, ArrowUpDown, X, Tag } from "lucide-react";
import { ProductCategory, ProductSortOption } from "../types";
import { toPersianDigits, formatPrice } from "@/shared/lib/utils";

export interface CatalogToolbarProps {
  category: ProductCategory;
  selectedBrands: string[];
  minPrice?: number;
  maxPrice?: number;
  inStockOnly: boolean;
  onSaleOnly: boolean;
  sort: ProductSortOption;
  onSortChange: (sort: ProductSortOption) => void;
  onOpenMobileFilter: () => void;
  activeFiltersCount: number;
  totalProducts?: number;
  displayedCount?: number;
  onRemoveFilter: (
    type: "category" | "brand" | "price" | "inStock" | "onSale" | "search",
    value?: string
  ) => void;
  onResetFilters: () => void;
}

const CATEGORY_NAMES: Record<ProductCategory, string> = {
  all: "همه کالاها",
  switches: "سوئیچ‌های شبکه",
  routers: "روتر و فایروال",
  wireless: "اکسس‌پوینت و بی‌سیم",
  fiber: "ماژول و فیبر نوری",
  cables: "کابل شبکه",
  passive: "پسیو و اتصالات",
  audio: "صوتی",
  wearables: "گجت‌ها",
  workspace: "محیط کار",
  accessories: "لوازم جانبی",
};

const SORT_OPTIONS: { value: ProductSortOption; label: string }[] = [
  { value: "featured", label: "منتخب و پیشنهادی" },
  { value: "newest", label: "جدیدترین‌ها" },
  { value: "price-asc", label: "ارزان‌ترین به گران‌ترین" },
  { value: "price-desc", label: "گران‌ترین به ارزان‌ترین" },
  { value: "bestselling", label: "پرفروش‌ترین‌ها" },
  { value: "rating", label: "بالاترین امتیاز خریداران" },
];

export function CatalogToolbar({
  category,
  selectedBrands,
  minPrice,
  maxPrice,
  inStockOnly,
  onSaleOnly,
  sort,
  onSortChange,
  onOpenMobileFilter,
  activeFiltersCount,
  totalProducts,
  displayedCount,
  onRemoveFilter,
  onResetFilters,
}: CatalogToolbarProps) {
  const hasActiveFilters = activeFiltersCount > 0;

  return (
    <div className="space-y-4 mb-6" dir="rtl">
      {/* ── Section Header ─────────────────────────────────────────────── */}
      <div className="flex flex-col gap-2 sm:gap-1.5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex flex-wrap items-center gap-2">
            <span>کاتالوگ تجهیزات شبکه</span>
            {totalProducts !== undefined && (
              <span className="text-xs font-normal text-neutral-400 bg-neutral-900 border border-neutral-800 px-2.5 py-0.5 rounded-full shrink-0">
                {displayedCount !== undefined && displayedCount < totalProducts
                  ? `${toPersianDigits(displayedCount)} از ${toPersianDigits(totalProducts)} کالا`
                  : `${toPersianDigits(totalProducts)} کالا`}
              </span>
            )}
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1 leading-relaxed">
            انواع سوئیچ‌های مدیریتی، روترهای هسته، اکسس‌پوینت‌های وای‌فای ۶ و کابل‌های مسی و نوری اورجینال
          </p>
        </div>

        {/* Mobile filter button trigger */}
        <div className="flex items-center gap-2 pt-1 sm:pt-0 lg:hidden w-full sm:w-auto">
          <button
            onClick={onOpenMobileFilter}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-xl border border-orange-500/30 bg-orange-950/30 px-4 py-2.5 text-xs font-bold text-orange-400 hover:bg-orange-950/50 transition-all shadow-xs"
          >
            <SlidersHorizontal className="h-4 w-4 shrink-0" />
            <span>فیلتر محصولات</span>
            {activeFiltersCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-orange-600 text-[10px] text-white shrink-0 font-mono">
                {toPersianDigits(activeFiltersCount)}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ── Action bar: Sorting & Summary ──────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 rounded-xl border border-neutral-800 bg-[#111114] p-2.5 sm:p-3 text-xs">
        <div className="flex items-center justify-between sm:justify-start gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-1.5 text-neutral-400 font-medium shrink-0">
            <ArrowUpDown className="h-3.5 w-3.5 text-orange-400 shrink-0" />
            <span className="whitespace-nowrap">مرتب‌سازی:</span>
          </div>

          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value as ProductSortOption)}
            className="flex-1 sm:flex-none rounded-lg border border-neutral-800 bg-neutral-900 px-2.5 py-1.5 text-xs text-neutral-200 focus:border-orange-500/60 focus:outline-hidden cursor-pointer"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {totalProducts !== undefined && (
          <span className="text-neutral-400 text-[11px] hidden sm:inline">
            {displayedCount !== undefined && displayedCount < totalProducts
              ? `نمایش ${toPersianDigits(displayedCount)} از ${toPersianDigits(totalProducts)} مورد از محصولات`
              : `نمایش ${toPersianDigits(totalProducts)} مورد از محصولات`}
          </span>
        )}
      </div>

      {/* ── Active Filter Badges ────────────────────────────────────────── */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs text-neutral-400">فیلترهای فعال:</span>

          {/* Category Chip */}
          {category !== "all" && (
            <button
              onClick={() => onRemoveFilter("category")}
              className="inline-flex items-center gap-1 rounded-lg border border-orange-500/30 bg-orange-950/30 px-2.5 py-1 text-[11px] font-medium text-orange-300 hover:bg-orange-950/60 transition-colors"
            >
              <span>دسته: {CATEGORY_NAMES[category] || category}</span>
              <X className="h-3 w-3 text-orange-400" />
            </button>
          )}

          {/* Brand Chips */}
          {selectedBrands.map((brand) => (
            <button
              key={brand}
              onClick={() => onRemoveFilter("brand", brand)}
              className="inline-flex items-center gap-1 rounded-lg border border-neutral-700 bg-neutral-900 px-2.5 py-1 text-[11px] font-medium text-neutral-200 hover:border-neutral-600 transition-colors"
            >
              <span>برند: {brand}</span>
              <X className="h-3 w-3 text-neutral-400" />
            </button>
          ))}

          {/* Price Range Chip */}
          {(minPrice !== undefined || maxPrice !== undefined) && (
            <button
              onClick={() => onRemoveFilter("price")}
              className="inline-flex items-center gap-1 rounded-lg border border-neutral-700 bg-neutral-900 px-2.5 py-1 text-[11px] font-medium text-neutral-200 hover:border-neutral-600 transition-colors"
            >
              <span>
                قیمت: {minPrice ? `از ${formatPrice(minPrice)}` : ""}{" "}
                {maxPrice ? `تا ${formatPrice(maxPrice)}` : ""}
              </span>
              <X className="h-3 w-3 text-neutral-400" />
            </button>
          )}

          {/* In Stock Only Chip */}
          {inStockOnly && (
            <button
              onClick={() => onRemoveFilter("inStock")}
              className="inline-flex items-center gap-1 rounded-lg border border-emerald-500/30 bg-emerald-950/30 px-2.5 py-1 text-[11px] font-medium text-emerald-300 hover:bg-emerald-950/60 transition-colors"
            >
              <span>فقط موجود</span>
              <X className="h-3 w-3 text-emerald-400" />
            </button>
          )}

          {/* On Sale Only Chip */}
          {onSaleOnly && (
            <button
              onClick={() => onRemoveFilter("onSale")}
              className="inline-flex items-center gap-1 rounded-lg border border-red-500/30 bg-red-950/30 px-2.5 py-1 text-[11px] font-medium text-red-300 hover:bg-red-950/60 transition-colors"
            >
              <Tag className="h-3 w-3" />
              <span>تخفیف‌دار</span>
              <X className="h-3 w-3 text-red-400" />
            </button>
          )}

          {/* Clear all */}
          <button
            onClick={onResetFilters}
            className="text-[11px] text-neutral-500 hover:text-orange-400 transition-colors cursor-pointer mr-2"
          >
            پاکسازی همه
          </button>
        </div>
      )}
    </div>
  );
}
