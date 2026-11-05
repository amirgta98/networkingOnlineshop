"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Globe2,
  Server,
  Building2,
  User,
  Phone,
  MapPin,
  CreditCard,
  Wallet,
  Landmark,
  FileCheck,
  CheckCircle2,
  ShieldCheck,
  Lock,
  ArrowRight,
  ArrowLeft,
  Copy,
  Check,
  Printer,
  Sparkles,
  AlertCircle,
  Loader2,
  Calendar,
  CheckSquare,
  Square,
  PackageCheck,
  ExternalLink,
} from "lucide-react";
import { Container } from "@/shared/components/ui/container";
import { Button } from "@/shared/components/ui/button";
import { useAuth } from "@/features/auth";
import { useAffiliate } from "@/features/affiliate";
import { formatPrice, toPersianDigits } from "@/shared/lib/utils";
import { addressesApi } from "@/features/dashboard/api/addresses-api";
import { walletApi } from "@/features/dashboard/api/wallet-api";
import { partnerProjectsApi } from "@/features/partner/api/partner-projects-api";
import type { DashboardAddress } from "@/features/dashboard/types/addresses.types";
import type { PartnerProjectSite } from "@/features/partner/types/partner.types";
import { UnifiedPaymentSelector, paymentApi } from "@/features/payment";
import { internetApi } from "../api/internet-api";
import type {
  InternetPlan,
  InternetSettings,
  BillingCycle,
  InternetOrder,
} from "../types";

export function InternetCheckoutClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, status } = useAuth();
  const affiliate = useAffiliate();

  // Search params state
  const paramPlanId = searchParams.get("planId") || "";
  const paramCycle = (searchParams.get("cycle") as BillingCycle) || "12_months";
  const paramStaticIp = searchParams.get("hasStaticIp") === "true";
  const paramSiteId = searchParams.get("siteId") || searchParams.get("addressId") || "";

  // Data states
  const [plans, setPlans] = React.useState<InternetPlan[]>([]);
  const [settings, setSettings] = React.useState<InternetSettings | null>(null);
  const [addresses, setAddresses] = React.useState<DashboardAddress[]>([]);
  const [partnerSites, setPartnerSites] = React.useState<PartnerProjectSite[]>([]);
  const [walletBalance, setWalletBalance] = React.useState<number>(0);
  const [isLoadingInitial, setIsLoadingInitial] = React.useState(true);

  // Selected config
  const [selectedPlanId, setSelectedPlanId] = React.useState<string>(paramPlanId);
  const [billingCycle, setBillingCycle] = React.useState<BillingCycle>(paramCycle);
  const [hasStaticIp, setHasStaticIp] = React.useState<boolean>(paramStaticIp);
  const [selectedAddressId, setSelectedAddressId] = React.useState<string>(paramSiteId);
  const [paymentMethod, setPaymentMethod] = React.useState<string>("online_gateway");
  const [selectedGatewayId, setSelectedGatewayId] = React.useState<string>("");
  const [selectedBankAccountId, setSelectedBankAccountId] = React.useState<string>("");
  const [receiptUrl, setReceiptUrl] = React.useState<string>("");
  const [receiptNumber, setReceiptNumber] = React.useState<string>("");

  // Submission & Result state
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [orderResult, setOrderResult] = React.useState<InternetOrder | null>(null);
  const [copiedTracking, setCopiedTracking] = React.useState(false);
  const [copiedSheba, setCopiedSheba] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  const isPartner = Boolean(
    affiliate.isPartner ||
    user?.role === "partner" ||
    (user?.role as string) === "partner_b2b" ||
    user?.isPartner
  );
  const isAdmin = user?.role === "admin" || (user?.role as string) === "super_admin";
  const canBuyInternet = Boolean(user?.canBuyInternet || isAdmin || isPartner);

  // Load initial data
  React.useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const [apiPlans, apiSettings, apiAddresses, apiWallet] = await Promise.all([
          internetApi.getPlans().catch(() => []),
          internetApi.getSettings().catch(() => null),
          addressesApi.getAddresses().catch(() => []),
          walletApi.getMyWallet().catch(() => null),
        ]);

        if (!isMounted) return;

        setPlans(apiPlans || []);
        setSettings(apiSettings);
        setAddresses(apiAddresses || []);
        if (apiWallet && apiWallet.balance !== undefined) {
          setWalletBalance(Number(apiWallet.balance) || 0);
        }

        // Set default plan if needed
        if (apiPlans && apiPlans.length > 0) {
          if (!selectedPlanId || !apiPlans.some((p) => p.id === selectedPlanId)) {
            const featured = apiPlans.find((p) => p.isFeatured) || apiPlans[0];
            setSelectedPlanId(featured.id);
          }
        }

        // Set default address
        if (apiAddresses && apiAddresses.length > 0 && !selectedAddressId) {
          const defAddr = apiAddresses.find((a) => a.isDefault) || apiAddresses[0];
          setSelectedAddressId(defAddr.id);
        }

        // If partner, also load partner project sites
        if (isPartner) {
          try {
            const sites = await partnerProjectsApi.getMyProjects();
            if (isMounted && sites && sites.length > 0) {
              setPartnerSites(sites);
              if (!selectedAddressId) {
                setSelectedAddressId(sites[0].id);
              }
            }
          } catch {}
        }
      } catch (err) {
        console.warn("Error loading checkout data:", err);
      } finally {
        if (isMounted) setIsLoadingInitial(false);
      }
    }

    if (status !== "loading") {
      void loadData();
    }

    return () => {
      isMounted = false;
    };
  }, [status, isPartner]);

  // Selected plan calculation
  const activePlan = plans.find((p) => p.id === selectedPlanId) || plans[0];

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

  const baseMonthly = Number(activePlan?.monthlyPrice || 2000000);
  const discountedMonthly = Math.round((baseMonthly * (100 - cycleDiscountPercent)) / 100);
  const planCycleTotal = discountedMonthly * cycleMonths;
  const baseCycleTotal = baseMonthly * cycleMonths;
  const discountTotal = baseCycleTotal - planCycleTotal;

  const staticIpBaseMonthly = settings?.staticIpMonthlyPrice ?? 250000;
  const staticIpDiscountedMonthly = Math.round((staticIpBaseMonthly * (100 - cycleDiscountPercent)) / 100);
  const staticIpCycleTotal = hasStaticIp ? staticIpDiscountedMonthly * cycleMonths : 0;

  const finalPayableTotal = planCycleTotal + staticIpCycleTotal;

  const internetCommission = settings?.partnerInternetCommission ?? affiliate.effectiveInternetCommission ?? 400000;
  const staticIpCommission = settings?.partnerStaticIpCommission ?? affiliate.effectiveStaticIpCommission ?? 150000;
  const partnerTotalCommission = internetCommission + (hasStaticIp ? staticIpCommission : 0);

  // Selected address lookup
  const selectedAddress =
    addresses.find((a) => a.id === selectedAddressId) ||
    partnerSites.find((p) => p.id === selectedAddressId) ||
    addresses[0];

  // Copy helpers
  const handleCopyTracking = () => {
    if (orderResult) {
      navigator.clipboard.writeText(orderResult.trackingCode);
      setCopiedTracking(true);
      setTimeout(() => setCopiedTracking(false), 2000);
    }
  };

  const handleCopySheba = () => {
    navigator.clipboard.writeText("IR890120000000001234567890");
    setCopiedSheba(true);
    setTimeout(() => setCopiedSheba(false), 2000);
  };

  // Submit Order & Execute Payment
  const handleConfirmAndPay = async () => {
    setErrorMsg(null);

    if (!user) {
      router.push(`/login?redirect=/internet/checkout?planId=${selectedPlanId}&cycle=${billingCycle}&hasStaticIp=${hasStaticIp}`);
      return;
    }

    if (!canBuyInternet) {
      setErrorMsg("امکان خرید مستقیم اینترنت برای حساب شما غیرفعال است. لطفاً جهت استعلام خط با پشتیبانی تماس بگیرید.");
      return;
    }

    if (!activePlan) {
      setErrorMsg("پلن اینترنت معتبر انتخاب نشده است.");
      return;
    }

    if (paymentMethod === "wallet" && walletBalance < finalPayableTotal) {
      setErrorMsg(`موجودی کیف پول شما (${formatPrice(walletBalance)}) کمتر از مبلغ فاکتور (${formatPrice(finalPayableTotal)}) است.`);
      return;
    }

    if ((paymentMethod === "card_to_card" || paymentMethod === "bank_transfer") && !receiptUrl) {
      setErrorMsg("برای روش پرداخت کارت به کارت، بارگذاری تصویر یا عکس فیش واریز الزامی است.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      // 1. Create order in real backend
      const order = await internetApi.createOrder({
        planId: activePlan.id,
        siteId: selectedAddress?.id,
        serviceDurationMonths: cycleMonths,
        hasStaticIp,
        paymentMethod,
      });

      // 2. Execute unified payment via backend
      const payRes = await paymentApi.initiatePayment({
        targetType: "INTERNET_ORDER",
        targetId: order.id,
        paymentMethod: paymentMethod as any,
        amount: finalPayableTotal,
        gatewayId: selectedGatewayId || undefined,
        bankAccountId: selectedBankAccountId || undefined,
        receiptUrl: receiptUrl || undefined,
        receiptNumber: receiptNumber || undefined,
        callbackUrl: typeof window !== "undefined" ? `${window.location.origin}/payment/callback` : undefined,
      });

      // 3. Handle response based on payment method
      if (payRes?.paymentMethod === "online_gateway" && payRes?.paymentUrl) {
        let targetUrl = payRes.paymentUrl;
        if (targetUrl.startsWith("/")) {
          const apiBase = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001")
            .replace(/\/api\/v1\/?$/, "")
            .replace(/\/$/, "");
          targetUrl = `${apiBase}${targetUrl}`;
        }
        window.location.href = targetUrl;
        return;
      }

      if (payRes?.order) {
        setOrderResult(payRes.order);
      } else {
        setOrderResult(order);
      }

      if (payRes?.paymentMethod === "wallet") {
        setWalletBalance((prev) => Math.max(0, prev - finalPayableTotal));
      }

      // Scroll to top
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "خطایی در ثبت و پرداخت سفارش رخ داد. لطفاً مجدداً تلاش فرمایید.";
      setErrorMsg(Array.isArray(msg) ? msg.join(" - ") : msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === "loading" || isLoadingInitial) {
    return (
      <div className="py-24 text-center max-w-md mx-auto space-y-4" dir="rtl">
        <Loader2 className="h-10 w-10 animate-spin text-sky-400 mx-auto" />
        <p className="text-xs text-neutral-400">در حال بارگذاری اطلاعات خرید و استعلام خط اینترنت...</p>
      </div>
    );
  }

  // ─── IF ORDER COMPLETED: Show Registered Order View ──────────────────────
  if (orderResult) {
    const isPaid = orderResult.status === "ACTIVE" || paymentMethod === "wallet";
    return (
      <Container className="py-8 sm:py-12" dir="rtl">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Success Banner */}
          <div className="rounded-3xl border-2 border-emerald-500/50 bg-gradient-to-br from-emerald-950/40 via-neutral-900 to-neutral-950 p-6 sm:p-8 shadow-2xl text-right space-y-6 animate-in fade-in duration-300">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="h-9 w-9" />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                  {isPaid ? "سفارش پرداخت و ثبت نهایی شد" : "سفارش با موفقیت در سامانه ثبت گردید"}
                </span>
                <h1 className="text-xl sm:text-2xl font-black text-white">
                  سفارش اینترنت سازمانی با موفقیت ثبت شد
                </h1>
                <p className="text-xs sm:text-sm text-neutral-300">
                  {isPaid
                    ? "اشتراک اینترنت شما فعال شد و کارشناسان فنی NOC در حال اعمال کانفیگ خط می‌باشند."
                    : "سفارش شما در وضعیت بررسی مالی ثبت شد و پس از تأیید واریز، سرویس رانژه می‌گردد."}
                </p>
              </div>
            </div>

            {/* Tracking Code Card */}
            <div className="p-4 sm:p-5 rounded-2xl bg-neutral-900/90 border border-emerald-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs text-neutral-400 block mb-1">کد رهگیری رسمی سفارش اینترنت:</span>
                <span className="text-2xl font-mono font-black text-emerald-400 tracking-wider">
                  {orderResult.trackingCode}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyTracking}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-bold transition-all cursor-pointer"
              >
                {copiedTracking ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                <span>{copiedTracking ? "کپی شد" : "کپی کد رهگیری"}</span>
              </button>
            </div>

            {/* Detailed Order Specs */}
            <div className="p-5 rounded-2xl bg-neutral-950/70 border border-neutral-800 text-xs space-y-3">
              <h3 className="text-sm font-bold text-white border-b border-neutral-800 pb-2 flex items-center gap-2">
                <Globe2 className="h-4 w-4 text-sky-400" />
                <span>مشخصات سرویس اینترنت ثبت‌شده</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="flex justify-between py-1 border-b border-neutral-800/50">
                  <span className="text-neutral-400">پلن خریداری‌شده:</span>
                  <span className="font-bold text-white">{orderResult.plan?.title || activePlan?.title || "پلن سازمانی"}</span>
                </div>

                <div className="flex justify-between py-1 border-b border-neutral-800/50">
                  <span className="text-neutral-400">مدت دوره قرارداد:</span>
                  <span className="font-bold text-sky-400">
                    {orderResult.serviceDurationMonths === 12
                      ? "یک‌ساله (۱۲ ماه)"
                      : orderResult.serviceDurationMonths === 6
                      ? "۶ ماهه"
                      : orderResult.serviceDurationMonths === 3
                      ? "۳ ماهه"
                      : "۱ ماهه"}
                  </span>
                </div>

                <div className="flex justify-between py-1 border-b border-neutral-800/50">
                  <span className="text-neutral-400">تخصیص IP استاتیک اختصاصی:</span>
                  <span className="font-bold text-purple-300">
                    {orderResult.hasStaticIp ? "دارد (تخصیص ۱ آدرس IP معتبر اینترنتی)" : "ندارد"}
                  </span>
                </div>

                <div className="flex justify-between py-1 border-b border-neutral-800/50">
                  <span className="text-neutral-400">محل تحویل و استقرار خط:</span>
                  <span className="font-bold text-neutral-200">
                    {orderResult.city} - {orderResult.address}
                  </span>
                </div>

                <div className="flex justify-between py-1 border-b border-neutral-800/50">
                  <span className="text-neutral-400">مشترک / نام مسئول:</span>
                  <span className="font-bold text-white">
                    {orderResult.fullName} {orderResult.companyName ? `(${orderResult.companyName})` : ""}
                  </span>
                </div>

                <div className="flex justify-between py-1 border-b border-neutral-800/50">
                  <span className="text-neutral-400">شیوه پرداخت انتخابی:</span>
                  <span className="font-bold text-amber-400">
                    {paymentMethod === "online_gateway"
                      ? "درگاه پرداخت اینترنتی شاپرک"
                      : paymentMethod === "wallet"
                      ? "کیف پول اعتباری (تسویه آنی)"
                      : paymentMethod === "corporate_credit"
                      ? "اعتباری سازمانی B2B"
                      : paymentMethod === "bank_transfer"
                      ? "واریز به شماره شبا / حساب بانکی"
                      : "چک صیادی بنفش"}
                  </span>
                </div>

                <div className="flex justify-between py-1 sm:col-span-2 text-sm pt-2">
                  <span className="text-neutral-300 font-bold">مبلغ نهایی فاکتور:</span>
                  <span className="font-mono font-black text-emerald-400 text-base">
                    {formatPrice(Number(orderResult.finalAmount) || finalPayableTotal)}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/dashboard/orders"
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs sm:text-sm transition-all shadow-lg shadow-sky-600/20"
              >
                <PackageCheck className="h-4 w-4" />
                <span>مشاهده سفارش در پیشخوان کاربری</span>
              </Link>

              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-neutral-700 bg-neutral-800/80 hover:bg-neutral-800 text-neutral-200 font-bold text-xs sm:text-sm transition-all"
              >
                <Printer className="h-4 w-4" />
                <span>چاپ رسید سفارش</span>
              </button>

              <Link
                href="/internet"
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-neutral-400 hover:text-white text-xs font-semibold transition-colors"
              >
                <span>بازگشت به پلن‌های اینترنت</span>
                <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" />
              </Link>
            </div>
          </div>
        </div>
      </Container>
    );
  }

  // ─── CHECKOUT FORM ────────────────────────────────────────────────────────
  return (
    <div className="py-6 sm:py-10 space-y-8" dir="rtl">
      <Container>
        {/* ── Breadcrumb ─────────────────────────────────────────────────── */}
        <nav
          className="mb-4 flex items-center justify-between text-xs text-neutral-400 overflow-x-auto whitespace-nowrap"
          aria-label="مسیر راهنما"
        >
          <div className="flex items-center gap-1.5 shrink-0">
            <Link href="/" className="hover:text-white transition-colors">
              خانه
            </Link>
            <span>/</span>
            <Link href="/internet" className="hover:text-white transition-colors">
              اینترنت سازمانی و IP استاتیک
            </Link>
            <span>/</span>
            <span className="text-sky-400 font-bold">تکمیل خرید و پرداخت امن</span>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-[11px] text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-3 py-1 rounded-full shrink-0">
            <Lock className="h-3.5 w-3.5" />
            <span>پرداخت امن ۲۵۶ بیتی شاپرک</span>
          </div>
        </nav>

        {/* ── Page Header ────────────────────────────────────────────────── */}
        <div className="mb-6 border-b border-neutral-800/80 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <Globe2 className="h-6 w-6 text-sky-400" />
              <span>تسویه حساب و پرداخت اشتراک اینترنت سازمانی</span>
            </h1>
            <p className="mt-1 text-xs text-neutral-400">
              مشخصات خط و آدرس شما قبلاً استعلام و ثبت شده است. پس از انتخاب شیوه پرداخت، سفارش شما بلافاصله نهایی می‌گردد.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-neutral-400 shrink-0">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>تضمین پایداری ۹۹.۹٪ با پشتیبانی NOC</span>
          </div>
        </div>

        {/* Error notification if any */}
        {errorMsg && (
          <div className="mb-6 p-4 rounded-2xl border-2 border-rose-500/50 bg-rose-950/30 text-rose-300 text-xs flex items-center gap-3 animate-in fade-in">
            <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />
            <span className="font-semibold">{errorMsg}</span>
          </div>
        )}

        {/* Two-Column Grid: Left/Center Form & Right Financial Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Column (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* ── Card 1: Verified Customer & Registered Service Address ─── */}
            <div className="rounded-3xl border border-neutral-800 bg-[#141418] p-5 sm:p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <div className="flex items-center gap-2 text-xs font-bold text-sky-400">
                  <User className="h-4 w-4" />
                  <span>۱. مشخصات هویتی و محل خط استقرار (از پیش تایید شده)</span>
                </div>
                <span className="text-[11px] bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>احراز شده و آماده رانژه</span>
                </span>
              </div>

              {/* Customer pre-loaded info card */}
              <div className="p-4 rounded-2xl bg-neutral-900/80 border border-neutral-800/80 text-xs space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-neutral-400 block mb-0.5">نام مشترک / مسئول فنی:</span>
                    <strong className="text-white text-sm">
                      {user?.name || (user ? "کاربر گرامی" : "مهمان")}
                    </strong>
                  </div>

                  <div>
                    <span className="text-neutral-400 block mb-0.5">شماره تلفن همراه تأییدشده:</span>
                    <strong className="text-white text-sm font-mono" dir="ltr">
                      {user?.phone || "0912..."}
                    </strong>
                  </div>

                  {user?.companyName && (
                    <div>
                      <span className="text-neutral-400 block mb-0.5">نام شرکت / سازمان:</span>
                      <strong className="text-white">{user.companyName}</strong>
                    </div>
                  )}

                  {selectedAddress && (
                    <div>
                      <span className="text-neutral-400 block mb-0.5">مرکز مخابراتی / شهر:</span>
                      <strong className="text-white">
                        {selectedAddress.province} - {selectedAddress.city}
                      </strong>
                    </div>
                  )}
                </div>

                {selectedAddress && (
                  <div className="pt-2 border-t border-neutral-800">
                    <span className="text-neutral-400 block mb-0.5">نشانی دقیق محل خط / دیتاسنتر:</span>
                    <p className="text-neutral-200 leading-relaxed font-medium">
                      {(selectedAddress as any).fullAddress ||
                        (selectedAddress as any).detailedAddress ||
                        (selectedAddress as any).address}
                    </p>
                  </div>
                )}
              </div>

              {/* If user has multiple saved addresses or partner sites, let them switch easily */}
              {(addresses.length > 1 || partnerSites.length > 1) && (
                <div className="pt-2">
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    تغییر محل نصب (انتخاب از بین آدرس‌ها و پروژه‌های ثبت‌شده شما):
                  </label>
                  <select
                    value={selectedAddressId}
                    onChange={(e) => setSelectedAddressId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 focus:border-sky-500 text-white text-xs"
                  >
                    {addresses.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.title} ({a.city} - {a.fullAddress})
                      </option>
                    ))}
                    {partnerSites.map((s) => (
                      <option key={s.id} value={s.id}>
                        کارگاه: {s.name || s.title} ({s.city})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* ── Card 2: Selected Plan & Duration Switcher ─────────────── */}
            <div className="rounded-3xl border border-neutral-800 bg-[#141418] p-5 sm:p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <div className="flex items-center gap-2 text-xs font-bold text-sky-400">
                  <Globe2 className="h-4 w-4" />
                  <span>۲. پلن اینترنت و مدت دوره قرارداد</span>
                </div>
                <Link
                  href="/internet"
                  className="text-[11px] text-sky-400 hover:text-sky-300 font-bold flex items-center gap-1"
                >
                  <span>مشاهده همه پلن‌ها</span>
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    پلن اینترنت سازمانی
                  </label>
                  <select
                    value={selectedPlanId}
                    onChange={(e) => setSelectedPlanId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 focus:border-sky-500 text-white text-xs font-bold"
                  >
                    {plans.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title} ({formatPrice(Number(p.monthlyPrice))}/ماه)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    دوره تمدید و تخفیف
                  </label>
                  <select
                    value={billingCycle}
                    onChange={(e) => setBillingCycle(e.target.value as BillingCycle)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-800 focus:border-sky-500 text-white text-xs font-bold text-sky-400"
                  >
                    <option value="1_month">۱ ماهه (بدون تخفیف)</option>
                    <option value="3_months">۳ ماهه (۵٪ تخفیف دوره)</option>
                    <option value="6_months">۶ ماهه (۱۰٪ تخفیف دوره)</option>
                    <option value="12_months">۱۲ ماهه (۲۰٪ تخفیف دوره - اقتصادی)</option>
                  </select>
                </div>
              </div>

              {/* Static IP Dedicated Toggle */}
              <div
                onClick={() => setHasStaticIp(!hasStaticIp)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer select-none ${
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

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Server className="h-4 w-4 text-sky-400" />
                        <span className="text-xs font-bold text-white">
                          افزودن IP استاتیک اختصاصی سازمانی (Static IP)
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-400 leading-relaxed max-w-lg">
                        تخصیص ۱ آدرس IP ثابت و معتبر برای انتقال تصویر دوربین‌های مداربسته، فایروال و سرورها.
                      </p>
                    </div>
                  </div>

                  <div className="text-left font-mono shrink-0">
                    <span className="text-xs font-bold text-sky-400 block">
                      +{formatPrice(staticIpBaseMonthly)}
                    </span>
                    <span className="text-[10px] text-neutral-500 block">تومان / ماه</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Card 3: Payment Method Selection ─────────────────────── */}
            <div className="rounded-3xl border border-neutral-800 bg-[#141418] p-5 sm:p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <div className="flex items-center gap-2 text-xs font-bold text-sky-400">
                  <CreditCard className="h-4 w-4" />
                  <span>۳. انتخاب روش پرداخت و تسویه حساب</span>
                </div>
                <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                  <Lock className="h-3 w-3" />
                  <span>درگاه امن بانکی</span>
                </span>
              </div>

              <UnifiedPaymentSelector
                amount={finalPayableTotal}
                selectedMethod={paymentMethod}
                onSelectMethod={(method, extra) => {
                  setPaymentMethod(method);
                  if (extra?.gatewayId) setSelectedGatewayId(extra.gatewayId);
                  if (extra?.bankAccountId) setSelectedBankAccountId(extra.bankAccountId);
                  if (extra?.receiptUrl !== undefined) setReceiptUrl(extra.receiptUrl);
                  if (extra?.receiptNumber !== undefined) setReceiptNumber(extra.receiptNumber);
                }}
                selectedGatewayId={selectedGatewayId}
                onSelectGateway={setSelectedGatewayId}
                selectedBankAccountId={selectedBankAccountId}
                onSelectBankAccount={setSelectedBankAccountId}
                receiptUrl={receiptUrl}
                onReceiptUrlChange={setReceiptUrl}
                receiptNumber={receiptNumber}
                onReceiptNumberChange={setReceiptNumber}
                targetType="INTERNET_ORDER"
                userWalletBalance={walletBalance}
                isPartner={isPartner}
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Sidebar Summary (5 cols) */}
          <div className="lg:col-span-5 sticky top-20 space-y-6">
            <div className="rounded-3xl border-2 border-neutral-800 bg-[#141418] p-5 sm:p-6 space-y-5 shadow-2xl">
              <div className="border-b border-neutral-800 pb-3">
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-sky-400" />
                  <span>فاکتور نهایی و تایید پرداخت</span>
                </h3>
                <span className="text-[11px] text-neutral-400">
                  خرید قطعی اشتراک اینترنت سازمانی
                </span>
              </div>

              {/* Plan Brief */}
              <div className="p-3.5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400">سرویس انتخابی:</span>
                  <strong className="text-white font-bold">{activePlan?.title || "اینترنت سازمانی"}</strong>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-neutral-400">مدت دوره:</span>
                  <span className="font-bold text-sky-400">
                    {billingCycle === "12_months"
                      ? "یک‌ساله (۲۰٪ تخفیف دوره)"
                      : billingCycle === "6_months"
                      ? "۶ ماهه (۱۰٪ تخفیف)"
                      : billingCycle === "3_months"
                      ? "۳ ماهه (۵٪ تخفیف)"
                      : "۱ ماهه"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-neutral-400">IP استاتیک اختصاصی:</span>
                  <span className={hasStaticIp ? "font-bold text-purple-300" : "text-neutral-500"}>
                    {hasStaticIp ? "دارد (تخصیص رسمی)" : "بدون IP اختصاصی"}
                  </span>
                </div>
              </div>

              {/* Breakdown */}
              <div className="space-y-2.5 text-xs text-neutral-300 border-t border-neutral-800/80 pt-3">
                <div className="flex justify-between">
                  <span className="text-neutral-400">مبلغ پایه سرویس ({toPersianDigits(cycleMonths)} ماه):</span>
                  <span className="font-mono text-neutral-200">{formatPrice(baseCycleTotal)}</span>
                </div>

                {discountTotal > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>تخفیف دوره تمدید ({toPersianDigits(cycleDiscountPercent)}٪):</span>
                    <span className="font-mono font-bold">-{formatPrice(discountTotal)}</span>
                  </div>
                )}

                {hasStaticIp && (
                  <div className="flex justify-between">
                    <span className="text-neutral-400">هزینه تخصیص IP استاتیک ({toPersianDigits(cycleMonths)} ماه):</span>
                    <span className="font-mono text-purple-300">+{formatPrice(staticIpCycleTotal)}</span>
                  </div>
                )}

                <div className="border-t border-neutral-800 pt-3 flex justify-between items-baseline">
                  <span className="text-sm font-bold text-white">مبلغ نهایی قابل پرداخت:</span>
                  <div className="text-left font-mono">
                    <span className="text-xl sm:text-2xl font-black text-sky-400 block">
                      {formatPrice(finalPayableTotal)}
                    </span>
                    <span className="text-[10px] text-neutral-500 block">تومان</span>
                  </div>
                </div>
              </div>

              {/* Partner commission banner if partner */}
              {isPartner && partnerTotalCommission > 0 && (
                <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-emerald-300 font-bold flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                      <span>پورسانت همکار شما:</span>
                    </span>
                    <span className="font-mono font-black text-emerald-400 text-sm">
                      +{formatPrice(partnerTotalCommission)}
                    </span>
                  </div>
                  <p className="text-[10px] text-emerald-400/80 leading-relaxed">
                    این مبلغ بلافاصله پس از تکمیل پرداخت در کیف پول همکار شما شارژ خواهد شد.
                  </p>
                </div>
              )}

              {/* Confirm & Pay Button */}
              <button
                type="button"
                onClick={handleConfirmAndPay}
                disabled={isSubmitting}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-sky-500 via-sky-600 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-black font-black text-sm shadow-xl shadow-sky-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-black" />
                    <span>در حال اتصال به سیستم پرداخت...</span>
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4 text-black" />
                    <span>
                      {paymentMethod === "online_gateway"
                        ? "پرداخت امن شاپرک و نهایی‌سازی سفارش"
                        : "تایید و ثبت نهایی سفارش اینترنت"}
                    </span>
                  </>
                )}
              </button>

              <div className="text-center text-[10px] text-neutral-500 flex items-center justify-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                <span>گارانتی بازگشت وجه در صورت عدم تأمین فنی خط</span>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
