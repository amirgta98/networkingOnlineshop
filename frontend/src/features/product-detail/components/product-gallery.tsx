"use client";

import * as React from "react";
import Image from "next/image";
import {
  Maximize2,
  Share2,
  Heart,
  ShieldCheck,
  Tag,
  Check,
  ChevronRight,
  ChevronLeft,
  X,
} from "lucide-react";
import { Product } from "@/features/catalog/types";
import { toPersianDigits } from "@/shared/lib/utils";

export interface ProductGalleryProps {
  product: Product;
  activeImageIndex: number;
  onSelectImage: (index: number) => void;
  className?: string;
}

export function ProductGallery({
  product,
  activeImageIndex,
  onSelectImage,
  className = "",
}: ProductGalleryProps) {
  const [isZoomModalOpen, setIsZoomModalOpen] = React.useState(false);
  const [isFavorited, setIsFavorited] = React.useState(false);
  const [copiedToast, setCopiedToast] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);

  const images = product.images && product.images.length > 0
    ? product.images
    : ["https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=1000&auto=format&fit=crop&q=80"];

  const currentImage = images[activeImageIndex] || images[0];

  const hasDiscount =
    (product.discountPercent && product.discountPercent > 0) ||
    (product.originalPrice && product.originalPrice > product.price);

  const discountPercent =
    product.discountPercent ||
    (product.originalPrice
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0);

  const handleShare = async () => {
    try {
      if (typeof window !== "undefined") {
        await navigator.clipboard.writeText(window.location.href);
        setCopiedToast(true);
        setTimeout(() => setCopiedToast(false), 2500);
      }
    } catch {
      // Fallback
    }
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectImage((activeImageIndex - 1 + images.length) % images.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectImage((activeImageIndex + 1) % images.length);
  };

  return (
    <div className={`flex flex-col gap-4 ${className}`} dir="rtl">
      {/* ── Main Stage / Hero Image Display ──────────────────────────────── */}
      <div
        className="group relative aspect-[4/3] sm:aspect-[16/11] w-full overflow-hidden rounded-3xl border border-neutral-800/90 bg-[#111114] shadow-2xl shadow-black/60 select-none cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => setIsZoomModalOpen(true)}
        role="button"
        tabIndex={0}
        aria-label="بزرگ‌نمایی تصویر محصول"
        onKeyDown={(e) => e.key === "Enter" && setIsZoomModalOpen(true)}
      >
        {/* Main Image with Smooth Crossfade */}
        <div className="relative h-full w-full overflow-hidden">
          <Image
            src={currentImage}
            alt={`${product.name} - زاویه ${activeImageIndex + 1}`}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            className={`object-cover object-center transition-transform duration-500 ease-out ${
              isHovered ? "scale-105" : "scale-100"
            } ${!product.inStock ? "grayscale opacity-50" : ""}`}
          />
        </div>

        {/* Ambient Dark Gradient */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#09090b]/80 via-transparent to-black/30" />

        {/* Out of Stock Overlay */}
        {!product.inStock && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/65 backdrop-blur-sm">
            <span className="rounded-2xl border border-neutral-700 bg-neutral-900/95 px-5 py-2 text-sm font-bold text-neutral-300 shadow-xl">
              ناموجود در انبار
            </span>
          </div>
        )}

        {/* Top Badges (Discount, Brand) */}
        <div className="absolute top-3.5 right-3.5 z-10 flex flex-wrap items-center gap-2">
          {hasDiscount && discountPercent > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-red-600 px-3 py-1 text-xs font-black text-white shadow-lg shadow-red-950/60 animate-fade-in">
              <Tag className="h-3 w-3" />
              {toPersianDigits(discountPercent)}٪ تخفیف
            </span>
          )}

          {product.brand && (
            <span className="inline-flex items-center rounded-full border border-white/10 bg-neutral-950/80 px-2.5 py-1 text-xs font-semibold text-neutral-200 backdrop-blur-md">
              {product.brand}
            </span>
          )}
        </div>

        {/* Quick Actions (Share, Wishlist, Zoom) */}
        <div className="absolute top-3.5 left-3.5 z-10 flex items-center gap-1.5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleShare();
            }}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-neutral-900/80 text-neutral-300 hover:text-white hover:bg-neutral-800 backdrop-blur-md transition-all active:scale-90"
            aria-label="اشتراک‌گذاری محصول"
            title="کپی لینک محصول"
          >
            {copiedToast ? (
              <Check className="h-4 w-4 text-emerald-400" />
            ) : (
              <Share2 className="h-4 w-4" />
            )}
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsFavorited(!isFavorited);
            }}
            className={`flex h-9 w-9 items-center justify-center rounded-full border border-white/10 backdrop-blur-md transition-all active:scale-90 ${
              isFavorited
                ? "bg-red-950/70 border-red-500/40 text-red-400"
                : "bg-neutral-900/80 text-neutral-300 hover:text-white hover:bg-neutral-800"
            }`}
            aria-label={isFavorited ? "حذف از علاقه‌مندی‌ها" : "افزودن به علاقه‌مندی‌ها"}
          >
            <Heart
              className={`h-4 w-4 ${isFavorited ? "fill-red-500 text-red-500" : ""}`}
            />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsZoomModalOpen(true);
            }}
            className="hidden sm:flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-neutral-900/80 text-neutral-300 hover:text-white hover:bg-neutral-800 backdrop-blur-md transition-all active:scale-90"
            aria-label="بزرگ‌نمایی عکس"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>

        {/* Previous / Next Chevron Buttons for Multi-image */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-neutral-950/70 text-neutral-300 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-all hover:bg-neutral-900 hover:scale-105 active:scale-90 backdrop-blur-md"
              aria-label="تصویر قبلی"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-neutral-950/70 text-neutral-300 opacity-80 sm:opacity-0 group-hover:opacity-100 transition-all hover:bg-neutral-900 hover:scale-105 active:scale-90 backdrop-blur-md"
              aria-label="تصویر بعدی"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          </>
        )}

        {/* Bottom Hardware Info Indicator & Image Counter */}
        <div className="absolute bottom-3 right-3 left-3 z-10 flex items-center justify-between">
          <div className="flex items-center gap-1.5 rounded-lg border border-emerald-500/20 bg-neutral-950/85 px-2.5 py-1 text-[11px] font-medium text-emerald-400 backdrop-blur-md">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>تست اصالت و فلوک پاس شده</span>
          </div>

          {images.length > 1 && (
            <span className="rounded-md border border-white/10 bg-neutral-950/80 px-2 py-0.5 text-[11px] font-mono text-neutral-300 backdrop-blur-md">
              {toPersianDigits(activeImageIndex + 1)} / {toPersianDigits(images.length)}
            </span>
          )}
        </div>

        {/* Copied Toast Notification */}
        {copiedToast && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-neutral-900/95 px-4 py-2 text-xs font-semibold text-emerald-400 shadow-2xl backdrop-blur-md animate-fade-in">
            <Check className="h-4 w-4 text-emerald-400" />
            <span>لینک مستقیم محصول کپی شد</span>
          </div>
        )}
      </div>

      {/* ── Thumbnails Strip ────────────────────────────────────────────── */}
      {images.length > 1 && (
        <div
          className="flex items-center gap-2.5 overflow-x-auto pb-1.5 scrollbar-none"
          role="tablist"
          aria-label="تصاویر کوچک محصول"
        >
          {images.map((img, idx) => {
            const isActive = idx === activeImageIndex;
            return (
              <button
                key={idx}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => onSelectImage(idx)}
                className={`relative h-18 w-22 sm:h-20 sm:w-26 shrink-0 overflow-hidden rounded-xl border transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "border-orange-500 ring-2 ring-orange-500/30 shadow-md shadow-orange-950/30 scale-[1.03]"
                    : "border-neutral-800 bg-neutral-900/60 opacity-65 hover:opacity-100 hover:border-neutral-700"
                }`}
                aria-label={`نمایش تصویر شماره ${idx + 1}`}
              >
                <Image
                  src={img}
                  alt={`${product.name} بندانگشتی ${idx + 1}`}
                  fill
                  sizes="100px"
                  className="object-cover object-center"
                />
              </button>
            );
          })}
        </div>
      )}

      {/* ── Zoom / Fullscreen Modal ─────────────────────────────────────── */}
      {isZoomModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-md animate-fade-in"
          onClick={() => setIsZoomModalOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="نمایش بزرگ تصویر"
        >
          <div
            className="relative max-h-[90vh] max-w-5xl w-full aspect-[4/3] rounded-3xl overflow-hidden border border-neutral-700 bg-neutral-950 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={currentImage}
              alt={product.name}
              fill
              className="object-contain p-4"
              priority
            />

            {/* Close button */}
            <button
              type="button"
              onClick={() => setIsZoomModalOpen(false)}
              className="absolute top-4 left-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-neutral-900/80 border border-white/10 text-white hover:bg-neutral-800 transition-colors"
              aria-label="بستن پنجره بزرگ‌نمایی"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Navigation inside modal */}
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrev}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-neutral-900/80 border border-white/10 text-white hover:bg-neutral-800 transition-colors"
                  aria-label="تصویر قبلی"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-neutral-900/80 border border-white/10 text-white hover:bg-neutral-800 transition-colors"
                  aria-label="تصویر بعدی"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
