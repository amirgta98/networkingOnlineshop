import type { Metadata } from "next";
import type { SiteContactSettings } from "@/features/contact-settings/types";

const RAW_SITE_URL =
  process.env["SITE_URL"] ||
  process.env["NEXT_PUBLIC_SITE_URL"] ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://fonix-accademic.ir";

export const SITE_URL = RAW_SITE_URL.trim().replace(/\/+$/, "");
export const SITE_NAME = "ققنوس آکادمی";
export const SITE_NAME_FULL = "ققنوس آکادمی (Fonix Academic)";
export const SITE_LOCALE = "fa_IR";
export const DEFAULT_SITE_DESCRIPTION =
  "ققنوس آکادمی — فروشگاه تخصصی تجهیزات شبکه، زیرساخت اکتیو و پسیو، سوئیچ سیسکو، روتر میکروتیک، اینترنت سازمانی و اجرای پروژه‌های دیتاسنتر.";

export const NOINDEX_FOLLOW_ROBOTS: Metadata["robots"] = {
  index: false,
  follow: true,
  googleBot: {
    index: false,
    follow: true,
  },
};

export const NOINDEX_NOFOLLOW_ROBOTS: Metadata["robots"] = {
  index: false,
  follow: false,
  googleBot: {
    index: false,
    follow: false,
  },
};

export const PUBLIC_INDEX_ROBOTS: Metadata["robots"] = {
  index: true,
  follow: true,
  googleBot: {
    index: true,
    follow: true,
    "max-image-preview": "large",
    "max-snippet": -1,
    "max-video-preview": -1,
  },
};

export function safeDecodeSlug(slug: string): string {
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

export function encodeSlugSegment(slug: string): string {
  return encodeURIComponent(safeDecodeSlug(slug.trim()));
}

export function buildCanonicalUrl(pathOrUrl: string): string {
  const trimmed = pathOrUrl.trim();
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed.replace(/\/+$/, "") || SITE_URL;
  }
  const normalizedPath = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  if (normalizedPath === "/") {
    return SITE_URL;
  }
  return `${SITE_URL}${normalizedPath.replace(/\/+$/, "")}`;
}

export function resolveAbsoluteAssetUrl(url?: string | null): string | undefined {
  if (!url || typeof url !== "string") return undefined;
  const trimmed = url.trim();
  if (!trimmed) return undefined;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith("/")) return `${SITE_URL}${trimmed}`;
  return `${SITE_URL}/${trimmed}`;
}

/**
 * Parses a Gregorian/ISO date string or Date object safely.
 * Rejects Jalali display strings (e.g. "1403/08/12" or Persian digits) that JS Date would misparse as year 1403 AD.
 */
export function toValidIsoDate(value?: string | Date | null): string | undefined {
  if (!value) return undefined;
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime()) || value.getUTCFullYear() < 2000) return undefined;
    return value.toISOString();
  }
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!/^\d{4}-\d{2}-\d{2}/.test(trimmed)) return undefined;
  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime()) || parsed.getUTCFullYear() < 2000) return undefined;
  return parsed.toISOString();
}

export function toValidDate(value?: string | Date | null): Date | undefined {
  const iso = toValidIsoDate(value);
  return iso ? new Date(iso) : undefined;
}

export function normalizeCanonicalInput(canonicalUrl: string | undefined | null, fallbackPath: string): string {
  if (canonicalUrl && typeof canonicalUrl === "string") {
    const trimmed = canonicalUrl.trim();
    if (trimmed.startsWith("/") || /^https?:\/\//i.test(trimmed)) {
      return buildCanonicalUrl(trimmed);
    }
  }
  return buildCanonicalUrl(fallbackPath);
}

export interface PublicMetadataOptions {
  title: string;
  description: string;
  path: string;
  canonicalUrl?: string | null;
  image?: string | null;
  imageAlt?: string;
  type?: "website" | "article";
  keywords?: string[] | string;
  robots?: Metadata["robots"];
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
}

export function stripBrandSuffix(rawTitle: string): string {
  return rawTitle.replace(/\s*\|\s*ققنوس آکادمی\s*$/u, "").trim();
}

export function buildPublicMetadata({
  title,
  description,
  path,
  canonicalUrl,
  image,
  imageAlt,
  type = "website",
  keywords,
  robots = PUBLIC_INDEX_ROBOTS,
  publishedTime,
  modifiedTime,
  authors,
}: PublicMetadataOptions): Metadata {
  const canonical = normalizeCanonicalInput(canonicalUrl, path);
  const resolvedImage = resolveAbsoluteAssetUrl(image);
  const cleanTitle = stripBrandSuffix(title);
  const socialTitle = cleanTitle.includes(SITE_NAME)
    ? cleanTitle
    : `${cleanTitle} | ${SITE_NAME}`;

  const openGraphBase = {
    title: socialTitle,
    description,
    url: canonical,
    siteName: SITE_NAME,
    locale: SITE_LOCALE,
    images: resolvedImage
      ? [
          {
            url: resolvedImage,
            alt: imageAlt || socialTitle,
          },
        ]
      : undefined,
  };

  return {
    title:
      path === "/" || cleanTitle.includes(SITE_NAME)
        ? { absolute: socialTitle }
        : cleanTitle,
    description,
    keywords,
    alternates: {
      canonical,
    },
    robots,
    openGraph:
      type === "article"
        ? {
            ...openGraphBase,
            type: "article",
            publishedTime,
            modifiedTime,
            authors,
          }
        : {
            ...openGraphBase,
            type: "website",
          },
    twitter: {
      card: resolvedImage ? "summary_large_image" : "summary",
      title: socialTitle,
      description,
      images: resolvedImage ? [resolvedImage] : undefined,
    },
  };
}

export function sanitizeJsonLd<T>(data: T): T {
  return JSON.parse(JSON.stringify(data)) as T;
}

export function createOrganizationJsonLd(contact?: SiteContactSettings | null) {
  const sameAs = [
    contact?.instagramUrl,
    contact?.linkedinUrl,
    contact?.youtubeUrl,
    contact?.aparatUrl,
    contact?.telegramChannelUrl,
  ]
    .filter((u): u is string => Boolean(u && /^https?:\/\//i.test(u.trim())))
    .map((u) => u.trim());

  const phone = contact?.mainPhone?.trim() || contact?.supportPhone1?.trim() || undefined;
  const email = contact?.generalEmail?.trim() || undefined;
  const streetAddress = contact?.address?.trim() || undefined;
  const postalCode = contact?.postalCode?.trim() || undefined;

  return sanitizeJsonLd({
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    alternateName: SITE_NAME_FULL,
    url: SITE_URL,
    ...(email ? { email } : {}),
    ...(phone
      ? {
          contactPoint: [
            {
              "@type": "ContactPoint",
              telephone: phone,
              contactType: "customer service",
              areaServed: "IR",
              availableLanguage: ["fa"],
            },
          ],
        }
      : {}),
    ...(streetAddress
      ? {
          address: {
            "@type": "PostalAddress",
            streetAddress,
            ...(postalCode ? { postalCode } : {}),
            addressCountry: "IR",
          },
        }
      : {}),
    ...(sameAs.length > 0 ? { sameAs } : {}),
  });
}

export function createWebSiteJsonLd() {
  return sanitizeJsonLd({
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: SITE_NAME,
    alternateName: SITE_NAME_FULL,
    inLanguage: "fa-IR",
    publisher: {
      "@id": `${SITE_URL}/#organization`,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/products?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  });
}

export interface BreadcrumbEntry {
  name: string;
  path: string;
}

export function createBreadcrumbJsonLd(items: BreadcrumbEntry[]) {
  return sanitizeJsonLd({
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: item.name,
      item: buildCanonicalUrl(item.path),
    })),
  });
}

export interface FaqEntry {
  question: string;
  answer: string;
}

export function createFaqJsonLd(items: FaqEntry[]) {
  if (!items || items.length === 0) return null;
  return sanitizeJsonLd({
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  });
}

export interface ServiceJsonLdOptions {
  name: string;
  description: string;
  path: string;
  serviceType: string;
  areaServed?: string;
}

export function createServiceJsonLd({
  name,
  description,
  path,
  serviceType,
  areaServed = "IR",
}: ServiceJsonLdOptions) {
  const url = buildCanonicalUrl(path);
  return sanitizeJsonLd({
    "@type": "Service",
    "@id": `${url}#service`,
    name,
    description,
    url,
    serviceType,
    areaServed: {
      "@type": "Country",
      name: areaServed === "IR" ? "Iran" : areaServed,
    },
    provider: {
      "@id": `${SITE_URL}/#organization`,
    },
  });
}
