"use client";

import * as React from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { ProductCategory, ProductSortOption } from "../types";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";

export interface ProductFilterProps {
  search: string;
  onSearchChange: (value: string) => void;
  category: ProductCategory;
  onCategoryChange: (category: ProductCategory) => void;
  sort: ProductSortOption;
  onSortChange: (sort: ProductSortOption) => void;
  inStockOnly: boolean;
  onInStockChange: (inStock: boolean) => void;
  onReset: () => void;
  totalProducts?: number;
}

const CATEGORIES: { label: string; value: ProductCategory }[] = [
  { label: "All Items", value: "all" },
  { label: "Audio", value: "audio" },
  { label: "Wearables", value: "wearables" },
  { label: "Workspace", value: "workspace" },
  { label: "Accessories", value: "accessories" },
];

export function ProductFilter({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  sort,
  onSortChange,
  inStockOnly,
  onInStockChange,
  onReset,
  totalProducts,
}: ProductFilterProps) {
  const isFiltered = search !== "" || category !== "all" || inStockOnly || sort !== "featured";

  return (
    <div className="space-y-4">
      {/* Top row: Search Bar & Sort Dropdown */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <Input
            type="text"
            placeholder="Search audio, watches, workspace gear..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 pr-9 bg-white dark:bg-neutral-900"
          />
          {search && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
            <SlidersHorizontal className="h-4 w-4" />
            <span className="hidden sm:inline">Sort by:</span>
          </div>

          <select
            value={sort}
            onChange={(e) => onSortChange(e.target.value as ProductSortOption)}
            className="h-10 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/10 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
          >
            <option value="featured">Featured First</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
          </select>

          {isFiltered && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100"
            >
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Bottom row: Category filter chips */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-none">
        <div className="flex items-center gap-2">
          {CATEGORIES.map((cat) => {
            const isActive = category === cat.value;
            return (
              <button
                key={cat.value}
                onClick={() => onCategoryChange(cat.value)}
                className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all duration-200 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? "bg-neutral-900 text-white shadow-xs dark:bg-white dark:text-neutral-900"
                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800/80 dark:text-neutral-400 dark:hover:bg-neutral-800"
                }`}
              >
                {cat.label}
              </button>
            );
          })}

          <div className="h-4 w-px bg-neutral-200 dark:bg-neutral-800 mx-1" />

          {/* In Stock toggle filter chip */}
          <button
            onClick={() => onInStockChange(!inStockOnly)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all duration-200 whitespace-nowrap cursor-pointer border ${
              inStockOnly
                ? "border-emerald-500/80 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                : "border-neutral-200 text-neutral-600 hover:bg-neutral-100 dark:border-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-800"
            }`}
          >
            ● In Stock Only
          </button>
        </div>


        {totalProducts !== undefined && (
          <span className="text-xs text-neutral-400 whitespace-nowrap hidden md:inline">
            Showing {totalProducts} {totalProducts === 1 ? "product" : "products"}
          </span>
        )}
      </div>
    </div>
  );
}
