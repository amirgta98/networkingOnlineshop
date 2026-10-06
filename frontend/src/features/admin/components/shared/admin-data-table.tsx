"use client";

import * as React from "react";
import {
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  Inbox,
} from "lucide-react";
import { cn, toPersianDigits } from "@/shared/lib/utils";

export interface AdminColumnDef<T> {
  key: string;
  header: React.ReactNode;
  sortable?: boolean;
  className?: string;
  hideOnMobile?: boolean;
  cell: (row: T, index: number) => React.ReactNode;
}

export interface AdminDataTableProps<T> {
  data: T[];
  columns: AdminColumnDef<T>[];
  keyExtractor: (item: T) => string;
  isLoading?: boolean;
  emptyMessage?: string;
  emptySubtitle?: string;
  // Sorting
  sortColumn?: string;
  sortDirection?: "asc" | "desc";
  onSort?: (columnKey: string) => void;
  // Pagination
  pageSize?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  totalItems?: number;
  // Row interaction
  onRowClick?: (row: T) => void;
  // Mobile Card View customization (falls back to column cards)
  mobileCardRenderer?: (row: T) => React.ReactNode;
  className?: string;
}

export function AdminDataTable<T>({
  data,
  columns,
  keyExtractor,
  isLoading = false,
  emptyMessage = "هیچ رکوردی یافت نشد",
  emptySubtitle = "فیلترها را تغییر دهید یا جستجوی دیگری را امتحان کنید",
  sortColumn,
  sortDirection,
  onSort,
  pageSize,
  currentPage = 1,
  onPageChange,
  totalItems,
  onRowClick,
  mobileCardRenderer,
  className,
}: AdminDataTableProps<T>) {
  // Calculate pagination statistics
  const total = totalItems !== undefined ? totalItems : data.length;
  const effectivePageSize = pageSize || (data.length > 0 ? data.length : 10);
  const totalPages = Math.max(1, Math.ceil(total / effectivePageSize));
  const hasPagination = Boolean(pageSize && total > 0 && onPageChange);

  const handleHeaderClick = (col: AdminColumnDef<T>) => {
    if (col.sortable && onSort) {
      onSort(col.key);
    }
  };

  return (
    <div
      dir="rtl"
      className={cn(
        "w-full rounded-2xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] shadow-sm overflow-hidden flex flex-col transition-all",
        className
      )}
    >
      {/* =========================================================================
          Desktop & Tablet Table View (>= md)
         ========================================================================= */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full min-w-[900px] border-collapse text-right text-sm">
          {/* Table Header */}
          <thead className="bg-[var(--theme-surface-alt)]/90 border-b border-[var(--theme-border-color)] backdrop-blur-xs sticky top-0 z-10">
            <tr>
              {columns.map((col) => {
                const isSorted = sortColumn === col.key;
                return (
                  <th
                    key={col.key}
                    scope="col"
                    className={cn(
                      "px-4 py-3.5 text-xs font-semibold text-[var(--theme-muted)] tracking-wider select-none whitespace-nowrap",
                      col.sortable &&
                        "cursor-pointer hover:text-[var(--theme-foreground)] hover:bg-neutral-800/30 transition-colors",
                      col.className
                    )}
                    onClick={() => handleHeaderClick(col)}
                  >
                    <div className="inline-flex items-center gap-1.5">
                      <span>{col.header}</span>
                      {col.sortable && (
                        <span className="shrink-0 text-neutral-500">
                          {isSorted ? (
                            sortDirection === "asc" ? (
                              <ChevronUp className="h-3.5 w-3.5 text-emerald-400" />
                            ) : (
                              <ChevronDown className="h-3.5 w-3.5 text-emerald-400" />
                            )
                          ) : (
                            <ArrowUpDown className="h-3 w-3 opacity-60" />
                          )}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-[var(--theme-border-color)]/60">
            {isLoading ? (
              // Loading Skeleton Rows
              Array.from({ length: effectivePageSize > 5 ? 5 : effectivePageSize }).map(
                (_, rowIdx) => (
                  <tr key={`skeleton-row-${rowIdx}`} className="animate-pulse">
                    {columns.map((col) => (
                      <td
                        key={`skeleton-cell-${col.key}-${rowIdx}`}
                        className={cn("px-4 py-4", col.className)}
                      >
                        <div className="h-4 bg-neutral-800/60 rounded-md w-3/4" />
                      </td>
                    ))}
                  </tr>
                )
              )
            ) : data.length === 0 ? (
              // Empty State
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-16 text-center text-[var(--theme-muted)]"
                >
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-800/50 border border-[var(--theme-border-color)] text-neutral-400 shadow-inner">
                      <Inbox className="h-7 w-7" />
                    </div>
                    <p className="text-base font-semibold text-[var(--theme-foreground)]">
                      {emptyMessage}
                    </p>
                    <p className="text-xs text-[var(--theme-muted)] max-w-sm">
                      {emptySubtitle}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              // Data Rows
              data.map((row, index) => {
                const key = keyExtractor(row);
                return (
                  <tr
                    key={key}
                    onClick={() => onRowClick?.(row)}
                    className={cn(
                      "transition-colors duration-150 hover:bg-neutral-800/40",
                      onRowClick && "cursor-pointer active:bg-neutral-800/60"
                    )}
                  >
                    {columns.map((col) => (
                      <td
                        key={`${key}-${col.key}`}
                        className={cn(
                          "px-4 py-3.5 text-right text-[var(--theme-foreground)] align-middle",
                          col.className
                        )}
                      >
                        {col.cell(row, index)}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* =========================================================================
          Mobile Card View (< md)
         ========================================================================= */}
      <div className="block md:hidden p-3.5 sm:p-4 space-y-3">
        {isLoading ? (
          // Mobile Loading Skeleton Cards
          Array.from({ length: 3 }).map((_, idx) => (
            <div
              key={`mobile-skeleton-${idx}`}
              className="rounded-xl border border-[var(--theme-border-color)] bg-[var(--theme-surface-alt)]/40 p-4 space-y-3 animate-pulse"
            >
              <div className="h-4 bg-neutral-800/70 rounded w-1/2" />
              <div className="space-y-2">
                <div className="h-3 bg-neutral-800/50 rounded w-full" />
                <div className="h-3 bg-neutral-800/50 rounded w-4/5" />
                <div className="h-3 bg-neutral-800/50 rounded w-2/3" />
              </div>
            </div>
          ))
        ) : data.length === 0 ? (
          // Mobile Empty State
          <div className="flex flex-col items-center justify-center py-12 px-4 text-center space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-800/50 border border-[var(--theme-border-color)] text-neutral-400">
              <Inbox className="h-6 w-6" />
            </div>
            <p className="text-sm font-semibold text-[var(--theme-foreground)]">
              {emptyMessage}
            </p>
            <p className="text-xs text-[var(--theme-muted)] max-w-xs">
              {emptySubtitle}
            </p>
          </div>
        ) : (
          // Mobile Data Cards
          data.map((row, index) => {
            const key = keyExtractor(row);
            if (mobileCardRenderer) {
              return (
                <div
                  key={`custom-mobile-${key}`}
                  onClick={() => onRowClick?.(row)}
                  className={cn(
                    "transition-all",
                    onRowClick && "cursor-pointer active:scale-[0.99]"
                  )}
                >
                  {mobileCardRenderer(row)}
                </div>
              );
            }

            // Default Stacked Card Renderer
            const visibleColumns = columns.filter((col) => !col.hideOnMobile);
            return (
              <div
                key={`mobile-card-${key}`}
                onClick={() => onRowClick?.(row)}
                className={cn(
                  "rounded-2xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] p-4 space-y-3 transition-all duration-150 shadow-xs",
                  onRowClick &&
                    "cursor-pointer hover:border-emerald-500/30 active:scale-[0.99] active:bg-neutral-800/40"
                )}
              >
                {visibleColumns.map((col, cIdx) => (
                  <div
                    key={`mobile-col-${key}-${col.key}`}
                    className={cn(
                      "text-xs gap-3",
                      cIdx === 0
                        ? "pb-2.5 border-b border-[var(--theme-border-color)]/60"
                        : "flex items-center justify-between"
                    )}
                  >
                    {cIdx === 0 ? (
                      <div className="w-full text-right">
                        {col.cell(row, index)}
                      </div>
                    ) : (
                      <>
                        <span className="text-[var(--theme-muted)] font-medium shrink-0">
                          {col.header}:
                        </span>
                        <div className="text-[var(--theme-foreground)] text-right font-medium">
                          {col.cell(row, index)}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            );
          })
        )}
      </div>

      {/* =========================================================================
          Footer Pagination Bar
         ========================================================================= */}
      {hasPagination && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3.5 border-t border-[var(--theme-border-color)] bg-[var(--theme-surface-alt)]/40 text-xs">
          {/* Summary Text (Persian Localization) */}
          <div className="text-[var(--theme-muted)] font-medium select-none">
            صفحه <span className="text-[var(--theme-foreground)] font-mono">{toPersianDigits(currentPage)}</span> از{" "}
            <span className="text-[var(--theme-foreground)] font-mono">{toPersianDigits(totalPages)}</span> — کل:{" "}
            <span className="text-[var(--theme-foreground)] font-mono">{toPersianDigits(total)}</span> رکورد
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5">
            {/* Previous Page (RTL: Forward arrow is Left, Back arrow is Right) */}
            <button
              type="button"
              onClick={() => onPageChange?.(currentPage - 1)}
              disabled={currentPage <= 1 || isLoading}
              className={cn(
                "inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[var(--theme-border-color)] bg-[var(--theme-surface)] text-[var(--theme-foreground)] font-medium transition-all duration-150 active:scale-[0.97]",
                "hover:bg-neutral-800 hover:border-neutral-700 disabled:pointer-events-none disabled:opacity-40"
              )}
            >
              <ChevronRight className="h-3.5 w-3.5" />
              <span>قبلی</span>
            </button>

            {/* Quick Page Indicator Pills for Desktop */}
            <div className="hidden sm:flex items-center gap-1 px-1">
              {Array.from({ length: Math.min(5, totalPages) }).map((_, idx) => {
                // Calculate display page number centered around current page
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
                    key={`page-pill-${pageNumber}`}
                    type="button"
                    onClick={() => onPageChange?.(pageNumber)}
                    disabled={isLoading}
                    className={cn(
                      "h-7 min-w-7 px-2 rounded-lg text-xs font-mono font-medium transition-all active:scale-[0.97]",
                      isActive
                        ? "bg-emerald-600 text-white font-bold shadow-sm shadow-emerald-600/30"
                        : "text-[var(--theme-muted)] hover:text-[var(--theme-foreground)] hover:bg-neutral-800"
                    )}
                  >
                    {toPersianDigits(pageNumber)}
                  </button>
                );
              })}
            </div>

            {/* Next Page */}
            <button
              type="button"
              onClick={() => onPageChange?.(currentPage + 1)}
              disabled={currentPage >= totalPages || isLoading}
              className={cn(
                "inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[var(--theme-border-color)] bg-[var(--theme-surface)] text-[var(--theme-foreground)] font-medium transition-all duration-150 active:scale-[0.97]",
                "hover:bg-neutral-800 hover:border-neutral-700 disabled:pointer-events-none disabled:opacity-40"
              )}
            >
              <span>بعدی</span>
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
