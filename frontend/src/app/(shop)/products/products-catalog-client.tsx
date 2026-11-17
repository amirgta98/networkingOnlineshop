"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { CatalogSection } from "@/features/catalog";
import { Product, ProductCategory } from "@/features/catalog/types";

export interface ProductsCatalogClientProps {
  initialProducts?: Product[];
}

export function ProductsCatalogClient({ initialProducts }: ProductsCatalogClientProps = {}) {
  const searchParams = useSearchParams();
  const categoryParam = (searchParams.get("category") as ProductCategory) || undefined;
  const searchParam = searchParams.get("search") || undefined;

  const initialParams = React.useMemo(() => {
    return {
      category: categoryParam,
      search: searchParam,
    };
  }, [categoryParam, searchParam]);

  return (
    <CatalogSection
      key={`${categoryParam || "all"}::${searchParam || ""}`}
      initialParams={initialParams}
      initialProducts={initialProducts}
      showViewAllButton={false}
    />
  );
}
