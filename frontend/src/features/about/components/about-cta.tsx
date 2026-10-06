"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { PhoneCall, Package, Wrench, ArrowLeft, Sparkles, ShieldCheck } from "lucide-react";

interface AboutCTAProps {
  onScrollToContact: () => void;
}

export function AboutCTA({ onScrollToContact }: AboutCTAProps) {
  return (
    <section className="py-12 sm:py-16">
      <div className="relative rounded-3xl border border-orange-500/30 bg-gradient-to-br from-orange-950/40 via-neutral-900 to-neutral-950 p-8 sm:p-12 text-right overflow-hidden shadow-2xl">
        {/* Glow ambient background effects */}
        <div className="pointer-events-none absolute -top-20 -right-20 h-72 w-72 rounded-full bg-orange-600/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-sky-600/15 blur-3xl" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-orange-500/20 border border-orange-500/30 px-3 py-1 text-xs font-bold text-orange-300">
            <Sparkles className="h-3.5 w-3.5" />
            <span>مشاوره و استعلام آنی تجهیزات شبکه</span>
          </div>

          <h2 className="text-xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-snug">
            آماده راه‌اندازی، توسعه یا نوسازی دیتاسنتر و زیرساخت سازمان خود هستید؟
          </h2>

          <p className="text-xs sm:text-base text-neutral-300 leading-relaxed max-w-2xl">
            مهندسان ارشد شبکه در ققنوس آکادمی همراه شما هستند تا بهترین سناریوی فنی را با مناسب‌ترین
            بودجه و معتبرترین گارانتی ۱۸ ماهه پیاده‌سازی کنید.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onScrollToContact}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 hover:bg-orange-500 active:scale-[0.97] transition-all px-5 py-3 text-xs sm:text-sm font-bold text-white shadow-lg shadow-orange-600/25 cursor-pointer"
            >
              <PhoneCall className="h-4 w-4" />
              <span>ارتباط و مشاوره تلفنی فوری</span>
            </button>

            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-neutral-700 bg-neutral-900/90 hover:border-neutral-600 hover:bg-neutral-800 active:scale-[0.97] transition-all px-5 py-3 text-xs sm:text-sm font-semibold text-neutral-200"
            >
              <Package className="h-4 w-4 text-sky-400" />
              <span>مشاهده کاتالوگ تجهیزات</span>
            </Link>

            <Link
              href="/installation"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-neutral-800 bg-neutral-900/50 hover:border-neutral-700 hover:text-white active:scale-[0.97] transition-all px-4 py-3 text-xs font-semibold text-neutral-300"
            >
              <Wrench className="h-4 w-4 text-orange-400" />
              <span>درخواست نصب و تست فلوک</span>
            </Link>
          </div>

          <div className="pt-4 border-t border-neutral-800/80 flex flex-wrap items-center gap-6 text-xs text-neutral-400">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>۱۰۰٪ اصالت تضمینی قطعات</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>پاسخگویی فوری در ساعات اداری و کشیک</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
