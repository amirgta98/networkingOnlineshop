"use client";

import * as React from "react";
import Link from "next/link";
import {
  Server,
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
  Search,
  Wifi,
  Globe2,
  HelpCircle,
  Network,
  Headphones,
  SlidersHorizontal,
} from "lucide-react";
import { useAuth } from "@/features/auth";
import { Button } from "@/shared/components/ui/button";
import { formatPrice, toPersianDigits } from "@/shared/lib/utils";
import {
  MOCK_PARTNER_STATIC_IP_SUBSCRIPTIONS,
  MOCK_PARTNER_PROJECT_SITES,
} from "../data/mock-partner-data";
import type { PartnerStaticIpSubscription } from "../types/partner.types";

export function PartnerStaticIpView() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = React.useState<"order" | "active-ips" | "rdns-guide">("order");

  // User requirement: ONLY 1 IP is sold online!
  // Billing cycle: 1, 3, 6, 12 months
  const [billingCycle, setBillingCycle] = React.useState<"1_month" | "3_months" | "6_months" | "12_months">("12_months");

  // Assignment configuration
  const [intendedUsage, setIntendedUsage] = React.useState<string>("firewall_vpn");
  const [targetSiteId, setTargetSiteId] = React.useState<string>("site_01");
  const [requestRdns, setRequestRdns] = React.useState<boolean>(true);
  const [rdnsDomain, setRdnsDomain] = React.useState<string>("gw.kahkeshan-net.ir");

  // Corporate Payment & B2B Invoicing
  const [paymentMethod, setPaymentMethod] = React.useState<"credit_line" | "sayad_cheque" | "bank_transfer" | "online">("credit_line");
  const [needsTaxInvoice, setNeedsTaxInvoice] = React.useState<boolean>(true);

  // Submission state
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [orderResult, setOrderResult] = React.useState<{
    trackingNumber: string;
    submittedAt: string;
    packageLabel: string;
    cycleLabel: string;
    totalAmount: number;
    savingsAmount: number;
    vatAmount: number;
    paymentLabel: string;
    assignedSite: string;
    rdnsDomain: string;
  } | null>(null);
  const [copiedTracking, setCopiedTracking] = React.useState(false);

  // Active IPs list state
  const [activeIpsList, setActiveIpsList] = React.useState<PartnerStaticIpSubscription[]>(
    MOCK_PARTNER_STATIC_IP_SUBSCRIPTIONS
  );
  const [ipSearchQuery, setIpSearchQuery] = React.useState("");

  // Base pricing for 1 single static IP (/32)
  const baseMonthlyRetail = 120_000;
  const baseMonthlyPartner = 95_000;

  // Billing cycle discount percent
  const cycleDiscountPercent =
    billingCycle === "12_months"
      ? 25
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
      ? "سالانه (۱۲ ماهه - ۲۵٪ تخفیف همکاری)"
      : billingCycle === "6_months"
      ? "۶ ماهه (۱۲٪ تخفیف همکاری)"
      : billingCycle === "3_months"
      ? "۳ ماهه (۵٪ تخفیف همکاری)"
      : "۱ ماهه (تعرفه پایه همکار)";

  // Pricing calculations
  const effectiveMonthlyPartner = Math.round((baseMonthlyPartner * (100 - cycleDiscountPercent)) / 100);
  const cycleSubtotal = effectiveMonthlyPartner * cycleMonths;

  // Retail comparison
  const retailSubtotal = baseMonthlyRetail * cycleMonths;
  const totalPartnerSavings = retailSubtotal - cycleSubtotal;

  const vatAmount = needsTaxInvoice ? Math.round(cycleSubtotal * 0.1) : 0;
  const finalPayableTotal = cycleSubtotal + vatAmount;

  const selectedSite = MOCK_PARTNER_PROJECT_SITES.find((s) => s.id === targetSiteId) || MOCK_PARTNER_PROJECT_SITES[0];

  const handleOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      const trackingCode = `VLX-IP-${Math.floor(10000 + Math.random() * 90000)}`;

      const newSub: PartnerStaticIpSubscription = {
        id: `sub_ip_${Date.now()}`,
        packageLabel: "۱ عدد IP استاتیک اختصاصی (/32 Host)",
        ipCount: 1,
        usableCount: 1,
        subnet: "185.143.232.210/32",
        allocatedIps: ["185.143.232.210"],
        assignedSite: selectedSite.name,
        assignedEquipment:
          intendedUsage === "firewall_vpn"
            ? "فایروال FortiGate / میکروتیک"
            : intendedUsage === "cctv"
            ? "دستگاه NVR / DVR دوربین"
            : intendedUsage === "mail"
            ? "سرور Exchange / میل‌سرور"
            : "سرور داخلی اتوماسیون",
        billingCycle: cycleLabel,
        monthlyFee: effectiveMonthlyPartner,
        status: "active",
        statusLabel: "تخصیص‌یافته و فعال در RIPE",
        rdnsConfigured: requestRdns,
        rdnsDomain: requestRdns ? rdnsDomain : undefined,
        renewalDate: new Date(Date.now() + cycleMonths * 30 * 24 * 60 * 60 * 1000).toLocaleDateString("fa-IR"),
      };

      setActiveIpsList((prev) => [newSub, ...prev]);

      setOrderResult({
        trackingNumber: trackingCode,
        submittedAt: new Date().toLocaleDateString("fa-IR"),
        packageLabel: "۱ عدد IP استاتیک اختصاصی (/32 Host)",
        cycleLabel: cycleLabel,
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
            : "درگاه پرداخت آنلاین",
        assignedSite: selectedSite.name,
        rdnsDomain: requestRdns ? rdnsDomain : "بدون تنظیم rDNS",
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

  const filteredIps = activeIpsList.filter((ip) => {
    if (!ipSearchQuery) return true;
    return (
      ip.packageLabel.includes(ipSearchQuery) ||
      ip.subnet.includes(ipSearchQuery) ||
      ip.assignedSite.includes(ipSearchQuery) ||
      (ip.rdnsDomain && ip.rdnsDomain.includes(ipSearchQuery))
    );
  });

  return (
    <div className="flex flex-col gap-6 text-right" dir="rtl">
      {/* ─── 1. Header Hero Banner ───────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl border border-purple-500/30 bg-gradient-to-br from-purple-950/40 via-[var(--theme-surface)] to-[var(--theme-surface)] p-6 sm:p-8 shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 text-white shadow-lg shadow-purple-600/25 ring-2 ring-purple-500/30">
                <Server className="h-7 w-7" />
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-white">
                    خرید آی‌پی استاتیک اختصاصی (Static IPv4)
                  </h1>
                  <span className="text-[11px] text-purple-300 bg-purple-500/20 px-2.5 py-0.5 rounded-full border border-purple-500/30 font-bold inline-flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-purple-400 animate-pulse shadow-[0_0_8px_#c084fc]" />
                    <span>تخصیص رسمی RIPE</span>
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed max-w-3xl">
                  تخصیص ۱ عدد آدرس IPv4 عمومی تمیز بدون سابقه بلک‌لیست برای اتصال امن فایروال، دوربین‌های مداربسته، میل‌سرور و ERP با تنظیم خودکار رکوردهای معکوس rDNS و PTR.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
              <Link href="/partner/internet">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-sky-500/40 text-sky-300 hover:bg-sky-950/30 text-xs gap-1.5 font-bold"
                >
                  <Wifi className="h-4 w-4 text-sky-400" />
                  <span>خرید اینترنت P2P اختصاصی</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3 rounded-2xl bg-neutral-900/70 border border-neutral-800 flex items-center gap-2.5">
              <ShieldCheck className="h-4 w-4 text-purple-400 shrink-0" />
              <div className="text-right">
                <span className="text-[11px] text-neutral-400 block">ثبت مالکیت:</span>
                <span className="text-xs font-bold text-white">سازمانی در RIPE</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-neutral-900/70 border border-neutral-800 flex items-center gap-2.5">
              <Sparkles className="h-4 w-4 text-fuchsia-400 shrink-0" />
              <div className="text-right">
                <span className="text-[11px] text-neutral-400 block">تنظیمات معکوس:</span>
                <span className="text-xs font-bold text-fuchsia-300">rDNS / PTR خودکار</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-neutral-900/70 border border-neutral-800 flex items-center gap-2.5">
              <Clock className="h-4 w-4 text-sky-400 shrink-0" />
              <div className="text-right">
                <span className="text-[11px] text-neutral-400 block">دوره‌های زمانی:</span>
                <span className="text-xs font-bold text-sky-300">۱، ۳، ۶ و ۱۲ ماه</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-amber-950/40 border border-amber-500/30 flex items-center gap-2.5">
              <Headphones className="h-4 w-4 text-amber-400 shrink-0" />
              <div className="text-right">
                <span className="text-[11px] text-amber-300 block">تعداد بالاتر:</span>
                <span className="text-xs font-bold text-amber-200">ثبت تیکت / تماس</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── 2. Top Navigation Tabs ───────────────────────────────────── */}
      <div className="flex border-b border-neutral-800 gap-2 pb-px">
        <button
          type="button"
          onClick={() => setActiveTab("order")}
          className={`flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === "order"
              ? "border-purple-500 text-purple-400 bg-purple-500/10 rounded-t-xl"
              : "border-transparent text-neutral-400 hover:text-white"
          }`}
        >
          <Server className="h-4 w-4" />
          <span>خرید ۱ عدد آی‌پی استاتیک</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("active-ips")}
          className={`flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === "active-ips"
              ? "border-purple-500 text-purple-400 bg-purple-500/10 rounded-t-xl"
              : "border-transparent text-neutral-400 hover:text-white"
          }`}
        >
          <Network className="h-4 w-4" />
          <span>آی‌پی‌های ثابت فعال ({toPersianDigits(activeIpsList.length)})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("rdns-guide")}
          className={`flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === "rdns-guide"
              ? "border-purple-500 text-purple-400 bg-purple-500/10 rounded-t-xl"
              : "border-transparent text-neutral-400 hover:text-white"
          }`}
        >
          <HelpCircle className="h-4 w-4" />
          <span>راهنمای فنی rDNS و مستندات RIPE</span>
        </button>
      </div>

      {/* ─── 3. TAB 1: ORDER SINGLE STATIC IP ─────────────────────────── */}
      {activeTab === "order" && (
        <div className="flex flex-col gap-8">
          {/* NOTICE FOR HIGHER QUANTITY / BLOCKS (Per User Directive) */}
          <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-950/30 via-neutral-900 to-neutral-900 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
            <div className="flex items-start gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>نیاز به بیش از ۱ عدد آی‌پی استاتیک یا بلاک‌های سازمانی (/30، /29، /28) دارید؟</span>
                </h3>
                <p className="text-xs text-neutral-300 leading-relaxed max-w-3xl">
                  در پرتال آنلاین، فروش مستقیم به <strong>۱ عدد آی‌پی استاتیک اختصاصی</strong> محدود می‌باشد. در صورت نیاز به تعداد بالاتر، ساب‌نت‌های دیتاسنتری یا Route به ASN اختصاصی شرکت، طبق ضوابط RIPE لطفاً تیکت پشتیبانی ارسال فرمایید یا با واحد مهندسی تماس بگیرید تا ظرف کمتر از ۲ ساعت پیش‌فاکتور رسمی صادر گردد.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0 self-start sm:self-center">
              <Link href="/partner/support">
                <Button className="bg-amber-600 hover:bg-amber-500 text-black font-bold text-xs gap-1.5 shadow-md shadow-amber-600/20">
                  <Headphones className="h-3.5 w-3.5" />
                  <span>ثبت تیکت درخواست IP سازمانی</span>
                </Button>
              </Link>
              <a
                href="tel:02191000000"
                className="text-xs text-amber-300 hover:underline font-mono"
              >
                ۰۲۱-۹۱۰۰۰۰۰۰
              </a>
            </div>
          </div>

          {/* MAIN PRODUCT CARD & BILLING CYCLE SELECTOR */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Right: Product & Billing Cycle Selection (7 Cols) */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              {/* Product Card: 1 Static IP */}
              <div className="rounded-3xl border border-purple-500/40 bg-gradient-to-br from-purple-950/20 via-[var(--theme-surface)] to-neutral-900 p-6 shadow-lg flex flex-col gap-5">
                <div className="flex items-start justify-between gap-3 border-b border-neutral-800 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
                      <Server className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-black text-white">
                        ۱ عدد آی‌پی استاتیک اختصاصی (/32 Single Host)
                      </h3>
                      <span className="text-xs text-neutral-400 mt-0.5 block">
                        تخصیص رسمی IPv4 عمومی معتبر بدون قطعی و تغییر آدرس
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 shrink-0">
                    فعال و آماده تحویل
                  </span>
                </div>

                {/* Features List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-neutral-300">
                  <div className="p-3 rounded-2xl bg-neutral-900/70 border border-neutral-800 flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>انتقال تصویر دوربین‌های مداربسته (CCTV)</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-neutral-900/70 border border-neutral-800 flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>اتصال فایروال، VPN و ریموت دسکتاپ (RDP)</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-neutral-900/70 border border-neutral-800 flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>تنظیم رکوردهای معکوس rDNS / PTR</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-neutral-900/70 border border-neutral-800 flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>آی‌پی تمیز بدون سابقه بلک‌لیست جهانی</span>
                  </div>
                </div>

                {/* Billing Cycle Selector */}
                <div className="pt-2">
                  <label className="text-xs font-bold text-neutral-200 block mb-3">
                    انتخاب دوره اشتراک (۱، ۳، ۶ یا ۱۲ ماهه):
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {[
                      {
                        id: "1_month",
                        label: "۱ ماهه",
                        discount: "عادی",
                        effective: 95_000,
                      },
                      {
                        id: "3_months",
                        label: "۳ ماهه",
                        discount: "۵٪ تخفیف",
                        effective: 90_250,
                      },
                      {
                        id: "6_months",
                        label: "۶ ماهه",
                        discount: "۱۲٪ تخفیف",
                        effective: 83_600,
                      },
                      {
                        id: "12_months",
                        label: "سالانه",
                        discount: "۲۵٪ تخفیف",
                        effective: 71_250,
                      },
                    ].map((cycle) => (
                      <button
                        key={cycle.id}
                        type="button"
                        onClick={() => setBillingCycle(cycle.id as any)}
                        className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                          billingCycle === cycle.id
                            ? "border-purple-500 bg-purple-950/40 text-white shadow-md shadow-purple-500/20 ring-1 ring-purple-500"
                            : "border-neutral-800 bg-neutral-900/60 text-neutral-400 hover:text-white"
                        }`}
                      >
                        <span className="text-xs font-black block text-white">{cycle.label}</span>
                        <span className="text-[10px] text-amber-400 font-bold block mt-0.5">{cycle.discount}</span>
                        <span className="text-[11px] font-mono font-bold text-purple-300 block mt-1.5">
                          {formatPrice(cycle.effective)}/ماه
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Assignment & Reverse DNS Settings */}
              <div className="rounded-3xl border border-neutral-800 bg-neutral-900/50 p-6 flex flex-col gap-4">
                <h4 className="text-xs font-bold text-white flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-400" />
                  <span>تنظیمات فنی و ثبت معکوس (Reverse DNS):</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-neutral-400 block mb-1">نوع کاربری آی‌پی استاتیک:</label>
                    <select
                      value={intendedUsage}
                      onChange={(e) => setIntendedUsage(e.target.value)}
                      className="w-full rounded-xl border border-neutral-800 bg-neutral-950 p-2.5 text-xs text-white focus:border-purple-500 focus:outline-none"
                    >
                      <option value="firewall_vpn">فایروال، روتر و تونل VPN شعبه</option>
                      <option value="cctv">انتقال تصویر دوربین‌های مداربسته (CCTV)</option>
                      <option value="mail">میل‌سرور اختصاصی سازمانی (Mail Server)</option>
                      <option value="erp">سیستم حسابداری و اتوماسیون داخلی (ERP)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-neutral-400 block mb-1">موقعیت و کارگاه مقصد:</label>
                    <select
                      value={targetSiteId}
                      onChange={(e) => setTargetSiteId(e.target.value)}
                      className="w-full rounded-xl border border-neutral-800 bg-neutral-950 p-2.5 text-xs text-white focus:border-purple-500 focus:outline-none"
                    >
                      {MOCK_PARTNER_PROJECT_SITES.map((site) => (
                        <option key={site.id} value={site.id}>
                          {site.name} ({site.city})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="pt-2 border-t border-neutral-800/80 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <input
                      id="requestRdnsCheckbox"
                      type="checkbox"
                      checked={requestRdns}
                      onChange={(e) => setRequestRdns(e.target.checked)}
                      className="h-4 w-4 rounded border-neutral-700 bg-neutral-900 text-purple-600 focus:ring-purple-500 cursor-pointer"
                    />
                    <label htmlFor="requestRdnsCheckbox" className="text-xs text-neutral-200 cursor-pointer">
                      ثبت خودکار رکورد Reverse DNS (rDNS / PTR) در سرورهای ققنوس آکادمی
                    </label>
                  </div>

                  {requestRdns && (
                    <div className="pt-1">
                      <label className="text-[11px] text-neutral-400 block mb-1">نام هاست / دامنه معکوس (FQDN):</label>
                      <input
                        type="text"
                        dir="ltr"
                        value={rdnsDomain}
                        onChange={(e) => setRdnsDomain(e.target.value)}
                        placeholder="e.g. vpn.yourcompany.ir"
                        className="w-full rounded-xl border border-neutral-800 bg-neutral-950 p-2.5 text-xs font-mono text-purple-300 focus:border-purple-500 focus:outline-none"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="rounded-3xl border border-neutral-800 bg-neutral-900/50 p-6 flex flex-col gap-3">
                <label className="text-xs font-bold text-neutral-200 flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-amber-400" />
                  <span>نحوه تسویه حساب B2B:</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    {
                      id: "credit_line",
                      title: "خط اعتباری ۵۰۰ میلیونی",
                      desc: "تسویه ۴۵ روزه",
                    },
                    {
                      id: "sayad_cheque",
                      title: "چک صیادی بنفش",
                      desc: "سامانه پیچک",
                    },
                    {
                      id: "bank_transfer",
                      title: "حواله ساتنا / پایا",
                      desc: "واریز شناسه دار",
                    },
                    {
                      id: "online",
                      title: "درگاه پرداخت شتاب",
                      desc: "تسویه آنلاین",
                    },
                  ].map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setPaymentMethod(item.id as any)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        paymentMethod === item.id
                          ? "border-purple-500 bg-purple-950/30 text-white"
                          : "border-neutral-800 bg-neutral-900/60 text-neutral-400 hover:text-white"
                      }`}
                    >
                      <span className="text-xs font-bold block">{item.title}</span>
                      <span className="text-[11px] text-neutral-400 block mt-0.5">{item.desc}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-neutral-800/80">
                  <input
                    id="taxInvoiceStaticIp"
                    type="checkbox"
                    checked={needsTaxInvoice}
                    onChange={(e) => setNeedsTaxInvoice(e.target.checked)}
                    className="h-4 w-4 rounded border-neutral-700 bg-neutral-900 text-purple-600 focus:ring-purple-500 cursor-pointer"
                  />
                  <label htmlFor="taxInvoiceStaticIp" className="text-xs text-neutral-300 cursor-pointer">
                    صدور صورتحساب رسمی در سامانه مودیان مالیاتی (۱۰٪ ارزش افزوده)
                  </label>
                </div>
              </div>
            </div>

            {/* Left: Live Official Invoice & Checkout (5 Cols) */}
            <div className="lg:col-span-5 flex flex-col justify-between p-6 rounded-3xl border border-purple-500/30 bg-neutral-950/80 gap-6">
              {orderResult ? (
                <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col gap-4 text-right">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-8 w-8 text-emerald-400 shrink-0" />
                    <div>
                      <h4 className="text-sm font-bold text-white">سفارش آی‌پی استاتیک ثبت گردید</h4>
                      <span className="text-[11px] text-neutral-300">تخصیص در مرکز RIPE انجام شد</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-neutral-900/80 border border-neutral-800 text-xs font-mono space-y-1">
                    <div className="flex justify-between text-neutral-400">
                      <span>کد رهگیری:</span>
                      <span className="text-purple-400 font-bold">{orderResult.trackingNumber}</span>
                    </div>
                    <div className="flex justify-between text-neutral-400">
                      <span>مبلغ نهایی:</span>
                      <span className="text-emerald-400 font-bold">{formatPrice(orderResult.totalAmount)}</span>
                    </div>
                  </div>

                  <Button
                    onClick={() => setOrderResult(null)}
                    size="sm"
                    variant="outline"
                    className="w-full text-xs border-neutral-700"
                  >
                    ثبت سفارش آی‌پی جدید
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleOrderSubmit} className="flex flex-col justify-between h-full gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                      <h4 className="text-sm font-bold text-white">پیش‌فاکتور رسمی ۱ عدد آی‌پی استاتیک</h4>
                      <span className="text-[11px] text-purple-400 font-mono">B2B Tier A</span>
                    </div>

                    <div className="space-y-2.5 text-xs">
                      <div className="flex justify-between text-neutral-300">
                        <span>نوع سرویس:</span>
                        <span className="font-bold text-white">۱ عدد IP اختصاصی (/32)</span>
                      </div>

                      <div className="flex justify-between text-neutral-300">
                        <span>دوره زمانی:</span>
                        <span className="font-bold text-purple-300">{cycleMonths} ماهه ({toPersianDigits(cycleDiscountPercent)}٪ تخفیف)</span>
                      </div>

                      <div className="flex justify-between text-neutral-300">
                        <span>هزینه پایه آزاد:</span>
                        <span className="font-mono line-through text-neutral-500">{formatPrice(retailSubtotal)}</span>
                      </div>

                      <div className="flex justify-between text-neutral-300">
                        <span>هزینه دوره همکار:</span>
                        <span className="font-mono font-bold text-white">{formatPrice(cycleSubtotal)}</span>
                      </div>

                      <div className="pt-2 border-t border-neutral-800 flex justify-between text-amber-400 font-bold">
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
                      className="w-full py-4 text-xs font-black bg-purple-600 hover:bg-purple-500 text-white rounded-xl shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Send className="h-4 w-4" />
                      <span>ثبت سفارش و تخصیص آی‌پی استاتیک</span>
                    </Button>

                    <div className="flex items-center justify-center gap-4 text-[11px] text-neutral-400 pt-1">
                      <span className="flex items-center gap-1">
                        <Check className="h-3 w-3 text-emerald-400" />
                        <span>تحویل آنی در شبکه</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <Check className="h-3 w-3 text-emerald-400" />
                        <span>ثبت رسمی RIPE</span>
                      </span>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── 4. TAB 2: ACTIVE IPS TABLE ──────────────────────────────── */}
      {activeTab === "active-ips" && (
        <div className="rounded-3xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] p-6 sm:p-8 shadow-sm flex flex-col gap-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Server className="h-5 w-5 text-purple-400" />
              <h3 className="text-base font-bold text-white">آدرس‌های آی‌پی استاتیک فعال سازمانی</h3>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="absolute right-3 top-2.5 h-4 w-4 text-neutral-500" />
              <input
                type="text"
                placeholder="جستجوی ساب‌نت، دامنه یا سایت..."
                value={ipSearchQuery}
                onChange={(e) => setIpSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-neutral-800 bg-neutral-900 pr-9 pl-3 py-2 text-xs text-white placeholder-neutral-500 focus:border-purple-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-neutral-800 text-neutral-400">
                  <th className="pb-3 pr-2 font-medium">سرویس IP</th>
                  <th className="pb-3 font-medium">آدرس / ساب‌نت</th>
                  <th className="pb-3 font-medium">سایت مقصد</th>
                  <th className="pb-3 font-medium">رکورد rDNS</th>
                  <th className="pb-3 font-medium">دوره تسویه</th>
                  <th className="pb-3 font-medium">سررسید تمدید</th>
                  <th className="pb-3 font-medium">وضعیت</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60">
                {filteredIps.map((ip) => (
                  <tr key={ip.id} className="hover:bg-neutral-900/30 transition-colors">
                    <td className="py-3.5 pr-2 font-bold text-white">{ip.packageLabel}</td>
                    <td className="py-3.5 font-mono text-purple-400 font-bold">{ip.subnet}</td>
                    <td className="py-3.5 text-neutral-300">{ip.assignedSite}</td>
                    <td className="py-3.5 font-mono text-neutral-400">
                      {ip.rdnsConfigured ? (
                        <span className="text-emerald-400">فعال ✓</span>
                      ) : (
                        <span className="text-neutral-500">ثبت‌نشده</span>
                      )}
                    </td>
                    <td className="py-3.5 text-neutral-300">{ip.billingCycle}</td>
                    <td className="py-3.5 font-mono text-neutral-400">{ip.renewalDate}</td>
                    <td className="py-3.5">
                      <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 font-medium">
                        {ip.statusLabel}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── 5. TAB 3: RDNS TECHNICAL GUIDE ───────────────────────────── */}
      {activeTab === "rdns-guide" && (
        <div className="rounded-3xl border border-[var(--theme-border-color)] bg-[var(--theme-surface)] p-6 sm:p-8 shadow-sm flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-500/15 text-purple-400 border border-purple-500/30">
              <HelpCircle className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                راهنمای Reverse DNS (rDNS) و مستندات ثبت RIPE
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                نحوه عملکرد رکوردهای PTR برای ارسال بدون اسپم ایمیل‌های شرکتی و اتصال معتبر VPN
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-2">
              <h4 className="font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-purple-400" />
                <span>چرا تنظیم rDNS برای شرکت‌ها حیاتی است؟</span>
              </h4>
              <p className="text-neutral-300 leading-relaxed text-[11px]">
                رکوردهای معکوس DNS تضمین می‌کنند که آدرس IP شما به یک نام دامنه رسمی تعلق دارد. بدون rDNS، ایمیل‌های ارسالی از میل‌سرور سازمان شما توسط جیمیل و مایکروسافت اسپم شناسایی می‌شوند.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-2">
              <h4 className="font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-purple-400" />
                <span>مدت زمان فعال‌سازی و انتشار در DNSهای جهانی</span>
              </h4>
              <p className="text-neutral-300 leading-relaxed text-[11px]">
                پس از ثبت سفارش در پرتال همکاران ققنوس آکادمی، رکوردهای PTR مستقیماً در نیم‌سرورهای مرجع ثبت شده و ظرف حداکثر ۱۵ دقیقه در سراسر جهان منتشر می‌گردند.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
