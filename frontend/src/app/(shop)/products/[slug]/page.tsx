import * as React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProducts, getProductBySlugOrId } from "@/features/catalog";
import { MOCK_PRODUCTS } from "@/shared/lib/mocks/mock-products";
import {
  ProductDetailClient,
  ProductSchema,
} from "@/features/product-detail";

type Props = {
  params: Promise<{ slug: string }>;
};

// ─── Dynamic SEO Metadata ───────────────────────────────────────────────────

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
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

  const canonicalUrl = `https://velox.ir/products/${product.slug}`;

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
      siteName: "ققنوس آکادمی | ولوکس",
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

export async function generateStaticParams() {
  return MOCK_PRODUCTS.map((product) => ({
    slug: product.slug,
  }));
}

// ─── Product Detail Page Server Component ───────────────────────────────────

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlugOrId(slug);

  if (!product) {
    notFound();
  }

  const allProducts = await getProducts();
  // Filter compatible / related products by category
  let related = allProducts.filter(
    (p) => p.category === product.category && p.id !== product.id
  );

  // If few related products found in same category, complement with other featured networking items
  if (related.length < 3) {
    const complementary = allProducts.filter(
      (p) => p.id !== product.id && !related.some((r) => r.id === p.id)
    );
    related = [...related, ...complementary].slice(0, 3);
  }

  return (
    <>
      {/* ── JSON-LD Structured Data for Google Rich Snippets ───────────── */}
      <ProductSchema product={product} />

      {/* ── Interactive Client App ─────────────────────────────────────── */}
      <ProductDetailClient
        product={product}
        relatedProducts={related.slice(0, 3)}
      />
    </>
  );
}
