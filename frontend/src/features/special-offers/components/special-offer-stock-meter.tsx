"use client";

import * as React from "react";
import { Flame, AlertTriangle, CheckCircle2 } from "lucide-react";
import { toPersianDigits } from "../lib/utils";

export interface SpecialOfferStockMeterProps {
  stockRemaining: number;
  stockTotal: number;
  className?: string;
}

export function SpecialOfferStockMeter({
  stockRemaining,
  stockTotal,
  className = "",
}: SpecialOfferStockMeterProps) {
  const safeTotal = Math.max(stockTotal, 1);
  const safeRemaining = Math.max(0, Math.min(stockRemaining, safeTotal));
  const sold = safeTotal - safeRemaining;
  const percentClaimed = Math.min(100, Math.round((sold / safeTotal) * 100));

  // Determine urgency & completion status
  const isSoldOut = safeRemaining === 0;
  const isCritical = !isSoldOut && safeRemaining <= 3;
  const isLow = !isSoldOut && safeRemaining <= 6;

  return (
    <div className={`w-full space-y-1.5 ${className}`}>
      {/* Label and Count */}
      <div className="flex items-center justify-between text-xs gap-2">
        <div className="flex items-center gap-1.5 font-medium min-w-0 truncate text-[11px] sm:text-xs">
          {isSoldOut ? (
            <>
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-neutral-500" />
              <span className="truncate text-neutral-400 font-semibold">
                ظرفیت تکمیل شد
              </span>
            </>
          ) : isCritical ? (
            <>
              <Flame className="h-3.5 w-3.5 shrink-0 text-red-500 animate-bounce" />
              <span className="truncate text-red-400 font-bold">
                تنها {toPersianDigits(safeRemaining)} عدد باقی‌مانده
              </span>
            </>
          ) : isLow ? (
            <>
              <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-400" />
              <span className="truncate text-amber-300 font-medium">
                <span className="hidden sm:inline">
                  {toPersianDigits(safeRemaining)} عدد باقی‌مانده از {toPersianDigits(safeTotal)}
                </span>
                <span className="sm:hidden">
                  {toPersianDigits(safeRemaining)} عدد باقی‌مانده
                </span>
              </span>
            </>
          ) : (
            <span className="truncate text-neutral-400">
              <span className="hidden sm:inline">موجودی ویژه: </span>
              {toPersianDigits(safeRemaining)} عدد موجود
            </span>
          )}
        </div>

        <span className="shrink-0 text-[10px] sm:text-[11px] font-semibold text-neutral-400">
          {isSoldOut ? "۱۰۰٪ تکمیل" : `${toPersianDigits(percentClaimed)}٪ تکمیل`}
        </span>
      </div>

      {/* Progress Track */}
      <div className="relative h-1.5 sm:h-2 w-full overflow-hidden rounded-full bg-neutral-800/80 p-0.5 shadow-inner">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${
            isSoldOut
              ? "bg-neutral-600"
              : isCritical
              ? "bg-gradient-to-r from-red-600 via-orange-500 to-amber-400 shadow-[0_0_8px_rgba(239,68,68,0.5)]"
              : isLow
              ? "bg-gradient-to-r from-amber-500 to-orange-500"
              : "bg-gradient-to-r from-emerald-500 to-orange-500"
          }`}
          style={{ width: `${percentClaimed}%` }}
          role="progressbar"
          aria-valuenow={percentClaimed}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
}
