"use client";

import * as React from "react";
import { X } from "lucide-react";
import { CatalogSidebarFilter, CatalogSidebarFilterProps } from "./catalog-sidebar-filter";
import { toPersianDigits } from "@/shared/lib/utils";

export interface CatalogMobileFilterProps extends CatalogSidebarFilterProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CatalogMobileFilter({
  isOpen,
  onClose,
  totalProducts,
  ...filterProps
}: CatalogMobileFilterProps) {
  // Prevent scrolling when drawer is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden" dir="rtl">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over Panel */}
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-xs flex-col bg-[#0d0d10] border-l border-neutral-800 shadow-2xl transition-transform duration-300">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 px-5 py-4">
          <h2 className="text-base font-bold text-white">فیلترهای محصولات</h2>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-white"
            aria-label="بستن منوی فیلتر"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Filter Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-neutral-800">
          <CatalogSidebarFilter
            {...filterProps}
            totalProducts={totalProducts}
            className="border-0 bg-transparent p-0 shadow-none"
          />
        </div>

        {/* Bottom CTA to apply/close */}
        <div className="border-t border-neutral-800 p-4 bg-neutral-950/90">
          <button
            onClick={onClose}
            className="w-full rounded-xl bg-orange-600 hover:bg-orange-500 py-3 text-sm font-bold text-white shadow-lg shadow-orange-950/40 transition-all active:scale-[0.98]"
          >
            مشاهده نتایج {totalProducts !== undefined ? `(${toPersianDigits(totalProducts)} کالا)` : ""}
          </button>
        </div>
      </div>
    </div>
  );
}
