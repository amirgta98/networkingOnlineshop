"use client";

import * as React from "react";
import { Star, Copy, Check, ShieldCheck, Zap, Sparkles, Percent } from "lucide-react";
import { Product } from "@/features/catalog/types";
import { formatPrice, toPersianDigits, cn } from "@/shared/lib/utils";
import { RollingNumber } from "@/shared/components/motion";
import { TieredPricingProgress } from "./tiered-pricing-progress";

export interface ProductInfoProps {
  product: Product;
  /** Base unit price with options (or legacy calculatedPrice) */
  calculatedPrice?: number;
  unitPrice?: number;
  /** Selected quantity */
  quantity?: number;
  /** Effective single unit price after any tiered discount */
  effectiveUnitPrice?: number;
  /** Total price for the chosen quantity */
  totalPrice?: number;
  /** Original strikethrough unit price with options */
  calculatedOriginalPrice?: number;
  /** Active tiered discount percentage (e.g. 12) */
  tieredDiscountPercent?: number;
  /** Callback to change quantity from tiered shortcut chips */
  onSelectTierQuantity?: (qty: number) => void;
  onReviewsClick?: () => void;
  className?: string;
}

export function ProductInfo({
  product,
  calculatedPrice,
  unitPrice: propUnitPrice,
  quantity = 1,
  effectiveUnitPrice: propEffectiveUnitPrice,
  totalPrice: propTotalPrice,
  calculatedOriginalPrice,
  tieredDiscountPercent = 0,
  onSelectTierQuantity,
  onReviewsClick,
  className = "",
}: ProductInfoProps) {
  const [skuCopied, setSkuCopied] = React.useState(false);

  const sku = product.sku || product.id;

  // Base unit price (with options, before tiered discounts)
  const baseUnitPrice = propUnitPrice ?? calculatedPrice ?? product.price;

  // Effective unit price after tiered discount
  const effectiveUnitPrice =
    propEffectiveUnitPrice ??
    (tieredDiscountPercent > 0
      ? Math.round(baseUnitPrice * (1 - tieredDiscountPercent / 100))
      : baseUnitPrice);

  // Total price for current quantity
  const totalPrice = propTotalPrice ?? effectiveUnitPrice * quantity;

  // Original unit price (strikethrough)
  const baseOriginalUnitPrice = calculatedOriginalPrice || product.originalPrice;

  // Total original price (strikethrough)
  // If product has originalPrice, scale it by quantity; otherwise if tiered discount active, scale baseUnitPrice by quantity
  const totalOriginalPrice = baseOriginalUnitPrice
    ? baseOriginalUnitPrice * quantity
    : tieredDiscountPercent > 0
    ? baseUnitPrice * quantity
    : undefined;

  const hasDiscount = totalOriginalPrice ? totalOriginalPrice > totalPrice : false;

  const overallDiscountPercent =
    totalOriginalPrice && hasDiscount
      ? Math.round(((totalOriginalPrice - totalPrice) / totalOriginalPrice) * 100)
      : product.discountPercent || 0;

  const totalSavings = totalOriginalPrice && hasDiscount ? totalOriginalPrice - totalPrice : 0;

  const handleCopySku = async () => {
    try {
      if (typeof window !== "undefined") {
        await navigator.clipboard.writeText(sku);
        setSkuCopied(true);
        setTimeout(() => setSkuCopied(false), 2000);
      }
    } catch {
      // Fallback
    }
  };

  return (
    <div className={cn("flex flex-col gap-4 text-right", className)} dir="rtl">
      {/* ── Brand & SKU Badge Row ────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          {product.brand && (
            <span className="rounded-lg border border-orange-500/20 bg-orange-950/30 px-3 py-1 text-xs font-black text-orange-400">
              برند رسمی {product.brand}
            </span>
          )}

          {product.featured && (
            <span className="inline-flex items-center gap-1 rounded-lg border border-amber-500/20 bg-amber-950/30 px-2.5 py-1 text-xs font-bold text-amber-300">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              پیشنهاد ویژه
            </span>
          )}
        </div>

        {/* SKU Code with Copy Action */}
        <button
          type="button"
          onClick={handleCopySku}
          className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-800 bg-neutral-900/90 px-2.5 py-1 text-xs text-neutral-400 hover:border-neutral-700 hover:text-neutral-200 transition-colors cursor-pointer"
          title="کپی شناسه کالا"
          aria-label={`کپی کد فنی ${sku}`}
        >
          <span className="font-mono text-[11px] text-neutral-300">{sku}</span>
          <span className="text-[10px] text-neutral-500">پارت‌نامبر:</span>
          {skuCopied ? (
            <Check className="h-3.5 w-3.5 text-emerald-400" />
          ) : (
            <Copy className="h-3 w-3 text-neutral-500" />
          )}
        </button>
      </div>

      {/* ── Main Product Title (H1 for SEO) ──────────────────────────────── */}
      <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-white leading-snug tracking-tight">
        {product.name}
      </h1>

      {/* ── Rating, Reviews & Live Stock Status ──────────────────────────── */}
      <div className="flex flex-wrap items-center gap-4 text-xs border-b border-neutral-800/80 pb-4">
        {/* Rating Stars & Count */}
        <button
          type="button"
          onClick={onReviewsClick}
          className="flex items-center gap-1.5 text-neutral-300 hover:text-orange-400 transition-colors cursor-pointer"
          aria-label="مشاهده نظرات کاربران"
        >
          <div className="flex items-center gap-0.5">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
            <span className="font-bold text-neutral-100 text-sm">
              {toPersianDigits(product.rating)}
            </span>
          </div>
          <span className="text-neutral-500 underline decoration-dotted">
            ({toPersianDigits(product.reviewCount)} دیدگاه متخصصان)
          </span>
        </button>

        <span className="h-3 w-px bg-neutral-800" aria-hidden="true" />

        {/* Live Stock Indicator with Emerald Pulse */}
        <div className="flex items-center gap-2">
          {product.inStock ? (
            <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <span>موجود در انبار مرکزی (آماده ارسال فوری)</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-neutral-500 font-semibold">
              <span className="h-2 w-2 rounded-full bg-neutral-600" />
              <span>ناموجود (امکان سفارش‌گذاری تأمین)</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Short Description & Key Highlights ───────────────────────────── */}
      <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
        {product.description}
      </p>

      {/* Quick Specs Chips */}
      {product.specs && product.specs.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {product.specs.map((spec, idx) => (
            <div
              key={idx}
              className="inline-flex items-center gap-1 rounded-lg border border-neutral-800 bg-[#141418] px-2.5 py-1 text-xs text-neutral-300 font-medium"
            >
              <Zap className="h-3 w-3 text-orange-500" />
              <span>{spec}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── Tiered Pricing Gamification Bar (Strictly conditionally rendered) ── */}
      <TieredPricingProgress
        tieredPricing={product.tieredPricing}
        quantity={quantity}
        onSelectTierQuantity={onSelectTierQuantity}
        baseUnitPrice={baseUnitPrice}
      />

      {/* ── Pricing & Savings Box with Rolling Number Animation ─────────── */}
      <div className="rounded-2xl border border-neutral-800 bg-[#121215] p-4 sm:p-5 shadow-inner transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="flex flex-col">
            <span className="text-xs text-neutral-400 block mb-1 font-medium">
              {quantity > 1 ? (
                <span>
                  مجموع قیمت سفارش (
                  <strong className="text-orange-400 font-black">
                    {toPersianDigits(quantity)} عدد
                  </strong>
                  ):
                </span>
              ) : (
                "قیمت نهایی با احتساب تخفیف:"
              )}
            </span>

            {/* Rolling Number Display */}
            <div className="flex items-baseline gap-2">
              <RollingNumber
                value={totalPrice}
                className="text-2xl sm:text-3xl lg:text-4xl font-black text-white"
                currencyClassName="text-sm font-semibold text-neutral-400 mr-1"
              />
            </div>

            {/* Unit Price breakdown when quantity > 1 */}
            {quantity > 1 && (
              <div className="flex items-center gap-2 mt-1.5 text-xs text-neutral-400">
                <span>قیمت هر واحد:</span>
                <span className="font-bold text-neutral-200 tabular-nums">
                  {formatPrice(effectiveUnitPrice)}
                </span>
                {tieredDiscountPercent > 0 && (
                  <span className="inline-flex items-center gap-0.5 rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/30">
                    <Percent className="h-2.5 w-2.5" />
                    {toPersianDigits(tieredDiscountPercent)}٪ تخفیف پلکانی
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Strikethrough & Savings Column */}
          {hasDiscount && (
            <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1 pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-800/80">
              <div className="flex items-center gap-2 shrink-0 whitespace-nowrap">
                <span className="line-through text-xs sm:text-sm text-neutral-500 font-medium decoration-red-500/70 tabular-nums">
                  {formatPrice(totalOriginalPrice!)}
                </span>
                <span className="rounded-full bg-red-600 px-2 py-0.5 text-[11px] font-black text-white shadow-md shadow-red-950/40 shrink-0 whitespace-nowrap">
                  {toPersianDigits(overallDiscountPercent)}٪ تخفیف
                </span>
              </div>

              {totalSavings > 0 && (
                <span className="text-[11px] sm:text-xs text-emerald-400 font-bold shrink-0 whitespace-nowrap">
                  سود کل شما: {formatPrice(totalSavings)}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Warranty Statement */}
        <div className="mt-3.5 pt-3 border-t border-neutral-800/80 flex items-center gap-2 text-xs text-neutral-300">
          <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
          <span>
            {product.warranty || "گارانتی رسمی ۲۴ ماهه طلایی با تعویض بدون قیدوشرط سخت‌افزار"}
          </span>
        </div>
      </div>
    </div>
  );
}

