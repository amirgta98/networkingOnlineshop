"use client";

import * as React from "react";
import {
  Award,
  Sparkles,
  Gift,
  Tag,
  CheckCircle2,
  Clock,
  TrendingUp,
  Percent,
  Copy,
  Check,
  ChevronLeft,
} from "lucide-react";
import { useDashboardClub } from "../hooks/use-dashboard-club";
import { ClubVoucher } from "../types/club.types";
import {
  DashboardPageHeader,
  DashboardMetricCard,
  DashboardEmptyState,
} from "./shared";
import { Button } from "@/shared/components/ui/button";
import { formatPrice, toPersianDigits } from "@/shared/lib/utils";

export function ClubView() {
  const { clubState, isLoaded, redeemVoucher } = useDashboardClub();

  const [copiedCode, setCopiedCode] = React.useState<string | null>(null);
  const [successToast, setSuccessToast] = React.useState<string | null>(null);
  const [errorToast, setErrorToast] = React.useState<string | null>(null);

  const handleRedeem = (voucher: ClubVoucher) => {
    setErrorToast(null);
    setSuccessToast(null);
    try {
      const code = redeemVoucher(voucher);
      navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setSuccessToast(`تبریک! ووچر ${voucher.title} فعال شد و کد "${code}" در کلیپ‌بورد کپی گردید.`);
      setTimeout(() => {
        setCopiedCode(null);
        setSuccessToast(null);
      }, 4000);
    } catch (err: any) {
      setErrorToast(err.message || "خطا در دریافت ووچر");
      setTimeout(() => setErrorToast(null), 3000);
    }
  };

  const progressPercent = Math.min(100, Math.round((clubState.currentPoints / clubState.nextTierPoints) * 100));

  return (
    <div className="flex flex-col gap-6" dir="rtl">
      {/* ── 1. Page Header ────────────────────────────────────────── */}
      <DashboardPageHeader
        title="باشگاه مشتریان و امتیاز وفاداری ولوکس"
        description="کسب امتیاز از هر سفارش تجهیزات شبکه، ارتقا به سطوح طلایی و الماس و تبدیل امتیازات به ووچرهای تخفیف میلیونی"
        icon={Award}
        badge={`${toPersianDigits(clubState.currentPoints)} امتیاز فعال`}
        badgeVariant="amber"
      />

      {successToast && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {errorToast && (
        <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
          <span>{errorToast}</span>
        </div>
      )}

      {/* ── 2. Hero Tier Banner ───────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-br from-neutral-900 via-amber-950/20 to-[var(--theme-surface)] p-4 sm:p-8 shadow-xl text-right">
        <div className="absolute top-0 left-0 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-5 sm:gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="flex h-14 w-14 sm:h-16 sm:w-16 shrink-0 items-center justify-center rounded-2xl border border-amber-500/40 bg-amber-500/20 text-amber-400 text-xl sm:text-2xl shadow-lg shadow-amber-500/15">
                <Sparkles className="h-7 w-7 sm:h-8 sm:w-8" />
              </div>

              <div className="flex flex-col">
                <span className="text-xs text-neutral-400">رده وفاداری فعلی شما:</span>
                <h2 className="text-lg sm:text-2xl font-black text-amber-300">
                  {clubState.tierTitle}
                </h2>
                <span className="text-xs text-neutral-400 font-mono mt-0.5">
                  مجموع امتیازات کسب‌شده در تاریخچه: {toPersianDigits(clubState.totalLifetimePoints)}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-2 text-right border-t sm:border-t-0 border-amber-500/20 pt-3 sm:pt-0">
              <div>
                <span className="text-xs text-neutral-400 block">امتیاز قابل استفاده:</span>
                <span className="text-xl sm:text-3xl font-black font-mono text-white">
                  {toPersianDigits(clubState.currentPoints)} <span className="text-xs text-amber-400">امتیاز</span>
                </span>
              </div>
            </div>
          </div>

          {/* Progress to Next Tier */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-neutral-950/60 border border-neutral-800 flex flex-col gap-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs font-semibold">
              <span className="text-neutral-300">
                پیشرفت تا رده «الماس دیتاسنتر (Diamond Tier)»:
              </span>
              <span className="text-amber-400 font-mono text-[11px] sm:text-xs">
                {toPersianDigits(clubState.currentPoints)} از {toPersianDigits(clubState.nextTierPoints)} امتیاز ({toPersianDigits(progressPercent)}٪)
              </span>
            </div>

            <div className="w-full bg-neutral-800 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-l from-amber-400 to-orange-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Active Tier Perks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            {clubState.tierPerks.map((perk, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-neutral-900/60 border border-neutral-800 text-xs text-neutral-200"
              >
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>{perk}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 3. Voucher Store ───────────────────────────────────────── */}
      <div className="rounded-3xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] p-4 sm:p-6 shadow-xs flex flex-col gap-4 text-right">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--theme-border-color)] pb-3">
          <div className="flex items-center gap-2.5">
            <Gift className="h-4 w-4 text-orange-400 shrink-0" />
            <h3 className="text-sm font-bold text-[var(--theme-foreground)]">
              فروشگاه بن‌ها و ووچرهای تخفیف قابل تبدیل
            </h3>
          </div>
          <span className="text-xs text-neutral-400">
            امتیازات خود را به تخفیف نقدی روی سفارش تبدیل کنید
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
          {clubState.vouchers.map((vch) => {
            const canAfford = clubState.currentPoints >= vch.pointsCost;
            return (
              <div
                key={vch.id}
                className={`p-4 rounded-2xl border flex flex-col justify-between gap-4 text-right transition-all ${
                  canAfford
                    ? "border-orange-500/40 bg-neutral-900/60 hover:border-orange-500"
                    : "border-neutral-800 bg-neutral-950/40 opacity-70"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black font-mono text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">
                      {toPersianDigits(vch.pointsCost)} امتیاز
                    </span>
                    <Tag className="h-4 w-4 text-neutral-500" />
                  </div>

                  <h4 className="text-sm font-bold text-neutral-200 mb-1 leading-snug">
                    {vch.title}
                  </h4>
                  <p className="text-[11px] text-neutral-400 leading-relaxed">
                    حداقل مبلغ خرید سفارش: {formatPrice(vch.minPurchaseAmount)}
                  </p>
                </div>

                <div className="pt-2 border-t border-neutral-800">
                  <Button
                    variant={canAfford ? "default" : "outline"}
                    size="sm"
                    disabled={!canAfford}
                    onClick={() => handleRedeem(vch)}
                    className="w-full text-xs font-bold gap-1 cursor-pointer justify-center"
                  >
                    {copiedCode === vch.code ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                        <span>کد کپی شد ✓</span>
                      </>
                    ) : (
                      <>
                        <Gift className="h-3.5 w-3.5" />
                        <span>{canAfford ? "تبدیل و دریافت کد" : "امتیاز ناکافی"}</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 4. Challenges & Points History ─────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Challenges */}
        <div className="rounded-3xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] p-4 sm:p-6 shadow-xs flex flex-col gap-4 text-right">
          <div className="flex items-center gap-2.5 border-b border-[var(--theme-border-color)] pb-3">
            <TrendingUp className="h-4 w-4 text-emerald-400 shrink-0" />
            <h3 className="text-sm font-bold text-[var(--theme-foreground)]">
              چالش‌های فعال جهت دریافت امتیاز بیشتر
            </h3>
          </div>

          <div className="flex flex-col divide-y divide-neutral-800 text-xs">
            {clubState.challenges.map((ch) => (
              <div key={ch.id} className="py-3 first:pt-0 last:pb-0 flex items-start justify-between gap-3">
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-neutral-200">{ch.title}</span>
                    {ch.isCompleted && (
                      <span className="text-[10px] text-emerald-400 bg-emerald-500/15 px-2 py-0.2 rounded-full border border-emerald-500/30">
                        تکمیل شد ✓
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-neutral-400 mt-0.5">{ch.description}</p>
                </div>

                <span className="font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 shrink-0">
                  +{toPersianDigits(ch.rewardPoints)} امتیاز
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* History */}
        <div className="rounded-3xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] p-4 sm:p-6 shadow-xs flex flex-col gap-4 text-right">
          <div className="flex items-center gap-2.5 border-b border-[var(--theme-border-color)] pb-3">
            <Award className="h-4 w-4 text-sky-400 shrink-0" />
            <h3 className="text-sm font-bold text-[var(--theme-foreground)]">
              گردش و سوابق امتیازات
            </h3>
          </div>

          <div className="flex flex-col divide-y divide-neutral-800 text-xs">
            {clubState.history.map((h) => {
              const isEarned = h.points > 0;
              return (
                <div key={h.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                  <div className="flex flex-col">
                    <span className="font-bold text-neutral-200">{h.title}</span>
                    <span className="text-[10px] text-neutral-500 font-mono mt-0.5">
                      {toPersianDigits(h.createdAt)}
                    </span>
                  </div>

                  <span
                    className={`font-mono font-bold text-xs ${
                      isEarned ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {isEarned ? `+${toPersianDigits(h.points)}` : toPersianDigits(h.points)} امتیاز
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
