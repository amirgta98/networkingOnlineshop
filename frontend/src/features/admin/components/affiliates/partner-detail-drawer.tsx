"use client";

import * as React from "react";
import {
  User,
  Shield,
  Percent,
  Coins,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Save,
  Phone,
  Mail,
  Calendar,
  ToggleLeft,
  ToggleRight,
  TrendingUp,
  Receipt,
  Building2,
  Info,
} from "lucide-react";
import { cn, formatPrice, toPersianDigits, formatJalaliDate } from "@/shared/lib/utils";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { AdminDetailDrawer } from "../shared";
import type {
  AffiliatePartnerDto,
  AffiliatePartnerStatus,
  UpdateAffiliatePartnerPayload,
} from "@/features/affiliate";
import { affiliateApi } from "@/features/affiliate";

interface PartnerDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  partner: AffiliatePartnerDto | null;
  onPartnerUpdated: (updated: AffiliatePartnerDto) => void;
}

export function PartnerDetailDrawer({
  isOpen,
  onClose,
  partner,
  onPartnerUpdated,
}: PartnerDetailDrawerProps) {
  const [status, setStatus] = React.useState<AffiliatePartnerStatus>("ACTIVE");
  const [customDiscount, setCustomDiscount] = React.useState<string>("");
  const [hasCustomDiscount, setHasCustomDiscount] = React.useState<boolean>(false);
  const [customStaticIp, setCustomStaticIp] = React.useState<string>("");
  const [hasCustomStaticIp, setHasCustomStaticIp] = React.useState<boolean>(false);
  const [customInternet, setCustomInternet] = React.useState<string>("");
  const [hasCustomInternet, setHasCustomInternet] = React.useState<boolean>(false);
  const [isDiscountEnabled, setIsDiscountEnabled] = React.useState<boolean>(true);
  const [isCommissionEnabled, setIsCommissionEnabled] = React.useState<boolean>(true);
  const [notes, setNotes] = React.useState<string>("");

  const [isSaving, setIsSaving] = React.useState<boolean>(false);
  const [isResetting, setIsResetting] = React.useState<boolean>(false);
  const [feedback, setFeedback] = React.useState<{ type: "success" | "error"; text: string } | null>(null);

  React.useEffect(() => {
    if (partner) {
      setStatus(partner.status);
      setNotes(partner.notes || "");
      setIsDiscountEnabled(partner.isDiscountEnabled ?? true);
      setIsCommissionEnabled(partner.isCommissionEnabled ?? true);

      if (partner.customDiscountPercent !== null && partner.customDiscountPercent !== undefined) {
        setHasCustomDiscount(true);
        setCustomDiscount(partner.customDiscountPercent.toString());
      } else {
        setHasCustomDiscount(false);
        setCustomDiscount("");
      }

      if (partner.customStaticIpCommission !== null && partner.customStaticIpCommission !== undefined) {
        setHasCustomStaticIp(true);
        setCustomStaticIp(partner.customStaticIpCommission.toString());
      } else {
        setHasCustomStaticIp(false);
        setCustomStaticIp("");
      }

      if (partner.customInternetCommission !== null && partner.customInternetCommission !== undefined) {
        setHasCustomInternet(true);
        setCustomInternet(partner.customInternetCommission.toString());
      } else {
        setHasCustomInternet(false);
        setCustomInternet("");
      }

      setFeedback(null);
    }
  }, [partner]);

  if (!partner) return null;

  const handleSave = async () => {
    setIsSaving(true);
    setFeedback(null);
    try {
      const payload: UpdateAffiliatePartnerPayload = {
        status,
        customDiscountPercent: hasCustomDiscount && customDiscount ? parseFloat(customDiscount) : null,
        customStaticIpCommission: hasCustomStaticIp && customStaticIp ? parseInt(customStaticIp, 10) : null,
        customInternetCommission: hasCustomInternet && customInternet ? parseInt(customInternet, 10) : null,
        isDiscountEnabled,
        isCommissionEnabled,
        notes: notes.trim() || null,
      };

      const updated = await affiliateApi.updateAdminPartner(partner.id, payload);
      onPartnerUpdated(updated);
      setFeedback({ type: "success", text: "تنظیمات همکار با موفقیت ذخیره شد." });
    } catch (err: any) {
      setFeedback({
        type: "error",
        text: err?.message || "خطا در بروزرسانی اطلاعات همکار. لطفاً مجدداً تلاش کنید.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetDefaults = async () => {
    setIsResetting(true);
    setFeedback(null);
    try {
      const updated = await affiliateApi.resetAdminPartnerDefaults(partner.id);
      onPartnerUpdated(updated);
      setHasCustomDiscount(false);
      setCustomDiscount("");
      setHasCustomStaticIp(false);
      setCustomStaticIp("");
      setHasCustomInternet(false);
      setCustomInternet("");
      setFeedback({ type: "success", text: "مقادیر اختصاصی با موفقیت به پیش‌فرض عمومی سیستم بازنشانی شدند." });
    } catch (err: any) {
      setFeedback({
        type: "error",
        text: err?.message || "خطا در بازنشانی مقادیر پیش‌فرض.",
      });
    } finally {
      setIsResetting(false);
    }
  };

  const remainingCommission = Math.max(0, (partner.approvedCommission || 0) - (partner.paidCommission || 0));

  return (
    <AdminDetailDrawer
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      title={
        <div className="flex items-center gap-2">
          <span>پروفایل و نرخ‌های اختصاصی همکار</span>
          <span className="font-mono text-xs text-orange-400 bg-orange-950/50 border border-orange-500/30 px-2 py-0.5 rounded-md">
            {partner.partnerCode}
          </span>
        </div>
      }
      subtitle={`کاربر: ${partner.user?.name || "کاربر سیستم"} | تلفن: ${partner.user?.phone || "—"}`}
      badge={
        <span
          className={cn(
            "px-2.5 py-0.5 rounded-full text-xs font-bold",
            partner.status === "ACTIVE"
              ? "bg-emerald-950/70 border border-emerald-500/40 text-emerald-400"
              : partner.status === "PENDING_APPROVAL"
              ? "bg-amber-950/70 border border-amber-500/40 text-amber-400"
              : "bg-red-950/70 border border-red-500/40 text-red-400"
          )}
        >
          {partner.status === "ACTIVE"
            ? "همکار فعال"
            : partner.status === "PENDING_APPROVAL"
            ? "در انتظار تایید"
            : "غیرفعال"}
        </span>
      }
      footer={
        <div className="flex items-center justify-between w-full gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleResetDefaults}
            isLoading={isResetting}
            className="text-neutral-400 border-neutral-700 hover:text-white gap-1.5"
            title="حذف کلیه نرخ‌های اختصاصی و استفاده از مقادیر عمومی سیستم"
          >
            <RotateCcw className="h-4 w-4 text-orange-400" />
            <span>بازگشت به پیش‌فرض عمومی</span>
          </Button>

          <div className="flex items-center gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              انصراف
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSave}
              isLoading={isSaving}
              className="bg-emerald-600 hover:bg-emerald-500 text-white gap-1.5 font-bold"
            >
              <Save className="h-4 w-4" />
              <span>ذخیره تغییرات</span>
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-6 text-neutral-200" dir="rtl">
        {feedback && (
          <div
            className={cn(
              "p-3 rounded-xl border text-xs flex items-center gap-2",
              feedback.type === "success"
                ? "bg-emerald-950/50 border-emerald-500/40 text-emerald-300"
                : "bg-red-950/50 border-red-500/40 text-red-300"
            )}
          >
            {feedback.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
            )}
            <span>{feedback.text}</span>
          </div>
        )}

        {/* ── Summary Stats Strip ────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-xl border border-neutral-800 bg-[#17171c] p-3 text-right">
            <span className="text-[11px] text-neutral-400 block mb-1">کل فروش ارجاعی</span>
            <span className="text-sm font-black text-white">{formatPrice(partner.totalSales || 0)}</span>
          </div>
          <div className="rounded-xl border border-neutral-800 bg-[#17171c] p-3 text-right">
            <span className="text-[11px] text-neutral-400 block mb-1">تعداد سفارشات</span>
            <span className="text-sm font-black text-sky-400">{toPersianDigits(partner.totalOrders || 0)} سفارش</span>
          </div>
          <div className="rounded-xl border border-neutral-800 bg-[#17171c] p-3 text-right">
            <span className="text-[11px] text-neutral-400 block mb-1">پورسانت تولیدشده</span>
            <span className="text-sm font-black text-purple-400">{formatPrice(partner.totalCommission || 0)}</span>
          </div>
          <div className="rounded-xl border border-neutral-800 bg-[#17171c] p-3 text-right">
            <span className="text-[11px] text-neutral-400 block mb-1">پورسانت باقیمانده</span>
            <span className="text-sm font-black text-emerald-400">{formatPrice(remainingCommission)}</span>
          </div>
        </div>

        {/* ── Status & Main Toggles ──────────────────────────────────── */}
        <div className="rounded-2xl border border-neutral-800 bg-[#141418] p-4 sm:p-5 space-y-4">
          <h3 className="text-xs font-black text-white flex items-center gap-2">
            <Shield className="h-4 w-4 text-orange-400" />
            <span>وضعیت و مجوزهای کلی همکار</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-neutral-400 block mb-1.5">وضعیت حساب همکاری</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as AffiliatePartnerStatus)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-orange-500"
              >
                <option value="ACTIVE">فعال (ACTIVE)</option>
                <option value="PENDING_APPROVAL">در انتظار تایید (PENDING)</option>
                <option value="INACTIVE">غیرفعال / مسدود (INACTIVE)</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl border border-neutral-800 bg-neutral-900/60">
              <div>
                <span className="text-xs font-bold text-white block">مجوز تخفیف محصولات</span>
                <span className="text-[10px] text-neutral-400">اعمال تخفیف روی تجهیزات</span>
              </div>
              <button
                type="button"
                onClick={() => setIsDiscountEnabled((v) => !v)}
                className="text-neutral-400 hover:text-white cursor-pointer"
              >
                {isDiscountEnabled ? (
                  <ToggleRight className="h-7 w-7 text-emerald-400" />
                ) : (
                  <ToggleLeft className="h-7 w-7 text-neutral-600" />
                )}
              </button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl border border-neutral-800 bg-neutral-900/60">
              <div>
                <span className="text-xs font-bold text-white block">مجوز دریافت پورسانت</span>
                <span className="text-[10px] text-neutral-400">محاسبه سود خطوط و IP</span>
              </div>
              <button
                type="button"
                onClick={() => setIsCommissionEnabled((v) => !v)}
                className="text-neutral-400 hover:text-white cursor-pointer"
              >
                {isCommissionEnabled ? (
                  <ToggleRight className="h-7 w-7 text-emerald-400" />
                ) : (
                  <ToggleLeft className="h-7 w-7 text-neutral-600" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ── Custom Rates vs Default Overrides ──────────────────────── */}
        <div className="rounded-2xl border border-neutral-800 bg-[#141418] p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-800/80 pb-3">
            <h3 className="text-xs font-black text-white flex items-center gap-2">
              <Percent className="h-4 w-4 text-emerald-400" />
              <span>نرخ‌های اختصاصی این همکار (سفارشی‌سازی)</span>
            </h3>
            <span className="text-[11px] text-neutral-500">
              در صورت غیرفعال بودن هر گزینه، مقدار پیش‌فرض عمومی سیستم اعمال می‌شود.
            </span>
          </div>

          <div className="space-y-4">
            {/* 1. Custom Product Discount % */}
            <div className="p-3.5 rounded-xl border border-neutral-800/90 bg-neutral-900/40 space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">تخفیف اختصاصی محصولات سخت‌افزاری</span>
                  <span className="text-[11px] text-neutral-400">
                    پیش‌فرض سیستم: ۸٪ | نرخ فعال فعلی:{" "}
                    <strong className="text-emerald-400 font-bold">
                      {partner.effectiveDiscountPercent ?? 8}٪
                    </strong>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const next = !hasCustomDiscount;
                    setHasCustomDiscount(next);
                    if (!next) setCustomDiscount("");
                  }}
                  className="text-xs text-orange-400 hover:text-orange-300 font-medium flex items-center gap-1 cursor-pointer"
                >
                  {hasCustomDiscount ? <ToggleRight className="h-6 w-6 text-orange-400" /> : <ToggleLeft className="h-6 w-6 text-neutral-600" />}
                  <span>{hasCustomDiscount ? "نرخ اختصاصی فعال" : "استفاده از پیش‌فرض"}</span>
                </button>
              </div>

              {hasCustomDiscount && (
                <div className="flex items-center gap-2 pt-1 animate-fade-in max-w-xs">
                  <Input
                    type="number"
                    step="0.5"
                    min="0"
                    max="100"
                    placeholder="مثلاً: 12"
                    value={customDiscount}
                    onChange={(e) => setCustomDiscount(e.target.value)}
                    className="bg-neutral-900 border-neutral-700 text-white text-xs h-9"
                  />
                  <span className="text-xs text-neutral-400 font-bold">درصد (٪)</span>
                </div>
              )}
            </div>

            {/* 2. Custom Static IP Commission */}
            <div className="p-3.5 rounded-xl border border-neutral-800/90 bg-neutral-900/40 space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">پورسانت اختصاصی هر واحد IP استاتیک</span>
                  <span className="text-[11px] text-neutral-400">
                    پیش‌فرض سیستم: ۱۵۰,۰۰۰ تومان | پورسانت فعلی:{" "}
                    <strong className="text-emerald-400 font-bold">
                      {formatPrice(partner.effectiveStaticIpCommission ?? 150000)}
                    </strong>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const next = !hasCustomStaticIp;
                    setHasCustomStaticIp(next);
                    if (!next) setCustomStaticIp("");
                  }}
                  className="text-xs text-orange-400 hover:text-orange-300 font-medium flex items-center gap-1 cursor-pointer"
                >
                  {hasCustomStaticIp ? <ToggleRight className="h-6 w-6 text-orange-400" /> : <ToggleLeft className="h-6 w-6 text-neutral-600" />}
                  <span>{hasCustomStaticIp ? "پورسانت اختصاصی فعال" : "استفاده از پیش‌فرض"}</span>
                </button>
              </div>

              {hasCustomStaticIp && (
                <div className="flex items-center gap-2 pt-1 animate-fade-in max-w-xs">
                  <Input
                    type="number"
                    step="10000"
                    min="0"
                    placeholder="مثلاً: 200000"
                    value={customStaticIp}
                    onChange={(e) => setCustomStaticIp(e.target.value)}
                    className="bg-neutral-900 border-neutral-700 text-white text-xs h-9"
                  />
                  <span className="text-xs text-neutral-400 font-bold">تومان / واحد</span>
                </div>
              )}
            </div>

            {/* 3. Custom Internet Commission */}
            <div className="p-3.5 rounded-xl border border-neutral-800/90 bg-neutral-900/40 space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-white block">پورسانت اختصاصی هر سرویس اینترنت</span>
                  <span className="text-[11px] text-neutral-400">
                    پیش‌فرض سیستم: ۴۰۰,۰۰۰ تومان | پورسانت فعلی:{" "}
                    <strong className="text-emerald-400 font-bold">
                      {formatPrice(partner.effectiveInternetCommission ?? 400000)}
                    </strong>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const next = !hasCustomInternet;
                    setHasCustomInternet(next);
                    if (!next) setCustomInternet("");
                  }}
                  className="text-xs text-orange-400 hover:text-orange-300 font-medium flex items-center gap-1 cursor-pointer"
                >
                  {hasCustomInternet ? <ToggleRight className="h-6 w-6 text-orange-400" /> : <ToggleLeft className="h-6 w-6 text-neutral-600" />}
                  <span>{hasCustomInternet ? "پورسانت اختصاصی فعال" : "استفاده از پیش‌فرض"}</span>
                </button>
              </div>

              {hasCustomInternet && (
                <div className="flex items-center gap-2 pt-1 animate-fade-in max-w-xs">
                  <Input
                    type="number"
                    step="10000"
                    min="0"
                    placeholder="مثلاً: 500000"
                    value={customInternet}
                    onChange={(e) => setCustomInternet(e.target.value)}
                    className="bg-neutral-900 border-neutral-700 text-white text-xs h-9"
                  />
                  <span className="text-xs text-neutral-400 font-bold">تومان / سرویس</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Notes ──────────────────────────────────────────────────── */}
        <div className="rounded-2xl border border-neutral-800 bg-[#141418] p-4 sm:p-5 space-y-2">
          <label className="text-xs font-bold text-white block">یادداشت‌های داخلی مدیریت</label>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="توضیحات قرارداد، حوزه فعالیت یا شروط توافق‌شده با این همکار..."
            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-xs text-white placeholder:text-neutral-500 focus:outline-none focus:border-orange-500 leading-relaxed"
          />
        </div>
      </div>
    </AdminDetailDrawer>
  );
}
