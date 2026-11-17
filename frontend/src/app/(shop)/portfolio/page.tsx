import * as React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Briefcase, Building2, ChevronLeft, Home, MapPin, Sparkles } from "lucide-react";
import { Container } from "@/shared/components/ui/container";
import { PortfolioCoverImage } from "@/shared/components/ui";
import { portfolioApi } from "@/features/portfolio/api/portfolio-api";
import { PORTFOLIO_CATEGORIES } from "@/features/portfolio/mock-data/projects-data";
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
import { getCachedPublishedProjectsPage } from "@/shared/lib/server-seo-data";
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
  return qs ? `/portfolio?${qs}` : "/portfolio";
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const sp = await searchParams;
  const { value: page, isValid: isValidPage } = parsePositiveInt(sp.page);
  const rawCategory = sp.category ? safeDecodeSlug(sp.category).trim() : undefined;
  const activeCategory = rawCategory && rawCategory !== "all" ? rawCategory : undefined;

  const [data, categories] = await Promise.all([
    getCachedPublishedProjectsPage(page, PAGE_SIZE, activeCategory),
    portfolioApi.getCategories().catch(() => []),
  ]);

  const matchedCat = activeCategory
    ? categories.find(
        (c) => c.slug === activeCategory || c.id === activeCategory || c.name === activeCategory
      ) || PORTFOLIO_CATEGORIES.find((c) => c.id === activeCategory)
    : undefined;
  const categoryLabel =
    matchedCat && "name" in matchedCat
      ? matchedCat.name
      : matchedCat && "label" in matchedCat
      ? matchedCat.label
      : activeCategory;

  const isOutOfRange =
    !isValidPage ||
    page > Math.max(1, data.totalPages || 1) ||
    (Boolean(activeCategory || page > 1) && data.items.length === 0);

  const pageSuffix = page > 1 ? ` — صفحه ${toPersianDigits(page)}` : "";
  const title = categoryLabel
    ? `نمونه‌کارها و پروژه‌های ${categoryLabel}${pageSuffix} | ققنوس آکادمی`
    : `نمونه‌کارها و پروژه‌های اجرای شبکه و دیتاسنتر${pageSuffix} | ققنوس آکادمی`;

  const description = categoryLabel
    ? `آرشیو پروژه‌های اجرایی و نمونه‌کارهای مهندسی ققنوس آکادمی در حوزه ${categoryLabel}.`
    : "مشاهده پروژه‌های اجرایی زیرساخت شبکه، راه‌اندازی دیتاسنتر، فیبر نوری و کابل‌کشی ساختاریافته با تست فلوک توسط ققنوس آکادمی.";

  const path = isOutOfRange ? "/portfolio" : buildArchivePath(activeCategory, page);

  return buildPublicMetadata({
    title,
    description,
    path,
    robots: isOutOfRange ? NOINDEX_FOLLOW_ROBOTS : PUBLIC_INDEX_ROBOTS,
  });
}

export default async function PortfolioArchivePage({ searchParams }: Props) {
  const sp = await searchParams;
  const { value: page } = parsePositiveInt(sp.page);
  const rawCategory = sp.category ? safeDecodeSlug(sp.category).trim() : undefined;
  const activeCategory = rawCategory && rawCategory !== "all" ? rawCategory : undefined;

  const [data, apiCategories] = await Promise.all([
    getCachedPublishedProjectsPage(page, PAGE_SIZE, activeCategory),
    portfolioApi.getCategories().catch(() => []),
  ]);

  const categoryTabs =
    Array.isArray(apiCategories) && apiCategories.length > 0
      ? [
          { id: "all", label: "همه پروژه‌ها" },
          ...apiCategories.map((c) => ({
            id: c.slug || c.id || c.name,
            label: c.name,
          })),
        ]
      : PORTFOLIO_CATEGORIES.map((c) => ({ id: c.id, label: c.label }));

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
              { name: "نمونه‌کارهای مهندسی", path: "/portfolio" },
              { name: activeCategoryObj.label, path: buildArchivePath(activeCategory, 1) },
            ]
          : [{ name: "نمونه‌کارهای مهندسی", path: "/portfolio" }]),
      ]),
      {
        "@type": "CollectionPage",
        "@id": currentUrl,
        url: currentUrl,
        name: activeCategoryObj
          ? `نمونه‌کارهای ${activeCategoryObj.label}`
          : "نمونه‌کارها و پروژه‌های مهندسی شبکه ققنوس آکادمی",
        description:
          "فهرست پروژه‌های اجرایی زیرساخت اکتیو و پسیو، اتاق سرور، دیتاسنتر و فیبر نوری ققنوس آکادمی.",
        inLanguage: "fa-IR",
        isPartOf: { "@id": `${SITE_URL}/#website` },
        mainEntity: {
          "@type": "ItemList",
          itemListElement: data.items.map((project, idx) => ({
            "@type": "ListItem",
            position: (page - 1) * PAGE_SIZE + idx + 1,
            url: `${SITE_URL}/portfolio/${encodeSlugSegment(project.slug)}`,
            name: project.title,
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
              <Link href="/portfolio" className="hover:text-white transition-colors shrink-0">
                نمونه‌کارها و پروژه‌ها
              </Link>
              <ChevronLeft className="h-3 w-3 text-neutral-600 shrink-0" aria-hidden="true" />
              <span className="text-orange-400 font-medium shrink-0">{activeCategoryObj.label}</span>
            </>
          ) : (
            <span className="text-orange-400 font-medium flex items-center gap-1 shrink-0">
              <Briefcase className="h-3.5 w-3.5" />
              <span>نمونه‌کارها و پروژه‌ها</span>
            </span>
          )}
        </nav>

        {/* Page Header with semantic H1 */}
        <header className="mb-8 border-b border-neutral-800/80 pb-6 space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-3.5 py-1 text-xs font-semibold text-orange-400">
            <Sparkles className="h-3.5 w-3.5" />
            <span>سوابق اجرایی و پروژه‌های صنعتی و سازمانی</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
            {activeCategoryObj
              ? `پروژه‌ها و نمونه‌کارهای ${activeCategoryObj.label}`
              : "نمونه‌کارها و پروژه‌های اجرای شبکه و دیتاسنتر"}
          </h1>

          <p className="text-xs sm:text-sm text-neutral-400 max-w-3xl leading-relaxed">
            گزیده‌ای از پروژه‌های طراحی، تأمین تجهیزات، کابل‌کشی ساختاریافته، راه‌اندازی اتاق سرور و تست فلوک انجام‌شده برای سازمان‌ها و صنایع کشور.
          </p>
        </header>

        {/* Crawlable Category Filter Links */}
        <nav className="mb-8 flex flex-wrap items-center gap-2" aria-label="دسته‌بندی نمونه‌کارها">
          {categoryTabs.map((tab) => {
            const isSelected = (!activeCategory && tab.id === "all") || activeCategory === tab.id;
            const href = tab.id === "all" ? "/portfolio" : `/portfolio?category=${encodeSlugSegment(tab.id)}`;
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

        {/* Projects Grid */}
        {data.items.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.items.map((project) => {
              const projectHref = `/portfolio/${encodeSlugSegment(project.slug)}`;
              const coverImage = project.featuredImage || project.imageUrl;

              return (
                <article
                  key={project.id}
                  className="group flex flex-col justify-between overflow-hidden rounded-3xl border border-neutral-800/90 bg-[#111114]/95 p-5 shadow-xl shadow-black/40 transition-all hover:-translate-y-1 hover:border-neutral-700"
                >
                  <div>
                    <Link
                      href={projectHref}
                      className="relative mb-4 block h-48 w-full overflow-hidden rounded-2xl border border-neutral-800/80 bg-neutral-900"
                    >
                      <PortfolioCoverImage
                        src={coverImage}
                        alt={project.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </Link>

                    <div className="mb-3 flex flex-wrap items-center gap-3 text-[11px] text-neutral-400">
                      {project.client && (
                        <span className="inline-flex items-center gap-1">
                          <Building2 className="h-3.5 w-3.5 text-orange-400" />
                          <span>{project.client}</span>
                        </span>
                      )}
                      {project.location && (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-neutral-500" />
                          <span>{project.location}</span>
                        </span>
                      )}
                    </div>

                    <h2 className="mb-2 text-base sm:text-lg font-bold text-white leading-snug group-hover:text-orange-400 transition-colors">
                      <Link href={projectHref}>{project.title}</Link>
                    </h2>

                    <p className="text-xs sm:text-sm leading-relaxed text-neutral-400 line-clamp-3">
                      {project.summary}
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-neutral-800/80 flex items-center justify-between gap-3">
                    <span className="text-[11px] text-neutral-500 font-medium">
                      {project.year || "پروژه اجرایی"}
                    </span>

                    <Link
                      href={projectHref}
                      className="inline-flex items-center gap-1 rounded-xl bg-orange-600/90 hover:bg-orange-500 px-3.5 py-2 text-xs font-semibold text-white transition-colors shrink-0"
                    >
                      <span>مشاهده پروژه</span>
                      <ArrowLeft className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-neutral-800 bg-neutral-900/30 py-16 text-center text-neutral-400 space-y-3">
            <Briefcase className="h-8 w-8 mx-auto text-neutral-600" />
            <p className="text-sm font-semibold">نمونه‌کاری در این دسته‌بندی یافت نشد.</p>
            <Link
              href="/portfolio"
              className="inline-flex items-center gap-2 rounded-xl border border-neutral-700 px-4 py-2 text-xs font-semibold text-white hover:border-orange-500/40"
            >
              بازگشت به همه پروژه‌ها
            </Link>
          </div>
        )}

        {/* Crawlable Pagination */}
        {totalPages > 1 && (
          <nav className="mt-10 flex items-center justify-center gap-2" aria-label="صفحه‌بندی نمونه‌کارها">
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
