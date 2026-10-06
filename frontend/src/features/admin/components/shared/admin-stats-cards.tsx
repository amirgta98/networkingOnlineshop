"use client";

import * as React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn, toPersianDigits } from "@/shared/lib/utils";

export interface AdminStatItem {
  id: string;
  title: string;
  value: string | number;
  subtitle?: string;
  changeText?: string;
  changePositive?: boolean;
  icon: React.ComponentType<{ className?: string }>;
  variant: "emerald" | "orange" | "sky" | "purple" | "rose" | "amber";
  badge?: string;
  onClick?: () => void;
}

export interface AdminStatsCardsProps {
  items: AdminStatItem[];
  columns?: 2 | 3 | 4;
  className?: string;
}

export function AdminStatsCards({
  items,
  columns = 4,
  className,
}: AdminStatsCardsProps) {
  const getGridCols = () => {
    switch (columns) {
      case 2:
        return "grid-cols-1 sm:grid-cols-2";
      case 3:
        return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
      case 4:
      default:
        return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";
    }
  };

  const getVariantStyles = (variant: AdminStatItem["variant"]) => {
    switch (variant) {
      case "emerald":
        return {
          iconBox: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
          glow: "from-emerald-500/10 to-transparent",
          borderHover: "hover:border-emerald-500/40",
        };
      case "orange":
        return {
          iconBox: "bg-orange-500/10 text-orange-400 border-orange-500/20",
          glow: "from-orange-500/10 to-transparent",
          borderHover: "hover:border-orange-500/40",
        };
      case "sky":
        return {
          iconBox: "bg-sky-500/10 text-sky-400 border-sky-500/20",
          glow: "from-sky-500/10 to-transparent",
          borderHover: "hover:border-sky-500/40",
        };
      case "purple":
        return {
          iconBox: "bg-purple-500/10 text-purple-400 border-purple-500/20",
          glow: "from-purple-500/10 to-transparent",
          borderHover: "hover:border-purple-500/40",
        };
      case "rose":
        return {
          iconBox: "bg-rose-500/10 text-rose-400 border-rose-500/20",
          glow: "from-rose-500/10 to-transparent",
          borderHover: "hover:border-rose-500/40",
        };
      case "amber":
        return {
          iconBox: "bg-amber-500/10 text-amber-400 border-amber-500/20",
          glow: "from-amber-500/10 to-transparent",
          borderHover: "hover:border-amber-500/40",
        };
    }
  };

  const formatDisplayValue = (val: string | number) => {
    if (typeof val === "number") {
      return toPersianDigits(val.toLocaleString("fa-IR"));
    }
    return toPersianDigits(val);
  };

  return (
    <div
      dir="rtl"
      className={cn("grid gap-4 w-full", getGridCols(), className)}
    >
      {items.map((item) => {
        const IconComponent = item.icon;
        const styles = getVariantStyles(item.variant);
        const isClickable = Boolean(item.onClick);

        return (
          <div
            key={item.id}
            onClick={item.onClick}
            className={cn(
              "group relative overflow-hidden rounded-2xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] p-5 shadow-sm transition-all duration-200",
              styles.borderHover,
              isClickable &&
                "cursor-pointer hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98]"
            )}
          >
            {/* Subtle Gradient Glow in Corner */}
            <div
              className={cn(
                "absolute -top-12 -left-12 h-28 w-28 rounded-full bg-gradient-to-br blur-2xl pointer-events-none transition-opacity duration-300 opacity-60 group-hover:opacity-100",
                styles.glow
              )}
            />

            {/* Header: Title, Optional Badge, and Tinted Icon */}
            <div className="flex items-start justify-between gap-3 relative z-10">
              <div className="flex flex-col gap-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[var(--theme-muted)] tracking-wide">
                    {item.title}
                  </span>
                  {item.badge && (
                    <span className="rounded-full bg-neutral-800/90 border border-neutral-700/60 px-2 py-0.5 text-[10px] font-medium text-neutral-300">
                      {item.badge}
                    </span>
                  )}
                </div>
              </div>

              {/* Icon Badge */}
              <div
                className={cn(
                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition-transform duration-200 group-hover:scale-105",
                  styles.iconBox
                )}
              >
                <IconComponent className="h-5 w-5" />
              </div>
            </div>

            {/* Value Display */}
            <div className="mt-3 relative z-10 min-w-0">
              {(() => {
                const formatted = formatDisplayValue(item.value);
                const isToman = typeof formatted === "string" && formatted.includes("تومان");
                const numPart = isToman ? formatted.replace("تومان", "").trim() : formatted;
                const numLen = String(numPart).length;

                return (
                  <div className="flex items-baseline gap-1.5 flex-wrap min-w-0">
                    <span
                      className={cn(
                        "font-black text-[var(--theme-foreground)] font-mono tabular-nums tracking-tight whitespace-nowrap",
                        numLen > 11
                          ? "text-base sm:text-lg"
                          : numLen > 8
                          ? "text-lg sm:text-xl"
                          : "text-xl sm:text-2xl"
                      )}
                    >
                      {numPart}
                    </span>
                    {isToman && (
                      <span className="text-xs font-medium text-neutral-400 shrink-0">
                        تومان
                      </span>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Footer: Trend Change & Subtitle */}
            {(item.changeText || item.subtitle) && (
              <div className="mt-3 flex flex-col gap-1.5 pt-2 border-t border-[var(--theme-border-color)]/50 relative z-10 min-w-0">
                {item.subtitle && (
                  <span className="text-[var(--theme-muted)] text-[11px] leading-tight truncate">
                    {item.subtitle}
                  </span>
                )}

                {item.changeText && (
                  <div className="flex items-center">
                    <div
                      className={cn(
                        "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold border whitespace-nowrap shrink-0",
                        item.changePositive === true
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : item.changePositive === false
                          ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                          : "bg-neutral-800 text-neutral-400 border-neutral-700"
                      )}
                    >
                      {item.changePositive === true ? (
                        <TrendingUp className="h-3 w-3 shrink-0" />
                      ) : item.changePositive === false ? (
                        <TrendingDown className="h-3 w-3 shrink-0" />
                      ) : null}
                      <span>{toPersianDigits(item.changeText)}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
