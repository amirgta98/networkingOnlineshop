"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Server,
  Globe2,
  Building2,
  User,
  Phone,
  MapPin,
  CreditCard,
  Check,
  Sparkles,
  ArrowLeft,
  Wallet,
  Plus,
  Radio,
} from "lucide-react";
import { useAuth } from "@/features/auth";
import { useAffiliate } from "@/features/affiliate";
import { partnerProjectsApi } from "@/features/partner/api/partner-projects-api";
import { addressesApi } from "@/features/dashboard/api/addresses-api";
import type { DashboardAddress } from "@/features/dashboard/types/addresses.types";
import type { PartnerProjectSite } from "@/features/partner/types/partner.types";
import {
  InternetPlan,
  BillingCycle,
  InternetSettings,
} from "../types";
import { formatPrice, toPersianDigits } from "@/shared/lib/utils";

interface InternetOrderFormProps {
  plans?: InternetPlan[];
  settings?: InternetSettings;
  selectedPlanId: string;
  billingCycle: BillingCycle;
  onPlanChange: (id: string) => void;
  onBillingCycleChange: (cycle: BillingCycle) => void;
  isPartner?: boolean;
  internetCommissionAmount?: number;
  staticIpCommissionAmount?: number;
}

export function InternetOrderForm({
  plans: propPlans = [],
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

  // Options state
  const [hasStaticIp, setHasStaticIp] = React.useState(false);
  const [selectedSiteId, setSelectedSiteId] = React.useState<string>("");
  const [selectedAddressId, setSelectedAddressId] = React.useState<string>("");

  // Data states
  const [partnerProjects, setPartnerProjects] = React.useState<PartnerProjectSite[]>([]);
  const [userAddresses, setUserAddresses] = React.useState<DashboardAddress[]>([]);
  const [loadingLocations, setLoadingLocations] = React.useState(true);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  // Load registered addresses and partner project sites
  React.useEffect(() => {
    let isMounted = true;
    setLoadingLocations(true);

    const loadData = async () => {
      try {
        const [addrs, projects] = await Promise.all([
          addressesApi.getAddresses().catch(() => []),
          isPartner ? partnerProjectsApi.getMyProjects().catch(() => []) : Promise.resolve([]),
        ]);

        if (!isMounted) return;

        setUserAddresses(addrs || []);
        if (addrs && addrs.length > 0) {
          const def = addrs.find((a) => a.isDefault) || addrs[0];
          setSelectedAddressId(def.id);
        }

        if (projects && projects.length > 0) {
          setPartnerProjects(projects);
          setSelectedSiteId(projects[0].id);
        }
      } catch (err) {
        console.warn("Could not load user locations:", err);
      } finally {
        if (isMounted) setLoadingLocations(false);
      }
    };

    void loadData();

    return () => {
      isMounted = false;
    };
  }, [isPartner]);

  // Active plan lookup
  const activePlan =
    availablePlans.find((p) => p.id === selectedPlanId) || availablePlans[0];

  const cycleMonths =
    billingCycle === "12_months"
      ? 12
      : billingCycle === "6_months"
      ? 6
      : billingCycle === "3_months"
      ? 3
      : 1;

  const cycleDiscountPercent =
    billingCycle === "12_months"
      ? activePlan?.discountYearly ?? 20
      : billingCycle === "6_months"
      ? activePlan?.discountSixMonths ?? 10
      : billingCycle === "3_months"
      ? activePlan?.discountThreeMonths ?? 5
      : 0;

  // Price calculations
  const baseMonthlyPrice = activePlan?.monthlyPrice ?? activePlan?.basePricePerMonth ?? 2000000;
  const monthlyPlanPrice = Math.round((baseMonthlyPrice * (100 - cycleDiscountPercent)) / 100);
  const monthlyIpPrice = hasStaticIp ? defaultStaticIpPrice : 0;
  const totalMonthly = monthlyPlanPrice + monthlyIpPrice;
  const cycleTotal = totalMonthly * cycleMonths;
  const finalPayableTotal = cycleTotal;

  const calculatedTotalCommission =
    internetCommission + (hasStaticIp ? staticIpCommission : 0);
  const commissionPercentageOfTotal =
    finalPayableTotal > 0 ? Math.round((calculatedTotalCommission / finalPayableTotal) * 100) : 0;

  // Proceed to Checkout
  const handleProceedToCheckout = () => {
    setErrorMsg(null);

    const isAdmin = user?.role === "admin" || (user?.role as string) === "super_admin";
    const canBuyInternet = Boolean(user?.canBuyInternet || isAdmin || isPartner);
    if (!canBuyInternet) {
      setErrorMsg("برای خرید اینترنت با شماره تلفن ادمین تماس بگیرید یا تیکت ثبت کنید.");
      return;
    }

    if (!activePlan) {
      setErrorMsg("لطفاً ابتدا یک پلن اینترنت انتخاب فرمایید.");
      return;
    }

    const queryParams = new URLSearchParams({
      planId: activePlan.id,
      cycle: billingCycle,
      hasStaticIp: hasStaticIp ? "true" : "false",
    });

    if (isPartner && selectedSiteId) {
      queryParams.set("siteId", selectedSiteId);
    } else if (selectedAddressId) {
      queryParams.set("addressId", selectedAddressId);
    }

    router.push(`/internet/checkout?${queryParams.toString()}`);
  };

  const handleAddNewProject = () => {
    router.push("/partner/projects?from=internet&action=new");
  };

  return (
    <section id="internet-order-form-box" className="scroll-mt-24 space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col gap-1.5 text-right">
        <div className="inline-flex items-center gap-1.5 self-start text-xs font-bold text-sky-400">
          <CreditCard className="h-4 w-4" />
          <span>سفارش و خرید قطعی اینترنت سازمانی</span>
        </div>
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white">
          پیکربندی پلن و انتقال به تسویه حساب آنلاین
        </h2>
        <p className="text-xs sm:text-sm text-neutral-400 max-w-3xl leading-relaxed">
          مشخصات هویتی و آدرس رانژه شما از قبل در سیستم احراز گردیده است. پلن و دوره مورد نظر خود را نهایی کرده و مستقیماً وارد مرحله تسویه حساب و پرداخت شوید.
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
                پورسانت این سفارش بلافاصله پس از پرداخت و نهایی شدن، در کیف پول شما شارژ خواهد شد.
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

      {/* Main Grid: Config Left (7 cols), Order Summary Right (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Config Box (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-3xl border border-neutral-800 bg-[#121216]/95 p-6 sm:p-8 space-y-6 shadow-xl backdrop-blur-xl">
            {errorMsg && (
              <div className="p-4 rounded-2xl border border-rose-500/40 bg-rose-950/30 text-rose-300 text-xs flex items-center gap-2.5">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* ── Verified Customer & Registered Address Card ──────── */}
            <div className="p-5 rounded-2xl border border-emerald-500/30 bg-emerald-950/15 space-y-3.5">
              <div className="flex items-center justify-between pb-2 border-b border-emerald-500/20">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  <span>مشخصات هویتی و نشانی تاییدشده (عدم نیاز به ورود مجدد)</span>
                </div>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30 font-bold">
                  احراز هویت شده
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="flex items-center gap-2 text-neutral-300">
                  <User className="h-4 w-4 text-neutral-400 shrink-0" />
                  <span>متقاضی: </span>
                  <strong className="text-white font-medium">
                    {user?.name || user?.companyName || "کاربر احراز هویت شده"}
                  </strong>
                </div>

                <div className="flex items-center gap-2 text-neutral-300">
                  <Phone className="h-4 w-4 text-neutral-400 shrink-0" />
                  <span>شماره تماس: </span>
                  <strong className="text-white font-mono" dir="ltr">
                    {user?.phone || "ثبت در پرونده"}
                  </strong>
                </div>

                {user?.companyName && (
                  <div className="flex items-center gap-2 text-neutral-300 sm:col-span-2">
                    <Building2 className="h-4 w-4 text-neutral-400 shrink-0" />
                    <span>شرکت / سازمان: </span>
                    <strong className="text-white font-medium">{user.companyName}</strong>
                  </div>
                )}
              </div>

              {/* Registered Address Selection */}
              <div className="pt-2 border-t border-emerald-500/20">
                <div className="flex items-start gap-2 text-xs text-neutral-300">
                  <MapPin className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <span className="text-neutral-400 block mb-1">نشانی محل نصب و رانژه خط:</span>
                    {loadingLocations ? (
                      <div className="flex items-center gap-2 text-neutral-400 text-xs">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span>در حال استعلام آدرس پرونده...</span>
                      </div>
                    ) : userAddresses.length > 0 ? (
                      <div className="space-y-1.5">
                        {userAddresses.length === 1 ? (
                          <div className="text-white font-medium leading-relaxed bg-neutral-900/80 p-2.5 rounded-xl border border-neutral-800">
                            {userAddresses[0].province}، {userAddresses[0].city} - {userAddresses[0].fullAddress}
                          </div>
                        ) : (
                          <select
                            value={selectedAddressId}
                            onChange={(e) => setSelectedAddressId(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-neutral-900 border border-neutral-800 text-white text-xs focus:border-emerald-500"
                          >
                            {userAddresses.map((addr) => (
                              <option key={addr.id} value={addr.id}>
                                {addr.title ? `${addr.title} - ` : ""}
                                {addr.city}: {addr.fullAddress}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    ) : (
                      <div className="text-white font-medium bg-neutral-900/80 p-2.5 rounded-xl border border-neutral-800">
                        آدرس پیش‌فرض ثبت‌شده در پرونده سازمانی شما
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

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
                    value={selectedPlanId}
                    onChange={(e) => onPlanChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 focus:border-sky-500 text-white text-xs cursor-pointer"
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
                    دوره اشتراک / قرارداد
                  </label>
                  <select
                    value={billingCycle}
                    onChange={(e) => onBillingCycleChange(e.target.value as BillingCycle)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 focus:border-sky-500 text-white text-xs font-bold text-sky-400 cursor-pointer"
                  >
                    <option value="1_month">۱ ماهه (بدون تخفیف)</option>
                    <option value="3_months">۳ ماهه (۵٪ تخفیف دوره)</option>
                    <option value="6_months">۶ ماهه (۱۰٪ تخفیف دوره)</option>
                    <option value="12_months">۱۲ ماهه (۲۰٪ تخفیف طلایی)</option>
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
                    className="flex items-center gap-1 text-[11px] font-bold text-sky-400 hover:text-sky-300 transition-colors cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>افزودن کارگاه جدید</span>
                  </button>
                </div>

                {loadingLocations ? (
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
                          شما هنوز هیچ کارگاهی در پنل همکاران ثبت نکرده‌اید
                        </h4>
                        <p className="text-[11px] text-neutral-300 mt-1 leading-relaxed">
                          جهت تخصیص دقیق خط و دریافت پورسانت، می‌توانید کارگاه مقصد را ثبت نمایید.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddNewProject}
                      className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 cursor-pointer"
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
                      value={selectedSiteId}
                      onChange={(e) => setSelectedSiteId(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 focus:border-purple-500 text-white text-xs cursor-pointer"
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

              <div
                onClick={() => setHasStaticIp((prev) => !prev)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  hasStaticIp
                    ? "border-sky-500 bg-sky-950/20 ring-1 ring-sky-500/40"
                    : "border-neutral-800 bg-neutral-900/60 hover:border-neutral-700"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div
                      className={`h-5 w-5 rounded-md border flex items-center justify-center mt-0.5 transition-colors ${
                        hasStaticIp
                          ? "border-sky-500 bg-sky-500 text-black"
                          : "border-neutral-600 bg-neutral-800"
                      }`}
                    >
                      {hasStaticIp && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                    </div>

                    <div className="space-y-1 text-right">
                      <div className="flex items-center gap-2">
                        <Server className="h-4 w-4 text-sky-400" />
                        <span className="text-xs font-bold text-white">
                          خرید و تخصیص IP استاتیک اختصاصی سازمانی (Static IP)
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-400 leading-relaxed max-w-lg">
                        اختصاص یک آدرس اینترنتی ثابت و پایدار جهت انتقال تصویر دوربین مداربسته، فایروال، پورت‌فورواردینگ، سرور و اتصال شعب.
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

            {/* Bottom Checkout CTA Button */}
            <div className="pt-4 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-right">
                <span className="text-xs text-neutral-400 block">مبلغ نهایی قابل پرداخت:</span>
                <span className="text-base sm:text-lg font-black text-emerald-400 font-mono">
                  {formatPrice(finalPayableTotal)}
                </span>
              </div>

              <button
                type="button"
                onClick={handleProceedToCheckout}
                className="w-full sm:w-auto py-3.5 px-8 rounded-2xl bg-sky-500 hover:bg-sky-400 text-black font-black text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-xl shadow-sky-500/25 transition-all cursor-pointer"
              >
                <CreditCard className="h-4 w-4" />
                <span>خرید و انتقال به صفحه تسویه حساب و پرداخت</span>
                <ArrowLeft className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Order Summary Box (5 cols) */}
        <div className="lg:col-span-5 sticky top-24">
          <div className="rounded-3xl border border-neutral-800 bg-[#141418] p-6 shadow-2xl space-y-5 text-right">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-sky-400" />
                <h3 className="text-sm font-bold text-white">خلاصه فاکتور خرید آنلاین</h3>
              </div>
              <span className="text-[10px] bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                تسویه رسمی
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
              <div className="flex justify-between items-center">
                <span className="text-neutral-400">IP استاتیک:</span>
                <span className={`font-bold ${hasStaticIp ? "text-emerald-400" : "text-neutral-400"}`}>
                  {hasStaticIp ? "دارد (تخصیص رسمی)" : "بدون IP استاتیک"}
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

              {hasStaticIp && (
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
                قابلیت پرداخت از طریق درگاه آنلاین شاپرک، کیف پول اعتباری، اعتبار B2B و حواله بانکی.
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
                  این مبلغ پس از نهایی شدن خرید، مستقیماً به کیف پول شما واریز شده و قابل برداشت نقدی یا تسویه حساب است.
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={handleProceedToCheckout}
              className="w-full py-3.5 px-4 rounded-2xl bg-sky-500 hover:bg-sky-400 text-black font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xl shadow-sky-500/25 transition-all cursor-pointer"
            >
              <CreditCard className="h-4 w-4" />
              <span>خرید و انتقال به صفحه تسویه حساب</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
