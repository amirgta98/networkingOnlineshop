"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Building2,
  Calendar,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  Cpu,
  ArrowLeft,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { ProjectItem } from "../types";
import { MediaGallerySwiper } from "@/shared/components/ui";



interface ProjectDetailModalProps {
  project: ProjectItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProjectDetailModal({
  project,
  isOpen,
  onClose,
}: ProjectDetailModalProps) {
  // ESC key listener & body scroll lock
  React.useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  if (!project) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="project-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
          dir="rtl"
        >
          {/* Backdrop with dark blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
            aria-hidden="true"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 15 }}
            transition={{ type: "spring", duration: 0.35, bounce: 0.15 }}
            className="relative z-10 w-full max-w-3xl overflow-hidden rounded-3xl border border-neutral-800 bg-[#121216] shadow-2xl shadow-black/80 max-h-[90vh] flex flex-col my-auto"
          >
            {/* Top decorative gradient glow */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-24 right-0 h-48 w-96 rounded-full blur-[100px] opacity-25"
              style={{ backgroundColor: project.glowColor }}
            />

            {/* Modal Header */}
            <div className="relative border-b border-neutral-800/80 px-6 py-5 flex items-start justify-between gap-4 bg-[#15151a]">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-xs font-semibold text-orange-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-led-pulse" />
                    {project.categoryName}
                  </span>
                  <span className="rounded-full border border-neutral-800 bg-neutral-900/90 px-3 py-1 text-xs text-neutral-400">
                    {project.statusLabel}
                  </span>
                </div>
                <h3
                  id="project-modal-title"
                  className="text-lg sm:text-xl font-extrabold text-white leading-snug"
                >
                  {project.title}
                </h3>
              </div>

              {/* Close Button */}
              <button
                onClick={onClose}
                aria-label="بستن پنجره"
                className="shrink-0 rounded-xl border border-neutral-800 bg-neutral-900/80 p-2 text-neutral-400 hover:border-neutral-700 hover:bg-neutral-800 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 text-neutral-300">
              {/* Project Media Gallery (Swiper with Photos & Video Player) */}
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
                aspectRatioClass="aspect-[16/9] sm:aspect-[21/9]"
              />


              {/* Meta details bar */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 rounded-2xl border border-neutral-800/80 bg-neutral-900/50 p-3.5 text-xs">
                <div className="flex items-center gap-2 text-neutral-300">
                  <Building2 className="h-4 w-4 text-orange-400 shrink-0" />
                  <span className="text-neutral-400">کارفرما:</span>
                  <span className="font-semibold text-white truncate">
                    {project.client}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-neutral-300">
                  <MapPin className="h-4 w-4 text-cyan-400 shrink-0" />
                  <span className="text-neutral-400">موقعیت:</span>
                  <span className="font-semibold text-white truncate">
                    {project.location}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-neutral-300 col-span-2 sm:col-span-1">
                  <Calendar className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span className="text-neutral-400">سال اجرا:</span>
                  <span className="font-semibold text-white font-mono">
                    {project.year}
                  </span>
                </div>
              </div>

              {/* Project Summary */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
                  خلاصه و اهداف پیاده‌سازی
                </h4>
                <p className="text-sm leading-relaxed text-neutral-300">
                  {project.description}
                </p>
              </div>

              {/* Key Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {project.metrics.map((metric, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl border border-neutral-800/90 bg-neutral-900/80 p-4 text-center backdrop-blur-sm"
                  >
                    <div className="text-2xl font-black text-orange-400 font-mono tracking-tight mb-1">
                      {metric.value}
                    </div>
                    <div className="text-xs font-semibold text-white mb-0.5">
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

              {/* Challenge vs Solution */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-red-950/40 bg-red-950/10 p-5 space-y-2">
                  <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>چالش‌های فنی سازمان</span>
                  </div>
                  <p className="text-xs leading-relaxed text-neutral-300">
                    {project.challenge}
                  </p>
                </div>

                <div className="rounded-2xl border border-emerald-950/40 bg-emerald-950/10 p-5 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                    <Lightbulb className="h-4 w-4 shrink-0" />
                    <span>راهکار مهندسی ققنوس آکادمی</span>
                  </div>
                  <p className="text-xs leading-relaxed text-neutral-300">
                    {project.solution}
                  </p>
                </div>
              </div>

              {/* Hardware & Equipment used */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  <Cpu className="h-4 w-4 text-orange-400" />
                  <span>تجهیزات و فناوری‌های به‌کار رفته</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {project.hardwareUsed.map((hw, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded-xl border border-neutral-800 bg-neutral-900/60 px-4 py-2.5 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-orange-400" />
                        <span className="font-medium text-white">{hw.name}</span>
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

              {/* Results & Outcomes */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-bold text-white">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  <span>نتایج حاصل از اجرای پروژه</span>
                </div>
                <div className="space-y-2">
                  {project.results.map((res, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2.5 rounded-xl border border-neutral-800/80 bg-neutral-900/40 p-3 text-xs text-neutral-300"
                    >
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{res}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-neutral-800/80 bg-[#15151a] p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-neutral-400 text-center sm:text-right">
                نیاز به طراحی یا استقرار زیرساخت مشابه دارید؟
              </div>
              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <button
                  onClick={onClose}
                  className="flex-1 sm:flex-initial rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-2.5 text-xs font-semibold text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors cursor-pointer"
                >
                  بستن
                </button>
                <Link
                  href={`/portfolio/${project.slug}`}
                  onClick={onClose}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl bg-orange-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-orange-950/40 hover:bg-orange-500 active:scale-[0.98] transition-all cursor-pointer"
                >
                  <span>مشاهده صفحه کامل پروژه</span>
                  <ArrowLeft className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
