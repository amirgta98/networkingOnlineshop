"use client";

import * as React from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
} from "framer-motion";
import {
  BookOpen,
  Clock,
  Calendar,
  ArrowLeft,
  Sparkles,
  Layers,
  Eye,
  Video,
} from "lucide-react";

import Link from "next/link";
import Image from "next/image";
import { Container } from "@/shared/components/ui/container";
import { toPersianDigits } from "@/shared/lib/utils";

import {
  ARTICLE_CATEGORIES,
  ARTICLES_DATA,
} from "../mock-data/articles-data";
import { ArticleCategory, ArticleItem } from "../types";
import { ArticleReaderModal } from "./article-reader-modal";

interface ArticleCardProps {
  article: ArticleItem;
  index: number;
  onOpenReader: (article: ArticleItem) => void;
}

function ArticleCard({ article, index, onOpenReader }: ArticleCardProps) {
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
              ${article.glowColor},
              transparent 80%
            )
          `,
        }}
      />

      {/* ── Article Cover Image & Floating Badges ───────────────────────── */}
      <Link
        href={`/articles/${article.slug}`}
        className="relative z-10 block mb-5 overflow-hidden rounded-2xl border border-neutral-800/80 bg-neutral-900 group/img aspect-[16/9]"
      >
        <Image
          src={article.imageUrl}
          alt={article.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover/img:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Badges on image */}
        <div className="absolute top-3 right-3 flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-500/40 bg-black/60 backdrop-blur-md px-3 py-1 text-xs font-semibold text-orange-400">
            <BookOpen className="h-3 w-3" />
            {article.categoryName}
          </span>
        </div>

        {/* Gallery / Video indicator */}
        {article.gallery && article.gallery.length > 1 && (
          <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full border border-white/20 bg-black/60 backdrop-blur-md px-2.5 py-1 text-[11px] font-medium text-white shadow-lg">
            {article.gallery.some((m) => m.type === "video") ? (
              <Video className="h-3 w-3 text-orange-400" />
            ) : (
              <Layers className="h-3 w-3 text-orange-400" />
            )}
            <span className="font-mono">{toPersianDigits(article.gallery.length)} رسانه</span>
          </div>
        )}


        <div className="absolute bottom-3 right-3 left-3 flex items-center justify-between text-xs text-white/90">
          <span className="flex items-center gap-1 font-mono rounded-full bg-black/60 backdrop-blur-md px-2.5 py-0.5 text-[11px] text-neutral-300">
            <Clock className="h-3 w-3 text-orange-400" />
            <span>{article.readTime}</span>
          </span>
          <span className="flex items-center gap-1 font-mono rounded-full bg-black/60 backdrop-blur-md px-2.5 py-0.5 text-[11px] text-neutral-300">
            <Calendar className="h-3 w-3 text-neutral-400" />
            <span>{article.publishedAt}</span>
          </span>
        </div>
      </Link>

      {/* ── Article Title ─────────────────────────────────────────────────── */}
      <div className="relative z-10 mb-3">
        <Link href={`/articles/${article.slug}`} className="block">
          <h3 className="text-base sm:text-lg font-bold text-white leading-snug group-hover:text-orange-400 transition-colors">
            {article.title}
          </h3>
        </Link>
      </div>

      {/* ── Excerpt ──────────────────────────────────────────────────────── */}
      <p className="relative z-10 text-xs sm:text-sm text-neutral-400 leading-relaxed line-clamp-3 mb-5">
        {article.excerpt}
      </p>

      {/* ── Author Card & Highlights ─────────────────────────────────────── */}
      <div className="relative z-10 rounded-2xl border border-neutral-800/80 bg-neutral-900/60 p-3 mb-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-600/20 border border-orange-500/30 text-orange-400 text-xs font-bold">
            {article.author.avatarText}
          </div>
          <div>
            <div className="text-xs font-semibold text-white">
              {article.author.name}
            </div>
            <div className="text-[11px] text-neutral-400">
              {article.author.role}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 text-[11px] text-neutral-400 font-mono">
          <Eye className="h-3.5 w-3.5 text-neutral-500" />
          <span>{article.views}</span>
        </div>
      </div>

      {/* ── Tags & Action Buttons ─────────────────────────────────────────── */}
      <div className="relative z-10 border-t border-neutral-800/60 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {article.tags.slice(0, 3).map((tag, tIdx) => (
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
            onClick={() => onOpenReader(article)}
            className="rounded-xl border border-neutral-800 bg-neutral-900/80 px-3 py-2.5 text-xs font-semibold text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors cursor-pointer"
            title="مطالعه سریع در پنجره پاپ‌آپ"
          >
            مطالعه سریع
          </button>
          <Link
            href={`/articles/${article.slug}`}
            className="group/btn inline-flex items-center justify-center gap-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 px-4 py-2.5 text-xs font-semibold text-white transition-all duration-200 active:scale-[0.98] cursor-pointer shadow-lg shadow-orange-950/40"
          >
            <span>مشاهده مقاله</span>
            <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-200 group-hover/btn:-translate-x-1" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

export function ArticlesSection() {
  const [activeCategory, setActiveCategory] =
    React.useState<ArticleCategory>("all");
  const [selectedArticle, setSelectedArticle] =
    React.useState<ArticleItem | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const filteredArticles = React.useMemo(() => {
    if (activeCategory === "all") return ARTICLES_DATA;
    return ARTICLES_DATA.filter((a) => a.category === activeCategory);
  }, [activeCategory]);

  const handleOpenReader = (article: ArticleItem) => {
    setSelectedArticle(article);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <section
      id="articles"
      aria-labelledby="articles-heading"
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
        className="pointer-events-none absolute top-1/3 -right-40 h-96 w-96 rounded-full bg-cyan-500/10 blur-[140px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-10 -left-40 h-96 w-96 rounded-full bg-orange-500/10 blur-[140px]"
      />

      <Container className="relative z-10">
        {/* ── Section Header ────────────────────────────────────────────── */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-1.5 text-xs font-semibold text-orange-400 mb-4">
            <BookOpen className="h-3.5 w-3.5 text-orange-400" />
            <span>دانش فنی و مقالات</span>
            <Sparkles className="h-3 w-3 text-orange-400" />
          </div>

          <h2
            id="articles-heading"
            className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight mb-4"
          >
            آموزش‌ها و راهنماهای تخصصی مهندسی شبکه
          </h2>
          <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
            بررسی تخصصی تجهیزات، راهنمای انتخاب سوئیچ و فیبر نوری، کانفیگ QoS در میکروتیک
            و الزامات کابل‌کشی ساخت‌یافته تالیف شده توسط تیم فنی ققنوس آکادمی.
          </p>
        </div>

        {/* ── Category Filter Tabs ──────────────────────────────────────── */}
        <div className="flex items-center justify-center gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar">
          {ARTICLE_CATEGORIES.map((tab) => {
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

        {/* ── Articles Grid ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {filteredArticles.map((article, index) => (
            <ArticleCard
              key={article.id}
              article={article}
              index={index}
              onOpenReader={handleOpenReader}
            />
          ))}
        </div>
      </Container>

      {/* ── Modal Dialog ──────────────────────────────────────────────── */}
      <ArticleReaderModal
        article={selectedArticle}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </section>
  );
}
