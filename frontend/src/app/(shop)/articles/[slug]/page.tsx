import * as React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

import { Container } from "@/shared/components/ui/container";
import { MediaGallerySwiper } from "@/shared/components/ui";
import { articlesApi } from "@/features/articles/api/articles-api";
import { ARTICLES_DATA } from "@/features/articles/mock-data/articles-data";
import { ArticleContentRenderer } from "@/features/articles/components/article-content-renderer";
import type { ArticleItem } from "@/features/articles/types";

import {
  ArrowRight,
  Clock,
  Calendar,
  Eye,
  BookOpen,
  BookmarkCheck,
  CheckCircle2,
  Share2,
  Tag,
  Sparkles,
} from "lucide-react";

type Props = {
  params: Promise<{ slug: string }> | { slug: string };
};

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://fonix-accademic.ir";

function safeDecodeSlug(slug: string): string {
  let decoded = slug;
  for (let i = 0; i < 3; i++) {
    try {
      const next = decodeURIComponent(decoded);
      if (next === decoded) break;
      decoded = next;
    } catch {
      break;
    }
  }
  return decoded;
}

async function getArticle(slug: string): Promise<(ArticleItem & { relatedArticles?: ArticleItem[] }) | null> {
  const cleanSlug = safeDecodeSlug(slug);

  try {
    const res = await articlesApi.getArticleBySlug(cleanSlug);
    if (res && res.title) {
      return res;
    }
  } catch (err) {
    console.warn(`[ArticleDetailPage] API fetch failed for slug "${cleanSlug}":`, err);
  }

  // Fallback to local mock data if API is unreachable or item exists locally
  const normalizedClean = cleanSlug.replace(/\s+/g, "-");
  const fallback = ARTICLES_DATA.find((a) => {
    const s = safeDecodeSlug(a.slug);
    return (
      a.slug === cleanSlug ||
      s === cleanSlug ||
      a.id === cleanSlug ||
      s.replace(/\s+/g, "-") === normalizedClean ||
      a.slug.replace(/\s+/g, "-") === normalizedClean
    );
  });
  if (fallback) {
    return fallback;
  }

  return null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await Promise.resolve(params);
  const slug = safeDecodeSlug(resolvedParams.slug);
  const article = await getArticle(slug);

  if (!article) {
    return {
      title: "مقاله مورد نظر یافت نشد | ققنوس آکادمی",
      robots: { index: false, follow: false },
    };
  }

  const title = article.metaTitle || `${article.title} | مقالات ققنوس آکادمی`;
  const description = article.metaDescription || article.excerpt;
  const canonical = article.canonicalUrl || `${SITE_URL}/articles/${article.slug}`;
  const ogImage = article.ogImage || article.featuredImage || article.imageUrl;

  return {
    title,
    description,
    keywords: article.seoKeywords || article.tags?.join(", "),
    alternates: {
      canonical,
    },
    robots: {
      index: article.isIndexable !== false,
      follow: article.isFollowable !== false,
    },
    openGraph: {
      title: article.ogTitle || title,
      description: article.ogDescription || description,
      url: canonical,
      siteName: "ققنوس آکادمی",
      type: "article",
      publishedTime: article.publishedAt,
      authors: [article.authorName || article.author?.name || "ققنوس آکادمی"],
      images: ogImage ? [{ url: ogImage, alt: article.title }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: article.ogTitle || title,
      description: article.ogDescription || description,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

export default async function ArticleDetailPage({ params }: Props) {
  const resolvedParams = await Promise.resolve(params);
  const slug = safeDecodeSlug(resolvedParams.slug);
  const article = await getArticle(slug);

  if (!article) {
    notFound();
  }

  const canonicalUrl = article.canonicalUrl || `${SITE_URL}/articles/${article.slug}`;
  const coverImage = article.featuredImage || article.imageUrl;
  const authorName = article.authorName || article.author?.name || "کارشناس فنی ققنوس";
  const authorRole = article.authorRole || article.author?.role || "مهندس ارشد زیرساخت";
  const authorAvatar = article.authorAvatar || article.author?.avatarUrl;

  // Schema.org Structured Data
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "صفحه اصلی",
            "item": SITE_URL,
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "مقالات تخصصی",
            "item": `${SITE_URL}/#articles`,
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": article.title,
            "item": canonicalUrl,
          },
        ],
      },
      {
        "@type": ["Article", "BlogPosting"],
        "@id": canonicalUrl,
        "headline": article.title,
        "description": article.excerpt,
        "image": coverImage ? [coverImage] : undefined,
        "datePublished": article.publishedAt,
        "dateModified": article.updatedAt || article.publishedAt,
        "author": {
          "@type": "Person",
          "name": authorName,
          "jobTitle": authorRole,
        },
        "publisher": {
          "@type": "Organization",
          "name": "ققنوس آکادمی (Fonix Academic)",
          "logo": {
            "@type": "ImageObject",
            "url": `${SITE_URL}/images/logo.png`,
          },
        },
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": canonicalUrl,
        },
      },
    ],
  };

  // Compile and sanitize media items
  const rawGallery = Array.isArray(article.gallery) ? article.gallery : [];
  const rawVideos = Array.isArray(article.videos) ? article.videos : [];

  const sanitizedGallery = rawGallery
    .filter((g: any) => g && (typeof g === "string" || (typeof g === "object" && !Array.isArray(g) && g.url)))
    .map((g: any, idx: number) => {
      if (typeof g === "string") {
        return {
          id: `gallery-img-${idx}`,
          type: "image" as const,
          url: g,
          title: article.title,
        };
      }
      return {
        id: g.id || `gallery-img-${idx}`,
        type: (g.type === "video" ? "video" : "image") as "image" | "video",
        url: g.url,
        title: g.title || article.title,
        caption: g.caption,
        thumbnailUrl: g.thumbnailUrl,
        duration: g.duration,
      };
    });

  const sanitizedVideos = rawVideos
    .filter((v: any) => v && (typeof v === "string" || (typeof v === "object" && !Array.isArray(v) && v.url)))
    .map((v: any, idx: number) => {
      if (typeof v === "string") {
        return {
          id: `video-item-${idx}`,
          type: "video" as const,
          url: v,
          title: article.title,
        };
      }
      return {
        id: v.id || `video-item-${idx}`,
        type: "video" as const,
        url: v.url,
        title: v.title || article.title,
        caption: v.caption,
        thumbnailUrl: v.thumbnailUrl,
        duration: v.duration,
      };
    });

  const mediaItems: Array<{
    id?: string;
    type: "image" | "video";
    url: string;
    title?: string;
    caption?: string;
    thumbnailUrl?: string;
    duration?: string;
  }> = [];

  if (coverImage) {
    mediaItems.push({
      id: "featured-cover",
      type: "image",
      url: coverImage,
      title: article.title,
      caption: article.featuredImageAlt,
    });
  }

  for (const item of sanitizedGallery) {
    if (item.url !== coverImage) {
      mediaItems.push(item);
    }
  }

  for (const vid of sanitizedVideos) {
    mediaItems.push(vid);
  }

  return (
    <div className="min-h-screen py-10 sm:py-16 text-neutral-200" dir="rtl">
      {/* Schema.org JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Container className="max-w-4xl">
        {/* Breadcrumb Navigation */}
        <nav aria-label="مسیر راهنما" className="flex items-center gap-2 text-xs text-neutral-400 mb-6 flex-wrap">
          <Link href="/" className="hover:text-white transition-colors">صفحه اصلی</Link>
          <span className="text-neutral-600">/</span>
          <Link href="/#articles" className="hover:text-white transition-colors">مقالات تخصصی</Link>
          <span className="text-neutral-600">/</span>
          <span className="text-amber-400 truncate max-w-[200px] sm:max-w-md">{article.title}</span>
        </nav>

        {/* Back Link */}
        <Link
          href="/#articles"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-orange-400 hover:text-orange-300 transition-colors mb-6 group"
        >
          <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
          <span>بازگشت به مقالات تخصصی</span>
        </Link>

        {/* Top Badges & Meta */}
        <div className="flex flex-wrap items-center gap-3 mb-4 text-xs">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-500/30 bg-orange-500/10 px-3.5 py-1 font-semibold text-orange-400">
            <BookOpen className="h-3.5 w-3.5" />
            {article.categoryName || article.category}
          </span>
          {article.readTime && (
            <span className="flex items-center gap-1 text-neutral-400 font-mono">
              <Clock className="h-3.5 w-3.5 text-neutral-500" />
              <span>{article.readTime}</span>
            </span>
          )}
          <span className="text-neutral-600">•</span>
          <span className="flex items-center gap-1 text-neutral-400 font-mono">
            <Calendar className="h-3.5 w-3.5 text-neutral-500" />
            <span>{article.publishedAt || "امروز"}</span>
          </span>
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight mb-6">
          {article.title}
        </h1>

        {/* Author Card */}
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4 mb-8">
          <div className="flex items-center gap-3">
            {authorAvatar ? (
              <img
                src={authorAvatar}
                alt={authorName}
                className="h-12 w-12 rounded-xl object-cover border border-orange-500/30"
              />
            ) : (
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-600/20 border border-orange-500/30 text-orange-400 font-bold text-base">
                {authorName.charAt(0)}
              </div>
            )}
            <div>
              <div className="text-sm sm:text-base font-bold text-white">
                {authorName}
              </div>
              <div className="text-xs text-neutral-400">
                {authorRole}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-neutral-400 font-mono">
            <Eye className="h-4 w-4 text-neutral-500" />
            <span>{article.views || 0} بازدید</span>
          </div>
        </div>

        {/* Article Media Gallery (Swiper.js with Photos & Video Player) */}
        <div className="mb-10">
          <MediaGallerySwiper
            media={mediaItems}
            title={article.title}
          />
        </div>

        {/* Excerpt */}
        {article.excerpt && (
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6 mb-8 text-sm sm:text-base leading-relaxed text-amber-200/90 font-medium">
            {article.excerpt}
          </div>
        )}

        {/* Key Takeaways (if present) */}
        {article.keyTakeaways && article.keyTakeaways.length > 0 && (
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
        )}

        {/* Article Body Content (Safe DOMPurify + PrismJS syntax highlighting) */}
        <div className="mb-12">
          {article.content ? (
            <ArticleContentRenderer content={article.content} />
          ) : article.paragraphs && article.paragraphs.length > 0 ? (
            <div className="space-y-6 text-sm sm:text-base leading-8 text-neutral-300 text-justify">
              {article.paragraphs.map((p, idx) => (
                <p key={idx}>{p}</p>
              ))}
            </div>
          ) : null}
        </div>

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="border-t border-neutral-800 pt-6 flex flex-wrap items-center gap-2 mb-12">
            <span className="text-xs text-neutral-400 font-medium flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-amber-500" />
              برچسب‌ها:
            </span>
            {article.tags.map((tag, tIdx) => (
              <span
                key={tIdx}
                className="rounded-lg border border-neutral-800 bg-neutral-900/90 px-3 py-1 text-xs text-neutral-300 font-medium"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Related Articles */}
        {article.relatedArticles && article.relatedArticles.length > 0 && (
          <div className="border-t border-neutral-800 pt-8 mb-12 space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              مقالات مرتبط و پیشنهادی
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {article.relatedArticles.map((rel) => (
                <Link
                  key={rel.id}
                  href={`/articles/${rel.slug}`}
                  className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/50 hover:border-neutral-700 transition-colors flex gap-3 group"
                >
                  {rel.featuredImage && (
                    <img
                      src={rel.featuredImage}
                      alt={rel.title}
                      className="w-20 h-16 rounded-lg object-cover flex-shrink-0"
                    />
                  )}
                  <div className="space-y-1">
                    <h3 className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-2">
                      {rel.title}
                    </h3>
                    <p className="text-[11px] text-neutral-400 line-clamp-1">
                      {rel.excerpt}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

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
