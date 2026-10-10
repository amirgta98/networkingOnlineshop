"use client";

import * as React from "react";
import Link from "next/link";
import {
  Wifi,
  Radio,
  Server,
  Zap,
  ShieldCheck,
  CreditCard,
  Building2,
  Clock,
  CheckCircle2,
  AlertCircle,
  Send,
  Loader2,
  Copy,
  Check,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Activity,
  Filter,
  MapPin,
  Search,
  ExternalLink,
  SlidersHorizontal,
  Headphones,
} from "lucide-react";
import { useAuth } from "@/features/auth";
import { Button } from "@/shared/components/ui/button";
import { formatPrice, toPersianDigits } from "@/shared/lib/utils";
import {
  MOCK_P2P_PLANS,
  MOCK_PARTNER_INTERNET_SERVICES,
  MOCK_PARTNER_PROJECT_SITES,
} from "../data/mock-partner-data";
import type { P2PInternetPlan } from "../types/partner.types";

export function PartnerP2PView() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = React.useState<"plans" | "active-links" | "los-check">("plans");

  // Filters for P2P plans
  const [selectedSpeedFilter, setSelectedSpeedFilter] = React.useState<number | "all">("all");
  const [selectedTrafficFilter, setSelectedTrafficFilter] = React.useState<number | "all">("all");
  const [billingCycle, setBillingCycle] = React.useState<"1_month" | "3_months" | "6_months" | "12_months">("12_months");

  // Selected plan for checkout
  const [selectedPlanId, setSelectedPlanId] = React.useState<string>("p2p_200_2500");

  // STATIC IP ADDON: ONLY 1 IP is sold online per user rule!
  const [includeStaticIp, setIncludeStaticIp] = React.useState<boolean>(true);

  // Single static IP pricing
  const SINGLE_IP_MONTHLY_RETAIL = 120_000;
  const SINGLE_IP_MONTHLY_PARTNER = 95_000;

  // Project site and payment configuration
  const [selectedSiteId, setSelectedSiteId] = React.useState<string>("site_01");
  const [customSiteName, setCustomSiteName] = React.useState<string>("");
  const [customSiteAddress, setCustomSiteAddress] = React.useState<string>("");
  const [paymentMethod, setPaymentMethod] = React.useState<"credit_line" | "sayad_cheque" | "bank_transfer" | "online">("credit_line");
  const [needsTaxInvoice, setNeedsTaxInvoice] = React.useState<boolean>(true);

  // Form submission state
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [orderResult, setOrderResult] = React.useState<{
    trackingNumber: string;
    submittedAt: string;
    planName: string;
    speedLabel: string;
    trafficLabel: string;
    cycleLabel: string;
    ipLabel: string;
    siteLabel: string;
    totalAmount: number;
    savingsAmount: number;
    vatAmount: number;
    paymentLabel: string;
  } | null>(null);
  const [copiedTracking, setCopiedTracking] = React.useState(false);

  // Radio LOS feasibility state
  const [losCity, setLosCity] = React.useState("تهران");
  const [losCoords, setLosCoords] = React.useState("میدان ونک، خیابان ملاصدرا");
  const [isCheckingLos, setIsCheckingLos] = React.useState(false);
  const [losResult, setLosResult] = React.useState<{
    hasDirectLineOfSight: boolean;
    popSiteName: string;
    distanceKm: number;
    recommendedDish: string;
    maxThroughputMbps: number;
  } | null>(null);

  // Filtered P2P plans
  const filteredPlans = React.useMemo(() => {
    return MOCK_P2P_PLANS.filter((p) => {
      const matchSpeed = selectedSpeedFilter === "all" || p.speedMbps === selectedSpeedFilter;
      const matchTraffic = selectedTrafficFilter === "all" || p.trafficGb === selectedTrafficFilter;
      return matchSpeed && matchTraffic;
    });
  }, [selectedSpeedFilter, selectedTrafficFilter]);

  const activePlan = MOCK_P2P_PLANS.find((p) => p.id === selectedPlanId) || MOCK_P2P_PLANS[2];

  // Billing cycle discount percent
  const cycleDiscountPercent =
    billingCycle === "12_months"
      ? 20
      : billingCycle === "6_months"
      ? 12
      : billingCycle === "3_months"
      ? 5
      : 0;

  const cycleMonths =
    billingCycle === "12_months"
      ? 12
      : billingCycle === "6_months"
      ? 6
      : billingCycle === "3_months"
      ? 3
      : 1;

  const cycleLabel =
    billingCycle === "12_months"
      ? "سالانه (۱۲ ماهه - ۲۰٪ تخفیف همکاری)"
      : billingCycle === "6_months"
      ? "۶ ماهه (۱۲٪ تخفیف همکاری)"
      : billingCycle === "3_months"
      ? "۳ ماهه (۵٪ تخفیف همکاری)"
      : "۱ ماهه (تعرفه پایه همکار)";

  // Pricing calculations
  const effectiveMonthlyPlan = Math.round((activePlan.partnerMonthlyPrice * (100 - cycleDiscountPercent)) / 100);
  const effectiveMonthlyIp = includeStaticIp
    ? Math.round((SINGLE_IP_MONTHLY_PARTNER * (100 - cycleDiscountPercent)) / 100)
    : 0;

  const planSubtotal = effectiveMonthlyPlan * cycleMonths;
  const ipSubtotal = effectiveMonthlyIp * cycleMonths;
  const subtotalBeforeTax = planSubtotal + ipSubtotal;

  // Retail comparison
  const retailMonthlyTotal = activePlan.baseMonthlyRetailPrice + (includeStaticIp ? SINGLE_IP_MONTHLY_RETAIL : 0);
  const retailSubtotal = retailMonthlyTotal * cycleMonths;
  const totalPartnerSavings = retailSubtotal - subtotalBeforeTax;

  const vatAmount = needsTaxInvoice ? Math.round(subtotalBeforeTax * 0.1) : 0;
  const finalPayableTotal = subtotalBeforeTax + vatAmount;

  const selectedSite = MOCK_PARTNER_PROJECT_SITES.find((s) => s.id === selectedSiteId);
  const siteDisplayName =
    selectedSiteId === "custom"
      ? customSiteName || "کارگاه / پروژه جدید"
      : selectedSite?.name || "دفتر مرکزی نیاوران";

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      const tracking = `VLX-P2P-${Math.floor(10000 + Math.random() * 90000)}`;

      setOrderResult({
        trackingNumber: tracking,
        submittedAt: new Date().toLocaleDateString("fa-IR"),
        planName: activePlan.name,
        speedLabel: activePlan.speedLabel,
        trafficLabel: activePlan.trafficLabel,
        cycleLabel: cycleLabel,
        ipLabel: includeStaticIp ? "۱ عدد IP استاتیک اختصاصی (/32)" : "بدون آی‌پی استاتیک",
        siteLabel: siteDisplayName,
        totalAmount: finalPayableTotal,
        savingsAmount: totalPartnerSavings,
        vatAmount: vatAmount,
        paymentLabel:
          paymentMethod === "credit_line"
            ? "تسویه ۴۵ روزه از خط اعتباری ۵۰۰ میلیونی"
            : paymentMethod === "sayad_cheque"
            ? "چک صیادی بنفش (سامانه پیچک)"
            : paymentMethod === "bank_transfer"
            ? "حواله ساتنا / پایا شرکتی"
            : "درگاه پرداخت شتاب",
      });
    }, 1000);
  };

  const handleCopyTracking = () => {
    if (orderResult) {
      navigator.clipboard.writeText(orderResult.trackingNumber);
      setCopiedTracking(true);
      setTimeout(() => setCopiedTracking(false), 2000);
    }
  };

  const handleCheckLos = () => {
    setIsCheckingLos(true);
    setLosResult(null);

    setTimeout(() => {
      setIsCheckingLos(false);
      setLosResult({
        hasDirectLineOfSight: true,
        popSiteName: "پاپ‌سایت ماکروویو مرکزی برج میلاد (دکل شماره ۱)",
        distanceKm: 4.8,
        recommendedDish: "دیش رادیویی ۶۰cm دوپلاریزه با رادیو MikroTik NetMetal 5",
        maxThroughputMbps: activePlan.speedMbps >= 500 ? 1000 : 500,
      });
    }, 1000);
  };

  return (
    <div className="flex flex-col gap-6 text-right" dir="rtl">
      {/* ─── 1. Header Hero ───────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl border border-sky-500/30 bg-gradient-to-br from-sky-950/40 via-[var(--theme-surface)] to-[var(--theme-surface)] p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-600 to-cyan-500 text-white shadow-lg shadow-sky-600/25 ring-2 ring-sky-500/30">
                <Wifi className="h-7 w-7" />
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-white">
                    خرید اینترنت P2P اختصاصی (Point-to-Point)
                  </h1>
                  <span className="text-[11px] text-sky-300 bg-sky-500/20 px-2.5 py-0.5 rounded-full border border-sky-500/30 font-bold inline-flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-sky-400 animate-pulse shadow-[0_0_8px_#38bdf8]" />
                    <span>فقط لینک وایرلس متقارن ۱:۱</span>
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed max-w-3xl">
                  پهنای باند کاملاً اختصاصی رادیویی دکل به دکل با آپلود و دانلود برابر، پینگ زیر ۵ میلی‌ثانیه و بدون وابستگی به خطوط مخابراتی. انتخاب دقیق بر اساس سرعت، ترافیک ماهانه و دوره زمانی، همراه با امکان افزودن مستقیم ۱ عدد IP استاتیک.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
              <Link href="/partner/static-ip">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-purple-500/40 text-purple-300 hover:bg-purple-950/30 text-xs gap-1.5 font-bold"
                >
                  <Server className="h-4 w-4 text-purple-400" />
                  <span>خرید مستقل آی‌پی استاتیک</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Key Advantages Chips */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3 rounded-2xl bg-neutral-900/70 border border-neutral-800 flex items-center gap-2.5">
              <Zap className="h-4 w-4 text-sky-400 shrink-0" />
              <div className="text-right">
                <span className="text-[11px] text-neutral-400 block">پایداری تضمین‌شده:</span>
                <span className="text-xs font-bold text-white">SLA ۹۹.۹۵٪ گلد</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-neutral-900/70 border border-neutral-800 flex items-center gap-2.5">
              <Clock className="h-4 w-4 text-sky-400 shrink-0" />
              <div className="text-right">
                <span className="text-[11px] text-neutral-400 block">پینگ تضمینی شبکه:</span>
                <span className="text-xs font-bold text-emerald-400">زیر ۵ میلی‌ثانیه</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-neutral-900/70 border border-neutral-800 flex items-center gap-2.5">
              <CreditCard className="h-4 w-4 text-amber-400 shrink-0" />
              <div className="text-right">
                <span className="text-[11px] text-neutral-400 block">تسویه حساب همکاران:</span>
                <span className="text-xs font-bold text-amber-300">اعتباری ۵۰۰ م.ت / چک</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-purple-950/40 border border-purple-500/30 flex items-center gap-2.5">
              <Server className="h-4 w-4 text-purple-400 shrink-0" />
              <div className="text-right">
                <span className="text-[11px] text-purple-300 block">آی‌پی استاتیک:</span>
                <span className="text-xs font-bold text-purple-200">۱ عدد آنلاین / تیکت بیشتر</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── 2. Top Navigation Tabs ───────────────────────────────────── */}
      <div className="flex border-b border-neutral-800 gap-2 pb-px">
        <button
          type="button"
          onClick={() => setActiveTab("plans")}
          className={`flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === "plans"
              ? "border-sky-500 text-sky-400 bg-sky-500/10 rounded-t-xl"
              : "border-transparent text-neutral-400 hover:text-white"
          }`}
        >
          <Wifi className="h-4 w-4" />
          <span>پلن‌ها و ثبت سفارش اینترنت P2P</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("los-check")}
          className={`flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === "los-check"
              ? "border-sky-500 text-sky-400 bg-sky-500/10 rounded-t-xl"
              : "border-transparent text-neutral-400 hover:text-white"
          }`}
        >
          <Radio className="h-4 w-4" />
          <span>امکان‌سنجی رادیویی (LOS)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("active-links")}
          className={`flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === "active-links"
              ? "border-sky-500 text-sky-400 bg-sky-500/10 rounded-t-xl"
              : "border-transparent text-neutral-400 hover:text-white"
          }`}
        >
          <Activity className="h-4 w-4" />
          <span>لینک‌های فعال سازمانی ({toPersianDigits(MOCK_PARTNER_INTERNET_SERVICES.length)})</span>
        </button>
      </div>

      {/* ─── 3. TAB 1: PLANS AND ORDERING ─────────────────────────────── */}
      {activeTab === "plans" && (
        <div className="flex flex-col gap-8">
          {/* Filter & Duration Selection Bar */}
          <div className="rounded-2xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] p-5 shadow-sm flex flex-col gap-5">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-sky-400" />
                <span className="text-xs sm:text-sm font-bold text-white">
                  فیلتر پلن‌های اختصاصی و انتخاب دوره تسویه:
                </span>
              </div>
              <span className="text-xs text-neutral-400">
                {toPersianDigits(filteredPlans.length)} پلن موجود
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Billing Cycle / Duration Selector */}
              <div>
                <label className="text-xs font-bold text-neutral-300 block mb-2">
                  دوره قرارداد و تسویه حساب:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "1_month", label: "۱ ماهه (عادی)" },
                    { id: "3_months", label: "۳ ماهه (۵٪ تخفیف)" },
                    { id: "6_months", label: "۶ ماهه (۱۲٪ تخفیف)" },
                    { id: "12_months", label: "سالانه (۲۰٪ تخفیف)" },
                  ].map((cycle) => (
                    <button
                      key={cycle.id}
                      type="button"
                      onClick={() => setBillingCycle(cycle.id as any)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-all text-center ${
                        billingCycle === cycle.id
                          ? "bg-amber-500 text-black font-black shadow-md shadow-amber-500/20"
                          : "bg-neutral-900 text-neutral-300 hover:text-white border border-neutral-800"
                      }`}
                    >
                      {cycle.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Speed Filter */}
              <div>
                <label className="text-xs font-bold text-neutral-300 block mb-2">
                  فیلتر پهنای باند (سرعت):
                </label>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSelectedSpeedFilter("all")}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                      selectedSpeedFilter === "all"
                        ? "bg-sky-500 text-black font-black"
                        : "bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800"
                    }`}
                  >
                    همه
                  </button>
                  {[50, 100, 200, 300, 500, 1000].map((spd) => (
                    <button
                      key={spd}
                      type="button"
                      onClick={() => setSelectedSpeedFilter(spd)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-semibold cursor-pointer transition-all ${
                        selectedSpeedFilter === spd
                          ? "bg-sky-500 text-black font-black"
                          : "bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800"
                      }`}
                    >
                      {spd >= 1000 ? "1 Gbps" : `${spd}M`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Traffic Filter */}
              <div>
                <label className="text-xs font-bold text-neutral-300 block mb-2">
                  فیلتر حجم ترافیک ماهانه:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSelectedTrafficFilter("all")}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                      selectedTrafficFilter === "all"
                        ? "bg-sky-500 text-black font-black"
                        : "bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800"
                    }`}
                  >
                    همه
                  </button>
                  {[
                    { val: 500, label: "۵۰۰ GB" },
                    { val: 1000, label: "۱ TB" },
                    { val: 2500, label: "۲.۵ TB" },
                    { val: 5000, label: "۵ TB" },
                    { val: 0, label: "نامحدود" },
                  ].map((trf) => (
                    <button
                      key={trf.val}
                      type="button"
                      onClick={() => setSelectedTrafficFilter(trf.val)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                        selectedTrafficFilter === trf.val
                          ? "bg-sky-500 text-black font-black"
                          : "bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800"
                      }`}
                    >
                      {trf.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ─── Plans Grid (Spacious Full-Width Layout) ─────────────── */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-white">
                پلن‌های اینترنت P2P متقارن (روی هر پلن کلیک کنید تا انتخاب شود):
              </h2>
              <span className="text-xs text-neutral-400">
                تخفیف دوره: <strong className="text-emerald-400">{toPersianDigits(cycleDiscountPercent)}٪</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredPlans.map((plan) => {
                const isSelected = selectedPlanId === plan.id;
                const monthlyDiscounted = Math.round((plan.partnerMonthlyPrice * (100 - cycleDiscountPercent)) / 100);

                return (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedPlanId(plan.id)}
                    className={`relative rounded-3xl border p-6 cursor-pointer transition-all duration-200 flex flex-col justify-between gap-5 text-right ${
                      isSelected
                        ? "border-sky-500 bg-sky-950/30 shadow-xl shadow-sky-500/10 ring-2 ring-sky-500/50"
                        : "border-neutral-800 bg-neutral-900/50 hover:border-neutral-700 hover:bg-neutral-900/80"
                    }`}
                  >
                    {plan.isPopular && (
                      <span className="absolute top-4 left-4 text-[10px] font-black bg-gradient-to-r from-amber-500 to-orange-500 text-black px-2.5 py-0.5 rounded-full shadow-md">
                        ★ پرفروش‌ترین پروژه‌ای
                      </span>
                    )}

                    <div className="space-y-4">
                      {/* Plan Header */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-base font-black text-white block">
                            {plan.name}
                          </span>
                          <span className="text-xs text-neutral-400 block mt-1">
                            {plan.recommendedFor}
                          </span>
                        </div>
                      </div>

                      {/* Speed & Traffic Badges */}
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1.5 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-300 font-mono font-black text-sm">
                          {plan.speedLabel} متقارن
                        </span>
                        <span className="px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold text-xs">
                          {plan.trafficLabel}
                        </span>
                      </div>

                      {/* Technical Specs Box */}
                      <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-neutral-950/70 border border-neutral-800 text-xs">
                        <div>
                          <span className="text-neutral-500 block text-[11px]">پینگ تضمینی:</span>
                          <span className="font-bold text-neutral-200">{plan.pingGuarantee}</span>
                        </div>
                        <div>
                          <span className="text-neutral-500 block text-[11px]">پایداری SLA:</span>
                          <span className="font-bold text-emerald-400">{plan.sla}</span>
                        </div>
                      </div>

                      {/* Features List */}
                      <div className="space-y-2 text-xs text-neutral-300">
                        {plan.features.map((feat, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <Check className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                            <span className="leading-relaxed">{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Bottom Pricing & Selection Button */}
                    <div className="pt-4 border-t border-neutral-800/80 flex flex-col gap-3">
                      <div className="flex items-baseline justify-between">
                        <div>
                          <span className="text-[11px] text-neutral-500 line-through block">
                            {formatPrice(plan.baseMonthlyRetailPrice)}
                          </span>
                          <span className="text-xs text-emerald-400 font-bold">
                            تخفیف همکار Tier A
                          </span>
                        </div>
                        <div className="text-left font-mono">
                          <span className="text-lg font-black text-white">
                            {formatPrice(monthlyDiscounted)}
                          </span>
                          <span className="text-[11px] text-neutral-400 block font-normal">
                            به ازای هر ماه
                          </span>
                        </div>
                      </div>

                      <Button
                        type="button"
                        variant={isSelected ? "default" : "outline"}
                        className={`w-full text-xs font-bold py-2.5 transition-all cursor-pointer ${
                          isSelected
                            ? "bg-sky-600 hover:bg-sky-500 text-white shadow-md shadow-sky-600/30"
                            : "border-neutral-700 text-neutral-300 hover:bg-neutral-800"
                        }`}
                      >
                        {isSelected ? (
                          <span className="flex items-center gap-1.5">
                            <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                            <span>پلن انتخاب شده است</span>
                          </span>
                        ) : (
                          <span>انتخاب این پلن جهت سفارش</span>
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ─── 4. Order Configuration & Checkout Section ───────────── */}
          <div className="rounded-3xl border border-sky-500/40 bg-gradient-to-br from-neutral-900/90 via-[var(--theme-surface)] to-neutral-900/90 p-6 sm:p-8 shadow-xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4 mb-6">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white">
                    پیکربندی سفارش و پیش‌فاکتور رسمی برای «{activePlan.name}»
                  </h3>
                  <span className="text-xs text-neutral-400">
                    دوره انتخاب‌شده: {cycleLabel}
                  </span>
                </div>
              </div>
              <span className="text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 font-bold hidden sm:inline-block">
                سطح همکار: Tier A
              </span>
            </div>

            {orderResult ? (
              /* Success Result View */
              <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col gap-5 text-right">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
                      <CheckCircle2 className="h-7 w-7" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-white">
                        سفارش اینترنت اختصاصی P2P با موفقیت ثبت شد
                      </h4>
                      <p className="text-xs text-neutral-300 mt-0.5">
                        پیش‌فاکتور رسمی صادر گردید و کارشناس فنی جهت هماهنگی دید رادیویی ظرف ۳۰ دقیقه تماس می‌گیرد.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-neutral-900/80 px-3 py-2 rounded-xl border border-neutral-800">
                    <span className="text-xs text-neutral-400">کد رهگیری:</span>
                    <span className="text-sm font-mono font-bold text-sky-400">
                      {orderResult.trackingNumber}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyTracking}
                      className="text-neutral-400 hover:text-white cursor-pointer"
                    >
                      {copiedTracking ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-neutral-950/60 border border-neutral-800 text-xs">
                  <div>
                    <span className="text-neutral-500 block">پلن پهنای باند:</span>
                    <span className="font-bold text-white">{orderResult.planName} ({orderResult.speedLabel})</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block">آی‌پی استاتیک:</span>
                    <span className="font-bold text-purple-300">{orderResult.ipLabel}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block">دوره قرارداد:</span>
                    <span className="font-bold text-amber-300">{orderResult.cycleLabel}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 block">مبلغ نهایی:</span>
                    <span className="font-bold text-emerald-400 font-mono text-sm">{formatPrice(orderResult.totalAmount)}</span>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <Button
                    onClick={() => setOrderResult(null)}
                    variant="outline"
                    size="sm"
                    className="text-xs border-neutral-700"
                  >
                    ثبت سفارش جدید
                  </Button>
                  <Link href="/partner/orders">
                    <Button size="sm" className="bg-sky-600 hover:bg-sky-500 text-white text-xs gap-1.5">
                      <span>مشاهده در بخش سفارش‌ها</span>
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Right Column: Configuration Controls (7 Cols) */}
                <div className="lg:col-span-7 flex flex-col gap-6">
                  {/* Static IP Addon Section - PER USER DIRECTIVE: ONLY 1 IP ONLINE, TICKET/CALL FOR MORE */}
                  <div className="p-5 rounded-2xl bg-neutral-950/60 border border-purple-500/30 flex flex-col gap-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <input
                          id="includeStaticIpCheckbox"
                          type="checkbox"
                          checked={includeStaticIp}
                          onChange={(e) => setIncludeStaticIp(e.target.checked)}
                          className="h-5 w-5 rounded border-neutral-700 bg-neutral-900 text-purple-600 focus:ring-purple-500 cursor-pointer"
                        />
                        <div>
                          <label
                            htmlFor="includeStaticIpCheckbox"
                            className="text-sm font-bold text-white cursor-pointer block"
                          >
                            افزودن ۱ عدد آی‌پی استاتیک اختصاصی (/32) به این لینک
                          </label>
                          <span className="text-xs text-neutral-400 block mt-0.5">
                            آدرس IPv4 عمومی ثابت با ثبت به نام سازمان و قابلیت تنظیم معکوس rDNS
                          </span>
                        </div>
                      </div>

                      <span className="text-xs font-mono font-bold text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-lg border border-purple-500/20 shrink-0">
                        {formatPrice(effectiveMonthlyIp)}/ماه
                      </span>
                    </div>

                    {/* Notice for Higher Quantities (User Explicit Directive) */}
                    <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs flex flex-col gap-2">
                      <div className="flex items-center gap-2 font-bold text-amber-300">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <span>نیاز به بیش از ۱ عدد آی‌پی استاتیک یا ساب‌نت سازمانی دارید؟</span>
                      </div>
                      <p className="text-[11px] text-neutral-300 leading-relaxed">
                        به صورت آنلاین به ازای هر لینک وایرلس، تنها <strong>۱ عدد آی‌پی استاتیک</strong> قابل سفارش است. برای خرید تعداد بالاتر یا بلاک‌های رسمی (/30، /29، /28)، طبق مقررات RIPE لطفاً تیکت پشتیبانی ثبت نمایید یا با کارشناسان شبکه تماس بگیرید.
                      </p>
                      <div className="flex flex-wrap items-center gap-3 pt-1">
                        <Link href="/partner/support">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="h-8 text-xs border-amber-500/40 text-amber-300 hover:bg-amber-500/20 gap-1.5"
                          >
                            <Headphones className="h-3.5 w-3.5" />
                            <span>ثبت تیکت درخواست IP سازمانی</span>
                          </Button>
                        </Link>
                        <a
                          href="tel:02191000000"
                          className="text-xs text-amber-300 hover:underline flex items-center gap-1 font-mono"
                        >
                          <span>تماس با پشتیبانی:</span>
                          <span dir="ltr">۰۲۱-۹۱۰۰۰۰۰۰</span>
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Project Site Selector */}
                  <div className="p-5 rounded-2xl bg-neutral-950/60 border border-neutral-800 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-neutral-200 flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-sky-400" />
                        <span>محل نصب و تحویل سرویس رادیویی (پروژه مقصد):</span>
                      </label>
                      <span className="text-[11px] text-neutral-400">امکان‌سنجی رایگان دکل</span>
                    </div>

                    <select
                      value={selectedSiteId}
                      onChange={(e) => setSelectedSiteId(e.target.value)}
                      className="w-full rounded-xl border border-neutral-800 bg-neutral-900 p-3 text-xs text-white focus:border-sky-500 focus:outline-none"
                    >
                      {MOCK_PARTNER_PROJECT_SITES.map((site) => (
                        <option key={site.id} value={site.id}>
                          {site.name} — {site.city} ({site.address})
                        </option>
                      ))}
                      <option value="custom">+ تعریف پروژه یا کارگاه جدید</option>
                    </select>

                    {selectedSiteId === "custom" && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        <input
                          type="text"
                          placeholder="نام کارگاه یا شرکت مقصد"
                          value={customSiteName}
                          onChange={(e) => setCustomSiteName(e.target.value)}
                          className="rounded-xl border border-neutral-800 bg-neutral-900 p-2.5 text-xs text-white placeholder-neutral-500 focus:border-sky-500 focus:outline-none"
                        />
                        <input
                          type="text"
                          placeholder="آدرس دقیق و ارتفاع ساختمان"
                          value={customSiteAddress}
                          onChange={(e) => setCustomSiteAddress(e.target.value)}
                          className="rounded-xl border border-neutral-800 bg-neutral-900 p-2.5 text-xs text-white placeholder-neutral-500 focus:border-sky-500 focus:outline-none"
                        />
                      </div>
                    )}
                  </div>

                  {/* B2B Payment Methods */}
                  <div className="p-5 rounded-2xl bg-neutral-950/60 border border-neutral-800 flex flex-col gap-3">
                    <label className="text-xs font-bold text-neutral-200 flex items-center gap-2">
                      <CreditCard className="h-4 w-4 text-amber-400" />
                      <span>روش تسویه سازمانی B2B:</span>
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {[
                        {
                          id: "credit_line",
                          title: "خط اعتباری ۵۰۰ میلیونی",
                          desc: "تسویه ۴۵ روزه بدون پیش‌پرداخت",
                          badge: "پیشنهادی همکار",
                        },
                        {
                          id: "sayad_cheque",
                          title: "چک صیادی بنفش",
                          desc: "ثبت در سامانه پیچک بانک مرکزی",
                          badge: "راس ۴۵ روزه",
                        },
                        {
                          id: "bank_transfer",
                          title: "حواله ساتنا / پایا شرکتی",
                          desc: "واریز به حساب حقوقی ققنوس آکادمی",
                          badge: "شناسه‌دار",
                        },
                        {
                          id: "online",
                          title: "درگاه پرداخت آنلاین",
                          desc: "کلیه کارت‌های شتاب بانکی",
                          badge: "آنی",
                        },
                      ].map((item) => (
                        <div
                          key={item.id}
                          onClick={() => setPaymentMethod(item.id as any)}
                          className={`p-3 rounded-xl border cursor-pointer transition-all ${
                            paymentMethod === item.id
                              ? "border-sky-500 bg-sky-950/30 text-white"
                              : "border-neutral-800 bg-neutral-900/60 text-neutral-400 hover:text-white"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold">{item.title}</span>
                            <span className="text-[10px] text-sky-400 bg-sky-500/10 px-1.5 py-0.2 rounded font-mono">
                              {item.badge}
                            </span>
                          </div>
                          <span className="text-[11px] text-neutral-400 block">{item.desc}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-neutral-800/80">
                      <input
                        id="taxInvoiceCheckbox"
                        type="checkbox"
                        checked={needsTaxInvoice}
                        onChange={(e) => setNeedsTaxInvoice(e.target.checked)}
                        className="h-4 w-4 rounded border-neutral-700 bg-neutral-900 text-sky-600 focus:ring-sky-500 cursor-pointer"
                      />
                      <label htmlFor="taxInvoiceCheckbox" className="text-xs text-neutral-300 cursor-pointer">
                        صدور فاکتور رسمی الکترونیک در سامانه مودیان مالیاتی (۱۰٪ ارزش افزوده)
                      </label>
                    </div>
                  </div>
                </div>

                {/* Left Column: Live Official Invoice (5 Cols) */}
                <div className="lg:col-span-5 flex flex-col justify-between p-6 rounded-2xl border border-sky-500/30 bg-neutral-950/80 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                      <h4 className="text-sm font-bold text-white">پیش‌فاکتور رسمی پهنای باند P2P</h4>
                      <span className="text-[11px] text-sky-400 font-mono">پیش‌نمایش معتبر</span>
                    </div>

                    {/* Summary Lines */}
                    <div className="space-y-2.5 text-xs">
                      <div className="flex justify-between text-neutral-300">
                        <span>پلن و سرعت:</span>
                        <span className="font-bold text-white">{activePlan.name} ({activePlan.speedLabel})</span>
                      </div>

                      <div className="flex justify-between text-neutral-300">
                        <span>حجم ترافیک ماهانه:</span>
                        <span className="font-bold text-amber-300">{activePlan.trafficLabel}</span>
                      </div>

                      <div className="flex justify-between text-neutral-300">
                        <span>دوره تسویه:</span>
                        <span className="font-bold text-sky-300">{cycleMonths} ماهه ({toPersianDigits(cycleDiscountPercent)}٪ تخفیف)</span>
                      </div>

                      <div className="flex justify-between text-neutral-300">
                        <span>هزینه پهنای باند دوره:</span>
                        <span className="font-mono font-bold text-white">{formatPrice(planSubtotal)}</span>
                      </div>

                      <div className="flex justify-between text-neutral-300">
                        <span>۱ عدد IP استاتیک (/32):</span>
                        <span className="font-mono font-bold text-purple-300">
                          {includeStaticIp ? formatPrice(ipSubtotal) : "انتخاب نشده"}
                        </span>
                      </div>

                      <div className="pt-2 border-t border-neutral-800/80 flex justify-between text-amber-400 font-bold">
                        <span>سود تخفیف همکاری Tier A:</span>
                        <span className="font-mono">-{formatPrice(totalPartnerSavings)}</span>
                      </div>

                      {needsTaxInvoice && (
                        <div className="flex justify-between text-neutral-400">
                          <span>مالیات ارزش افزوده (۱۰٪):</span>
                          <span className="font-mono">{formatPrice(vatAmount)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Final Total Price */}
                  <div className="pt-4 border-t border-neutral-800 space-y-4">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs font-bold text-neutral-200">مبلغ نهایی قابل پرداخت:</span>
                      <span className="font-mono text-xl font-black text-emerald-400">
                        {formatPrice(finalPayableTotal)}
                      </span>
                    </div>

                    <Button
                      type="submit"
                      isLoading={isSubmitting}
                      className="w-full py-4 text-xs font-black bg-sky-600 hover:bg-sky-500 text-white rounded-xl shadow-lg shadow-sky-600/30 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Send className="h-4 w-4" />
                      <span>ثبت سفارش و صدور پیش‌فاکتور رسمی P2P</span>
                    </Button>

                    <div className="flex items-center justify-center gap-4 text-[11px] text-neutral-400 pt-1">
                      <span className="flex items-center gap-1">
                        <Check className="h-3 w-3 text-emerald-400" />
                        <span>امکان‌سنجی رایگان دکل</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Check className="h-3 w-3 text-emerald-400" />
                        <span>تحویل در ۷۲ ساعت</span>
                      </span>
                    </div>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ─── 5. TAB 2: RADIO LOS FEASIBILITY ─────────────────────────── */}
      {activeTab === "los-check" && (
        <div className="rounded-3xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] p-6 sm:p-8 shadow-sm flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
              <Radio className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                امکان‌سنجی رادیویی دید مستقیم (Line of Sight - LOS)
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                بررسی خط دید رادیویی بین پشت‌بام کارگاه پروژه و نزدیک‌ترین دکل‌های پاپ‌سایت ماکروویو ققنوس آکادمی
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 rounded-2xl bg-neutral-900/50 border border-neutral-800">
            <div>
              <label className="text-xs text-neutral-400 block mb-1 font-medium">شهر یا منطقه صنعتی:</label>
              <input
                type="text"
                value={losCity}
                onChange={(e) => setLosCity(e.target.value)}
                className="w-full rounded-xl border border-neutral-800 bg-neutral-950 p-2.5 text-xs text-white focus:border-sky-500 focus:outline-none"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs text-neutral-400 block mb-1 font-medium">آدرس یا مختصات تقریبی پشت‌بام:</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={losCoords}
                  onChange={(e) => setLosCoords(e.target.value)}
                  className="flex-1 rounded-xl border border-neutral-800 bg-neutral-950 p-2.5 text-xs text-white focus:border-sky-500 focus:outline-none"
                />
                <Button
                  onClick={handleCheckLos}
                  isLoading={isCheckingLos}
                  className="bg-amber-600 hover:bg-amber-500 text-black font-bold text-xs shrink-0 cursor-pointer"
                >
                  <Radio className="h-4 w-4" />
                  <span>استعلام دید دکل</span>
                </Button>
              </div>
            </div>
          </div>

          {losResult && (
            <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-4">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <CheckCircle2 className="h-5 w-5" />
                <span>امکان برقراری ارتباط رادیویی دید مستقیم تایید گردید ✓</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-neutral-900/80 border border-neutral-800">
                  <span className="text-neutral-400 block text-[11px]">پاپ‌سایت متصل:</span>
                  <span className="font-bold text-white">{losResult.popSiteName}</span>
                </div>
                <div className="p-3 rounded-xl bg-neutral-900/80 border border-neutral-800">
                  <span className="text-neutral-400 block text-[11px]">فاصله تخمینی:</span>
                  <span className="font-mono font-bold text-sky-400">{toPersianDigits(losResult.distanceKm)} کیلومتر</span>
                </div>
                <div className="p-3 rounded-xl bg-neutral-900/80 border border-neutral-800">
                  <span className="text-neutral-400 block text-[11px]">حداکثر ظرفیت قابل عبور:</span>
                  <span className="font-mono font-bold text-emerald-400">{toPersianDigits(losResult.maxThroughputMbps)} Mbps متقارن</span>
                </div>
                <div className="p-3 rounded-xl bg-neutral-900/80 border border-neutral-800">
                  <span className="text-neutral-400 block text-[11px]">تجهیزات رادیویی پیشنهادی:</span>
                  <span className="font-bold text-amber-300">{losResult.recommendedDish}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── 6. TAB 3: ACTIVE LINKS TABLE ───────────────────────────── */}
      {activeTab === "active-links" && (
        <div className="rounded-3xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] p-6 sm:p-8 shadow-sm flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Wifi className="h-5 w-5 text-sky-400" />
              <h3 className="text-base font-bold text-white">لینک‌های وایرلس فعال در شعب همکار</h3>
            </div>
            <span className="text-xs text-neutral-400">
              {toPersianDigits(MOCK_PARTNER_INTERNET_SERVICES.length)} سرویس متصل
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-neutral-800 text-neutral-400">
                  <th className="pb-3 pr-2 font-medium">شماره قرارداد</th>
                  <th className="pb-3 font-medium">سرویس</th>
                  <th className="pb-3 font-medium">موقعیت نصب</th>
                  <th className="pb-3 font-medium">پهنای باند</th>
                  <th className="pb-3 font-medium">IP استاتیک</th>
                  <th className="pb-3 font-medium">شهریه ماهانه</th>
                  <th className="pb-3 font-medium">وضعیت</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60">
                {MOCK_PARTNER_INTERNET_SERVICES.map((srv) => (
                  <tr key={srv.id} className="hover:bg-neutral-900/30 transition-colors">
                    <td className="py-3.5 pr-2 font-mono font-bold text-white">{srv.contractNumber}</td>
                    <td className="py-3.5 font-bold text-neutral-200">{srv.serviceName}</td>
                    <td className="py-3.5 text-neutral-300">{srv.siteName}</td>
                    <td className="py-3.5 font-mono text-sky-400 font-bold">{srv.speedLabel}</td>
                    <td className="py-3.5 font-mono text-purple-400">{srv.ipPool}</td>
                    <td className="py-3.5 font-mono text-white">{formatPrice(srv.monthlyFee)}</td>
                    <td className="py-3.5">
                      <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 font-medium">
                        متصل (SLA ۹۹.۹٪)
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
