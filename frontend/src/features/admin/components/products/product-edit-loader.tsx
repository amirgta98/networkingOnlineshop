"use client";

import * as React from "react";
import { ProductFormView } from "./product-form-view";
import { productsApi } from "../../api/products-api";
import type { AdminProduct } from "../../types/admin-products.types";
import { Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/shared/components/ui/button";

export function ProductEditLoader({ productId }: { productId: string }) {
  const [product, setProduct] = React.useState<AdminProduct | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let isMounted = true;

    async function load() {
      setIsLoading(true);
      setError(null);

      try {
        // 1. Try server API
        const serverProduct = await productsApi.getProductById(productId);
        if (isMounted && serverProduct) {
          setProduct(serverProduct);
          setIsLoading(false);
          return;
        }
      } catch (err: unknown) {
        if (isMounted) {
          const msg = err instanceof Error ? err.message : `محصول با شناسه "${productId}" یافت نشد.`;
          setError(msg);
          setIsLoading(false);
          return;
        }
      }

      if (isMounted) {
        setError(`محصول با شناسه "${productId}" یافت نشد.`);
        setIsLoading(false);
      }
    }

    load();

    return () => {
      isMounted = false;
    };
  }, [productId]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3" dir="rtl">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
        <p className="text-xs text-neutral-400">در حال بارگذاری اطلاعات محصول...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="p-8 bg-[#141417] border border-white/10 rounded-2xl text-center space-y-4 max-w-lg mx-auto my-12" dir="rtl">
        <div className="p-3 bg-rose-500/10 text-rose-400 rounded-xl w-fit mx-auto border border-rose-500/20">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-white">خطا در یافتن محصول</h3>
        <p className="text-xs text-neutral-400">{error || "محصول مورد نظر یافت نشد."}</p>
        <Link href="/admin/products">
          <Button variant="outline" className="text-xs border-white/10 text-neutral-300">
            بازگشت به لیست محصولات
          </Button>
        </Link>
      </div>
    );
  }

  return <ProductFormView initialProduct={product} isEditMode={true} productId={productId} />;
}
