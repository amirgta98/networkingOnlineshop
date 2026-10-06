"use client";

import * as React from "react";
import Link from "next/link";
import {
  Wrench,
  ShieldCheck,
  Calculator,
  ArrowLeft,
  CheckCircle2,
  Cpu,
  Layers,
} from "lucide-react";
import { Container } from "@/shared/components/ui/container";

export function InstallationBannerSection() {
  return (
    <section className="py-12 border-t border-[var(--theme-border-color)]" dir="rtl">
      <Container>
        <div className="relative overflow-hidden rounded-3xl border border-orange-500/30 bg-gradient-to-br from-[#161413] via-[#111114] to-[#0d0d0f] p-6 sm:p-10 lg:p-12 shadow-2xl">
          {/* Subtle glow effect */}
          <div
            className="pointer-events-none absolute -top-20 -left-20 h-64 w-64 rounded-full blur-3xl opacity-20"
            style={{
              background: "radial-gradient(circle, #ea580c 0%, rgba(234,88,12,0) 70%)",
            }}
          />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center text-right">
            {/* Right 8 cols */}
            <div className="lg:col-span-8 flex flex-col gap-4">
              <div className="inline-flex items-center gap-2 self-start rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-xs font-semibold text-orange-400">
                <span className="flex h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
                <span>خدمات اجرایی مهندسی شبکه</span>
              </div>

              <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white leading-snug">
                نیاز به نصب، کابل‌کشی یا راه‌اندازی دیتاسنتر دارید؟
              </h2>

              <p className="text-xs sm:text-sm text-neutral-300 max-w-2xl leading-relaxed">
                تیم فنی ققنوس آکادمی با تجهیزات تست کالیبره فلوک (Fluke Networks)، کابل‌کشی استاندارد، آرایش رک و پیکربندی سوئیچ‌ها و فایروال‌ها، پروژه شما را با ۱۸ ماه گارانتی مکتوب و بازدید رایگان در محل اجرا می‌نماید.
              </p>

              {/* Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
                {[
                  "تست فلوک ۱۰۰٪ با گزارش رسمی PDF",
                  "۱۸ ماه گارانتی مکتوب کیفیت اتصالات",
                  "اعزام کارشناس ارشد ظرف کمتر از ۲۴ ساعت",
                ].map((hl) => (
                  <div key={hl} className="flex items-center gap-2 text-xs text-neutral-300">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>{hl}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Left 4 cols: Action buttons */}
            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 justify-center">
              <Link
                href="/installation"
                className="flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-[var(--theme-primary)] hover:opacity-90 active:scale-95 text-white font-bold text-xs sm:text-sm shadow-xl shadow-[var(--theme-primary)]/25 transition-all text-center"
              >
                <Wrench className="h-4 w-4" />
                <span>ثبت درخواست آنلاین نصب</span>
                <ArrowLeft className="h-4 w-4" />
              </Link>

              <Link
                href="/installation#installation-calculator"
                className="flex items-center justify-center gap-2 py-3 px-5 rounded-xl border border-neutral-700 bg-neutral-800/80 hover:bg-neutral-800 text-neutral-200 hover:text-white font-semibold text-xs sm:text-sm transition-colors text-center"
              >
                <Calculator className="h-4 w-4 text-orange-400" />
                <span>محاسبه‌گر آنلاین هزینه و زمان</span>
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
