"use client";

import * as React from "react";
import Link from "next/link";
import { Home, ChevronLeft, Globe2, PhoneCall } from "lucide-react";
import { Container } from "@/shared/components/ui/container";
import { InternetHero } from "./internet-hero";
import { InternetPlansGrid } from "./internet-plans-grid";
import { StaticIpSection } from "./static-ip-section";
import { InternetOrderForm } from "./internet-order-form";
import { InternetFAQ } from "./internet-faq";
import { BillingCycle } from "../types";

export function InternetPageClient() {
  const [selectedPlanId, setSelectedPlanId] = React.useState<string>("ftth-turbo-ultra");
  const [selectedStaticIpId, setSelectedStaticIpId] = React.useState<string>("ip-single");
  const [billingCycle, setBillingCycle] = React.useState<BillingCycle>("12_months");

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

  const handleApplyIpToForm = (ipId: string) => {
    setSelectedStaticIpId(ipId);
    scrollToSection("internet-order-form-box");
  };

  return (
    <div className="py-6 sm:py-10 space-y-16" dir="rtl">
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

        {/* ── 1. Hero ─────────────────────────────────────────────────────── */}
        <InternetHero
          onScrollToPlans={() => scrollToSection("internet-plans-section")}
          onScrollToStaticIp={() => scrollToSection("static-ip-section")}
          onScrollToOrderForm={() => scrollToSection("internet-order-form-box")}
        />

        {/* ── 2. Plans Grid ───────────────────────────────────────────────── */}
        <div className="my-14">
          <InternetPlansGrid
            selectedPlanId={selectedPlanId}
            billingCycle={billingCycle}
            onSelectPlan={setSelectedPlanId}
            onSelectBillingCycle={setBillingCycle}
            onApplyPlanToForm={handleApplyPlanToForm}
          />
        </div>

        {/* ── 3. Static IP Packages ────────────────────────────────────────── */}
        <div className="my-14">
          <StaticIpSection
            selectedStaticIpId={selectedStaticIpId}
            billingCycle={billingCycle}
            onSelectStaticIp={setSelectedStaticIpId}
            onApplyIpToForm={handleApplyIpToForm}
          />
        </div>

        {/* ── 4. Order & Live Pre-Invoice Form ─────────────────────────────── */}
        <div className="my-14">
          <InternetOrderForm
            selectedPlanId={selectedPlanId}
            selectedStaticIpId={selectedStaticIpId}
            billingCycle={billingCycle}
            onPlanChange={setSelectedPlanId}
            onStaticIpChange={setSelectedStaticIpId}
            onBillingCycleChange={setBillingCycle}
          />
        </div>

        {/* ── 5. FAQ Accordion ────────────────────────────────────────────── */}
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
