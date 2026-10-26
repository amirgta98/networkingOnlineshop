import * as React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

import { Container } from "@/shared/components/ui/container";
import { MediaGallerySwiper } from "@/shared/components/ui";
import { portfolioApi } from "@/features/portfolio/api/portfolio-api";
import { PORTFOLIO_PROJECTS } from "@/features/portfolio/mock-data/projects-data";
import type { ProjectItem } from "@/features/portfolio/types";

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
  Zap,
  Layers,
  Award,
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

async function getProject(slug: string): Promise<ProjectItem | null> {
  const cleanSlug = safeDecodeSlug(slug);

  try {
    const res = await portfolioApi.getPortfolioBySlug(cleanSlug);
    if (res && res.title) {
      return res;
    }
  } catch (err) {
    console.warn(`[PortfolioDetailPage] API fetch failed for slug "${cleanSlug}":`, err);
  }

  // Fallback to local mock data if API is unreachable or item exists locally
  const normalizedClean = cleanSlug.replace(/\s+/g, "-");
  const fallback = PORTFOLIO_PROJECTS.find((p) => {
    const s = safeDecodeSlug(p.slug);
    return (
      p.slug === cleanSlug ||
      s === cleanSlug ||
      p.id === cleanSlug ||
      s.replace(/\s+/g, "-") === normalizedClean ||
      p.slug.replace(/\s+/g, "-") === normalizedClean
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
  const project = await getProject(slug);

  if (!project) {
    return {
      title: "پروژه مورد نظر یافت نشد | ققنوس آکادمی",
      robots: { index: false, follow: false },
    };
  }

  const title = project.metaTitle || `${project.title} | نمونه‌کارهای ققنوس آکادمی`;
  const description = project.metaDescription || project.summary;
  const canonical = project.canonicalUrl || `${SITE_URL}/portfolio/${project.slug}`;
  const ogImage = project.ogImage || project.featuredImage || project.imageUrl;

  return {
    title,
    description,
    keywords: project.seoKeywords || project.tags?.join(", "),
    alternates: {
      canonical,
    },
    robots: {
      index: project.isIndexable !== false,
      follow: project.isFollowable !== false,
    },
    openGraph: {
      title: project.ogTitle || title,
      description: project.ogDescription || description,
      url: canonical,
      siteName: "ققنوس آکادمی",
      type: "website",
      images: ogImage ? [{ url: ogImage, alt: project.title }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: project.ogTitle || title,
      description: project.ogDescription || description,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

export default async function PortfolioDetailPage({ params }: Props) {
  const resolvedParams = await Promise.resolve(params);
  const slug = safeDecodeSlug(resolvedParams.slug);
  const project = await getProject(slug);

  if (!project) {
    notFound();
  }

  const canonicalUrl = project.canonicalUrl || `${SITE_URL}/portfolio/${project.slug}`;
  const coverImage = project.featuredImage || project.imageUrl;

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
            "name": "نمونه‌کارهای مهندسی",
            "item": `${SITE_URL}/#portfolio`,
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": project.title,
            "item": canonicalUrl,
          },
        ],
      },
      {
        "@type": "CreativeWork",
        "@id": canonicalUrl,
        "name": project.title,
        "description": project.summary,
        "image": coverImage ? [coverImage] : undefined,
        "creator": {
          "@type": "Organization",
          "name": "ققنوس آکادمی (Fonix Academic)",
        },
        "customer": {
          "@type": "Organization",
          "name": project.client,
        },
        "locationCreated": {
          "@type": "Place",
          "name": project.location,
        },
      },
    ],
  };

  // Compile and sanitize media items
  const rawGallery = Array.isArray(project.gallery) ? project.gallery : [];
  const rawVideos = Array.isArray(project.videos) ? project.videos : [];

  const sanitizedGallery = rawGallery
    .filter((g: any) => g && (typeof g === "string" || (typeof g === "object" && !Array.isArray(g) && g.url)))
    .map((g: any, idx: number) => {
      if (typeof g === "string") {
        return {
          id: `proj-img-${idx}`,
          type: "image" as const,
          url: g,
          title: project.title,
        };
      }
      return {
        id: g.id || `proj-img-${idx}`,
        type: (g.type === "video" ? "video" : "image") as "image" | "video",
        url: g.url,
        title: g.title || project.title,
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
          id: `proj-video-${idx}`,
          type: "video" as const,
          url: v,
          title: project.title,
        };
      }
      return {
        id: v.id || `proj-video-${idx}`,
        type: "video" as const,
        url: v.url,
        title: v.title || project.title,
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
      title: project.title,
      caption: project.featuredImageAlt,
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
          <Link href="/#portfolio" className="hover:text-white transition-colors">نمونه‌کارهای مهندسی</Link>
          <span className="text-neutral-600">/</span>
          <span className="text-amber-400 truncate max-w-[200px] sm:max-w-md">{project.title}</span>
        </nav>

        {/* Back Link */}
        <Link
          href="/#portfolio"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-orange-400 hover:text-orange-300 transition-colors mb-6 group"
        >
          <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
          <span>بازگشت به همه نمونه‌کارها</span>
        </Link>

        {/* Top Badges */}
        <div className="flex flex-wrap items-center gap-2.5 mb-4">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-500/30 bg-orange-500/10 px-3.5 py-1 text-xs font-semibold text-orange-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-led-pulse" />
            {project.categoryName || project.category || "دیتاسنتر"}
          </span>
          <span className="rounded-full border border-neutral-800 bg-neutral-900/90 px-3 py-1 text-xs text-neutral-400">
            {project.projectStatusLabel || project.statusLabel || "تحویل نهایی"}
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
              {project.year || "۱۴۰۲"}
            </span>
          </div>
        </div>

        {/* Project Media Gallery (Swiper.js with Photos & Video Player) */}
        <div className="mb-10">
          <MediaGallerySwiper
            media={mediaItems}
            title={project.title}
          />
        </div>

        {/* Summary & Description */}
        <div className="space-y-4 mb-10 text-neutral-300 leading-relaxed text-sm sm:text-base text-justify">
          <p className="font-medium text-white text-base sm:text-lg">
            {project.summary}
          </p>
          {project.description && project.description !== project.summary && (
            <div className="space-y-4 whitespace-pre-line text-neutral-300 leading-8">
              {project.description}
            </div>
          )}
        </div>

        {/* Key Features & Metrics */}
        {((project.features && project.features.length > 0) || (project.metrics && project.metrics.length > 0)) && (
          <div className="mb-10 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" />
              شاخص‌های فنی و دستاوردهای عددی پروژه
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {project.features && project.features.length > 0
                ? project.features.map((feat, idx) => (
                    <div
                      key={idx}
                      className="rounded-2xl border border-neutral-800 bg-[#111114] p-5 text-center shadow-lg"
                    >
                      <div className="text-3xl font-black text-orange-400 font-mono mb-1">
                        {feat.value}
                      </div>
                      <div className="text-xs font-semibold text-white mb-1">
                        {feat.title}
                      </div>
                      {feat.description && (
                        <div className="text-[11px] text-neutral-400">
                          {feat.description}
                        </div>
                      )}
                    </div>
                  ))
                : project.metrics?.map((metric, idx) => (
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
          </div>
        )}

        {/* Challenges & Engineering Solutions */}
        {project.challenges && project.challenges.length > 0 ? (
          <div className="mb-10 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-500" />
              چالش‌های مهندسی و راهکارهای تخصصی ققنوس
            </h2>
            <div className="space-y-4">
              {project.challenges.map((ch, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-6 space-y-4"
                >
                  <div className="text-sm font-bold text-white border-b border-neutral-800 pb-2">
                    {ch.title}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-xl border border-red-950/40 bg-red-950/10 p-4 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-red-400">
                        <AlertCircle className="w-4 h-4" />
                        <span>شرح چالش کارفرما</span>
                      </div>
                      <p className="text-xs leading-relaxed text-neutral-300">
                        {ch.description}
                      </p>
                    </div>

                    <div className="rounded-xl border border-emerald-950/40 bg-emerald-950/10 p-4 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                        <Lightbulb className="w-4 h-4" />
                        <span>راهکار و نتیجه ققنوس</span>
                      </div>
                      <p className="text-xs leading-relaxed text-neutral-300">
                        {ch.solution}
                      </p>
                      {ch.result && (
                        <div className="text-[11px] text-emerald-400 font-medium pt-1">
                          نتیجه: {ch.result}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (project.challenge || project.solution) ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
            {project.challenge && (
              <div className="rounded-2xl border border-red-950/40 bg-red-950/10 p-6 space-y-2.5">
                <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>چالش‌های پروژه</span>
                </div>
                <p className="text-xs sm:text-sm leading-relaxed text-neutral-300">
                  {project.challenge}
                </p>
              </div>
            )}

            {project.solution && (
              <div className="rounded-2xl border border-emerald-950/40 bg-emerald-950/10 p-6 space-y-2.5">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <Lightbulb className="h-4 w-4 shrink-0" />
                  <span>راهکار مهندسی ققنوس آکادمی</span>
                </div>
                <p className="text-xs sm:text-sm leading-relaxed text-neutral-300">
                  {project.solution}
                </p>
              </div>
            )}
          </div>
        ) : null}

        {/* Technologies & Equipment */}
        {((project.technologies && project.technologies.length > 0) || (project.hardwareUsed && project.hardwareUsed.length > 0)) && (
          <div className="rounded-3xl border border-neutral-800 bg-[#111114] p-6 sm:p-8 mb-10 space-y-4">
            <div className="flex items-center gap-2 text-base font-bold text-white">
              <Cpu className="h-5 w-5 text-orange-400" />
              <span>تجهیزات و فناوری‌های سخت‌افزاری استفاده شده</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {project.technologies && project.technologies.length > 0
                ? project.technologies.map((tech, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between rounded-xl border border-neutral-800 bg-neutral-900/80 px-4 py-3 text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        {tech.iconUrl ? (
                          <img
                            src={tech.iconUrl}
                            alt={tech.name}
                            className="w-6 h-6 rounded object-contain"
                          />
                        ) : (
                          <span className="h-2 w-2 rounded-full bg-orange-400" />
                        )}
                        <div>
                          <span className="font-semibold text-white block">{tech.name}</span>
                          {tech.description && (
                            <span className="text-[11px] text-neutral-400 block">{tech.description}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                : project.hardwareUsed?.map((hw, idx) => (
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
        )}

        {/* Key Achievements / Results */}
        {((project.achievements && project.achievements.length > 0) || (project.results && project.results.length > 0)) && (
          <div className="rounded-3xl border border-neutral-800 bg-[#111114] p-6 sm:p-8 mb-12 space-y-4">
            <div className="flex items-center gap-2 text-base font-bold text-white">
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
              <span>دستاوردهای کلیدی پروژه</span>
            </div>
            <div className="space-y-2.5">
              {project.achievements && project.achievements.length > 0
                ? project.achievements.map((ach, idx) => (
                    <div
                      key={idx}
                      className="flex items-start justify-between gap-3 rounded-xl border border-neutral-800/80 bg-neutral-900/50 p-3.5 text-xs sm:text-sm text-neutral-300"
                    >
                      <div className="flex items-start gap-2.5">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-white block">{ach.title}</span>
                          <span className="text-neutral-400 leading-relaxed text-xs">{ach.description}</span>
                        </div>
                      </div>
                      {ach.metric && (
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono font-bold whitespace-nowrap">
                          {ach.metric}
                        </span>
                      )}
                    </div>
                  ))
                : project.results?.map((res, idx) => (
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
        )}

        {/* Tags */}
        {project.tags && project.tags.length > 0 && (
          <div className="border-t border-neutral-800 pt-6 flex flex-wrap items-center gap-2 mb-12">
            <span className="text-xs text-neutral-400 font-medium flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-amber-500" />
              برچسب‌های فنی:
            </span>
            {project.tags.map((tag, tIdx) => (
              <span
                key={tIdx}
                className="rounded-lg border border-neutral-800 bg-neutral-900/90 px-3 py-1 text-xs text-neutral-300 font-medium"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Related Projects */}
        {project.relatedProjects && project.relatedProjects.length > 0 && (
          <div className="border-t border-neutral-800 pt-8 mb-12 space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              پروژه‌ها و نمونه‌کارهای مرتبط
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {project.relatedProjects.map((rel) => (
                <Link
                  key={rel.id}
                  href={`/portfolio/${rel.slug}`}
                  className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/50 hover:border-neutral-700 transition-colors flex gap-3 group"
                >
                  {(rel.featuredImage || rel.imageUrl) && (
                    <img
                      src={rel.featuredImage || rel.imageUrl}
                      alt={rel.title}
                      className="w-24 h-18 rounded-lg object-cover flex-shrink-0"
                    />
                  )}
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-amber-400 font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                        {rel.categoryName || "پروژه مهندسی"}
                      </span>
                    </div>
                    <h3 className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-1">
                      {rel.title}
                    </h3>
                    <p className="text-[11px] text-neutral-400 line-clamp-2">
                      {rel.summary}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

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
