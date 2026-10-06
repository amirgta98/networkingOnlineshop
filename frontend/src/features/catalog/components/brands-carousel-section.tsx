"use client";

import * as React from "react";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, A11y } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";

// Swiper styles
import "swiper/css";
import "swiper/css/free-mode";

export interface BrandLogoItem {
  id: string;
  name: string;
  logo: React.ReactNode;
}

export const BRAND_LOGOS: BrandLogoItem[] = [
  {
    id: "Cisco",
    name: "Cisco Systems",
    logo: (
      <svg
        viewBox="0 0 160 52"
        fill="currentColor"
        className="h-10 sm:h-12 w-auto text-[#00bceb]"
        aria-label="Cisco"
      >
        {/* Cisco bridge soundwave bars */}
        <rect x="18" y="24" width="4.5" height="11" rx="2.2" fill="#00bceb" opacity="0.75" />
        <rect x="27" y="15" width="4.5" height="20" rx="2.2" fill="#00bceb" opacity="0.9" />
        <rect x="36" y="6" width="4.5" height="29" rx="2.2" fill="#00bceb" />
        <rect x="45" y="15" width="4.5" height="20" rx="2.2" fill="#00bceb" opacity="0.9" />
        <rect x="54" y="24" width="4.5" height="11" rx="2.2" fill="#00bceb" opacity="0.75" />
        {/* Wordmark CISCO */}
        <text
          x="67"
          y="31"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontSize="23"
          fontWeight="900"
          letterSpacing="2.5"
          fill="#00bceb"
        >
          CISCO
        </text>
      </svg>
    ),
  },
  {
    id: "MikroTik",
    name: "MikroTik",
    logo: (
      <svg
        viewBox="0 0 170 52"
        fill="currentColor"
        className="h-10 sm:h-12 w-auto text-[#e02424]"
        aria-label="MikroTik"
      >
        {/* MikroTik chevron symbol */}
        <g transform="translate(12, 11)">
          <path
            d="M0 6 L12 0 L12 8 L4 12 L12 16 L12 24 L0 18 Z"
            fill="#e02424"
          />
          <path
            d="M16 0 L28 6 L28 18 L16 24 L16 16 L24 12 L16 8 Z"
            fill="#e02424"
            opacity="0.9"
          />
        </g>
        <text
          x="48"
          y="31"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontSize="22"
          fontWeight="800"
          letterSpacing="0.5"
          fill="#e02424"
        >
          MikroTik
        </text>
      </svg>
    ),
  },
  {
    id: "Ubiquiti",
    name: "Ubiquiti UniFi",
    logo: (
      <svg
        viewBox="0 0 175 52"
        fill="currentColor"
        className="h-10 sm:h-12 w-auto text-[#006fff]"
        aria-label="Ubiquiti"
      >
        {/* Ubiquiti UniFi infinity loop */}
        <circle cx="28" cy="24" r="14" fill="none" stroke="#006fff" strokeWidth="3.5" opacity="0.3" />
        <path
          d="M20 24 C20 16 36 16 36 24 C36 32 20 32 20 24 Z"
          fill="none"
          stroke="#006fff"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <text
          x="52"
          y="31"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontSize="20"
          fontWeight="800"
          letterSpacing="1.5"
          fill="#006fff"
        >
          UBIQUITI
        </text>
      </svg>
    ),
  },
  {
    id: "Legrand",
    name: "Legrand France",
    logo: (
      <svg
        viewBox="0 0 165 52"
        fill="currentColor"
        className="h-10 sm:h-12 w-auto text-[#e52421]"
        aria-label="Legrand"
      >
        {/* Legrand square with dual brackets */}
        <rect x="14" y="9" width="30" height="30" rx="4" fill="#e52421" />
        <path d="M23 16 L23 32" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
        <path d="M35 16 L35 32" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
        <path d="M23 24 L35 24" stroke="#ffffff" strokeWidth="2" />
        <text
          x="52"
          y="32"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontSize="23"
          fontWeight="900"
          letterSpacing="0.5"
          fill="#e52421"
        >
          legrand
        </text>
      </svg>
    ),
  },
  {
    id: "Nexans",
    name: "Nexans",
    logo: (
      <svg
        viewBox="0 0 165 52"
        fill="currentColor"
        className="h-10 sm:h-12 w-auto text-[#ea580c]"
        aria-label="Nexans"
      >
        {/* Nexans curve ribbon */}
        <path
          d="M14 29 C20 12, 30 37, 40 16 C42 12, 46 16, 46 20"
          fill="none"
          stroke="#ea580c"
          strokeWidth="4.5"
          strokeLinecap="round"
        />
        <text
          x="54"
          y="32"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontSize="23"
          fontWeight="800"
          letterSpacing="1"
          fill="#ea580c"
        >
          Nexans
        </text>
      </svg>
    ),
  },
  {
    id: "Paya System",
    name: "Paya System",
    logo: (
      <svg
        viewBox="0 0 175 52"
        fill="currentColor"
        className="h-10 sm:h-12 w-auto text-[#f97316]"
        aria-label="Paya System"
      >
        {/* Server rack enclosure */}
        <rect x="14" y="9" width="24" height="30" rx="3" fill="none" stroke="#f97316" strokeWidth="2.5" />
        <line x1="18" y1="16" x2="34" y2="16" stroke="#f97316" strokeWidth="2" strokeLinecap="round" />
        <line x1="18" y1="24" x2="34" y2="24" stroke="#f97316" strokeWidth="2" strokeLinecap="round" />
        <line x1="18" y1="32" x2="34" y2="32" stroke="#f97316" strokeWidth="2" strokeLinecap="round" />
        <circle cx="31" cy="16" r="1.2" fill="#10b981" />
        <circle cx="31" cy="24" r="1.2" fill="#10b981" />
        <circle cx="31" cy="32" r="1.2" fill="#f97316" />
        <text
          x="44"
          y="26"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontSize="15"
          fontWeight="900"
          letterSpacing="1.2"
          fill="#f97316"
        >
          PAYA SYSTEM
        </text>
        <text
          x="45"
          y="36"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontSize="9.5"
          fontWeight="700"
          letterSpacing="1.5"
          fill="#f97316"
          opacity="0.85"
        >
          RACK SOLUTIONS
        </text>
      </svg>
    ),
  },
  {
    id: "Schneider",
    name: "Schneider Electric",
    logo: (
      <svg
        viewBox="0 0 180 52"
        fill="currentColor"
        className="h-10 sm:h-12 w-auto text-[#3dcd58]"
        aria-label="Schneider Electric"
      >
        {/* Schneider green crescent */}
        <path
          d="M14 27 C14 15 25 9 37 13 C30 18 24 24 23 34"
          fill="#3dcd58"
        />
        <text
          x="38"
          y="24"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontSize="14"
          fontWeight="800"
          letterSpacing="0.5"
          fill="#3dcd58"
        >
          Schneider
        </text>
        <text
          x="40"
          y="35"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontSize="9.5"
          fontWeight="700"
          letterSpacing="1.8"
          fill="#3dcd58"
          opacity="0.9"
        >
          ELECTRIC
        </text>
      </svg>
    ),
  },
  {
    id: "TP-Link",
    name: "TP-Link Omada",
    logo: (
      <svg
        viewBox="0 0 170 52"
        fill="currentColor"
        className="h-10 sm:h-12 w-auto text-[#00a4e4]"
        aria-label="TP-Link"
      >
        {/* TP-Link link loop */}
        <circle cx="24" cy="24" r="10" fill="none" stroke="#00a4e4" strokeWidth="3" />
        <path d="M24 14 A10 10 0 0 1 34 24" fill="none" stroke="#00a4e4" strokeWidth="4" strokeLinecap="round" />
        <text
          x="42"
          y="31"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontSize="20"
          fontWeight="800"
          letterSpacing="0.5"
          fill="#00a4e4"
        >
          tp-link
        </text>
      </svg>
    ),
  },
  {
    id: "D-Link",
    name: "D-Link",
    logo: (
      <svg
        viewBox="0 0 160 52"
        fill="currentColor"
        className="h-10 sm:h-12 w-auto text-[#0088cc]"
        aria-label="D-Link"
      >
        <text
          x="18"
          y="33"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontSize="26"
          fontWeight="900"
          letterSpacing="1.5"
          fill="#0088cc"
        >
          D-Link
        </text>
      </svg>
    ),
  },
  {
    id: "Huawei",
    name: "Huawei Enterprise",
    logo: (
      <svg
        viewBox="0 0 175 52"
        fill="currentColor"
        className="h-10 sm:h-12 w-auto text-[#ed1c24]"
        aria-label="Huawei"
      >
        {/* Huawei Sunburst 8 petals */}
        <g transform="translate(26, 24)">
          <path d="M0 -12 C2 -8 2 -4 0 0 C-2 -4 -2 -8 0 -12 Z" fill="#ed1c24" />
          <path d="M8 -8 C8 -4 6 -2 0 0 C4 -4 8 -6 8 -8 Z" fill="#ed1c24" opacity="0.9" />
          <path d="M-8 -8 C-8 -4 -6 -2 0 0 C-4 -4 -8 -6 -8 -8 Z" fill="#ed1c24" opacity="0.9" />
          <path d="M12 0 C9 1 6 1 0 0 C6 -1 9 -1 12 0 Z" fill="#ed1c24" opacity="0.85" />
          <path d="M-12 0 C-9 1 -6 1 0 0 C-6 -1 -9 -1 -12 0 Z" fill="#ed1c24" opacity="0.85" />
        </g>
        <text
          x="48"
          y="31"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontSize="20"
          fontWeight="900"
          letterSpacing="2.5"
          fill="#ed1c24"
        >
          HUAWEI
        </text>
      </svg>
    ),
  },
  {
    id: "Juniper",
    name: "Juniper Networks",
    logo: (
      <svg
        viewBox="0 0 175 52"
        fill="currentColor"
        className="h-10 sm:h-12 w-auto text-[#10b981]"
        aria-label="Juniper Networks"
      >
        {/* Juniper node shape */}
        <polygon points="24,10 34,24 24,38 14,24" fill="#10b981" opacity="0.8" />
        <circle cx="24" cy="24" r="3" fill="#ffffff" />
        <text
          x="44"
          y="31"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontSize="20"
          fontWeight="800"
          letterSpacing="1"
          fill="#10b981"
        >
          Juniper
        </text>
      </svg>
    ),
  },
  {
    id: "H3C",
    name: "H3C Technologies",
    logo: (
      <svg
        viewBox="0 0 160 52"
        fill="currentColor"
        className="h-10 sm:h-12 w-auto text-[#e60012]"
        aria-label="H3C"
      >
        <circle cx="24" cy="24" r="11" fill="none" stroke="#e60012" strokeWidth="3" opacity="0.35" />
        <path d="M16 24 C16 16 32 16 32 24" fill="none" stroke="#e60012" strokeWidth="3.5" strokeLinecap="round" />
        <text
          x="42"
          y="32"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontSize="24"
          fontWeight="900"
          letterSpacing="1"
          fill="#e60012"
        >
          H3C
        </text>
      </svg>
    ),
  },
];

// Repeat 3 times to provide a deep, buffer-rich strip (36 slides)
// guaranteeing infinite loop coverage on any screen resolution from mobile up to 4K
const SLIDES = [...BRAND_LOGOS, ...BRAND_LOGOS, ...BRAND_LOGOS];

export function BrandsCarouselSection() {
  const swiperRef = React.useRef<SwiperType | null>(null);
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  // Position & physics refs
  const currentTranslateRef = React.useRef(-2500);
  const singleCycleWidthRef = React.useRef(2500);
  const scrollImpulseRef = React.useRef(0);
  const isHoveredRef = React.useRef(false);
  const isTouchingRef = React.useRef(false);
  const isInViewRef = React.useRef(true);
  const lastScrollYRef = React.useRef(0);
  const animFrameIdRef = React.useRef<number | null>(null);

  // Measure single cycle width dynamically based on actual rendered slide width
  const updateMetrics = React.useCallback(() => {
    if (!swiperRef.current) return;
    const swiper = swiperRef.current;
    const slide = swiper.slides[0];
    if (slide) {
      const spaceBetween =
        typeof swiper.params.spaceBetween === "number"
          ? swiper.params.spaceBetween
          : 32;
      const slideTotalWidth = slide.offsetWidth + spaceBetween;
      const cycleWidth = BRAND_LOGOS.length * slideTotalWidth;
      if (cycleWidth > 0) {
        singleCycleWidthRef.current = cycleWidth;
        if (currentTranslateRef.current === 0 || currentTranslateRef.current === -2500) {
          currentTranslateRef.current = -cycleWidth;
          swiper.setTransition(0);
          swiper.setTranslate(-cycleWidth);
        }
      }
    }
  }, []);

  // ── Intersection Observer: pause RAF when off-screen to save CPU/GPU ───────
  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        isInViewRef.current = entry.isIntersecting;
      },
      { rootMargin: "300px 0px 300px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // ── Scroll Listener for Scroll-driven Rightward Motion ─────────────────────
  // When user scrolls DOWN (deltaY > 0), carousel moves to the RIGHT
  React.useEffect(() => {
    lastScrollYRef.current = window.scrollY;

    const onScroll = () => {
      const currentScrollY = window.scrollY;
      const deltaY = currentScrollY - lastScrollYRef.current;
      lastScrollYRef.current = currentScrollY;

      // Scroll Down (deltaY > 0): add gentle rightward impulse (+X)
      // Greatly reduced multiplier and tight clamp for very calm, subtle motion
      if (deltaY > 0) {
        scrollImpulseRef.current = Math.min(scrollImpulseRef.current + deltaY * 0.05, 3.5);
      } else if (deltaY < 0) {
        // Very subtle ease when scrolling up
        scrollImpulseRef.current = Math.max(scrollImpulseRef.current + deltaY * 0.02, -1.5);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", updateMetrics, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", updateMetrics);
    };
  }, [updateMetrics]);

  // ── Continuous 60fps RAF Physics Loop ─────────────────────────────────────
  // Moves constantly to the right (calm base drift + gentle scroll impulse) in an infinite loop
  React.useEffect(() => {
    let lastTime = performance.now();

    const loop = (time: number) => {
      animFrameIdRef.current = requestAnimationFrame(loop);

      const dt = Math.min((time - lastTime) / 16.67, 2.5);
      lastTime = time;

      if (isTouchingRef.current || !isInViewRef.current || !swiperRef.current) {
        if (swiperRef.current) {
          currentTranslateRef.current = swiperRef.current.getTranslate();
        }
        return;
      }

      const swiper = swiperRef.current;
      const cycleWidth = singleCycleWidthRef.current || 2500;

      // Base speed (pixels per frame): +0.45 moves calmly and smoothly to the right (+X)
      // When hovered, base drift pauses so the user can comfortably view/click
      const baseVelocity = isHoveredRef.current ? 0 : 0.45;

      // Apply scroll momentum with fast exponential decay friction
      const currentImpulse = scrollImpulseRef.current;
      scrollImpulseRef.current *= Math.pow(0.84, dt);

      // Advance position to the RIGHT (+X direction)
      const moveDelta = (baseVelocity + currentImpulse) * dt;
      currentTranslateRef.current += moveDelta;

      // Seamless mathematical modulo wrap: zero visual jitter or jump
      while (currentTranslateRef.current > 0) {
        currentTranslateRef.current -= cycleWidth;
      }
      while (currentTranslateRef.current < -cycleWidth * 2) {
        currentTranslateRef.current += cycleWidth;
      }

      swiper.setTransition(0);
      swiper.setTranslate(currentTranslateRef.current);
    };

    animFrameIdRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      id="official-brands"
      className="relative w-full py-6 sm:py-9 overflow-hidden bg-transparent select-none"
      aria-label="لوگوی برندهای تجهیزات شبکه"
      dir="ltr" // LTR enables smooth +X translation moving right
    >
      {/* Soft edge gradient masks for seamless visual fade */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 bottom-0 left-0 z-20 w-16 sm:w-32 bg-gradient-to-r from-neutral-950 via-neutral-950/70 to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 bottom-0 right-0 z-20 w-16 sm:w-32 bg-gradient-to-l from-neutral-950 via-neutral-950/70 to-transparent"
      />

      {/* ── Swiper JS Carousel ─────────────────────────────────────────────── */}
      <div
        className="relative w-full"
        onMouseEnter={() => {
          isHoveredRef.current = true;
        }}
        onMouseLeave={() => {
          isHoveredRef.current = false;
        }}
      >
        <Swiper
          modules={[FreeMode, A11y]}
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
            updateMetrics();
          }}
          onTouchStart={() => {
            isTouchingRef.current = true;
          }}
          onTouchEnd={() => {
            isTouchingRef.current = false;
            if (swiperRef.current) {
              currentTranslateRef.current = swiperRef.current.getTranslate();
            }
          }}
          slidesPerView="auto"
          spaceBetween={36}
          grabCursor={true}
          freeMode={{
            enabled: true,
            momentum: true,
          }}
          className="brands-infinite-swiper !overflow-visible"
        >
          {SLIDES.map((brand, idx) => (
            <SwiperSlide
              key={`${brand.id}-${idx}`}
              className="!w-auto flex items-center justify-center select-none"
            >
              <Link
                href={`/products?brand=${encodeURIComponent(brand.id)}`}
                className="flex items-center justify-center px-4 py-2 group cursor-pointer focus:outline-none"
                title={brand.name}
              >
                {/* 
                  Pure transparent background-less logo.
                  Default state: subtle muted opacity (grayscale).
                  Hover state: bright, vivid, full color ("پر رنگ بشند") + subtle lift.
                */}
                <div className="opacity-45 brightness-150 contrast-125 grayscale transition-all duration-300 ease-out group-hover:opacity-100 group-hover:grayscale-0 group-hover:brightness-100 group-hover:scale-110 drop-shadow-sm group-hover:drop-shadow-[0_0_14px_rgba(255,255,255,0.2)]">
                  {brand.logo}
                </div>
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}
