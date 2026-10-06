"use client";

import * as React from "react";
import { Search, X, Download, Loader2 } from "lucide-react";
import { cn, toPersianDigits } from "@/shared/lib/utils";

export interface FilterTabOption {
  id: string;
  label: string;
  count?: number;
  badgeVariant?: "default" | "orange" | "emerald" | "sky" | "purple" | "rose";
}

export interface AdminFilterToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  // Primary status tabs
  statusTabs?: FilterTabOption[];
  activeStatusTab?: string;
  onStatusTabChange?: (statusId: string) => void;
  // Secondary toggle (e.g. B2B vs Retail, Urgency)
  secondaryFilters?: React.ReactNode;
  // Actions
  onExport?: () => void;
  exportLabel?: string;
  isExporting?: boolean;
  customActionSlot?: React.ReactNode;
  className?: string;
}

export function AdminFilterToolbar({
  searchQuery,
  onSearchChange,
  searchPlaceholder = "جستجو در رکوردها...",
  statusTabs,
  activeStatusTab,
  onStatusTabChange,
  secondaryFilters,
  onExport,
  exportLabel = "خروجی اکسل",
  isExporting = false,
  customActionSlot,
  className,
}: AdminFilterToolbarProps) {
  // Local state for debounced search input
  const [prevSearchQuery, setPrevSearchQuery] = React.useState(searchQuery);
  const [inputValue, setInputValue] = React.useState(searchQuery);

  // Sync internal state if external searchQuery prop changes (standard React pattern)
  if (prevSearchQuery !== searchQuery) {
    setPrevSearchQuery(searchQuery);
    setInputValue(searchQuery);
  }

  // 300ms debounce effect
  React.useEffect(() => {
    const handler = setTimeout(() => {
      if (inputValue !== searchQuery) {
        onSearchChange(inputValue);
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [inputValue, searchQuery, onSearchChange]);

  const handleClearSearch = () => {
    setInputValue("");
    onSearchChange("");
  };

  const getInactiveBadgeClasses = (
    variant?: "default" | "orange" | "emerald" | "sky" | "purple" | "rose"
  ) => {
    switch (variant) {
      case "emerald":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "orange":
        return "bg-orange-500/10 text-orange-400 border-orange-500/20";
      case "sky":
        return "bg-sky-500/10 text-sky-400 border-sky-500/20";
      case "purple":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      case "rose":
        return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      default:
        return "bg-neutral-800/80 text-neutral-300 border-neutral-700/60";
    }
  };

  const getActiveTabClasses = (
    variant?: "default" | "orange" | "emerald" | "sky" | "purple" | "rose"
  ) => {
    if (variant === "orange") {
      return "bg-orange-500 text-white shadow-md shadow-orange-500/25";
    }
    return "bg-emerald-600 text-white shadow-md shadow-emerald-600/25";
  };

  return (
    <div
      dir="rtl"
      className={cn(
        "w-full space-y-4 rounded-2xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] p-4 sm:p-5 shadow-sm",
        className
      )}
    >
      {/* Top Row: Status Filter Tabs & Action Buttons */}
      {(statusTabs || onExport || customActionSlot) && (
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Status Tabs */}
          {statusTabs && statusTabs.length > 0 && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none text-xs select-none">
              {statusTabs.map((tab) => {
                const isActive = activeStatusTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => onStatusTabChange?.(tab.id)}
                    className={cn(
                      "inline-flex items-center gap-2 whitespace-nowrap rounded-xl px-3.5 py-2 font-medium transition-all duration-150 active:scale-[0.97] cursor-pointer",
                      isActive
                        ? getActiveTabClasses(tab.badgeVariant)
                        : "bg-[var(--theme-surface-alt)]/60 text-[var(--theme-muted)] border border-[var(--theme-border-color)] hover:bg-[var(--theme-surface-alt)] hover:text-[var(--theme-foreground)] hover:border-neutral-700"
                    )}
                  >
                    <span>{tab.label}</span>
                    {tab.count !== undefined && (
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[11px] font-mono border tabular-nums transition-colors",
                          isActive
                            ? "bg-white/20 text-white border-white/20 font-bold"
                            : getInactiveBadgeClasses(tab.badgeVariant)
                        )}
                      >
                        {toPersianDigits(tab.count)}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Action Slots: Export and Custom Actions */}
          <div className="flex items-center gap-2 shrink-0 self-end lg:self-auto">
            {customActionSlot}

            {onExport && (
              <button
                type="button"
                onClick={onExport}
                disabled={isExporting}
                className={cn(
                  "inline-flex items-center gap-2 rounded-xl border border-[var(--theme-border-color)] bg-[var(--theme-surface-alt)]/60 px-3.5 py-2 text-xs font-medium text-[var(--theme-foreground)] transition-all duration-150 cursor-pointer active:scale-[0.97]",
                  "hover:bg-[var(--theme-surface-alt)] hover:border-emerald-500/40 hover:text-emerald-400 disabled:pointer-events-none disabled:opacity-50"
                )}
              >
                {isExporting ? (
                  <Loader2 className="h-4 w-4 animate-spin text-emerald-400" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                <span>{exportLabel}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Bottom Row: Search Input & Secondary Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
        {/* Search Input Box */}
        <div className="relative flex-1 min-w-[240px]">
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-neutral-400">
            <Search className="h-4 w-4" />
          </div>

          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={searchPlaceholder}
            className={cn(
              "w-full rounded-xl border border-[var(--theme-border-color)] bg-[var(--theme-surface-alt)]/80 py-2.5 pr-10 pl-10 text-xs sm:text-sm text-[var(--theme-foreground)] placeholder:text-neutral-500",
              "transition-all duration-150 focus:border-emerald-500/50 focus:bg-[var(--theme-surface-alt)] focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            )}
          />

          {inputValue && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-400 hover:text-white transition-colors cursor-pointer"
              aria-label="پاک کردن جستجو"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Secondary Filter Slot (e.g. B2B / Retail segmentation, date range) */}
        {secondaryFilters && (
          <div className="flex items-center gap-2 shrink-0 overflow-x-auto pb-1 sm:pb-0">
            {secondaryFilters}
          </div>
        )}
      </div>
    </div>
  );
}
