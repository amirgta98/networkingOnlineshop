"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Wifi, CheckCircle2, Sparkles, Send, ShieldCheck, Briefcase } from "lucide-react";

const PRIMARY = "#ea580c";
const PRIMARY_LIGHT = "#f97316";
const ACCENT_GREEN = "#10b981";

export function CareerLottiePlayer() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="relative flex items-center justify-center w-full h-full min-h-[380px] sm:min-h-[440px] select-none overflow-hidden">
      {/* ── Outer Ambient Glows (Orange & Dark Tech) ───────────────────── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex items-center justify-center"
      >
        <div className="h-64 w-64 sm:h-80 sm:w-80 rounded-full bg-orange-500/15 blur-[90px]" />
        <div className="absolute h-48 w-48 rounded-full bg-amber-500/10 blur-[70px]" />
      </div>

      {/* ── Main High-Tech Career & Resume Motion SVG ───────────────────── */}
      <motion.svg
        viewBox="0 0 460 460"
        width="100%"
        height="100%"
        className="relative z-10 max-w-[420px] max-h-[420px]"
        aria-label="انیمیشن ارسال رزومه کاری و همکاری تخصصی در ققنوس آکادمی"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
      >
        <defs>
          {/* Shimmer / Glow Filter */}
          <filter id="career-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Intense orange glow for orbits */}
          <filter id="packet-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Document card linear gradient */}
          <linearGradient id="doc-card-bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#18181b" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#0f0f12" stopOpacity="0.98" />
          </linearGradient>

          {/* Orange border gradient */}
          <linearGradient id="doc-card-border" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f97316" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#ea580c" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#71717a" stopOpacity="0.2" />
          </linearGradient>

          {/* Signal beam gradient */}
          <linearGradient id="beam-grad" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#ea580c" stopOpacity="0" />
            <stop offset="100%" stopColor="#ea580c" stopOpacity="0.6" />
          </linearGradient>
        </defs>

        {/* ── Background Subtle Tech Circles ────────────────────────────── */}
        <circle
          cx="230"
          cy="230"
          r="190"
          fill="none"
          stroke="rgba(255, 255, 255, 0.05)"
          strokeWidth="1"
        />
        <circle
          cx="230"
          cy="230"
          r="140"
          fill="none"
          stroke="rgba(255, 255, 255, 0.04)"
          strokeWidth="1"
          strokeDasharray="4 6"
        />

        {/* ── Outer Rotating Dashed Orbit Ring ───────────────────────────── */}
        <motion.g
          animate={shouldReduceMotion ? {} : { rotate: 360 }}
          transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: "230px 230px" }}
        >
          <ellipse
            cx="230"
            cy="230"
            rx="180"
            ry="75"
            fill="none"
            stroke="rgba(234, 88, 12, 0.35)"
            strokeWidth="1.5"
            strokeDasharray="8 10"
          />

          {/* Orbiting Tech Node 1 */}
          <motion.circle
            cx="410"
            cy="230"
            r="5"
            fill={PRIMARY_LIGHT}
            filter="url(#packet-glow)"
          />
          {/* Orbiting Tech Node 2 */}
          <motion.circle
            cx="50"
            cy="230"
            r="4"
            fill="#fbbf24"
            filter="url(#packet-glow)"
          />
        </motion.g>

        {/* ── Counter-Rotating Diagonal Orbit Ring ──────────────────────── */}
        <motion.g
          animate={shouldReduceMotion ? {} : { rotate: -360 }}
          transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: "230px 230px" }}
        >
          <ellipse
            cx="230"
            cy="230"
            rx="160"
            ry="65"
            fill="none"
            stroke="rgba(255, 255, 255, 0.12)"
            strokeWidth="1.2"
            strokeDasharray="6 8"
          />
          {/* Green Data Packet */}
          <motion.circle
            cx="230"
            cy="165"
            r="4.5"
            fill={ACCENT_GREEN}
            filter="url(#packet-glow)"
          />
        </motion.g>

        {/* ── Pulsing Ping Rings behind Resume ──────────────────────────── */}
        <motion.circle
          cx="230"
          cy="225"
          r="105"
          fill="none"
          stroke="rgba(234, 88, 12, 0.4)"
          strokeWidth="1.5"
          initial={{ r: 90, opacity: 0.8 }}
          animate={
            shouldReduceMotion
              ? {}
              : { r: [90, 140], opacity: [0.8, 0] }
          }
          transition={{ duration: 3, repeat: Infinity, ease: "easeOut" }}
        />

        {/* ── Central Resume Document Card (Floating gently) ────────────── */}
        <motion.g
          animate={
            shouldReduceMotion
              ? {}
              : { y: [-6, 6, -6], rotate: [-1, 1, -1] }
          }
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
          style={{ transformOrigin: "230px 225px" }}
        >
          {/* Document Card Drop Shadow */}
          <rect
            x="148"
            y="114"
            width="164"
            height="224"
            rx="18"
            fill="rgba(0, 0, 0, 0.6)"
            filter="url(#career-glow)"
          />

          {/* Document Card Background */}
          <rect
            x="148"
            y="112"
            width="164"
            height="224"
            rx="18"
            fill="url(#doc-card-bg)"
            stroke="url(#doc-card-border)"
            strokeWidth="2"
          />

          {/* ── Document Interior Elements ── */}

          {/* User Profile Avatar with glowing border */}
          <circle
            cx="188"
            cy="154"
            r="20"
            fill="rgba(234, 88, 12, 0.15)"
            stroke="#ea580c"
            strokeWidth="1.8"
          />
          {/* Avatar Silhouette */}
          <circle cx="188" cy="150" r="7" fill="#f97316" />
          <path
            d="M 176 166 A 12 10 0 0 1 200 166 Z"
            fill="#f97316"
            opacity="0.9"
          />

          {/* Name & Title Header lines */}
          <rect x="218" y="144" width="76" height="7" rx="3.5" fill="#f4f4f5" />
          <rect
            x="218"
            y="157"
            width="52"
            height="5"
            rx="2.5"
            fill="rgba(249, 115, 22, 0.85)"
          />

          {/* Divider line */}
          <line
            x1="168"
            y1="184"
            x2="292"
            y2="184"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth="1"
          />

          {/* Skill lines (shimmering) */}
          <rect
            x="168"
            y="198"
            width="124"
            height="6"
            rx="3"
            fill="rgba(255, 255, 255, 0.35)"
          />
          <rect
            x="168"
            y="214"
            width="124"
            height="6"
            rx="3"
            fill="rgba(255, 255, 255, 0.25)"
          />
          <rect
            x="168"
            y="230"
            width="90"
            height="6"
            rx="3"
            fill="rgba(255, 255, 255, 0.25)"
          />

          {/* Skill tags / Pills inside document */}
          <rect
            x="168"
            y="248"
            width="54"
            height="16"
            rx="5"
            fill="rgba(234, 88, 12, 0.2)"
            stroke="rgba(234, 88, 12, 0.5)"
            strokeWidth="1"
          />
          <rect
            x="174"
            y="254"
            width="42"
            height="4"
            rx="2"
            fill="#f97316"
          />

          <rect
            x="228"
            y="248"
            width="64"
            height="16"
            rx="5"
            fill="rgba(16, 185, 129, 0.15)"
            stroke="rgba(16, 185, 129, 0.4)"
            strokeWidth="1"
          />
          <rect
            x="234"
            y="254"
            width="52"
            height="4"
            rx="2"
            fill="#10b981"
          />

          {/* Bottom highlight bar */}
          <rect
            x="168"
            y="276"
            width="124"
            height="26"
            rx="8"
            fill="rgba(234, 88, 12, 0.15)"
            stroke="rgba(234, 88, 12, 0.4)"
            strokeWidth="1.2"
          />
          {/* Animated progress beam inside highlight bar */}
          <motion.rect
            x="172"
            y="287"
            height="4"
            rx="2"
            fill="#ea580c"
            initial={{ width: 30 }}
            animate={
              shouldReduceMotion
                ? { width: 116 }
                : { width: [30, 116, 30] }
            }
            transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* ── Verified / Approved Badge (Bottom-Right of Card) ── */}
          <g transform="translate(294, 306)">
            {/* Glowing outer disc */}
            <circle
              cx="0"
              cy="0"
              r="22"
              fill="#111114"
              stroke="#10b981"
              strokeWidth="2.5"
              filter="url(#career-glow)"
            />
            {/* Emerald inner core */}
            <circle cx="0" cy="0" r="16" fill="#10b981" />
            {/* Checkmark icon */}
            <path
              d="M -6 0 L -2 5 L 7 -5"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>
        </motion.g>

        {/* ── Floating Satellites: Flying Resume Send Icon (Top-Right) ───── */}
        <motion.g
          animate={
            shouldReduceMotion
              ? {}
              : { y: [-5, 7, -5], x: [3, -3, 3] }
          }
          transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        >
          <circle
            cx="362"
            cy="118"
            r="24"
            fill="#18181b"
            stroke="rgba(234, 88, 12, 0.5)"
            strokeWidth="1.5"
            filter="url(#career-glow)"
          />
          {/* Rocket / Send Icon Path */}
          <path
            d="M 353 126 L 373 110 L 364 128 L 358 122 Z"
            fill="#f97316"
          />
          <path
            d="M 373 110 L 358 122"
            stroke="#ea580c"
            strokeWidth="1.5"
          />
        </motion.g>

        {/* ── Floating Satellites: Network Wi-Fi / Tech Node (Bottom-Left) ── */}
        <motion.g
          animate={
            shouldReduceMotion
              ? {}
              : { y: [6, -6, 6], x: [-3, 3, -3] }
          }
          transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        >
          <circle
            cx="96"
            cy="320"
            r="22"
            fill="#18181b"
            stroke="rgba(99, 102, 241, 0.5)"
            strokeWidth="1.5"
            filter="url(#career-glow)"
          />
          {/* Signal wave arcs */}
          <path
            d="M 88 322 A 12 12 0 0 1 104 322"
            fill="none"
            stroke="#818cf8"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M 92 325 A 6 6 0 0 1 100 325"
            fill="none"
            stroke="#818cf8"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx="96" cy="328" r="1.8" fill="#818cf8" />
        </motion.g>
      </motion.svg>

      {/* ── Floating Glass Badge 1 (Top Left) ──────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="absolute top-4 sm:top-6 left-2 sm:left-4 z-20 flex items-center gap-2 rounded-xl border border-neutral-800/90 bg-neutral-900/90 px-3 py-1.5 shadow-xl shadow-black/50 backdrop-blur-md text-xs font-semibold text-neutral-200"
      >
        <span className="flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.9)] animate-led-pulse" />
        <Wifi className="h-3.5 w-3.5 text-orange-400" />
        <span className="text-[11px] sm:text-xs">تیم زیرساخت شبکه Cisco & MikroTik</span>
      </motion.div>

      {/* ── Floating Glass Badge 2 (Bottom Right) ──────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="absolute bottom-4 sm:bottom-6 right-2 sm:right-4 z-20 flex items-center gap-2 rounded-xl border border-neutral-800/90 bg-neutral-900/90 px-3 py-1.5 shadow-xl shadow-black/50 backdrop-blur-md text-xs font-semibold text-neutral-200"
      >
        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
        <span className="text-[11px] sm:text-xs text-neutral-300">بررسی سریع رزومه ظرف ۷۲ ساعت</span>
        <Sparkles className="h-3 w-3 text-orange-400" />
      </motion.div>
    </div>
  );
}
