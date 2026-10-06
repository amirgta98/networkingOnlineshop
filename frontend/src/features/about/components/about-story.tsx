"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Flag,
  Network,
  Server,
  Shield,
  Award,
  Sparkles,
  Calendar,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";
import { MILESTONES } from "../mock-data/about-data";

const ICON_MAP = {
  flag: Flag,
  network: Network,
  server: Server,
  shield: Shield,
  award: Award,
  sparkles: Sparkles,
};

export function AboutStory() {
  const [selectedYearId, setSelectedYearId] = React.useState<string>("1405");

  const activeMilestone =
    MILESTONES.find((m) => m.id === selectedYearId) || MILESTONES[MILESTONES.length - 1];

  return (
    <section id="milestones-section" className="py-12 sm:py-16 scroll-mt-20">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-neutral-800 pb-5">
          <div className="space-y-1.5 text-right">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-400">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>گاه‌شمار پیشرفت و دستاوردها</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight">
              مسیر ۱۴ ساله توسعه زیرساخت و نوآوری
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-neutral-400 max-w-md text-right leading-relaxed">
            از آغاز فعالیت در سال ۱۳۹۱ تا تجهیز بزرگ‌ترین پروژه‌های ملی، همواره تعهد به اصالت
            و کیفیت اولویت اول ما بوده است.
          </p>
        </div>

        {/* Interactive Year Selector Bar (desktop + mobile scroll) */}
        <div className="relative">
          <div className="flex items-center justify-between gap-2 overflow-x-auto pb-3 pt-1 scrollbar-none">
            {MILESTONES.map((item) => {
              const isSelected = selectedYearId === item.id;
              const IconComp = ICON_MAP[item.iconName] || Flag;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedYearId(item.id)}
                  className={`relative flex items-center gap-2 rounded-2xl px-4 py-3 text-xs font-bold transition-all cursor-pointer whitespace-nowrap active:scale-[0.97] shrink-0 border ${
                    isSelected
                      ? "bg-orange-500/15 border-orange-500 text-orange-300 shadow-[0_0_15px_rgba(249,115,22,0.2)]"
                      : "bg-neutral-900/60 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200"
                  }`}
                >
                  <IconComp
                    className={`h-4 w-4 ${
                      isSelected ? "text-orange-400" : "text-neutral-500"
                    }`}
                  />
                  <span>{item.year}</span>
                  {isSelected && (
                    <span className="flex h-1.5 w-1.5 rounded-full bg-orange-400 shadow-[0_0_6px_#f97316]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Featured Active Milestone Detail Showcase */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeMilestone.id}
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
            className="rounded-3xl border border-neutral-800 bg-gradient-to-br from-neutral-900/90 to-neutral-950 p-6 sm:p-8 text-right relative overflow-hidden shadow-xl"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-8 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-orange-500/20 border border-orange-500/30 px-3 py-0.5 text-xs font-bold text-orange-300">
                    سال {activeMilestone.year}
                  </span>
                  {activeMilestone.badge && (
                    <span className="rounded-full bg-neutral-800 px-3 py-0.5 text-xs text-neutral-300">
                      {activeMilestone.badge}
                    </span>
                  )}
                </div>

                <h3 className="text-lg sm:text-2xl font-bold text-white tracking-tight">
                  {activeMilestone.title}
                </h3>

                <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed max-w-2xl">
                  {activeMilestone.summary}
                </p>

                {activeMilestone.metrics && (
                  <div className="pt-2 flex items-center gap-2 text-xs font-semibold text-emerald-400">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>دستاورد کلیدی: {activeMilestone.metrics}</span>
                  </div>
                )}
              </div>

              <div className="lg:col-span-4 flex justify-end">
                <div className="w-full rounded-2xl border border-neutral-800 bg-neutral-900/80 p-5 space-y-2 text-center lg:text-right">
                  <div className="text-[11px] text-neutral-400">موقعیت در تاریخچه:</div>
                  <div className="text-sm font-bold text-neutral-200">
                    گام{" "}
                    {MILESTONES.findIndex((m) => m.id === activeMilestone.id) + 1} از{" "}
                    {MILESTONES.length} در مسیر تعالی سازمانی
                  </div>
                  <div className="w-full bg-neutral-800 rounded-full h-1.5 overflow-hidden mt-3">
                    <div
                      className="bg-orange-500 h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${
                          ((MILESTONES.findIndex((m) => m.id === activeMilestone.id) + 1) /
                            MILESTONES.length) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Complete Timeline Stepper Grid (Visible on all devices for thorough reading) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {MILESTONES.map((item, idx) => {
            const IconComp = ICON_MAP[item.iconName] || Flag;
            const isSelected = selectedYearId === item.id;

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.3, delay: idx * 0.04, ease: [0.23, 1, 0.32, 1] }}
                onClick={() => setSelectedYearId(item.id)}
                className={`group rounded-2xl border p-5 text-right transition-all cursor-pointer ${
                  isSelected
                    ? "border-orange-500/70 bg-neutral-900/90 shadow-md ring-1 ring-orange-500/20"
                    : "border-neutral-800/80 bg-neutral-900/30 hover:border-neutral-700 hover:bg-neutral-900/60"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`text-xs font-mono font-black px-2.5 py-1 rounded-lg ${
                      isSelected
                        ? "bg-orange-500 text-white"
                        : "bg-neutral-800 text-neutral-300 group-hover:text-white"
                    }`}
                  >
                    {item.year}
                  </span>
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-xl border ${
                      isSelected
                        ? "bg-orange-500/20 text-orange-400 border-orange-500/30"
                        : "bg-neutral-800/60 text-neutral-400 border-neutral-700/60"
                    }`}
                  >
                    <IconComp className="h-4 w-4" />
                  </div>
                </div>

                <h4 className="text-sm font-bold text-white group-hover:text-orange-300 transition-colors mb-2">
                  {item.title}
                </h4>

                <p className="text-xs text-neutral-400 leading-relaxed line-clamp-3">
                  {item.summary}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
