"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Award, CheckCircle2, Globe2 } from "lucide-react";
import { PARTNER_BRANDS } from "../mock-data/about-data";

export function AboutCertifications() {
  return (
    <section className="py-12 sm:py-16">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-neutral-800 pb-5">
          <div className="space-y-1.5 text-right">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-400">
              <Award className="h-3.5 w-3.5" />
              <span>پارتنرهای رسمی و تامین‌کنندگان معتبر</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight">
              تاییدیه و گواهینامه‌های رسمی کمپانی‌های بین‌المللی
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-neutral-400 max-w-md text-right leading-relaxed">
            تامین بی‌واسطه از مبادی تایید شده جهانی متضمن پایداری، عملکرد بی‌نقص و طول عمر
            تجهیزات دیتاسنتر شماست.
          </p>
        </div>

        {/* Brands Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {PARTNER_BRANDS.map((brand, index) => (
            <motion.div
              key={brand.id}
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                duration: 0.35,
                delay: index * 0.04,
                ease: [0.23, 1, 0.32, 1],
              }}
              className="group rounded-3xl border border-neutral-800/90 bg-neutral-900/40 p-6 text-right hover:border-neutral-700 hover:bg-neutral-900/80 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono font-bold text-orange-400 bg-orange-500/10 px-2.5 py-1 rounded-lg">
                    {brand.country}
                  </span>
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-orange-300 transition-colors mb-1">
                  {brand.name}
                </h3>

                <div className="text-xs font-semibold text-neutral-300 mb-2">
                  {brand.tier}
                </div>

                <p className="text-xs text-neutral-400 leading-relaxed">
                  {brand.description}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-neutral-800/80 flex items-center justify-between text-[11px] text-emerald-400">
                <span className="flex items-center gap-1 font-medium">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>تضمین اصالت اورجینال</span>
                </span>
                <span className="text-neutral-500 font-mono">100% GENUINE</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
