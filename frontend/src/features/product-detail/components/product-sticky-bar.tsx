"use client";

import * as React from "react";
import Image from "next/image";
import { ShoppingBag, Wifi } from "lucide-react";
import { Product } from "@/features/catalog/types";
import { SelectedOptionDetail } from "@/features/cart/types";
import { useCart } from "@/features/cart";
import { Button } from "@/shared/components/ui/button";
import { formatPrice } from "@/shared/lib/utils";
import { RollingNumber } from "@/shared/components/motion";

export interface ProductStickyBarProps {
  product: Product;
  unitPrice: number;
  selectedOptions: Record<string, SelectedOptionDetail>;
}

export function ProductStickyBar({
  product,
  unitPrice,
  selectedOptions,
}: ProductStickyBarProps) {
  const [isVisible, setIsVisible] = React.useState(false);
  const [isFlying, setIsFlying] = React.useState(false);
  const buttonRef = React.useRef<HTMLButtonElement | null>(null);
  const { addItem, flyToCart } = useCart();

  React.useEffect(() => {
    const handleScroll = () => {
      // Show when scrolled down past ~550px
      if (window.scrollY > 550) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!isVisible) return null;

  const handleAddToCart = async () => {
    if (!product.inStock || isFlying) return;

    if (buttonRef.current) {
      setIsFlying(true);
      try {
        await flyToCart(buttonRef.current, product);
      } finally {
        setIsFlying(false);
      }
    }

    addItem(product, 1, selectedOptions, unitPrice);
  };

  const imageSrc =
    product.images && product.images.length > 0
      ? product.images[0]
      : "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&auto=format&fit=crop&q=80";

  return (
    <div
      className="hidden md:block fixed bottom-0 inset-x-0 z-40 border-t border-neutral-800/90 bg-[#0c0c0e]/95 backdrop-blur-xl py-3 px-4 shadow-2xl transition-all duration-300 animate-slide-in-right"
      dir="rtl"
    >
      <div className="mx-auto max-w-7xl flex items-center justify-between gap-4">
        {/* Left: Product Thumbnail & Title */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900">
            <Image
              src={imageSrc}
              alt={product.name}
              fill
              sizes="44px"
              className="object-cover"
            />
          </div>

          <div className="min-w-0">
            <h3 className="text-xs sm:text-sm font-bold text-white truncate max-w-[200px] sm:max-w-md">
              {product.name}
            </h3>
            <span className="text-[10px] text-emerald-400 font-medium hidden sm:inline-block">
              {product.inStock ? "موجود در انبار" : "ناموجود"}
            </span>
          </div>
        </div>

        {/* Right: Price & Quick Add Button */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-neutral-400 hidden sm:inline-block">
              قیمت نهایی:
            </span>
            <RollingNumber
              value={unitPrice}
              className="text-sm sm:text-lg font-black text-white"
            />
          </div>

          <Button
            ref={buttonRef}
            type="button"
            onClick={handleAddToCart}
            disabled={!product.inStock || isFlying}
            className={`h-10 px-4 sm:px-6 rounded-xl text-xs sm:text-sm font-bold gap-2 transition-all cursor-pointer ${
              !product.inStock
                ? "bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-700"
                : isFlying
                ? "bg-orange-600/80 text-white animate-pulse"
                : "bg-orange-600 hover:bg-orange-500 text-white shadow-md shadow-orange-950/40 active:scale-95"
            }`}
            aria-label={`افزودن ${product.name} به سبد خرید`}
          >
            {isFlying ? (
              <>
                <Wifi className="h-4 w-4 animate-spin text-white" />
                <span className="hidden sm:inline">در حال ارسال...</span>
              </>
            ) : (
              <>
                <ShoppingBag className="h-4 w-4" />
                <span>
                  {!product.inStock ? "ناموجود" : "افزودن به سبد"}
                </span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
