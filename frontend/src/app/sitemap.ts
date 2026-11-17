import type { MetadataRoute } from "next";
import {
  buildCanonicalUrl,
  encodeSlugSegment,
  SITE_URL,
  toValidDate,
} from "@/shared/lib/seo";
import {
  getCachedAllPublishedArticles,
  getCachedAllPublishedProducts,
  getCachedAllPublishedProjects,
  getCachedCategories,
} from "@/shared/lib/server-seo-data";

export const dynamic = "force-dynamic";

const SITEMAP_MAX_URLS = 50000;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const seenUrls = new Set<string>();
  const entries: MetadataRoute.Sitemap = [];

  const pushEntry = (entry: MetadataRoute.Sitemap[number]) => {
    if (entries.length >= SITEMAP_MAX_URLS) return;
    const normalizedUrl = entry.url.trim();
    if (!normalizedUrl || seenUrls.has(normalizedUrl)) return;
    seenUrls.add(normalizedUrl);
    entries.push(entry);
  };

  // 1. Static public indexable pages (no fabricated lastModified dates)
  const staticRoutes: Array<{
    path: string;
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
    priority: number;
  }> = [
    { path: "/", changeFrequency: "daily", priority: 1.0 },
    { path: "/products", changeFrequency: "daily", priority: 0.9 },
    { path: "/boost", changeFrequency: "daily", priority: 0.85 },
    { path: "/internet", changeFrequency: "weekly", priority: 0.85 },
    { path: "/installation", changeFrequency: "weekly", priority: 0.85 },
    { path: "/articles", changeFrequency: "weekly", priority: 0.8 },
    { path: "/portfolio", changeFrequency: "weekly", priority: 0.8 },
    { path: "/about", changeFrequency: "monthly", priority: 0.7 },
    { path: "/careers", changeFrequency: "monthly", priority: 0.65 },
    { path: "/privacy", changeFrequency: "monthly", priority: 0.4 },
    { path: "/terms", changeFrequency: "monthly", priority: 0.4 },
  ];

  for (const route of staticRoutes) {
    pushEntry({
      url: buildCanonicalUrl(route.path),
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    });
  }

  // 2. Dynamic public indexable entities (paginated completely from API)
  const [products, categories, articles, projects] = await Promise.all([
    getCachedAllPublishedProducts(),
    getCachedCategories(),
    getCachedAllPublishedArticles(false),
    getCachedAllPublishedProjects(false),
  ]);

  // 2a. Valuable active category URLs
  for (const cat of categories) {
    if (cat.isActive === false || !cat.slug) continue;
    if (typeof cat.productCount === "number" && cat.productCount <= 0) continue;

    const lastModified = toValidDate(cat.updatedAt);
    pushEntry({
      url: `${SITE_URL}/products?category=${encodeSlugSegment(cat.slug)}`,
      ...(lastModified ? { lastModified } : {}),
      changeFrequency: "weekly",
      priority: 0.8,
    });
  }

  // 2b. Published & visible product detail pages
  for (const product of products) {
    if (!product.slug) continue;
    const lastModified =
      toValidDate(product.updatedAt) ?? toValidDate(product.createdAt);

    pushEntry({
      url: `${SITE_URL}/products/${encodeSlugSegment(product.slug)}`,
      ...(lastModified ? { lastModified } : {}),
      changeFrequency: "weekly",
      priority: 0.8,
    });
  }

  // 2c. Published & indexable article detail pages
  for (const article of articles) {
    if (!article.slug || article.isIndexable === false) continue;
    const lastModified =
      toValidDate(article.updatedAt) ?? toValidDate(article.publishedAtRaw);

    pushEntry({
      url: `${SITE_URL}/articles/${encodeSlugSegment(article.slug)}`,
      ...(lastModified ? { lastModified } : {}),
      changeFrequency: "weekly",
      priority: 0.75,
    });
  }

  // 2d. Published & indexable portfolio/project detail pages
  for (const project of projects) {
    if (!project.slug || project.isIndexable === false) continue;
    const lastModified = toValidDate(project.updatedAt);

    pushEntry({
      url: `${SITE_URL}/portfolio/${encodeSlugSegment(project.slug)}`,
      ...(lastModified ? { lastModified } : {}),
      changeFrequency: "monthly",
      priority: 0.7,
    });
  }

  return entries;
}
