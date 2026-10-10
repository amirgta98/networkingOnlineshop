"use client";

import * as React from "react";
import Link from "next/link";
import {
  Globe2,
  Wifi,
  Server,
  ShieldCheck,
  CreditCard,
  Building2,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Send,
  Loader2,
  Download,
  Copy,
  Check,
  Sparkles,
  PhoneCall,
  Activity,
  Layers,
  Search,
  ChevronLeft,
  ArrowRight,
  Zap,
  MapPin,
  FileSpreadsheet,
} from "lucide-react";
import { useAuth } from "@/features/auth";
import { Button } from "@/shared/components/ui/button";
import { formatPrice, toPersianDigits } from "@/shared/lib/utils";
import {
  MOCK_PARTNER_INTERNET_SERVICES,
  MOCK_PARTNER_PROJECT_SITES,
} from "../data/mock-partner-data";
import {
  INTERNET_PLANS,
  STATIC_IP_PACKAGES,
  INTERNET_ADDONS,
} from "@/features/internet";
import type { PartnerInternetService } from "../types/partner.types";

export function PartnerInternetView() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = React.useState<"order" | "active-services" | "feasibility">("order");

  // Selection states for order form
  const [selectedPlanId, setSelectedPlanId] = React.useState<string>("ftth-turbo-ultra");
  const [selectedIpId, setSelectedIpId] = React.useState<string>("ip-block-8");
  const [billingCycle, setBillingCycle] = React.useState<"1_month" | "3_months" | "6_months" | "12_months">("12_months");
  const [selectedSiteId, setSelectedSiteId] = React.useState<string>("site_01");
  const [customSiteName, setCustomSiteName] = React.useState<string>("");
  const [customSiteAddress, setCustomSiteAddress] = React.useState<string>("");
  const [paymentMethod, setPaymentMethod] = React.useState<"credit_line" | "sayad_cheque" | "bank_transfer" | "online">("credit_line");
  const [needsTaxInvoice, setNeedsTaxInvoice] = React.useState<boolean>(true);
  const [includeModem, setIncludeModem] = React.useState<boolean>(true);
  const [includeInstallation, setIncludeInstallation] = React.useState<boolean>(true);
  const [orderNotes, setOrderNotes] = React.useState<string>("");

  // Submission & state
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [orderSuccess, setOrderSuccess] = React.useState<{
    trackingNumber: string;
    submittedAt: string;
    totalAmount: number;
    discountAmount: number;
    vatAmount: number;
    paymentLabel: string;
    siteLabel: string;
    planName: string;
    ipLabel: string;
  } | null>(null);
  const [copiedTracking, setCopiedTracking] = React.useState(false);

  // Active services list
  const [servicesList, setServicesList] = React.useState<PartnerInternetService[]>(MOCK_PARTNER_INTERNET_SERVICES);
  const [filterQuery, setFilterQuery] = React.useState("");

  // Feasibility check state
  const [feasibilityCity, setFeasibilityCity] = React.useState("تهران");
  const [feasibilityDistrict, setFeasibilityDistrict] = React.useState("منطقه ۳ - ونک و میرداماد");
  const [feasibilityChecking, setFeasibilityChecking] = React.useState(false);
  const [feasibilityResult, setFeasibilityResult] = React.useState<{
    ftthCovered: boolean;
    ptpCovered: boolean;
    fatDistanceMeters: number;
    maxSpeedMbps: number;
    popSiteName: string;
  } | null>(null);

  // Derived selected items
  const activePlan = INTERNET_PLANS.find((p) => p.id === selectedPlanId) || INTERNET_PLANS[0];
  const activeIp = STATIC_IP_PACKAGES.find((ip) => ip.id === selectedIpId) || null;

  // Partner wholesale discounts (Tier A discount is 20% baseline, up to 25% on yearly)
  const partnerWholesaleDiscountPercent = 20;

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

  // Monthly base price (retail)
  const retailMonthlyPlan = activePlan.basePricePerMonth;
  // Partner monthly price (discounted)
  const partnerMonthlyPlan = Math.round((retailMonthlyPlan * (100 - partnerWholesaleDiscountPercent)) / 100);

  // Static IP pricing (with partner discount 15%)
  const retailMonthlyIp = activeIp ? activeIp.pricePerMonth : 0;
  const partnerMonthlyIp = activeIp ? Math.round((activeIp.pricePerMonth * 0.85)) : 0;

  // Apply cycle discount
  const effectiveMonthlyPlan = Math.round((partnerMonthlyPlan * (100 - cycleDiscountPercent)) / 100);
  const effectiveMonthlyIp = activeIp
    ? Math.round((partnerMonthlyIp * (100 - (billingCycle === "12_months" ? activeIp.discountPercentForYearly : 0))) / 100)
    : 0;

  const totalMonthlyPartner = effectiveMonthlyPlan + effectiveMonthlyIp;
  const cycleSubtotal = totalMonthlyPartner * cycleMonths;

  // Retail equivalent subtotal for comparison
  const retailSubtotal = (retailMonthlyPlan + retailMonthlyIp) * cycleMonths;
  const totalPartnerSavings = retailSubtotal - cycleSubtotal;

  // One-time setup
  const modemPrice = includeModem ? 3_850_000 : 0;
  const installPrice = includeInstallation ? 450_000 : 0;
  const ipSetupFee = activeIp ? activeIp.setupFee : 0;
  const oneTimeTotal = modemPrice + installPrice + ipSetupFee;

  // VAT (10% standard for official tax invoice)
  const vatAmount = needsTaxInvoice ? Math.round((cycleSubtotal + oneTimeTotal) * 0.1) : 0;
  const finalPayableTotal = cycleSubtotal + oneTimeTotal + vatAmount;

  const selectedSite = MOCK_PARTNER_PROJECT_SITES.find((s) => s.id === selectedSiteId);
  const siteDisplayName =
    selectedSiteId === "custom"
      ? customSiteName || "پروژه / کارگاه جدید"
      : selectedSite?.name || "دفتر مرکزی";

  const handleOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      const trackingCode = `VLX-B2B-NET-${Math.floor(10000 + Math.random() * 90000)}`;

      // Add to services list
      const newService: PartnerInternetService = {
        id: `net_srv_${Date.now()}`,
        serviceName: `${activePlan.name} (${siteDisplayName})`,
        planType: activePlan.type === "ftth" ? "ftth" : activePlan.type === "point_to_point" ? "point_to_point" : "vdsl",
        planTypeLabel: activePlan.type === "ftth" ? "فیبر نوری سازمانی" : "پهنای باند متقارن",
        speedLabel: activePlan.speed,
        siteName: siteDisplayName,
        contractNumber: trackingCode,
        ipPool: activeIp ? activeIp.label : "بدون آی‌پی استاتیک",
        ipBlockRange: activeIp ? "185.143.236.0" + (activeIp.subnetMask ? activeIp.subnetMask.split(" ")[0] : "/32") : "Dynamic",
        usableIpsCount: activeIp ? activeIp.usableIps : 0,
        assignedTo: "تخصیص یافته به شرکت داده‌پردازی کهکشان ارتباط",
        monthlyFee: totalMonthlyPartner,
        partnerDiscountPercent: partnerWholesaleDiscountPercent,
        billingCycle:
          billingCycle === "12_months"
            ? "سالانه"
            : billingCycle === "6_months"
            ? "شش‌ماهه"
            : billingCycle === "3_months"
            ? "سه‌ماهه"
            : "ماهانه",
        renewalDate: "۱۴۰۳/۱۲/۲۹",
        status: "provisioning",
        statusLabel: "در حال رانژه و تحویل مهندسی (ظرف ۲۴ ساعت)",
        slaPercent: "۹۹.۹۵٪",
      };

      setServicesList((prev) => [newService, ...prev]);

      setOrderSuccess({
        trackingNumber: trackingCode,
        submittedAt: new Date().toLocaleDateString("fa-IR"),
        totalAmount: finalPayableTotal,
        discountAmount: totalPartnerSavings,
        vatAmount: vatAmount,
        paymentLabel:
          paymentMethod === "credit_line"
            ? "تسویه ۴۵ روزه از خط اعتباری ۵۰۰ میلیونی"
            : paymentMethod === "sayad_cheque"
            ? "چک صیادی بنفش (سامانه پیچک)"
            : paymentMethod === "bank_transfer"
            ? "حواله ساتنا / پایا شرکتی"
            : "درگاه پرداخت آنلاین شتاب",
        siteLabel: siteDisplayName,
        planName: activePlan.name,
        ipLabel: activeIp ? activeIp.label : "بدون IP استاتیک",
      });
    }, 1200);
  };

  const handleCopyTracking = () => {
    if (orderSuccess) {
      navigator.clipboard.writeText(orderSuccess.trackingNumber);
      setCopiedTracking(true);
      setTimeout(() => setCopiedTracking(false), 2000);
    }
  };

  const handleRunFeasibility = () => {
    setFeasibilityChecking(true);
    setFeasibilityResult(null);

    setTimeout(() => {
      setFeasibilityChecking(false);
      setFeasibilityResult({
        ftthCovered: true,
        ptpCovered: true,
        fatDistanceMeters: 65,
        maxSpeedMbps: 1000,
        popSiteName: "پاپ‌سایت مرکزی برج میلاد / دیتاسنتر افرانت",
      });
    }, 1000);
  };

  const filteredServices = servicesList.filter((s) =>
    s.serviceName.toLowerCase().includes(filterQuery.toLowerCase()) ||
    s.siteName.toLowerCase().includes(filterQuery.toLowerCase()) ||
    s.contractNumber.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 text-right" dir="rtl">
      {/* ─── 1. Header Banner ───────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl border border-sky-500/30 bg-gradient-to-br from-sky-950/40 via-[var(--theme-surface)] to-[var(--theme-surface)] p-6 sm:p-8 backdrop-blur-xl shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-sky-500/20 text-sky-400 text-xl font-black ring-2 ring-sky-500/30 shadow-lg shadow-sky-500/20">
                <Globe2 className="h-8 w-8" />
              </div>

              <div className="flex flex-col gap-1.5 text-right">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-xl sm:text-2xl font-black text-white">
                    اینترنت پرسرعت سازمانی و تخصیص IP استاتیک اختصاصی
                  </h1>
                  <span className="text-xs text-sky-300 bg-sky-500/20 px-2.5 py-0.5 rounded-full border border-sky-500/30 font-semibold inline-flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-sky-400 animate-pulse shadow-[0_0_8px_#38bdf8]" />
                    <span>تعرفه همکاری طلایی (Tier A)</span>
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed max-w-3xl mt-1">
                  تامین پهنای باند اختصاصی فیبر نوری (FTTH)، لینک رادیویی متقارن (P2P) و تخصیص بلوک‌های رسمی IP ثابت برای دفاتر مرکزی، دیتاسنترها و کارگاه‌های پروژه‌ای با تسویه از محل خط اعتباری و فاکتور رسمی سامانه مودیان.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
              <Button
                variant={activeTab === "order" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTab("order")}
                className={activeTab === "order" ? "bg-sky-600 hover:bg-sky-500 text-white text-xs gap-1.5" : "border-neutral-700 text-neutral-200 text-xs gap-1.5"}
              >
                <Plus className="h-4 w-4" />
                <span>سفارش سرویس جدید</span>
              </Button>

              <Button
                variant={activeTab === "active-services" ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTab("active-services")}
                className={activeTab === "active-services" ? "bg-sky-600 hover:bg-sky-500 text-white text-xs gap-1.5" : "border-neutral-700 text-neutral-200 text-xs gap-1.5"}
              >
                <Activity className="h-4 w-4 text-emerald-400" />
                <span>سرویس‌های فعال ({toPersianDigits(servicesList.length)})</span>
              </Button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-neutral-800/80">
            <div className="p-3 rounded-2xl bg-neutral-900/50 border border-neutral-800/80 flex flex-col">
              <span className="text-[11px] text-neutral-400">سرویس‌های فعال شرکتی:</span>
              <span className="text-sm sm:text-base font-black font-mono text-white mt-1 flex items-center gap-1.5">
                <Wifi className="h-4 w-4 text-sky-400" />
                <span>{toPersianDigits(servicesList.length)} خط ارتباطی</span>
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-neutral-900/50 border border-neutral-800/80 flex flex-col">
              <span className="text-[11px] text-neutral-400">آی‌پی‌های ثابت تخصیص‌یافته:</span>
              <span className="text-sm sm:text-base font-black font-mono text-emerald-400 mt-1 flex items-center gap-1.5">
                <Server className="h-4 w-4 text-emerald-400" />
                <span>۱۹ آدرس عمومی IPv4</span>
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-neutral-900/50 border border-neutral-800/80 flex flex-col">
              <span className="text-[11px] text-neutral-400">تضمین پایداری (SLA):</span>
              <span className="text-sm sm:text-base font-bold text-sky-300 mt-1 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-sky-400" />
                <span>۹۹.۹۵٪ با مانیتورینگ NOC</span>
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-neutral-900/50 border border-neutral-800/80 flex flex-col">
              <span className="text-[11px] text-neutral-400">شرایط تسویه همکاران:</span>
              <span className="text-sm sm:text-base font-bold text-amber-400 mt-1 flex items-center gap-1.5">
                <CreditCard className="h-4 w-4 text-amber-400" />
                <span>اعتباری ۴۵ روزه / چک صیادی</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── 2. Tab Navigation ─────────────────────────────────────────── */}
      <div className="flex items-center gap-2 border-b border-neutral-800 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("order")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === "order"
              ? "bg-sky-500/15 text-sky-400 border border-sky-500/30 shadow-sm"
              : "text-neutral-400 hover:text-white hover:bg-neutral-900/50"
          }`}
        >
          <Zap className="h-4 w-4" />
          <span>سفارش و محاسبه‌گر تعرفه همکار</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("active-services")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === "active-services"
              ? "bg-sky-500/15 text-sky-400 border border-sky-500/30 shadow-sm"
              : "text-neutral-400 hover:text-white hover:bg-neutral-900/50"
          }`}
        >
          <Activity className="h-4 w-4" />
          <span>خطوط ارتباطی فعال شرکت ({toPersianDigits(servicesList.length)})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("feasibility")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === "feasibility"
              ? "bg-sky-500/15 text-sky-400 border border-sky-500/30 shadow-sm"
              : "text-neutral-400 hover:text-white hover:bg-neutral-900/50"
          }`}
        >
          <MapPin className="h-4 w-4" />
          <span>امکان‌سنجی رایگان دکل و فیبر</span>
        </button>
      </div>

      {/* ─── 3. TAB CONTENT ────────────────────────────────────────────── */}

      {/* TAB 1: ORDER FORM & LIVE CALCULATOR */}
      {activeTab === "order" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form (2 cols) */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {orderSuccess ? (
              <div className="rounded-3xl border border-emerald-500/30 bg-emerald-950/20 p-6 sm:p-8 flex flex-col gap-6 animate-in fade-in">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <CheckCircle2 className="h-7 w-7" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white">
                      پیش‌فاکتور رسمی سازمانی با موفقیت ثبت شد
                    </h3>
                    <p className="text-xs text-neutral-300 mt-0.5">
                      اطلاعات سفارش در کارتابل مدیریت زیرساخت شرکت ققنوس آکادمی قرار گرفت.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800 space-y-3 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
                    <span className="text-neutral-400">شماره پیش‌فاکتور / شناسه پیگیری:</span>
                    <div className="flex items-center gap-2 font-mono font-bold text-sky-400">
                      <span>{orderSuccess.trackingNumber}</span>
                      <button
                        type="button"
                        onClick={handleCopyTracking}
                        className="p-1 hover:text-white transition-colors"
                        title="کپی شناسه"
                      >
                        {copiedTracking ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">سرویس انتخابی:</span>
                    <span className="text-neutral-200 font-bold">{orderSuccess.planName}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">بسته IP استاتیک:</span>
                    <span className="text-neutral-200 font-bold">{orderSuccess.ipLabel}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">محل تحویل / پروژه:</span>
                    <span className="text-neutral-200 font-bold">{orderSuccess.siteLabel}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">روش تسویه:</span>
                    <span className="text-emerald-400 font-bold">{orderSuccess.paymentLabel}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">میزان سود و تخفیف همکار:</span>
                    <span className="font-mono text-amber-400 font-bold">{formatPrice(orderSuccess.discountAmount)} تومان</span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-neutral-800">
                    <span className="text-neutral-300 font-bold">مبلغ نهایی پیش‌فاکتور (با ۱۰٪ ارزش افزوده):</span>
                    <span className="font-mono text-base font-black text-emerald-400">
                      {formatPrice(orderSuccess.totalAmount)} تومان
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    onClick={() => setActiveTab("active-services")}
                    className="bg-sky-600 hover:bg-sky-500 text-white text-xs gap-2"
                  >
                    <Activity className="h-4 w-4" />
                    <span>مشاهده در لیست سرویس‌های فعال</span>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => setOrderSuccess(null)}
                    className="border-neutral-700 text-neutral-300 text-xs"
                  >
                    ثبت سفارش اینترنت دیگر
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleOrderSubmit} className="flex flex-col gap-6">
                {/* 1. Plan Selection */}
                <div className="rounded-3xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] p-6 shadow-sm flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="h-5 w-5 text-sky-400" />
                      <h2 className="text-base font-bold text-white">
                        ۱. انتخاب پلن اینترنت سازمانی (تعرفه همکار)
                      </h2>
                    </div>
                    <span className="text-xs text-sky-400 bg-sky-500/10 px-2.5 py-0.5 rounded-full border border-sky-500/20 font-medium">
                      تخفیف همکاری ۲۰٪ تا ۲۵٪
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {INTERNET_PLANS.map((plan) => {
                      const isSelected = selectedPlanId === plan.id;
                      const partnerPriceMonthly = Math.round((plan.basePricePerMonth * 0.8));

                      return (
                        <div
                          key={plan.id}
                          onClick={() => setSelectedPlanId(plan.id)}
                          className={`relative rounded-2xl border p-4 cursor-pointer transition-all flex flex-col justify-between gap-3 text-right ${
                            isSelected
                              ? "border-sky-500 bg-sky-500/10 shadow-md ring-1 ring-sky-500/30"
                              : "border-neutral-800 bg-neutral-900/40 hover:border-neutral-700"
                          }`}
                        >
                          {plan.popular && (
                            <span className="absolute -top-2.5 left-4 text-[10px] font-bold bg-amber-500 text-black px-2 py-0.5 rounded-full">
                              پیشنهاد سازمانی
                            </span>
                          )}

                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-sm font-bold text-white">{plan.name}</span>
                              <span className="text-xs font-mono font-bold text-sky-400">{plan.speed}</span>
                            </div>

                            <p className="text-[11px] text-neutral-400 leading-relaxed mb-2 line-clamp-2">
                              {plan.recommendedFor}
                            </p>

                            <div className="space-y-1 text-[11px] text-neutral-300">
                              {plan.features.slice(0, 2).map((feat, idx) => (
                                <div key={idx} className="flex items-center gap-1.5">
                                  <Check className="h-3 w-3 text-emerald-400 shrink-0" />
                                  <span className="truncate">{feat}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="pt-2 border-t border-neutral-800 flex items-center justify-between text-xs">
                            <div>
                              <span className="text-[10px] text-neutral-500 line-through ml-1">
                                {formatPrice(plan.basePricePerMonth)}
                              </span>
                              <span className="font-mono font-bold text-white">
                                {formatPrice(partnerPriceMonthly)}
                              </span>
                              <span className="text-[10px] text-neutral-400 mr-1">تومان/ماه</span>
                            </div>
                            <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded font-bold">
                              ۲۰٪ تخفیف
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Static IP Subnet Selection */}
                <div className="rounded-3xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] p-6 shadow-sm flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Server className="h-5 w-5 text-purple-400" />
                      <h2 className="text-base font-bold text-white">
                        ۲. تخصیص بلاک IP استاتیک اختصاصی
                      </h2>
                    </div>
                    <span className="text-xs text-neutral-400">
                      قابل تخصیص روی فایروال، NVR و روترهای BGP
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* Option: None */}
                    <div
                      onClick={() => setSelectedIpId("none")}
                      className={`rounded-2xl border p-4 cursor-pointer transition-all flex flex-col justify-between gap-2 text-right ${
                        selectedIpId === "none"
                          ? "border-sky-500 bg-sky-500/10 ring-1 ring-sky-500/30"
                          : "border-neutral-800 bg-neutral-900/40 hover:border-neutral-700"
                      }`}
                    >
                      <span className="text-xs font-bold text-neutral-200">بدون آی‌پی استاتیک</span>
                      <p className="text-[11px] text-neutral-400">
                        استفاده از IP داینامیک استاندارد ISP (بدون هزینه اضافی)
                      </p>
                      <span className="text-xs font-mono font-bold text-neutral-400">رایگان</span>
                    </div>

                    {STATIC_IP_PACKAGES.map((pkg) => {
                      const isSelected = selectedIpId === pkg.id;
                      const partnerIpMonthly = Math.round(pkg.pricePerMonth * 0.85);

                      return (
                        <div
                          key={pkg.id}
                          onClick={() => setSelectedIpId(pkg.id)}
                          className={`rounded-2xl border p-4 cursor-pointer transition-all flex flex-col justify-between gap-2 text-right ${
                            isSelected
                              ? "border-sky-500 bg-sky-500/10 ring-1 ring-sky-500/30"
                              : "border-neutral-800 bg-neutral-900/40 hover:border-neutral-700"
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-white">{pkg.label}</span>
                              <span className="text-[10px] text-purple-400 font-mono">{pkg.subnetMask?.split(" ")[0]}</span>
                            </div>
                            <p className="text-[11px] text-neutral-400 mt-1 line-clamp-1">
                              {pkg.recommendedFor}
                            </p>
                          </div>

                          <div className="flex items-center justify-between text-xs pt-1 border-t border-neutral-800/60">
                            <div>
                              <span className="font-mono font-bold text-white">
                                {formatPrice(partnerIpMonthly)}
                              </span>
                              <span className="text-[10px] text-neutral-400 mr-1">تومان/ماه</span>
                            </div>
                            <span className="text-[10px] text-sky-400 font-mono">
                              {toPersianDigits(pkg.usableIps)} IP قابل استفاده
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Duration & Project Site */}
                <div className="rounded-3xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] p-6 shadow-sm flex flex-col gap-5">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-emerald-400" />
                    <h2 className="text-base font-bold text-white">
                      ۳. دوره اشتراک و مقصد تحویل پروژه
                    </h2>
                  </div>

                  {/* Billing Cycles */}
                  <div>
                    <label className="text-xs text-neutral-400 block mb-2 font-medium">
                      دوره اشتراک سازمانی:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {[
                        { id: "1_month", label: "۱ ماهه", discount: "بدون تخفیف" },
                        { id: "3_months", label: "۳ ماهه", discount: "۵٪ تخفیف مازاد" },
                        { id: "6_months", label: "۶ ماهه", discount: "۱۲٪ تخفیف مازاد" },
                        { id: "12_months", label: "۱ ساله (طلایی)", discount: "۲۰٪ تخفیف + مودم رایگان" },
                      ].map((cycle) => (
                        <button
                          key={cycle.id}
                          type="button"
                          onClick={() => setBillingCycle(cycle.id as any)}
                          className={`p-2.5 rounded-xl border text-right cursor-pointer transition-all ${
                            billingCycle === cycle.id
                              ? "border-sky-500 bg-sky-500/15 text-white"
                              : "border-neutral-800 bg-neutral-900/40 text-neutral-300 hover:border-neutral-700"
                          }`}
                        >
                          <span className="text-xs font-bold block">{cycle.label}</span>
                          <span className="text-[10px] text-sky-400 block mt-0.5">{cycle.discount}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Site selection */}
                  <div>
                    <label className="text-xs text-neutral-400 block mb-2 font-medium">
                      انتخاب پروژه / کارگاه مقصد تحویل سرویس:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-3">
                      {MOCK_PARTNER_PROJECT_SITES.map((site) => (
                        <button
                          key={site.id}
                          type="button"
                          onClick={() => setSelectedSiteId(site.id)}
                          className={`p-3 rounded-xl border text-right cursor-pointer transition-all ${
                            selectedSiteId === site.id
                              ? "border-emerald-500 bg-emerald-500/15 text-white"
                              : "border-neutral-800 bg-neutral-900/40 text-neutral-300 hover:border-neutral-700"
                          }`}
                        >
                          <span className="text-xs font-bold block truncate">{site.name}</span>
                          <span className="text-[10px] text-neutral-400 block mt-0.5">{site.city}</span>
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => setSelectedSiteId("custom")}
                        className={`p-3 rounded-xl border text-right cursor-pointer transition-all ${
                          selectedSiteId === "custom"
                            ? "border-emerald-500 bg-emerald-500/15 text-white"
                            : "border-neutral-800 bg-neutral-900/40 text-neutral-300 hover:border-neutral-700"
                        }`}
                      >
                        <span className="text-xs font-bold block">+ تعریف سایت / شعبه جدید</span>
                        <span className="text-[10px] text-neutral-400 block mt-0.5">ثبت آدرس کارگاه یا دفتر جدید</span>
                      </button>
                    </div>

                    {selectedSiteId === "custom" && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-neutral-900/60 border border-neutral-800 animate-in fade-in">
                        <div>
                          <label className="text-[11px] text-neutral-400 block mb-1">نام سایت یا شعبه:</label>
                          <input
                            type="text"
                            value={customSiteName}
                            onChange={(e) => setCustomSiteName(e.target.value)}
                            placeholder="مثال: کارگاه پروژه عسلویه یا شعبه ۲"
                            className="w-full text-xs p-2.5 rounded-xl border border-neutral-800 bg-neutral-950 text-white focus:border-sky-500 outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-neutral-400 block mb-1">نشانی دقیق محل نصب:</label>
                          <input
                            type="text"
                            value={customSiteAddress}
                            onChange={(e) => setCustomSiteAddress(e.target.value)}
                            placeholder="شهر، خیابان، پلاک، طبقه"
                            className="w-full text-xs p-2.5 rounded-xl border border-neutral-800 bg-neutral-950 text-white focus:border-sky-500 outline-none"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Payment Method */}
                  <div>
                    <label className="text-xs text-neutral-400 block mb-2 font-medium">
                      روش تسویه حساب سازمانی (شرایط همکاری B2B):
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod("credit_line")}
                        className={`p-3 rounded-xl border text-right cursor-pointer transition-all flex items-center justify-between ${
                          paymentMethod === "credit_line"
                            ? "border-sky-500 bg-sky-500/15 text-white ring-1 ring-sky-500/30"
                            : "border-neutral-800 bg-neutral-900/40 text-neutral-300 hover:border-neutral-700"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <CreditCard className="h-4 w-4 text-sky-400" />
                          <div>
                            <span className="text-xs font-bold block">کسر از خط اعتباری ۵۰۰ میلیونی</span>
                            <span className="text-[10px] text-neutral-400 block mt-0.5">تسویه ۴۵ روزه بدون پیش‌پرداخت</span>
                          </div>
                        </div>
                        <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-bold">پیشنهادی</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod("sayad_cheque")}
                        className={`p-3 rounded-xl border text-right cursor-pointer transition-all flex items-center gap-2.5 ${
                          paymentMethod === "sayad_cheque"
                            ? "border-sky-500 bg-sky-500/15 text-white ring-1 ring-sky-500/30"
                            : "border-neutral-800 bg-neutral-900/40 text-neutral-300 hover:border-neutral-700"
                        }`}
                      >
                        <FileSpreadsheet className="h-4 w-4 text-purple-400" />
                        <div>
                          <span className="text-xs font-bold block">ثبت چک صیادی بنفش</span>
                          <span className="text-[10px] text-neutral-400 block mt-0.5">ثبت در سامانه پیچک با موعد ۴۵ روزه</span>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod("bank_transfer")}
                        className={`p-3 rounded-xl border text-right cursor-pointer transition-all flex items-center gap-2.5 ${
                          paymentMethod === "bank_transfer"
                            ? "border-sky-500 bg-sky-500/15 text-white ring-1 ring-sky-500/30"
                            : "border-neutral-800 bg-neutral-900/40 text-neutral-300 hover:border-neutral-700"
                        }`}
                      >
                        <Building2 className="h-4 w-4 text-amber-400" />
                        <div>
                          <span className="text-xs font-bold block">حواله ساتنا / پایا شرکتی</span>
                          <span className="text-[10px] text-neutral-400 block mt-0.5">به حساب حقوقی شرکت ققنوس آکادمی</span>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod("online")}
                        className={`p-3 rounded-xl border text-right cursor-pointer transition-all flex items-center gap-2.5 ${
                          paymentMethod === "online"
                            ? "border-sky-500 bg-sky-500/15 text-white ring-1 ring-sky-500/30"
                            : "border-neutral-800 bg-neutral-900/40 text-neutral-300 hover:border-neutral-700"
                        }`}
                      >
                        <Zap className="h-4 w-4 text-emerald-400" />
                        <div>
                          <span className="text-xs font-bold block">درگاه پرداخت آنلاین شتاب</span>
                          <span className="text-[10px] text-neutral-400 block mt-0.5">پرداخت آنی با کارت‌های عضو شتاب</span>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Addon checkboxes */}
                  <div className="pt-3 border-t border-neutral-800/80 flex flex-col gap-2.5">
                    <label className="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={needsTaxInvoice}
                        onChange={(e) => setNeedsTaxInvoice(e.target.checked)}
                        className="rounded accent-sky-500"
                      />
                      <span>صدور فاکتور رسمی مالیاتی سامانه مودیان با کد اقتصادی {toPersianDigits(user?.economicCode || "۴۱۱۵۸۹۷۶۳۲۱۴")} (+۱۰٪ ارزش افزوده)</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeModem}
                        onChange={(e) => setIncludeModem(e.target.checked)}
                        className="rounded accent-sky-500"
                      />
                      <span>تامین مودم فیبر نوری دوبانده Wi-Fi 6 هوآوی با گارانتی تعویض ۲ ساله ققنوس آکادمی ({billingCycle === "12_months" ? "هدیه اشتراک یکساله" : "۳,۸۵۰,۰۰۰ تومان"})</span>
                    </label>

                    <label className="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeInstallation}
                        onChange={(e) => setIncludeInstallation(e.target.checked)}
                        className="rounded accent-sky-500"
                      />
                      <span>نصب و کانفیگ حضوری توسط مهندس ارشد شبکه ققنوس آکادمی در محل کارگاه (۴۵۰,۰۰۰ تومان)</span>
                    </label>
                  </div>
                </div>

                <Button
                  type="submit"
                  isLoading={isSubmitting}
                  className="w-full py-4 text-sm font-bold bg-sky-600 hover:bg-sky-500 text-white rounded-2xl shadow-xl shadow-sky-600/25 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="h-4 w-4" />
                  <span>ثبت قطعی پیش‌فاکتور اینترنت سازمانی ({formatPrice(finalPayableTotal)} تومان)</span>
                </Button>
              </form>
            )}
          </div>

          {/* Sidebar: Live Invoice Summary (1 col) */}
          <div className="flex flex-col gap-6">
            <div className="rounded-3xl border border-sky-500/30 bg-[var(--theme-surface)] p-6 shadow-sm sticky top-24 flex flex-col gap-5">
              <div className="flex items-center gap-2 pb-3 border-b border-neutral-800">
                <FileText className="h-5 w-5 text-sky-400" />
                <h3 className="text-base font-bold text-white">خلاصه پیش‌فاکتور همکار B2B</h3>
              </div>

              <div className="flex flex-col gap-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400">پلن اینترنت:</span>
                  <span className="text-neutral-200 font-bold">{activePlan.name}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-neutral-400">سرعت نامی:</span>
                  <span className="text-sky-400 font-mono font-bold">{activePlan.speed}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-neutral-400">آی‌پی استاتیک:</span>
                  <span className="text-neutral-200 font-bold">{activeIp ? activeIp.label : "بدون IP"}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-neutral-400">دوره زمانی:</span>
                  <span className="text-neutral-200">
                    {billingCycle === "12_months" ? "۱۲ ماهه" : billingCycle === "6_months" ? "۶ ماهه" : billingCycle === "3_months" ? "۳ ماهه" : "۱ ماهه"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-neutral-400">پروژه مقصد:</span>
                  <span className="text-neutral-200 font-medium">{siteDisplayName}</span>
                </div>

                <div className="pt-3 border-t border-neutral-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">تعرفه بازار آزاد:</span>
                    <span className="font-mono text-neutral-400 line-through">{formatPrice(retailSubtotal)} تومان</span>
                  </div>

                  <div className="flex items-center justify-between text-amber-400 font-bold">
                    <span>سود تخفیف همکاری (Tier A):</span>
                    <span className="font-mono">-{formatPrice(totalPartnerSavings)} تومان</span>
                  </div>

                  {needsTaxInvoice && (
                    <div className="flex items-center justify-between text-neutral-400">
                      <span>مالیات ارزش افزوده (۱۰٪):</span>
                      <span className="font-mono">{formatPrice(vatAmount)} تومان</span>
                    </div>
                  )}

                  <div className="pt-3 border-t border-neutral-800 flex items-center justify-between text-sm">
                    <span className="font-bold text-white">مبلغ قابل پرداخت:</span>
                    <span className="font-mono font-black text-emerald-400 text-base">
                      {formatPrice(finalPayableTotal)} تومان
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/20 text-[11px] text-sky-300 leading-relaxed mt-2">
                  ✓ امکان تسویه با چک صیادی ۴۵ روزه یا کسر خودکار از خط اعتباری ۵۰۰ میلیونی مصوب شرکت وجود دارد.
                </div>
              </div>
            </div>

            {/* SLA Trust Card */}
            <div className="rounded-3xl border border-neutral-800 bg-neutral-900/40 p-5 space-y-3 text-xs">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <ShieldCheck className="h-4 w-4" />
                <span>تعهدات سطح خدمت (Enterprise SLA)</span>
              </div>
              <ul className="space-y-1.5 text-neutral-400 text-[11px]">
                <li>• پایداری ۹۹.۹۵٪ ماهانه با جبران خسارت قطعی</li>
                <li>• پینگ تک‌رقمی در شبکه IXP زیرساخت کشور</li>
                <li>• تیم مانیتورینگ اختصاصی NOC به صورت ۲۴ ساعته</li>
                <li>• رانژه سریع فیبر ظرف کمتر از ۴۸ ساعت کاری</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ACTIVE SERVICES & IP ALLOCATIONS */}
      {activeTab === "active-services" && (
        <div className="flex flex-col gap-6">
          <div className="rounded-3xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] p-6 shadow-sm flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-white">خطوط فعال اینترنت و بلاک‌های آی‌پی استاتیک شرکت</h3>
                <p className="text-xs text-neutral-400 mt-0.5">
                  پایش وضعیت اتصال شعب، ساب‌نت‌های واگذارشده به شرکت و تاریخ سررسید تمدید دوره‌ها
                </p>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="absolute right-3.5 top-2.5 h-4 w-4 text-neutral-500" />
                <input
                  type="text"
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  placeholder="جستجو در خطوط یا آی‌پی‌ها..."
                  className="w-full text-xs pr-10 pl-3 py-2 rounded-xl border border-neutral-800 bg-neutral-950 text-white placeholder-neutral-500 focus:border-sky-500 outline-none"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-neutral-800 text-neutral-400">
                    <th className="pb-3 pr-2 font-medium">عنوان سرویس و پهنای باند</th>
                    <th className="pb-3 font-medium">سایت / پروژه مقصد</th>
                    <th className="pb-3 font-medium">بلاک IP استاتیک و ساب‌نت</th>
                    <th className="pb-3 font-medium">آی‌پی‌های فعال</th>
                    <th className="pb-3 font-medium">وضعیت اتصال</th>
                    <th className="pb-3 font-medium">شهریه ماهانه</th>
                    <th className="pb-3 pl-2 text-left font-medium">عملیات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60">
                  {filteredServices.map((srv) => (
                    <tr key={srv.id} className="hover:bg-neutral-900/30 transition-colors">
                      <td className="py-4 pr-2">
                        <span className="block font-bold text-white">{srv.serviceName}</span>
                        <span className="text-[11px] font-mono text-sky-400">{srv.speedLabel}</span>
                        <span className="text-[10px] text-neutral-500 font-mono block">قرارداد: {srv.contractNumber}</span>
                      </td>

                      <td className="py-4 text-neutral-200">
                        <span className="font-medium block">{srv.siteName}</span>
                        <span className="text-[10px] text-neutral-400">{srv.assignedTo}</span>
                      </td>

                      <td className="py-4 font-mono">
                        <span className="block font-bold text-purple-400">{srv.ipPool}</span>
                        <span className="text-[11px] text-neutral-400">{srv.ipBlockRange}</span>
                      </td>

                      <td className="py-4">
                        <span className="inline-flex items-center gap-1 font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 text-[11px]">
                          {toPersianDigits(srv.usableIpsCount)} آی‌پی فعال
                        </span>
                      </td>

                      <td className="py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] border bg-emerald-500/10 text-emerald-300 border-emerald-500/20 font-medium">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                          <span>{srv.statusLabel}</span>
                        </span>
                        <span className="block text-[10px] text-neutral-500 font-mono mt-0.5">SLA: {srv.slaPercent}</span>
                      </td>

                      <td className="py-4 font-mono font-bold text-white">
                        <span>{formatPrice(srv.monthlyFee)}</span>
                        <span className="text-[10px] text-neutral-400 font-normal mr-1">تومان</span>
                        <span className="block text-[10px] text-neutral-500 font-normal">{srv.billingCycle}</span>
                      </td>

                      <td className="py-4 pl-2 text-left">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-[11px] text-sky-400 hover:text-sky-300"
                            onClick={() => alert(`درخواست افزایش پهنای باند برای قرارداد ${srv.contractNumber} ثبت شد.`)}
                          >
                            ارتقای سرعت
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-[11px] text-purple-400 hover:text-purple-300"
                            onClick={() => alert(`درخواست تخصیص ساب‌نت بیشتر برای ${srv.siteName} به NOC ارسال گردید.`)}
                          >
                            + IP بیشتر
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: FEASIBILITY CHECKER */}
      {activeTab === "feasibility" && (
        <div className="rounded-3xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] p-6 sm:p-8 shadow-sm flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/15 text-sky-400 border border-sky-500/30">
              <MapPin className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                امکان‌سنجی آنلاین دکل‌های مخابراتی و باکس‌های فیبر نوری FAT
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                بررسی بلادرنگ پوشش شبکه فیبر نوری تار تاریک و دید مستقیم لینک‌های رادیویی با پاپ‌سایت‌های مرکزی ققنوس آکادمی
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 rounded-2xl bg-neutral-900/50 border border-neutral-800">
            <div>
              <label className="text-xs text-neutral-400 block mb-1.5 font-medium">استان / شهر مقصد:</label>
              <select
                value={feasibilityCity}
                onChange={(e) => setFeasibilityCity(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-neutral-800 bg-neutral-950 text-white outline-none focus:border-sky-500"
              >
                <option value="تهران">تهران (پوشش سراسری فیبر و دکل)</option>
                <option value="اصفهان">اصفهان</option>
                <option value="مشهد">مشهد</option>
                <option value="شیراز">شیراز</option>
                <option value="تبریز">تبریز</option>
                <option value="عسلویه">عسلویه / پارس جنوبی (پوشش اختصاصی)</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-neutral-400 block mb-1.5 font-medium">منطقه / محله یا شهرک صنعتی:</label>
              <input
                type="text"
                value={feasibilityDistrict}
                onChange={(e) => setFeasibilityDistrict(e.target.value)}
                placeholder="مثال: منطقه ۳، میرداماد یا پارک فناوری پردیس"
                className="w-full text-xs p-2.5 rounded-xl border border-neutral-800 bg-neutral-950 text-white outline-none focus:border-sky-500"
              />
            </div>

            <div className="flex items-end">
              <Button
                type="button"
                onClick={handleRunFeasibility}
                isLoading={feasibilityChecking}
                className="w-full bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold py-2.5 rounded-xl"
              >
                <Search className="h-4 w-4 ml-1.5" />
                <span>استعلام آنی پوشش شبکه</span>
              </Button>
            </div>
          </div>

          {feasibilityResult && (
            <div className="p-6 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 flex flex-col gap-4 animate-in fade-in">
              <div className="flex items-center gap-2.5 text-emerald-400 font-bold text-sm">
                <CheckCircle2 className="h-5 w-5" />
                <span>پوشش کامل زیرساخت با حداکثر سرعت ۱۰۰۰ مگابیت تایید شد</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800">
                  <span className="text-neutral-400 block mb-1">فاصله تا نزدیک‌ترین باکس فیبر (FAT):</span>
                  <span className="font-mono font-bold text-white">{toPersianDigits(feasibilityResult.fatDistanceMeters)} متر (نصب سریع ۲۴ ساعته)</span>
                </div>

                <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800">
                  <span className="text-neutral-400 block mb-1">پاپ‌سایت رادیویی مشرف:</span>
                  <span className="text-sky-300 font-medium">{feasibilityResult.popSiteName}</span>
                </div>

                <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800">
                  <span className="text-neutral-400 block mb-1">تخصیص آی‌پی استاتیک:</span>
                  <span className="text-emerald-400 font-bold">بلاک‌های /29 و /28 آزاد موجود است</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-neutral-300">
                  آماده صدور پیش‌فاکتور برای این موقعیت هستید؟
                </span>
                <Button
                  onClick={() => setActiveTab("order")}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs"
                >
                  انتقال به فرم ثبت سفارش
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
