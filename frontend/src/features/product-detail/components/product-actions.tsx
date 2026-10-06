"use client";

import * as React from "react";
import { ShoppingBag, Zap, Plus, Minus, Truck, Wifi } from "lucide-react";
import { Product } from "@/features/catalog/types";
import { SelectedOptionDetail } from "@/features/cart/types";
import { useCart } from "@/features/cart";
import { Button } from "@/shared/components/ui/button";
import { toPersianDigits } from "@/shared/lib/utils";

export interface ProductActionsProps {
  product: Product;
  quantity: number;
  onQuantityChange: (q: number) => void;
  selectedOptions: Record<string, SelectedOptionDetail>;
  unitPrice: number;
  className?: string;
}

export function ProductActions({
  product,
  quantity,
  onQuantityChange,
  selectedOptions,
  unitPrice,
  className = "",
}: ProductActionsProps) {
  const { addItem, toggleCart, flyToCart, items } = useCart();
  const [isFlying, setIsFlying] = React.useState(false);
  const buyButtonRef = React.useRef<HTMLButtonElement | null>(null);

  // Check how many of this product are in cart
  const cartItemCount = items
    .filter((i) => i.product.id === product.id)
    .reduce((acc, curr) => acc + curr.quantity, 0);

  const isEligibleForFreeShipping = unitPrice * quantity >= 5000000;

  const handleAddToCart = async () => {
    if (!product.inStock || isFlying) return;

    if (buyButtonRef.current) {
      setIsFlying(true);
      try {
        await flyToCart(buyButtonRef.current, product);
      } finally {
        setIsFlying(false);
      }
    }

    addItem(product, quantity, selectedOptions, unitPrice);
  };

  const handleQuickBuy = async () => {
    if (!product.inStock) return;
    addItem(product, quantity, selectedOptions, unitPrice);
    toggleCart();
  };

  return (
    <div className={`flex flex-col gap-3.5 ${className}`} dir="rtl">
      {/* ── Quantity Stepper & Add to Cart Row (Desktop only; on Mobile the Mobile App Bar handles actions to avoid duplication) ── */}
      <div className="hidden md:flex flex-row items-center gap-3">
        {/* Quantity Stepper */}
        <div
          className="flex items-center justify-between rounded-xl border border-neutral-800 bg-[#141418] h-12 px-2 w-full sm:w-36 shrink-0"
          role="group"
          aria-label="انتخاب تعداد کالا"
        >
          <button
            type="button"
            onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
            disabled={quantity <= 1 || !product.inStock}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 disabled:opacity-40 disabled:hover:bg-transparent transition-all cursor-pointer active:scale-90"
            aria-label="کاهش تعداد"
          >
            <Minus className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-1">
            <span className="text-base font-black text-white tabular-nums">
              {toPersianDigits(quantity)}
            </span>
            <span className="text-[11px] text-neutral-500">عدد</span>
          </div>

          <button
            type="button"
            onClick={() => onQuantityChange(quantity + 1)}
            disabled={!product.inStock}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 disabled:opacity-40 disabled:hover:bg-transparent transition-all cursor-pointer active:scale-90"
            aria-label="افزایش تعداد"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        {/* Primary Add to Cart Button */}
        <Button
          ref={buyButtonRef}
          type="button"
          onClick={handleAddToCart}
          disabled={!product.inStock || isFlying}
          className={`flex-1 h-12 rounded-xl text-sm font-bold gap-2 shadow-lg shadow-orange-950/40 transition-all duration-200 cursor-pointer ${
            !product.inStock
              ? "bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-700"
              : isFlying
              ? "bg-orange-600/80 text-white animate-pulse"
              : "bg-orange-600 hover:bg-orange-500 text-white active:scale-[0.98]"
          }`}
          aria-label={`افزودن ${product.name} به سبد خرید`}
        >
          {isFlying ? (
            <>
              <Wifi className="h-4 w-4 animate-spin text-white" />
              <span>ارسال به سبد خرید...</span>
            </>
          ) : (
            <>
              <ShoppingBag className="h-4 w-4" />
              <span>
                {!product.inStock ? "ناموجود در انبار" : "افزودن به سبد خرید"}
              </span>
              {cartItemCount > 0 && (
                <span className="mr-2 rounded-md bg-white/20 px-2 py-0.5 text-xs font-mono font-black">
                  {toPersianDigits(cartItemCount)} در سبد
                </span>
              )}
            </>
          )}
        </Button>

        {/* Fast Buy (خرید سریع) */}
        {product.inStock && (
          <Button
            type="button"
            variant="secondary"
            onClick={handleQuickBuy}
            className="h-12 px-4 rounded-xl text-xs sm:text-sm font-bold gap-1.5 border border-neutral-700 bg-neutral-850 hover:bg-neutral-800 text-neutral-200 transition-all active:scale-[0.98] shrink-0"
            aria-label="خرید سریع و نهایی‌سازی سفارش"
          >
            <Zap className="h-4 w-4 text-amber-400" />
            <span>خرید سریع</span>
          </Button>
        )}
      </div>

      {/* Free Shipping Alert */}
      <div className="flex items-center gap-2 rounded-xl border border-neutral-800/80 bg-[#121215] px-3.5 py-2.5 text-xs text-neutral-300">
        <Truck
          className={`h-4 w-4 shrink-0 ${
            isEligibleForFreeShipping ? "text-emerald-400" : "text-neutral-500"
          }`}
        />
        {isEligibleForFreeShipping ? (
          <span className="text-emerald-400 font-semibold">
            این سفارش واجد شرایط ارسال رایگان فوری است!
          </span>
        ) : (
          <span className="text-neutral-400">
            با سفارش بالای ۵ میلیون تومان، ارسال رایگان به سراسر کشور دریافت کنید.
          </span>
        )}
      </div>
    </div>
  );
}
