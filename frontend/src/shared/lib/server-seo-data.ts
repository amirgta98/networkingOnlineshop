import { cache } from "react";
import { apiClient, ApiError } from "@/shared/lib/api-client";
import { getProducts, normalizeProduct } from "@/features/catalog/api/get-products";
import type { Product, ProductFilterParams } from "@/features/catalog/types";
import type { AdminCategory } from "@/features/admin/types/admin-categories.types";
import type { SiteContactSettings } from "@/features/contact-settings/types";
import { articlesApi } from "@/features/articles/api/articles-api";
import { ARTICLES_DATA } from "@/features/articles/mock-data/articles-data";
import type { ArticleItem, PaginatedArticlesResponse } from "@/features/articles/types";
import { portfolioApi } from "@/features/portfolio/api/portfolio-api";
import { PORTFOLIO_PROJECTS } from "@/features/portfolio/mock-data/projects-data";
import type { ProjectItem, PaginatedPortfolioResponse } from "@/features/portfolio/types";
import { safeDecodeSlug } from "./seo";

function isHardNotFoundOrClientError(err: unknown): boolean {
  if (err instanceof ApiError) {
    return err.statusCode >= 400 && err.statusCode < 500;
  }
  return false;
}

export function isProductPubliclyVisible(product: Product | null | undefined): product is Product {
  if (!product) return false;
  return product.status !== "inactive" && product.status !== "discontinued";
}

export const getCachedContactSettings = cache(async (): Promise<SiteContactSettings | null> => {
  try {
    return await apiClient.get<SiteContactSettings>("/site-settings/contact");
  } catch {
    return null;
  }
});

export const getCachedCategories = cache(async (): Promise<AdminCategory[]> => {
  try {
    const res = await apiClient.get<AdminCategory[]>("/categories", {
      params: { isActive: true },
    });
    return Array.isArray(res) ? res : [];
  } catch {
    return [];
  }
});

export const getCachedAllPublishedProducts = cache(async (): Promise<Product[]> => {
  const seenIds = new Set<string>();
  const collected: Product[] = [];
  const limit = 100;
  let page = 1;
  let totalPages = 1;

  try {
    do {
      const res = await apiClient.get<{
        products?: unknown[];
        total?: number;
        page?: number;
        totalPages?: number;
      }>("/products", {
        params: { page, limit },
      });

      const list = Array.isArray(res?.products)
        ? res.products.map(normalizeProduct)
        : Array.isArray(res)
        ? (res as unknown[]).map(normalizeProduct)
        : [];

      for (const product of list) {
        if (!isProductPubliclyVisible(product)) continue;
        if (seenIds.has(product.id)) continue;
        seenIds.add(product.id);
        collected.push(product);
      }

      totalPages =
        typeof res?.totalPages === "number" && res.totalPages > 0 ? res.totalPages : 1;
      page += 1;
    } while (page <= totalPages && page <= 100);
  } catch (err) {
    console.warn("[SEO] Paginated products fetch failed:", err);
  }

  return collected;
});

export const getCachedCatalogProducts = cache(
  async (params: ProductFilterParams = {}): Promise<Product[]> => {
    const hasFilter = Boolean(
      (params.category && params.category !== "all") ||
        params.search ||
        params.brands?.length ||
        params.inStockOnly ||
        params.onSaleOnly ||
        params.minPrice !== undefined ||
        params.maxPrice !== undefined ||
        (params.sort && params.sort !== "newest")
    );

    if (!hasFilter) {
      return getCachedAllPublishedProducts();
    }

    // Fetch filtered list with generous limit so backend default 20 doesn't clip SSR categories
    const list = await getProducts({ ...params, limit: 100 });
    return list.filter(isProductPubliclyVisible);
  }
);

export const getCachedProductBySlug = cache(async (slugOrId: string): Promise<Product | null> => {
  const cleanSlug = safeDecodeSlug(slugOrId);
  try {
    const res = await apiClient.get<Product>(`/products/${encodeURIComponent(cleanSlug)}`);
    if (!res) return null;
    return normalizeProduct(res);
  } catch (err) {
    if (!isHardNotFoundOrClientError(err)) {
      console.warn(`[SEO] Failed to fetch product "${cleanSlug}":`, err);
    }
    return null;
  }
});

export const getCachedArticleBySlug = cache(
  async (slugOrId: string): Promise<(ArticleItem & { relatedArticles?: ArticleItem[] }) | null> => {
    const cleanSlug = safeDecodeSlug(slugOrId);
    try {
      const res = await articlesApi.getArticleBySlug(cleanSlug);
      if (res && res.title) {
        return res;
      }
      return null;
    } catch (err) {
      if (isHardNotFoundOrClientError(err)) {
        return null;
      }
      console.warn(`[SEO] Articles API unreachable for "${cleanSlug}":`, err);
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
      return fallback ?? null;
    }
  }
);

export const getCachedPublishedArticlesPage = cache(
  async (
    page = 1,
    limit = 12,
    category?: string
  ): Promise<PaginatedArticlesResponse & { isFallback?: boolean }> => {
    try {
      const res = await articlesApi.getArticles({
        status: "PUBLISHED",
        page,
        limit,
        category: category && category !== "all" ? category : undefined,
      });
      if (res && Array.isArray(res.items)) {
        return res;
      }
    } catch (err) {
      console.warn("[SEO] Published articles page fetch failed:", err);
    }

    const filteredFallback =
      category && category !== "all"
        ? ARTICLES_DATA.filter(
            (a) =>
              a.category === category ||
              a.categorySlug === category ||
              a.categoryId === category
          )
        : ARTICLES_DATA;

    const total = filteredFallback.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const start = (page - 1) * limit;

    return {
      items: filteredFallback.slice(start, start + limit),
      total,
      page,
      limit,
      totalPages,
      isFallback: true,
    };
  }
);

export const getCachedAllPublishedArticles = cache(
  async (allowFallback = false): Promise<ArticleItem[]> => {
    const seen = new Set<string>();
    const collected: ArticleItem[] = [];
    let page = 1;
    let totalPages = 1;

    try {
      do {
        const res = await articlesApi.getArticles({
          status: "PUBLISHED",
          page,
          limit: 100,
        });
        const items = Array.isArray(res?.items) ? res.items : [];
        for (const item of items) {
          if (item.status && item.status !== "PUBLISHED") continue;
          if (item.isIndexable === false) continue;
          const key = item.slug || item.id;
          if (seen.has(key)) continue;
          seen.add(key);
          collected.push(item);
        }
        totalPages =
          typeof res?.totalPages === "number" && res.totalPages > 0 ? res.totalPages : 1;
        page += 1;
      } while (page <= totalPages && page <= 100);

      return collected;
    } catch (err) {
      console.warn("[SEO] All published articles fetch failed:", err);
      return allowFallback ? ARTICLES_DATA.filter((a) => a.isIndexable !== false) : [];
    }
  }
);

export const getCachedProjectBySlug = cache(
  async (slugOrId: string): Promise<ProjectItem | null> => {
    const cleanSlug = safeDecodeSlug(slugOrId);
    try {
      const res = await portfolioApi.getPortfolioBySlug(cleanSlug);
      if (res && res.title) {
        return res;
      }
      return null;
    } catch (err) {
      if (isHardNotFoundOrClientError(err)) {
        return null;
      }
      console.warn(`[SEO] Portfolio API unreachable for "${cleanSlug}":`, err);
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
      return fallback ?? null;
    }
  }
);

export const getCachedPublishedProjectsPage = cache(
  async (
    page = 1,
    limit = 12,
    category?: string
  ): Promise<PaginatedPortfolioResponse & { isFallback?: boolean }> => {
    try {
      const res = await portfolioApi.getPortfolios({
        status: "PUBLISHED",
        page,
        limit,
        category: category && category !== "all" ? category : undefined,
      });
      if (res && Array.isArray(res.items)) {
        return res;
      }
    } catch (err) {
      console.warn("[SEO] Published projects page fetch failed:", err);
    }

    const filteredFallback =
      category && category !== "all"
        ? PORTFOLIO_PROJECTS.filter(
            (p) =>
              p.category === category ||
              p.categorySlug === category ||
              p.categoryId === category
          )
        : PORTFOLIO_PROJECTS;

    const total = filteredFallback.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const start = (page - 1) * limit;

    return {
      items: filteredFallback.slice(start, start + limit),
      total,
      page,
      limit,
      totalPages,
      isFallback: true,
    };
  }
);

export const getCachedAllPublishedProjects = cache(
  async (allowFallback = false): Promise<ProjectItem[]> => {
    const seen = new Set<string>();
    const collected: ProjectItem[] = [];
    let page = 1;
    let totalPages = 1;

    try {
      do {
        const res = await portfolioApi.getPortfolios({
          status: "PUBLISHED",
          page,
          limit: 100,
        });
        const items = Array.isArray(res?.items) ? res.items : [];
        for (const item of items) {
          if (item.status && item.status !== "PUBLISHED") continue;
          if (item.isIndexable === false) continue;
          const key = item.slug || item.id;
          if (seen.has(key)) continue;
          seen.add(key);
          collected.push(item);
        }
        totalPages =
          typeof res?.totalPages === "number" && res.totalPages > 0 ? res.totalPages : 1;
        page += 1;
      } while (page <= totalPages && page <= 100);

      return collected;
    } catch (err) {
      console.warn("[SEO] All published projects fetch failed:", err);
      return allowFallback ? PORTFOLIO_PROJECTS.filter((p) => p.isIndexable !== false) : [];
    }
  }
);
