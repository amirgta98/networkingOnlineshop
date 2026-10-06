"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { X, ShoppingBag, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "../hooks/use-cart";
import { CartItem } from "./cart-item";
import { Button } from "@/shared/components/ui/button";
import { formatPrice, toPersianDigits } from "@/shared/lib/utils";

export function CartSheet() {
  const router = useRouter();
  const { items, isOpen, setOpen, summary, clearCart } = useCart();
  const [isCheckingOut, setIsCheckingOut] = React.useState(false);

  // Close on Escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, setOpen]);

  const handleCheckout = () => {
    setIsCheckingOut(true);
    setOpen(false);
    router.push("/checkout");
    setIsCheckingOut(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden" dir="rtl">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
          />

          {/* Drawer Panel: Pinned to the right edge, slides in from right to left */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed top-0 bottom-0 right-0 z-10 flex h-full w-full max-w-md flex-col bg-[#111114] text-neutral-100 shadow-2xl border-l border-neutral-800"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-neutral-800 p-5">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-orange-500" />
                <h2 className="text-base font-bold text-white">
                  سبد خرید ({toPersianDigits(summary.itemCount)})
                </h2>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors cursor-pointer"
                aria-label="بستن سبد خرید"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Items List / Empty State */}
            <div className="flex-1 overflow-y-auto p-5">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-900 text-neutral-500 border border-neutral-800">
                    <ShoppingBag className="h-8 w-8" />
                  </div>
                  <h3 className="mt-4 text-base font-bold text-white">
                    سبد خرید شما خالی است
                  </h3>
                  <p className="mt-1 text-xs text-neutral-400 max-w-xs leading-relaxed">
                    پیشنهادهای ویژه و تجهیزات شبکه با تخفیف‌های محدود را بررسی فرمایید.
                  </p>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => setOpen(false)}
                    className="mt-6 bg-gradient-to-r from-orange-600 to-orange-500 text-white font-bold"
                  >
                    مشاهده محصولات فروش ویژه
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-neutral-800">
                  <AnimatePresence initial={false}>
                    {items.map((item) => (
                      <CartItem key={item.id} item={item} />
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Footer / Summary */}
            {items.length > 0 && (
              <div className="border-t border-neutral-800 bg-[#0d0d10] p-5 space-y-3">
                <div className="space-y-1.5 text-xs text-neutral-400">
                  <div className="flex justify-between">
                    <span>مجموع اقلام</span>
                    <span className="font-semibold text-neutral-200">
                      {formatPrice(summary.subtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>هزینه ارسال</span>
                    <span className="font-semibold text-neutral-200">
                      {summary.shipping === 0 ? (
                        <span className="text-emerald-400 font-bold">
                          رایگان
                        </span>
                      ) : (
                        formatPrice(summary.shipping)
                      )}
                    </span>
                  </div>
                  {summary.estimatedTax > 0 && (
                    <div className="flex justify-between">
                      <span>مالیات بر ارزش افزوده</span>
                      <span className="font-semibold text-neutral-200">
                        {formatPrice(summary.estimatedTax)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex justify-between border-t border-neutral-800 pt-3 text-base font-black text-white">
                  <span>مبلغ قابل پرداخت</span>
                  <span className="text-orange-400">{formatPrice(summary.total)}</span>
                </div>

                <Button
                  className="w-full gap-2 mt-2 h-11 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-black shadow-lg shadow-orange-950/40"
                  size="lg"
                  isLoading={isCheckingOut}
                  onClick={handleCheckout}
                >
                  <span>تکمیل خرید و ثبت نهایی</span>
                  <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                </Button>

                <div className="flex justify-center pt-1">
                  <button
                    onClick={clearCart}
                    className="text-xs text-neutral-400 hover:text-neutral-200 underline cursor-pointer"
                  >
                    خالی کردن سبد خرید
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
