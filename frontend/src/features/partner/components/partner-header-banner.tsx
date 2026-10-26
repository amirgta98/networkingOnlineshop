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
  Wifi,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { formatPrice, toPersianDigits } from "@/shared/lib/utils";

interface PartnerHeaderBannerProps {
  user: AuthUser | null;
}

export function PartnerHeaderBanner({ user }: PartnerHeaderBannerProps) {
  const creditLimit = user?.creditLimit ?? 0;
  const creditBalance = user?.creditBalance ?? 0;
  const creditUsed = Math.max(0, creditLimit - creditBalance);
  const creditPercent = creditLimit > 0 ? Math.round((creditUsed / creditLimit) * 100) : 0;

  const [activeChequesCount, setActiveChequesCount] = React.useState<number>(0);

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem("velox_partner_cheques");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setActiveChequesCount(parsed.filter((c: any) => c.status === "in_custody" || c.status === "pending_clearance").length);
          return;
        }
      }
    } catch {
      // ignore
    }
    setActiveChequesCount(0);
  }, []);

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
                  {user?.companyName || user?.name || "پنل همکار تجاری"}
                </h1>
                <span className="text-xs text-sky-300 bg-sky-500/20 px-2.5 py-0.5 rounded-full border border-sky-500/30 font-semibold inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-sky-400 animate-pulse shadow-[0_0_8px_#38bdf8]" />
                  <span>همکار تجاری</span>
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-400">
                <span>نماینده: <strong className="text-neutral-200">{user?.name || "ثبت نشده"}</strong></span>
                <span>شناسه / کد ملی: <strong className="font-mono text-neutral-200">{user?.nationalId ? toPersianDigits(user.nationalId) : "ثبت نشده"}</strong></span>
                <span>کد اقتصادی: <strong className="font-mono text-neutral-200">{user?.economicCode ? toPersianDigits(user.economicCode) : "ثبت نشده"}</strong></span>
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

            <Link href="/internet">
              <Button className="bg-sky-600 hover:bg-sky-500 text-white gap-2 shadow-lg shadow-sky-600/25 text-xs">
                <Wifi className="h-4 w-4" />
                <span>خرید اینترنت با پورسانت همکار</span>
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
              {toPersianDigits(activeChequesCount)} فقره
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-neutral-900/50 border border-neutral-800/80 flex flex-col">
            <span className="text-[11px] text-neutral-400">وضعیت همکاری:</span>
            <span className="text-sm sm:text-base font-bold text-amber-400 mt-1">
              {(user as any)?.partnerTier || "همکار رسمی"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
