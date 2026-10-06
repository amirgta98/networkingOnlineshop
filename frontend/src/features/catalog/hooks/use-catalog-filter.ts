"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { ProductCategory, ProductSortOption, ProductFilterParams } from "../types";
import { useDebounce } from "@/shared/hooks/use-debounce";

export function useCatalogFilter(initialParams: ProductFilterParams = {}) {
  const [search, setSearch] = useState<string>(initialParams.search || "");
  const [category, setCategory] = useState<ProductCategory>(initialParams.category || "all");
  const [selectedBrands, setSelectedBrands] = useState<string[]>(initialParams.brands || []);
  const [minPrice, setMinPrice] = useState<number | undefined>(initialParams.minPrice);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(initialParams.maxPrice);
  const [sort, setSort] = useState<ProductSortOption>(initialParams.sort || "featured");
  const [inStockOnly, setInStockOnly] = useState<boolean>(initialParams.inStockOnly || false);
  const [onSaleOnly, setOnSaleOnly] = useState<boolean>(initialParams.onSaleOnly || false);

  useEffect(() => {
    const handleCategorySelect = (event: Event) => {
      const customEvent = event as CustomEvent<ProductCategory>;
      if (customEvent.detail) {
        setCategory(customEvent.detail);
      }
    };
    window.addEventListener("select-catalog-category", handleCategorySelect);
    return () => {
      window.removeEventListener("select-catalog-category", handleCategorySelect);
    };
  }, []);

  const debouncedSearch = useDebounce(search, 250);
  const debouncedMinPrice = useDebounce(minPrice, 350);
  const debouncedMaxPrice = useDebounce(maxPrice, 350);

  const toggleBrand = useCallback((brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  }, []);

  const filterParams = useMemo<ProductFilterParams>(() => {
    return {
      search: debouncedSearch,
      category,
      brands: selectedBrands.length > 0 ? selectedBrands : undefined,
      minPrice: debouncedMinPrice,
      maxPrice: debouncedMaxPrice,
      sort,
      inStockOnly,
      onSaleOnly,
    };
  }, [
    debouncedSearch,
    category,
    selectedBrands,
    debouncedMinPrice,
    debouncedMaxPrice,
    sort,
    inStockOnly,
    onSaleOnly,
  ]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (search.trim() !== "") count++;
    if (category !== "all") count++;
    if (selectedBrands.length > 0) count += selectedBrands.length;
    if (minPrice !== undefined && minPrice > 0) count++;
    if (maxPrice !== undefined && maxPrice > 0) count++;
    if (inStockOnly) count++;
    if (onSaleOnly) count++;
    return count;
  }, [search, category, selectedBrands, minPrice, maxPrice, inStockOnly, onSaleOnly]);

  const resetFilters = useCallback(() => {
    setSearch("");
    setCategory("all");
    setSelectedBrands([]);
    setMinPrice(undefined);
    setMaxPrice(undefined);
    setSort("featured");
    setInStockOnly(false);
    setOnSaleOnly(false);
  }, []);

  const removeFilter = useCallback(
    (type: "category" | "brand" | "price" | "inStock" | "onSale" | "search", value?: string) => {
      switch (type) {
        case "category":
          setCategory("all");
          break;
        case "brand":
          if (value) {
            setSelectedBrands((prev) => prev.filter((b) => b !== value));
          } else {
            setSelectedBrands([]);
          }
          break;
        case "price":
          setMinPrice(undefined);
          setMaxPrice(undefined);
          break;
        case "inStock":
          setInStockOnly(false);
          break;
        case "onSale":
          setOnSaleOnly(false);
          break;
        case "search":
          setSearch("");
          break;
      }
    },
    []
  );

  return {
    search,
    setSearch,
    debouncedSearch,
    category,
    setCategory,
    selectedBrands,
    setSelectedBrands,
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
  };
}
