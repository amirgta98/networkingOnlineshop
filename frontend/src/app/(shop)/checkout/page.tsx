import * as React from "react";
import Link from "next/link";
import { ChevronLeft, Home, ShoppingBag, ShieldCheck, Lock } from "lucide-react";
import { Container } from "@/shared/components/ui/container";
import { CheckoutClient } from "@/features/checkout";

export const metadata = {
  title: "تکمیل خرید و پرداخت امن | فروشگاه تخصصی تجهیزات شبکه ققنوس آکادمی",
  description:
    "مرحله نهایی ثبت سفارش و پرداخت امن اینترنتی تجهیزات شبکه، روتر، سوئیچ مدیریتی با قابلیت صدور فاکتور رسمی مالیاتی و ارسال اکسپرس ضدضربه.",
};

export default function CheckoutPage() {
  return (
    <div className="py-6 sm:py-10" dir="rtl">
      <Container>
        {/* ── Breadcrumb ──────────────────────────────────────────────────── */}
        <nav
          className="mb-4 flex items-center justify-between text-xs text-neutral-400 overflow-x-auto whitespace-nowrap"
          aria-label="مسیر راهنما"
        >
          <div className="flex items-center gap-1.5 shrink-0">
            <Link
              href="/"
              className="flex items-center gap-1 hover:text-white transition-colors"
            >
              <Home className="h-3.5 w-3.5" />
              <span>خانه</span>
            </Link>
            <ChevronLeft className="h-3 w-3 text-neutral-600" />
            <span className="text-orange-400 font-medium flex items-center gap-1">
              <ShoppingBag className="h-3.5 w-3.5" />
              <span>تکمیل فرایند خرید و تسویه</span>
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-[11px] text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-3 py-1 rounded-full shrink-0">
            <Lock className="h-3.5 w-3.5" />
            <span>پرداخت امن ۲۵۶ بیتی شاپرک</span>
          </div>
        </nav>

        {/* ── Page Header ─────────────────────────────────────────────────── */}
        <div className="mb-6 border-b border-neutral-800/80 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-lg sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <span>تکمیل و ثبت نهایی سفارش</span>
            </h1>
            <p className="mt-1 text-xs text-neutral-400 max-w-xl leading-relaxed">
              اطلاعات ارسال، نوع فاکتور رسمی یا عادی و شیوه تحویل تجهیزات شبکه را مشخص فرمایید.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-neutral-400 shrink-0">
            <ShieldCheck className="h-4 w-4 text-orange-400 shrink-0" />
            <span>ضمانت اصالت و سلامت قطعات</span>
          </div>
        </div>

        {/* ── Client Checkout Flow ────────────────────────────────────────── */}
        <React.Suspense fallback={<div className="h-96 animate-pulse bg-neutral-900 rounded-3xl" />}>
          <CheckoutClient />
        </React.Suspense>
      </Container>
    </div>
  );
}
