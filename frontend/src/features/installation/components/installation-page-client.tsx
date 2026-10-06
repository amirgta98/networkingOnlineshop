"use client";

import * as React from "react";
import Link from "next/link";
import {
  Wrench,
  Home,
  ChevronLeft,
  PhoneCall,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
} from "lucide-react";
import { Container } from "@/shared/components/ui/container";
import { InstallationHero } from "./installation-hero";
import { InstallationCalculator } from "./installation-calculator";
import { InstallationServicesGrid } from "./installation-services-grid";
import { InstallationWorkflowSteps } from "./installation-workflow-steps";
import { InstallationGuarantees } from "./installation-guarantees";
import { InstallationRequestForm } from "./installation-request-form";
import { InstallationTracker } from "./installation-tracker";
import { InstallationFAQ } from "./installation-faq";
import { InstallationServiceCategory } from "../types";

export function InstallationPageClient() {
  const [selectedService, setSelectedService] = React.useState<InstallationServiceCategory>("cabling");
  const [calculatorData, setCalculatorData] = React.useState<{
    serviceType: InstallationServiceCategory;
    nodeCount: number;
    cctvCount: number;
    approximateArea: number;
    rackCount: number;
    needsFlukeTest: boolean;
  } | null>(null);
  const [activeTrackingCode, setActiveTrackingCode] = React.useState<string>("");

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleApplyCalculatorToForm = (data: {
    serviceType: InstallationServiceCategory;
    nodeCount: number;
    cctvCount: number;
    approximateArea: number;
    rackCount: number;
    needsFlukeTest: boolean;
  }) => {
    setCalculatorData(data);
    setSelectedService(data.serviceType);
    scrollToSection("installation-form-box");
  };

  const handleSelectServiceFromGrid = (svcId: InstallationServiceCategory) => {
    setSelectedService(svcId);
    scrollToSection("installation-form-box");
  };

  const handleFormSubmitted = (trackingCode: string) => {
    setActiveTrackingCode(trackingCode);
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
          <span className="text-orange-400 font-medium flex items-center gap-1">
            <Wrench className="h-3.5 w-3.5" />
            <span>خدمات و درخواست نصب و راه‌اندازی شبکه</span>
          </span>
        </nav>

        {/* ── 1. Hero ─────────────────────────────────────────────────────── */}
        <InstallationHero
          onScrollToForm={() => scrollToSection("installation-form-box")}
          onScrollToCalculator={() => scrollToSection("installation-calculator")}
          onScrollToTracker={() => scrollToSection("installation-tracker")}
        />

        {/* ── 2. Quality Guarantees & SLAs ─────────────────────────────────── */}
        <div className="my-14">
          <InstallationGuarantees />
        </div>

        {/* ── 3. Interactive Calculator ───────────────────────────────────── */}
        <div className="my-14">
          <InstallationCalculator onApplyToForm={handleApplyCalculatorToForm} />
        </div>

        {/* ── 4. Services Grid ────────────────────────────────────────────── */}
        <div className="my-14">
          <InstallationServicesGrid
            selectedServiceId={selectedService}
            onSelectService={handleSelectServiceFromGrid}
          />
        </div>

        {/* ── 5. Five-Step Workflow ───────────────────────────────────────── */}
        <div className="my-14">
          <InstallationWorkflowSteps />
        </div>

        {/* ── 6. Master Request Form ──────────────────────────────────────── */}
        <div className="my-14">
          <InstallationRequestForm
            initialService={selectedService}
            calculatorData={calculatorData}
            onSubmissionSuccess={handleFormSubmitted}
          />
        </div>

        {/* ── 7. Real-Time Tracking Section ───────────────────────────────── */}
        <div className="my-14">
          <InstallationTracker initialCode={activeTrackingCode} />
        </div>

        {/* ── 8. FAQ Accordion ────────────────────────────────────────────── */}
        <div className="my-14">
          <InstallationFAQ />
        </div>

        {/* ── Direct Phone Consultation Banner ────────────────────────────── */}
        <div className="mt-16 rounded-3xl border border-orange-500/30 bg-gradient-to-r from-orange-950/40 via-neutral-900 to-neutral-900 p-6 sm:p-10 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 text-right">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-orange-600/20 text-orange-400 border border-orange-500/40">
              <PhoneCall className="h-7 w-7" />
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="text-base sm:text-lg font-black text-white">
                پروژه فوری دارید یا نیازمند استعلام رسمی مناقصه هستید؟
              </h3>
              <p className="text-xs sm:text-sm text-neutral-400">
                مهندسان ناظر ارشد ققنوس آکادمی در ساعات اداری و غیراداری آماده پاسخگویی و ارائه مشاوره تخصصی هستند.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="tel:09134761097"
              className="flex items-center gap-2 py-3 px-6 rounded-xl bg-orange-600 hover:bg-orange-500 active:scale-95 text-white font-mono font-bold text-sm shadow-lg shadow-orange-600/25 transition-all cursor-pointer"
              dir="ltr"
            >
              <PhoneCall className="h-4 w-4" />
              <span>۰۲۱ - ۸۸۸۸ ۸۸۸۸</span>
            </a>
          </div>
        </div>
      </Container>
    </div>
  );
}
