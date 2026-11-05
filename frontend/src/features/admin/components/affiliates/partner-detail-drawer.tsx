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
  CreditCard,
  Building2,
  Info,
  Clock,
  Sparkles,
  Receipt,
  Plus,
} from "lucide-react";
import { cn, formatPrice, toPersianDigits, formatJalaliDate } from "@/shared/lib/utils";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { AdminDetailDrawer } from "../shared";
import type {
  AffiliatePartnerDto,
  AffiliatePartnerStatus,
  UpdateAffiliatePartnerPayload,
  AffiliateCommissionDto,
  AffiliatePayoutDto,
} from "../../types/admin-affiliates.types";
import { adminAffiliatesApi } from "../../api/admin-affiliates-api";

interface PartnerDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  partner: AffiliatePartnerDto | null;
  onPartnerUpdated: (updated: AffiliatePartnerDto) => void;
  onInitiatePayout?: (partner: AffiliatePartnerDto) => void;
}

export function PartnerDetailDrawer({
  isOpen,
  onClose,
  partner,
  onPartnerUpdated,
  onInitiatePayout,
}: PartnerDetailDrawerProps) {
  const [livePartner, setLivePartner] = React.useState<AffiliatePartnerDto | null>(partner);
  const [isLoadingLive, setIsLoadingLive] = React.useState<boolean>(false);

  // Tabs inside drawer
  const [drawerTab, setDrawerTab] = React.useState<"settings" | "commissions" | "payouts">("settings");

  // Form state
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

  // Sub-data for partner
  const [partnerCommissions, setPartnerCommissions] = React.useState<AffiliateCommissionDto[]>([]);
  const [isLoadingCommissions, setIsLoadingCommissions] = React.useState<boolean>(false);
  const [partnerPayouts, setPartnerPayouts] = React.useState<AffiliatePayoutDto[]>([]);
  const [isLoadingPayouts, setIsLoadingPayouts] = React.useState<boolean>(false);

  const [isSaving, setIsSaving] = React.useState<boolean>(false);
  const [isResetting, setIsResetting] = React.useState<boolean>(false);
  const [feedback, setFeedback] = React.useState<{ type: "success" | "error"; text: string } | null>(null);

  // Load fresh details from backend
  const fetchLiveDetails = React.useCallback(async (partnerId: string) => {
    setIsLoadingLive(true);
    try {
      const fresh = await adminAffiliatesApi.getPartnerById(partnerId);
      if (fresh) {
        setLivePartner(fresh);
        syncFormWithPartner(fresh);
      }
    } catch (err) {
      console.error("Failed to fetch fresh partner details:", err);
    } finally {
      setIsLoadingLive(false);
    }
  }, []);

  const syncFormWithPartner = (p: AffiliatePartnerDto) => {
    setStatus(p.status);
    setNotes(p.notes || "");
    setIsDiscountEnabled(p.isDiscountEnabled ?? true);
    setIsCommissionEnabled(p.isCommissionEnabled ?? true);

    if (p.customDiscountPercent !== null && p.customDiscountPercent !== undefined) {
      setHasCustomDiscount(true);
      setCustomDiscount(p.customDiscountPercent.toString());
    } else {
      setHasCustomDiscount(false);
      setCustomDiscount("");
    }

    if (p.customStaticIpCommission !== null && p.customStaticIpCommission !== undefined) {
      setHasCustomStaticIp(true);
      setCustomStaticIp(p.customStaticIpCommission.toString());
    } else {
      setHasCustomStaticIp(false);
      setCustomStaticIp("");
    }

    if (p.customInternetCommission !== null && p.customInternetCommission !== undefined) {
      setHasCustomInternet(true);
      setCustomInternet(p.customInternetCommission.toString());
    } else {
      setHasCustomInternet(false);
      setCustomInternet("");
    }
  };

  // When drawer opens, load partner
  React.useEffect(() => {
    if (isOpen && partner) {
      setLivePartner(partner);
      syncFormWithPartner(partner);
      setFeedback(null);
      setDrawerTab("settings");
      fetchLiveDetails(partner.id);
    }
  }, [isOpen, partner, fetchLiveDetails]);

  // Load partner's commissions & payouts when switching tabs
  React.useEffect(() => {
    if (!isOpen || !partner?.id) return;

    if (drawerTab === "commissions" && partnerCommissions.length === 0) {
      setIsLoadingCommissions(true);
      adminAffiliatesApi
        .getCommissions({ partnerId: partner.id })
        .then((res) => setPartnerCommissions(res.items || []))
        .catch((err) => console.error("Failed to load partner commissions", err))
        .finally(() => setIsLoadingCommissions(false));
    } else if (drawerTab === "payouts" && partnerPayouts.length === 0) {
      setIsLoadingPayouts(true);
      adminAffiliatesApi
        .getPayouts({ partnerId: partner.id })
        .then((res) => setPartnerPayouts(res.items || []))
        .catch((err) => console.error("Failed to load partner payouts", err))
        .finally(() => setIsLoadingPayouts(false));
    }
  }, [drawerTab, isOpen, partner?.id, partnerCommissions.length, partnerPayouts.length]);

  if (!partner) return null;
  const current = livePartner || partner;

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

      const updated = await adminAffiliatesApi.updatePartner(current.id, payload);
      setLivePartner(updated);
      syncFormWithPartner(updated);
      onPartnerUpdated(updated);
      setFeedback({ type: "success", text: "تنظیمات همکار با موفقیت در پایگاه‌داده ذخیره شد." });
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
      const updated = await adminAffiliatesApi.resetPartnerDefaults(current.id);
      setLivePartner(updated);
      syncFormWithPartner(updated);
      onPartnerUpdated(updated);
      setFeedback({
        type: "success",
        text: "کلیه نرخ‌های اختصاصی حذف شدند و مقادیر عمومی سیستم برای این همکار فعال شدند.",
      });
    } catch (err: any) {
      setFeedback({
        type: "error",
        text: err?.message || "خطا در بازنشانی مقادیر پیش‌فرض.",
      });
    } finally {
      setIsResetting(false);
    }
  };

  const remainingCommission = Math.max(0, (current.approvedCommission || 0) - (current.paidCommission || 0));

  return (
    <AdminDetailDrawer
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      title={
        <div className="flex items-center gap-2">
          <span>پروفایل و نرخ‌های اختصاصی همکار</span>
          <span className="font-mono text-xs text-orange-400 bg-orange-950/50 border border-orange-500/30 px-2 py-0.5 rounded-md">
            {current.partnerCode}
          </span>
          {isLoadingLive && (
            <span className="text-[10px] text-neutral-400 animate-pulse font-normal mr-2">
              (در حال همگام‌سازی با سرور...)
            </span>
          )}
        </div>
      }
      subtitle={`کاربر: ${current.user?.name || "کاربر سیستم"} | تلفن: ${current.user?.phone || "—"}`}
      badge={
        <span
          className={cn(
            "px-2.5 py-0.5 rounded-full text-xs font-bold",
            current.status === "ACTIVE"
              ? "bg-emerald-950/70 border border-emerald-500/40 text-emerald-400"
              : current.status === "PENDING_APPROVAL"
              ? "bg-amber-950/70 border border-amber-500/40 text-amber-400"
              : "bg-red-950/70 border border-red-500/40 text-red-400"
          )}
        >
          {current.status === "ACTIVE"
            ? "همکار فعال"
            : current.status === "PENDING_APPROVAL"
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
            {onInitiatePayout && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  onClose();
                  onInitiatePayout(current);
                }}
                className="border-emerald-500/40 text-emerald-400 hover:bg-emerald-950/40 gap-1.5"
              >
                <CreditCard className="h-4 w-4" />
                <span>ثبت واریزی برای این همکار</span>
              </Button>
            )}
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
            <span className="text-sm font-black text-white">{formatPrice(current.totalSales || 0)}</span>
          </div>
          <div className="rounded-xl border border-neutral-800 bg-[#17171c] p-3 text-right">
            <span className="text-[11px] text-neutral-400 block mb-1">تعداد سفارشات</span>
            <span className="text-sm font-black text-sky-400">{toPersianDigits(current.totalOrders || 0)} سفارش</span>
          </div>
          <div className="rounded-xl border border-neutral-800 bg-[#17171c] p-3 text-right">
            <span className="text-[11px] text-neutral-400 block mb-1">پورسانت تولیدشده</span>
            <span className="text-sm font-black text-purple-400">{formatPrice(current.totalCommission || 0)}</span>
          </div>
          <div className="rounded-xl border border-neutral-800 bg-[#17171c] p-3 text-right">
            <span className="text-[11px] text-neutral-400 block mb-1">پورسانت باقیمانده</span>
            <span className="text-sm font-black text-emerald-400">{formatPrice(remainingCommission)}</span>
          </div>
        </div>

        {/* ── Drawer Tabs Navigation ─────────────────────────────────── */}
        <div className="flex items-center gap-2 border-b border-neutral-800">
          <button
            type="button"
            onClick={() => setDrawerTab("settings")}
            className={cn(
              "px-3 py-2 text-xs font-bold border-b-2 cursor-pointer transition-colors",
              drawerTab === "settings"
                ? "border-orange-500 text-white"
                : "border-transparent text-neutral-400 hover:text-neutral-200"
            )}
          >
            تنظیم نرخ‌ها و وضعیت
          </button>
          <button
            type="button"
            onClick={() => setDrawerTab("commissions")}
            className={cn(
              "px-3 py-2 text-xs font-bold border-b-2 cursor-pointer transition-colors",
              drawerTab === "commissions"
                ? "border-orange-500 text-white"
                : "border-transparent text-neutral-400 hover:text-neutral-200"
            )}
          >
            تراکنش‌های پورسانت ({toPersianDigits(partnerCommissions.length)})
          </button>
          <button
            type="button"
            onClick={() => setDrawerTab("payouts")}
            className={cn(
              "px-3 py-2 text-xs font-bold border-b-2 cursor-pointer transition-colors",
              drawerTab === "payouts"
                ? "border-orange-500 text-white"
                : "border-transparent text-neutral-400 hover:text-neutral-200"
            )}
          >
            سوابق واریزی ({toPersianDigits(partnerPayouts.length)})
          </button>
        </div>

        {/* ── TAB 1: Rates & Settings ────────────────────────────────── */}
        {drawerTab === "settings" && (
          <div className="space-y-5 animate-fade-in">
            {/* Status & Main Toggles */}
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

            {/* Custom Rates Card */}
            <div className="rounded-2xl border border-neutral-800 bg-[#141418] p-4 sm:p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <h3 className="text-xs font-black text-white flex items-center gap-2">
                  <Coins className="h-4 w-4 text-emerald-400" />
                  <span>تنظیم نرخ‌های اختصاصی همکار</span>
                </h3>
                <span className="text-[11px] text-neutral-500">
                  نرخ موثر کنونی: تخفیف {toPersianDigits(current.effectiveDiscountPercent ?? 8)}٪ | IP:{" "}
                  {formatPrice(current.effectiveStaticIpCommission ?? 150000)} | اینترنت:{" "}
                  {formatPrice(current.effectiveInternetCommission ?? 400000)}
                </span>
              </div>

              <div className="space-y-4">
                {/* 1. Custom Discount */}
                <div className="p-3.5 rounded-xl border border-neutral-800 bg-neutral-900/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-white block">درصد تخفیف اختصاصی محصولات</span>
                      <span className="text-[10px] text-neutral-400">
                        {hasCustomDiscount
                          ? "نرخ سفارشی روی سفارش‌های این همکار اعمال می‌شود."
                          : "نرخ پیش‌فرض عمومی سیستم (۸٪) اعمال می‌شود."}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setHasCustomDiscount((v) => !v);
                        if (!hasCustomDiscount && !customDiscount) {
                          setCustomDiscount(String(current.effectiveDiscountPercent ?? 8));
                        }
                      }}
                      className="text-xs font-bold text-orange-400 hover:underline cursor-pointer"
                    >
                      {hasCustomDiscount ? "لغو نرخ سفارشی" : "تعریف نرخ اختصاصی"}
                    </button>
                  </div>

                  {hasCustomDiscount && (
                    <div className="pt-2 max-w-xs">
                      <div className="relative">
                        <Input
                          type="number"
                          step="0.5"
                          min="0"
                          max="100"
                          value={customDiscount}
                          onChange={(e) => setCustomDiscount(e.target.value)}
                          placeholder="مثلاً: 12"
                          className="bg-neutral-950 border-neutral-800 text-white font-black text-sm h-10 pl-12 pr-3"
                        />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-neutral-500 font-bold">
                          درصد (٪)
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. Custom Static IP Commission */}
                <div className="p-3.5 rounded-xl border border-neutral-800 bg-neutral-900/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-white block">پورسانت اختصاصی هر واحد IP استاتیک</span>
                      <span className="text-[10px] text-neutral-400">
                        {hasCustomStaticIp
                          ? "پورسانت اختصاصی به ازای هر IP استاتیک سفارش‌داده‌شده"
                          : "پورسانت پیش‌فرض عمومی سیستم (۱۵۰,۰۰۰ تومان)"}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setHasCustomStaticIp((v) => !v);
                        if (!hasCustomStaticIp && !customStaticIp) {
                          setCustomStaticIp(String(current.effectiveStaticIpCommission ?? 150000));
                        }
                      }}
                      className="text-xs font-bold text-orange-400 hover:underline cursor-pointer"
                    >
                      {hasCustomStaticIp ? "لغو نرخ سفارشی" : "تعریف نرخ اختصاصی"}
                    </button>
                  </div>

                  {hasCustomStaticIp && (
                    <div className="pt-2 max-w-xs">
                      <div className="relative">
                        <Input
                          type="number"
                          step="10000"
                          min="0"
                          value={customStaticIp}
                          onChange={(e) => setCustomStaticIp(e.target.value)}
                          placeholder="مثلاً: 200000"
                          className="bg-neutral-950 border-neutral-800 text-white font-black text-sm h-10 pl-16 pr-3"
                        />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-neutral-500 font-bold">
                          تومان
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. Custom Internet Commission */}
                <div className="p-3.5 rounded-xl border border-neutral-800 bg-neutral-900/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-white block">پورسانت اختصاصی هر خط اینترنت</span>
                      <span className="text-[10px] text-neutral-400">
                        {hasCustomInternet
                          ? "پورسانت اختصاصی به ازای هر سرویس اینترنت فعال"
                          : "پورسانت پیش‌فرض عمومی سیستم (۴۰۰,۰۰۰ تومان)"}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setHasCustomInternet((v) => !v);
                        if (!hasCustomInternet && !customInternet) {
                          setCustomInternet(String(current.effectiveInternetCommission ?? 400000));
                        }
                      }}
                      className="text-xs font-bold text-orange-400 hover:underline cursor-pointer"
                    >
                      {hasCustomInternet ? "لغو نرخ سفارشی" : "تعریف نرخ اختصاصی"}
                    </button>
                  </div>

                  {hasCustomInternet && (
                    <div className="pt-2 max-w-xs">
                      <div className="relative">
                        <Input
                          type="number"
                          step="10000"
                          min="0"
                          value={customInternet}
                          onChange={(e) => setCustomInternet(e.target.value)}
                          placeholder="مثلاً: 500000"
                          className="bg-neutral-950 border-neutral-800 text-white font-black text-sm h-10 pl-16 pr-3"
                        />
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-neutral-500 font-bold">
                          تومان
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Notes Card */}
            <div className="rounded-2xl border border-neutral-800 bg-[#141418] p-4 sm:p-5 space-y-2">
              <label className="text-xs text-neutral-300 font-bold block">یادداشت‌های داخلی مدیریت</label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="توضیحات و توافقات مربوط به قرارداد یا درصد تخفیف همکار..."
                className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-orange-500 resize-none"
              />
            </div>
          </div>
        )}

        {/* ── TAB 2: Commissions List ────────────────────────────────── */}
        {drawerTab === "commissions" && (
          <div className="space-y-3 animate-fade-in">
            {isLoadingCommissions ? (
              <div className="py-12 text-center text-xs text-neutral-400">در حال دریافت تراکنش‌های پورسانت...</div>
            ) : partnerCommissions.length === 0 ? (
              <div className="py-12 text-center text-xs text-neutral-500 border border-dashed border-neutral-800 rounded-xl">
                هیچ تراکنش پورسانتی برای این همکار ثبت نشده است.
              </div>
            ) : (
              <div className="divide-y divide-neutral-800/80 border border-neutral-800 rounded-xl overflow-hidden bg-[#141418]">
                {partnerCommissions.map((comm) => (
                  <div key={comm.id} className="p-3.5 flex items-center justify-between text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white">{comm.orderNumber}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-neutral-800 text-neutral-300">
                          {comm.productType === "INTERNET" ? "سرویس اینترنت" : "IP استاتیک"}
                        </span>
                      </div>
                      <span className="text-[11px] text-neutral-400 block mt-1">{comm.productTitle}</span>
                      <span className="text-[10px] text-neutral-500 font-mono mt-0.5 block">
                        {formatJalaliDate(comm.createdAt)}
                      </span>
                    </div>

                    <div className="text-left">
                      <span className="font-black text-emerald-400 block">{formatPrice(comm.totalCommission)}</span>
                      <span className="text-[10px] text-neutral-400 block">
                        {toPersianDigits(comm.quantity)} عدد × {formatPrice(comm.unitCommission)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 3: Payouts List ────────────────────────────────────── */}
        {drawerTab === "payouts" && (
          <div className="space-y-3 animate-fade-in">
            {isLoadingPayouts ? (
              <div className="py-12 text-center text-xs text-neutral-400">در حال دریافت سوابق واریزی...</div>
            ) : partnerPayouts.length === 0 ? (
              <div className="py-12 text-center text-xs text-neutral-500 border border-dashed border-neutral-800 rounded-xl">
                هنوز هیچ حواله تسویه‌حسابی برای این همکار ثبت نشده است.
              </div>
            ) : (
              <div className="divide-y divide-neutral-800/80 border border-neutral-800 rounded-xl overflow-hidden bg-[#141418]">
                {partnerPayouts.map((pay) => (
                  <div key={pay.id} className="p-3.5 flex items-center justify-between text-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-orange-400">{pay.trackingCode}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-950/70 border border-emerald-500/30 text-emerald-300">
                          {pay.paymentMethod}
                        </span>
                      </div>
                      <span className="text-[11px] text-neutral-400 block mt-1">{pay.description || "بدون توضیحات"}</span>
                      <span className="text-[10px] text-neutral-500 font-mono mt-0.5 block">
                        {formatJalaliDate(pay.paidAt)}
                      </span>
                    </div>

                    <div className="text-left">
                      <span className="font-black text-emerald-400 text-sm block">{formatPrice(pay.amount)}</span>
                      <span className="text-[10px] text-emerald-400/80">تسویه‌شده</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </AdminDetailDrawer>
  );
}
