"use client";

import * as React from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  Bell,
  Mail,
  Send,
  Sparkles,
  Phone,
  CheckCircle2,
  FileText,
  Briefcase,
  Layers,
  ShieldCheck,
  Copy,
  Check,
  ArrowLeft,
  ExternalLink,
} from "lucide-react";
import { Container } from "@/shared/components/ui/container";
import { CareerLottiePlayer } from "./career-lottie-player";

export function CareersSection() {
  const shouldReduceMotion = useReducedMotion();
  const [copiedEmail, setCopiedEmail] = React.useState(false);

  const hrEmail = "careers@ghoghnoos.academy";
  const hrPhone = "۰۹۱۳۴۷۶۱۰۹۷";

  const handleCopyEmail = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(hrEmail);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2500);
    }
  };

  return (
    <section
      id="careers"
      aria-labelledby="careers-heading"
      className="relative py-16 sm:py-24 overflow-hidden border-t border-neutral-800/80"
      dir="rtl"
    >
      {/* ── Technical Background Grid & Ambient Glows ──────────────────── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-25"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/4 -right-40 h-96 w-96 rounded-full bg-orange-500/10 blur-[140px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-10 -left-40 h-96 w-96 rounded-full bg-indigo-500/10 blur-[140px]"
      />

      <Container className="relative z-10">
        {/* ── Main Announcement Card ─────────────────────────────────────── */}
        <div className="relative overflow-hidden rounded-3xl border border-neutral-800/90 bg-[#111114]/95 p-6 sm:p-10 lg:p-12 shadow-2xl shadow-black/60 backdrop-blur-xl">
          {/* Subtle gradient border highlight */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-transparent opacity-50"
          />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* ── Right Side (Column 7): Data Requirements & 2 Buttons ───── */}
            <div className="lg:col-span-7 space-y-6">
              {/* Eyebrow Announcement Pill */}
              <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-3.5 py-1.5 text-xs font-semibold text-orange-400">
                <span className="flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.9)] animate-led-pulse" />
                <Bell className="h-3.5 w-3.5 text-orange-400" />
                <span>اطلاعیه رسمی جذب نیرو و همکاری سازمانی</span>
                <Sparkles className="h-3 w-3" />
              </div>

              {/* Main Heading */}
              <div>
                <h2
                  id="careers-heading"
                  className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight mb-3"
                >
                  همکاری با ققنوس آکادمی و ارسال رزومه کاری
                </h2>
                <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed max-w-2xl">
                  مجموعه تخصصی ققنوس آکادمی جهت توسعه دپارتمان‌های فنی، فروش تجهیزات شبکه، پروژه‌های دیتاسنتر و بازاریابی، از متخصصان باانگیزه و متعهد دعوت به همکاری می‌نماید.
                </p>
              </div>

              {/* ── Essential Announcement Data Points (داده‌های مورد نیاز) ──── */}
              <div className="rounded-2xl border border-neutral-800/80 bg-neutral-900/60 p-4 sm:p-5 space-y-3.5 backdrop-blur-sm">
                {/* Item 1: Resume document info */}
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-500/15 border border-orange-500/25 text-orange-400 mt-0.5">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-neutral-100">
                      اطلاعات و فایل رزومه کاری مورد نیاز:
                    </h3>
                    <p className="text-[11px] sm:text-xs text-neutral-400 leading-relaxed mt-0.5">
                      فایل رزومه با فرمت استاندارد (PDF یا Word) شامل اطلاعات فردی، شماره تماس در دسترس، سوابق شغلی و مهارت‌های تخصصی.
                    </p>
                  </div>
                </div>

                {/* Item 2: Open specialty areas */}
                <div className="flex items-start gap-3 border-t border-neutral-800/60 pt-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-500/15 border border-indigo-500/25 text-indigo-400 mt-0.5">
                    <Briefcase className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-neutral-100">
                      حوزه‌های تخصصی فعال جذب:
                    </h3>
                    <p className="text-[11px] sm:text-xs text-neutral-400 leading-relaxed mt-0.5">
                      مهندسی شبکه و زیرساخت (Cisco و MikroTik)، کارشناس فروش سازمانی (B2B)، تکنسین پسیو و فیبر نوری، کارشناس مارکتینگ و سئو.
                    </p>
                  </div>
                </div>

                {/* Item 3: Guarantees & Perks */}
                <div className="flex items-start gap-3 border-t border-neutral-800/60 pt-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 mt-0.5">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-neutral-100">
                      مزایای سازمانی و پاسخگویی سریع:
                    </h3>
                    <p className="text-[11px] sm:text-xs text-neutral-400 leading-relaxed mt-0.5">
                      بیمه تامین اجتماعی از روز اول، بیمه تکمیلی، پاداش عملکرد، آموزش مداوم و بررسی اولیه رزومه‌ها ظرف ۳ الی ۵ روز کاری.
                    </p>
                  </div>
                </div>
              </div>

              {/* ── The 2 Core Action Buttons (۲ دکمه مورد نظر) ───────────── */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
                {/* Button 1: Primary - Send Resume */}
                <Link
                  href="/careers"
                  className="group flex-1 inline-flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 px-6 py-3.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-orange-600/25 transition-all duration-150 hover:from-orange-500 hover:to-amber-500 active:scale-[0.97] cursor-pointer"
                >
                  <FileText className="h-4 w-4 transition-transform group-hover:scale-110" />
                  <span>ارسال رزومه</span>
                  <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                </Link>

                {/* Button 2: Secondary - Direct Contact via Telegram */}
                <a
                  href="https://t.me/ghoghnoos_academy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex-1 inline-flex items-center justify-center gap-2.5 rounded-xl border border-neutral-700 bg-neutral-900/90 px-6 py-3.5 text-xs sm:text-sm font-semibold text-neutral-200 transition-all duration-150 hover:border-neutral-600 hover:bg-neutral-800 hover:text-white active:scale-[0.97] cursor-pointer"
                >
                  <Send className="h-4 w-4 text-orange-400 transition-transform group-hover:scale-110" />
                  <span>ارتباط با واحد جذب در تلگرام</span>
                  <ExternalLink className="h-3.5 w-3.5 text-neutral-400 group-hover:text-white" />
                </a>
              </div>

              {/* Direct HR email/phone bar with one-click copy */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs text-neutral-400">
                <div className="flex items-center gap-2">
                  <span className="text-neutral-500">ایمیل مستقیم جذب:</span>
                  <button
                    onClick={handleCopyEmail}
                    className="inline-flex items-center gap-1.5 font-mono text-neutral-300 hover:text-orange-400 transition-colors cursor-pointer bg-neutral-900/70 border border-neutral-800 px-2 py-0.5 rounded-lg"
                    title="کپی آدرس ایمیل"
                  >
                    <span>{hrEmail}</span>
                    {copiedEmail ? (
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="h-3.5 w-3.5 text-neutral-500 hover:text-neutral-300" />
                    )}
                  </button>
                  {copiedEmail && (
                    <span className="text-[11px] text-emerald-400 animate-fade-in font-sans">
                      کپی شد!
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-neutral-500" />
                  <span className="text-neutral-500">تلفن منابع انسانی:</span>
                  <a
                    href="tel:09134761097"
                    className="font-mono text-neutral-300 hover:text-orange-400 transition-colors"
                    dir="ltr"
                  >
                    {hrPhone}
                  </a>
                </div>
              </div>
            </div>

            {/* ── Left Side (Column 5): LottieFiles Animation ────────────── */}
            <div className="lg:col-span-5 flex items-center justify-center">
              <CareerLottiePlayer />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
