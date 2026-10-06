import * as React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";

import { Container } from "@/shared/components/ui/container";
import { MediaGallerySwiper } from "@/shared/components/ui";
import {
  PORTFOLIO_PROJECTS,
} from "@/features/portfolio";


import {
  ArrowRight,
  Building2,
  Calendar,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  Cpu,
  ShieldCheck,
} from "lucide-react";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return PORTFOLIO_PROJECTS.map((project) => ({
    slug: project.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = PORTFOLIO_PROJECTS.find((p) => p.slug === slug);

  if (!project) {
    return {
      title: "پروژه مورد نظر یافت نشد | ققنوس آکادمی",
    };
  }

  return {
    title: `${project.title} | نمونه‌کارهای ققنوس آکادمی`,
    description: project.summary,
  };
}

export default async function PortfolioDetailPage({ params }: Props) {
  const { slug } = await params;
  const project = PORTFOLIO_PROJECTS.find((p) => p.slug === slug);

  if (!project) {
    notFound();
  }

  return (
    <div className="min-h-screen py-10 sm:py-16 text-neutral-200" dir="rtl">
      <Container className="max-w-4xl">
        {/* Back Link */}
        <Link
          href="/#portfolio"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-orange-400 hover:text-orange-300 transition-colors mb-8 group"
        >
          <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
          <span>بازگشت به همه نمونه‌کارها</span>
        </Link>

        {/* Top Badges */}
        <div className="flex flex-wrap items-center gap-2.5 mb-4">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-500/30 bg-orange-500/10 px-3.5 py-1 text-xs font-semibold text-orange-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-led-pulse" />
            {project.categoryName}
          </span>
          <span className="rounded-full border border-neutral-800 bg-neutral-900/90 px-3 py-1 text-xs text-neutral-400">
            {project.statusLabel}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight mb-6">
          {project.title}
        </h1>

        {/* Meta Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4 text-xs mb-8">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-orange-400 shrink-0" />
            <span className="text-neutral-400">کارفرما:</span>
            <span className="font-semibold text-white truncate">
              {project.client}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-cyan-400 shrink-0" />
            <span className="text-neutral-400">موقعیت:</span>
            <span className="font-semibold text-white truncate">
              {project.location}
            </span>
          </div>
          <div className="flex items-center gap-2 col-span-2 sm:col-span-1">
            <Calendar className="h-4 w-4 text-emerald-400 shrink-0" />
            <span className="text-neutral-400">سال اجرا:</span>
            <span className="font-semibold text-white font-mono">
              {project.year}
            </span>
          </div>
        </div>

        {/* Project Media Gallery (Swiper.js with Photos & Video Player) */}
        <div className="mb-10">
          <MediaGallerySwiper
            media={
              project.gallery && project.gallery.length > 0
                ? project.gallery
                : [
                    {
                      type: "image",
                      url: project.imageUrl,
                      title: project.title,
                    },
                  ]
            }
            title={project.title}
          />
        </div>


        {/* Summary & Description */}
        <div className="space-y-4 mb-10 text-neutral-300 leading-relaxed text-sm sm:text-base text-justify">
          <p className="font-medium text-white text-base sm:text-lg">
            {project.summary}
          </p>
          <p>{project.description}</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {project.metrics.map((metric, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-neutral-800 bg-[#111114] p-5 text-center shadow-lg"
            >
              <div className="text-3xl font-black text-orange-400 font-mono mb-1">
                {metric.value}
              </div>
              <div className="text-xs font-semibold text-white mb-1">
                {metric.label}
              </div>
              {metric.hint && (
                <div className="text-[11px] text-neutral-400">
                  {metric.hint}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Challenge & Solution */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
          <div className="rounded-2xl border border-red-950/40 bg-red-950/10 p-6 space-y-2.5">
            <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>چالش‌های پروژه</span>
            </div>
            <p className="text-xs sm:text-sm leading-relaxed text-neutral-300">
              {project.challenge}
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-950/40 bg-emerald-950/10 p-6 space-y-2.5">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <Lightbulb className="h-4 w-4 shrink-0" />
              <span>راهکار مهندسی ققنوس آکادمی</span>
            </div>
            <p className="text-xs sm:text-sm leading-relaxed text-neutral-300">
              {project.solution}
            </p>
          </div>
        </div>

        {/* Hardware Used */}
        <div className="rounded-3xl border border-neutral-800 bg-[#111114] p-6 sm:p-8 mb-10 space-y-4">
          <div className="flex items-center gap-2 text-base font-bold text-white">
            <Cpu className="h-5 w-5 text-orange-400" />
            <span>تجهیزات و فناوری‌های استفاده شده</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {project.hardwareUsed.map((hw, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-xl border border-neutral-800 bg-neutral-900/80 px-4 py-3 text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-orange-400" />
                  <span className="font-semibold text-white">{hw.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-md border border-neutral-700 bg-neutral-800 px-2 py-0.5 text-[11px] text-neutral-300 font-mono">
                    {hw.brand}
                  </span>
                  {hw.count && (
                    <span className="text-[11px] text-neutral-400">
                      {hw.count}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className="rounded-3xl border border-neutral-800 bg-[#111114] p-6 sm:p-8 mb-12 space-y-4">
          <div className="flex items-center gap-2 text-base font-bold text-white">
            <ShieldCheck className="h-5 w-5 text-emerald-400" />
            <span>دستاوردهای کلیدی پروژه</span>
          </div>
          <div className="space-y-2.5">
            {project.results.map((res, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 rounded-xl border border-neutral-800/80 bg-neutral-900/50 p-3.5 text-xs sm:text-sm text-neutral-300"
              >
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{res}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Back Link at bottom */}
        <div className="text-center pt-4 border-t border-neutral-800">
          <Link
            href="/#portfolio"
            className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 px-6 py-3 text-xs sm:text-sm font-semibold text-white transition-colors"
          >
            <ArrowRight className="h-4 w-4" />
            <span>بازگشت به صفحه اصلی و لیست نمونه‌کارها</span>
          </Link>
        </div>
      </Container>
    </div>
  );
}
