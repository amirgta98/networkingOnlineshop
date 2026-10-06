"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { cn, formatPrice } from "@/shared/lib/utils";

const PERSIAN_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

export interface RollingNumberProps {
  /** The numeric price or count to display */
  value: number;
  /** Currency label to append (defaults to "تومان") */
  currency?: string;
  /** Whether to render the currency label */
  showCurrency?: boolean;
  /** Optional custom CSS classes for the container */
  className?: string;
  /** Optional custom CSS classes for the currency text */
  currencyClassName?: string;
  /** Spring stiffness (defaults to 280) */
  stiffness?: number;
  /** Spring damping (defaults to 26) */
  damping?: number;
}

interface NumberToken {
  key: string;
  isDigit: boolean;
  digit: number;
  char: string;
}

/**
 * Hardware-accelerated Persian rolling number ticker.
 * Provides vertical sliding animation when numbers change with zero layout shift (tabular-nums).
 */
export function RollingNumber({
  value,
  currency = "تومان",
  showCurrency = true,
  className,
  currencyClassName,
  stiffness = 280,
  damping = 26,
}: RollingNumberProps) {
  const safeValue = Math.max(0, Math.round(value || 0));

  // Break the number into tokens (digits and separators) with stable reverse-indexed keys
  const tokens = React.useMemo<NumberToken[]>(() => {
    const formatted = safeValue.toLocaleString("en-US"); // e.g. "18,200,000"
    const chars = formatted.split("");
    const len = chars.length;

    return chars.map((char, index) => {
      const fromRight = len - 1 - index;
      const isDigit = /[0-9]/.test(char);
      return {
        key: isDigit ? `d-${fromRight}` : `sep-${fromRight}`,
        isDigit,
        digit: isDigit ? parseInt(char, 10) : 0,
        char: isDigit ? PERSIAN_DIGITS[parseInt(char, 10)] : "٬",
      };
    });
  }, [safeValue]);

  const accessibleLabel = `${formatPrice(safeValue)}`;

  return (
    <span
      className={cn("inline-flex items-baseline gap-1.5 select-none", className)}
      dir="rtl"
      aria-label={accessibleLabel}
    >
      {/* Visual Ticker (hidden from assistive tech to avoid reading isolated digit reels) */}
      <span
        className="inline-flex items-center tabular-nums font-black tracking-tight"
        dir="ltr"
        aria-hidden="true"
      >
        {tokens.map((token) => {
          if (!token.isDigit) {
            return (
              <span
                key={token.key}
                className="inline-block h-[1.25em] leading-[1.25em] text-neutral-400 select-none px-[1px]"
              >
                {token.char}
              </span>
            );
          }

          return (
            <span
              key={token.key}
              className="relative inline-block overflow-hidden h-[1.25em] leading-[1.25em] tabular-nums"
            >
              <motion.span
                className="flex flex-col select-none text-center"
                initial={false}
                animate={{ y: `-${token.digit * 10}%` }}
                transition={{
                  type: "spring",
                  stiffness,
                  damping,
                  mass: 0.75,
                }}
              >
                {PERSIAN_DIGITS.map((pDigit, idx) => (
                  <span
                    key={idx}
                    className="h-[1.25em] leading-[1.25em] flex items-center justify-center select-none"
                  >
                    {pDigit}
                  </span>
                ))}
              </motion.span>
            </span>
          );
        })}
      </span>

      {showCurrency && (
        <span
          className={cn(
            "text-xs sm:text-sm font-normal text-neutral-400 select-none",
            currencyClassName
          )}
          aria-hidden="true"
        >
          {currency}
        </span>
      )}
    </span>
  );
}
