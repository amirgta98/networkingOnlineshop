"use client";

import * as React from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ShoppingBag, Wifi, Server, Network } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { GlobeAnimation } from "./network-animation";

// ── Motion config ──────────────────────────────────────────────────────────

const ease = [0.23, 1, 0.32, 1] as const;

// ── Stats ─────────────────────────────────────────────────────────────────

const stats = [
  { icon: Network, label: "کالای موجود", value: "+۲۰۰۰" },
  { icon: Server, label: "برند تخصصی", value: "+۴۰" },
  { icon: Wifi, label: "پشتیبانی فنی", value: "۲۴/۷" },
];

// ── Component ─────────────────────────────────────────────────────────────

export function HeroSection() {
  const shouldReduceMotion = useReducedMotion();

  const containerVariants = {
    hidden: { opacity: shouldReduceMotion ? 1 : 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.1,
        delayChildren: shouldReduceMotion ? 0 : 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: shouldReduceMotion ? 1 : 0, y: shouldReduceMotion ? 0 : 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: shouldReduceMotion ? 0 : 0.5, ease },
    },
  };

  return (
    <section
      aria-labelledby="hero-heading"
      className="relative overflow-hidden bg-[var(--theme-background)]"
    >
      {/* ── Subtle dot grid ──────────────────────────────────────────────── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* ── Right-side orange glow ────────────────────────────────────────── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 w-1/2"
        style={{
          background:
            "radial-gradient(ellipse 60% 70% at 20% 50%, rgba(234,88,12,0.10) 0%, transparent 70%)",
        }}
      />

      {/* ── Main grid ─────────────────────────────────────────────────────── */}
      <div
        className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 items-center gap-6 px-4 pt-4 pb-2 sm:px-6 sm:pt-6 sm:pb-4 lg:grid-cols-[1.22fr_0.78fr] lg:gap-10 lg:px-8 lg:pt-8 lg:pb-6"
      >
        {/* ── Globe column (Mobile/Tablet: Order 1 = Top | Desktop: Order 2 = Left visually in RTL) ── */}
        <div
          className="relative flex items-center justify-center order-1 lg:order-2 w-full min-h-[190px] sm:min-h-[280px] lg:min-h-[380px] h-[200px] sm:h-[300px] lg:h-[400px]"
        >
          <GlobeAnimation />
        </div>

        {/* ── Text column (Mobile/Tablet: Order 2 = Under globe | Desktop: Order 1 = Right visually in RTL) ── */}
        <motion.div
          variants={containerVariants}
          initial={false}
          animate="visible"
          className="flex flex-col items-center text-center lg:items-start lg:text-right order-2 lg:order-1 w-full"
        >
          {/* Live badge */}
          <motion.div variants={itemVariants} className="mb-2 sm:mb-3 flex justify-center lg:justify-start w-full">
            <div className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-[var(--theme-border-color)] bg-[var(--theme-surface)] px-3 py-1 sm:px-4 sm:py-1.5 shadow-sm max-w-full">
              <span className="led-dot shrink-0" data-active="true" aria-hidden="true" />
              <span className="text-[11px] sm:text-xs font-medium text-[var(--theme-muted)] truncate whitespace-nowrap">
                پلتفرم تخصصی تجهیزات شبکه
              </span>
            </div>
          </motion.div>

          {/* H1: Responsive title */}
          <motion.h1
            id="hero-heading"
            variants={itemVariants}
            className="mb-2.5 sm:mb-3.5 text-center lg:text-right font-black leading-[1.3] tracking-tight text-[var(--theme-foreground)] w-full"
            style={{ fontSize: "clamp(1.35rem, 4.2vw, 3rem)" }}
          >
            <span className="inline-block">زیرساخت شبکه</span>{" "}
            <span
              className="inline-block"
              style={{
                backgroundImage:
                  "linear-gradient(130deg, #ea580c 0%, #fb923c 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              سازمانی
            </span>{" "}
            <span className="inline-block">در یک مقصد</span>
          </motion.h1>

          {/* Description */}
          <motion.p
            variants={itemVariants}
            className="mb-4 sm:mb-6 max-w-[54ch] text-center lg:text-right text-xs sm:text-base lg:text-lg leading-[1.8] text-[var(--theme-muted)] text-pretty"
          >
            سوئیچ مدیریت‌پذیر، روتر سازمانی، فیبر نوری، کابل‌کشی و ابزار تست حرفه‌ای — همه با ضمانت اصالت کالا و مشاوره فنی تخصصی.
          </motion.p>

          {/* CTAs: Responsive touch targets (min 44px) */}
          <motion.div
            variants={itemVariants}
            className="mb-4 sm:mb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-center lg:justify-start gap-3 w-full sm:w-auto max-w-sm sm:max-w-none mx-auto lg:mx-0"
          >
            <Link href="/#catalog" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full sm:w-auto min-h-[44px] sm:min-h-[48px] px-6 gap-2 text-sm sm:text-base font-bold shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[var(--theme-ring)] focus-visible:outline-none"
                style={{
                  background:
                    "linear-gradient(135deg, #c2410c 0%, #ea580c 60%, #f97316 100%)",
                  color: "#fff",
                  border: "none",
                  boxShadow: "0 4px 20px rgba(234,88,12,0.4)",
                }}
              >
                <ShoppingBag className="h-4 w-4 shrink-0" aria-hidden="true" />
                مشاهده محصولات
              </Button>
            </Link>

            <Link href="/#featured" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto min-h-[44px] sm:min-h-[48px] px-6 gap-2 text-sm sm:text-base border-[var(--theme-border-color)] bg-[var(--theme-surface)] text-[var(--theme-foreground)] hover:bg-[var(--theme-surface-hover)] transition-transform hover:scale-[1.02] active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[var(--theme-ring)] focus-visible:outline-none"
              >
                <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden="true" />
                درخواست مشاوره
              </Button>
            </Link>
          </motion.div>

          {/* Stats: Balanced 3-column on mobile, inline flex on tablet/desktop */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-3 sm:flex sm:flex-wrap sm:items-center justify-center lg:justify-start gap-2 sm:gap-8 border-t border-[var(--theme-border-color)] pt-3 sm:pt-5 w-full max-w-lg lg:max-w-none mx-auto lg:mx-0"
          >
            {stats.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex flex-col items-center lg:items-start gap-1">
                <div className="flex items-center gap-1.5">
                  <Icon
                    className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0"
                    style={{ color: "var(--theme-primary)" }}
                    aria-hidden="true"
                  />
                  <span
                    className="tabular-nums text-lg sm:text-2xl font-extrabold"
                    style={{ color: "var(--theme-primary)" }}
                  >
                    {value}
                  </span>
                </div>
                <span className="text-[10px] sm:text-xs text-[var(--theme-muted)] text-center lg:text-right">
                  {label}
                </span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* ── Bottom gradient fade ──────────────────────────────────────────── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 inset-x-0 h-8 sm:h-12"
        style={{
          background:
            "linear-gradient(to bottom, transparent, var(--theme-background))",
        }}
      />
    </section>
  );
}
