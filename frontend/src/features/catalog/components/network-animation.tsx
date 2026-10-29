"use client";

import * as React from "react";
import Link from "next/link";
import { motion, useAnimationControls, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

// ── Constants ────────────────────────────────────────────────────────────────

const PRIMARY = "#ea580c";
const PRIMARY_LIGHT = "#f97316";
const STROKE_BASE = "rgba(255,255,255,0.22)";
const STROKE_DIM = "rgba(255,255,255,0.08)";

// ── Ping dot component ───────────────────────────────────────────────────────

function PingDot({
  cx,
  cy,
  delay = 0,
  color = PRIMARY,
  shouldAnimate = true,
}: {
  cx: number;
  cy: number;
  delay?: number;
  color?: string;
  shouldAnimate?: boolean;
}) {
  if (!shouldAnimate) {
    return (
      <g>
        <circle cx={cx} cy={cy} r={6} fill={color} opacity={0.25} />
        <circle cx={cx} cy={cy} r={3} fill={color} opacity={0.9} />
      </g>
    );
  }
  return (
    <g>
      {/* expanding ring */}
      <motion.circle
        cx={cx}
        cy={cy}
        r={3}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        initial={{ r: 3, opacity: 0.9 }}
        animate={{ r: 14, opacity: 0 }}
        transition={{
          duration: 1.8,
          delay,
          repeat: Infinity,
          ease: "easeOut",
          repeatDelay: 2.2,
        }}
      />
      {/* solid dot */}
      <motion.circle
        cx={cx}
        cy={cy}
        r={3}
        fill={color}
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 1, 0] }}
        transition={{
          duration: 1.8,
          delay,
          repeat: Infinity,
          ease: "easeOut",
          repeatDelay: 2.2,
          times: [0, 0.1, 0.6, 1],
        }}
      />
    </g>
  );
}

// ── Main Globe SVG ───────────────────────────────────────────────────────────

export function GlobeAnimation() {
  const controls = useAnimationControls();
  const shouldReduceMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(() => typeof window !== "undefined" && window.innerWidth < 768);
  const [isInView, setIsInView] = useState(true);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check, { passive: true });
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (!containerRef.current || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.05 }
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    controls.start("visible");
  }, [controls]);

  const shouldAnimate = !isMobile && !shouldReduceMotion && isInView;

  return (
    <div
      ref={containerRef}
      className="relative flex items-center justify-center w-full h-full select-none overflow-hidden"
    >
      {/* Outer ambient glow */}
      <div
        aria-hidden="true"
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
      >
        <div
          className="w-[180px] h-[180px] sm:w-[320px] sm:h-[320px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(234,88,12,0.12) 0%, rgba(234,88,12,0.03) 50%, transparent 70%)",
          }}
        />
      </div>

      <motion.svg
        viewBox="0 0 400 400"
        width="100%"
        height="100%"
        style={{ maxWidth: 420, maxHeight: 420 }}
        aria-hidden="true"
        initial="hidden"
        animate={controls}
      >
        <defs>
          {/* Clip to sphere */}
          <clipPath id="sphere-clip">
            <circle cx="200" cy="200" r="150" />
          </clipPath>

          {/* Sphere: transparent interior, just the border outline matters */}
          <radialGradient id="sphere-grad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(9,9,11,0.0)" />
            <stop offset="100%" stopColor="rgba(9,9,11,0.0)" />
          </radialGradient>

          {/* Orange rim — thin edge glow only */}
          <radialGradient id="rim-grad" cx="50%" cy="50%" r="50%">
            <stop offset="90%" stopColor="transparent" />
            <stop offset="100%" stopColor="rgba(234,88,12,0.15)" />
          </radialGradient>

          {/* Center fade mask — fades dense meridians at center */}
          <radialGradient id="center-fade" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(9,9,11,0.7)" />
            <stop offset="35%" stopColor="rgba(9,9,11,0.3)" />
            <stop offset="65%" stopColor="rgba(9,9,11,0.0)" />
          </radialGradient>
        </defs>

        {/* ── Globe sphere base ─────────────────────────────────────────── */}
        <motion.circle
          cx="200"
          cy="200"
          r="150"
          fill="url(#sphere-grad)"
          stroke={PRIMARY}
          strokeWidth="1.5"
          variants={{
            hidden: { opacity: 0, scale: 0.6 },
            visible: {
              opacity: 1,
              scale: 1,
              transition: { duration: 0.8, ease: [0.23, 1, 0.32, 1] },
            },
          }}
        />

        {/* Rim glow overlay */}
        <circle cx="200" cy="200" r="150" fill="url(#rim-grad)" />

        {/* ── Latitude lines (horizontal ellipses) ──────────────────────── */}
        {[
          { ry: 10, opacity: 0.25, delay: 0.15 },
          { ry: 55, opacity: 0.3, delay: 0.2 },
          { ry: 95, opacity: 0.35, delay: 0.25 },
          { ry: 115, opacity: 0.2, delay: 0.3 },
          { ry: 135, opacity: 0.12, delay: 0.35 },
        ].map(({ ry, opacity, delay }) => (
          <motion.ellipse
            key={`lat-${ry}`}
            cx="200"
            cy="200"
            rx="150"
            ry={ry}
            fill="none"
            stroke={STROKE_BASE}
            strokeWidth="1"
            clipPath="url(#sphere-clip)"
            variants={{
              hidden: { opacity: 0, pathLength: 0 },
              visible: {
                opacity,
                pathLength: 1,
                transition: { duration: 1.2, delay, ease: "easeOut" },
              },
            }}
          />
        ))}

        {/* ── Equator (highlighted) ─────────────────────────────────────── */}
        <motion.ellipse
          cx="200"
          cy="200"
          rx="150"
          ry="30"
          fill="none"
          stroke="rgba(234,88,12,0.4)"
          strokeWidth="1.5"
          clipPath="url(#sphere-clip)"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { duration: 1, delay: 0.4 } },
          }}
        />

        {/* ── Longitude lines (vertical ellipses) ───────────────────────── */}
        {[
          { angle: 0, opacity: 0.3, delay: 0.2 },
          { angle: 40, opacity: 0.25, delay: 0.25 },
          { angle: -40, opacity: 0.25, delay: 0.3 },
          { angle: 70, opacity: 0.15, delay: 0.35 },
          { angle: -70, opacity: 0.15, delay: 0.4 },
        ].map(({ angle, opacity, delay }) => (
          <motion.ellipse
            key={`lon-${angle}`}
            cx="200"
            cy="200"
            rx={Math.abs(Math.cos((angle * Math.PI) / 180)) * 150}
            ry="150"
            fill="none"
            stroke={angle === 0 ? "rgba(234,88,12,0.35)" : STROKE_BASE}
            strokeWidth={angle === 0 ? 1.5 : 1}
            clipPath="url(#sphere-clip)"
            style={{
              transformOrigin: "200px 200px",
              transform: `rotate(${angle}deg)`,
            }}
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity,
                transition: { duration: 1.0, delay, ease: "easeOut" },
              },
            }}
          />
        ))}

        {/* ── Diagonal orbital ring (like image) with slow continuous rotation ── */}
        <motion.g
          variants={{
            hidden: { opacity: 0, scale: 0.7 },
            visible: {
              opacity: 1,
              scale: 1,
              transition: { duration: 0.9, delay: 0.5, ease: [0.23, 1, 0.32, 1] },
            },
          }}
          style={{ transformOrigin: "200px 200px" }}
        >
          {/* Continuous slow rotation around center (disabled on mobile / off-screen) */}
          <motion.g
            animate={shouldAnimate ? { rotate: 360 } : undefined}
            transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
            style={{ transformOrigin: "200px 200px" }}
          >
            {/* Back half of orbit (dim) */}
            <path
              d="M 30 170 A 172 55 0 0 0 370 230"
              fill="none"
              stroke={STROKE_DIM}
              strokeWidth="2"
              strokeLinecap="round"
            />
            {/* Front half of orbit (bright orange glow halo + sharp stroke) */}
            <path
              d="M 370 230 A 172 55 0 0 0 30 170"
              fill="none"
              stroke={PRIMARY}
              strokeWidth="5"
              strokeLinecap="round"
              opacity="0.25"
            />
            <path
              d="M 370 230 A 172 55 0 0 0 30 170"
              fill="none"
              stroke={PRIMARY}
              strokeWidth="2.5"
              strokeLinecap="round"
            />

            {/* Orbit tip arrows */}
            <path
              d="M 25 165 L 30 170 L 38 163"
              fill="none"
              stroke={PRIMARY}
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M 375 235 L 370 230 L 362 237"
              fill="none"
              stroke={PRIMARY}
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Orbit packet attached to rotating ring with lightweight vector halo */}
            <circle cx="370" cy="230" r="9" fill={PRIMARY_LIGHT} opacity="0.3" />
            <motion.circle
              cx="370"
              cy="230"
              r="4.5"
              fill={PRIMARY_LIGHT}
              animate={shouldAnimate ? { opacity: [0.6, 1, 0.6], scale: [0.9, 1.15, 0.9] } : undefined}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            />
            <circle cx="30" cy="170" r="8" fill="#fbbf24" opacity="0.25" />
            <motion.circle
              cx="30"
              cy="170"
              r="4"
              fill="#fbbf24"
              animate={shouldAnimate ? { opacity: [0.5, 1, 0.5], scale: [0.9, 1.15, 0.9] } : undefined}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
            />
          </motion.g>
        </motion.g>

        {/* ── Second orbiting particle (disabled on mobile / off-screen) ──── */}
        <motion.g
          animate={shouldAnimate ? { rotate: -360 } : undefined}
          transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: "200px 200px" }}
        >
          <circle cx="200" cy="50" r="7" fill="rgba(16,185,129,0.3)" />
          <motion.circle
            cx="200"
            cy="50"
            r="3.5"
            fill="rgba(16,185,129,0.9)"
            animate={shouldAnimate ? { opacity: [0.4, 0.9, 0.4] } : undefined}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
          />
        </motion.g>

        {/* ── Ping dots at geo-points ───────────────────────────────────── */}
        <motion.g
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { delay: 0.9 } },
          }}
        >
          <PingDot cx={155} cy={160} delay={0} color={PRIMARY} shouldAnimate={shouldAnimate} />
          <PingDot cx={250} cy={220} delay={1.2} color={PRIMARY_LIGHT} shouldAnimate={shouldAnimate} />
          <PingDot cx={200} cy={130} delay={2.4} color="rgba(16,185,129,0.9)" shouldAnimate={shouldAnimate} />
          <PingDot cx={285} cy={175} delay={0.7} color={PRIMARY} shouldAnimate={shouldAnimate} />
          <PingDot cx={130} cy={240} delay={1.8} color="rgba(16,185,129,0.9)" shouldAnimate={shouldAnimate} />
        </motion.g>

        {/* ── Connection lines between points ──────────────────────────── */}
        <motion.g
          stroke="rgba(234,88,12,0.2)"
          strokeWidth="1"
          fill="none"
          clipPath="url(#sphere-clip)"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { delay: 1.1, duration: 0.8 } },
          }}
        >
          <line x1="155" y1="160" x2="250" y2="220" />
          <line x1="200" y1="130" x2="285" y2="175" />
          <line x1="155" y1="160" x2="200" y2="130" />
          <line x1="250" y1="220" x2="285" y2="175" />
          <line x1="130" y1="240" x2="155" y2="160" />
          <line x1="130" y1="240" x2="250" y2="220" />
        </motion.g>

        {/* ── Sphere shine highlight (top-left) ─────────────────────────── */}
        <ellipse
          cx="155"
          cy="145"
          rx="40"
          ry="25"
          fill="rgba(255,255,255,0.04)"
          style={{ transform: "rotate(-15deg)", transformOrigin: "155px 145px" }}
        />

        {/* ── Center fade overlay (masks dense meridian lines) ──────────── */}
        <circle
          cx="200"
          cy="200"
          r="150"
          fill="url(#center-fade)"
          clipPath="url(#sphere-clip)"
        />
      </motion.svg>

      {/* ── Floating status badges (responsive positions) ─────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4, duration: 0.5 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.96 }}
        className="absolute top-[4%] sm:top-[12%] right-[2%] xs:right-[4%] sm:right-[8%] z-10"
      >
        <Link
          href="/internet"
          className="group block glass rounded-lg px-2 py-1 sm:px-3 sm:py-2 text-right transition-all duration-200 hover:border-orange-500/50 hover:bg-white/[0.06] hover:shadow-lg hover:shadow-orange-500/10 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
          aria-label="اینترنت - تا ۶۰ مگابایت بر ثانیه"
        >
          <p className="text-[8px] sm:text-[10px] text-[var(--theme-muted)] group-hover:text-neutral-300 transition-colors mb-0.5">
            اینترنت
          </p>
          <p
            className="text-[11px] sm:text-sm font-bold whitespace-nowrap"
            style={{ color: PRIMARY }}
          >
            تا ۶۰ مگابایت بر ثانیه
          </p>
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.6, duration: 0.5 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.96 }}
        className="absolute bottom-[4%] sm:bottom-[14%] left-[2%] xs:left-[4%] sm:left-[8%] z-10"
      >
        <Link
          href="/#portfolio"
          onClick={(e) => {
            const el = document.getElementById("portfolio");
            if (el) {
              e.preventDefault();
              el.scrollIntoView({ behavior: "smooth" });
              window.history.pushState(null, "", "/#portfolio");
            }
          }}
          className="group block glass rounded-lg px-2 py-1 sm:px-3 sm:py-2 text-right transition-all duration-200 hover:border-emerald-500/50 hover:bg-white/[0.06] hover:shadow-lg hover:shadow-emerald-500/10 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          aria-label="شبکه فعال - بیش از ۸۶۰ شبکه فعال"
        >
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="led-dot shrink-0" data-active="true" aria-hidden="true" />
            <div>
              <p
                className="text-[10px] sm:text-xs font-semibold whitespace-nowrap group-hover:text-emerald-400 transition-colors"
                style={{ color: "var(--theme-foreground)" }}
              >
                شبکه فعال
              </p>
              <p className="text-[8px] sm:text-[10px] text-[var(--theme-muted)] group-hover:text-neutral-300 transition-colors whitespace-nowrap font-medium">
                +۸۶۰ شبکه فعال
              </p>
            </div>
          </div>
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 1.8, duration: 0.5 }}
        className="hidden sm:block absolute bottom-[30%] right-[3%] sm:right-[5%] glass rounded-full px-3 py-1.5 pointer-events-none z-10"
      >
        <span className="text-[10px] font-medium text-[var(--theme-muted)]">
          Cisco · MikroTik
        </span>
      </motion.div>
    </div>
  );
}
