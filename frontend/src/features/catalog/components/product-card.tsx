"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ShoppingBag,
  Check,
  Star,
  ShieldCheck,
  Tag,
  Eye,
  Plus,
  Minus,
  Trash2,
  Wifi,
} from "lucide-react";
import { Product } from "../types";
import { useCart } from "@/features/cart";
import { SelectedOptionDetail } from "@/features/cart/types";
import { Button } from "@/shared/components/ui/button";
import { formatPrice, toPersianDigits } from "@/shared/lib/utils";
import { ProductOptionsModal } from "./product-options-modal";

export interface ProductCardProps {
  product: Product;
  className?: string;
  onViewDetails?: (product: Product) => void;
}

export function ProductCard({
  product,
  className = "",
  onViewDetails,
}: ProductCardProps) {
  const { items, addItem, updateQuantity, removeItem, triggerCartBump, flyToCart } = useCart();
  const [isOptionsModalOpen, setIsOptionsModalOpen] = React.useState(false);
  const [isFlying, setIsFlying] = React.useState(false);
  const buttonRef = React.useRef<HTMLButtonElement | null>(null);
  const cardRef = React.useRef<HTMLElement | null>(null);

  const [imgSrc, setImgSrc] = React.useState(
    product.images[0] || "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&auto=format&fit=crop&q=80"
  );

  const hasOptions = Boolean(product.options && product.options.length > 0);

  // Cart status for this product
  const matchingItems = items.filter((item) => item.product.id === product.id);
  const inCartCount = matchingItems.reduce((acc, item) => acc + item.quantity, 0);
  const firstCartItem = matchingItems[0];

  const hasDiscount =
    (product.discountPercent && product.discountPercent > 0) ||
    (product.originalPrice && product.originalPrice > product.price);

  const discountPercent =
    product.discountPercent ||
    (product.originalPrice
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0);

  const handleAddToCart = async () => {
    if (!product.inStock || isFlying) return;

    if (hasOptions) {
      setIsOptionsModalOpen(true);
      return;
    }

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

  const handleConfirmOptions = async (optionsData: {
    quantity: number;
    selectedDetails: Record<string, SelectedOptionDetail>;
    unitPrice: number;
  }) => {
    // 1. Close modal first
    setIsOptionsModalOpen(false);

    // 2. Wait for modal exit animation to finish before launching packet
    await new Promise((resolve) => setTimeout(resolve, 200));

    // 3. Trigger flying animation from product card button to cart
    const targetElement = buttonRef.current || cardRef.current;
    if (targetElement) {
      setIsFlying(true);
      try {
        await flyToCart(targetElement, product);
      } finally {
        setIsFlying(false);
      }
    }

    // 4. Add configured product with options and quantity to cart
    addItem(
      product,
      optionsData.quantity,
      optionsData.selectedDetails,
      optionsData.unitPrice
    );
  };

  const handleIncrement = () => {
    if (!product.inStock) return;
    if (firstCartItem) {
      updateQuantity(firstCartItem.id, firstCartItem.quantity + 1);
    } else {
      addItem(product, 1);
    }
    triggerCartBump();
  };

  const handleDecrement = () => {
    if (firstCartItem) {
      if (firstCartItem.quantity <= 1) {
        removeItem(firstCartItem.id);
      } else {
        updateQuantity(firstCartItem.id, firstCartItem.quantity - 1);
      }
    }
  };

  return (
    <article
      ref={cardRef}
      className={`group relative flex h-full flex-row sm:flex-col overflow-hidden rounded-2xl border border-neutral-800/90 bg-[#111114] transition-all duration-300 hover:border-neutral-700 hover:shadow-xl hover:shadow-black/40 ${className}`}
      dir="rtl"
    >
      {/* ── Image & Badges Container ─────────────────────────────────────── */}
      <Link
        href={`/products/${product.slug}`}
        className="relative w-36 xs:w-40 sm:w-full shrink-0 overflow-hidden bg-neutral-900/90 self-stretch sm:self-auto sm:aspect-[4/3] min-h-[170px] sm:min-h-0 block cursor-pointer"
        aria-label={`مشاهده جزئیات ${product.name}`}
      >
        <Image
          src={imgSrc}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 160px, (max-width: 1024px) 50vw, 33vw"
          className={`object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105 ${
            !product.inStock ? "grayscale opacity-50" : ""
          }`}
          onError={() => {
            setImgSrc("https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&auto=format&fit=crop&q=80");
          }}
          loading="lazy"
        />

        {/* Out of stock overlay */}
        {!product.inStock && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/65 backdrop-blur-[2px]">
            <span className="rounded-xl border border-neutral-700 bg-neutral-900/95 px-2.5 sm:px-3.5 py-1 sm:py-1.5 text-[11px] sm:text-xs font-bold text-neutral-300 shadow-xl">
              ناموجود
            </span>
          </div>
        )}

        {/* Dark gradient overlay */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#111114] via-transparent to-black/40" />

        {/* Top Badges */}
        <div className="absolute top-2 right-2 sm:top-3 sm:right-3 flex flex-wrap items-center gap-1 sm:gap-1.5 z-10 max-w-[calc(100%-12px)] sm:max-w-[calc(100%-16px)]">
          {hasDiscount && discountPercent > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-red-600 px-2 py-0.5 sm:px-2.5 text-[10px] sm:text-[11px] font-black text-white shadow-md shadow-red-950/40">
              {toPersianDigits(discountPercent)}٪ تخفیف
            </span>
          )}

          {product.brand && (
            <span className="hidden xs:inline-flex sm:inline-flex rounded-full border border-white/10 bg-neutral-950/70 px-1.5 py-0.5 sm:px-2 text-[9px] sm:text-[11px] font-medium text-neutral-300 backdrop-blur-sm">
              {product.brand}
            </span>
          )}
        </div>

        {/* Warranty indicator */}
        <div className="absolute bottom-2 left-2 sm:bottom-2.5 sm:left-2.5 flex items-center gap-1 text-[9px] sm:text-[11px] font-medium text-emerald-400 bg-neutral-950/85 px-1.5 py-0.5 sm:px-2 rounded-md backdrop-blur-sm border border-emerald-500/20">
          <ShieldCheck className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-emerald-400" />
          <span>ضمانت اصالت</span>
        </div>
      </Link>

      {/* ── Content Container ────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col p-3 sm:p-4 text-right min-w-0 justify-between">
        <div>
          {/* Rating and Reviews */}
          <div className="flex items-center justify-between text-xs text-neutral-400 mb-1.5 sm:mb-2">
            <div className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span className="font-semibold text-neutral-200 text-[11px] sm:text-xs">{toPersianDigits(product.rating)}</span>
              <span className="text-[10px] sm:text-[11px] text-neutral-500">({toPersianDigits(product.reviewCount)})</span>
            </div>

            <span className={`text-[10px] sm:text-[11px] font-medium flex items-center gap-1 ${
              product.inStock ? "text-emerald-400" : "text-neutral-500"
            }`}>
              <span className={`inline-block h-1.5 w-1.5 rounded-full ${
                product.inStock ? "bg-emerald-400" : "bg-neutral-600"
              }`} />
              {product.inStock ? "موجود در انبار" : "ناموجود"}
            </span>
          </div>

          {/* Title */}
          <h3 className="line-clamp-2 text-xs sm:text-base font-bold text-neutral-100 transition-colors group-hover:text-orange-400 min-h-[2rem] sm:min-h-[2.5rem] leading-snug">
            <Link href={`/products/${product.slug}`}>
              {product.name}
            </Link>
          </h3>

          {/* Description (desktop only for optimal mobile height) */}
          <p className="hidden sm:block mt-1.5 line-clamp-2 text-[11px] sm:text-xs leading-relaxed text-neutral-400">
            {product.description}
          </p>

          {/* Key Specs Chips */}
          {product.specs && product.specs.length > 0 && (
            <div className="mt-1.5 sm:mt-2.5 flex flex-wrap gap-1">
              {product.specs.slice(0, 3).map((spec, idx) => (
                <span
                  key={idx}
                  className="rounded-md border border-neutral-800 bg-neutral-900/90 px-1.5 py-0.5 text-[9px] sm:text-[10px] text-neutral-300 truncate max-w-[130px] sm:max-w-none"
                >
                  {spec}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* ── Pricing & CTA ───────────────────────────────────────────── */}
        <div className="mt-auto pt-2.5 sm:pt-3.5 border-t border-neutral-800/80">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            {hasDiscount && product.originalPrice ? (
              <div className="flex flex-col">
                <span className="line-through text-[10px] sm:text-xs text-neutral-500 decoration-red-500/60 font-medium whitespace-nowrap">
                  {formatPrice(product.originalPrice)}
                </span>
                <span className="text-sm sm:text-lg font-black text-white whitespace-nowrap">
                  {formatPrice(product.price)}
                </span>
              </div>
            ) : (
              <div className="flex flex-col">
                <span className="text-[10px] sm:text-[11px] text-neutral-400">قیمت نهایی:</span>
                <span className="text-sm sm:text-lg font-black text-white whitespace-nowrap">
                  {formatPrice(product.price)}
                </span>
              </div>
            )}

            {hasDiscount && (
              <span className="inline-flex items-center gap-0.5 text-[10px] sm:text-[11px] text-emerald-400 bg-emerald-950/30 border border-emerald-500/20 px-1.5 sm:px-2 py-0.5 rounded-md shrink-0 whitespace-nowrap">
                <Tag className="h-3 w-3" />
                تخفیف‌دار
              </span>
            )}
          </div>

          {/* ── Action Area (Horizontal Row) ─────────────────────────── */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Primary Action: Numeric Stepper (if in cart) or Add to Cart Button */}
            {inCartCount > 0 ? (
              <div
                className="flex flex-1 items-center justify-between rounded-xl border border-orange-500/70 bg-neutral-900/95 h-9 sm:h-10 px-1 sm:px-1.5 shadow-md shadow-orange-950/20"
                role="group"
                aria-label="تغییر تعداد در سبد خرید"
              >
                {/* Decrement or Remove */}
                <button
                  type="button"
                  onClick={handleDecrement}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-neutral-300 hover:bg-neutral-800 hover:text-white transition-all cursor-pointer active:scale-90"
                  aria-label={inCartCount === 1 ? "حذف از سبد خرید" : "کاهش تعداد"}
                >
                  {inCartCount === 1 ? (
                    <Trash2 className="h-3.5 w-3.5 text-red-400 hover:text-red-300 transition-colors" />
                  ) : (
                    <Minus className="h-3.5 w-3.5" />
                  )}
                </button>

                {/* Counter */}
                <div className="flex items-center gap-1">
                  <span className="text-xs sm:text-sm font-black text-white tabular-nums">
                    {toPersianDigits(inCartCount)}
                  </span>
                  <span className="text-[9px] sm:text-[10px] text-neutral-400 font-medium">عدد</span>
                </div>

                {/* Increment */}
                <button
                  type="button"
                  onClick={handleIncrement}
                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-600/20 text-orange-400 hover:bg-orange-600 hover:text-white transition-all cursor-pointer active:scale-90"
                  aria-label="افزایش تعداد"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <Button
                ref={buttonRef}
                onClick={handleAddToCart}
                disabled={!product.inStock || isFlying}
                className={`flex-1 gap-1.5 sm:gap-2 rounded-xl h-9 sm:h-10 py-1.5 sm:py-2.5 text-xs sm:text-sm font-bold transition-all duration-200 ${
                  !product.inStock
                    ? "bg-neutral-850 text-neutral-500 cursor-not-allowed border border-neutral-800"
                    : isFlying
                    ? "bg-orange-600/70 text-white animate-pulse"
                    : "bg-orange-600 hover:bg-orange-500 text-white shadow-md shadow-orange-950/30 active:scale-[0.98]"
                }`}
                aria-label={`افزودن ${product.name} به سبد خرید`}
              >
                {!product.inStock ? (
                  <span>ناموجود</span>
                ) : isFlying ? (
                  <>
                    <Wifi className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin text-white" />
                    <span>انتقال...</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span>افزودن به سبد</span>
                  </>
                )}
              </Button>
            )}

            {/* Secondary Action: Details (Secondary ~30% width) */}
            {onViewDetails ? (
              <Button
                variant="secondary"
                onClick={() => onViewDetails(product)}
                className="shrink-0 gap-1 sm:gap-1.5 rounded-xl h-9 sm:h-10 py-1.5 sm:py-2.5 px-2.5 sm:px-3 text-xs sm:text-sm font-medium transition-all duration-200"
                aria-label={`مشاهده جزئیات ${product.name}`}
              >
                <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span>جزئیات</span>
              </Button>
            ) : (
              <Link
                href={`/products/${product.slug}`}
                className="shrink-0 inline-flex items-center justify-center gap-1 sm:gap-1.5 rounded-xl h-9 sm:h-10 py-1.5 sm:py-2.5 px-2.5 sm:px-3 text-xs sm:text-sm font-medium border border-neutral-700/70 bg-neutral-800/80 text-neutral-200 hover:bg-neutral-700 hover:text-white transition-all duration-200 active:scale-95 cursor-pointer"
                aria-label={`مشاهده جزئیات ${product.name}`}
              >
                <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span>جزئیات</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ── Product Options / Variant Selection Modal ───────────────── */}
      {hasOptions && (
        <ProductOptionsModal
          product={product}
          isOpen={isOptionsModalOpen}
          onClose={() => setIsOptionsModalOpen(false)}
          onConfirm={handleConfirmOptions}
        />
      )}
    </article>
  );
}
