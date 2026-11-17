import * as React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeft, Home, Package } from "lucide-react";
import { Container } from "@/shared/components/ui/container";
import { ProductsCatalogClient } from "./products-catalog-client";
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
import {
  getCachedCatalogProducts,
  getCachedCategories,
} from "@/shared/lib/server-seo-data";
import type { AdminCategory } from "@/features/admin/types/admin-categories.types";

export const dynamic = "force-dynamic";

type SearchParamsRecord = Record<string, string | string[] | undefined>;

type Props = {
  searchParams: Promise<SearchParamsRecord>;
};

const KNOWN_CATEGORY_LABELS: Record<string, string> = {
  switches: "سوئیچ‌های شبکه",
  routers: "روترهای سازمانی",
  wireless: "تجهیزات وایرلس و اکسس‌پوینت",
  fiber: "فیبر نوری و ماژول SFP",
  cables: "کابل و پچ‌کورد شبکه",
  passive: "تجهیزات پسیو و رک",
  accessories: "تجهیزات جانبی شبکه",
};

function firstQueryValue(val: string | string[] | undefined): string | undefined {
  if (typeof val === "string") return val.trim() || undefined;
  if (Array.isArray(val) && val.length > 0 && typeof val[0] === "string") {
    return val[0].trim() || undefined;
  }
  return undefined;
}

interface CatalogQueryState {
  category?: string;
  matchedCategory?: AdminCategory;
  categoryLabel?: string;
  search?: string;
  isCleanCategoryPage: boolean;
  isIndexable: boolean;
  canonicalPath: string;
}

function analyzeCatalogQuery(
  sp: SearchParamsRecord,
  categories: AdminCategory[]
): CatalogQueryState {
  const keys = Object.keys(sp).filter((k) => {
    const v = sp[k];
    if (Array.isArray(v)) return v.some((x) => x.trim() !== "");
    return typeof v === "string" && v.trim() !== "";
  });

  const rawCategory = firstQueryValue(sp.category);
  const decodedCategory = rawCategory ? safeDecodeSlug(rawCategory) : undefined;
  const search = firstQueryValue(sp.search);

  const matchedCategory = decodedCategory
    ? categories.find(
        (c) =>
          c.isActive !== false &&
          (c.slug === decodedCategory || c.id === decodedCategory)
      )
    : undefined;

  const isKnownStaticCategory = Boolean(
    decodedCategory && KNOWN_CATEGORY_LABELS[decodedCategory]
  );
  const isValidCategory = Boolean(matchedCategory || isKnownStaticCategory);
  const categoryLabel =
    matchedCategory?.longName ||
    matchedCategory?.shortName ||
    (decodedCategory ? KNOWN_CATEGORY_LABELS[decodedCategory] : undefined);

  const isAllCategory = decodedCategory === "all";

  if (keys.length === 0) {
    return {
      isCleanCategoryPage: false,
      isIndexable: true,
      canonicalPath: "/products",
    };
  }

  if (
    keys.length === 1 &&
    keys[0] === "category" &&
    decodedCategory &&
    !isAllCategory &&
    isValidCategory
  ) {
    const cleanSlug = matchedCategory?.slug || decodedCategory;
    return {
      category: cleanSlug,
      matchedCategory,
      categoryLabel,
      isCleanCategoryPage: true,
      isIndexable: true,
      canonicalPath: `/products?category=${encodeSlugSegment(cleanSlug)}`,
    };
  }

  // Faceted/sorted/searched/unknown/category=all views: crawlable links but noindex + clean parent canonical
  const fallbackCanonical =
    decodedCategory && !isAllCategory && isValidCategory && !search
      ? `/products?category=${encodeSlugSegment(matchedCategory?.slug || decodedCategory)}`
      : "/products";

  return {
    category: !isAllCategory && isValidCategory ? matchedCategory?.slug || decodedCategory : undefined,
    matchedCategory,
    categoryLabel,
    search,
    isCleanCategoryPage: false,
    isIndexable: false,
    canonicalPath: fallbackCanonical,
  };
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const [sp, categories] = await Promise.all([searchParams, getCachedCategories()]);
  const state = analyzeCatalogQuery(sp, categories);

  if (state.search) {
    return buildPublicMetadata({
      title: `جست‌وجوی «${state.search}» در تجهیزات شبکه | ققنوس آکادمی`,
      description: `نتایج جست‌وجو برای «${state.search}» در کاتالوگ تجهیزات شبکه ققنوس آکادمی.`,
      path: "/products",
      robots: NOINDEX_FOLLOW_ROBOTS,
    });
  }

  if (state.categoryLabel) {
    const desc =
      state.matchedCategory?.description?.trim() ||
      `خرید و استعلام قیمت ${state.categoryLabel} اورجینال با گارانتی تعویض، تست فنی و ارسال سریع از ققنوس آکادمی.`;

    return buildPublicMetadata({
      title: `${state.categoryLabel} | قیمت و خرید تجهیزات شبکه | ققنوس آکادمی`,
      description: desc,
      path: state.canonicalPath,
      robots: state.isIndexable ? PUBLIC_INDEX_ROBOTS : NOINDEX_FOLLOW_ROBOTS,
    });
  }

  return buildPublicMetadata({
    title: "همه محصولات و تجهیزات شبکه | ققنوس آکادمی",
    description:
      "مشاهده کاتالوگ کامل تجهیزات شبکه شامل انواع سوئیچ سیسکو، روتر میکروتیک، کابل شبکه، فیبر نوری و تجهیزات پسیو با ضمانت اصالت کالا.",
    path: state.canonicalPath,
    robots: state.isIndexable ? PUBLIC_INDEX_ROBOTS : NOINDEX_FOLLOW_ROBOTS,
  });
}

export default async function ProductsPage({ searchParams }: Props) {
  const [sp, categories] = await Promise.all([searchParams, getCachedCategories()]);
  const state = analyzeCatalogQuery(sp, categories);

  const initialProducts = await getCachedCatalogProducts({
    category: state.category,
    search: state.search,
  });

  const activeCategories = categories.filter((c) => c.isActive !== false && c.slug);

  const pageHeading = state.search
    ? `نتایج جست‌وجو برای «${state.search}»`
    : state.categoryLabel
    ? state.categoryLabel
    : "تمامی محصولات و تجهیزات شبکه";

  const pageDescription =
    state.matchedCategory?.description?.trim() ||
    (state.categoryLabel
      ? `مجموعه ${state.categoryLabel} اورجینال با تضمین اصالت سخت‌افزاری، گارانتی معتبر و مشاوره پیش از خرید.`
      : "آرشیو کامل تجهیزات اکتیو و پسیو شبکه سازمانی با امکان فیلتر بر اساس برند، دسته‌بندی و قیمت");

  const currentUrl = buildCanonicalUrl(state.canonicalPath);

  const jsonLd = sanitizeJsonLd({
    "@context": "https://schema.org",
    "@graph": [
      createBreadcrumbJsonLd([
        { name: "صفحه اصلی", path: "/" },
        ...(state.categoryLabel
          ? [
              { name: "محصولات", path: "/products" },
              { name: state.categoryLabel, path: state.canonicalPath },
            ]
          : [{ name: "همه محصولات", path: "/products" }]),
      ]),
      {
        "@type": "CollectionPage",
        "@id": currentUrl,
        url: currentUrl,
        name: pageHeading,
        description: pageDescription,
        inLanguage: "fa-IR",
        isPartOf: { "@id": `${SITE_URL}/#website` },
        ...(initialProducts.length > 0
          ? {
              mainEntity: {
                "@type": "ItemList",
                numberOfItems: initialProducts.length,
                itemListElement: initialProducts.slice(0, 30).map((product, idx) => ({
                  "@type": "ListItem",
                  position: idx + 1,
                  url: `${SITE_URL}/products/${encodeSlugSegment(product.slug)}`,
                  name: product.name,
                })),
              },
            }
          : {}),
      },
    ],
  });

  return (
    <div className="py-6 sm:py-10" dir="rtl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Container>
        {/* ── Breadcrumb ──────────────────────────────────────────────────── */}
        <nav
          className="mb-4 flex items-center gap-1.5 text-xs text-neutral-400 overflow-x-auto whitespace-nowrap"
          aria-label="مسیر راهنما"
        >
          <Link
            href="/"
            className="flex items-center gap-1 hover:text-white transition-colors shrink-0"
          >
            <Home className="h-3.5 w-3.5" />
            <span>خانه</span>
          </Link>
          <ChevronLeft className="h-3 w-3 text-neutral-600 shrink-0" aria-hidden="true" />
          {state.categoryLabel ? (
            <>
              <Link href="/products" className="hover:text-white transition-colors shrink-0">
                همه محصولات
              </Link>
              <ChevronLeft className="h-3 w-3 text-neutral-600 shrink-0" aria-hidden="true" />
              <span className="text-orange-400 font-medium shrink-0">{state.categoryLabel}</span>
            </>
          ) : (
            <span className="text-orange-400 font-medium flex items-center gap-1 shrink-0">
              <Package className="h-3.5 w-3.5" />
              <span>همه محصولات</span>
            </span>
          )}
        </nav>

        {/* ── Page Header ─────────────────────────────────────────────────── */}
        <div className="mb-6 border-b border-neutral-800/80 pb-5 sm:pb-6">
          <h1 className="text-xl sm:text-3xl font-black text-white tracking-tight">
            {pageHeading}
          </h1>
          <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-neutral-400 max-w-2xl leading-relaxed">
            {pageDescription}
          </p>

          {/* Crawlable Category Links */}
          {activeCategories.length > 0 && (
            <nav
              className="mt-4 flex flex-wrap items-center gap-2"
              aria-label="دسته‌بندی‌های قابل خزش محصولات"
            >
              <Link
                href="/products"
                className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                  !state.category
                    ? "bg-orange-600 text-white"
                    : "border border-neutral-800 bg-neutral-900/70 text-neutral-300 hover:border-neutral-700 hover:text-white"
                }`}
              >
                همه دسته‌ها
              </Link>
              {activeCategories.map((cat) => {
                const isSelected = state.category === cat.slug;
                return (
                  <Link
                    key={cat.id}
                    href={`/products?category=${encodeSlugSegment(cat.slug)}`}
                    className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                      isSelected
                        ? "bg-orange-600 text-white"
                        : "border border-neutral-800 bg-neutral-900/70 text-neutral-300 hover:border-neutral-700 hover:text-white"
                    }`}
                  >
                    {cat.shortName || cat.longName}
                  </Link>
                );
              })}
            </nav>
          )}
        </div>
      </Container>

      {/* ── Client Catalog wrapped in Suspense for useSearchParams ────────── */}
      <React.Suspense fallback={null}>
        <ProductsCatalogClient initialProducts={initialProducts} />
      </React.Suspense>
    </div>
  );
}
