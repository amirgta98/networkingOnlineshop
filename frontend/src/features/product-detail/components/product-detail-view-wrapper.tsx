"use client";

import * as React from "react";
import Link from "next/link";
import { PackageX, ArrowRight, Home } from "lucide-react";
import { Product } from "@/features/catalog/types";
import { getLocalAdminProducts } from "@/features/catalog/api/get-products";
import { ProductDetailClient } from "./product-detail-client";
import { ProductSchema } from "./product-schema";
import { Button } from "@/shared/components/ui/button";
import { Container } from "@/shared/components/ui/container";

export interface ProductDetailViewWrapperProps {
  slug: string;
  initialProduct: Product | null;
  relatedProducts: Product[];
}

export function ProductDetailViewWrapper({
  slug,
  initialProduct,
  relatedProducts,
}: ProductDetailViewWrapperProps) {
  const [product, setProduct] = React.useState<Product | null>(initialProduct);
  const [hasCheckedLocal, setHasCheckedLocal] = React.useState(Boolean(initialProduct));

  React.useEffect(() => {
    if (!initialProduct && typeof window !== "undefined") {
      // Look in LocalStorage if not rendered from server
      const localProducts = getLocalAdminProducts();
      const match = localProducts.find(
        (p) =>
          p.slug === slug ||
          p.id === slug ||
          (p.sku && p.sku.toLowerCase() === slug.toLowerCase())
      );
      if (match) {
        setProduct(match);
      }
      setHasCheckedLocal(true);
    }
  }, [initialProduct, slug]);

  const activeRelatedProducts = React.useMemo(() => {
    if (!product) return relatedProducts;

    if (product.relatedProducts && product.relatedProducts.length > 0) {
      return product.relatedProducts.filter((p) => p.id !== product.id);
    }

    if (product.relatedProductIds && product.relatedProductIds.length > 0) {
      const localProducts = typeof window !== "undefined" ? getLocalAdminProducts() : [];
      const pool = [...relatedProducts, ...localProducts];
      const resolved = product.relatedProductIds
        .map((relId) =>
          pool.find(
            (p) =>
              p.id === relId ||
              p.slug === relId ||
              (p.sku && p.sku.toLowerCase() === relId.toLowerCase())
          )
        )
        .filter((p): p is Product => Boolean(p && p.id !== product.id));

      if (resolved.length > 0) {
        return resolved;
      }
    }

    return relatedProducts;
  }, [product, relatedProducts]);

  if (product) {
    return (
      <>
        <ProductSchema product={product} />
        <ProductDetailClient
          product={product}
          relatedProducts={activeRelatedProducts}
        />
      </>
    );
  }

  if (!hasCheckedLocal) {
    return (
      <Container className="py-24 flex items-center justify-center text-center" dir="rtl">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
          <span className="text-sm text-neutral-400">در حال بارگذاری مشخصات کالا...</span>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-20 sm:py-28" dir="rtl">
      <div className="mx-auto max-w-lg rounded-3xl border border-neutral-800 bg-[#121215] p-8 sm:p-10 text-center shadow-2xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-rose-500/20 bg-rose-500/10 text-rose-400">
          <PackageX className="h-8 w-8" />
        </div>

        <h1 className="mt-5 text-xl sm:text-2xl font-black text-white">
          محصول مورد نظر یافت نشد
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-neutral-400 leading-relaxed">
          متاسفانه محصولی با شناسه یا آدرس «<span className="font-mono text-orange-400">{slug}</span>» در پایگاه‌داده یا انبار موجود نیست یا ممکن است حذف شده باشد.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/products" className="w-full sm:w-auto">
            <Button className="w-full h-11 px-5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-orange-950/40">
              <ArrowRight className="h-4 w-4" />
              <span>مشاهده کاتالوگ محصولات</span>
            </Button>
          </Link>

          <Link href="/" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full h-11 px-5 rounded-xl border-neutral-800 bg-neutral-900/60 text-neutral-300 hover:text-white text-xs flex items-center justify-center gap-2">
              <Home className="h-4 w-4" />
              <span>صفحه اصلی</span>
            </Button>
          </Link>
        </div>
      </div>
    </Container>
  );
}
