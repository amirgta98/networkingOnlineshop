"use client";

import * as React from "react";
import { HelpCircle, ChevronDown } from "lucide-react";
import { INTERNET_FAQS } from "../mock-data/internet-data";

export function InternetFAQ() {
  const [openIndex, setOpenIndex] = React.useState<number | null>(0);

  const toggle = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section id="internet-faq" className="scroll-mt-24 space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col gap-2 text-right">
        <div className="inline-flex items-center gap-1.5 self-start text-xs font-bold text-sky-400">
          <HelpCircle className="h-4 w-4" />
          <span>پرسش‌های متداول اینترنت و IP</span>
        </div>
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white">
          سوالات پرتکرار پیرامون خرید اینترنت و آی‌پی استاتیک
        </h2>
        <p className="text-xs sm:text-sm text-neutral-400 max-w-2xl leading-relaxed">
          نکات ضروری درباره تخصیص ساب‌نت، رانژه خطوط فیبر نوری، دوربین‌های مداربسته و قوانین صدور فاکتور.
        </p>
      </div>

      {/* Accordion list */}
      <div className="space-y-3">
        {INTERNET_FAQS.map((item, idx) => {
          const isOpen = openIndex === idx;

          return (
            <div
              key={idx}
              className="rounded-2xl border border-neutral-800 bg-[#121216] overflow-hidden transition-colors"
            >
              <button
                type="button"
                onClick={() => toggle(idx)}
                className="w-full flex items-center justify-between p-4 sm:p-5 text-right cursor-pointer hover:bg-neutral-900/50 transition-colors"
              >
                <span className="text-xs sm:text-sm font-bold text-white flex-1 pl-4">
                  {item.q}
                </span>
                <ChevronDown
                  className={`h-4 w-4 text-neutral-400 transition-transform duration-200 shrink-0 ${
                    isOpen ? "rotate-180 text-sky-400" : ""
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs text-neutral-300 leading-relaxed border-t border-neutral-800/80 pt-3 text-right">
                  {item.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
