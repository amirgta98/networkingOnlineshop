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
  const isToman =
    currency === "IRT" ||
    currency === "تومان" ||
    (currency === "AUTO" && price >= 1000);

  if (isToman) {
    return `${price.toLocaleString("fa-IR")} تومان`;
  }

  const selectedCurrency = currency === "AUTO" ? "USD" : currency;
  const selectedLocale = locale || "en-US";

  return new Intl.NumberFormat(selectedLocale, {
    style: "currency",
    currency: selectedCurrency,
    minimumFractionDigits: price % 1 === 0 ? 0 : 2,
  }).format(price);
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


