import * as React from "react";
import { Product } from "@/features/catalog/types";
import {
  buildCanonicalUrl,
  createBreadcrumbJsonLd,
  encodeSlugSegment,
  resolveAbsoluteAssetUrl,
  sanitizeJsonLd,
  SITE_NAME,
  SITE_URL,
} from "@/shared/lib/seo";

const CATEGORY_LABELS: Record<string, string> = {
  switches: "سوئیچ‌های شبکه",
  routers: "روترهای سازمانی",
  wireless: "تجهیزات وایرلس",
  fiber: "فیبر نوری و ماژول",
  cables: "کابل و پچ‌کورد",
  passive: "تجهیزات پسیو و رک",
  accessories: "لوازم جانبی",
};

export interface ProductSchemaProps {
  product: Product;
  baseUrl?: string;
}

export function ProductSchema({ product, baseUrl = SITE_URL }: ProductSchemaProps) {
  const cleanBase = baseUrl.replace(/\/+$/, "");
  const encodedSlug = encodeSlugSegment(product.slug);
  const canonicalUrl = `${cleanBase}/products/${encodedSlug}`;

  const resolvedImages = (product.images || [])
    .map((img) => resolveAbsoluteAssetUrl(img))
    .filter((img): img is string => Boolean(img));

  const categoryLabel =
    CATEGORY_LABELS[product.category] || product.category || "تجهیزات شبکه";

  const hasVerifiedRating =
    typeof product.reviewCount === "number" &&
    product.reviewCount > 0 &&
    typeof product.rating === "number" &&
    product.rating > 0;

  const hasValidPrice = typeof product.price === "number" && product.price > 0;

  const productSchema = sanitizeJsonLd({
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${canonicalUrl}#product`,
    name: product.name,
    ...(resolvedImages.length > 0 ? { image: resolvedImages } : {}),
    description: product.description || product.name,
    sku: product.sku || product.id,
    mpn: product.sku || product.id,
    brand: {
      "@type": "Brand",
      name: product.brand || SITE_NAME,
    },
    offers: {
      "@type": "Offer",
      url: canonicalUrl,
      priceCurrency: "IRR",
      ...(hasValidPrice ? { price: Math.round(product.price * 10) } : {}),
      itemCondition: "https://schema.org/NewCondition",
      availability:
        product.status === "discontinued"
          ? "https://schema.org/Discontinued"
          : product.inStock
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: SITE_NAME,
        url: cleanBase,
      },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "IR",
        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 30,
        returnMethod: "https://schema.org/ReturnByMail",
        returnFees: "https://schema.org/FreeReturn",
      },
    },
    ...(hasVerifiedRating
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: Number(product.rating.toFixed(1)),
            reviewCount: product.reviewCount,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
  });

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    ...createBreadcrumbJsonLd([
      { name: "خانه", path: "/" },
      { name: "محصولات", path: "/products" },
      ...(product.category
        ? [
            {
              name: categoryLabel,
              path: `/products?category=${encodeSlugSegment(product.category)}`,
            },
          ]
        : []),
      {
        name: product.name,
        path: buildCanonicalUrl(`/products/${encodedSlug}`),
      },
    ]),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    </>
  );
}
