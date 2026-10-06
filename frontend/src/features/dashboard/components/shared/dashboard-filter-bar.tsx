"use client";

import * as React from "react";
import { Search, X, SlidersHorizontal } from "lucide-react";
import { cn } from "@/shared/lib/utils";

export interface FilterTab<T extends string = string> {
  key: T;
  label: string;
  count?: number;
}

export interface DashboardFilterBarProps<T extends string = string> {
  tabs: FilterTab<T>[];
  activeTab: T;
  onTabChange: (key: T) => void;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (val: string) => void;
  extraControls?: React.ReactNode;
}

export function DashboardFilterBar<T extends string = string>({
  tabs,
  activeTab,
  onTabChange,
  searchPlaceholder = "جستجو...",
  searchValue = "",
  onSearchChange,
  extraControls,
}: DashboardFilterBarProps<T>) {
  return (
    <div
      className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-3 sm:p-4 rounded-2xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] shadow-xs"
      dir="rtl"
    >
      {/* Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 lg:pb-0">
        {tabs.map((tab) => {
          const isActive = tab.key === activeTab;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onTabChange(tab.key)}
              className={cn(
                "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer",
                isActive
                  ? "bg-orange-500/15 text-orange-400 border border-orange-500/30 shadow-xs"
                  : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60 border border-transparent"
              )}
            >
              <span>{tab.label}</span>
              {typeof tab.count === "number" && (
                <span
                  className={cn(
                    "px-1.5 py-0.2 rounded-md text-[10px] font-mono",
                    isActive
                      ? "bg-orange-500/25 text-orange-300"
                      : "bg-neutral-800 text-neutral-400"
                  )}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Search & Extra Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full lg:w-auto">
        {onSearchChange && (
          <div className="relative flex-1 lg:w-64">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500 pointer-events-none" />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full h-10 pr-9.5 pl-8 rounded-xl border border-[var(--theme-border-color)] bg-neutral-900/60 text-xs sm:text-sm text-[var(--theme-foreground)] placeholder-neutral-500 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/40 transition-colors"
            />
            {searchValue && (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-300 p-1 cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        )}

        {extraControls && (
          <div className="flex items-center gap-2 shrink-0">
            {extraControls}
          </div>
        )}
      </div>
    </div>
  );
}
