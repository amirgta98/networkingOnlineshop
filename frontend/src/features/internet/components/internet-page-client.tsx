"use client";

import * as React from "react";
import Link from "next/link";
import {
  Home,
  ChevronLeft,
  Globe2,
  PhoneCall,
  Building2,
  ArrowLeft,
  Sparkles,
  AlertCircle,
  Lock,
  Ticket,
  CheckCircle2,
  Wifi,
  WifiOff,
  Wallet,
} from "lucide-react";
import { Container } from "@/shared/components/ui/container";
import { useAuth } from "@/features/auth";
import { useAffiliate } from "@/features/affiliate";
import { formatPrice } from "@/shared/lib/utils";
import { InternetHero } from "./internet-hero";
import { InternetPlansGrid } from "./internet-plans-grid";
import { InternetOrderForm } from "./internet-order-form";
import { InternetFAQ } from "./internet-faq";
import { BillingCycle, InternetPlan, InternetSettings } from "../types";
import { internetApi } from "../api/internet-api";

interface InternetPageClientProps {
  initialPlans?: InternetPlan[];
  initialSettings?: InternetSettings;
}

export function InternetPageClient({
  initialPlans = [],
  initialSettings,
}: InternetPageClientProps = {}) {
  const { user, status, refreshUser } = useAuth();
  const {
    isPartner: isAffiliatePartner,
    effectiveInternetCommission,
    effectiveStaticIpCommission,
  } = useAffiliate();

  // Revalidate user permissions on mount and window focus/visibility change
  React.useEffect(() => {
    let isCancelled = false;

    const doRefresh = () => {
      if (refreshUser && !isCancelled) {
        void refreshUser();
      }
    };

    // Revalidate immediately on mount or user id change
    doRefresh();

    const handleFocus = () => doRefresh();
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        doRefresh();
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      isCancelled = true;
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [refreshUser, user?.id]);

  const isPartner = Boolean(
    isAffiliatePartner ||
    user?.role === "partner" ||
    (user?.role as string) === "partner_b2b" ||
    user?.isPartner
  );
  const isAdmin = user?.role === "admin" || (user?.role as string) === "super_admin";
  const canBuyInternet = Boolean(user?.canBuyInternet || isAdmin || isPartner);

  const internetCommissionAmount = effectiveInternetCommission ?? 400_000;
  const staticIpCommissionAmount = effectiveStaticIpCommission ?? 150_000;

  // Dynamic Plans & Settings from API
  const [plans, setPlans] = React.useState<InternetPlan[]>(initialPlans);
  const [settings, setSettings] = React.useState<InternetSettings | undefined>(initialSettings);
  const [loadingData, setLoadingData] = React.useState(initialPlans.length === 0);

  const initialSelectedPlan = initialPlans.find((p) => p.isFeatured)?.id || initialPlans[0]?.id || "";
  const [selectedPlanId, setSelectedPlanId] = React.useState<string>(initialSelectedPlan);
  const [billingCycle, setBillingCycle] = React.useState<BillingCycle>("12_months");

  React.useEffect(() => {
    let isMounted = true;
    Promise.all([internetApi.getPlans(), internetApi.getSettings()])
      .then(([apiPlans, apiSettings]) => {
        if (!isMounted) return;
        if (apiPlans && apiPlans.length > 0) {
          setPlans(apiPlans);
          setSelectedPlanId((prev) => {
            if (prev && apiPlans.some((p) => p.id === prev)) return prev;
            return (apiPlans.find((p) => p.isFeatured) || apiPlans[0]).id;
          });
        }
        if (apiSettings) {
          setSettings(apiSettings);
        }
      })
      .catch((err) => {
        console.warn("Could not load internet plans or settings from API:", err);
      })
      .finally(() => {
        if (isMounted) setLoadingData(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleApplyPlanToForm = (planId: string) => {
    setSelectedPlanId(planId);
    scrollToSection("internet-order-form-box");
  };

  const supportLink = user
    ? isPartner
      ? "/partner/support"
      : "/dashboard/support"
    : "/login?redirect=/dashboard/support";

  return (
    <div className="py-6 sm:py-10 space-y-12 sm:space-y-16" dir="rtl">
      <Container>
        {/* ── Breadcrumb ──────────────────────────────────────────────────── */}
        <nav
          className="mb-6 flex items-center gap-1.5 text-xs text-neutral-400"
          aria-label="مسیر راهنما"
        >
          <Link
            href="/"
            className="flex items-center gap-1 hover:text-white transition-colors"
          >
            <Home className="h-3.5 w-3.5" />
            <span>خانه</span>
          </Link>
          <ChevronLeft className="h-3 w-3 text-neutral-600" />
          <span className="text-sky-400 font-medium flex items-center gap-1">
            <Globe2 className="h-3.5 w-3.5" />
            <span>خرید اینترنت سازمانی و تخصیص IP استاتیک</span>
          </span>
        </nav>

        {/* ── Access State Banner (Notice if cannot buy internet) ─────────── */}
        {status === "loading" ? (
          <div className="mb-8 rounded-3xl border border-neutral-800 bg-neutral-900/40 p-6 animate-pulse flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-neutral-800" />
              <div className="space-y-2">
                <div className="h-4 w-48 bg-neutral-800 rounded" />
                <div className="h-3 w-72 bg-neutral-800/60 rounded" />
              </div>
            </div>
          </div>
        ) : !canBuyInternet ? (
          <div className="mb-8 rounded-3xl border-2 border-amber-500/50 bg-gradient-to-br from-amber-950/40 via-neutral-900 to-neutral-900 p-6 sm:p-8 shadow-2xl backdrop-blur-xl animate-in fade-in duration-300">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-lg shadow-amber-500/10">
                  <AlertCircle className="h-7 w-7" />
                </div>
                <div className="flex flex-col gap-1.5 text-right">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-500/40 font-bold inline-flex items-center gap-1.5">
                      <WifiOff className="h-3.5 w-3.5" />
                      <span>امکان خرید مستقیم غیرفعال است</span>
                    </span>
                    {user && (
                      <span className="text-xs text-neutral-400">
                        حساب: <span className="text-white font-semibold">{user.name || user.phone}</span>
                      </span>
                    )}
                  </div>
                  <h2 className="text-base sm:text-lg lg:text-xl font-black text-white leading-relaxed">
                    برای خرید اینترنت با شماره تلفن ادمین تماس بگیرید یا تیکت ثبت کنید
                  </h2>
                  <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed max-w-2xl">
                    جهت امکان‌سنجی خط فیبر نوری، بررسی پوشش رادیویی و اختصاص دسترسی خرید به حساب کاربری شما، لطفاً از طریق تماس تلفنی با مدیریت یا ثبت تیکت پشتیبانی اقدام فرمایید.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto shrink-0">
                <a
                  href="tel:09134761097"
                  className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs sm:text-sm transition-all shadow-lg shadow-amber-500/20 whitespace-nowrap"
                >
                  <PhoneCall className="h-4 w-4" />
                  <span>تماس با ادمین (۰۹۱۳۴۷۶۱۰۹۷)</span>
                </a>

                <Link
                  href={supportLink}
                  className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-sky-500/40 bg-sky-950/40 hover:bg-sky-900/50 text-sky-200 font-bold text-xs sm:text-sm transition-all whitespace-nowrap shadow-md"
                >
                  <Ticket className="h-4 w-4 text-sky-400" />
                  <span>ثبت تیکت پشتیبانی</span>
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-8 rounded-2xl border border-emerald-500/30 bg-emerald-950/30 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <Wifi className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-bold text-white">
                    دسترسی خرید اینترنت برای حساب شما فعال است
                  </span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30 font-bold">
                    خرید آنلاین مجاز
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-neutral-400 mt-0.5">
                  می‌توانید پلن مورد نظر را انتخاب کرده، گزینه IP استاتیک اختصاصی را فعال و پیش‌فاکتور رسمی دریافت نمایید.
                </p>
              </div>
            </div>
            {isPartner && (
              <div className="flex items-center gap-2 text-xs bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 px-3.5 py-1.5 rounded-xl font-bold shrink-0">
                <Wallet className="h-4 w-4 text-emerald-400" />
                <span>پورسانت همکار شما در کیف پول شارژ خواهد شد</span>
              </div>
            )}
          </div>
        )}

        {/* ── Partner Commission & Wallet Announcement Banner ─────────── */}
        {isPartner && (
          <div className="mb-8 rounded-3xl border-2 border-emerald-500/40 bg-gradient-to-br from-emerald-950/40 via-neutral-900 to-[#0e1713] p-6 sm:p-8 shadow-2xl backdrop-blur-xl animate-in fade-in duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-lg shadow-emerald-500/20">
                  <Wallet className="h-7 w-7" />
                </div>
                <div className="flex flex-col gap-2 text-right">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full border border-emerald-500/40 font-black inline-flex items-center gap-1.5 shadow-sm">
                      <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                      <span>پنل فروش همکاران تجاری (B2B Partner)</span>
                    </span>
                    <span className="text-xs text-neutral-400">
                      حساب همکار: <strong className="text-white">{user?.companyName || user?.name || "همکار رسمی"}</strong>
                    </span>
                  </div>

                  <h2 className="text-base sm:text-xl lg:text-2xl font-black text-white leading-relaxed">
                    اطلاعیه رسمی: درصد پورسانت فروش همکار و شارژ مستقیم در کیف پول
                  </h2>

                  <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed max-w-3xl">
                    به اطلاع کلیه همکاران گرامی می‌رساند: کلیه خریدهای اینترنت سازمانی و تخصیص IP استاتیک از این صفحه انجام می‌شود. به ازای هر فروش، <strong className="text-emerald-400">درصد پورسانت همکار</strong> محاسبه شده و مبلغ آن <strong className="text-emerald-300">مستقیماً در کیف پول شما شارژ خواهد شد</strong> و بلافاصله برای تسویه، خرید تجهیزات یا برداشت نقدی در دسترس خواهد بود.
                  </p>

                  {/* Commission Rates Strip */}
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-neutral-900/90 border border-emerald-500/30 text-xs">
                      <span className="text-neutral-400">درصد و مبلغ پورسانت اینترنت:</span>
                      <strong className="text-emerald-400 font-mono text-sm font-black">
                        {formatPrice(internetCommissionAmount)}
                      </strong>
                      <span className="text-[11px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-lg border border-emerald-500/30 font-bold">
                        (معادل ۱۲٪ الی ۱۰۰٪ ارزش پلن)
                      </span>
                    </div>

                    <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-neutral-900/90 border border-purple-500/30 text-xs">
                      <span className="text-neutral-400">درصد و مبلغ پورسانت IP استاتیک:</span>
                      <strong className="text-purple-300 font-mono text-sm font-black">
                        {formatPrice(staticIpCommissionAmount)}
                      </strong>
                      <span className="text-[11px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-lg border border-purple-500/30 font-bold">
                        (تا ۱۲۵٪ ارزش پکیج)
                      </span>
                    </div>

                    <div className="inline-flex items-center gap-1.5 text-xs text-emerald-300 font-semibold bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-500/20">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                      <span>اعلان: پورسانت فروش در کیف پول شما شارژ خواهد شد</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto shrink-0">
                <Link
                  href="/partner/credit"
                  className="flex-1 lg:flex-initial flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm transition-all shadow-lg shadow-emerald-600/25 whitespace-nowrap"
                >
                  <Wallet className="h-4 w-4" />
                  <span>مشاهده کیف پول و اعتبارات همکار</span>
                </Link>

                <Link
                  href="/partner"
                  className="flex-1 lg:flex-initial flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-neutral-700 bg-neutral-800/80 hover:bg-neutral-800 text-neutral-200 text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap"
                >
                  <Building2 className="h-4 w-4 text-sky-400" />
                  <span>پیشخوان همکار</span>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* ── 1. Hero ─────────────────────────────────────────────────────── */}
        <InternetHero
          onScrollToPlans={() => scrollToSection("internet-plans-section")}
          onScrollToStaticIp={() => scrollToSection("internet-order-form-box")}
          onScrollToOrderForm={() => scrollToSection("internet-order-form-box")}
        />

        {/* ── 2. Dynamic Plans Grid ────────────────────────────────────────── */}
        <div className="my-14">
          <InternetPlansGrid
            plans={plans}
            isLoading={loadingData}
            selectedPlanId={selectedPlanId}
            billingCycle={billingCycle}
            onSelectPlan={setSelectedPlanId}
            onSelectBillingCycle={setBillingCycle}
            onApplyPlanToForm={handleApplyPlanToForm}
            isPartner={isPartner}
            commissionAmount={internetCommissionAmount}
          />
        </div>

        {/* ── 3. Order & Live Pre-Invoice Form OR Access Restriction Card ─── */}
        <div className="my-14" id="internet-order-form-box">
          {status === "loading" ? (
            <div className="rounded-3xl border border-neutral-800 bg-neutral-900/60 p-12 text-center max-w-2xl mx-auto backdrop-blur-xl shadow-2xl flex flex-col items-center justify-center gap-3 animate-pulse">
              <div className="h-10 w-10 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs sm:text-sm text-neutral-400">در حال بررسی سطح دسترسی حساب کاربری...</p>
            </div>
          ) : canBuyInternet ? (
            <InternetOrderForm
              plans={plans}
              settings={settings}
              selectedPlanId={selectedPlanId}
              billingCycle={billingCycle}
              onPlanChange={setSelectedPlanId}
              onBillingCycleChange={setBillingCycle}
              isPartner={isPartner}
              internetCommissionAmount={internetCommissionAmount}
              staticIpCommissionAmount={staticIpCommissionAmount}
            />
          ) : (
            <div className="scroll-mt-24 rounded-3xl border-2 border-amber-500/40 bg-gradient-to-b from-neutral-900 via-[#141418] to-neutral-900 p-8 sm:p-12 text-center flex flex-col items-center justify-center gap-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-xl shadow-amber-500/10">
                <Lock className="h-10 w-10" />
              </div>

              <div className="max-w-xl flex flex-col gap-3">
                <span className="text-xs text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 font-bold self-center">
                  امکان ثبت مستقیم سفارش اینترنت محدود شده است
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white leading-relaxed">
                  برای خرید اینترنت با شماره تلفن ادمین تماس بگیرید یا تیکت ثبت کنید
                </h3>
                <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                  دسترسی خرید سرویس‌های اینترنت فیبر نوری، پهنای باند اختصاصی و تخصیص IP استاتیک پس از تایید توسط ادمین در پنل کاربری شما فعال می‌گردد.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto pt-2">
                <a
                  href="tel:09134761097"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-black text-sm shadow-xl shadow-amber-500/25 transition-all"
                >
                  <PhoneCall className="h-5 w-5" />
                  <span>تماس با ادمین (۰۹۱۳۴۷۶۱۰۹۷)</span>
                </a>

                <Link
                  href={supportLink}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl border border-neutral-700 bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-sm transition-all"
                >
                  <Ticket className="h-5 w-5 text-sky-400" />
                  <span>ثبت تیکت پشتیبانی</span>
                </Link>
              </div>

              {!user && (
                <div className="pt-4 border-t border-neutral-800 text-xs text-neutral-400">
                  قبلاً دسترسی خرید برای حساب شما فعال شده است؟{" "}
                  <Link href="/login?redirect=/internet" className="text-sky-400 font-bold hover:underline">
                    ورود به حساب کاربری
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── 4. FAQ Accordion ────────────────────────────────────────────── */}
        <div className="my-14">
          <InternetFAQ />
        </div>

        {/* ── Direct Phone Consultation Banner ────────────────────────────── */}
        <div className="mt-16 rounded-3xl border border-sky-500/30 bg-gradient-to-r from-sky-950/40 via-neutral-900 to-neutral-900 p-6 sm:p-10 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 text-right">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-sky-600/20 text-sky-400 border border-sky-500/40">
              <PhoneCall className="h-7 w-7" />
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="text-base sm:text-lg font-black text-white">
                پروژه خاص یا نیاز به پهنای باند اختصاصی بر بستر فیبر تار تاریک دارید؟
              </h3>
              <p className="text-xs sm:text-sm text-neutral-400">
                مهندسان ارشد شبکه ققنوس آکادمی آماده امکان‌سنجی رایگان دکل‌ها و مراکز مخابراتی منطقه شما هستند.
              </p>
            </div>
          </div>
          <a
            href="tel:09134761097"
            className="flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-sky-500 hover:bg-sky-400 text-black font-bold text-xs sm:text-sm transition-all whitespace-nowrap shrink-0 shadow-lg shadow-sky-500/20"
          >
            <PhoneCall className="h-4 w-4" />
            <span>مشاوره تلفنی با مهندس شبکه</span>
          </a>
        </div>
      </Container>
    </div>
  );
}
