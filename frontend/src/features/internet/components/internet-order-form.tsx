"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Server,
  Globe2,
  Building2,
  User,
  Phone,
  MapPin,
  FileText,
  CreditCard,
  Copy,
  Check,
  CheckSquare,
  Square,
  HelpCircle,
  Sparkles,
  ArrowLeft,
  Wallet,
  Plus,
} from "lucide-react";
import { useAuth } from "@/features/auth";
import { useAffiliate } from "@/features/affiliate";
import { partnerProjectsApi } from "@/features/partner/api/partner-projects-api";
import { type PartnerProjectSite } from "@/features/partner/types/partner.types";
import { internetApi } from "../api/internet-api";
import {
  InternetPlan,
  InternetOrderFormData,
  BillingCycle,
  InternetOrderResult,
  InternetSettings,
} from "../types";
import { formatPrice, toPersianDigits } from "@/shared/lib/utils";

interface InternetOrderFormProps {
  plans?: InternetPlan[];
  settings?: InternetSettings;
  selectedPlanId: string;
  selectedStaticIpId?: string; // deprecated
  billingCycle: BillingCycle;
  onPlanChange: (id: string) => void;
  onStaticIpChange?: (id: string) => void;
  onBillingCycleChange: (cycle: BillingCycle) => void;
  isPartner?: boolean;
  internetCommissionAmount?: number;
  staticIpCommissionAmount?: number;
}

export function InternetOrderForm({
  plans: propPlans,
  settings: propSettings,
  selectedPlanId,
  billingCycle,
  onPlanChange,
  onBillingCycleChange,
  isPartner: propIsPartner,
  internetCommissionAmount: propInternetCommission,
  staticIpCommissionAmount: propStaticIpCommission,
}: InternetOrderFormProps) {
  const router = useRouter();
  const { user } = useAuth();
  const affiliate = useAffiliate();

  const isPartner = Boolean(
    propIsPartner ||
    affiliate.isPartner ||
    user?.role === "partner" ||
    (user?.role as string) === "partner_b2b" ||
    user?.isPartner
  );

  const availablePlans = propPlans ?? [];

  const defaultStaticIpPrice = propSettings?.staticIpMonthlyPrice ?? 250000;

  const internetCommission =
    propInternetCommission ??
    propSettings?.partnerInternetCommission ??
    affiliate.effectiveInternetCommission ??
    400000;

  const staticIpCommission =
    propStaticIpCommission ??
    propSettings?.partnerStaticIpCommission ??
    affiliate.effectiveStaticIpCommission ??
    150000;

  // Partner projects/workshops state
  const [partnerProjects, setPartnerProjects] = React.useState<PartnerProjectSite[]>([]);
  const [loadingProjects, setLoadingProjects] = React.useState(false);

  // Form fields
  const [formData, setFormData] = React.useState<InternetOrderFormData>({
    fullName: user?.name || "",
    companyName: user?.companyName || "",
    nationalCode: user?.nationalId || "",
    phoneNumber: user?.phone || "",
    province: "تهران",
    city: "تهران",
    postalCode: "",
    landlineNumber: "",
    address: "",
    selectedPlanId,
    billingCycle,
    hasStaticIp: false,
    siteId: undefined,
    needsB2bInvoice: Boolean(isPartner || user?.companyName),
    notes: "",
  });

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submissionResult, setSubmissionResult] = React.useState<InternetOrderResult | null>(null);
  const [copiedCode, setCopiedCode] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  // Load partner projects if partner
  React.useEffect(() => {
    if (isPartner) {
      setLoadingProjects(true);
      partnerProjectsApi
        .getMyProjects()
        .then((sites) => {
          setPartnerProjects(sites || []);
          if (sites && sites.length > 0 && !formData.siteId) {
            setFormData((prev) => ({ ...prev, siteId: sites[0].id }));
          }
        })
        .catch((err) => {
          console.warn("Could not load partner projects:", err);
        })
        .finally(() => {
          setLoadingProjects(false);
        });
    }
  }, [isPartner]);

  // Restore draft from sessionStorage if exists
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const savedDraft = sessionStorage.getItem("velox_internet_order_draft");
        if (savedDraft) {
          const parsed = JSON.parse(savedDraft);
          setFormData((prev) => ({
            ...prev,
            ...parsed,
            selectedPlanId: parsed.selectedPlanId || selectedPlanId,
            billingCycle: parsed.billingCycle || billingCycle,
          }));
        }
      } catch (err) {
        // ignore
      }
    }
  }, []);

  // Sync external props with form state
  React.useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      selectedPlanId,
      billingCycle,
    }));
  }, [selectedPlanId, billingCycle]);

  // Active plan lookup
  const activePlan =
    availablePlans.find((p) => p.id === formData.selectedPlanId) || availablePlans[0];

  const cycleMonths =
    formData.billingCycle === "12_months"
      ? 12
      : formData.billingCycle === "6_months"
      ? 6
      : formData.billingCycle === "3_months"
      ? 3
      : 1;

  const cycleDiscountPercent =
    formData.billingCycle === "12_months"
      ? activePlan?.discountYearly ?? 20
      : formData.billingCycle === "6_months"
      ? activePlan?.discountSixMonths ?? 10
      : formData.billingCycle === "3_months"
      ? activePlan?.discountThreeMonths ?? 5
      : 0;

  // Price calculations
  const baseMonthlyPrice = activePlan?.monthlyPrice ?? activePlan?.basePricePerMonth ?? 2000000;
  const monthlyPlanPrice = Math.round((baseMonthlyPrice * (100 - cycleDiscountPercent)) / 100);

  // Static IP pricing (calculated independently from internet plan discount)
  const monthlyIpPrice = formData.hasStaticIp ? defaultStaticIpPrice : 0;

  const totalMonthly = monthlyPlanPrice + monthlyIpPrice;
  const cycleTotal = totalMonthly * cycleMonths;

  const oneTimeTotal = 0;
  const finalPayableTotal = cycleTotal;

  const calculatedTotalCommission =
    internetCommission + (formData.hasStaticIp ? staticIpCommission : 0);
  const commissionPercentageOfTotal =
    finalPayableTotal > 0 ? Math.round((calculatedTotalCommission / finalPayableTotal) * 100) : 0;

  // Navigate to new project creation while saving form draft
  const handleAddNewProject = () => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("velox_internet_order_draft", JSON.stringify(formData));
      router.push("/partner/projects?from=internet&action=new");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const isAdmin = user?.role === "admin" || (user?.role as string) === "super_admin";
    const canBuyInternet = Boolean(user?.canBuyInternet || isAdmin || isPartner);
    if (!canBuyInternet) {
      setErrorMsg("برای خرید اینترنت با شماره تلفن ادمین تماس بگیرید یا تیکت ثبت کنید.");
      return;
    }

    if (!formData.fullName.trim()) {
      setErrorMsg("لطفاً نام و نام خانوادگی مسئول سفارش را وارد کنید.");
      return;
    }
    if (!formData.phoneNumber.trim() || formData.phoneNumber.length < 10) {
      setErrorMsg("لطفاً شماره تماس معتبر (همراه) وارد فرمایید.");
      return;
    }
    if (!formData.address.trim()) {
      setErrorMsg("لطفاً نشانی دقیق محل نصب یا تحویل سرویس را درج نمایید.");
      return;
    }

    // Partner validation: if partner and has projects, ensure siteId is selected
    if (isPartner && partnerProjects.length > 0 && !formData.siteId) {
      setErrorMsg("لطفاً کارگاه یا پروژه اجرایی مربوط به این سفارش را انتخاب نمایید.");
      return;
    }

    setIsSubmitting(true);

    try {
      const order = await internetApi.createOrder({
        planId: formData.selectedPlanId,
        siteId: isPartner ? formData.siteId : undefined,
        serviceDurationMonths: cycleMonths,
        hasStaticIp: formData.hasStaticIp,
        fullName: formData.fullName,
        companyName: formData.companyName,
        phoneNumber: formData.phoneNumber,
        nationalCode: formData.nationalCode,
        province: formData.province,
        city: formData.city,
        address: formData.address,
        landlineNumber: formData.landlineNumber,
        notes: formData.notes,
      });

      // Clear draft on successful order
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("velox_internet_order_draft");

        // If partner, update local mock wallet for live feedback
        if (isPartner && calculatedTotalCommission > 0) {
          try {
            const rawBal = localStorage.getItem("velox_dashboard_wallet_bal_v2");
            const rawTx = localStorage.getItem("velox_dashboard_wallet_tx_v2");
            const currentBal = rawBal
              ? JSON.parse(rawBal)
              : { cashBalance: 2450000, creditBalance: 320000000, totalUsable: 322450000 };
            const currentTx = rawTx ? JSON.parse(rawTx) : [];

            const newTx = {
              id: `tx-comm-${Date.now()}`,
              trackingCode: `COMM-${order.trackingCode}`,
              amount: calculatedTotalCommission,
              type: "deposit",
              typeLabel: "پورسانت فروش همکار",
              title: `پورسانت فروش ${activePlan?.title || activePlan?.name || "سرویس اینترنت"}${formData.hasStaticIp ? " و IP استاتیک" : ""} (سفارش ${order.trackingCode})`,
              createdAt: "هم‌اکنون",
              status: "successful",
              statusLabel: "شارژ شد",
              gatewayName: "کیف پول همکاران B2B",
            };

            const updatedBal = {
              ...currentBal,
              cashBalance: (currentBal.cashBalance || 0) + calculatedTotalCommission,
              totalUsable: (currentBal.totalUsable || 0) + calculatedTotalCommission,
            };

            localStorage.setItem("velox_dashboard_wallet_bal_v2", JSON.stringify(updatedBal));
            localStorage.setItem("velox_dashboard_wallet_bal_v1", JSON.stringify(updatedBal));
            localStorage.setItem("velox_dashboard_wallet_tx_v2", JSON.stringify([newTx, ...currentTx]));
            localStorage.setItem("velox_dashboard_wallet_tx_v1", JSON.stringify([newTx, ...currentTx]));
            window.dispatchEvent(new CustomEvent("dashboard-stats-updated"));
          } catch (err) {
            console.warn("Could not credit partner wallet locally", err);
          }
        }
      }

      const selectedSite = partnerProjects.find((p) => p.id === formData.siteId);

      setSubmissionResult({
        orderTrackingNumber: order.trackingCode,
        submittedAt: new Date().toLocaleDateString("fa-IR"),
        totalMonthlyPrice: totalMonthly,
        oneTimeSetupTotal: oneTimeTotal,
        finalPayableTotal: Number(order.finalAmount) || finalPayableTotal,
        estimatedActivationHours: (activePlan?.type as string) === "ftth" ? 72 : 24,
        orderSummary: {
          planName: activePlan?.title || activePlan?.name || "پلن اینترنت سازمانی",
          billingCycleLabel:
            formData.billingCycle === "12_months"
              ? "یک‌ساله (۲۰٪ تخفیف)"
              : formData.billingCycle === "6_months"
              ? "شش‌ماهه"
              : formData.billingCycle === "3_months"
              ? "سه‌ماهه"
              : "یک‌ماهه",
          staticIpLabel: formData.hasStaticIp ? "دارد (تخصیص رسمی)" : "بدون IP استاتیک",
          siteTitle: selectedSite ? `${selectedSite.name || selectedSite.title} (${selectedSite.city})` : undefined,
        },
      });
    } catch (err: any) {
      setErrorMsg(err.message || "خطایی در ثبت سفارش رخ داد. لطفاً مجدداً تلاش فرمایید.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyTracking = () => {
    if (submissionResult) {
      navigator.clipboard.writeText(submissionResult.orderTrackingNumber);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  return (
    <section id="internet-order-form-box" className="scroll-mt-24 space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col gap-1.5 text-right">
        <div className="inline-flex items-center gap-1.5 self-start text-xs font-bold text-orange-400">
          <FileText className="h-4 w-4" />
          <span>تکمیل و ثبت آنلاین سفارش</span>
        </div>
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white">
          فرم درخواست خرید اینترنت و تخصیص آی‌پی استاتیک
        </h2>
        <p className="text-xs sm:text-sm text-neutral-400 max-w-2xl leading-relaxed">
          پس از تکمیل فرم، پیش‌فاکتور رسمی صادر شده و کارشناسان پشتیبانی خطوط ظرف کمتر از ۲ ساعت جهت تایید فنی با شما تماس خواهند گرفت.
        </p>
      </div>

      {isPartner && (
        <div className="p-4 sm:p-5 rounded-2xl border-2 border-emerald-500/40 bg-gradient-to-r from-emerald-950/40 via-neutral-900 to-neutral-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs shadow-lg">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-inner">
              <Wallet className="h-6 w-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-black text-white text-sm">
                  درصد و پورسانت فروش همکار در این سفارش:
                </span>
                <span className="text-emerald-400 font-mono font-black text-base">
                  {formatPrice(calculatedTotalCommission)}
                </span>
                {commissionPercentageOfTotal > 0 && (
                  <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-500/30 font-bold">
                    معادل {toPersianDigits(commissionPercentageOfTotal)}٪ ارزش کل سفارش
                  </span>
                )}
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-500/30 font-bold">
                  شارژ مستقیم در کیف پول
                </span>
              </div>
              <p className="text-neutral-400 text-[11px] mt-1 leading-relaxed">
                پورسانت ثبت این اشتراک سازمانی بلافاصله پس از تایید به کیف پول همکار شما افزوده خواهد شد.
              </p>
            </div>
          </div>
          <Link
            href="/partner/credit"
            className="flex items-center gap-1.5 self-start sm:self-auto px-3.5 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-emerald-400 font-bold transition-all border border-emerald-500/30 whitespace-nowrap shrink-0"
          >
            <span>مشاهده موجودی کیف پول</span>
            <ArrowLeft className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}

      {/* Main Grid: Form Left/Center, Live Pre-Invoice Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Container (7 cols) */}
        <div className="lg:col-span-7">
          {submissionResult ? (
            /* Success confirmation card */
            <div className="rounded-3xl border-2 border-emerald-500/50 bg-gradient-to-b from-emerald-950/30 via-neutral-900 to-neutral-950 p-6 sm:p-8 shadow-2xl text-right space-y-6 animate-in fade-in zoom-in-95 duration-300">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-white">
                    سفارش شما با موفقیت در سامانه اینترنت سازمانی ثبت شد
                  </h3>
                  <p className="text-xs text-neutral-300 mt-1">
                    پیش‌فاکتور رسمی صادر گردید و هماهنگی امکان‌سنجی در حال انجام است.
                  </p>
                </div>
              </div>

              {/* Tracking Code Box */}
              <div className="p-4 rounded-2xl bg-neutral-900/90 border border-emerald-500/40 flex items-center justify-between">
                <div>
                  <span className="text-xs text-neutral-400 block mb-1">کد رهگیری پیگیری سفارش:</span>
                  <span className="text-xl sm:text-2xl font-mono font-black text-emerald-400 tracking-wider">
                    {submissionResult.orderTrackingNumber}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={copyTracking}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-bold transition-colors cursor-pointer"
                >
                  {copiedCode ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  <span>{copiedCode ? "کپی شد" : "کپی کد"}</span>
                </button>
              </div>

              {/* Order Specs */}
              <div className="p-4 rounded-2xl bg-neutral-950/60 border border-neutral-800 text-xs space-y-2.5">
                <div className="flex justify-between py-1 border-b border-neutral-800/60">
                  <span className="text-neutral-400">سرویس انتخابی:</span>
                  <span className="font-bold text-white">{submissionResult.orderSummary.planName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-neutral-800/60">
                  <span className="text-neutral-400">دوره اشتراک:</span>
                  <span className="font-bold text-sky-400">{submissionResult.orderSummary.billingCycleLabel}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-neutral-800/60">
                  <span className="text-neutral-400">تخصیص IP استاتیک:</span>
                  <span className="font-bold text-purple-300">{submissionResult.orderSummary.staticIpLabel}</span>
                </div>
                {submissionResult.orderSummary.siteTitle && (
                  <div className="flex justify-between py-1 border-b border-neutral-800/60">
                    <span className="text-neutral-400">کارگاه همکار:</span>
                    <span className="font-bold text-emerald-400">{submissionResult.orderSummary.siteTitle}</span>
                  </div>
                )}
                <div className="flex justify-between py-1">
                  <span className="text-neutral-400">مدت زمان برآوردی راه‌اندازی:</span>
                  <span className="font-bold text-emerald-400">
                    ظرف حداکثر {toPersianDigits(submissionResult.estimatedActivationHours)} ساعت کاری
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSubmissionResult(null)}
                  className="flex-1 py-3 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-bold transition-all text-center"
                >
                  ثبت سفارش جدید اینترنت
                </button>
                <Link
                  href={isPartner ? "/partner" : "/dashboard"}
                  className="flex-1 py-3 px-4 rounded-xl bg-sky-500 hover:bg-sky-400 text-black text-xs font-bold transition-all text-center shadow-lg shadow-sky-500/20"
                >
                  انتقال به پیشخوان کاربری
                </Link>
              </div>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="rounded-3xl border border-neutral-800 bg-[#121216]/95 p-6 sm:p-8 space-y-6 shadow-xl backdrop-blur-xl"
            >
              {errorMsg && (
                <div className="p-4 rounded-2xl border border-rose-500/40 bg-rose-950/30 text-rose-300 text-xs flex items-center gap-2.5">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* ── Section 1: Selected Plan & Duration ───────────── */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-sky-400">
                  <Globe2 className="h-4 w-4" />
                  <span>۱. انتخاب پلن اینترنت و مدت دوره</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                      پلن اینترنت سازمانی
                    </label>
                    <select
                      value={formData.selectedPlanId}
                      onChange={(e) => {
                        onPlanChange(e.target.value);
                        setFormData((prev) => ({ ...prev, selectedPlanId: e.target.value }));
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 focus:border-sky-500 text-white text-xs"
                    >
                      {availablePlans.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.title || p.name} ({formatPrice(p.monthlyPrice || p.basePricePerMonth || 0)}/ماه)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                      دوره تمدید / قرارداد
                    </label>
                    <select
                      value={formData.billingCycle}
                      onChange={(e) => {
                        const val = e.target.value as BillingCycle;
                        onBillingCycleChange(val);
                        setFormData((prev) => ({ ...prev, billingCycle: val }));
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 focus:border-sky-500 text-white text-xs font-bold text-sky-400"
                    >
                      <option value="1_month">۱ ماهه (بدون تخفیف)</option>
                      <option value="3_months">۳ ماهه (۵٪ تخفیف دوره)</option>
                      <option value="6_months">۶ ماهه (۱۰٪ تخفیف دوره)</option>
                      <option value="12_months">۱۲ ماهه (۲۰٪ تخفیف دوره)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* ── Section 2: Partner Workshop / Site Selection ──── */}
              {isPartner && (
                <div className="space-y-4 pt-4 border-t border-neutral-800/80">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-purple-400">
                      <Building2 className="h-4 w-4" />
                      <span>۲. تخصیص به کارگاه یا پروژه اجرایی همکار</span>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddNewProject}
                      className="flex items-center gap-1 text-[11px] font-bold text-sky-400 hover:text-sky-300 transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>افزودن کارگاه جدید</span>
                    </button>
                  </div>

                  {loadingProjects ? (
                    <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 text-center flex items-center justify-center gap-2 text-xs text-neutral-400">
                      <Loader2 className="h-4 w-4 animate-spin text-purple-400" />
                      <span>در حال بارگذاری لیست پروژه‌ها و کارگاه‌های شما...</span>
                    </div>
                  ) : partnerProjects.length === 0 ? (
                    <div className="p-4 rounded-2xl border-2 border-amber-500/40 bg-amber-950/20 space-y-3">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-xs font-bold text-white">
                            شما هنوز هیچ کارگاه یا پروژه‌ای در پنل همکاران ثبت نکرده‌اید
                          </h4>
                          <p className="text-[11px] text-neutral-300 mt-1 leading-relaxed">
                            جهت صدور فاکتور رسمی همکار و تخصیص خط به محل پروژه، ابتدا باید مشخصات کارگاه را ثبت فرمایید. اطلاعات فعلی این فرم حفظ خواهد شد.
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleAddNewProject}
                        className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-md shadow-amber-500/20"
                      >
                        <Plus className="h-4 w-4" />
                        <span>ثبت و افزودن کارگاه جدید در پنل همکار</span>
                      </button>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                        انتخاب کارگاه مقصد سفارش <span className="text-purple-400">*</span>
                      </label>
                      <select
                        value={formData.siteId || ""}
                        onChange={(e) => setFormData((prev) => ({ ...prev, siteId: e.target.value }))}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 focus:border-purple-500 text-white text-xs"
                      >
                        {partnerProjects.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name || p.title} ({p.city} - {p.detailedAddress || p.address})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}

              {/* ── Section 3: Static IP Checkbox ────────── */}
              <div className="space-y-4 pt-4 border-t border-neutral-800/80">
                <div className="flex items-center gap-2 text-xs font-bold text-sky-400">
                  <Server className="h-4 w-4" />
                  <span>۳. خدمات و تخصیص رسمی IP استاتیک اختصاصی</span>
                </div>

                {/* Static IP Dedicated Checkbox Card */}
                <div
                  onClick={() => setFormData((prev) => ({ ...prev, hasStaticIp: !prev.hasStaticIp }))}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    formData.hasStaticIp
                      ? "border-sky-500 bg-sky-950/20 ring-1 ring-sky-500/40"
                      : "border-neutral-800 bg-neutral-900/60 hover:border-neutral-700"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div
                        className={`h-5 w-5 rounded-md border flex items-center justify-center mt-0.5 transition-colors ${
                          formData.hasStaticIp
                            ? "border-sky-500 bg-sky-500 text-black"
                            : "border-neutral-600 bg-neutral-800"
                        }`}
                      >
                        {formData.hasStaticIp && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                      </div>

                      <div className="space-y-1 text-right">
                        <div className="flex items-center gap-2">
                          <Server className="h-4 w-4 text-sky-400" />
                          <span className="text-xs font-bold text-white">
                            خرید و تخصیص IP استاتیک اختصاصی سازمانی (Static IP)
                          </span>
                        </div>
                        <p className="text-[11px] text-neutral-400 leading-relaxed max-w-lg">
                          اختصاص یک آدرس IP اینترنتی ثابت و پایدار جهت انتقال تصویر دوربین‌های مداربسته، فایروال، پورت‌فورواردینگ، سرورهای داخلی و تونل‌های امن VPN.
                        </p>
                        <p className="text-[10px] text-sky-300/90 font-medium pt-1">
                          «برای درخواست تعداد بیشتری IP استاتیک، گزینه مربوطه را در فرم ثبت کنید یا با پشتیبانی تماس بگیرید.»
                        </p>
                      </div>
                    </div>

                    <div className="text-left font-mono shrink-0">
                      <span className="text-xs font-bold text-sky-400 block">
                        +{formatPrice(defaultStaticIpPrice)}
                      </span>
                      <span className="text-[10px] text-neutral-500 block">تومان / ماه</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Section 4: Applicant & Address Info ──────────── */}
              <div className="space-y-4 pt-4 border-t border-neutral-800/80">
                <div className="flex items-center gap-2 text-xs font-bold text-sky-400">
                  <User className="h-4 w-4" />
                  <span>۴. اطلاعات متقاضی و نشانی محل نصب</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                      نام و نام خانوادگی مسئول سفارش <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="مثال: مهندس حسینی"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 focus:border-sky-500 text-white text-xs placeholder:text-neutral-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                      نام شرکت یا سازمان (اختیاری)
                    </label>
                    <input
                      type="text"
                      value={formData.companyName || ""}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      placeholder="مثال: شرکت داده‌ورزان پیشرو"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 focus:border-sky-500 text-white text-xs placeholder:text-neutral-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                      شماره تلفن همراه جهت هماهنگی <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      dir="ltr"
                      value={formData.phoneNumber}
                      onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                      placeholder="0912..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 focus:border-sky-500 text-white text-xs placeholder:text-neutral-600 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                      شماره خط ثابت متصل به محل (رانژه)
                    </label>
                    <input
                      type="tel"
                      dir="ltr"
                      value={formData.landlineNumber || ""}
                      onChange={(e) => setFormData({ ...formData, landlineNumber: e.target.value })}
                      placeholder="021..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 focus:border-sky-500 text-white text-xs placeholder:text-neutral-600 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1.5">استان</label>
                    <input
                      type="text"
                      value={formData.province}
                      onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 focus:border-sky-500 text-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-300 mb-1.5">شهر</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 focus:border-sky-500 text-white text-xs"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                      نشانی دقیق محل نصب یا تحویل فیزیکی خط <span className="text-rose-400">*</span>
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="خیابان، پلاک، واحد، طبقه و موقعیت رک مخابراتی..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 focus:border-sky-500 text-white text-xs placeholder:text-neutral-600 resize-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                      یادداشت، شرایط کابل‌کشی یا درخواست تعداد IP بیشتر
                    </label>
                    <textarea
                      rows={2}
                      value={formData.notes || ""}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="در صورتی که به روتینگ اختصاصی BGP یا بیش از ۱ عدد IP نیاز دارید، در این بخش قید فرمایید..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 focus:border-sky-500 text-white text-xs placeholder:text-neutral-600 resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4 border-t border-neutral-800 flex items-center justify-between">
                <span className="text-xs text-neutral-400">
                  مبلغ پیش‌فاکتور نهایی:{" "}
                  <strong className="text-emerald-400 font-mono text-sm">
                    {formatPrice(finalPayableTotal)}
                  </strong>
                </span>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="py-3 px-6 rounded-xl bg-sky-500 hover:bg-sky-400 text-black font-black text-xs sm:text-sm flex items-center gap-2 shadow-xl shadow-sky-500/25 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>در حال ثبت سفارش...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>ثبت نهایی و صدور پیش‌فاکتور رسمی</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Live Pre-Invoice Box (5 cols) */}
        <div className="lg:col-span-5 sticky top-24">
          <div className="rounded-3xl border border-neutral-800 bg-[#141418] p-6 shadow-2xl space-y-5 text-right">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-sky-400" />
                <h3 className="text-sm font-bold text-white">پیش‌فاکتور زنده اشتراک سازمانی</h3>
              </div>
              <span className="text-[10px] bg-sky-500/15 text-sky-300 border border-sky-500/30 px-2 py-0.5 rounded-full font-bold">
                محاسبه بلادرنگ
              </span>
            </div>

            {/* Plan Info Strip */}
            <div className="p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-neutral-400">پلن انتخابی:</span>
                <span className="font-bold text-white">{activePlan?.title || activePlan?.name || "پلن انتخابی"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-400">دوره تمدید:</span>
                <span className="font-mono text-sky-400 font-bold">
                  {cycleMonths === 12
                    ? "۱۲ ماهه (۲۰٪ تخفیف دوره)"
                    : cycleMonths === 6
                    ? "۶ ماهه (۱۰٪ تخفیف)"
                    : cycleMonths === 3
                    ? "۳ ماهه (۵٪ تخفیف)"
                    : "۱ ماهه"}
                </span>
              </div>
            </div>

            {/* Financial Rows */}
            <div className="space-y-2.5 text-xs text-neutral-300">
              <div className="flex justify-between items-center">
                <span className="text-neutral-400">هزینه پایه ماهانه پلن:</span>
                <span className="font-mono">{formatPrice(baseMonthlyPrice)}</span>
              </div>

              {cycleDiscountPercent > 0 && (
                <div className="flex justify-between items-center text-emerald-400">
                  <span>تخفیف دوره اینترنت ({toPersianDigits(cycleDiscountPercent)}٪):</span>
                  <span className="font-mono">
                    -{formatPrice((baseMonthlyPrice * cycleDiscountPercent) / 100)} / ماه
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center">
                <span className="text-neutral-400">خالص ماهانه پلن:</span>
                <span className="font-mono font-bold text-white">{formatPrice(monthlyPlanPrice)}</span>
              </div>

              {formData.hasStaticIp && (
                <div className="flex justify-between items-center text-sky-300 pt-1 border-t border-neutral-800/60">
                  <span className="flex items-center gap-1">
                    <Server className="h-3 w-3 text-sky-400" />
                    <span>IP استاتیک سازمانی:</span>
                  </span>
                  <span className="font-mono font-bold">+{formatPrice(monthlyIpPrice)} / ماه</span>
                </div>
              )}

              <div className="flex justify-between items-center pt-2 border-t border-neutral-800 text-neutral-200">
                <span>مجموع هزینه ماهانه:</span>
                <span className="font-mono font-bold">{formatPrice(totalMonthly)}</span>
              </div>

              <div className="flex justify-between items-center">
                <span>مجموع دوره ({toPersianDigits(cycleMonths)} ماه):</span>
                <span className="font-mono font-bold text-sky-400">{formatPrice(cycleTotal)}</span>
              </div>
            </div>

            {/* Total Payable Box */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-neutral-900 to-neutral-950 border-2 border-emerald-500/40 space-y-2">
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-bold text-neutral-300">مبلغ کل قابل پرداخت:</span>
                <div className="flex items-baseline gap-1" dir="rtl">
                  <span className="text-xl font-black text-emerald-400 font-mono">
                    {formatPrice(finalPayableTotal)}
                  </span>
                </div>
              </div>
              <p className="text-[10px] text-neutral-400">
                دارای فاکتور رسمی معتبر و محاسبه مالیات بر ارزش افزوده در سامانه مودیان.
              </p>
            </div>

            {/* Partner direct commission box */}
            {isPartner && (
              <div className="p-3.5 rounded-2xl bg-purple-950/30 border border-purple-500/40 text-xs space-y-1.5">
                <div className="flex items-center justify-between text-purple-300 font-bold">
                  <span className="flex items-center gap-1.5">
                    <Wallet className="h-4 w-4 text-purple-400" />
                    <span>پورسانت همکار شما:</span>
                  </span>
                  <span className="font-mono text-sm font-black text-purple-200">
                    {formatPrice(calculatedTotalCommission)}
                  </span>
                </div>
                <p className="text-[10px] text-neutral-400 leading-snug">
                  این مبلغ پس از نهایی شدن خرید، مستقیماً به کیف پول شما واریز شده و قابل برداشت نقدی است.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
