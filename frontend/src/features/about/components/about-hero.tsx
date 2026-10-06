"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Server,
  PhoneCall,
  Sparkles,
  ArrowDown,
  Activity,
  Layers,
  CheckCircle2,
  Cpu,
  Wifi,
  Users,
} from "lucide-react";

interface AboutHeroProps {
  onScrollToContact: () => void;
  onScrollToStory: () => void;
  onScrollToValues: () => void;
}

export function AboutHero({
  onScrollToContact,
  onScrollToStory,
  onScrollToValues,
}: AboutHeroProps) {
  return (
    <section className="relative overflow-hidden pt-4 pb-12 sm:pb-20">
      {/* Background ambient lighting effects */}
      <div
        className="pointer-events-none absolute -top-24 right-1/4 h-96 w-96 rounded-full bg-orange-600/15 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute top-1/2 left-10 h-72 w-72 rounded-full bg-sky-600/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Right Column: Hero Content & Mission (in RTL) */}
        <div className="lg:col-span-7 space-y-6 text-right">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-3.5 py-1.5 text-xs font-semibold text-orange-300 shadow-sm"
          >
            <span className="flex h-2 w-2 rounded-full bg-orange-500 animate-pulse shadow-[0_0_8px_#f97316]" />
            <Sparkles className="h-3.5 w-3.5 text-orange-400 shrink-0" />
            <span>درباره ققنوس آکادمی • مرجع تخصصی تجهیزات شبکه سازمانی</span>
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 14, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.35, delay: 0.05, ease: [0.23, 1, 0.32, 1] }}
            className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.3] sm:leading-[1.25]"
          >
            تامین اصیل، مهندسی پیشرفته و{" "}
            <span className="bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500 bg-clip-text text-transparent">
              زیرساخت پایدار
            </span>{" "}
            برای دیتاسنترهای ایران
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1, ease: [0.23, 1, 0.32, 1] }}
            className="text-sm sm:text-base leading-relaxed text-neutral-300 max-w-2xl"
          >
            از سال ۱۳۹۱ در کنار بزرگ‌ترین سازمان‌ها، بانک‌ها، اپراتورها و شرکت‌های فناوری
            کشور ایستاده‌ایم. با حذف کامل واسطه‌ها، واردات مستقیم از کمپانی‌های اصلی و
            تست دقیق در آزمایشگاه فلوک، آسودگی خاطر مهندسان شبکه را در سراسر ایران تضمین می‌کنیم.
          </motion.p>

          {/* Key Value Highlights Chips */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15, ease: [0.23, 1, 0.32, 1] }}
            className="flex flex-wrap items-center gap-2.5 pt-1 text-xs"
          >
            <div className="flex items-center gap-1.5 rounded-lg bg-neutral-900/80 border border-neutral-800 px-3 py-1.5 text-neutral-300">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>ضمانت ۱۰۰٪ اصالت کالا</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-lg bg-neutral-900/80 border border-neutral-800 px-3 py-1.5 text-neutral-300">
              <Cpu className="h-4 w-4 text-sky-400" />
              <span>مشاوره تخصصی دارندگان CCIE</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-lg bg-neutral-900/80 border border-neutral-800 px-3 py-1.5 text-neutral-300">
              <Activity className="h-4 w-4 text-amber-400" />
              <span>پشتیبانی فنی ۲۴/۷</span>
            </div>
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2, ease: [0.23, 1, 0.32, 1] }}
            className="flex flex-wrap items-center gap-3 pt-3"
          >
            <button
              type="button"
              onClick={onScrollToContact}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 hover:bg-orange-500 active:scale-[0.97] transition-all px-5 py-3 text-xs sm:text-sm font-bold text-white shadow-lg shadow-orange-600/25 cursor-pointer"
            >
              <PhoneCall className="h-4 w-4 shrink-0" />
              <span>اطلاعات تماس و نشانی دفتر</span>
            </button>

            <button
              type="button"
              onClick={onScrollToStory}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-neutral-700 bg-neutral-900/90 hover:border-neutral-600 hover:bg-neutral-800/80 active:scale-[0.97] transition-all px-4 sm:px-5 py-3 text-xs sm:text-sm font-semibold text-neutral-200 cursor-pointer"
            >
              <Layers className="h-4 w-4 text-orange-400 shrink-0" />
              <span>داستان و تاریخچه ما</span>
            </button>

            <button
              type="button"
              onClick={onScrollToValues}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-transparent hover:border-neutral-800 px-3.5 py-3 text-xs font-semibold text-neutral-400 hover:text-neutral-200 transition-colors cursor-pointer"
            >
              <span>ارزش‌ها و استانداردهای کیفی</span>
              <ArrowDown className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        </div>

        {/* Left Column: Interactive Futuristic Network Node Display */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.15, ease: [0.23, 1, 0.32, 1] }}
          className="lg:col-span-5 relative"
        >
          <div className="relative rounded-3xl border border-neutral-800/90 bg-gradient-to-b from-[#141419] to-[#0c0c0f] p-5 sm:p-6 shadow-2xl overflow-hidden">
            {/* Ambient LED glow inside panel */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Header of Device Showcase */}
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4 mb-5">
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
                </span>
                <span className="text-xs font-bold text-white">اتاق سرور و هاب لجستیک ققنوس آکادمی</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                ONLINE • 99.98%
              </span>
            </div>

            {/* Stylized Network Rack / Node Graphic */}
            <div className="space-y-3">
              {/* Node 1: Cisco Active Switches */}
              <div className="rounded-xl border border-neutral-800/80 bg-neutral-900/60 p-3 flex items-center justify-between group hover:border-neutral-700 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
                    <Server className="h-5 w-5" />
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-white group-hover:text-sky-300 transition-colors">
                      دپارتمان سخت‌افزار اکتیو سیسکو
                    </div>
                    <div className="text-[10px] text-neutral-400 font-mono">
                      Catalyst 9300 / 9200 / Nexus Series
                    </div>
                  </div>
                </div>
                <span className="text-[10px] text-sky-400 bg-sky-500/10 px-2 py-1 rounded-md font-semibold">
                  انبار آماده
                </span>
              </div>

              {/* Node 2: Fluke Testing Lab */}
              <div className="rounded-xl border border-neutral-800/80 bg-neutral-900/60 p-3 flex items-center justify-between group hover:border-neutral-700 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
                    <Activity className="h-5 w-5" />
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-white group-hover:text-orange-300 transition-colors">
                      لابراتوار تخصصی تست فلوک
                    </div>
                    <div className="text-[10px] text-neutral-400 font-mono">
                      Fluke DSX-8000 CableAnalyzer™
                    </div>
                  </div>
                </div>
                <span className="text-[10px] text-orange-400 bg-orange-500/10 px-2 py-1 rounded-md font-semibold">
                  تست دائمی
                </span>
              </div>

              {/* Node 3: Passive & Fiber Optics */}
              <div className="rounded-xl border border-neutral-800/80 bg-neutral-900/60 p-3 flex items-center justify-between group hover:border-neutral-700 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <Wifi className="h-5 w-5" />
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors">
                      زیرساخت پسیو و فیبر نوری
                    </div>
                    <div className="text-[10px] text-neutral-400 font-mono">
                      Legrand France & Nexans Belgium
                    </div>
                  </div>
                </div>
                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md font-semibold">
                  اصالت تضمینی
                </span>
              </div>
            </div>

            {/* Quick Micro-stats Footer */}
            <div className="mt-5 pt-4 border-t border-neutral-800/80 grid grid-cols-2 gap-2 text-right">
              <div className="bg-neutral-900/40 rounded-xl p-2.5 border border-neutral-800/60">
                <span className="text-[10px] text-neutral-400 block">پروژه‌های تحویل‌شده:</span>
                <span className="text-sm font-black text-white mt-0.5 block font-mono" dir="ltr">
                  860+ Projects
                </span>
              </div>
              <div className="bg-neutral-900/40 rounded-xl p-2.5 border border-neutral-800/60">
                <span className="text-[10px] text-neutral-400 block">تضمین گارانتی تعویض:</span>
                <span className="text-sm font-black text-orange-400 mt-0.5 block font-mono" dir="ltr">
                  18 Months Gold
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
