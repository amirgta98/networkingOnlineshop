"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, ChevronDown, CheckCircle2 } from "lucide-react";
import { ABOUT_FAQS } from "../mock-data/about-data";

export function AboutFAQ() {
  const [openId, setOpenId] = React.useState<string | null>("faq-1");

  const toggle = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section className="py-12 sm:py-16">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-neutral-800 pb-5">
          <div className="space-y-1.5 text-right">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-orange-400">
              <HelpCircle className="h-3.5 w-3.5" />
              <span>پاسخ به ابهامات متداول</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight">
              پرسش‌های متداول درباره ققنوس آکادمی و خدمات ما
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-neutral-400 max-w-md text-right leading-relaxed">
            اگر سوال دیگری دارید، کارشناسان پشتیبانی ما به صورت ۲۴ ساعته پاسخگوی تماس شما هستند.
          </p>
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-3 max-w-4xl mx-auto">
          {ABOUT_FAQS.map((item) => {
            const isOpen = openId === item.id;

            return (
              <div
                key={item.id}
                className="rounded-2xl border border-neutral-800 bg-neutral-900/40 overflow-hidden text-right transition-colors"
              >
                <button
                  type="button"
                  onClick={() => toggle(item.id)}
                  className="flex w-full items-center justify-between gap-3 p-5 sm:p-6 text-right hover:bg-neutral-900/70 transition-colors cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-orange-500/10 text-orange-400 text-xs font-bold font-mono">
                      ؟
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-white">
                      {item.question}
                    </h3>
                  </div>

                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                    className="shrink-0 text-neutral-400"
                  >
                    <ChevronDown className="h-5 w-5" />
                  </motion.div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
                      className="overflow-hidden border-t border-neutral-800/80 bg-neutral-900/60"
                    >
                      <div className="p-5 sm:p-6 text-xs sm:text-sm text-neutral-300 leading-relaxed space-y-2">
                        <p>{item.answer}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
