"use client";

import * as React from "react";
import { Clock } from "lucide-react";
import { getRemainingTime, toPersianDigits } from "../lib/utils";
import { CountdownTime } from "../types";

const emptySubscribe = () => () => {};
function useIsMounted() {
  return React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

export interface SpecialOfferTimerProps {
  /** Target date when the special offer expires (defaults to 38 hours from now) */
  targetDate?: Date | string | number;
  /** Optional title label above the countdown */
  label?: string;
  /** Callback fired when countdown expires */
  onExpire?: () => void;
  /** Additional wrapper CSS classes */
  className?: string;
}

export function SpecialOfferTimer({
  targetDate,
  label = "زمان باقی‌مانده تا پایان پیشنهاد",
  onExpire,
  className = "",
}: SpecialOfferTimerProps) {
  // Compute initial target date (or stable fallback 38 hours ahead if not passed)
  const defaultTarget = React.useMemo(() => {
    if (targetDate) return targetDate;
    // Set a predictable target in the future for demo/prototyping
    const d = new Date();
    d.setHours(d.getHours() + 38);
    d.setMinutes(45);
    d.setSeconds(0);
    return d;
  }, [targetDate]);

  const [timeLeft, setTimeLeft] = React.useState<CountdownTime>(() =>
    getRemainingTime(defaultTarget)
  );
  const mounted = useIsMounted();

  React.useEffect(() => {
    if (timeLeft.isExpired) {
      onExpire?.();
      return;
    }

    // Ticking every 1000ms
    const interval = setInterval(() => {
      const remaining = getRemainingTime(defaultTarget);
      setTimeLeft(remaining);
      if (remaining.isExpired) {
        clearInterval(interval);
        onExpire?.();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [defaultTarget, timeLeft.isExpired, onExpire]);

  const isExpired = timeLeft.isExpired;

  // If not mounted yet, render placeholder with same structure to prevent layout shifts
  const displayDays = mounted ? toPersianDigits(String(timeLeft.days).padStart(2, "0")) : "۰۰";
  const displayHours = mounted ? toPersianDigits(String(timeLeft.hours).padStart(2, "0")) : "۰۰";
  const displayMinutes = mounted ? toPersianDigits(String(timeLeft.minutes).padStart(2, "0")) : "۰۰";
  const displaySeconds = mounted ? toPersianDigits(String(timeLeft.seconds).padStart(2, "0")) : "۰۰";

  return (
    <div
      className={`inline-flex flex-col items-center sm:items-start gap-2 sm:gap-2.5 rounded-2xl border ${
        isExpired
          ? "border-neutral-800 bg-neutral-950/80 shadow-md shadow-black/40"
          : "border-orange-500/25 bg-neutral-950/80 shadow-lg shadow-orange-950/20"
      } p-2.5 sm:px-4 sm:py-3 backdrop-blur-md ${className}`}
      aria-live="polite"
      aria-label="تایمر شمارش معکوس فروش ویژه"
      dir="rtl"
    >
      {/* Header with Status Indicator & Icon */}
      <div
        className={`flex items-center justify-center sm:justify-start w-full gap-2 text-xs font-semibold ${
          isExpired ? "text-neutral-400" : "text-orange-400"
        }`}
      >
        {isExpired ? (
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-neutral-600" />
          </span>
        ) : (
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-orange-500" />
          </span>
        )}
        <Clock className={`h-3.5 w-3.5 shrink-0 ${isExpired ? "text-neutral-500" : "text-orange-400"}`} />
        <span className="truncate">
          <span className="hidden sm:inline">{isExpired ? "مهلت این پیشنهاد به پایان رسید" : label}</span>
          <span className="sm:hidden">{isExpired ? "پایان مهلت فروش ویژه" : "فرصت باقی‌مانده تا پایان"}</span>
        </span>
      </div>

      {/* Digits HUD Grid: Natural RTL flow (Days on right -> Hours -> Minutes -> Seconds on left) */}
      <div className="flex items-center justify-center gap-1 sm:gap-2 w-full">
        {/* Days */}
        <div className="flex flex-col items-center">
          <div
            className={`flex h-9 w-10 sm:h-11 sm:w-12 items-center justify-center rounded-lg border font-mono text-base sm:text-xl font-black shadow-inner ${
              isExpired
                ? "border-neutral-800 bg-neutral-900/50 text-neutral-500"
                : "border-orange-500/30 bg-orange-950/30 text-orange-400"
            }`}
          >
            <span>{displayDays}</span>
          </div>
          <span className="mt-1 text-[10px] font-medium text-neutral-400">روز</span>
        </div>

        <span
          className={`font-black text-base sm:text-lg pb-3.5 sm:pb-4 select-none ${
            isExpired ? "text-neutral-600" : "text-orange-500/60 animate-pulse"
          }`}
        >
          :
        </span>

        {/* Hours */}
        <div className="flex flex-col items-center">
          <div
            className={`flex h-9 w-10 sm:h-11 sm:w-12 items-center justify-center rounded-lg border font-mono text-base sm:text-xl font-black shadow-inner ${
              isExpired
                ? "border-neutral-800 bg-neutral-900/50 text-neutral-500"
                : "border-orange-500/30 bg-orange-950/30 text-orange-400"
            }`}
          >
            <span>{displayHours}</span>
          </div>
          <span className="mt-1 text-[10px] font-medium text-neutral-400">ساعت</span>
        </div>

        <span
          className={`font-black text-base sm:text-lg pb-3.5 sm:pb-4 select-none ${
            isExpired ? "text-neutral-600" : "text-orange-500/60 animate-pulse"
          }`}
        >
          :
        </span>

        {/* Minutes */}
        <div className="flex flex-col items-center">
          <div
            className={`flex h-9 w-10 sm:h-11 sm:w-12 items-center justify-center rounded-lg border font-mono text-base sm:text-xl font-black shadow-inner ${
              isExpired
                ? "border-neutral-800 bg-neutral-900/50 text-neutral-500"
                : "border-orange-500/30 bg-orange-950/30 text-orange-400"
            }`}
          >
            <span>{displayMinutes}</span>
          </div>
          <span className="mt-1 text-[10px] font-medium text-neutral-400">دقیقه</span>
        </div>

        <span
          className={`font-black text-base sm:text-lg pb-3.5 sm:pb-4 select-none ${
            isExpired ? "text-neutral-600" : "text-orange-500/60 animate-pulse"
          }`}
        >
          :
        </span>

        {/* Seconds */}
        <div className="flex flex-col items-center">
          <div
            className={`flex h-9 w-10 sm:h-11 sm:w-12 items-center justify-center rounded-lg border font-mono text-base sm:text-xl font-black ${
              isExpired
                ? "border-neutral-800 bg-neutral-900/50 text-neutral-500 shadow-none"
                : "border-orange-500/40 bg-orange-500/10 text-orange-300 shadow-[0_0_12px_rgba(234,88,12,0.25)]"
            }`}
          >
            <span>{displaySeconds}</span>
          </div>
          <span
            className={`mt-1 text-[10px] font-medium ${
              isExpired ? "text-neutral-500" : "text-orange-400/80"
            }`}
          >
            ثانیه
          </span>
        </div>
      </div>
    </div>
  );
}
