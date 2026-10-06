"use client";

import * as React from "react";
import Link from "next/link";
import { Home, ChevronLeft, Building2, PhoneCall, Sparkles } from "lucide-react";
import { Container } from "@/shared/components/ui/container";
import { AboutHero } from "./about-hero";
import { AboutStatsStrip } from "./about-stats-strip";
import { AboutValues } from "./about-values";
import { AboutStory } from "./about-story";
import { AboutInteractiveArchitecture } from "./about-interactive-architecture";
import { AboutTeam } from "./about-team";
import { AboutCertifications } from "./about-certifications";
import { AboutContactSection } from "./about-contact-section";
import { AboutFAQ } from "./about-faq";
import { AboutCTA } from "./about-cta";

export function AboutPageClient() {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="py-6 sm:py-10" dir="rtl">
      <Container>
        {/* ── Breadcrumbs ─────────────────────────────────────────────────── */}
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
            <Building2 className="h-3.5 w-3.5" />
            <span>درباره ما و اطلاعات تماس</span>
          </span>
        </nav>

        {/* ── 1. Hero ─────────────────────────────────────────────────────── */}
        <AboutHero
          onScrollToContact={() => scrollTo("contact-section")}
          onScrollToStory={() => scrollTo("milestones-section")}
          onScrollToValues={() => scrollTo("values-section")}
        />

        {/* ── 2. Key Metrics & Stats Strip ─────────────────────────────────── */}
        <AboutStatsStrip />

        {/* ── 3. Core Values & Quality Pillars ─────────────────────────────── */}
        <AboutValues />

        {/* ── 4. Interactive Growth Timeline & Milestones ─────────────────── */}
        <AboutStory />

        {/* ── 5. Interactive 5-Step Quality & Logistics Architecture ───────── */}
        <AboutInteractiveArchitecture />

        {/* ── 6. Certified Leadership & Engineering Team ───────────────────── */}
        <AboutTeam />

        {/* ── 7. Global Brand Certifications & Partner Alliances ──────────── */}
        <AboutCertifications />

        {/* ── 8. Contact Channels, Map, Working Hours & Online Inquiry Form ── */}
        <AboutContactSection />

        {/* ── 9. Frequently Asked Questions ────────────────────────────────── */}
        <AboutFAQ />

        {/* ── 10. High-Conversion CTA Banner ───────────────────────────────── */}
        <AboutCTA onScrollToContact={() => scrollTo("contact-section")} />
      </Container>
    </div>
  );
}
