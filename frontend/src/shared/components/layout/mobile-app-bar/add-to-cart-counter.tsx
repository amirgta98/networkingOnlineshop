"use client";

import * as React from "react";
import { ShoppingBag, Plus, Minus, Trash2, Wifi } from "lucide-react";
import { Product } from "@/features/catalog/types";
import { SelectedOptionDetail } from "@/features/cart/types";
import { useCart } from "@/features/cart";
import { formatPrice, toPersianDigits } from "@/shared/lib/utils";

export interface AddToCartCounterProps {
  product: Product;
  selectedOptions?: Record<string, SelectedOptionDetail>;
  unitPrice?: number;
  className?: string;
  showPrice?: boolean;
  /** Current active quantity selected on the page */
  selectedQuantity?: number;
  /** Callback fired whenever quantity changes from the mobile navbar */
  onQuantityChange?: (quantity: number) => void;
  /** Dynamic unit price getter based on quantity (supports tiered discounts) */
  getUnitPriceForQuantity?: (quantity: number) => number;
}

export function AddToCartCounter({
  product,
  selectedOptions,
  unitPrice,
  className = "",
  showPrice = true,
  selectedQuantity = 1,
  onQuantityChange,
  getUnitPriceForQuantity,
}: AddToCartCounterProps) {
  const { items, addItem, updateQuantity, removeItem, triggerCartBump, flyToCart } = useCart();
  const [isFlying, setIsFlying] = React.useState(false);
  const buttonRef = React.useRef<HTMLButtonElement | null>(null);

  const finalUnitPrice = unitPrice ?? product.price;

  // Derive unique options key matching useCart logic
  const optionsKey = selectedOptions
    ? Object.entries(selectedOptions)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => `${k}:${v.value}`)
        .join("|")
    : "";

  // Find matching items in cart
  const matchingItems = items.filter((item) => {
    if (item.product.id !== product.id) return false;
    if (!optionsKey) return true;
    const itemOptionsKey = item.selectedOptions
      ? Object.entries(item.selectedOptions)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([k, v]) => `${k}:${v.value}`)
          .join("|")
      : "";
    return itemOptionsKey === optionsKey;
  });

  const inCartCount = matchingItems.reduce((acc, item) => acc + item.quantity, 0);
  const primaryCartItem = matchingItems[0];

  const handleInitialAdd = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (!product.inStock || isFlying) return;

    if (buttonRef.current) {
      setIsFlying(true);
      try {
        await flyToCart(buttonRef.current, product);
      } finally {
        setIsFlying(false);
      }
    }

    const qtyToAdd = selectedQuantity && selectedQuantity > 1 ? selectedQuantity : 1;
    const priceToAdd = getUnitPriceForQuantity
      ? getUnitPriceForQuantity(qtyToAdd)
      : finalUnitPrice;

    addItem(product, qtyToAdd, selectedOptions, priceToAdd);
    onQuantityChange?.(qtyToAdd);
    triggerCartBump();
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!product.inStock) return;
    const nextQty = (inCartCount || 0) + 1;
    const nextPrice = getUnitPriceForQuantity
      ? getUnitPriceForQuantity(nextQty)
      : finalUnitPrice;

    if (primaryCartItem) {
      updateQuantity(primaryCartItem.id, nextQty, nextPrice);
    } else {
      addItem(product, nextQty, selectedOptions, nextPrice);
    }
    onQuantityChange?.(nextQty);
    triggerCartBump();
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (primaryCartItem) {
      if (primaryCartItem.quantity <= 1) {
        removeItem(primaryCartItem.id);
        onQuantityChange?.(1);
      } else {
        const nextQty = primaryCartItem.quantity - 1;
        const nextPrice = getUnitPriceForQuantity
          ? getUnitPriceForQuantity(nextQty)
          : finalUnitPrice;
        updateQuantity(primaryCartItem.id, nextQty, nextPrice);
        onQuantityChange?.(nextQty);
      }
      triggerCartBump();
    }
  };

  return (
    <div
      className={`relative h-11 w-full flex items-center justify-center select-none ${className}`}
      dir="rtl"
    >
      {inCartCount === 0 ? (
        /* ── State 1: Standard Add to Cart Button (Pure Action Button) ── */
        <button
          ref={buttonRef}
          id="mobile-cart-action"
          type="button"
          onClick={handleInitialAdd}
          disabled={!product.inStock || isFlying}
          className={`h-full w-full rounded-xl px-2 sm:px-4 flex items-center justify-center gap-1.5 sm:gap-2 font-bold text-xs sm:text-sm shadow-md transition-all duration-200 cursor-pointer active:scale-[0.98] ${
            !product.inStock
              ? "bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-700"
              : isFlying
              ? "bg-orange-600/80 text-white animate-pulse"
              : "bg-orange-600 hover:bg-orange-500 text-white shadow-orange-950/40"
          }`}
          aria-label={`افزودن ${product.name} به سبد خرید`}
        >
          {isFlying ? (
            <>
              <Wifi className="h-4 w-4 shrink-0 animate-spin text-white" />
              <span className="truncate whitespace-nowrap">در حال ثبت...</span>
            </>
          ) : (
            <>
              <ShoppingBag className="h-4 w-4 shrink-0" />
              <span className="truncate whitespace-nowrap">
                {!product.inStock
                  ? "ناموجود"
                  : (selectedQuantity && selectedQuantity > 1)
                  ? `افزودن ${toPersianDigits(selectedQuantity)} عدد`
                  : "افزودن به سبد"}
              </span>
            </>
          )}
        </button>
      ) : (
        /* ── State 2: Zero Layout Shift Quantity Counter (Numeric Up-Down Box) ─ */
        <div
          id="mobile-cart-action"
          className="h-full w-full flex items-center justify-between rounded-xl border border-orange-500/70 bg-neutral-900/95 px-1.5 sm:px-2 shadow-lg shadow-orange-950/20"
          role="group"
          aria-label="کنترل تعداد در سبد خرید"
        >
          {/* Decrement / Remove */}
          <button
            type="button"
            onClick={handleDecrement}
            className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-lg text-neutral-300 hover:bg-neutral-800 hover:text-white transition-all cursor-pointer active:scale-90"
            aria-label={inCartCount === 1 ? "حذف از سبد خرید" : "کاهش تعداد"}
          >
            {inCartCount === 1 ? (
              <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-400 hover:text-red-300 transition-colors" />
            ) : (
              <Minus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            )}
          </button>

          {/* Count Badge */}
          <div className="flex items-center gap-1 sm:gap-1.5 px-1 sm:px-2">
            <span className="text-xs sm:text-sm font-black text-white tabular-nums">
              {toPersianDigits(inCartCount)}
            </span>
            <span className="text-[10px] sm:text-[11px] text-neutral-400 font-medium whitespace-nowrap">عدد در سبد</span>
          </div>

          {/* Increment */}
          <button
            type="button"
            onClick={handleIncrement}
            disabled={!product.inStock}
            className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-lg bg-orange-600/20 text-orange-400 hover:bg-orange-600 hover:text-white transition-all cursor-pointer active:scale-90"
            aria-label="افزایش تعداد"
          >
            <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
