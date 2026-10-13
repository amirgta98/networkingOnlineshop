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
  MapPin,
  Search,
  SlidersHorizontal,
  Headphones,
  Globe2,
  Network,
  Plus,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "@/features/auth";
import { Button } from "@/shared/components/ui/button";
import { formatPrice, toPersianDigits } from "@/shared/lib/utils";
import {
  MOCK_P2P_PLANS,
  MOCK_PARTNER_INTERNET_SERVICES,
  MOCK_PARTNER_PROJECT_SITES,
} from "../data/mock-partner-data";
import type { P2PInternetPlan, PartnerInternetService } from "../types/partner.types";

export function PartnerP2PView() {
  const { user } = useAuth();
  
  // Navigation tabs:
  // 1. "order-new": Order new P2P / Internet line (with integrated Static IP)
  // 2. "buy-ip-existing": Dedicated workflow to buy Static IP for an already active internet service
  // 3. "los-check": Radio line-of-sight feasibility check
  // 4. "active-links": Active enterprise links & contracts list
  const [activeTab, setActiveTab] = React.useState<"order-new" | "buy-ip-existing" | "los-check" | "active-links">("order-new");

  // Active services state (allows adding static IP in real-time)
  const [servicesList, setServicesList] = React.useState<PartnerInternetService[]>(MOCK_PARTNER_INTERNET_SERVICES);

  // ───────────────────────────────────────────────────────────────────────────
  // TAB 1: ORDER NEW INTERNET SERVICE + STATIC IP STATE
  // ───────────────────────────────────────────────────────────────────────────
  const [selectedSpeed, setSelectedSpeed] = React.useState<number>(200);
  const [selectedTraffic, setSelectedTraffic] = React.useState<number | "all">("all");
  const [billingCycle, setBillingCycle] = React.useState<"1_month" | "3_months" | "6_months" | "12_months">("12_months");
  const [selectedPlanId, setSelectedPlanId] = React.useState<string>("p2p_200_2500");

  // STATIC IP ADDON FOR THE NEW SERVICE
  const [includeStaticIp, setIncludeStaticIp] = React.useState<boolean>(true);
  const [rdnsDomain, setRdnsDomain] = React.useState<string>("gw.kahkeshan-net.ir");
  const [ipUsagePurpose, setIpUsagePurpose] = React.useState<string>("firewall_vpn");

  // Single static IP pricing
  const SINGLE_IP_MONTHLY_RETAIL = 120_000;
  const SINGLE_IP_MONTHLY_PARTNER = 95_000;

  // Destination project site & payment
  const [selectedSiteId, setSelectedSiteId] = React.useState<string>("site_01");
  const [customSiteName, setCustomSiteName] = React.useState<string>("");
  const [customSiteAddress, setCustomSiteAddress] = React.useState<string>("");
  const [paymentMethod, setPaymentMethod] = React.useState<"credit_line" | "sayad_cheque" | "bank_transfer" | "online">("credit_line");
  const [needsTaxInvoice, setNeedsTaxInvoice] = React.useState<boolean>(true);

  // Submission state for new order
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [orderResult, setOrderResult] = React.useState<{
    trackingNumber: string;
    submittedAt: string;
    planName: string;
    speedLabel: string;
    trafficLabel: string;
    cycleLabel: string;
    ipLabel: string;
    rdnsDomain?: string;
    siteLabel: string;
    totalAmount: number;
    savingsAmount: number;
    vatAmount: number;
    paymentLabel: string;
  } | null>(null);
  const [copiedTracking, setCopiedTracking] = React.useState(false);

  // ───────────────────────────────────────────────────────────────────────────
  // TAB 2: BUY STATIC IP FOR AN EXISTING ACTIVE SERVICE
  // ───────────────────────────────────────────────────────────────────────────
  const [targetExistingServiceId, setTargetExistingServiceId] = React.useState<string>(servicesList[0]?.id || "net_srv_01");
  const [existingServiceCycle, setExistingServiceCycle] = React.useState<"1_month" | "3_months" | "6_months" | "12_months">("12_months");
  const [existingServiceRdns, setExistingServiceRdns] = React.useState<string>("srv.kahkeshan-net.ir");
  const [existingServiceUsage, setExistingServiceUsage] = React.useState<string>("firewall_vpn");
  const [existingServicePayment, setExistingServicePayment] = React.useState<"credit_line" | "sayad_cheque" | "bank_transfer" | "online">("credit_line");
  const [isSubmittingExistingIp, setIsSubmittingExistingIp] = React.useState(false);
  const [existingIpSuccess, setExistingIpSuccess] = React.useState<{
    trackingNumber: string;
    assignedIp: string;
    serviceName: string;
    contractNumber: string;
    siteName: string;
    cycleLabel: string;
    totalAmount: number;
  } | null>(null);

  // ───────────────────────────────────────────────────────────────────────────
  // TAB 3: RADIO LOS FEASIBILITY CHECK STATE
  // ───────────────────────────────────────────────────────────────────────────
  const [losCity, setLosCity] = React.useState("تهران");
  const [losCoords, setLosCoords] = React.useState("میدان ونک، خیابان ملاصدرا، برج سپهر");
  const [isCheckingLos, setIsCheckingLos] = React.useState(false);
  const [losResult, setLosResult] = React.useState<{
    hasDirectLineOfSight: boolean;
    popSiteName: string;
    distanceKm: number;
    recommendedDish: string;
    maxThroughputMbps: number;
  } | null>(null);

  // ───────────────────────────────────────────────────────────────────────────
  // CALCULATION LOGIC: NEW INTERNET PLAN & CHECKOUT
  // ───────────────────────────────────────────────────────────────────────────
  // Find current plan
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

  // Pricing calculations for new plan
  const effectiveMonthlyPlan = Math.round((activePlan.partnerMonthlyPrice * (100 - cycleDiscountPercent)) / 100);
  const effectiveMonthlyIp = includeStaticIp
    ? Math.round((SINGLE_IP_MONTHLY_PARTNER * (100 - cycleDiscountPercent)) / 100)
    : 0;

  const planSubtotal = effectiveMonthlyPlan * cycleMonths;
  const ipSubtotal = effectiveMonthlyIp * cycleMonths;
  const subtotalBeforeTax = planSubtotal + ipSubtotal;

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

  // When speed pill is selected, auto-select best plan matching speed
  const handleSelectSpeed = (speed: number) => {
    setSelectedSpeed(speed);
    const plan = MOCK_P2P_PLANS.find((p) => p.speedMbps === speed);
    if (plan) {
      setSelectedPlanId(plan.id);
    }
  };

  // Submit new Internet order
  const handleSubmitNewOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      const tracking = `VLX-P2P-${Math.floor(10000 + Math.random() * 90000)}`;

      // Add to services list
      const newServiceEntry: PartnerInternetService = {
        id: `net_srv_${Date.now()}`,
        serviceName: `${activePlan.name} (${siteDisplayName})`,
        planType: "point_to_point",
        planTypeLabel: "لینک رادیویی اختصاصی (P2P)",
        speedLabel: activePlan.speedLabel,
        siteName: siteDisplayName,
        contractNumber: tracking,
        ipPool: includeStaticIp ? "۱ عدد IP استاتیک اختصاصی (/32)" : "آی‌پی داینامیک استاندارد",
        ipBlockRange: includeStaticIp ? `185.143.232.${Math.floor(10 + Math.random() * 200)}/32` : "Dynamic",
        usableIpsCount: includeStaticIp ? 1 : 0,
        assignedTo: siteDisplayName,
        monthlyFee: effectiveMonthlyPlan + effectiveMonthlyIp,
        partnerDiscountPercent: 20,
        billingCycle: cycleLabel,
        renewalDate: "۱۴۰۴/۰۷/۳۰",
        status: "provisioning",
        statusLabel: "در حال استقرار دکل و کانفیگ رادیویی (۷۲ ساعت)",
        slaPercent: activePlan.sla,
      };

      setServicesList((prev) => [newServiceEntry, ...prev]);

      setOrderResult({
        trackingNumber: tracking,
        submittedAt: new Date().toLocaleDateString("fa-IR"),
        planName: activePlan.name,
        speedLabel: activePlan.speedLabel,
        trafficLabel: activePlan.trafficLabel,
        cycleLabel: cycleLabel,
        ipLabel: includeStaticIp ? "۱ عدد IP استاتیک اختصاصی (/32 RIPE)" : "فاقد آی‌پی استاتیک",
        rdnsDomain: includeStaticIp ? rdnsDomain : undefined,
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
    }, 900);
  };

  // Submit Static IP for an existing service
  const handleSubmitExistingIpOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingExistingIp(true);

    const targetService = servicesList.find((s) => s.id === targetExistingServiceId);

    setTimeout(() => {
      setIsSubmittingExistingIp(false);
      const tracking = `VLX-IP-ATTACH-${Math.floor(10000 + Math.random() * 90000)}`;
      const assignedNewIp = `185.143.232.${Math.floor(20 + Math.random() * 210)}`;

      // Update existing service in the state
      setServicesList((prev) =>
        prev.map((s) => {
          if (s.id === targetExistingServiceId) {
            return {
              ...s,
              ipPool: `۱ عدد IP استاتیک اختصاصی (${assignedNewIp})`,
              ipBlockRange: `${assignedNewIp}/32`,
              usableIpsCount: 1,
            };
          }
          return s;
        })
      );

      const existingDiscountPercent =
        existingServiceCycle === "12_months"
          ? 20
          : existingServiceCycle === "6_months"
          ? 12
          : existingServiceCycle === "3_months"
          ? 5
          : 0;

      const existingMonths =
        existingServiceCycle === "12_months"
          ? 12
          : existingServiceCycle === "6_months"
          ? 6
          : existingServiceCycle === "3_months"
          ? 3
          : 1;

      const existingMonthlyPrice = Math.round((SINGLE_IP_MONTHLY_PARTNER * (100 - existingDiscountPercent)) / 100);
      const existingTotalAmount = existingMonthlyPrice * existingMonths;

      setExistingIpSuccess({
        trackingNumber: tracking,
        assignedIp: assignedNewIp,
        serviceName: targetService?.serviceName || "سرویس اینترنت",
        contractNumber: targetService?.contractNumber || "VLX-NET",
        siteName: targetService?.siteName || "محل نصب",
        cycleLabel:
          existingServiceCycle === "12_months"
            ? "سالانه (۱۲ ماهه)"
            : existingServiceCycle === "6_months"
            ? "۶ ماهه"
            : existingServiceCycle === "3_months"
            ? "۳ ماهه"
            : "ماهانه",
        totalAmount: existingTotalAmount,
      });
    }, 800);
  };

  // Copy tracking number
  const handleCopyTracking = (tracking: string) => {
    navigator.clipboard.writeText(tracking);
    setCopiedTracking(true);
    setTimeout(() => setCopiedTracking(false), 2000);
  };

  // Radio LOS Feasibility
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
    }, 900);
  };

  // Selected service in Tab 2
  const targetExistingService = servicesList.find((s) => s.id === targetExistingServiceId) || servicesList[0];

  return (
    <div className="flex flex-col gap-6 text-right pb-16" dir="rtl">
      {/* ─── 1. Header Hero Banner ───────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl border border-sky-500/30 bg-gradient-to-br from-sky-950/40 via-neutral-900 to-neutral-950 p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-600 to-cyan-500 text-white shadow-lg shadow-sky-600/25 ring-2 ring-sky-500/30">
                <Wifi className="h-7 w-7" />
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-white">
                    اینترنت اختصاصی سازمانی (P2P) و خرید آی‌پی استاتیک
                  </h1>
                  <span className="text-[11px] text-sky-300 bg-sky-500/20 px-2.5 py-0.5 rounded-full border border-sky-500/30 font-bold inline-flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-sky-400 animate-pulse shadow-[0_0_8px_#38bdf8]" />
                    <span>لینک وایرلس متقارن ۱:۱</span>
                  </span>
                  <span className="text-[11px] text-purple-300 bg-purple-500/20 px-2.5 py-0.5 rounded-full border border-purple-500/30 font-bold">
                    آی‌پی استاتیک اختصاصی
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed max-w-3xl">
                  ثبت سفارش اینترنت پوینت‌تو‌پوینت (P2P) متقارن با پینگ زیر ۵ میلی‌ثانیه و آپلود/دانلود برابر، به همراه امکان 
                  <strong> خرید و افزودن مستقیم آی‌پی استاتیک</strong> به خط جدید یا هر یک از خطوط اینترنت فعال سازمانی با تسویه اعتباری.
                </p>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab("buy-ip-existing")}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 cursor-pointer shadow-sm shadow-purple-900/20"
              >
                <Server className="h-4 w-4 text-purple-400" />
                <span>خرید آی‌پی برای سرویس فعال</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("los-check")}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all bg-neutral-800/80 hover:bg-neutral-800 text-neutral-300 border border-neutral-700 cursor-pointer"
              >
                <Radio className="h-4 w-4 text-amber-400" />
                <span>امکان‌سنجی رادیویی (LOS)</span>
              </button>
            </div>
          </div>

          {/* Key Advantages Chips */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3 rounded-2xl bg-neutral-900/70 border border-neutral-800 flex items-center gap-2.5">
              <Zap className="h-4 w-4 text-sky-400 shrink-0" />
              <div className="text-right">
                <span className="text-[11px] text-neutral-400 block">پایداری شبکه:</span>
                <span className="text-xs font-bold text-white">SLA ۹۹.۹۵٪ گلد</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-neutral-900/70 border border-neutral-800 flex items-center gap-2.5">
              <Clock className="h-4 w-4 text-sky-400 shrink-0" />
              <div className="text-right">
                <span className="text-[11px] text-neutral-400 block">پینگ تضمینی:</span>
                <span className="text-xs font-bold text-emerald-400">زیر ۵ میلی‌ثانیه</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-neutral-900/70 border border-neutral-800 flex items-center gap-2.5">
              <CreditCard className="h-4 w-4 text-amber-400 shrink-0" />
              <div className="text-right">
                <span className="text-[11px] text-neutral-400 block">تسویه همکاران:</span>
                <span className="text-xs font-bold text-amber-300">اعتبار ۵۰۰ م.ت / چک</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-purple-950/40 border border-purple-500/30 flex items-center gap-2.5">
              <Server className="h-4 w-4 text-purple-400 shrink-0" />
              <div className="text-right">
                <span className="text-[11px] text-purple-300 block">آی‌پی استاتیک:</span>
                <span className="text-xs font-bold text-purple-200">تخصیص آنی با rDNS</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── 2. Main Navigation Tabs ─────────────────────────────────── */}
      <div className="flex border-b border-neutral-800 gap-1.5 overflow-x-auto pb-px">
        <button
          type="button"
          onClick={() => setActiveTab("order-new")}
          className={`flex items-center gap-2 px-4 sm:px-5 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "order-new"
              ? "border-sky-500 text-sky-400 bg-sky-500/10 rounded-t-xl"
              : "border-transparent text-neutral-400 hover:text-white"
          }`}
        >
          <Wifi className="h-4 w-4" />
          <span>سفارش اینترنت جدید (با IP استاتیک)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("buy-ip-existing")}
          className={`flex items-center gap-2 px-4 sm:px-5 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "buy-ip-existing"
              ? "border-purple-500 text-purple-400 bg-purple-500/10 rounded-t-xl"
              : "border-transparent text-neutral-400 hover:text-white"
          }`}
        >
          <Server className="h-4 w-4 text-purple-400" />
          <span>خرید آی‌پی استاتیک برای سرویس‌های فعال</span>
          <span className="text-[10px] bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded-full font-mono">
            {toPersianDigits(servicesList.length)}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("los-check")}
          className={`flex items-center gap-2 px-4 sm:px-5 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "los-check"
              ? "border-amber-500 text-amber-400 bg-amber-500/10 rounded-t-xl"
              : "border-transparent text-neutral-400 hover:text-white"
          }`}
        >
          <Radio className="h-4 w-4" />
          <span>امکان‌سنجی رادیویی (LOS)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("active-links")}
          className={`flex items-center gap-2 px-4 sm:px-5 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "active-links"
              ? "border-sky-500 text-sky-400 bg-sky-500/10 rounded-t-xl"
              : "border-transparent text-neutral-400 hover:text-white"
          }`}
        >
          <Activity className="h-4 w-4" />
          <span>لینک‌های فعال سازمانی</span>
        </button>
      </div>

      {/* ─── 3. TAB 1: ORDER NEW INTERNET + STATIC IP ─────────────────── */}
      {activeTab === "order-new" && (
        <div className="flex flex-col gap-6">
          {orderResult ? (
            /* Success View */
            <div className="p-6 sm:p-8 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col gap-6 text-right shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400">
                    <CheckCircle2 className="h-7 w-7" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-white">
                      سفارش اینترنت اختصاصی P2P با موفقیت ثبت شد
                    </h3>
                    <p className="text-xs text-neutral-300 mt-1">
                      پیش‌فاکتور رسمی صادر گردید و کارشناس فنی جهت اعزام تیم امکان‌سنجی ظرف ۳۰ دقیقه تماس می‌گیرد.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-neutral-900/90 px-3.5 py-2.5 rounded-xl border border-neutral-800 self-start sm:self-center">
                  <span className="text-xs text-neutral-400">کد رهگیری:</span>
                  <span className="text-sm font-mono font-bold text-sky-400">
                    {orderResult.trackingNumber}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyTracking(orderResult.trackingNumber)}
                    className="text-neutral-400 hover:text-white cursor-pointer mr-1"
                    title="کپی کد رهگیری"
                  >
                    {copiedTracking ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-neutral-950/70 border border-neutral-800 text-xs">
                <div>
                  <span className="text-neutral-400 block mb-1">پلن و سرعت:</span>
                  <span className="font-bold text-white">{orderResult.planName} ({orderResult.speedLabel})</span>
                </div>
                <div>
                  <span className="text-neutral-400 block mb-1">آی‌پی استاتیک:</span>
                  <span className="font-bold text-purple-300">{orderResult.ipLabel}</span>
                  {orderResult.rdnsDomain && (
                    <span className="text-[10px] text-neutral-400 font-mono block mt-0.5">rDNS: {orderResult.rdnsDomain}</span>
                  )}
                </div>
                <div>
                  <span className="text-neutral-400 block mb-1">دوره و شیوه تسویه:</span>
                  <span className="font-bold text-amber-300">{orderResult.cycleLabel}</span>
                </div>
                <div>
                  <span className="text-neutral-400 block mb-1">مبلغ نهایی:</span>
                  <span className="font-bold text-emerald-400 font-mono text-sm">{formatPrice(orderResult.totalAmount)}</span>
                </div>
              </div>

              <div className="flex flex-wrap justify-end gap-3 pt-2">
                <Button
                  onClick={() => setOrderResult(null)}
                  variant="outline"
                  size="sm"
                  className="text-xs border-neutral-700"
                >
                  ثبت سفارش جدید دیگر
                </Button>
                <Button
                  onClick={() => setActiveTab("active-links")}
                  size="sm"
                  className="bg-sky-600 hover:bg-sky-500 text-white text-xs gap-1.5"
                >
                  <span>مشاهده در جدول لینک‌های فعال</span>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            /* Main 2-Column Responsive Configurator */
            <form onSubmit={handleSubmitNewOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Right Column (7 cols): Step-by-Step Configurator */}
              <div className="lg:col-span-7 flex flex-col gap-6">
                
                {/* ── Step 1: Bandwidth Speed & Plan Selector ── */}
                <div className="rounded-3xl border border-neutral-800 bg-neutral-900/60 p-5 sm:p-6 shadow-sm flex flex-col gap-5">
                  <div className="flex items-center justify-between border-b border-neutral-800/80 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-500/20 text-sky-400 font-mono font-bold text-xs">
                        ۱
                      </div>
                      <h2 className="text-sm font-bold text-white">
                        انتخاب پهنای باند و سرعت متقارن P2P:
                      </h2>
                    </div>
                    <span className="text-xs text-neutral-400">ضریب ۱:۱ تضمینی</span>
                  </div>

                  {/* Speed Pill Selector */}
                  <div>
                    <label className="text-xs font-semibold text-neutral-300 block mb-2.5">
                      سرعت اختصاصی (متقارن آپلود و دانلود برابر):
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {[
                        { spd: 50, label: "۵۰ مگ" },
                        { spd: 100, label: "۱۰۰ مگ" },
                        { spd: 200, label: "۲۰۰ مگ ★" },
                        { spd: 300, label: "۳۰۰ مگ" },
                        { spd: 500, label: "۵۰۰ مگ" },
                        { spd: 1000, label: "۱ گیگ" },
                      ].map((item) => (
                        <button
                          key={item.spd}
                          type="button"
                          onClick={() => handleSelectSpeed(item.spd)}
                          className={`px-3 py-2.5 rounded-xl text-xs font-black cursor-pointer transition-all text-center ${
                            selectedSpeed === item.spd
                              ? "bg-sky-500 text-black shadow-md shadow-sky-500/25 ring-2 ring-sky-400"
                              : "bg-neutral-950/80 text-neutral-300 hover:text-white border border-neutral-800 hover:border-neutral-700"
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Active Selected Plan Specs Card */}
                  <div className="rounded-2xl border border-sky-500/30 bg-sky-950/20 p-4.5 flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm sm:text-base font-black text-white">
                            {activePlan.name}
                          </span>
                          {activePlan.isPopular && (
                            <span className="text-[10px] font-black bg-gradient-to-r from-amber-500 to-orange-500 text-black px-2 py-0.5 rounded-full">
                              ★ پرفروش‌ترین همکار
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-neutral-300 mt-1">
                          {activePlan.recommendedFor}
                        </p>
                      </div>

                      <div className="text-left font-mono shrink-0">
                        <span className="text-sm sm:text-base font-black text-white">
                          {formatPrice(effectiveMonthlyPlan)}
                        </span>
                        <span className="text-[10px] text-neutral-400 block font-sans">
                          ماهانه (با تخفیف دوره)
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-neutral-950/70 border border-neutral-800/80 text-xs text-center">
                      <div>
                        <span className="text-[10px] text-neutral-400 block">پینگ تضمینی:</span>
                        <span className="font-bold text-neutral-200 mt-0.5 block">{activePlan.pingGuarantee}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-neutral-400 block">حجم ماهانه:</span>
                        <span className="font-bold text-amber-300 mt-0.5 block">{activePlan.trafficLabel}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-neutral-400 block">پایداری SLA:</span>
                        <span className="font-bold text-emerald-400 mt-0.5 block">{activePlan.sla}</span>
                      </div>
                    </div>

                    {/* Features checklist */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1 text-xs text-neutral-300">
                      {activePlan.features.map((feat, idx) => (
                        <div key={idx} className="flex items-center gap-1.5">
                          <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                          <span className="text-[11px] truncate">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* ── Step 2: Billing Cycle Selector ── */}
                <div className="rounded-3xl border border-neutral-800 bg-neutral-900/60 p-5 sm:p-6 shadow-sm flex flex-col gap-4">
                  <div className="flex items-center justify-between border-b border-neutral-800/80 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-500/20 text-sky-400 font-mono font-bold text-xs">
                        ۲
                      </div>
                      <h2 className="text-sm font-bold text-white">
                        دوره قرارداد و تسویه حساب همکار:
                      </h2>
                    </div>
                    <span className="text-xs text-emerald-400 font-bold">
                      تا ۲۰٪ تخفیف مازاد
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {[
                      { id: "1_month", label: "۱ ماهه", discount: "پایه" },
                      { id: "3_months", label: "۳ ماهه", discount: "۵٪ تخفیف" },
                      { id: "6_months", label: "۶ ماهه", discount: "۱۲٪ تخفیف" },
                      { id: "12_months", label: "سالانه (۱۲ ماه)", discount: "۲۰٪ تخفیف طلایی" },
                    ].map((cycle) => (
                      <button
                        key={cycle.id}
                        type="button"
                        onClick={() => setBillingCycle(cycle.id as any)}
                        className={`p-3 rounded-2xl text-xs cursor-pointer transition-all flex flex-col items-center gap-1 text-center ${
                          billingCycle === cycle.id
                            ? "bg-amber-500 text-black font-black shadow-md shadow-amber-500/20 ring-2 ring-amber-400"
                            : "bg-neutral-950/80 text-neutral-300 hover:text-white border border-neutral-800 hover:border-neutral-700 font-medium"
                        }`}
                      >
                        <span className="font-bold">{cycle.label}</span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                            billingCycle === cycle.id
                              ? "bg-black/20 text-black font-black"
                              : "bg-neutral-900 text-amber-400"
                          }`}
                        >
                          {cycle.discount}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* ── Step 3: STATIC IP CONFIGURATION FOR THIS SERVICE ── */}
                <div className="rounded-3xl border border-purple-500/40 bg-gradient-to-br from-purple-950/20 via-neutral-900/80 to-neutral-950 p-5 sm:p-6 shadow-sm flex flex-col gap-4">
                  <div className="flex items-center justify-between border-b border-purple-500/20 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-purple-500/20 text-purple-400 font-mono font-bold text-xs">
                        ۳
                      </div>
                      <div className="flex items-center gap-2">
                        <Server className="h-4 w-4 text-purple-400" />
                        <h2 className="text-sm font-bold text-white">
                          آی‌پی استاتیک اختصاصی برای این سرویس اینترنت:
                        </h2>
                      </div>
                    </div>
                    <span className="text-[11px] text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20 font-bold font-mono">
                      IPv4 اختصاصی RIPE
                    </span>
                  </div>

                  {/* Radio Choice: Without IP vs With 1 Dedicated Static IP */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Option 1: Without IP */}
                    <div
                      onClick={() => setIncludeStaticIp(false)}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between gap-2 ${
                        !includeStaticIp
                          ? "border-neutral-500 bg-neutral-900 text-white ring-1 ring-neutral-400"
                          : "border-neutral-800 bg-neutral-950/60 text-neutral-400 hover:border-neutral-700"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="staticIpOption"
                          checked={!includeStaticIp}
                          onChange={() => setIncludeStaticIp(false)}
                          className="h-4 w-4 text-neutral-400 focus:ring-0 cursor-pointer"
                        />
                        <span className="text-xs font-bold text-neutral-200">
                          بدون آی‌پی استاتیک
                        </span>
                      </div>
                      <span className="text-[11px] text-neutral-500">
                        استفاده از آدرس داینامیک پیش‌فرض (رایگان)
                      </span>
                    </div>

                    {/* Option 2: 1 Dedicated Static IP (/32) */}
                    <div
                      onClick={() => setIncludeStaticIp(true)}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between gap-2 ${
                        includeStaticIp
                          ? "border-purple-500 bg-purple-950/30 text-white shadow-md shadow-purple-950/30 ring-1 ring-purple-500"
                          : "border-neutral-800 bg-neutral-950/60 text-neutral-400 hover:border-neutral-700"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="staticIpOption"
                            checked={includeStaticIp}
                            onChange={() => setIncludeStaticIp(true)}
                            className="h-4 w-4 text-purple-600 focus:ring-0 cursor-pointer"
                          />
                          <span className="text-xs font-bold text-white">
                            ۱ عدد IP استاتیک اختصاصی (/32)
                          </span>
                        </div>
                        <span className="text-xs font-mono font-bold text-purple-300">
                          {formatPrice(effectiveMonthlyIp)}/ماه
                        </span>
                      </div>
                      <span className="text-[11px] text-neutral-400">
                        تخصیص تمیز در RIPE + قابلیت تنظیم معکوس rDNS
                      </span>
                    </div>
                  </div>

                  {/* Expanded Static IP Settings if Included */}
                  {includeStaticIp && (
                    <div className="p-4 rounded-2xl bg-neutral-950/80 border border-purple-500/20 flex flex-col gap-3.5">
                      <div className="flex items-center gap-2 text-xs font-bold text-purple-300">
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>پیکربندی فنی آدرس آی‌پی برای این خط اینترنت:</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[11px] text-neutral-400 block mb-1">
                            تنظیم نام دامنه Reverse DNS (PTR Record):
                          </label>
                          <input
                            type="text"
                            value={rdnsDomain}
                            onChange={(e) => setRdnsDomain(e.target.value)}
                            placeholder="gw.yourcompany.ir"
                            dir="ltr"
                            className="w-full rounded-xl border border-neutral-800 bg-neutral-900 p-2.5 text-xs text-white placeholder-neutral-600 font-mono focus:border-purple-500 focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] text-neutral-400 block mb-1">
                            مورد مصرف و تجهیز مقصد:
                          </label>
                          <select
                            value={ipUsagePurpose}
                            onChange={(e) => setIpUsagePurpose(e.target.value)}
                            className="w-full rounded-xl border border-neutral-800 bg-neutral-900 p-2.5 text-xs text-white focus:border-purple-500 focus:outline-none"
                          >
                            <option value="firewall_vpn">فایروال FortiGate / میکروتیک و ارتباط شعبه</option>
                            <option value="cctv">انتقال تصویر دوربین‌های مداربسته (NVR/DVR)</option>
                            <option value="mail">میل‌سرور اختصاصی سازمانی (Exchange/Mail)</option>
                            <option value="web_erp">سرور اتوماسیون اداری و پایگاه داده داخلی</option>
                          </select>
                        </div>
                      </div>

                      {/* Notice for blocks / higher counts */}
                      <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-500/20 text-[11px] text-neutral-300 flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />
                        <div className="leading-relaxed">
                          نیاز به ساب‌نت یا بلاک چندتایی آی‌پی (/30، /29، /28) برای این سرویس دارید؟
                          به دلیل ضوابط احراز هویت RIPE، پس از ثبت سفارش می‌توانید از بخش{" "}
                          <Link href="/partner/support" className="text-purple-300 underline font-bold">
                            پشتیبانی مهندسی
                          </Link>{" "}
                          درخواست ارتقا به ساب‌نت ارسال فرمایید.
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* ── Step 4: Installation Site & Project Location ── */}
                <div className="rounded-3xl border border-neutral-800 bg-neutral-900/60 p-5 sm:p-6 shadow-sm flex flex-col gap-4">
                  <div className="flex items-center justify-between border-b border-neutral-800/80 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-500/20 text-sky-400 font-mono font-bold text-xs">
                        ۴
                      </div>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-sky-400" />
                        <h2 className="text-sm font-bold text-white">
                          محل تحویل و استقرار تجهیزات (پروژه مقصد):
                        </h2>
                      </div>
                    </div>
                    <span className="text-xs text-neutral-400">امکان‌سنجی رایگان دکل</span>
                  </div>

                  <select
                    value={selectedSiteId}
                    onChange={(e) => setSelectedSiteId(e.target.value)}
                    className="w-full rounded-xl border border-neutral-800 bg-neutral-950 p-3 text-xs text-white focus:border-sky-500 focus:outline-none"
                  >
                    {MOCK_PARTNER_PROJECT_SITES.map((site) => (
                      <option key={site.id} value={site.id}>
                        {site.name} — {site.city} ({site.address})
                      </option>
                    ))}
                    <option value="custom">+ تعریف پروژه یا کارگاه جدید</option>
                  </select>

                  {selectedSiteId === "custom" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <input
                        type="text"
                        placeholder="نام کارگاه یا شرکت مقصد"
                        value={customSiteName}
                        onChange={(e) => setCustomSiteName(e.target.value)}
                        className="rounded-xl border border-neutral-800 bg-neutral-950 p-2.5 text-xs text-white placeholder-neutral-500 focus:border-sky-500 focus:outline-none"
                      />
                      <input
                        type="text"
                        placeholder="آدرس دقیق و ارتفاع ساختمان"
                        value={customSiteAddress}
                        onChange={(e) => setCustomSiteAddress(e.target.value)}
                        className="rounded-xl border border-neutral-800 bg-neutral-950 p-2.5 text-xs text-white placeholder-neutral-500 focus:border-sky-500 focus:outline-none"
                      />
                    </div>
                  )}
                </div>

                {/* ── Step 5: B2B Payment Method ── */}
                <div className="rounded-3xl border border-neutral-800 bg-neutral-900/60 p-5 sm:p-6 shadow-sm flex flex-col gap-4">
                  <div className="flex items-center justify-between border-b border-neutral-800/80 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-500/20 text-sky-400 font-mono font-bold text-xs">
                        ۵
                      </div>
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-amber-400" />
                        <h2 className="text-sm font-bold text-white">
                          روش تسویه حساب سازمانی B2B:
                        </h2>
                      </div>
                    </div>
                    <span className="text-xs text-neutral-400">خط اعتباری فعال ۵۰۰ م.ت</span>
                  </div>

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
                        desc: "واریز به حساب حقوقی شرکت",
                        badge: "شناسه‌دار",
                      },
                      {
                        id: "online",
                        title: "درگاه پرداخت آنلاین",
                        desc: "کلیه کارت‌های عضو شتاب",
                        badge: "آنی",
                      },
                    ].map((item) => (
                      <div
                        key={item.id}
                        onClick={() => setPaymentMethod(item.id as any)}
                        className={`p-3 rounded-2xl border cursor-pointer transition-all flex flex-col gap-1 ${
                          paymentMethod === item.id
                            ? "border-sky-500 bg-sky-950/30 text-white ring-1 ring-sky-500"
                            : "border-neutral-800 bg-neutral-950/60 text-neutral-400 hover:text-white hover:border-neutral-700"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold">{item.title}</span>
                          <span className="text-[10px] text-sky-400 bg-sky-500/10 px-1.5 py-0.2 rounded font-mono">
                            {item.badge}
                          </span>
                        </div>
                        <span className="text-[11px] text-neutral-400">{item.desc}</span>
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

              {/* Left Column (5 cols): Sticky Live Official Quotation */}
              <div className="lg:col-span-5 sticky top-24 flex flex-col rounded-3xl border border-sky-500/30 bg-neutral-950/90 p-6 shadow-xl backdrop-blur-md gap-5">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-sky-400" />
                    <h3 className="text-sm font-bold text-white">پیش‌فاکتور رسمی پهنای باند و آی‌پی</h3>
                  </div>
                  <span className="text-[11px] text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 font-bold">
                    سطح همکار Tier A
                  </span>
                </div>

                {/* Itemized Breakdown */}
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between items-center text-neutral-300">
                    <span>پلن اینترنت انتخابی:</span>
                    <span className="font-bold text-white">{activePlan.name} ({activePlan.speedLabel})</span>
                  </div>

                  <div className="flex justify-between items-center text-neutral-300">
                    <span>حجم ترافیک ماهانه:</span>
                    <span className="font-bold text-amber-300">{activePlan.trafficLabel}</span>
                  </div>

                  <div className="flex justify-between items-center text-neutral-300">
                    <span>دوره تسویه:</span>
                    <span className="font-bold text-sky-300">
                      {cycleMonths} ماهه ({toPersianDigits(cycleDiscountPercent)}٪ تخفیف)
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-neutral-300">
                    <span>محل استقرار سرویس:</span>
                    <span className="font-medium text-white truncate max-w-[200px]">{siteDisplayName}</span>
                  </div>

                  <div className="pt-2 border-t border-neutral-800/80 flex justify-between items-center text-neutral-300">
                    <span>هزینه پهنای باند دوره:</span>
                    <span className="font-mono font-bold text-white">{formatPrice(planSubtotal)}</span>
                  </div>

                  <div className="flex justify-between items-center text-neutral-300">
                    <span>آی‌پی استاتیک (/32):</span>
                    <span className="font-mono font-bold text-purple-300">
                      {includeStaticIp ? formatPrice(ipSubtotal) : "عدم انتخاب"}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-neutral-800/80 flex justify-between items-center text-amber-400 font-bold">
                    <span>سود تخفیف همکاری Tier A:</span>
                    <span className="font-mono">-{formatPrice(totalPartnerSavings)}</span>
                  </div>

                  {needsTaxInvoice && (
                    <div className="flex justify-between items-center text-neutral-400">
                      <span>مالیات ارزش افزوده (۱۰٪):</span>
                      <span className="font-mono">{formatPrice(vatAmount)}</span>
                    </div>
                  )}
                </div>

                {/* Final Total Price */}
                <div className="pt-3 border-t border-neutral-800 space-y-4">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs font-bold text-neutral-200">مبلغ نهایی قابل پرداخت:</span>
                    <div className="text-left font-mono">
                      <span className="text-xl font-black text-emerald-400">
                        {formatPrice(finalPayableTotal)}
                      </span>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    isLoading={isSubmitting}
                    className="w-full py-4 text-xs font-black bg-sky-600 hover:bg-sky-500 text-white rounded-2xl shadow-lg shadow-sky-600/25 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
                  >
                    <Send className="h-4 w-4" />
                    <span>ثبت سفارش و صدور پیش‌فاکتور رسمی</span>
                  </Button>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-neutral-400 pt-1 text-center">
                    <span className="flex items-center justify-center gap-1 bg-neutral-900/60 py-1 rounded-lg border border-neutral-800/60">
                      <Check className="h-3 w-3 text-emerald-400" />
                      <span>امکان‌سنجی رایگان دکل</span>
                    </span>
                    <span className="flex items-center justify-center gap-1 bg-neutral-900/60 py-1 rounded-lg border border-neutral-800/60">
                      <Check className="h-3 w-3 text-emerald-400" />
                      <span>تحویل مهندسی ۴۸ ساعته</span>
                    </span>
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>
      )}

      {/* ─── 4. TAB 2: BUY STATIC IP FOR EXISTING SERVICES ───────────── */}
      {activeTab === "buy-ip-existing" && (
        <div className="flex flex-col gap-6">
          <div className="rounded-3xl border border-purple-500/30 bg-gradient-to-br from-purple-950/30 via-neutral-900 to-neutral-950 p-6 sm:p-8 shadow-xl">
            <div className="flex items-start gap-4 mb-6">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
                <Server className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-white">
                  خرید و تخصیص مستقیم آی‌پی استاتیک برای خطوط اینترنت فعال سازمانی
                </h2>
                <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
                  سرویس اینترنت فعال مورد نظر را از بین خطوط سازمان خود انتخاب نمایید. یک عدد IP استاتیک اختصاصی تمیز (/32) 
                  مستقیماً بر روی اینترفیس رادیویی یا فیبر نوری آن سرویس فعال خواهد شد.
                </p>
              </div>
            </div>

            {existingIpSuccess ? (
              /* Success Result for IP purchase */
              <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col gap-5 text-right">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
                      <CheckCircle2 className="h-7 w-7" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-white">
                        آی‌پی استاتیک با موفقیت به سرویس متصل گردید
                      </h4>
                      <p className="text-xs text-neutral-300 mt-0.5">
                        آدرس اختصاصی در روتر مرزی پیکربندی شد و در پنل RIPE ثبت گردید.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 bg-neutral-900/80 px-3 py-2 rounded-xl border border-neutral-800">
                    <span className="text-xs text-neutral-400">کد رهگیری:</span>
                    <span className="text-sm font-mono font-bold text-purple-400">
                      {existingIpSuccess.trackingNumber}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-neutral-950/60 border border-neutral-800 text-xs">
                  <div>
                    <span className="text-neutral-400 block mb-1">سرویس مقصد:</span>
                    <span className="font-bold text-white">{existingIpSuccess.serviceName}</span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block mb-1">آی‌پی تخصیص‌یافته:</span>
                    <span className="font-mono font-bold text-purple-300">{existingIpSuccess.assignedIp}/32</span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block mb-1">شماره قرارداد:</span>
                    <span className="font-mono text-neutral-300">{existingIpSuccess.contractNumber}</span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block mb-1">مبلغ پرداختی:</span>
                    <span className="font-mono font-bold text-emerald-400">{formatPrice(existingIpSuccess.totalAmount)}</span>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <Button
                    onClick={() => setExistingIpSuccess(null)}
                    variant="outline"
                    size="sm"
                    className="text-xs border-neutral-700"
                  >
                    خرید آی‌پی برای سرویسی دیگر
                  </Button>
                  <Button
                    onClick={() => setActiveTab("active-links")}
                    size="sm"
                    className="bg-purple-600 hover:bg-purple-500 text-white text-xs gap-1.5"
                  >
                    <span>مشاهده وضعیت لینک‌ها</span>
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitExistingIpOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Right: Select Active Service & Configuration */}
                <div className="lg:col-span-7 flex flex-col gap-6">
                  {/* Step 1: Select Active Service */}
                  <div className="rounded-2xl border border-neutral-800 bg-neutral-950/60 p-5 flex flex-col gap-3.5">
                    <label className="text-xs font-bold text-neutral-200 flex items-center gap-2">
                      <Wifi className="h-4 w-4 text-sky-400" />
                      <span>۱. انتخاب سرویس اینترنت فعال سازمان جهت اتصال آی‌پی:</span>
                    </label>

                    <div className="space-y-2.5">
                      {servicesList.map((service) => {
                        const isSelected = targetExistingServiceId === service.id;
                        return (
                          <div
                            key={service.id}
                            onClick={() => setTargetExistingServiceId(service.id)}
                            className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                              isSelected
                                ? "border-purple-500 bg-purple-950/30 text-white ring-1 ring-purple-500"
                                : "border-neutral-800 bg-neutral-900/60 text-neutral-400 hover:text-white hover:border-neutral-700"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <input
                                type="radio"
                                name="targetServiceSelection"
                                checked={isSelected}
                                onChange={() => setTargetExistingServiceId(service.id)}
                                className="h-4 w-4 text-purple-600 focus:ring-0 cursor-pointer"
                              />
                              <div>
                                <span className="text-xs font-bold text-white block">
                                  {service.serviceName}
                                </span>
                                <div className="flex items-center gap-2 text-[11px] text-neutral-400 mt-0.5">
                                  <span>{service.siteName}</span>
                                  <span>•</span>
                                  <span className="font-mono text-sky-400">{service.contractNumber}</span>
                                </div>
                              </div>
                            </div>

                            <div className="text-left font-mono shrink-0">
                              <span className="text-[11px] text-purple-300 block bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-500/20">
                                {service.ipPool}
                              </span>
                              <span className="text-[10px] text-neutral-500 mt-0.5 block">
                                سرعت: {service.speedLabel}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Step 2: Duration / Billing Cycle */}
                  <div className="rounded-2xl border border-neutral-800 bg-neutral-950/60 p-5 flex flex-col gap-3">
                    <label className="text-xs font-bold text-neutral-200">
                      ۲. دوره اشتراک آی‌پی استاتیک:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { id: "1_month", label: "۱ ماهه" },
                        { id: "3_months", label: "۳ ماهه (۵٪ تخفیف)" },
                        { id: "6_months", label: "۶ ماهه (۱۲٪ تخفیف)" },
                        { id: "12_months", label: "سالانه (۲۰٪ تخفیف)" },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setExistingServiceCycle(item.id as any)}
                          className={`p-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-all text-center ${
                            existingServiceCycle === item.id
                              ? "bg-purple-600 text-white font-bold shadow-md shadow-purple-600/30"
                              : "bg-neutral-900 text-neutral-300 hover:text-white border border-neutral-800"
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Step 3: Technical Configuration (rDNS) */}
                  <div className="rounded-2xl border border-neutral-800 bg-neutral-950/60 p-5 flex flex-col gap-3">
                    <label className="text-xs font-bold text-neutral-200">
                      ۳. مشخصات فنی و Reverse DNS:
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] text-neutral-400 block mb-1">دامنه معکوس rDNS:</label>
                        <input
                          type="text"
                          value={existingServiceRdns}
                          onChange={(e) => setExistingServiceRdns(e.target.value)}
                          dir="ltr"
                          placeholder="vpn.domain.ir"
                          className="w-full rounded-xl border border-neutral-800 bg-neutral-900 p-2.5 text-xs text-white placeholder-neutral-600 font-mono focus:border-purple-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-neutral-400 block mb-1">روش تسویه B2B:</label>
                        <select
                          value={existingServicePayment}
                          onChange={(e) => setExistingServicePayment(e.target.value as any)}
                          className="w-full rounded-xl border border-neutral-800 bg-neutral-900 p-2.5 text-xs text-white focus:border-purple-500 focus:outline-none"
                        >
                          <option value="credit_line">کسر از خط اعتباری ۵۰۰ میلیونی (۴۵ روزه)</option>
                          <option value="sayad_cheque">چک صیادی بنفش</option>
                          <option value="online">درگاه آنلاین شتاب</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Left: Summary and Action */}
                <div className="lg:col-span-5 rounded-2xl border border-purple-500/30 bg-neutral-950 p-6 flex flex-col justify-between gap-6 shadow-xl">
                  <div className="space-y-4 text-xs">
                    <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                      <h4 className="font-bold text-white">فاکتور تخصیص آی‌پی استاتیک</h4>
                      <span className="text-[11px] font-mono text-purple-400">تخصیص اختصاصی /32</span>
                    </div>

                    <div className="space-y-2.5 text-neutral-300">
                      <div className="flex justify-between">
                        <span>سرویس اینترنت مقصد:</span>
                        <span className="font-bold text-white truncate max-w-[200px]">{targetExistingService?.serviceName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>محل نصب:</span>
                        <span className="text-neutral-200">{targetExistingService?.siteName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>قرارداد سرویس:</span>
                        <span className="font-mono text-sky-400">{targetExistingService?.contractNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>تعرفه ماهانه با تخفیف:</span>
                        <span className="font-mono font-bold text-purple-300">
                          {formatPrice(
                            Math.round(
                              (SINGLE_IP_MONTHLY_PARTNER *
                                (100 -
                                  (existingServiceCycle === "12_months"
                                    ? 20
                                    : existingServiceCycle === "6_months"
                                    ? 12
                                    : existingServiceCycle === "3_months"
                                    ? 5
                                    : 0))) /
                                100
                            )
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-neutral-800 space-y-4">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs font-bold text-neutral-200">مبلغ کل دوره:</span>
                      <span className="font-mono text-xl font-black text-emerald-400">
                        {formatPrice(
                          Math.round(
                            (SINGLE_IP_MONTHLY_PARTNER *
                              (100 -
                                (existingServiceCycle === "12_months"
                                  ? 20
                                  : existingServiceCycle === "6_months"
                                  ? 12
                                  : existingServiceCycle === "3_months"
                                  ? 5
                                  : 0))) /
                              100
                          ) *
                            (existingServiceCycle === "12_months"
                              ? 12
                              : existingServiceCycle === "6_months"
                              ? 6
                              : existingServiceCycle === "3_months"
                              ? 3
                              : 1)
                        )}
                      </span>
                    </div>

                    <Button
                      type="submit"
                      isLoading={isSubmittingExistingIp}
                      className="w-full py-3.5 text-xs font-black bg-purple-600 hover:bg-purple-500 text-white rounded-xl shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all"
                    >
                      <Server className="h-4 w-4" />
                      <span>خرید و فعال‌سازی آی‌پی استاتیک برای این سرویس</span>
                    </Button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ─── 5. TAB 3: RADIO LOS FEASIBILITY ─────────────────────────── */}
      {activeTab === "los-check" && (
        <div className="rounded-3xl border border-neutral-800 bg-neutral-900/60 p-6 sm:p-8 shadow-sm flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
              <Radio className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                امکان‌سنجی رادیویی دید مستقیم (Line of Sight - LOS)
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                بررسی خط دید رادیویی بین پشت‌بام کارگاه پروژه و نزدیک‌ترین دکل‌های پاپ‌سایت ماکروویو
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 rounded-2xl bg-neutral-950/60 border border-neutral-800">
            <div>
              <label className="text-xs text-neutral-400 block mb-1 font-medium">شهر یا منطقه صنعتی:</label>
              <input
                type="text"
                value={losCity}
                onChange={(e) => setLosCity(e.target.value)}
                className="w-full rounded-xl border border-neutral-800 bg-neutral-900 p-2.5 text-xs text-white focus:border-sky-500 focus:outline-none"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs text-neutral-400 block mb-1 font-medium">آدرس یا مختصات تقریبی پشت‌بام:</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={losCoords}
                  onChange={(e) => setLosCoords(e.target.value)}
                  className="flex-1 rounded-xl border border-neutral-800 bg-neutral-900 p-2.5 text-xs text-white focus:border-sky-500 focus:outline-none"
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
                  <span className="text-neutral-400 block text-[11px]">تجهیزات پیشنهادی:</span>
                  <span className="font-bold text-amber-300">{losResult.recommendedDish}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── 6. TAB 4: ACTIVE ENTERPRISE SERVICES TABLE ─────────────── */}
      {activeTab === "active-links" && (
        <div className="rounded-3xl border border-neutral-800 bg-neutral-900/60 p-6 sm:p-8 shadow-sm flex flex-col gap-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <Wifi className="h-5 w-5 text-sky-400" />
              <div>
                <h3 className="text-base font-bold text-white">لینک‌های وایرلس و اینترنت فعال در سازمان همکار</h3>
                <span className="text-xs text-neutral-400">
                  {toPersianDigits(servicesList.length)} سرویس سازمانی متصل و تحت نظارت NOC
                </span>
              </div>
            </div>

            <Button
              size="sm"
              onClick={() => setActiveTab("buy-ip-existing")}
              className="bg-purple-600 hover:bg-purple-500 text-white text-xs gap-1.5 self-start sm:self-center"
            >
              <Server className="h-4 w-4" />
              <span>خرید آی‌پی برای یکی از سرویس‌ها</span>
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-neutral-800 text-neutral-400">
                  <th className="pb-3 pr-2 font-medium">شماره قرارداد</th>
                  <th className="pb-3 font-medium">نام سرویس اینترنت</th>
                  <th className="pb-3 font-medium">موقعیت نصب</th>
                  <th className="pb-3 font-medium">پهنای باند</th>
                  <th className="pb-3 font-medium">آی‌پی استاتیک</th>
                  <th className="pb-3 font-medium">شهریه ماهانه</th>
                  <th className="pb-3 font-medium">وضعیت</th>
                  <th className="pb-3 pl-2 font-medium">عملیات IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60">
                {servicesList.map((srv) => (
                  <tr key={srv.id} className="hover:bg-neutral-900/30 transition-colors">
                    <td className="py-3.5 pr-2 font-mono font-bold text-white">{srv.contractNumber}</td>
                    <td className="py-3.5 font-bold text-neutral-200">{srv.serviceName}</td>
                    <td className="py-3.5 text-neutral-300">{srv.siteName}</td>
                    <td className="py-3.5 font-mono text-sky-400 font-bold">{srv.speedLabel}</td>
                    <td className="py-3.5 font-mono text-purple-400">
                      <span className="inline-flex items-center gap-1">
                        <Server className="h-3.5 w-3.5 text-purple-400" />
                        <span>{srv.ipPool}</span>
                      </span>
                    </td>
                    <td className="py-3.5 font-mono text-white">{formatPrice(srv.monthlyFee)}</td>
                    <td className="py-3.5">
                      <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 font-medium whitespace-nowrap">
                        متصل ({srv.slaPercent})
                      </span>
                    </td>
                    <td className="py-3.5 pl-2">
                      <button
                        type="button"
                        onClick={() => {
                          setTargetExistingServiceId(srv.id);
                          setActiveTab("buy-ip-existing");
                        }}
                        className="text-[11px] text-purple-300 hover:text-white bg-purple-500/10 hover:bg-purple-500/20 px-2.5 py-1 rounded-lg border border-purple-500/20 font-medium cursor-pointer transition-colors whitespace-nowrap"
                      >
                        + خرید / تمدید IP
                      </button>
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
