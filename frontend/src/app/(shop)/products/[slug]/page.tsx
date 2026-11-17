import * as React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetailViewWrapper } from "@/features/product-detail";
import {
  buildPublicMetadata,
  encodeSlugSegment,
  NOINDEX_NOFOLLOW_ROBOTS,
  PUBLIC_INDEX_ROBOTS,
  safeDecodeSlug,
  SITE_NAME,
} from "@/shared/lib/seo";
import {
  getCachedAllPublishedProducts,
  getCachedProductBySlug,
  isProductPubliclyVisible,
} from "@/shared/lib/server-seo-data";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = safeDecodeSlug(resolvedParams.slug);
  const product = await getCachedProductBySlug(slug);

  if (!isProductPubliclyVisible(product)) {
    return {
      title: "محصول مورد نظر یافت نشد",
      description: "متاسفانه کالای مورد نظر در کاتالوگ تجهیزات شبکه یافت نشد یا در حال حاضر در دسترس نیست.",
      robots: NOINDEX_NOFOLLOW_ROBOTS,
    };
  }

  const encodedSlug = encodeSlugSegment(product.slug);
  const pageTitle = `${product.name} | قیمت و خرید با گارانتی | ${SITE_NAME}`;
  const trimmedDesc = product.description?.trim();
  const pageDescription = trimmedDesc
    ? `${trimmedDesc} خرید با ضمانت اصالت کالا و گارانتی معتبر از ${SITE_NAME}.`
    : `مشخصات فنی، قیمت و خرید ${product.name} با ضمانت اصالت کالا و گارانتی شرکتی از ${SITE_NAME}.`;

  const primaryImage =
    product.images && product.images.length > 0 ? product.images[0] : undefined;

  return buildPublicMetadata({
    title: pageTitle,
    description: pageDescription,
    path: `/products/${encodedSlug}`,
    image: primaryImage,
    imageAlt: product.name,
    keywords: [
      product.name,
      product.brand || "تجهیزات شبکه",
      product.sku || product.id,
      product.category,
      "خرید تجهیزات شبکه",
      "تجهیزات دیتاسنتر",
    ],
    robots: PUBLIC_INDEX_ROBOTS,
  });
}

export const dynamicParams = true;

export async function generateStaticParams() {
  const products = await getCachedAllPublishedProducts();
  return products.map((product) => ({
    slug: product.slug,
  }));
}

export default async function ProductDetailPage({ params }: Props) {
  const resolvedParams = await params;
  const slug = safeDecodeSlug(resolvedParams.slug);
  const product = await getCachedProductBySlug(slug);

  if (!isProductPubliclyVisible(product)) {
    notFound();
  }

  const allProducts = await getCachedAllPublishedProducts();
  let related: typeof allProducts = [];

  if (product.relatedProducts && product.relatedProducts.length > 0) {
    related = product.relatedProducts.filter(
      (p) => p.id !== product.id && isProductPubliclyVisible(p)
    );
  } else if (product.relatedProductIds && product.relatedProductIds.length > 0) {
    related = product.relatedProductIds
      .map((relId) =>
        allProducts.find(
          (p) =>
            p.id === relId ||
            p.slug === relId ||
            (p.sku && p.sku.toLowerCase() === relId.toLowerCase())
        )
      )
      .filter(
        (p): p is (typeof allProducts)[number] => Boolean(p && p.id !== product.id)
      );
  }

  if (related.length === 0) {
    related = allProducts.filter(
      (p) => p.category === product.category && p.id !== product.id
    );

    if (related.length < 3) {
      const complementary = allProducts.filter(
        (p) => p.id !== product.id && !related.some((r) => r.id === p.id)
      );
      related = [...related, ...complementary].slice(0, 3);
    }
  }

  return (
    <ProductDetailViewWrapper
      slug={slug}
      initialProduct={product}
      relatedProducts={related}
    />
  );
}
