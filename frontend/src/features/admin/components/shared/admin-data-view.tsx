"use client";

import * as React from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  Inbox,
  LayoutGrid,
  List as ListIcon,
  Table as TableIcon,
} from "lucide-react";
import { cn, toPersianDigits } from "@/shared/lib/utils";
import type { AdminColumnDef } from "./admin-data-table";
export type { AdminColumnDef };

export type AdminDataViewMode = "cards" | "list" | "table";

export interface AdminDataViewProps<T> {
  data: T[];
  columns: AdminColumnDef<T>[];
  keyExtractor: (item: T, index?: number) => string;
  isLoading?: boolean;
  emptyMessage?: string;
  emptySubtitle?: string;
  // Sorting
  sortColumn?: string;
  sortDirection?: "asc" | "desc";
  onSort?: (columnKey: string) => void;
  // Pagination & Page Size Selection
  pageSize?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  totalItems?: number;
  // View mode
  defaultViewMode?: AdminDataViewMode;
  allowedViewModes?: AdminDataViewMode[];
  showViewModeToggle?: boolean;
  storageKey?: string;
  // Row interaction
  onRowClick?: (row: T) => void;
  rowClassName?: (row: T) => string;
  // Custom Card View customization
  cardRenderer?: (row: T, index: number) => React.ReactNode;
  mobileCardRenderer?: (row: T) => React.ReactNode;
  className?: string;
}

function getNestedValue(obj: unknown, path: string): unknown {
  if (!obj || !path) return undefined;
  if (path.includes(".")) {
    const parts = path.split(".");
    let curr: unknown = obj;
    for (const p of parts) {
      if (curr == null || typeof curr !== "object") return undefined;
      curr = (curr as Record<string, unknown>)[p];
    }
    return curr;
  }
  return (obj as Record<string, unknown>)[path];
}

export function AdminDataView<T>({
  data,
  columns,
  keyExtractor,
  isLoading = false,
  emptyMessage = "هیچ رکوردی یافت نشد",
  emptySubtitle = "فیلترها را تغییر دهید یا جستجوی دیگری را امتحان کنید",
  sortColumn,
  sortDirection,
  onSort,
  pageSize: controlledPageSize,
  currentPage = 1,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
  totalItems,
  defaultViewMode = "cards",
  allowedViewModes = ["cards", "list", "table"],
  showViewModeToggle = true,
  storageKey = "admin_data_view_mode_pref",
  onRowClick,
  rowClassName,
  cardRenderer,
  mobileCardRenderer,
  className,
}: AdminDataViewProps<T>) {
  // Local state for view mode
  const [viewMode, setViewMode] = React.useState<AdminDataViewMode>(defaultViewMode);

  // Restore stored view preference on client safely after mount (avoids hydration mismatch)
  React.useEffect(() => {
    if (typeof window !== "undefined" && storageKey) {
      try {
        const saved = window.localStorage.getItem(storageKey) as AdminDataViewMode | null;
        if (saved && allowedViewModes.includes(saved)) {
          setViewMode(saved);
        }
      } catch {
        // Ignore localStorage restrictions
      }
    }
  }, [storageKey, allowedViewModes]);

  const changeViewMode = (newMode: AdminDataViewMode) => {
    setViewMode(newMode);
    if (typeof window !== "undefined" && storageKey) {
      try {
        window.localStorage.setItem(storageKey, newMode);
      } catch {
        // Ignore
      }
    }
  };

  // Local state for internal page size if uncontrolled
  const [internalPageSize, setInternalPageSize] = React.useState<number>(
    controlledPageSize || 10
  );

  const effectivePageSize = controlledPageSize || internalPageSize || 10;

  // Local state for uncontrolled sorting
  const [internalSortCol, setInternalSortCol] = React.useState<string | undefined>(sortColumn);
  const [internalSortDir, setInternalSortDir] = React.useState<"asc" | "desc">(sortDirection || "asc");

  const effectiveSortCol = sortColumn !== undefined ? sortColumn : internalSortCol;
  const effectiveSortDir = sortDirection !== undefined ? sortDirection : internalSortDir;

  const handleHeaderSort = (colKey: string) => {
    if (onSort) {
      onSort(colKey);
    } else {
      if (internalSortCol === colKey) {
        setInternalSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
      } else {
        setInternalSortCol(colKey);
        setInternalSortDir("asc");
      }
    }
  };

  // Uncontrolled sorting logic (when onSort is not provided)
  const sortedData = React.useMemo(() => {
    if (onSort || !effectiveSortCol) {
      return data;
    }
    return [...data].sort((a, b) => {
      const valA = getNestedValue(a, effectiveSortCol);
      const valB = getNestedValue(b, effectiveSortCol);

      if (valA === valB) return 0;
      if (valA == null) return 1;
      if (valB == null) return -1;

      let comparison = 0;
      if (typeof valA === "number" && typeof valB === "number") {
        comparison = valA - valB;
      } else if (typeof valA === "boolean" && typeof valB === "boolean") {
        comparison = valA === valB ? 0 : valA ? 1 : -1;
      } else {
        comparison = String(valA).localeCompare(String(valB), "fa");
      }

      return effectiveSortDir === "asc" ? comparison : -comparison;
    });
  }, [data, onSort, effectiveSortCol, effectiveSortDir]);

  // Calculate pagination statistics
  const total = totalItems !== undefined ? totalItems : sortedData.length;
  const totalPages = Math.max(1, Math.ceil(total / effectivePageSize));
  const hasPagination = Boolean(total > 0 && (onPageChange || sortedData.length > effectivePageSize));

  // Determine if parent is passing sliced data or full data
  const displayData = React.useMemo(() => {
    if (totalItems !== undefined) {
      // Controlled pagination where parent already slices
      return sortedData;
    }
    if (sortedData.length > effectivePageSize) {
      const startIndex = (Math.max(1, currentPage) - 1) * effectivePageSize;
      return sortedData.slice(startIndex, startIndex + effectivePageSize);
    }
    return sortedData;
  }, [sortedData, totalItems, effectivePageSize, currentPage]);

  const handlePageSizeChange = (newSize: number) => {
    if (onPageSizeChange) {
      onPageSizeChange(newSize);
    } else {
      setInternalPageSize(newSize);
    }
    // Adjust current page if out of bounds
    const newTotalPages = Math.max(1, Math.ceil(total / newSize));
    if (currentPage > newTotalPages && onPageChange) {
      onPageChange(newTotalPages);
    }
  };

  // Robust column classification
  const selectColumn = columns.find(
    (col) =>
      col.key.toLowerCase() === "select" ||
      col.key.toLowerCase() === "selection" ||
      col.key.toLowerCase() === "checkbox"
  );

  const actionColumn = columns.find(
    (col) =>
      col.key.toLowerCase() === "actions" ||
      col.key.toLowerCase() === "action" ||
      col.key.toLowerCase() === "operations" ||
      col.key.toLowerCase() === "operation" ||
      (typeof col.header === "string" && col.header.trim() === "عملیات")
  );

  // The primary column represents the core entity name/title (first non-select, non-action column)
  const primaryColumn = columns.find(
    (col) => col !== selectColumn && col !== actionColumn
  );

  // All other detail columns
  const detailColumns = columns.filter(
    (col) => col !== selectColumn && col !== actionColumn && col !== primaryColumn
  );

  const sortableColumns = columns.filter((col) => col.sortable);

  // Record range info for footer
  const startRecord = total > 0 ? (currentPage - 1) * effectivePageSize + 1 : 0;
  const endRecord = total > 0 ? Math.min(currentPage * effectivePageSize, total) : 0;

  return (
    <div
      dir="rtl"
      className={cn(
        "w-full rounded-2xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] shadow-xs overflow-hidden flex flex-col transition-all",
        className
      )}
    >
      {/* =========================================================================
          Toolbar: View Mode Switcher & Quick Sorting Bar (for Cards & List)
         ========================================================================= */}
      {(showViewModeToggle || sortableColumns.length > 0) && (
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-[var(--theme-border-color)] bg-[var(--theme-surface-alt)]/50 backdrop-blur-xs">
          {/* Quick Sort Options for Cards/List */}
          {viewMode !== "table" && sortableColumns.length > 0 ? (
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-[var(--theme-muted)] font-medium select-none ml-1">
                مرتب‌سازی:
              </span>
              {sortableColumns.map((col) => {
                const isSorted = effectiveSortCol === col.key;
                return (
                  <button
                    key={`sort-btn-${col.key}`}
                    type="button"
                    onClick={() => handleHeaderSort(col.key)}
                    className={cn(
                      "inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-150 active:scale-[0.97] cursor-pointer",
                      isSorted
                        ? "bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 shadow-xs"
                        : "bg-[var(--theme-surface)] border border-[var(--theme-border-color)] text-[var(--theme-muted)] hover:text-[var(--theme-foreground)] hover:border-neutral-700"
                    )}
                  >
                    <span>{typeof col.header === "string" ? col.header : col.key}</span>
                    {isSorted ? (
                      effectiveSortDir === "asc" ? (
                        <ChevronUp className="h-3 w-3 text-emerald-400 shrink-0" />
                      ) : (
                        <ChevronDown className="h-3 w-3 text-emerald-400 shrink-0" />
                      )
                    ) : (
                      <ArrowUpDown className="h-2.5 w-2.5 opacity-40 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="text-xs text-[var(--theme-muted)] font-medium">
              تعداد کل:{" "}
              <span className="text-[var(--theme-foreground)] font-mono font-bold">
                {toPersianDigits(total)}
              </span>{" "}
              مورد
            </div>
          )}

          {/* View Mode Toggle Buttons */}
          {showViewModeToggle && allowedViewModes.length > 1 && (
            <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-[var(--theme-border-color)] mr-auto">
              {allowedViewModes.includes("cards") && (
                <button
                  type="button"
                  onClick={() => changeViewMode("cards")}
                  title="نمایش کارت‌های مدرن"
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer",
                    viewMode === "cards"
                      ? "bg-emerald-600 text-white shadow-xs font-bold"
                      : "text-[var(--theme-muted)] hover:text-white"
                  )}
                >
                  <LayoutGrid className="h-3.5 w-3.5 shrink-0" />
                  <span className="hidden sm:inline">کارت‌ها</span>
                </button>
              )}

              {allowedViewModes.includes("list") && (
                <button
                  type="button"
                  onClick={() => changeViewMode("list")}
                  title="نمایش فهرست نواری"
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer",
                    viewMode === "list"
                      ? "bg-emerald-600 text-white shadow-xs font-bold"
                      : "text-[var(--theme-muted)] hover:text-white"
                  )}
                >
                  <ListIcon className="h-3.5 w-3.5 shrink-0" />
                  <span className="hidden sm:inline">فهرست</span>
                </button>
              )}

              {allowedViewModes.includes("table") && (
                <button
                  type="button"
                  onClick={() => changeViewMode("table")}
                  title="نمایش جدول کلاسیک"
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer",
                    viewMode === "table"
                      ? "bg-emerald-600 text-white shadow-xs font-bold"
                      : "text-[var(--theme-muted)] hover:text-white"
                  )}
                >
                  <TableIcon className="h-3.5 w-3.5 shrink-0" />
                  <span className="hidden sm:inline">جدول</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          Content Body (Cards, List, or Table)
         ========================================================================= */}
      <div className="flex-1 min-h-0">
        {isLoading ? (
          // Loading Skeletons
          <div className="p-4 sm:p-5 space-y-4">
            {viewMode === "cards" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <div
                    key={`skeleton-card-${idx}`}
                    className="rounded-2xl border border-[var(--theme-border-color)] bg-[var(--theme-surface-alt)]/30 p-4 space-y-3.5 animate-pulse"
                  >
                    <div className="flex items-center justify-between">
                      <div className="h-4 bg-neutral-800 rounded w-1/2" />
                      <div className="h-4 bg-neutral-800 rounded w-16" />
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <div className="h-3 bg-neutral-800/60 rounded w-full" />
                      <div className="h-3 bg-neutral-800/60 rounded w-3/4" />
                    </div>
                    <div className="h-8 bg-neutral-800/40 rounded-xl w-full" />
                  </div>
                ))}
              </div>
            ) : (
              Array.from({ length: 5 }).map((_, idx) => (
                <div
                  key={`skeleton-list-${idx}`}
                  className="rounded-xl border border-[var(--theme-border-color)] bg-[var(--theme-surface-alt)]/30 p-4 animate-pulse flex items-center justify-between"
                >
                  <div className="h-4 bg-neutral-800 rounded w-1/3" />
                  <div className="h-4 bg-neutral-800 rounded w-1/4" />
                  <div className="h-8 bg-neutral-800/60 rounded-lg w-20" />
                </div>
              ))
            )}
          </div>
        ) : displayData.length === 0 ? (
          // Empty State
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center space-y-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-800/50 border border-[var(--theme-border-color)] text-neutral-400 shadow-inner">
              <Inbox className="h-8 w-8" />
            </div>
            <p className="text-base font-bold text-[var(--theme-foreground)]">
              {emptyMessage}
            </p>
            <p className="text-xs text-[var(--theme-muted)] max-w-sm">
              {emptySubtitle}
            </p>
          </div>
        ) : viewMode === "cards" ? (
          /* =====================================================================
             VIEW MODE 1: MODERN CARDS (Default & Recommended)
             No horizontal scroll! Badges, details & actions clearly visible.
             ===================================================================== */
          <div className="p-4 sm:p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4">
              {displayData.map((row, index) => {
                const key = keyExtractor(row, index);

                // If a custom card renderer was provided, use it
                if (cardRenderer) {
                  return (
                    <div
                      key={`card-item-${key}`}
                      onClick={() => onRowClick?.(row)}
                      className={cn(
                        "transition-all",
                        onRowClick && "cursor-pointer active:scale-[0.99]",
                        rowClassName?.(row)
                      )}
                    >
                      {cardRenderer(row, index)}
                    </div>
                  );
                }

                const standardCardContent = (
                  <div
                    onClick={() => onRowClick?.(row)}
                    className={cn(
                      "group rounded-2xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)]/80 hover:bg-[var(--theme-surface)] flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-md hover:border-emerald-500/40 transition-all duration-200 h-full min-w-0 w-full",
                      onRowClick && "cursor-pointer active:scale-[0.995]",
                      rowClassName?.(row)
                    )}
                  >
                    {/* Card Header: Checkbox + Primary Identifier */}
                    {(primaryColumn || selectColumn) && (
                      <div className="p-4 pb-3 border-b border-[var(--theme-border-color)]/60 bg-[var(--theme-surface-alt)]/25 flex items-center justify-between gap-3 min-w-0 overflow-hidden">
                        <div className="flex items-center gap-2.5 min-w-0 flex-1 overflow-hidden">
                          {selectColumn && (
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className="shrink-0"
                            >
                              {selectColumn.cell(row, index)}
                            </div>
                          )}
                          {primaryColumn && (
                            <div className="text-right font-semibold text-sm text-[var(--theme-foreground)] min-w-0 flex-1 overflow-hidden">
                              {primaryColumn.cell(row, index)}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Card Body: Multi-column detail fields without fixed-width leakage */}
                    <div className="p-4 flex-1 min-w-0 overflow-hidden">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3.5 text-xs min-w-0">
                        {detailColumns.map((col) => {
                          const isSpanFull = col.cardSpan === 2;
                          return (
                            <div
                              key={`card-detail-${key}-${col.key}`}
                              className={cn(
                                "flex flex-col gap-1 text-right min-w-0 overflow-hidden",
                                isSpanFull && "col-span-full sm:col-span-2"
                              )}
                            >
                              <span className="text-[11px] font-medium text-[var(--theme-muted)] tracking-tight select-none truncate block">
                                {typeof col.header === "string" ? col.header : col.header}
                              </span>
                              <div className="text-[var(--theme-foreground)] font-medium text-xs break-words min-w-0 overflow-hidden">
                                {col.cell(row, index)}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Card Footer: Always visible Action Buttons with smooth scroll */}
                    {actionColumn && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="p-3 px-4 border-t border-[var(--theme-border-color)]/60 bg-[var(--theme-surface-alt)]/35 flex items-center justify-end gap-2 min-w-0 overflow-hidden"
                      >
                        <div className="min-w-0 w-full flex items-center justify-end overflow-x-auto py-0.5">
                          {actionColumn.cell(row, index)}
                        </div>
                      </div>
                    )}
                  </div>
                );

                if (mobileCardRenderer) {
                  return (
                    <div key={`card-responsive-${key}`}>
                      {/* Mobile view */}
                      <div className="block md:hidden">
                        <div
                          onClick={() => onRowClick?.(row)}
                          className={cn(
                            "transition-all",
                            onRowClick && "cursor-pointer active:scale-[0.99]",
                            rowClassName?.(row)
                          )}
                        >
                          {mobileCardRenderer(row)}
                        </div>
                      </div>
                      {/* Desktop / Tablet view */}
                      <div className="hidden md:block h-full">
                        {standardCardContent}
                      </div>
                    </div>
                  );
                }

                // Default Rich Card Structure
                return (
                  <div key={`card-auto-${key}`} className="h-full">
                    {standardCardContent}
                  </div>
                );
              })}
            </div>
          </div>
        ) : viewMode === "list" ? (
          /* =====================================================================
             VIEW MODE 2: MODERN STRUCTURED LIST (2-Tier Executive Layout)
             Tier 1: Checkbox + Primary Identifier (Title/Code/Tags) on right,
                     Action Buttons pinned on left.
             Tier 2: Generous, spacious Metadata Attributes Grid (100% full width)
                     Never cramped or squished, labels and values clearly legible.
             ===================================================================== */
          <div className="p-4 sm:p-5 space-y-3.5">
            {displayData.map((row, index) => {
              const key = keyExtractor(row, index);
              const detailCount = detailColumns.length;
              return (
                <div
                  key={`list-item-${key}`}
                  onClick={() => onRowClick?.(row)}
                  className={cn(
                    "group rounded-2xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)]/80 hover:bg-[var(--theme-surface)] p-4 sm:p-5 flex flex-col gap-3.5 shadow-xs hover:shadow-md hover:border-emerald-500/40 transition-all duration-200 min-w-0",
                    onRowClick && "cursor-pointer active:scale-[0.995]",
                    rowClassName?.(row)
                  )}
                >
                  {/* Tier 1: Primary Entity Header & Pinned Actions */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-w-0">
                    {/* Primary Identifier + Checkbox */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {selectColumn && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="shrink-0"
                        >
                          {selectColumn.cell(row, index)}
                        </div>
                      )}
                      {primaryColumn && (
                        <div className="min-w-0 flex-1 text-right">
                          {primaryColumn.cell(row, index)}
                        </div>
                      )}
                    </div>

                    {/* Pinned Action Buttons */}
                    {actionColumn && (
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="shrink-0 flex items-center justify-end gap-2 border-t sm:border-t-0 pt-2.5 sm:pt-0 border-[var(--theme-border-color)]/50"
                      >
                        {actionColumn.cell(row, index)}
                      </div>
                    )}
                  </div>

                  {/* Tier 2: Metadata Attributes Grid (Full Width, Spacious, Beautiful) */}
                  {detailColumns.length > 0 && (
                    <div
                      className={cn(
                        "pt-3.5 border-t border-[var(--theme-border-color)]/60 grid gap-x-5 gap-y-3 text-xs min-w-0 items-start",
                        detailCount <= 2 && "grid-cols-1 sm:grid-cols-2",
                        detailCount === 3 && "grid-cols-1 sm:grid-cols-3",
                        detailCount === 4 && "grid-cols-2 sm:grid-cols-4",
                        detailCount === 5 && "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5",
                        detailCount >= 6 && "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6"
                      )}
                    >
                      {detailColumns.map((col) => {
                        const isSpanFull = col.cardSpan === 2;
                        return (
                          <div
                            key={`list-col-${key}-${col.key}`}
                            className={cn(
                              "flex flex-col gap-1 text-right min-w-0 overflow-hidden",
                              isSpanFull && "col-span-2 sm:col-span-2"
                            )}
                          >
                            <span className="text-[11px] text-[var(--theme-muted)] font-medium select-none truncate block">
                              {typeof col.header === "string" ? col.header : col.header}
                            </span>
                            <div className="text-[var(--theme-foreground)] font-medium text-xs min-w-0">
                              {col.cell(row, index)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          /* =====================================================================
             VIEW MODE 3: CLASSIC TABLE (With sticky actions & modern styling)
             ===================================================================== */
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse text-right text-sm">
              <thead className="bg-[var(--theme-surface-alt)]/90 border-b border-[var(--theme-border-color)] sticky top-0 z-10">
                <tr>
                  {columns.map((col) => {
                    const isSorted = effectiveSortCol === col.key;
                    const isActionCol =
                      col.key.toLowerCase() === "actions" ||
                      col.key.toLowerCase() === "action" ||
                      col.key.toLowerCase() === "operations" ||
                      col.key.toLowerCase() === "operation" ||
                      (typeof col.header === "string" && col.header.trim() === "عملیات");
                    return (
                      <th
                        key={col.key}
                        scope="col"
                        onClick={() => col.sortable && handleHeaderSort(col.key)}
                        className={cn(
                          "px-4 py-3.5 text-xs font-semibold text-[var(--theme-muted)] tracking-wider select-none whitespace-nowrap",
                          col.sortable &&
                            "cursor-pointer hover:text-[var(--theme-foreground)] hover:bg-neutral-800/30 transition-colors",
                          isActionCol && "sticky left-0 bg-[var(--theme-surface-alt)] shadow-[-4px_0_10px_rgba(0,0,0,0.2)]",
                          col.className
                        )}
                      >
                        <div className="inline-flex items-center gap-1.5">
                          <span>{col.header}</span>
                          {col.sortable && (
                            <span className="shrink-0 text-neutral-500">
                              {isSorted ? (
                                effectiveSortDir === "asc" ? (
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
              <tbody className="divide-y divide-[var(--theme-border-color)]/60">
                {displayData.map((row, index) => {
                  const key = keyExtractor(row, index);
                  return (
                    <tr
                      key={key}
                      onClick={() => onRowClick?.(row)}
                      className={cn(
                        "transition-colors duration-150 hover:bg-neutral-800/40",
                        onRowClick && "cursor-pointer active:bg-neutral-800/60",
                        rowClassName?.(row)
                      )}
                    >
                      {columns.map((col) => {
                        const isActionCol =
                          col.key.toLowerCase() === "actions" ||
                          col.key.toLowerCase() === "action" ||
                          col.key.toLowerCase() === "operations" ||
                          col.key.toLowerCase() === "operation" ||
                          (typeof col.header === "string" && col.header.trim() === "عملیات");
                        return (
                          <td
                            key={`${key}-${col.key}`}
                            className={cn(
                              "px-4 py-3.5 text-right text-[var(--theme-foreground)] align-middle",
                              isActionCol && "sticky left-0 bg-[var(--theme-surface)] shadow-[-4px_0_10px_rgba(0,0,0,0.2)]",
                              col.className
                            )}
                          >
                            {col.cell(row, index)}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* =========================================================================
          Footer: Page Size Selector & Pagination Bar
         ========================================================================= */}
      {hasPagination && (
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-4 py-3.5 border-t border-[var(--theme-border-color)] bg-[var(--theme-surface-alt)]/50 text-xs">
          {/* Summary & Page Size Controls */}
          <div className="flex flex-wrap items-center gap-4 select-none">
            {/* Range info */}
            <div className="text-[var(--theme-muted)] font-medium">
              نمایش{" "}
              <span className="text-[var(--theme-foreground)] font-mono font-bold">
                {toPersianDigits(startRecord)}
              </span>{" "}
              تا{" "}
              <span className="text-[var(--theme-foreground)] font-mono font-bold">
                {toPersianDigits(endRecord)}
              </span>{" "}
              از{" "}
              <span className="text-[var(--theme-foreground)] font-mono font-bold">
                {toPersianDigits(total)}
              </span>{" "}
              رکورد
            </div>

            {/* Page Size Selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-[var(--theme-muted)] text-[11px]">
                تعداد در صفحه:
              </span>
              <div className="flex items-center gap-1 bg-black/40 p-0.5 rounded-lg border border-[var(--theme-border-color)]">
                {pageSizeOptions.map((opt) => (
                  <button
                    key={`opt-size-${opt}`}
                    type="button"
                    onClick={() => handlePageSizeChange(opt)}
                    className={cn(
                      "px-2 py-0.5 rounded-md text-[11px] font-mono font-medium transition-all active:scale-[0.97] cursor-pointer",
                      effectivePageSize === opt
                        ? "bg-emerald-600 text-white font-bold shadow-xs shadow-emerald-600/30"
                        : "text-[var(--theme-muted)] hover:text-[var(--theme-foreground)] hover:bg-neutral-800/80"
                    )}
                  >
                    {toPersianDigits(opt)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Pagination Navigation Buttons */}
          <div className="flex items-center gap-1">
            {/* First Page */}
            <button
              type="button"
              onClick={() => onPageChange?.(1)}
              disabled={currentPage <= 1 || isLoading}
              title="صفحه اول"
              className={cn(
                "p-1.5 rounded-lg border border-[var(--theme-border-color)] bg-[var(--theme-surface)] text-[var(--theme-foreground)] transition-all cursor-pointer",
                "hover:bg-neutral-800 disabled:pointer-events-none disabled:opacity-40"
              )}
            >
              <ChevronsRight className="h-3.5 w-3.5" />
            </button>

            {/* Previous Page */}
            <button
              type="button"
              onClick={() => onPageChange?.(currentPage - 1)}
              disabled={currentPage <= 1 || isLoading}
              className={cn(
                "inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[var(--theme-border-color)] bg-[var(--theme-surface)] text-[var(--theme-foreground)] font-medium transition-all cursor-pointer",
                "hover:bg-neutral-800 disabled:pointer-events-none disabled:opacity-40"
              )}
            >
              <ChevronRight className="h-3.5 w-3.5" />
              <span>قبلی</span>
            </button>

            {/* Numeric Page Indicator Pills */}
            <div className="hidden sm:flex items-center gap-1 px-1">
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
                    key={`page-num-${pageNumber}`}
                    type="button"
                    onClick={() => onPageChange?.(pageNumber)}
                    disabled={isLoading}
                    className={cn(
                      "h-7 min-w-7 px-2 rounded-lg text-xs font-mono font-medium transition-all active:scale-[0.97] cursor-pointer",
                      isActive
                        ? "bg-emerald-600 text-white font-bold shadow-xs shadow-emerald-600/30"
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
                "inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[var(--theme-border-color)] bg-[var(--theme-surface)] text-[var(--theme-foreground)] font-medium transition-all cursor-pointer",
                "hover:bg-neutral-800 disabled:pointer-events-none disabled:opacity-40"
              )}
            >
              <span>بعدی</span>
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>

            {/* Last Page */}
            <button
              type="button"
              onClick={() => onPageChange?.(totalPages)}
              disabled={currentPage >= totalPages || isLoading}
              title="صفحه آخر"
              className={cn(
                "p-1.5 rounded-lg border border-[var(--theme-border-color)] bg-[var(--theme-surface)] text-[var(--theme-foreground)] transition-all cursor-pointer",
                "hover:bg-neutral-800 disabled:pointer-events-none disabled:opacity-40"
              )}
            >
              <ChevronsLeft className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
