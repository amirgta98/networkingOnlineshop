"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  Cpu,
  Truck,
  Headset,
  Tag,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { CORE_VALUES } from "../mock-data/about-data";

const ICON_MAP = {
  shieldCheck: ShieldCheck,
  cpu: Cpu,
  truck: Truck,
  headset: Headset,
  tag: Tag,
  refreshCw: RefreshCw,
};

export function AboutValues() {
  return (
    <section id="values-section" className="py-12 sm:py-16 scroll-mt-20">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-right space-y-2 border-b border-neutral-800 pb-5">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-400">
            <Sparkles className="h-3.5 w-3.5" />
            <span>ستون‌های بنیادین اعتماد سازمانی</span>
          </div>
          <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight">
            چرا بزرگ‌ترین سازمان‌ها ققنوس آکادمی را برمی‌گزینند؟
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 max-w-2xl leading-relaxed">
            ما تجارت تجهیزات شبکه را فراتر از معامله کالا می‌دانیم؛ این یک پیوند اطمینان‌بخش
            برای تداوم ارتباطات و تاب‌آوری دیتاسنترهای حساس کشور است.
          </p>
        </div>

        {/* 6 Core Value Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {CORE_VALUES.map((val, index) => {
            const IconComp = ICON_MAP[val.iconName] || ShieldCheck;

            return (
              <motion.div
                key={val.id}
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  duration: 0.35,
                  delay: index * 0.05,
                  ease: [0.23, 1, 0.32, 1],
                }}
                className="group relative rounded-3xl border border-neutral-800/90 bg-neutral-900/40 p-6 sm:p-7 text-right hover:border-neutral-700 hover:bg-neutral-900/80 transition-all shadow-sm hover:shadow-xl hover:shadow-orange-500/5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-400 border border-orange-500/20 group-hover:scale-110 group-hover:bg-orange-500/20 transition-all">
                      <IconComp className="h-6 w-6" />
                    </div>
                    <span className="rounded-full bg-neutral-800/80 border border-neutral-700/60 px-3 py-1 text-[11px] font-semibold text-neutral-300">
                      {val.highlight}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-orange-300 transition-colors mb-2.5">
                    {val.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                    {val.description}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-neutral-800/60 flex items-center justify-between text-[11px] text-neutral-500 group-hover:text-neutral-400 transition-colors">
                  <span>استاندارد تضمین کیفیت ققنوس آکادمی</span>
                  <span className="font-mono">#0{index + 1}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
