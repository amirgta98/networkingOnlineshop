import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines conditional class names with clsx and merges conflicting Tailwind classes with tailwind-merge.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Formats a numeric price into a localized currency string.
 * Supports Persian Toman (for Iranian Rial/Toman prices >= 1,000 or when specified)
 * and USD for standard catalog pricing.
 */
export function formatPrice(
  price: number,
  currency: string = "AUTO",
  locale?: string
): string {
  const safePrice = typeof price === "number" && !isNaN(price) ? price : 0;
  const isUSD = currency === "USD";

  if (!isUSD) {
    return `${safePrice.toLocaleString("fa-IR")} تومان`;
  }

  const selectedLocale = locale || "en-US";
  return new Intl.NumberFormat(selectedLocale, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: safePrice % 1 === 0 ? 0 : 2,
  }).format(safePrice);
}

/**
 * Converts English digits to Persian numerals (۰-۹).
 */
export function toPersianDigits(value: number | string): string {
  const str = String(value);
  const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return str.replace(/[0-9]/g, (w) => persianDigits[parseInt(w, 10)]);
}

/**
 * Normalizes and resolves product image URLs ensuring uploads and samples load without 404s.
 */
export function resolveProductImageUrl(url?: string | null): string {
  if (!url || typeof url !== "string") return "";
  const trimmed = url.trim();
  if (!trimmed) return "";

  // Blob and data URLs (client-side preview)
  if (trimmed.startsWith("blob:") || trimmed.startsWith("data:")) {
    return trimmed;
  }

  // Absolute URLs
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  // Already prefixed with root path
  if (trimmed.startsWith("/")) {
    return trimmed;
  }

  // Relative path starting with uploads/
  if (trimmed.startsWith("uploads/")) {
    return `/${trimmed}`;
  }

  // Raw filename (e.g. prod-xxx.webp or sample-xxx.webp)
  return `/uploads/products/${trimmed}`;
}

/**
 * Normalizes Persian province names (stripping leading 'استان', unifying spaces, ZWNJ, and Arabic characters).
 */
export function normalizeProvinceName(province?: string | null): string {
  if (!province || typeof province !== "string") return "";
  return province
    .trim()
    .replace(/^استان\s+/i, "")
    .replace(/_/g, " ")
    .replace(/\u200c|\u200f|\u00a0/g, " ")
    .replace(/ي/g, "ی")
    .replace(/ك/g, "ک")
    .replace(/ة/g, "ه")
    .replace(/\s*و\s*/g, " و ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Checks if two Iranian province names match after canonical normalization.
 */
export function areProvincesMatching(prov1?: string | null, prov2?: string | null): boolean {
  const p1 = normalizeProvinceName(prov1);
  const p2 = normalizeProvinceName(prov2);
  if (!p1 || !p2) return false;
  return p1 === p2;
}

/**
 * Formats a Date or ISO string into Jalali numeric representation (e.g. 1405/08/03 14:30)
 */
export function formatJalaliDate(dateInput: Date | string | null | undefined): string {
  if (!dateInput) return "—";
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return "—";
  try {
    return new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
      timeZone: "Asia/Tehran",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date);
  } catch {
    return date.toLocaleDateString("fa-IR");
  }
}


