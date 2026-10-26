import * as React from "react";
import type { Metadata } from "next";
import { getProducts, getProductBySlugOrId } from "@/features/catalog";
import {
  ProductDetailViewWrapper,
} from "@/features/product-detail";

type Props = {
  params: Promise<{ slug: string }>;
};

// ─── Dynamic SEO Metadata ───────────────────────────────────────────────────

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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = safeDecodeSlug(resolvedParams.slug);
  const product = await getProductBySlugOrId(slug);

  if (!product) {
    return {
      title: "محصول مورد نظر یافت نشد | فروشگاه تخصصی ققنوس آکادمی",
      description: "متاسفانه کالای مورد نظر در پایگاه داده تجهیزات شبکه یافت نشد.",
      robots: { index: false, follow: false },
    };
  }

  const pageTitle = `${product.name} | قیمت روز و خرید با گارانتی | ققنوس آکادمی`;
  const pageDescription = `${product.description} خرید آنلاین با تضمین ۱۰۰٪ اصالت کالا، تست فلوک چنل و ارسال سریع در سراسر کشور.`;
  const primaryImage =
    product.images && product.images.length > 0
      ? product.images[0]
      : "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=1200&auto=format&fit=crop&q=80";

  const canonicalUrl = `https://fonix-accademic.ir/products/${product.slug}`;

  return {
    title: pageTitle,
    description: pageDescription,
    keywords: [
      product.name,
      product.brand || "تجهیزات شبکه",
      product.sku || product.id,
      product.category,
      "خرید تجهیزات شبکه",
      "قیمت سوئیچ شبکه",
      "فروشگاه تجهیزات دیتاسنتر",
      "گارانتی معتبر",
      "تست فلوک",
    ],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      url: canonicalUrl,
      siteName: "ققنوس آکادمی",
      locale: "fa_IR",
      type: "website",
      images: [
        {
          url: primaryImage,
          width: 1200,
          height: 630,
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: pageDescription,
      images: [primaryImage],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
  };
}

// ─── Static Site Generation (SSG) Pre-rendering ─────────────────────────────

export const dynamicParams = true;

export async function generateStaticParams() {
  const products = await getProducts();
  return (products || []).map((product) => ({
    slug: product.slug,
  }));
}

// ─── Product Detail Page Server Component ───────────────────────────────────

export default async function ProductDetailPage({ params }: Props) {
  const resolvedParams = await params;
  const slug = safeDecodeSlug(resolvedParams.slug);
  const product = await getProductBySlugOrId(slug);

  const fetchedProducts = await getProducts();
  const allProducts = Array.isArray(fetchedProducts) ? fetchedProducts : [];
  
  let related: typeof allProducts = [];

  // 1. Prioritize explicit related products selected by admin
  if (product?.relatedProducts && product.relatedProducts.length > 0) {
    related = product.relatedProducts.filter((p) => p.id !== product.id);
  } else if (product?.relatedProductIds && product.relatedProductIds.length > 0) {
    related = product.relatedProductIds
      .map((relId) =>
        allProducts.find(
          (p) =>
            p.id === relId ||
            p.slug === relId ||
            (p.sku && p.sku.toLowerCase() === relId.toLowerCase())
        )
      )
      .filter((p): p is (typeof allProducts)[number] => Boolean(p && p.id !== product.id));
  }

  // 2. Fallback to same category only if no explicit related products were chosen
  if (related.length === 0 && product) {
    related = allProducts.filter((p) => p.category === product.category && p.id !== product.id);

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
