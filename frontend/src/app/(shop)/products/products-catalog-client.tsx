"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { CatalogSection } from "@/features/catalog";
import { ProductCategory } from "@/features/catalog/types";

export function ProductsCatalogClient() {
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
      initialParams={initialParams}
      showViewAllButton={false}
    />
  );
}
