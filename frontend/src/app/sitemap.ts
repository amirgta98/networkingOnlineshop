import type { MetadataRoute } from "next";
import { getProducts } from "@/features/catalog/api/get-products";
import { articlesApi } from "@/features/articles/api/articles-api";
import { portfolioApi } from "@/features/portfolio/api/portfolio-api";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://fonix-accademic.ir";

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/internet`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/installation`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  let productPages: MetadataRoute.Sitemap = [];
  try {
    const products = await getProducts();
    if (Array.isArray(products)) {
      productPages = products.map((p) => ({
        url: `${baseUrl}/products/${p.slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.8,
      }));
    }
  } catch (error) {
    console.warn("[Sitemap] Failed to fetch dynamic products:", error);
  }

  let articlePages: MetadataRoute.Sitemap = [];
  try {
    const res = await articlesApi.getArticles({ status: "PUBLISHED", limit: 100 });
    if (res && Array.isArray(res.items)) {
      articlePages = res.items
        .filter((a) => a.isIndexable !== false)
        .map((a) => ({
          url: `${baseUrl}/articles/${a.slug}`,
          lastModified: a.updatedAt ? new Date(a.updatedAt) : new Date(),
          changeFrequency: "weekly",
          priority: 0.8,
        }));
    }
  } catch (error) {
    console.warn("[Sitemap] Failed to fetch dynamic articles:", error);
  }

  let portfolioPages: MetadataRoute.Sitemap = [];
  try {
    const res = await portfolioApi.getPortfolios({ status: "PUBLISHED", limit: 100 });
    if (res && Array.isArray(res.items)) {
      portfolioPages = res.items
        .filter((p) => p.isIndexable !== false)
        .map((p) => ({
          url: `${baseUrl}/portfolio/${p.slug}`,
          lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
          changeFrequency: "monthly",
          priority: 0.8,
        }));
    }
  } catch (error) {
    console.warn("[Sitemap] Failed to fetch dynamic portfolios:", error);
  }

  return [...staticPages, ...productPages, ...articlePages, ...portfolioPages];
}
