"use client";

import * as React from "react";
import { ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "../hooks/use-cart";
import { Button } from "@/shared/components/ui/button";
import { toPersianDigits } from "@/shared/lib/utils";

export function CartBadge() {
  const { summary, toggleCart, isCartBumping } = useCart();
  const count = summary.itemCount;

  return (
    <motion.div
      id="header-cart-badge"
      animate={
        isCartBumping
          ? {
              rotate: [0, -15, 15, -10, 10, -5, 5, 0],
              scale: [1, 1.24, 0.96, 1.1, 1],
            }
          : { rotate: 0, scale: 1 }
      }
      transition={{ duration: 0.55, ease: "easeInOut" }}
      className="inline-flex"
    >
      <Button
        variant="outline"
        size="icon"
        onClick={toggleCart}
        className="relative rounded-full border-neutral-200/80 bg-white/80 dark:border-neutral-800 dark:bg-neutral-900/80 backdrop-blur-md"
        aria-label={
          count === 0
            ? "مشاهده سبد خرید (خالی)"
            : `مشاهده سبد خرید با ${toPersianDigits(count)} کالا`
        }
      >
        <ShoppingBag className="h-4 w-4 text-neutral-700 dark:text-neutral-200" />
        <AnimatePresence>
          {count > 0 && (
            <motion.span
              key={count}
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.6, opacity: 0 }}
              transition={{
                type: "spring",
                stiffness: 500,
                damping: 25,
              }}
              className="absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-600 px-1 text-[11px] font-bold text-white shadow-xs"
            >
              {count > 99 ? "۹۹+" : toPersianDigits(count)}
            </motion.span>
          )}
        </AnimatePresence>
      </Button>
    </motion.div>
  );
}
