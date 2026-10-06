"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Sparkles, CheckCircle2, TrendingUp, ChevronLeft, PackageCheck } from "lucide-react";
import { TieredPricingRule } from "@/features/catalog/types";
import { formatPrice, toPersianDigits, cn } from "@/shared/lib/utils";

export interface TieredPricingProgressProps {
  /** Tiered pricing rules from product data */
  tieredPricing?: TieredPricingRule[];
  /** Current selected quantity */
  quantity: number;
  /** Callback when user clicks a tier shortcut chip */
  onSelectTierQuantity?: (qty: number) => void;
  /** Base unit price before tiered discount */
  baseUnitPrice: number;
  /** Optional custom CSS classes */
  className?: string;
}

/**
 * Interactive Gamified Tiered Pricing Progress Bar.
 * Encourages bulk/enterprise purchasing with dynamic progress calculation,
 * unlocked state celebration, and quick-select tier shortcut chips.
 * Strictly conditionally rendered: renders null if no rules exist.
 */
export function TieredPricingProgress({
  tieredPricing,
  quantity,
  onSelectTierQuantity,
  baseUnitPrice,
  className,
}: TieredPricingProgressProps) {
  // ── 1. Conditional Rendering: Never occupy space if rules don't exist ──
  if (!tieredPricing || tieredPricing.length === 0) {
    return null;
  }

  // Sort rules ascending by minQuantity
  const sortedRules = [...tieredPricing].sort((a, b) => a.minQuantity - b.minQuantity);

  // Highest unlocked tier based on current quantity
  const activeTier = [...sortedRules].reverse().find((rule) => quantity >= rule.minQuantity);

  // Next tier to unlock
  const nextTier = sortedRules.find((rule) => quantity < rule.minQuantity);

  // Maximum tier
  const maxTier = sortedRules[sortedRules.length - 1];
  const isMaxTierUnlocked = quantity >= maxTier.minQuantity;

  // Calculate percentage progress toward next tier
  let progressPercent = 0;
  let itemsNeededForNext = 0;

  if (isMaxTierUnlocked) {
    progressPercent = 100;
  } else if (nextTier) {
    itemsNeededForNext = nextTier.minQuantity - quantity;
    if (activeTier) {
      const stepRange = nextTier.minQuantity - activeTier.minQuantity;
      const stepProgress = quantity - activeTier.minQuantity;
      progressPercent = Math.min(100, Math.max(0, (stepProgress / stepRange) * 100));
    } else {
      progressPercent = Math.min(100, Math.max(0, (quantity / nextTier.minQuantity) * 100));
    }
  }

  // Calculate savings gained from the tiered discount
  const tieredSavings = activeTier
    ? Math.round(baseUnitPrice * (activeTier.discountPercent / 100) * quantity)
    : 0;

  return (
    <div
      className={cn(
        "rounded-2xl border transition-all duration-300 p-4 text-right select-none",
        activeTier
          ? "border-emerald-500/30 bg-gradient-to-b from-emerald-950/20 to-neutral-900/60 shadow-lg shadow-emerald-950/10"
          : "border-orange-500/20 bg-gradient-to-b from-orange-950/15 to-[#121216] shadow-md",
        className
      )}
      dir="rtl"
    >
      {/* ── Header: Title & Active Tier Indicator ──────────────────────── */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-lg transition-colors",
              activeTier
                ? "bg-emerald-500/20 text-emerald-400"
                : "bg-orange-500/20 text-orange-400"
            )}
          >
            {activeTier ? (
              <PackageCheck className="h-4 w-4" />
            ) : (
              <TrendingUp className="h-4 w-4" />
            )}
          </div>
          <span className="text-xs sm:text-sm font-bold text-white">
            تخفیف پلکانی خرید عمده و سازمانی
          </span>
        </div>

        {/* Current status pill */}
        {activeTier ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2.5 py-0.5 text-[11px] font-black text-emerald-300 animate-fade-in">
            <CheckCircle2 className="h-3 w-3 text-emerald-400" />
            <span>{toPersianDigits(activeTier.discountPercent)}٪ تخفیف فعال</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-neutral-800 px-2.5 py-0.5 text-[11px] font-medium text-neutral-400">
            <Sparkles className="h-3 w-3 text-amber-400" />
            <span>تخفیف تا {toPersianDigits(maxTier.discountPercent)}٪</span>
          </span>
        )}
      </div>

      {/* ── Dynamic Gamification Text ──────────────────────────────────── */}
      <div className="text-xs mb-3 font-medium leading-relaxed">
        {activeTier ? (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-emerald-400">
            <span className="font-bold flex items-center gap-1">
              <span>🎉 تبریک! تخفیف خرید عمده برای شما اعمال شد.</span>
              {tieredSavings > 0 && (
                <span className="text-white bg-emerald-950/60 border border-emerald-500/30 rounded-md px-1.5 py-0.5 text-[11px]">
                  (سود شما: {formatPrice(tieredSavings)})
                </span>
              )}
            </span>
            {nextTier && (
              <span className="text-neutral-400 text-[11px]">
                فقط {toPersianDigits(itemsNeededForNext)} عدد دیگر تا تخفیف{" "}
                <strong className="text-orange-400 font-bold">
                  {toPersianDigits(nextTier.discountPercent)}٪
                </strong>
              </span>
            )}
          </div>
        ) : (
          <p className="text-neutral-300">
            فقط{" "}
            <span className="text-orange-400 font-bold">
              {toPersianDigits(itemsNeededForNext)} عدد دیگر
            </span>{" "}
            به سبد اضافه کنید تا{" "}
            <span className="text-orange-400 font-bold">
              {toPersianDigits(nextTier?.discountPercent || 0)}٪ تخفیف پلکانی
            </span>{" "}
            برای کل سفارش فعال شود!
          </p>
        )}
      </div>

      {/* ── Progress Bar Track & Luminous Fill ──────────────────────────── */}
      <div className="relative w-full h-2 rounded-full bg-neutral-800/90 overflow-hidden mb-3.5">
        <motion.div
          className={cn(
            "absolute top-0 bottom-0 right-0 rounded-full transition-all",
            activeTier
              ? "bg-gradient-to-l from-emerald-500 to-teal-400 shadow-[0_0_12px_rgba(16,185,129,0.5)]"
              : "bg-gradient-to-l from-orange-500 to-amber-400 shadow-[0_0_10px_rgba(249,115,22,0.5)]"
          )}
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ type: "spring", stiffness: 180, damping: 22 }}
        />
      </div>

      {/* ── Quick-Select Tier Shortcut Chips ───────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-neutral-800/70">
        <span className="text-[11px] text-neutral-400 font-medium shrink-0 ml-1">
          حدنصاب‌های تخفیف:
        </span>

        {sortedRules.map((tier) => {
          const isReached = quantity >= tier.minQuantity;
          const isCurrentActive = activeTier?.minQuantity === tier.minQuantity;

          return (
            <button
              key={tier.minQuantity}
              type="button"
              onClick={() => onSelectTierQuantity?.(tier.minQuantity)}
              className={cn(
                "group relative inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold transition-all duration-200 cursor-pointer active:scale-95",
                isCurrentActive
                  ? "bg-emerald-500/25 border border-emerald-400/60 text-emerald-300 shadow-sm shadow-emerald-950/50"
                  : isReached
                  ? "bg-neutral-800/90 border border-emerald-600/40 text-emerald-400 hover:border-emerald-500/60"
                  : "bg-neutral-800/60 border border-neutral-700/60 text-neutral-300 hover:border-orange-500/50 hover:text-white"
              )}
              title={`انتخاب مستقیم حداقل ${tier.minQuantity} عدد برای دریافت ${tier.discountPercent}٪ تخفیف`}
            >
              {isReached ? (
                <CheckCircle2 className="h-3 w-3 text-emerald-400 shrink-0" />
              ) : (
                <ChevronLeft className="h-3 w-3 text-neutral-500 group-hover:text-orange-400 transition-transform group-hover:-translate-x-0.5" />
              )}

              <span>
                {toPersianDigits(tier.minQuantity)} عدد
              </span>
              <span
                className={cn(
                  "rounded px-1 py-0.2 text-[10px] font-black",
                  isReached
                    ? "bg-emerald-500/30 text-emerald-200"
                    : "bg-orange-500/20 text-orange-300"
                )}
              >
                {toPersianDigits(tier.discountPercent)}٪ تخفیف
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
