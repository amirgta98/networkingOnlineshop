"use client";

import * as React from "react";
import Link from "next/link";
import type { AuthUser } from "@/features/auth";
import {
  Building2,
  CreditCard,
  Layers,
  FileSpreadsheet,
  CheckCircle2,
  TrendingDown,
  ArrowLeft,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { formatPrice, toPersianDigits } from "@/shared/lib/utils";

interface PartnerHeaderBannerProps {
  user: AuthUser | null;
}

export function PartnerHeaderBanner({ user }: PartnerHeaderBannerProps) {
  const creditLimit = user?.creditLimit || 500_000_000;
  const creditBalance = user?.creditBalance || 320_000_000;
  const creditUsed = creditLimit - creditBalance;
  const creditPercent = Math.round((creditUsed / creditLimit) * 100);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-sky-500/30 bg-gradient-to-br from-sky-950/40 via-[var(--theme-surface)] to-[var(--theme-surface)] p-6 sm:p-8 backdrop-blur-xl shadow-xl">
      <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col gap-6">
        {/* Top Line: Corporate Name & Identity */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-sky-500/20 text-sky-400 text-xl font-black ring-2 ring-sky-500/30 shadow-lg shadow-sky-500/20">
              <Building2 className="h-8 w-8" />
            </div>

            <div className="flex flex-col gap-1.5 text-right">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-black text-white">
                  {user?.companyName || "شرکت داده‌پردازی کهکشان ارتباط"}
                </h1>
                <span className="text-xs text-sky-300 bg-sky-500/20 px-2.5 py-0.5 rounded-full border border-sky-500/30 font-semibold inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-sky-400 animate-pulse shadow-[0_0_8px_#38bdf8]" />
                  <span>همکار رسمی طلایی (Tier A)</span>
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-400">
                <span>نماینده تدارکات: <strong className="text-neutral-200">{user?.name || "مهندس کامران کاظمی"}</strong></span>
                <span>شناسه ملی: <strong className="font-mono text-neutral-200">{toPersianDigits(user?.nationalId || "۱۴۰۰۹۸۷۶۵۴۳")}</strong></span>
                <span>کد اقتصادی: <strong className="font-mono text-neutral-200">{toPersianDigits(user?.economicCode || "۴۱۱۵۸۹۷۶۳۲۱۴")}</strong></span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link href="/partner/rfq">
              <Button
                variant="outline"
                className="border-sky-500/40 text-sky-300 hover:bg-sky-500/10 gap-2 text-xs"
              >
                <FileSpreadsheet className="h-4 w-4" />
                <span>استعلام پروژه (RFQ)</span>
              </Button>
            </Link>

            <Link href="/partner/catalog">
              <Button className="bg-sky-600 hover:bg-sky-500 text-white gap-2 shadow-lg shadow-sky-600/25 text-xs">
                <span>سفارش با تخفیف عمده</span>
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Corporate Quick Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-neutral-800/80">
          <div className="p-3 rounded-2xl bg-neutral-900/50 border border-neutral-800/80 flex flex-col">
            <span className="text-[11px] text-neutral-400">سقف اعتبار مصوب:</span>
            <span className="text-sm sm:text-base font-black font-mono text-white mt-1">
              {formatPrice(creditLimit)}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-neutral-900/50 border border-neutral-800/80 flex flex-col">
            <span className="text-[11px] text-neutral-400">اعتبار آزاد فعلی:</span>
            <span className="text-sm sm:text-base font-black font-mono text-emerald-400 mt-1">
              {formatPrice(creditBalance)}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-neutral-900/50 border border-neutral-800/80 flex flex-col">
            <span className="text-[11px] text-neutral-400">چک‌های صیادی فعال:</span>
            <span className="text-sm sm:text-base font-bold text-sky-300 mt-1">
              {toPersianDigits(2)} فقره نزد ققنوس آکادمی
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-neutral-900/50 border border-neutral-800/80 flex flex-col">
            <span className="text-[11px] text-neutral-400">تخفیف ویژه همکاری:</span>
            <span className="text-sm sm:text-base font-bold text-amber-400 mt-1">
              تا ۲۲٪ تخفیف طلایی
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
