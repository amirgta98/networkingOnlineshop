"use client";

import * as React from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Keyboard, A11y } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  Play,
  ImageIcon,
  Video,
  Layers,
} from "lucide-react";
import { MediaItem } from "@/shared/types";
import { MediaPlayer } from "./media-player";
import { toPersianDigits } from "@/shared/lib/utils";

// Swiper CSS
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export interface MediaGallerySwiperProps {
  media: MediaItem[];
  title?: string;
  className?: string;
  aspectRatioClass?: string;
  showThumbnails?: boolean;
}

function GalleryImage({
  src,
  alt,
  priority,
}: {
  src: string;
  alt: string;
  priority?: boolean;
}) {
  const [hasError, setHasError] = React.useState(false);

  if (hasError) {
    return (
      <div className="relative h-full w-full flex flex-col items-center justify-center bg-gradient-to-br from-[#121217] via-[#17171f] to-[#0c0c10] p-6 text-center select-none">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500/10 border border-orange-500/30 text-orange-400 mb-3 shadow-lg">
          <ImageIcon className="h-7 w-7" />
        </div>
        <p className="text-sm font-bold text-white mb-1 truncate max-w-md">{alt}</p>
        <span className="text-xs text-neutral-400">تصویر باکیفیت پروژه و مستندات فنی ققنوس آکادمی</span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      priority={priority}
      sizes="(max-width: 1024px) 100vw, 1000px"
      onError={() => setHasError(true)}
      className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
    />
  );
}

function ThumbnailImage({ src, alt }: { src: string; alt: string }) {
  const [hasError, setHasError] = React.useState(false);

  if (hasError) {
    return (
      <div className="relative h-full w-full flex items-center justify-center bg-neutral-900 text-neutral-500">
        <ImageIcon className="h-5 w-5" />
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes="128px"
      onError={() => setHasError(true)}
      className="object-cover"
    />
  );
}

export function MediaGallerySwiper({
  media,
  title,
  className = "",
  aspectRatioClass = "aspect-[16/9] sm:aspect-[21/9]",
  showThumbnails = true,
}: MediaGallerySwiperProps) {
  const [mainSwiper, setMainSwiper] = React.useState<SwiperType | null>(null);
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = React.useState(false);
  const [lightboxIndex, setLightboxIndex] = React.useState(0);
  const thumbsContainerRef = React.useRef<HTMLDivElement>(null);

  // If media list is empty, guard against undefined
  const items = React.useMemo(() => {
    if (media && media.length > 0) return media;
    return [
      {
        type: "image" as const,
        url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1000&auto=format&fit=crop&q=80",
        title: title || "تصویر گالری",
      },
    ];
  }, [media, title]);

  const activeItem = items[activeIndex] || items[0];

  // Open Lightbox
  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setIsLightboxOpen(true);
  };

  // Auto-scroll active thumbnail into view
  React.useEffect(() => {
    if (!thumbsContainerRef.current) return;
    const activeThumb = thumbsContainerRef.current.children[activeIndex] as HTMLElement;
    if (activeThumb) {
      activeThumb.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [activeIndex]);

  // Keyboard navigation for lightbox
  React.useEffect(() => {
    if (!isLightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsLightboxOpen(false);
      } else if (e.key === "ArrowLeft") {
        setLightboxIndex((prev) => (prev + 1) % items.length);
      } else if (e.key === "ArrowRight") {
        setLightboxIndex((prev) => (prev - 1 + items.length) % items.length);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    const origOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = origOverflow;
    };
  }, [isLightboxOpen, items.length]);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    mainSwiper?.slidePrev();
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    mainSwiper?.slideNext();
  };

  return (
    <div className={`flex flex-col gap-3.5 select-none ${className}`} dir="rtl">
      {/* ── Main Showcase Swiper ────────────────────────────────────────── */}
      <div
        className={`group relative w-full ${aspectRatioClass} overflow-hidden rounded-3xl border border-neutral-800 bg-[#0d0d10] shadow-2xl`}
      >
        <Swiper
          modules={[Navigation, Pagination, Keyboard, A11y]}
          onSwiper={setMainSwiper}
          onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
          keyboard={{ enabled: true }}
          simulateTouch={true}
          speed={400}
          className="h-full w-full"
        >
          {items.map((item, idx) => {
            const isSlideActive = idx === activeIndex;

            return (
              <SwiperSlide key={item.id || idx} className="h-full w-full">
                {item.type === "video" ? (
                  <MediaPlayer
                    src={item.url}
                    poster={item.thumbnailUrl}
                    title={item.title || title}
                    caption={item.caption}
                    isActiveSlide={isSlideActive}
                    className="h-full w-full"
                  />
                ) : (
                  <div
                    onClick={() => openLightbox(idx)}
                    className="relative h-full w-full overflow-hidden cursor-zoom-in"
                  >
                    <GalleryImage
                      src={item.url}
                      alt={item.title || title || `تصویر ${idx + 1}`}
                      priority={idx === 0}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                  </div>
                )}
              </SwiperSlide>
            );
          })}
        </Swiper>

        {/* ── Top Floating Overlay Bar ──────────────────────────────────── */}
        <div className="pointer-events-none absolute top-3 inset-x-3 sm:top-4 sm:inset-x-4 z-20 flex items-center justify-between">
          {/* Active Item Type & Counter */}
          <div className="pointer-events-auto flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/65 backdrop-blur-md px-3 py-1 text-xs font-semibold text-white shadow-lg">
              {activeItem.type === "video" ? (
                <>
                  <Video className="h-3.5 w-3.5 text-orange-400" />
                  <span>ویدیو</span>
                </>
              ) : (
                <>
                  <ImageIcon className="h-3.5 w-3.5 text-cyan-400" />
                  <span>تصویر</span>
                </>
              )}
            </span>

            {items.length > 1 && (
              <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-black/65 backdrop-blur-md px-3 py-1 text-xs font-mono font-medium text-neutral-200 shadow-lg">
                <Layers className="h-3.5 w-3.5 text-orange-400" />
                <span>
                  {toPersianDigits(activeIndex + 1)} / {toPersianDigits(items.length)}
                </span>
              </span>
            )}
          </div>

          {/* Lightbox / Zoom Action */}
          <div className="pointer-events-auto flex items-center gap-2">
            <button
              type="button"
              onClick={() => openLightbox(activeIndex)}
              aria-label="بزرگ‌نمایی و نمایش تمام‌صفحه"
              className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl border border-white/10 bg-black/65 backdrop-blur-md text-neutral-300 hover:text-white hover:border-orange-500/50 hover:bg-orange-600/30 transition-all cursor-pointer shadow-lg"
              title="نمایش تمام‌صفحه"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* ── Caption Overlay (If available) ────────────────────────────── */}
        {activeItem.caption && (
          <div className="pointer-events-none absolute bottom-3 right-3 left-3 sm:bottom-4 sm:right-4 sm:left-4 z-20">
            <div className="inline-block max-w-lg rounded-xl border border-white/10 bg-black/75 backdrop-blur-md px-3.5 py-1.5 text-xs text-neutral-200 shadow-lg truncate">
              {activeItem.caption}
            </div>
          </div>
        )}

        {/* ── Prev / Next Navigation Arrows ─────────────────────────────── */}
        {items.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              aria-label="اسلاید قبلی"
              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-2xl border border-white/10 bg-black/60 backdrop-blur-md text-white shadow-xl transition-all duration-200 hover:scale-105 hover:bg-orange-600 hover:border-orange-500 cursor-pointer opacity-90 hover:opacity-100"
            >
              <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>

            <button
              type="button"
              onClick={handleNext}
              aria-label="اسلاید بعدی"
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-2xl border border-white/10 bg-black/60 backdrop-blur-md text-white shadow-xl transition-all duration-200 hover:scale-105 hover:bg-orange-600 hover:border-orange-500 cursor-pointer opacity-90 hover:opacity-100"
            >
              <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          </>
        )}
      </div>

      {/* ── Thumbnails Strip ────────────────────────────────────────────── */}
      {showThumbnails && items.length > 1 && (
        <div
          ref={thumbsContainerRef}
          className="flex items-center gap-2.5 overflow-x-auto pb-1 pt-0.5 no-scrollbar scroll-smooth"
        >
          {items.map((item, idx) => {
            const isActive = idx === activeIndex;
            const thumbSrc =
              item.thumbnailUrl ||
              (item.type === "image" ? item.url : items.find((i) => i.type === "image")?.url || item.url);

            return (
              <button
                key={item.id || idx}
                type="button"
                onClick={() => mainSwiper?.slideTo(idx)}
                aria-label={`رفتن به اسلاید ${toPersianDigits(idx + 1)}`}
                className={`group/thumb relative h-16 w-24 sm:h-20 sm:w-32 shrink-0 overflow-hidden rounded-2xl border transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "border-orange-500 ring-2 ring-orange-500/40 shadow-lg shadow-orange-500/20 scale-[1.02]"
                    : "border-neutral-800 opacity-60 hover:opacity-100 hover:border-neutral-700 hover:scale-[1.01]"
                }`}
              >
                <ThumbnailImage
                  src={thumbSrc}
                  alt={item.title || `پیش‌نمایش ${idx + 1}`}
                />

                <div
                  className={`absolute inset-0 transition-colors ${
                    isActive ? "bg-transparent" : "bg-black/40 group-hover/thumb:bg-transparent"
                  }`}
                />

                {/* Badge for Video or Image indicator on thumb */}
                {item.type === "video" ? (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-600/90 text-white shadow-md border border-orange-400/50">
                      <Play className="h-3.5 w-3.5 fill-current translate-x-[-1px]" />
                    </span>
                    {item.duration && (
                      <span className="absolute bottom-1 right-1 rounded-md bg-black/80 px-1.5 py-0.5 text-[9px] font-mono font-bold text-orange-300">
                        {toPersianDigits(item.duration)}
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="absolute bottom-1 right-1 rounded-md bg-black/60 px-1 py-0.5 text-[9px] text-neutral-300 font-mono">
                    {toPersianDigits(idx + 1)}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* ── Fullscreen Lightbox Modal ───────────────────────────────────── */}
      {isLightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="نمایش تمام‌صفحه گالری"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl p-3 sm:p-6"
        >
          {/* Close button */}
          <button
            type="button"
            onClick={() => setIsLightboxOpen(false)}
            aria-label="بستن بزرگ‌نمایی"
            className="absolute top-4 left-4 z-50 flex h-11 w-11 items-center justify-center rounded-2xl border border-white/20 bg-black/80 text-white hover:bg-orange-600 hover:border-orange-500 transition-colors cursor-pointer"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Counter info */}
          <div className="absolute top-4 right-4 z-50 flex items-center gap-2 text-white">
            <span className="rounded-full border border-white/10 bg-black/70 px-4 py-1.5 text-xs font-mono font-semibold">
              {toPersianDigits(lightboxIndex + 1)} از {toPersianDigits(items.length)}
            </span>
            {items[lightboxIndex].title && (
              <span className="text-sm font-semibold text-neutral-200 hidden sm:inline">
                {items[lightboxIndex].title}
              </span>
            )}
          </div>

          {/* Lightbox Content */}
          <div className="relative w-full max-w-5xl aspect-[16/9] max-h-[82vh] overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-950 flex items-center justify-center">
            {items[lightboxIndex].type === "video" ? (
              <MediaPlayer
                src={items[lightboxIndex].url}
                poster={items[lightboxIndex].thumbnailUrl}
                title={items[lightboxIndex].title || title}
                caption={items[lightboxIndex].caption}
                isActiveSlide={true}
                className="w-full h-full"
              />
            ) : (
              <div className="relative w-full h-full">
                <GalleryImage
                  src={items[lightboxIndex].url}
                  alt={items[lightboxIndex].title || `تصویر ${lightboxIndex + 1}`}
                  priority
                />
              </div>
            )}

            {/* Prev/Next arrows in Lightbox */}
            {items.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    setLightboxIndex((prev) => (prev - 1 + items.length) % items.length)
                  }
                  aria-label="اسلاید قبلی"
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-40 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-black/70 text-white hover:bg-orange-600 hover:border-orange-500 transition-colors cursor-pointer"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>

                <button
                  type="button"
                  onClick={() => setLightboxIndex((prev) => (prev + 1) % items.length)}
                  aria-label="اسلاید بعدی"
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-40 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/20 bg-black/70 text-white hover:bg-orange-600 hover:border-orange-500 transition-colors cursor-pointer"
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
