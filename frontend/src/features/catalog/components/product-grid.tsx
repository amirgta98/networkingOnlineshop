"use client";

import * as React from "react";
import { Product } from "../types";
import { ProductCard } from "./product-card";
import { PackageOpen, RotateCcw } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

export interface ProductGridProps {
  products: Product[];
  onAddToCart?: (product: Product) => void;
  onResetFilters?: () => void;
}

export function ProductGrid({
  products,
  onResetFilters,
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center rounded-3xl border border-neutral-800 bg-[#111114] py-16 px-6 text-center shadow-lg"
        dir="rtl"
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-950/30 text-orange-400 border border-orange-500/20 mb-4">
          <PackageOpen className="h-7 w-7" />
        </div>
        <h3 className="text-lg font-bold text-white">
          محصولی با این مشخصات یافت نشد
        </h3>
        <p className="mt-1.5 text-xs text-neutral-400 max-w-sm leading-relaxed">
          هیچ کالایی مطابق با فیلترهای انتخابی شما در انبار موجود نیست. لطفاً فیلترها را تغییر دهید یا بازنشانی کنید.
        </p>
        {onResetFilters && (
          <Button
            onClick={onResetFilters}
            className="mt-5 gap-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold px-4 py-2"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>پاکسازی فیلترها</span>
          </Button>
        )}
      </div>
    );
  }

  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5"
      dir="rtl"
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
