"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { toPersianDigits } from "@/shared/lib/utils";

interface TabPaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function TabPagination({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  className = "",
}: TabPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  if (totalItems <= pageSize) {
    return null;
  }

  return (
    <div
      dir="rtl"
      className={`flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 rounded-2xl border border-neutral-800 bg-neutral-900/60 text-xs ${className}`}
    >
      <div className="text-neutral-400 font-medium select-none text-[11px] sm:text-xs">
        صفحه <span className="text-white font-mono font-bold">{toPersianDigits(currentPage)}</span> از{" "}
        <span className="text-white font-mono font-bold">{toPersianDigits(totalPages)}</span> — مجموع{" "}
        <span className="text-emerald-400 font-mono font-bold">{toPersianDigits(totalItems)}</span> ردیف
      </div>

      <div className="flex items-center gap-1.5">
        {/* Previous Page button (RTL: ChevronRight goes backwards) */}
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage <= 1}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-neutral-700 bg-neutral-800 text-neutral-200 text-xs font-medium transition-all hover:bg-neutral-700 hover:text-white disabled:pointer-events-none disabled:opacity-40 cursor-pointer"
        >
          <ChevronRight className="h-3.5 w-3.5" />
          <span>قبلی</span>
        </button>

        {/* Page numbers */}
        <div className="flex items-center gap-1 px-1">
          {Array.from({ length: Math.min(5, totalPages) }).map((_, idx) => {
            let pageNumber = idx + 1;
            if (totalPages > 5) {
              const startPage = Math.max(
                1,
                Math.min(currentPage - 2, totalPages - 4)
              );
              pageNumber = startPage + idx;
            }

            const isActive = pageNumber === currentPage;
            return (
              <button
                key={`tab-page-${pageNumber}`}
                type="button"
                onClick={() => onPageChange(pageNumber)}
                className={`h-7 min-w-7 px-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  isActive
                    ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/30"
                    : "text-neutral-400 hover:text-white hover:bg-neutral-800"
                }`}
              >
                {toPersianDigits(pageNumber)}
              </button>
            );
          })}
        </div>

        {/* Next Page button (RTL: ChevronLeft goes forwards) */}
        <button
          type="button"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage >= totalPages}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-neutral-700 bg-neutral-800 text-neutral-200 text-xs font-medium transition-all hover:bg-neutral-700 hover:text-white disabled:pointer-events-none disabled:opacity-40 cursor-pointer"
        >
          <span>بعدی</span>
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
