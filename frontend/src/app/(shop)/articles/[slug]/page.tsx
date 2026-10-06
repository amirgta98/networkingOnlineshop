import * as React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";

import { Container } from "@/shared/components/ui/container";
import { MediaGallerySwiper } from "@/shared/components/ui";
import {
  ARTICLES_DATA,
} from "@/features/articles";


import {
  ArrowRight,
  Clock,
  Calendar,
  Eye,
  BookOpen,
  BookmarkCheck,
  CheckCircle2,
} from "lucide-react";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return ARTICLES_DATA.map((article) => ({
    slug: article.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = ARTICLES_DATA.find((a) => a.slug === slug);

  if (!article) {
    return {
      title: "مقاله مورد نظر یافت نشد | ققنوس آکادمی",
    };
  }

  return {
    title: `${article.title} | مقالات ققنوس آکادمی`,
    description: article.excerpt,
  };
}

export default async function ArticleDetailPage({ params }: Props) {
  const { slug } = await params;
  const article = ARTICLES_DATA.find((a) => a.slug === slug);

  if (!article) {
    notFound();
  }

  return (
    <div className="min-h-screen py-10 sm:py-16 text-neutral-200" dir="rtl">
      <Container className="max-w-4xl">
        {/* Back Link */}
        <Link
          href="/#articles"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-orange-400 hover:text-orange-300 transition-colors mb-8 group"
        >
          <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
          <span>بازگشت به مقالات تخصصی</span>
        </Link>

        {/* Top Badges & Meta */}
        <div className="flex flex-wrap items-center gap-3 mb-4 text-xs">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-500/30 bg-orange-500/10 px-3.5 py-1 font-semibold text-orange-400">
            <BookOpen className="h-3.5 w-3.5" />
            {article.categoryName}
          </span>
          <span className="flex items-center gap-1 text-neutral-400 font-mono">
            <Clock className="h-3.5 w-3.5 text-neutral-500" />
            <span>{article.readTime}</span>
          </span>
          <span className="text-neutral-600">•</span>
          <span className="flex items-center gap-1 text-neutral-400 font-mono">
            <Calendar className="h-3.5 w-3.5 text-neutral-500" />
            <span>{article.publishedAt}</span>
          </span>
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight mb-6">
          {article.title}
        </h1>

        {/* Author Card */}
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-600/20 border border-orange-500/30 text-orange-400 font-bold text-base">
              {article.author.avatarText}
            </div>
            <div>
              <div className="text-sm sm:text-base font-bold text-white">
                {article.author.name}
              </div>
              <div className="text-xs text-neutral-400">
                {article.author.role}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-mono">
            <Eye className="h-4 w-4 text-neutral-500" />
            <span>{article.views}</span>
          </div>
        </div>

        {/* Article Media Gallery (Swiper.js with Photos & Video Player) */}
        <div className="mb-10">
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
          />
        </div>


        {/* Key Takeaways */}
        <div className="rounded-2xl border border-orange-500/30 bg-orange-950/20 p-6 sm:p-7 space-y-4 mb-10">
          <div className="flex items-center gap-2 text-orange-400 font-bold text-base">
            <BookmarkCheck className="h-5 w-5" />
            <span>نکات کلیدی و کاربردی این مقاله</span>
          </div>
          <div className="space-y-3">
            {article.keyTakeaways.map((point, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 text-xs sm:text-sm text-neutral-200"
              >
                <CheckCircle2 className="h-4 w-4 text-orange-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{point}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Content Paragraphs */}
        <div className="space-y-6 text-sm sm:text-base leading-8 text-neutral-300 text-justify mb-12">
          {article.paragraphs.map((p, idx) => (
            <p key={idx}>{p}</p>
          ))}
        </div>

        {/* Tags */}
        <div className="border-t border-neutral-800 pt-6 flex flex-wrap items-center gap-2 mb-12">
          <span className="text-xs text-neutral-400 font-medium">برچسب‌ها:</span>
          {article.tags.map((tag, tIdx) => (
            <span
              key={tIdx}
              className="rounded-lg border border-neutral-800 bg-neutral-900/90 px-3 py-1 text-xs text-neutral-300 font-medium"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Bottom Back Button */}
        <div className="text-center pt-4 border-t border-neutral-800">
          <Link
            href="/#articles"
            className="inline-flex items-center gap-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 px-6 py-3 text-xs sm:text-sm font-semibold text-white transition-colors"
          >
            <ArrowRight className="h-4 w-4" />
            <span>بازگشت به صفحه اصلی و لیست مقالات</span>
          </Link>
        </div>
      </Container>
    </div>
  );
}
