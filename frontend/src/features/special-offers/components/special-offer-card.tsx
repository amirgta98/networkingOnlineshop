"use client";

import * as React from "react";
import Image from "next/image";
import { ShoppingBag, Check, Flame, ShieldCheck, Tag, Plus, Minus, Trash2 } from "lucide-react";
import { SpecialOfferProduct } from "../types";
import { SpecialOfferStockMeter } from "./special-offer-stock-meter";
import { formatSpecialPrice, toPersianDigits } from "../lib/utils";
import { useCart } from "@/features/cart";
import { Button } from "@/shared/components/ui/button";

export interface SpecialOfferCardProps {
  product: SpecialOfferProduct;
}

export function SpecialOfferCard({ product }: SpecialOfferCardProps) {
  const { addItem, updateQuantity, removeItem, triggerCartBump, flyToCart, items } = useCart();
  const [isFlying, setIsFlying] = React.useState(false);
  const buttonRef = React.useRef<HTMLButtonElement | null>(null);

  const [imgSrc, setImgSrc] = React.useState(
    product.images[0] || "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&auto=format&fit=crop&q=80"
  );

  const isSoldOut = product.stockRemaining <= 0 || !product.inStock;
  const cartItem = items.find((item) => item.product.id === product.id);
  const inCartCount = cartItem ? cartItem.quantity : 0;
  const isMaxStockInCart = !isSoldOut && inCartCount >= product.stockRemaining;
  const isCtaDisabled = isSoldOut || isMaxStockInCart;

  const handleAddToCart = async () => {
    if (isCtaDisabled || isFlying) return;

    if (buttonRef.current) {
      setIsFlying(true);
      try {
        await flyToCart(buttonRef.current, product);
      } finally {
        setIsFlying(false);
      }
    }

    addItem(product, 1);
  };

  const handleIncrement = () => {
    if (isMaxStockInCart || !cartItem) return;
    updateQuantity(cartItem.id, inCartCount + 1);
    triggerCartBump();
  };

  const handleDecrement = () => {
    if (!cartItem) return;
    if (inCartCount <= 1) {
      removeItem(cartItem.id);
    } else {
      updateQuantity(cartItem.id, inCartCount - 1);
    }
  };

  const savedAmount = product.originalPrice - product.price;

  return (
    <article
      className="group relative flex h-full w-full flex-col overflow-hidden rounded-2xl border border-neutral-800/90 bg-[#111114] transition-all duration-300 hover:border-orange-500/40 hover:shadow-xl hover:shadow-orange-950/15"
      dir="rtl"
    >
      {/* ── Image & Badges Container ─────────────────────────────────────── */}
      <div className="relative aspect-[16/10] sm:aspect-[4/3] w-full overflow-hidden bg-neutral-900/90">
        <Image
          src={imgSrc}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 95vw, (max-width: 1024px) 45vw, 25vw"
          className={`object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105 ${
            isSoldOut ? "grayscale opacity-60" : ""
          }`}
          onError={() => {
            // Safe fallback if external image fails
            setImgSrc("https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&auto=format&fit=crop&q=80");
          }}
          loading="lazy"
        />

        {/* Sold out full-image overlay banner */}
        {isSoldOut && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/60 backdrop-blur-[2px]">
            <span className="rounded-xl border border-neutral-700 bg-neutral-900/95 px-3 py-1.5 text-xs font-bold text-neutral-300 shadow-xl">
              تکمیل ظرفیت فروش ویژه
            </span>
          </div>
        )}

        {/* Subtle dark gradient overlay for contrast */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#111114] via-transparent to-black/40" />

        {/* Top Badges */}
        <div className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 flex flex-wrap items-center gap-1.5 z-10 max-w-[calc(100%-16px)]">
          {/* Discount badge */}
          <div
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 sm:px-2.5 sm:py-1 text-[11px] sm:text-xs font-black text-white shadow-md ${
              isSoldOut
                ? "bg-neutral-800 text-neutral-400"
                : "bg-gradient-to-r from-red-600 to-orange-600 shadow-red-950/50"
            }`}
          >
            <Flame className={`h-3 w-3 sm:h-3.5 sm:w-3.5 fill-current ${isSoldOut ? "text-neutral-400" : "animate-pulse text-white"}`} />
            <span>{toPersianDigits(product.discountPercent)}٪ تخفیف</span>
          </div>

          {/* Secondary badge if available */}
          {product.brand && (
            <span className="rounded-full border border-white/10 bg-neutral-950/70 px-2 py-0.5 text-[10px] sm:text-[11px] font-medium text-neutral-300 backdrop-blur-sm">
              {product.brand}
            </span>
          )}
        </div>

        {/* Authentic Warranty indicator (positioned bottom-left in RTL to avoid badge clutter) */}
        <div className="absolute bottom-2 left-2 sm:bottom-2.5 sm:left-2.5 flex items-center gap-1 text-[10px] sm:text-[11px] font-medium text-emerald-400 bg-neutral-950/80 px-2 py-0.5 rounded-md backdrop-blur-sm border border-emerald-500/20">
          <ShieldCheck className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-emerald-400" />
          <span>ضمانت اصالت</span>
        </div>
      </div>

      {/* ── Content Container ────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col p-3.5 sm:p-5 text-right">
        {/* Title */}
        <h3 className="line-clamp-2 text-sm sm:text-base font-bold text-neutral-100 transition-colors group-hover:text-orange-400 min-h-[2.5rem] sm:min-h-[3rem] leading-snug sm:leading-normal">
          {product.name}
        </h3>

        {/* Description */}
        <p className="mt-1.5 line-clamp-2 text-[11px] sm:text-xs leading-relaxed text-neutral-400">
          {product.description}
        </p>

        {/* Key Specs Chips */}
        {product.specs && product.specs.length > 0 && (
          <div className="mt-2.5 flex flex-wrap gap-1 sm:gap-1.5">
            {product.specs.slice(0, 3).map((spec, idx) => (
              <span
                key={idx}
                className={`rounded-md border border-neutral-800 bg-neutral-900/90 px-1.5 py-0.5 sm:px-2 text-[10px] text-neutral-300 ${
                  idx >= 2 ? "hidden sm:inline-flex" : "inline-flex"
                }`}
              >
                {spec}
              </span>
            ))}
          </div>
        )}

        {/* ── Remaining Stock Meter (Pinned with mt-auto for perfect row alignment) ── */}
        <div className="mt-auto pt-3 sm:pt-4 border-t border-neutral-800/80">
          <SpecialOfferStockMeter
            stockRemaining={product.stockRemaining}
            stockTotal={product.stockTotal}
          />
        </div>

        {/* ── Pricing & Saving Breakdown ───────────────────────────────── */}
        <div className="mt-2.5 sm:mt-3 flex flex-col gap-1 rounded-xl bg-neutral-900/60 p-2 sm:p-2.5 border border-neutral-800/60">
          {/* Original price crossed-out */}
          <div className="flex items-center justify-between text-[11px] sm:text-xs text-neutral-500">
            <span className="flex items-center gap-1 shrink-0">
              <Tag className="h-3 w-3 shrink-0" />
              <span>قیمت اصلی:</span>
            </span>
            <span className="line-through decoration-red-500/70 font-medium whitespace-nowrap">
              {formatSpecialPrice(product.originalPrice)}
            </span>
          </div>

          {/* Discounted price */}
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-semibold text-orange-400 shrink-0">
              قیمت ویژه:
            </span>
            <span className="text-sm sm:text-lg font-black text-white whitespace-nowrap">
              {formatSpecialPrice(product.price)}
            </span>
          </div>

          {/* Saved amount notice */}
          {savedAmount > 0 && (
            <div className="flex items-center justify-between pt-1 border-t border-neutral-800/40 text-[10px] sm:text-[11px] text-emerald-400/90 font-medium">
              <span className="shrink-0">میزان تخفیف:</span>
              <span className="font-bold whitespace-nowrap">{formatSpecialPrice(savedAmount)}</span>
            </div>
          )}
        </div>

        {/* ── Add to Cart CTA Button or Numeric Stepper ─────────────────── */}
        <div className="mt-2.5 sm:mt-3">
          {inCartCount > 0 && !isSoldOut ? (
            <div
              className="flex w-full items-center justify-between rounded-xl border border-orange-500/70 bg-neutral-900/95 h-10 sm:h-11 px-2 shadow-md shadow-orange-950/30"
              role="group"
              aria-label="تغییر تعداد در سبد خرید"
            >
              <button
                type="button"
                onClick={handleDecrement}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-300 hover:bg-neutral-800 hover:text-white transition-all cursor-pointer active:scale-90"
                aria-label={inCartCount === 1 ? "حذف از سبد خرید" : "کاهش تعداد"}
              >
                {inCartCount === 1 ? (
                  <Trash2 className="h-4 w-4 text-red-400 hover:text-red-300 transition-colors" />
                ) : (
                  <Minus className="h-4 w-4" />
                )}
              </button>

              <div className="flex items-center gap-1">
                <span className="text-sm sm:text-base font-black text-white tabular-nums">
                  {toPersianDigits(inCartCount)}
                </span>
                <span className="text-[11px] text-neutral-400 font-medium">عدد در سبد</span>
              </div>

              <button
                type="button"
                onClick={handleIncrement}
                disabled={isMaxStockInCart}
                className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all cursor-pointer active:scale-90 ${
                  isMaxStockInCart
                    ? "text-neutral-600 bg-neutral-800/40 cursor-not-allowed"
                    : "bg-orange-600/25 text-orange-400 hover:bg-orange-600 hover:text-white"
                }`}
                aria-label="افزایش تعداد"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <Button
              ref={buttonRef}
              onClick={handleAddToCart}
              disabled={isCtaDisabled || isFlying}
              className={`w-full gap-1.5 sm:gap-2 rounded-xl h-10 sm:h-11 py-2 sm:py-2.5 text-xs sm:text-sm font-bold transition-all duration-200 ${
                isCtaDisabled
                  ? "bg-neutral-850 text-neutral-500 cursor-not-allowed border border-neutral-800"
                  : isFlying
                  ? "bg-orange-600/70 text-white animate-pulse"
                  : "bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white shadow-lg shadow-orange-950/40 active:scale-[0.98]"
              }`}
              aria-label={`افزودن ${product.name} به سبد خرید`}
            >
              {isSoldOut ? (
                <span>اتمام موجودی</span>
              ) : isFlying ? (
                <span>در حال انتقال داده...</span>
              ) : (
                <>
                  <ShoppingBag className="h-4 w-4 shrink-0" />
                  <span>افزودن به سبد خرید</span>
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}
