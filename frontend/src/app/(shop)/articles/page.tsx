import * as React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, BookOpen, Calendar, ChevronLeft, Clock, Home, Sparkles } from "lucide-react";
import { Container } from "@/shared/components/ui/container";
import { ArticleCoverImage, AuthorAvatar } from "@/shared/components/ui";
import { articlesApi } from "@/features/articles/api/articles-api";
import { ARTICLE_CATEGORIES } from "@/features/articles/mock-data/articles-data";
import {
  buildCanonicalUrl,
  buildPublicMetadata,
  createBreadcrumbJsonLd,
  encodeSlugSegment,
  NOINDEX_FOLLOW_ROBOTS,
  PUBLIC_INDEX_ROBOTS,
  safeDecodeSlug,
  sanitizeJsonLd,
  SITE_URL,
} from "@/shared/lib/seo";
import { getCachedPublishedArticlesPage } from "@/shared/lib/server-seo-data";
import { toPersianDigits } from "@/shared/lib/utils";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 12;

type Props = {
  searchParams: Promise<{ page?: string; category?: string }>;
};

function parsePositiveInt(raw?: string): { value: number; isValid: boolean } {
  if (!raw) return { value: 1, isValid: true };
  if (!/^\d+$/.test(raw.trim())) return { value: 1, isValid: false };
  const parsed = Number.parseInt(raw.trim(), 10);
  if (!Number.isFinite(parsed) || parsed < 1) return { value: 1, isValid: false };
  return { value: parsed, isValid: true };
}

function buildArchivePath(category?: string, page = 1): string {
  const params = new URLSearchParams();
  if (category && category !== "all") {
    params.set("category", safeDecodeSlug(category));
  }
  if (page > 1) {
    params.set("page", String(page));
  }
  const qs = params.toString();
  return qs ? `/articles?${qs}` : "/articles";
}

function toCategoryTab(raw: unknown): { id: string; label: string } | null {
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    return trimmed ? { id: trimmed, label: trimmed } : null;
  }
  if (raw && typeof raw === "object") {
    const obj = raw as { id?: string; slug?: string; name?: string; label?: string };
    const id = (obj.slug || obj.id || obj.name || "").trim();
    const label = (obj.name || obj.label || id).trim();
    return id ? { id, label } : null;
  }
  return null;
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const sp = await searchParams;
  const { value: page, isValid: isValidPage } = parsePositiveInt(sp.page);
  const rawCategory = sp.category ? safeDecodeSlug(sp.category).trim() : undefined;
  const activeCategory = rawCategory && rawCategory !== "all" ? rawCategory : undefined;

  const [data, categories] = await Promise.all([
    getCachedPublishedArticlesPage(page, PAGE_SIZE, activeCategory),
    articlesApi.getCategories().catch(() => []),
  ]);

  const apiTabs = (Array.isArray(categories) ? categories : [])
    .map(toCategoryTab)
    .filter((t): t is { id: string; label: string } => Boolean(t));

  const matchedTab = activeCategory
    ? apiTabs.find((t) => t.id === activeCategory || t.label === activeCategory) ||
      ARTICLE_CATEGORIES.find((c) => c.id === activeCategory)
    : undefined;
  const categoryLabel = matchedTab?.label || activeCategory;

  const isOutOfRange =
    !isValidPage ||
    page > Math.max(1, data.totalPages || 1) ||
    (Boolean(activeCategory || page > 1) && data.items.length === 0);

  const pageSuffix = page > 1 ? ` — صفحه ${toPersianDigits(page)}` : "";
  const title = categoryLabel
    ? `مقالات تخصصی ${categoryLabel}${pageSuffix} | ققنوس آکادمی`
    : `مقالات تخصصی شبکه، دیتاسنتر و فیبر نوری${pageSuffix} | ققنوس آکادمی`;

  const description = categoryLabel
    ? `آرشیو مقالات فنی و راهنماهای مهندسی در حوزه ${categoryLabel} توسط تیم فنی ققنوس آکادمی.`
    : "آرشیو کامل مقالات فنی، آموزش‌های پیکربندی سوئیچ و روتر، استانداردهای کابل‌کشی ساختاریافته و تست فلوک در ققنوس آکادمی.";

  const path = isOutOfRange ? "/articles" : buildArchivePath(activeCategory, page);

  return buildPublicMetadata({
    title,
    description,
    path,
    robots: isOutOfRange ? NOINDEX_FOLLOW_ROBOTS : PUBLIC_INDEX_ROBOTS,
  });
}

export default async function ArticlesArchivePage({ searchParams }: Props) {
  const sp = await searchParams;
  const { value: page } = parsePositiveInt(sp.page);
  const rawCategory = sp.category ? safeDecodeSlug(sp.category).trim() : undefined;
  const activeCategory = rawCategory && rawCategory !== "all" ? rawCategory : undefined;

  const [data, apiCategories] = await Promise.all([
    getCachedPublishedArticlesPage(page, PAGE_SIZE, activeCategory),
    articlesApi.getCategories().catch(() => []),
  ]);

  const parsedApiTabs = (Array.isArray(apiCategories) ? apiCategories : [])
    .map(toCategoryTab)
    .filter((t): t is { id: string; label: string } => Boolean(t));

  const categoryTabs =
    parsedApiTabs.length > 0
      ? [{ id: "all", label: "همه مقالات" }, ...parsedApiTabs]
      : ARTICLE_CATEGORIES.map((c) => ({ id: c.id, label: c.label }));

  const activeCategoryObj = activeCategory
    ? categoryTabs.find((c) => c.id === activeCategory)
    : undefined;

  const currentUrl = buildCanonicalUrl(buildArchivePath(activeCategory, page));
  const totalPages = Math.max(1, data.totalPages || 1);

  const jsonLd = sanitizeJsonLd({
    "@context": "https://schema.org",
    "@graph": [
      createBreadcrumbJsonLd([
        { name: "صفحه اصلی", path: "/" },
        ...(activeCategoryObj
          ? [
              { name: "مقالات تخصصی", path: "/articles" },
              { name: activeCategoryObj.label, path: buildArchivePath(activeCategory, 1) },
            ]
          : [{ name: "مقالات تخصصی", path: "/articles" }]),
      ]),
      {
        "@type": "CollectionPage",
        "@id": currentUrl,
        url: currentUrl,
        name: activeCategoryObj
          ? `مقالات تخصصی ${activeCategoryObj.label}`
          : "مقالات تخصصی شبکه و زیرساخت ققنوس آکادمی",
        description:
          "مجموعه مقالات مهندسی، استانداردهای شبکه، تست فلوک، فیبر نوری و راهنمای خرید تجهیزات زیرساخت.",
        inLanguage: "fa-IR",
        isPartOf: { "@id": `${SITE_URL}/#website` },
        mainEntity: {
          "@type": "ItemList",
          itemListElement: data.items.map((article, idx) => ({
            "@type": "ListItem",
            position: (page - 1) * PAGE_SIZE + idx + 1,
            url: `${SITE_URL}/articles/${encodeSlugSegment(article.slug)}`,
            name: article.title,
          })),
        },
      },
    ],
  });

  return (
    <div className="py-8 sm:py-12 min-h-screen" dir="rtl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Container>
        {/* Breadcrumb */}
        <nav
          className="mb-5 flex items-center gap-1.5 text-xs text-neutral-400 overflow-x-auto whitespace-nowrap"
          aria-label="مسیر راهنما"
        >
          <Link href="/" className="flex items-center gap-1 hover:text-white transition-colors shrink-0">
            <Home className="h-3.5 w-3.5" />
            <span>خانه</span>
          </Link>
          <ChevronLeft className="h-3 w-3 text-neutral-600 shrink-0" aria-hidden="true" />
          {activeCategoryObj ? (
            <>
              <Link href="/articles" className="hover:text-white transition-colors shrink-0">
                مقالات تخصصی
              </Link>
              <ChevronLeft className="h-3 w-3 text-neutral-600 shrink-0" aria-hidden="true" />
              <span className="text-orange-400 font-medium shrink-0">{activeCategoryObj.label}</span>
            </>
          ) : (
            <span className="text-orange-400 font-medium flex items-center gap-1 shrink-0">
              <BookOpen className="h-3.5 w-3.5" />
              <span>مقالات تخصصی</span>
            </span>
          )}
        </nav>

        {/* Page Header with semantic H1 */}
        <header className="mb-8 border-b border-neutral-800/80 pb-6 space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-3.5 py-1 text-xs font-semibold text-orange-400">
            <Sparkles className="h-3.5 w-3.5" />
            <span>دانشنامه مهندسی شبکه ققنوس آکادمی</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
            {activeCategoryObj
              ? `مقالات تخصصی ${activeCategoryObj.label}`
              : "مقالات و راهنمای تخصصی شبکه و زیرساخت"}
          </h1>

          <p className="text-xs sm:text-sm text-neutral-400 max-w-3xl leading-relaxed">
            تحلیل‌های فنی، استانداردهای نصب و کابل‌کشی ساختاریافته، راهنمای انتخاب سوئیچ و روتر سازمانی و بررسی تجهیزات دیتاسنتر به قلم مهندسان ققنوس آکادمی.
          </p>
        </header>

        {/* Crawlable Category Filter Links */}
        <nav className="mb-8 flex flex-wrap items-center gap-2" aria-label="دسته‌بندی مقالات">
          {categoryTabs.map((tab) => {
            const isSelected = (!activeCategory && tab.id === "all") || activeCategory === tab.id;
            const href = tab.id === "all" ? "/articles" : `/articles?category=${encodeSlugSegment(tab.id)}`;
            return (
              <Link
                key={tab.id}
                href={href}
                className={`rounded-xl px-4 py-2 text-xs font-semibold transition-colors ${
                  isSelected
                    ? "bg-orange-600 text-white shadow-lg shadow-orange-950/40"
                    : "border border-neutral-800 bg-neutral-900/80 text-neutral-400 hover:border-neutral-700 hover:text-white"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>

        {/* Articles Grid */}
        {data.items.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.items.map((article) => {
              const articleHref = `/articles/${encodeSlugSegment(article.slug)}`;
              const coverImage = article.featuredImage || article.imageUrl;
              const authorName = article.authorName || article.author?.name || "تیم فنی ققنوس";
              const authorRole = article.authorRole || article.author?.role || "مهندس شبکه";
              const authorAvatar = article.authorAvatar || article.author?.avatarUrl;

              return (
                <article
                  key={article.id}
                  className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-neutral-800/90 bg-[#111114]/95 p-5 shadow-xl shadow-black/40 transition-all hover:-translate-y-1 hover:border-neutral-700"
                >
                  <div>
                    <Link
                      href={articleHref}
                      className="relative mb-4 block h-48 w-full overflow-hidden rounded-2xl border border-neutral-800/80 bg-neutral-900"
                    >
                      <ArticleCoverImage
                        src={coverImage}
                        alt={article.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </Link>

                    <div className="mb-3 flex items-center justify-between text-[11px] text-neutral-400">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-orange-400" />
                        <span>{article.publishedAt}</span>
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5 text-neutral-500" />
                        <span>{article.readTime}</span>
                      </span>
                    </div>

                    <h2 className="mb-2 text-base sm:text-lg font-bold text-white leading-snug group-hover:text-orange-400 transition-colors">
                      <Link href={articleHref}>{article.title}</Link>
                    </h2>

                    <p className="text-xs sm:text-sm leading-relaxed text-neutral-400 line-clamp-3">
                      {article.excerpt}
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-neutral-800/80 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <AuthorAvatar name={authorName} avatarUrl={authorAvatar} size="sm" />
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-neutral-200 truncate">{authorName}</div>
                        <div className="text-[10px] text-neutral-500 truncate">{authorRole}</div>
                      </div>
                    </div>

                    <Link
                      href={articleHref}
                      className="inline-flex items-center gap-1 rounded-xl bg-orange-600/90 hover:bg-orange-500 px-3 py-2 text-xs font-semibold text-white transition-colors shrink-0"
                    >
                      <span>مطالعه</span>
                      <ArrowLeft className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-neutral-800 bg-neutral-900/30 py-16 text-center text-neutral-400 space-y-3">
            <BookOpen className="h-8 w-8 mx-auto text-neutral-600" />
            <p className="text-sm font-semibold">مقاله‌ای در این بخش یافت نشد.</p>
            <Link
              href="/articles"
              className="inline-flex items-center gap-2 rounded-xl border border-neutral-700 px-4 py-2 text-xs font-semibold text-white hover:border-orange-500/40"
            >
              بازگشت به همه مقالات
            </Link>
          </div>
        )}

        {/* Crawlable Pagination */}
        {totalPages > 1 && (
          <nav className="mt-10 flex items-center justify-center gap-2" aria-label="صفحه‌بندی مقالات">
            {page > 1 && (
              <Link
                href={buildArchivePath(activeCategory, page - 1)}
                className="rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-2 text-xs font-semibold text-neutral-200 hover:border-orange-500/40"
              >
                صفحه قبل
              </Link>
            )}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Link
                key={p}
                href={buildArchivePath(activeCategory, p)}
                aria-current={p === page ? "page" : undefined}
                className={`rounded-xl px-3.5 py-2 text-xs font-bold transition-colors ${
                  p === page
                    ? "bg-orange-600 text-white"
                    : "border border-neutral-800 bg-neutral-900 text-neutral-400 hover:text-white"
                }`}
              >
                {toPersianDigits(p)}
              </Link>
            ))}
            {page < totalPages && (
              <Link
                href={buildArchivePath(activeCategory, page + 1)}
                className="rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-2 text-xs font-semibold text-neutral-200 hover:border-orange-500/40"
              >
                صفحه بعد
              </Link>
            )}
          </nav>
        )}
      </Container>
    </div>
  );
}
