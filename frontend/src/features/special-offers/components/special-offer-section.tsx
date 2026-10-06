"use client";

import * as React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay, A11y, Keyboard } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import {
  ChevronLeft,
  ChevronRight,
  Flame,
  Truck,
  ShieldCheck,
  FileText,
  Headphones,
  Zap,
} from "lucide-react";

// Swiper base styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import { SpecialOfferProduct } from "../types";
import { SPECIAL_OFFER_PRODUCTS } from "../mock-data/special-offers-data";
import { SpecialOfferCard } from "./special-offer-card";
import { SpecialOfferTimer } from "./special-offer-timer";
import { Container } from "@/shared/components/ui/container";

const emptySubscribe = () => () => {};
function useIsMounted() {
  return React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

export interface SpecialOfferSectionProps {
  products?: SpecialOfferProduct[];
  title?: string;
  subtitle?: string;
  targetDate?: Date | string | number;
  className?: string;
}

export function SpecialOfferSection({
  products = SPECIAL_OFFER_PRODUCTS,
  title = "فروش ویژه تجهیزات شبکه",
  subtitle = "تخفیف‌های استثنایی و محدود با ضمانت اصالت کالا و تحویل فوری",
  targetDate,
  className = "",
}: SpecialOfferSectionProps) {
  const [swiperInstance, setSwiperInstance] = React.useState<SwiperType | null>(null);
  const [isBeginning, setIsBeginning] = React.useState(true);
  const [isEnd, setIsEnd] = React.useState(false);
  const mounted = useIsMounted();

  const updateNavigationState = React.useCallback((swiper: SwiperType) => {
    setIsBeginning(swiper.isBeginning);
    setIsEnd(swiper.isEnd);
  }, []);

  return (
    <section
      id="special-offers"
      className={`relative mt-2 mb-8 sm:mt-4 sm:mb-12 overflow-hidden pt-2 pb-4 sm:pt-4 sm:pb-8 lg:pb-12 ${className}`}
      aria-labelledby="special-offers-title"
      role="region"
      aria-roledescription="carousel"
      dir="rtl"
    >
      {/* ── Background Glow & Tech Texture ────────────────────────────────── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 20%, rgba(234,88,12,0.09) 0%, transparent 70%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      <Container>
        {/* ── Outer Section Shell ─────────────────────────────────────────── */}
        <div className="relative rounded-2xl sm:rounded-3xl border border-orange-500/20 bg-[#0d0d10]/95 p-3 sm:p-6 md:p-8 shadow-2xl shadow-orange-950/20 backdrop-blur-xl">
          {/* Subtle top edge orange line */}
          <div className="absolute top-0 left-6 sm:left-12 right-6 sm:right-12 h-[2px] bg-gradient-to-r from-transparent via-orange-500/60 to-transparent" />

          {/* ── Header: Title, Timer & Controls ───────────────────────────── */}
          <div className="mb-5 sm:mb-8 flex flex-col gap-4 sm:gap-6 lg:flex-row lg:items-end lg:justify-between">
            {/* Right: Section Branding & Title */}
            <div className="flex flex-col items-start gap-1.5 sm:gap-2.5 max-w-xl">
              <div className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-orange-500/30 bg-orange-950/40 px-2.5 sm:px-3.5 py-1 text-[11px] sm:text-xs font-bold text-orange-400">
                <Flame className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-orange-500 fill-orange-500 animate-pulse" />
                <span>تخفیف ویژه زیرساخت و شبکه</span>
                <Zap className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-amber-400" />
              </div>

              <h2
                id="special-offers-title"
                className="text-lg sm:text-2xl lg:text-3xl font-black tracking-tight text-white"
              >
                {title}
              </h2>

              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed line-clamp-2 sm:line-clamp-none">
                {subtitle}
              </p>
            </div>

            {/* Left: Countdown Timer & Swiper Navigation Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-3 sm:gap-4 w-full lg:w-auto">
              {/* Countdown Timer */}
              <SpecialOfferTimer targetDate={targetDate} className="w-full sm:w-auto" />

              {/* Navigation Controls (Prev / Next Buttons) - Shown on tablet and desktop */}
              <div className="hidden sm:flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => swiperInstance?.slidePrev()}
                  disabled={isBeginning}
                  aria-label="محصولات قبلی"
                  className={`flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl border border-neutral-800 bg-neutral-900/90 text-neutral-200 transition-all ${
                    isBeginning
                      ? "opacity-40 cursor-not-allowed"
                      : "hover:border-orange-500/50 hover:bg-neutral-800 hover:text-white active:scale-95 shadow-md"
                  }`}
                >
                  <ChevronRight className="h-5 w-5" />
                </button>

                <button
                  type="button"
                  onClick={() => swiperInstance?.slideNext()}
                  disabled={isEnd}
                  aria-label="محصولات بعدی"
                  className={`flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl border border-neutral-800 bg-neutral-900/90 text-neutral-200 transition-all ${
                    isEnd
                      ? "opacity-40 cursor-not-allowed"
                      : "hover:border-orange-500/50 hover:bg-neutral-800 hover:text-white active:scale-95 shadow-md"
                  }`}
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* ── Swiper JS Carousel ────────────────────────────────────────── */}
          {mounted ? (
            <div
              className="relative special-offers-swiper"
              style={
                {
                  "--swiper-theme-color": "#ea580c",
                  "--swiper-pagination-color": "#ea580c",
                } as React.CSSProperties
              }
            >
              <Swiper
                modules={[Navigation, Pagination, Autoplay, A11y, Keyboard]}
                onSwiper={(swiper) => {
                  setSwiperInstance(swiper);
                  updateNavigationState(swiper);
                }}
                onSlideChange={updateNavigationState}
                onReachBeginning={() => setIsBeginning(true)}
                onReachEnd={() => setIsEnd(true)}
                onFromEdge={updateNavigationState}
                onBreakpoint={updateNavigationState}
                onResize={updateNavigationState}
                dir="rtl"
                spaceBetween={16}
                slidesPerView={1}
                speed={500}
                touchRatio={1}
                touchAngle={45}
                watchOverflow={true}
                grabCursor={true}
                keyboard={{
                  enabled: true,
                  onlyInViewport: true,
                }}
                a11y={{
                  prevSlideMessage: "مشاهده پیشنهاد قبلی",
                  nextSlideMessage: "مشاهده پیشنهاد بعدی",
                  firstSlideMessage: "نخستین پیشنهاد فروش ویژه",
                  lastSlideMessage: "آخرین پیشنهاد فروش ویژه",
                  paginationBulletMessage: "رفتن به اسلاید {{index}}",
                }}
                autoplay={{
                  delay: 4500,
                  disableOnInteraction: false,
                  pauseOnMouseEnter: true,
                }}
                pagination={{
                  clickable: true,
                  el: ".special-offers-pagination",
                }}
                breakpoints={{
                  480: {
                    slidesPerView: 1.25,
                    spaceBetween: 16,
                  },
                  640: {
                    slidesPerView: 2,
                    spaceBetween: 18,
                  },
                  768: {
                    slidesPerView: 2.3,
                    spaceBetween: 20,
                  },
                  1024: {
                    slidesPerView: 3,
                    spaceBetween: 22,
                  },
                  1280: {
                    slidesPerView: 4,
                    spaceBetween: 24,
                  },
                }}
                className="!pb-2 sm:!pb-4"
              >
                {products.map((product) => (
                  <SwiperSlide key={product.id} className="!h-auto flex">
                    <SpecialOfferCard product={product} />
                  </SwiperSlide>
                ))}
              </Swiper>

              {/* Custom Pagination Bullets Container */}
              <div className="special-offers-pagination mt-4 sm:mt-6 flex items-center justify-center gap-1.5" />
            </div>
          ) : (
            /* SSR/Loading Skeleton Placeholder matched in height and mobile slide preview to eliminate layout shift */
            <div className="flex gap-3 overflow-hidden sm:grid sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((n) => (
                <div
                  key={n}
                  className={`flex flex-col h-[460px] sm:h-[500px] animate-pulse rounded-2xl border border-neutral-800 bg-[#111114] p-3.5 sm:p-4 shrink-0 w-full sm:w-auto ${
                    n > 1 ? "hidden sm:flex" : ""
                  }`}
                >
                  <div className="aspect-[16/10] sm:aspect-[4/3] w-full rounded-xl bg-neutral-900" />
                  <div className="mt-3 h-5 w-3/4 rounded bg-neutral-850" />
                  <div className="mt-2 h-4 w-full rounded bg-neutral-900" />
                  <div className="mt-auto space-y-2.5 pt-3 border-t border-neutral-800/80">
                    <div className="h-2 w-full rounded-full bg-neutral-900" />
                    <div className="h-12 w-full rounded-xl bg-neutral-900/60" />
                    <div className="h-10 w-full rounded-xl bg-neutral-800" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Bottom Section Features / Assurance ───────────────────────── */}
          <div className="mt-6 sm:mt-8 flex flex-col gap-3.5 border-t border-neutral-800/80 pt-4 sm:pt-5 lg:flex-row lg:items-center lg:justify-between text-xs text-neutral-400">
            <div className="flex items-center justify-center sm:justify-start gap-2 text-orange-400 font-semibold text-[11px] sm:text-xs">
              <span className="inline-block h-2 w-2 shrink-0 rounded-full bg-orange-500 animate-ping" />
              <span>قیمت‌ها صرفاً تا پایان زمان اعلام‌شده معتبر می‌باشند.</span>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center sm:justify-end sm:gap-4 text-[11px] text-neutral-400">
              <span className="inline-flex items-center justify-center sm:justify-start gap-1.5 rounded-lg border border-neutral-800/60 bg-neutral-900/40 px-2.5 py-1.5 sm:border-0 sm:bg-transparent sm:p-0">
                <Truck className="h-3.5 w-3.5 shrink-0 text-neutral-500" />
                ارسال سریع اکسپرس
              </span>
              <span className="inline-flex items-center justify-center sm:justify-start gap-1.5 rounded-lg border border-neutral-800/60 bg-neutral-900/40 px-2.5 py-1.5 sm:border-0 sm:bg-transparent sm:p-0">
                <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-neutral-500" />
                ضمانت ۷ روزه تعویض
              </span>
              <span className="inline-flex items-center justify-center sm:justify-start gap-1.5 rounded-lg border border-neutral-800/60 bg-neutral-900/40 px-2.5 py-1.5 sm:border-0 sm:bg-transparent sm:p-0">
                <FileText className="h-3.5 w-3.5 shrink-0 text-neutral-500" />
                فاکتور رسمی شرکتی
              </span>
              <span className="inline-flex items-center justify-center sm:justify-start gap-1.5 rounded-lg border border-neutral-800/60 bg-neutral-900/40 px-2.5 py-1.5 sm:border-0 sm:bg-transparent sm:p-0">
                <Headphones className="h-3.5 w-3.5 shrink-0 text-neutral-500" />
                مشاوره فنی تخصصی
              </span>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
