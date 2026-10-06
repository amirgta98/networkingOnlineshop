"use client";

import * as React from "react";
import Link from "next/link";
import { useCatalogFilter } from "../hooks/use-catalog-filter";
import { useProducts } from "../api/use-products";
import { CatalogSidebarFilter } from "./catalog-sidebar-filter";
import { CatalogMobileFilter } from "./catalog-mobile-filter";
import { CatalogToolbar } from "./catalog-toolbar";
import { ProductGrid } from "./product-grid";
import { ProductGridSkeleton } from "./product-skeleton";
import { Container } from "@/shared/components/ui/container";
import { AlertTriangle, RefreshCw, ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { toPersianDigits } from "@/shared/lib/utils";
import { ProductFilterParams } from "../types";

export interface CatalogSectionProps {
  limit?: number;
  showViewAllButton?: boolean;
  viewAllHref?: string;
  initialParams?: ProductFilterParams;
}

export function CatalogSection({
  limit,
  showViewAllButton,
  viewAllHref = "/products",
  initialParams,
}: CatalogSectionProps = {}) {
  const {
    search,
    setSearch,
    category,
    setCategory,
    selectedBrands,
    toggleBrand,
    minPrice,
    setMinPrice,
    maxPrice,
    setMaxPrice,
    sort,
    setSort,
    inStockOnly,
    setInStockOnly,
    onSaleOnly,
    setOnSaleOnly,
    filterParams,
    activeFiltersCount,
    resetFilters,
    removeFilter,
  } = useCatalogFilter(initialParams);

  const [isMobileFilterOpen, setIsMobileFilterOpen] = React.useState(false);
  const { data: products, isLoading, error, refetch } = useProducts(filterParams);

  const displayedProducts = React.useMemo(() => {
    if (!products) return [];
    if (limit && limit > 0) {
      return products.slice(0, limit);
    }
    return products;
  }, [products, limit]);

  const shouldShowViewAll = showViewAllButton ?? Boolean(limit && products && products.length > limit);

  const viewAllLink = React.useMemo(() => {
    const base = viewAllHref || "/products";
    const params = new URLSearchParams();
    if (category && category !== "all") params.set("category", category);
    if (search && search.trim() !== "") params.set("search", search.trim());
    const qs = params.toString();
    return qs ? `${base}?${qs}` : base;
  }, [viewAllHref, category, search]);

  return (
    <section id="catalog" className="py-8 sm:py-12" dir="rtl">
      <Container>
        {/* Main layout: Right sidebar (in RTL) + Left products grid */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
          {/* ── Right Column: Desktop Sidebar Filters (Sticky) ─────────── */}
          <div className="hidden lg:block w-72 shrink-0 sticky top-24 self-start">
            <CatalogSidebarFilter
              search={search}
              onSearchChange={setSearch}
              category={category}
              onCategoryChange={setCategory}
              selectedBrands={selectedBrands}
              onToggleBrand={toggleBrand}
              minPrice={minPrice}
              onMinPriceChange={setMinPrice}
              maxPrice={maxPrice}
              onMaxPriceChange={setMaxPrice}
              inStockOnly={inStockOnly}
              onInStockChange={setInStockOnly}
              onSaleOnly={onSaleOnly}
              onSaleChange={setOnSaleOnly}
              onReset={resetFilters}
              activeFiltersCount={activeFiltersCount}
              totalProducts={products?.length}
            />
          </div>

          {/* ── Left Column: Main Catalog Content ──────────────────────── */}
          <div className="flex-1 min-w-0 w-full">
            {/* Toolbar: Search summary, sorting, active filter tags */}
            <CatalogToolbar
              category={category}
              selectedBrands={selectedBrands}
              minPrice={minPrice}
              maxPrice={maxPrice}
              inStockOnly={inStockOnly}
              onSaleOnly={onSaleOnly}
              sort={sort}
              onSortChange={setSort}
              onOpenMobileFilter={() => setIsMobileFilterOpen(true)}
              activeFiltersCount={activeFiltersCount}
              totalProducts={products?.length}
              displayedCount={displayedProducts.length}
              onRemoveFilter={removeFilter}
              onResetFilters={resetFilters}
            />

            {/* Product Grid or Skeletons or Error */}
            {isLoading ? (
              <ProductGridSkeleton count={limit ? Math.min(limit, 6) : 6} />
            ) : error ? (
              <div className="rounded-3xl border border-red-500/20 bg-red-950/20 p-8 text-center" dir="rtl">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-950/40 text-red-400 border border-red-500/30 mx-auto mb-3">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-white mb-1">
                  خطا در دریافت لیست محصولات
                </h3>
                <p className="text-xs text-neutral-400 max-w-sm mx-auto mb-4">
                  ارتباط با سرور برقرار نشد. لطفاً اتصال اینترنت خود را بررسی نمایید.
                </p>
                <Button
                  onClick={() => refetch()}
                  variant="outline"
                  size="sm"
                  className="gap-2 rounded-xl text-xs border-red-500/30 hover:bg-red-950/40 text-red-300"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>تلاش مجدد</span>
                </Button>
              </div>
            ) : (
              <>
                <ProductGrid
                  products={displayedProducts}
                  onResetFilters={resetFilters}
                />

                {/* ── View All Products CTA Button ───────────────────────── */}
                {shouldShowViewAll && (
                  <div className="mt-8 sm:mt-12 flex flex-col items-center justify-center rounded-2xl sm:rounded-3xl border border-neutral-800/80 bg-neutral-900/60 p-6 sm:p-8 text-center shadow-lg backdrop-blur-xs relative overflow-hidden">
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute -top-12 left-1/2 -translate-x-1/2 h-32 w-80 rounded-full bg-orange-500/10 blur-2xl"
                    />
                    <div className="relative z-10 flex flex-col items-center max-w-md mx-auto">
                      <div className="mb-2.5 inline-flex items-center gap-1.5 rounded-full border border-orange-500/20 bg-orange-950/30 px-3 py-1 text-[11px] font-medium text-orange-400">
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>تنوع کامل تجهیزات شبکه ققنوس آکادمی</span>
                      </div>
                      <h3 className="text-base sm:text-lg font-black text-white mb-1.5">
                        مشاهده تمامی تجهیزات و محصولات موجود
                      </h3>
                      {products && products.length > displayedProducts.length && (
                        <p className="text-xs text-neutral-400 mb-5 leading-relaxed">
                          در حال حاضر {toPersianDigits(displayedProducts.length)} محصول منتخب از مجموع {toPersianDigits(products.length)} کالا نمایش داده شده است.
                        </p>
                      )}
                      <Link href={viewAllLink} className="w-full sm:w-auto">
                        <Button
                          size="lg"
                          className="group w-full sm:w-auto min-h-[46px] sm:min-h-[50px] px-8 gap-3 text-sm sm:text-base font-bold text-white rounded-xl sm:rounded-2xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:outline-hidden cursor-pointer"
                          style={{
                            background: "linear-gradient(135deg, #c2410c 0%, #ea580c 60%, #f97316 100%)",
                            boxShadow: "0 4px 20px rgba(234, 88, 12, 0.4)",
                          }}
                        >
                          <span>تماشای همه محصولات</span>
                          <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* ── Mobile Filter Drawer ────────────────────────────────────── */}
        <CatalogMobileFilter
          isOpen={isMobileFilterOpen}
          onClose={() => setIsMobileFilterOpen(false)}
          search={search}
          onSearchChange={setSearch}
          category={category}
          onCategoryChange={setCategory}
          selectedBrands={selectedBrands}
          onToggleBrand={toggleBrand}
          minPrice={minPrice}
          onMinPriceChange={setMinPrice}
          maxPrice={maxPrice}
          onMaxPriceChange={setMaxPrice}
          inStockOnly={inStockOnly}
          onInStockChange={setInStockOnly}
          onSaleOnly={onSaleOnly}
          onSaleChange={setOnSaleOnly}
          onReset={resetFilters}
          activeFiltersCount={activeFiltersCount}
          totalProducts={products?.length}
        />
      </Container>
    </section>
  );
}
