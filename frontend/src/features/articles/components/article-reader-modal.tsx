"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Clock,
  Calendar,
  Eye,
  CheckCircle2,
  Share2,
  Check,
  BookOpen,
  ArrowLeft,
  BookmarkCheck,
} from "lucide-react";
import Link from "next/link";

import { ArticleItem } from "../types";
import { MediaGallerySwiper } from "@/shared/components/ui";



interface ArticleReaderModalProps {
  article: ArticleItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ArticleReaderModal({
  article,
  isOpen,
  onClose,
}: ArticleReaderModalProps) {
  const [isCopied, setIsCopied] = React.useState(false);

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

  const handleShare = () => {
    if (typeof window !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  if (!article) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="article-reader-title"
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
              className="pointer-events-none absolute -top-24 left-0 h-48 w-96 rounded-full blur-[100px] opacity-25"
              style={{ backgroundColor: article.glowColor }}
            />

            {/* Modal Header */}
            <div className="relative border-b border-neutral-800/80 px-6 py-5 flex items-start justify-between gap-4 bg-[#15151a]">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 font-semibold text-orange-400">
                    <BookOpen className="h-3 w-3" />
                    {article.categoryName}
                  </span>
                  <span className="flex items-center gap-1 text-neutral-400">
                    <Clock className="h-3.5 w-3.5 text-neutral-500" />
                    <span>{article.readTime}</span>
                  </span>
                  <span className="text-neutral-600">•</span>
                  <span className="flex items-center gap-1 text-neutral-400">
                    <Calendar className="h-3.5 w-3.5 text-neutral-500" />
                    <span>{article.publishedAt}</span>
                  </span>
                </div>

                <h3
                  id="article-reader-title"
                  className="text-lg sm:text-xl font-extrabold text-white leading-snug"
                >
                  {article.title}
                </h3>
              </div>

              {/* Close Button */}
              <button
                onClick={onClose}
                aria-label="بستن مقاله"
                className="shrink-0 rounded-xl border border-neutral-800 bg-neutral-900/80 p-2 text-neutral-400 hover:border-neutral-700 hover:bg-neutral-800 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body (Scrollable Article Content) */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 text-neutral-300">
              {/* Media Gallery (Swiper with Photos & Video Player) */}
              <MediaGallerySwiper
                media={
                  article.gallery && article.gallery.length > 0
                    ? article.gallery
                    : [
                        {
                          type: "image",
                          url: article.imageUrl,
                          title: article.title,
                        },
                      ]
                }
                title={article.title}
                aspectRatioClass="aspect-[16/9] sm:aspect-[21/9]"
              />


              {/* Author Card */}
              <div className="flex items-center justify-between gap-4 rounded-2xl border border-neutral-800/80 bg-neutral-900/60 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-600/20 border border-orange-500/30 text-orange-400 font-bold text-sm">
                    {article.author.avatarText}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">
                      {article.author.name}
                    </div>
                    <div className="text-xs text-neutral-400">
                      {article.author.role}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-xs text-neutral-400 font-mono">
                  <Eye className="h-3.5 w-3.5 text-neutral-500" />
                  <span>{article.views}</span>
                </div>
              </div>

              {/* Key Takeaways Box */}
              <div className="rounded-2xl border border-orange-500/30 bg-orange-950/20 p-5 space-y-3">
                <div className="flex items-center gap-2 text-orange-400 font-bold text-sm">
                  <BookmarkCheck className="h-4 w-4" />
                  <span>نکات کلیدی و کاربردی این مقاله</span>
                </div>
                <div className="space-y-2">
                  {article.keyTakeaways.map((point, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2.5 text-xs text-neutral-200"
                    >
                      <CheckCircle2 className="h-4 w-4 text-orange-400 shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{point}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Article Paragraphs */}
              <div className="space-y-4 text-sm leading-relaxed text-neutral-300">
                {article.paragraphs.map((p, idx) => (
                  <p key={idx} className="text-justify leading-7">
                    {p}
                  </p>
                ))}
              </div>

              {/* Tags list */}
              <div className="border-t border-neutral-800/80 pt-5 flex flex-wrap items-center gap-2">
                <span className="text-xs text-neutral-400 font-medium">برچسب‌ها:</span>
                {article.tags.map((tag, tIdx) => (
                  <span
                    key={tIdx}
                    className="rounded-lg border border-neutral-800 bg-neutral-900/90 px-2.5 py-1 text-xs text-neutral-400 font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-neutral-800/80 bg-[#15151a] p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-neutral-400 text-center sm:text-right">
                علاقه‌مند به مطالعه مقالات و راهنماهای بیشتر در وبلاگ ققنوس آکادمی هستید؟
              </div>
              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <button
                  onClick={handleShare}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-2.5 text-xs font-semibold text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors cursor-pointer"
                >
                  {isCopied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      <span>لینک کپی شد</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="h-3.5 w-3.5" />
                      <span>اشتراک‌گذاری</span>
                    </>
                  )}
                </button>
                <Link
                  href={`/articles/${article.slug}`}
                  onClick={onClose}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl bg-orange-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-orange-500 active:scale-[0.98] transition-all cursor-pointer shadow-lg shadow-orange-950/40"
                >
                  <span>مشاهده صفحه کامل مقاله</span>
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
