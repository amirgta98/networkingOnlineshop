"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  Award,
  Users,
  Server,
  ShieldCheck,
  Package,
  Clock,
} from "lucide-react";
import { ABOUT_STATS } from "../mock-data/about-data";
import { RollingNumber } from "@/shared/components/motion/rolling-number";

const ICON_MAP = {
  award: Award,
  users: Users,
  server: Server,
  shieldCheck: ShieldCheck,
  package: Package,
  clock: Clock,
};

export function AboutStatsStrip() {
  return (
    <section className="relative py-8" aria-label="آمارهای کلیدی ققنوس آکادمی">
      <div className="rounded-3xl border border-neutral-800/80 bg-neutral-900/40 p-6 sm:p-8 backdrop-blur-md">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 sm:gap-4 divide-y sm:divide-y-0 sm:divide-x sm:divide-x-reverse divide-neutral-800/70">
          {ABOUT_STATS.map((stat, index) => {
            const IconComponent = ICON_MAP[stat.iconName] || Award;

            return (
              <motion.div
                key={stat.id}
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  duration: 0.35,
                  delay: index * 0.04,
                  ease: [0.23, 1, 0.32, 1],
                }}
                className={`flex flex-col items-center text-center px-2 group ${
                  index !== 0 ? "pt-5 sm:pt-0" : ""
                }`}
              >
                {/* Icon */}
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-400 border border-orange-500/20 group-hover:bg-orange-500/20 group-hover:scale-105 transition-all">
                  <IconComponent className="h-5 w-5" />
                </div>

                {/* Animated Number */}
                <div className="flex items-baseline justify-center gap-1 font-black text-white text-xl sm:text-2xl tracking-tight">
                  <RollingNumber
                    value={stat.value}
                    showCurrency={false}
                    className="text-white font-black"
                  />
                  {stat.suffix && (
                    <span className="text-orange-400 font-bold text-sm sm:text-base">
                      {stat.suffix}
                    </span>
                  )}
                </div>

                {/* Label */}
                <h3 className="mt-1 text-xs font-bold text-neutral-200">
                  {stat.label}
                </h3>

                {/* Sublabel */}
                <p className="mt-0.5 text-[11px] text-neutral-400 leading-snug">
                  {stat.sublabel}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
