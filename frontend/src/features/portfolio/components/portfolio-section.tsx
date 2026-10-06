"use client";

import * as React from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
} from "framer-motion";
import {
  Briefcase,
  Building2,
  Calendar,
  MapPin,
  ArrowLeft,
  Sparkles,
  Layers,
  Video,
} from "lucide-react";

import Link from "next/link";
import Image from "next/image";
import { Container } from "@/shared/components/ui/container";
import { toPersianDigits } from "@/shared/lib/utils";

import {
  PORTFOLIO_CATEGORIES,
  PORTFOLIO_PROJECTS,
} from "../mock-data/projects-data";
import { ProjectCategory, ProjectItem } from "../types";
import { ProjectDetailModal } from "./project-detail-modal";

interface PortfolioCardProps {
  project: ProjectItem;
  index: number;
  onOpenDetails: (project: ProjectItem) => void;
}

function PortfolioCard({ project, index, onOpenDetails }: PortfolioCardProps) {
  const shouldReduceMotion = useReducedMotion();
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({
    currentTarget,
    clientX,
    clientY,
  }: React.MouseEvent<HTMLDivElement>) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <motion.div
      initial={{ opacity: shouldReduceMotion ? 1 : 0, y: shouldReduceMotion ? 0 : 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: shouldReduceMotion ? 0 : 0.4,
        delay: shouldReduceMotion ? 0 : index * 0.08,
        ease: [0.23, 1, 0.32, 1],
      }}
      onMouseMove={handleMouseMove}
      className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-neutral-800/90 bg-[#111114]/95 p-5 sm:p-6 shadow-xl shadow-black/40 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-neutral-700 hover:shadow-2xl hover:shadow-black/70"
    >
      {/* ── Spotlight Cursor Glow Effect ─────────────────────────────────── */}
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              320px circle at ${mouseX}px ${mouseY}px,
              ${project.glowColor},
              transparent 80%
            )
          `,
        }}
      />

      {/* ── Project Cover Image & Floating Badges ───────────────────────── */}
      <Link
        href={`/portfolio/${project.slug}`}
        className="relative z-10 block mb-5 overflow-hidden rounded-2xl border border-neutral-800/80 bg-neutral-900 group/img aspect-[16/9]"
      >
        <Image
          src={project.imageUrl}
          alt={project.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover/img:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Badges on image */}
        <div className="absolute top-3 right-3 flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-500/40 bg-black/60 backdrop-blur-md px-3 py-1 text-xs font-semibold text-orange-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.9)] animate-led-pulse" />
            {project.categoryName}
          </span>
        </div>

        {/* Gallery / Video indicator */}
        {project.gallery && project.gallery.length > 1 && (
          <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full border border-white/20 bg-black/60 backdrop-blur-md px-2.5 py-1 text-[11px] font-medium text-white shadow-lg">
            {project.gallery.some((m) => m.type === "video") ? (
              <Video className="h-3 w-3 text-orange-400" />
            ) : (
              <Layers className="h-3 w-3 text-orange-400" />
            )}
            <span className="font-mono">{toPersianDigits(project.gallery.length)} رسانه</span>
          </div>
        )}


        <div className="absolute bottom-3 right-3 left-3 flex items-center justify-between text-xs text-white/90">
          <span className="rounded-full bg-black/60 backdrop-blur-md px-2.5 py-0.5 text-[11px] text-neutral-300">
            {project.statusLabel}
          </span>
          <span className="flex items-center gap-1 font-mono rounded-full bg-black/60 backdrop-blur-md px-2.5 py-0.5 text-[11px] text-neutral-300">
            <Calendar className="h-3 w-3 text-orange-400" />
            <span>{project.year}</span>
          </span>
        </div>
      </Link>

      {/* ── Project Title & Client ────────────────────────────────────────── */}
      <div className="relative z-10 space-y-2 mb-3">
        <Link href={`/portfolio/${project.slug}`} className="block">
          <h3 className="text-base sm:text-lg font-bold text-white leading-snug group-hover:text-orange-400 transition-colors">
            {project.title}
          </h3>
        </Link>
        <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-400">
          <span className="inline-flex items-center gap-1 text-neutral-300">
            <Building2 className="h-3.5 w-3.5 text-orange-400 shrink-0" />
            <span className="font-medium text-white">{project.client}</span>
          </span>
          <span className="text-neutral-600">•</span>
          <span className="inline-flex items-center gap-1 text-neutral-400">
            <MapPin className="h-3.5 w-3.5 text-neutral-500 shrink-0" />
            <span>{project.location}</span>
          </span>
        </div>
      </div>

      {/* ── Summary ──────────────────────────────────────────────────────── */}
      <p className="relative z-10 text-xs sm:text-sm text-neutral-400 leading-relaxed line-clamp-3 mb-5">
        {project.summary}
      </p>

      {/* ── Key Metrics Cards ────────────────────────────────────────────── */}
      <div className="relative z-10 grid grid-cols-3 gap-2 py-3 px-3 rounded-2xl border border-neutral-800/80 bg-neutral-900/60 mb-5">
        {project.metrics.map((m, idx) => (
          <div key={idx} className="text-center">
            <div className="text-sm sm:text-base font-extrabold text-orange-400 font-mono">
              {m.value}
            </div>
            <div className="text-[10px] sm:text-[11px] text-neutral-400 truncate">
              {m.label}
            </div>
          </div>
        ))}
      </div>

      {/* ── Hardware Tags & Action Buttons ────────────────────────────────── */}
      <div className="relative z-10 border-t border-neutral-800/60 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {project.tags.slice(0, 3).map((tag, tIdx) => (
            <span
              key={tIdx}
              className="rounded-lg border border-neutral-800 bg-neutral-900/90 px-2.5 py-1 text-[11px] text-neutral-400 font-medium"
            >
              #{tag}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenDetails(project)}
            className="rounded-xl border border-neutral-800 bg-neutral-900/80 px-3 py-2.5 text-xs font-semibold text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors cursor-pointer"
            title="بررسی سریع مشخصات پروژه"
          >
            جزئیات سریع
          </button>
          <Link
            href={`/portfolio/${project.slug}`}
            className="group/btn inline-flex items-center justify-center gap-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 px-4 py-2.5 text-xs font-semibold text-white transition-all duration-200 active:scale-[0.98] cursor-pointer shadow-lg shadow-orange-950/40"
          >
            <span>مشاهده پروژه</span>
            <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-200 group-hover/btn:-translate-x-1" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

export function PortfolioSection() {
  const [activeCategory, setActiveCategory] =
    React.useState<ProjectCategory>("all");
  const [selectedProject, setSelectedProject] =
    React.useState<ProjectItem | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const filteredProjects = React.useMemo(() => {
    if (activeCategory === "all") return PORTFOLIO_PROJECTS;
    return PORTFOLIO_PROJECTS.filter((p) => p.category === activeCategory);
  }, [activeCategory]);

  const handleOpenDetails = (project: ProjectItem) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <section
      id="portfolio"
      aria-labelledby="portfolio-heading"
      className="relative py-16 sm:py-24 overflow-hidden border-t border-neutral-800/80"
      dir="rtl"
    >
      {/* ── Technical Background Grid & Ambient Glows ──────────────────── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/3 -left-40 h-96 w-96 rounded-full bg-orange-500/10 blur-[140px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-10 -right-40 h-96 w-96 rounded-full bg-indigo-500/10 blur-[140px]"
      />

      <Container className="relative z-10">
        {/* ── Section Header ────────────────────────────────────────────── */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-1.5 text-xs font-semibold text-orange-400 mb-4">
            <Briefcase className="h-3.5 w-3.5 text-orange-400" />
            <span>پروژه‌ها و تجارب اجرایی</span>
            <Sparkles className="h-3 w-3 text-orange-400" />
          </div>

          <h2
            id="portfolio-heading"
            className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight mb-4"
          >
            نمونه‌کارهای اجرایی و زیرساخت‌های شبکه سازمانی
          </h2>
          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
            گوشه‌ای از پروژه‌های زیرساخت دیتاسنتر، سوئیچینگ ۱۰G، لینک‌های فیبر نوری،
            وای‌فای سازمانی و امنیت فایروال پیاده‌سازی شده توسط تیم مهندسی ققنوس آکادمی.
          </p>
        </div>

        {/* ── Category Filter Tabs ──────────────────────────────────────── */}
        <div className="flex items-center justify-center gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar">
          {PORTFOLIO_CATEGORIES.map((tab) => {
            const isActive = activeCategory === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id)}
                className={`relative shrink-0 flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-orange-600 text-white shadow-lg shadow-orange-950/40"
                    : "border border-neutral-800 bg-neutral-900/80 text-neutral-400 hover:border-neutral-700 hover:text-white"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-mono ${
                    isActive
                      ? "bg-orange-700/80 text-white"
                      : "bg-neutral-800 text-neutral-400"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* ── Projects Grid ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {filteredProjects.map((project, index) => (
            <PortfolioCard
              key={project.id}
              project={project}
              index={index}
              onOpenDetails={handleOpenDetails}
            />
          ))}
        </div>

        {/* ── Bottom Project Consultation Banner ────────────────────────── */}
        <div className="mt-12 rounded-3xl border border-neutral-800/80 bg-gradient-to-r from-neutral-900/90 via-[#16161c]/90 to-neutral-900/90 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 text-center md:text-right">
            <h3 className="text-base sm:text-lg font-bold text-white">
              برنامه‌ریزی برای ارتقا یا راه‌اندازی زیرساخت شبکه سازمان خود دارید؟
            </h3>
            <p className="text-xs sm:text-sm text-neutral-400 max-w-xl">
              تیم فنی ققنوس آکادمی با ارائه راهکارهای مهندسی، مشاوره تأمین تجهیزات اصلی
              و بازدید فنی در خدمت پروژه‌های شماست.
            </p>
          </div>

          <Link
            href="/#careers"
            className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-orange-600 hover:bg-orange-500 active:scale-[0.98] text-white px-5 py-3 text-xs sm:text-sm font-bold shadow-lg shadow-orange-950/40 transition-all cursor-pointer"
          >
            <span>درخواست مشاوره و برآورد تجهیزات</span>
            <ArrowLeft className="h-4 w-4" />
          </Link>

        </div>
      </Container>

      {/* ── Modal Dialog ──────────────────────────────────────────────── */}
      <ProjectDetailModal
        project={selectedProject}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </section>
  );
}
