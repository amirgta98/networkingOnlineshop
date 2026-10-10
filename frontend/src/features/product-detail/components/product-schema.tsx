import * as React from "react";
import { Product } from "@/features/catalog/types";

export interface ProductSchemaProps {
  product: Product;
  baseUrl?: string;
}

export function ProductSchema({ product, baseUrl = "https://fonix-accademic.ir" }: ProductSchemaProps) {
  const canonicalUrl = `${baseUrl}/products/${product.slug}`;

  // 1. Schema.org Product
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.images,
    description: product.description,
    sku: product.sku || product.id,
    mpn: product.sku || product.id,
    brand: {
      "@type": "Brand",
      name: product.brand || "تجهیزات شبکه ققنوس آکادمی",
    },
    offers: {
      "@type": "Offer",
      url: canonicalUrl,
      priceCurrency: "IRR",
      // Iranian Tomans converted to standard Rials for international bot standard
      price: product.price * 10,
      priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      itemCondition: "https://schema.org/NewCondition",
      availability: product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: "ققنوس آکادمی",
        url: baseUrl,
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
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: product.rating,
      reviewCount: product.reviewCount || 1,
      bestRating: 5,
      worstRating: 1,
    },
  };

  // 2. Schema.org BreadcrumbList
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "خانه",
        item: baseUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "محصولات",
        item: `${baseUrl}/products`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: product.category,
        item: `${baseUrl}/products?category=${product.category}`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: product.name,
        item: canonicalUrl,
      },
    ],
  };

  // 3. Schema.org FAQPage (Rich FAQ snippets in Google)
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `آیا ${product.name} دارای گارانتی اصالت است؟`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `بله، تمامی تجهیزات عرضه شده در فروشگاه دارای ${product.warranty || "ضمانت اصالت فیزیکی و گارانتی طلایی شرکتی"} همراه با سریال معتبر و مدارک رسمی واردات می‌باشند.`,
        },
      },
      {
        "@type": "Question",
        name: `شرایط ارسال و مهلت تست ${product.name} چگونه است؟`,
        acceptedAnswer: {
          "@type": "Answer",
          text: "سفارش‌های تهران کمتر از ۳ ساعت کاری و سفارش‌های شهرستان طی ۲۴ الی ۴۸ ساعت با بسته‌بندی ایمن ضدضربه ارسال می‌شوند. همچنین کلیه کالاها دارای ۷ روز مهلت تست فنی و ۳۰ روز ضمانت بازگشت وجه هستند.",
        },
      },
      {
        "@type": "Question",
        name: `آیا امکان صدور فاکتور رسمی برای خرید ${product.name} وجود دارد؟`,
        acceptedAnswer: {
          "@type": "Answer",
          text: "بله، برای تمامی سفارش‌های سازمانی و شرکتی، فاکتور رسمی معتبر به همراه شناسه ملی، کد اقتصادی و گواهی ارزش افزوده صادر می‌شود.",
        },
      },
    ],
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </>
  );
}
