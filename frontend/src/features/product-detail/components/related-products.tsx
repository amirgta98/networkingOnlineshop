import * as React from "react";
import { Product } from "@/features/catalog/types";
import { ProductCard } from "@/features/catalog/components/product-card";
import { Layers } from "lucide-react";

export interface RelatedProductsProps {
  products: Product[];
  currentProductId: string;
  className?: string;
}

export function RelatedProducts({
  products,
  currentProductId,
  className = "",
}: RelatedProductsProps) {
  const filtered = products
    .filter((p) => p.id !== currentProductId)
    .slice(0, 3);

  if (filtered.length === 0) return null;

  return (
    <section className={`flex flex-col gap-6 ${className}`} dir="rtl" aria-label="محصولات مکمل">
      <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
            <Layers className="h-5 w-5 text-orange-400" />
            <span>تجهیزات سازگار و محصولات پیشنهادی مرتبط</span>
          </h2>
          <p className="mt-1 text-xs text-neutral-400">
            تجهیزات پیشنهادی تیم فنی جهت تکمیل زیرساخت شبکه و رک
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {filtered.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
