"use client";

import * as React from "react";
import { motion, useMotionTemplate, useMotionValue, useReducedMotion } from "framer-motion";
import {
  Network,
  Router,
  Wifi,
  Radio,
  Cable,
  Server,
  ArrowLeft,
  Sparkles,
  Layers,
  CheckCircle2,
} from "lucide-react";
import { ProductCategory } from "../types";
import { Container } from "@/shared/components/ui/container";

interface CategoryItem {
  id: ProductCategory;
  title: string;
  count: string;
  badge: string;
  description: string;
  specs: string[];
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  glowColor: string;
  gradientBg: string;
  borderColor: string;
  buttonText: string;
}

const INFRASTRUCTURE_CATEGORIES: CategoryItem[] = [
  {
    id: "switches",
    title: "سوئیچ‌های شبکه سازمانی",
    count: "+۲۴ محصول تخصصی",
    badge: "Managed & PoE+",
    description:
      "سوئیچ‌های لایه ۲ و لایه ۳ سیسکو و میکروتیک برای تجمیع پرسرعت داده، تأمین برق تحت شبکه (PoE+) و آپلینک‌های فیبر ۱۰G با پایداری ۹۹.۹۹٪ سازمانی.",
    specs: ["پورت‌های گیگابیت و 10G", "پشتیبانی از فناوری Stacking", "مدیریت لایه ۳ پیشرفته"],
    icon: Network,
    accentColor: "text-orange-400",
    glowColor: "rgba(234, 88, 12, 0.18)",
    gradientBg: "from-orange-500/15 via-orange-950/20 to-transparent",
    borderColor: "group-hover:border-orange-500/50",
    buttonText: "مشاهده سوئیچ‌های شبکه",
  },
  {
    id: "routers",
    title: "روتر و فایروال سخت‌افزاری",
    count: "+۱۸ محصول تخصصی",
    badge: "Core & Security",
    description:
      "مسیریاب‌های هسته شبکه سازمانی، روتربوردهای صنعتی و دیوارهای آتش با پردازنده‌های چند هسته‌ای قدرتمند جهت هدایت امن ترافیک، تونلینگ و IPsec.",
    specs: ["پردازنده‌های چند هسته‌ای ۶۴بیتی", "پروتکل‌های BGP و OSPF", "رمزنگاری شتاب‌یافته سخت‌افزاری"],
    icon: Router,
    accentColor: "text-indigo-400",
    glowColor: "rgba(99, 102, 241, 0.18)",
    gradientBg: "from-indigo-500/15 via-indigo-950/20 to-transparent",
    borderColor: "group-hover:border-indigo-500/50",
    buttonText: "مشاهده روتر و فایروال",
  },
  {
    id: "wireless",
    title: "اکسس‌پوینت و تجهیزات بی‌سیم",
    count: "+۱۵ محصول تخصصی",
    badge: "Wi-Fi 6 / Enterprise",
    description:
      "اکسس‌پوینت‌های سقفی و صنعتی یوبیکیوتی و میکروتیک با استاندارد Wi-Fi 6، پوشش‌دهی ۳۶۰ درجه محیط‌های پرتردد و رومینگ هوشمند بدون قطعی اتصال.",
    specs: ["فناوری MU-MIMO 4x4", "پشتیبانی بیش از ۳۵۰ کاربر همزمان", "مدیریت متمرکز ابری UniFi"],
    icon: Wifi,
    accentColor: "text-emerald-400",
    glowColor: "rgba(16, 185, 129, 0.18)",
    gradientBg: "from-emerald-500/15 via-emerald-950/20 to-transparent",
    borderColor: "group-hover:border-emerald-500/50",
    buttonText: "مشاهده تجهیزات بی‌سیم",
  },
  {
    id: "fiber",
    title: "ماژول و تجهیزات فیبر نوری",
    count: "+۳۲ محصول تخصصی",
    badge: "SFP+ / 10G & 40G",
    description:
      "انواع ترنسیورهای پرسرعت SFP و SFP+، ماژول‌های مالتی‌مود و سینگل‌مود با طول موج‌های استاندارد و پچ‌پنل‌های ODF برای برقراری ارتباطات زیرساختی دیتاسنتر.",
    specs: ["سرعت‌های 1.25G تا 10G+", "بردهای انتقال تا ۴۰ کیلومتر", "قابلیت مانیتورینگ دیجیتال DDM"],
    icon: Radio,
    accentColor: "text-cyan-400",
    glowColor: "rgba(6, 182, 212, 0.18)",
    gradientBg: "from-cyan-500/15 via-cyan-950/20 to-transparent",
    borderColor: "group-hover:border-cyan-500/50",
    buttonText: "مشاهده ماژول و فیبر نوری",
  },
  {
    id: "cables",
    title: "کابل‌کشی ساخت‌یافته شبکه",
    count: "+۲۸ محصول تخصصی",
    badge: "Cat6 / Cat6A / Cat7",
    description:
      "کابل‌های شبکه اورجینال تمام مس نگزانس و لگراند در حلقه‌های ۳۰۵ و ۵۰۰ متری با تست فلوک چنل و پرمننت، روکش‌های نسوز LSZH و شیلدهای ضد نویز SFTP.",
    specs: ["هادی مس خالص 23AWG", "روکش‌های ضد دود و شعله LSZH", "پاس‌کننده استاندارد تست فلوک"],
    icon: Cable,
    accentColor: "text-amber-400",
    glowColor: "rgba(245, 158, 11, 0.18)",
    gradientBg: "from-amber-500/15 via-amber-950/20 to-transparent",
    borderColor: "group-hover:border-amber-500/50",
    buttonText: "مشاهده کابل‌های شبکه",
  },
  {
    id: "passive",
    title: "تجهیزات پسیو و رک سرور",
    count: "+۴۵ محصول تخصصی",
    badge: "Server Racks & PDU",
    description:
      "انواع رک‌های ایستاده و دیواری مستحکم سروری با عمق‌های متنوع، پچ‌پنل‌های لود شده و آنلود، کیستون‌های استاندارد تول‌لس و ماژول‌های توزیع هوشمند برق (PDU).",
    specs: ["استاندارد ۱۹ اینچ دیتاسنتری", "بدنه تمام فلزی الکترواستاتیک", "سیستم‌های خنک‌کننده و توزیع برق"],
    icon: Server,
    accentColor: "text-rose-400",
    glowColor: "rgba(244, 63, 94, 0.18)",
    gradientBg: "from-rose-500/15 via-rose-950/20 to-transparent",
    borderColor: "group-hover:border-rose-500/50",
    buttonText: "مشاهده پسیو و رک",
  },
];

function CategoryCard({
  category,
  index,
  onSelect,
}: {
  category: CategoryItem;
  index: number;
  onSelect: (id: ProductCategory) => void;
}) {
  const shouldReduceMotion = useReducedMotion();
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  const IconComponent = category.icon;

  const cardVariants = {
    hidden: {
      opacity: shouldReduceMotion ? 1 : 0,
      y: shouldReduceMotion ? 0 : 20,
      scale: shouldReduceMotion ? 1 : 0.97,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: shouldReduceMotion ? 0 : 0.45,
        delay: shouldReduceMotion ? 0 : index * 0.08,
        ease: [0.23, 1, 0.32, 1] as const,
      },
    },
  };

  return (
    <motion.div
      variants={cardVariants}
      onMouseMove={handleMouseMove}
      className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-neutral-800/90 bg-[#111114]/90 p-6 sm:p-7 shadow-xl shadow-black/40 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/60 ${category.borderColor}`}
    >
      {/* ── Spotlight Cursor Glow Effect ───────────────────────────────── */}
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              320px circle at ${mouseX}px ${mouseY}px,
              ${category.glowColor},
              transparent 80%
            )
          `,
        }}
      />

      {/* ── Ambient Background Gradient ──────────────────────────────────── */}
      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-b ${category.gradientBg} opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
      />

      {/* ── Card Content ─────────────────────────────────────────────────── */}
      <div className="relative z-10 flex flex-col flex-1">
        {/* Top bar: Icon + LED count badge */}
        <div className="flex items-center justify-between gap-3 mb-5">
          {/* Icon badge with pulsing glow */}
          <div className="relative">
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-neutral-900/90 ${category.accentColor} shadow-inner transition-transform duration-300 group-hover:scale-110 group-hover:rotate-1`}
            >
              <IconComponent className="h-6 w-6 transition-transform duration-300 group-hover:scale-105" />
            </div>
            {/* Subtle glow indicator under icon */}
            <div
              className="absolute -inset-1 -z-10 rounded-xl opacity-0 blur-md transition-opacity duration-300 group-hover:opacity-60"
              style={{ backgroundColor: category.glowColor }}
            />
          </div>

          {/* Product count & active status */}
          <div className="flex items-center gap-2 rounded-full border border-neutral-800/80 bg-neutral-900/80 px-3 py-1 text-xs text-neutral-300 backdrop-blur-sm">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(16,185,129,0.9)] animate-led-pulse" />
            <span className="font-semibold text-neutral-200 tabular-nums">{category.count}</span>
          </div>
        </div>

        {/* Category Header */}
        <div className="mb-2">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-mono tracking-wider uppercase text-neutral-500 font-medium">
              {category.badge}
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-white transition-colors duration-200 group-hover:text-orange-400">
            {category.title}
          </h3>
        </div>

        {/* Description */}
        <p className="text-xs sm:text-sm leading-relaxed text-neutral-400 line-clamp-3 mb-5">
          {category.description}
        </p>

        {/* Specs highlights */}
        <div className="mt-auto mb-6 space-y-1.5 border-t border-neutral-800/60 pt-4">
          {category.specs.map((spec, sIdx) => (
            <div key={sIdx} className="flex items-center gap-2 text-xs text-neutral-400">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-neutral-500 group-hover:text-emerald-400 transition-colors" />
              <span className="truncate">{spec}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Bottom Action Button / Navigation Link ───────────────────────── */}
      <div className="relative z-10 pt-2 border-t border-neutral-800/50">
        <button
          onClick={() => onSelect(category.id)}
          className="group/btn flex w-full items-center justify-between rounded-xl border border-neutral-800 bg-neutral-900/60 px-4 py-3 text-xs sm:text-sm font-medium text-neutral-200 transition-all duration-200 hover:border-orange-500/50 hover:bg-neutral-800/80 hover:text-white active:scale-[0.98] cursor-pointer"
        >
          <span className="flex items-center gap-2">
            <span>{category.buttonText}</span>
          </span>
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-neutral-800/80 text-neutral-300 transition-all duration-200 group-hover/btn:bg-orange-500 group-hover/btn:text-white group-hover/btn:-translate-x-1">
            <ArrowLeft className="h-3.5 w-3.5 transition-transform" />
          </span>
        </button>
      </div>
    </motion.div>
  );
}

export function InfrastructureCategoriesSection() {
  const shouldReduceMotion = useReducedMotion();

  const handleSelectCategory = React.useCallback((categoryId: ProductCategory) => {
    // 1. Dispatch custom event for useCatalogFilter to react
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("select-catalog-category", { detail: categoryId })
      );

      // 2. Smoothly scroll into the catalog section
      const catalogEl = document.getElementById("catalog");
      if (catalogEl) {
        catalogEl.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }, []);

  const containerVariants = {
    hidden: { opacity: shouldReduceMotion ? 1 : 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.08,
      },
    },
  };

  return (
    <section
      id="infrastructure-categories"
      aria-labelledby="infra-categories-heading"
      className="relative py-16 sm:py-24 overflow-hidden border-t border-neutral-800/60"
      dir="rtl"
    >
      {/* ── Subtle Technical Background Grid & Ambient Glows ───────────── */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 right-1/4 h-96 w-96 rounded-full bg-orange-500/5 blur-[120px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 left-1/4 h-96 w-96 rounded-full bg-indigo-500/5 blur-[120px]"
      />

      <Container className="relative z-10">
        {/* ── Section Header ─────────────────────────────────────────────── */}
        <div className="mx-auto max-w-3xl text-center mb-12 sm:mb-16">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-3.5 py-1.5 text-xs font-semibold text-orange-400 mb-4">
            <Layers className="h-3.5 w-3.5" />
            <span>معماری شبکه و دیتاسنتر</span>
            <Sparkles className="h-3 w-3" />
          </div>

          {/* Main Title */}
          <h2
            id="infra-categories-heading"
            className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight mb-4"
          >
            دسته‌بندی تخصصی تجهیزات زیرساخت
          </h2>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-neutral-400 leading-relaxed max-w-2xl mx-auto">
            تامین مستقیم تجهیزات پیشرفته شبکه، ارتباطات فیبر نوری، سرور و رک‌های صنعتی از برترین
            برندهای معتبر جهانی سیسکو، میکروتیک، نگزانس، لگراند و یوبیکیوتی با ضمانت اصالت فیزیکی.
          </p>
        </div>

        {/* ── 6 Category Boxes Grid ──────────────────────────────────────── */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6"
        >
          {INFRASTRUCTURE_CATEGORIES.map((cat, idx) => (
            <CategoryCard
              key={cat.id}
              category={cat}
              index={idx}
              onSelect={handleSelectCategory}
            />
          ))}
        </motion.div>
      </Container>
    </section>
  );
}
