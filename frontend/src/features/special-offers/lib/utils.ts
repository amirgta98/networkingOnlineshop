import type { CountdownTime } from "../types";


/**
 * Converts English digits to Persian numerals (۰-۹).
 */
export function toPersianDigits(value: number | string): string {
  const str = String(value);
  const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return str.replace(/[0-9]/g, (w) => persianDigits[parseInt(w, 10)]);
}

/**
 * Formats a number with comma separators and Persian digits.
 */
export function formatPersianNumber(value: number): string {
  const formatted = value.toLocaleString("fa-IR");
  return formatted;
}

/**
 * Formats price in Toman with Persian formatting.
 * If currency is provided as USD, formats in USD with Persian digits.
 */
export function formatSpecialPrice(price: number, unit: string = "تومان"): string {
  return `${price.toLocaleString("fa-IR")} ${unit}`;
}

/**
 * Calculates remaining time until a given end date.
 */
export function getRemainingTime(targetDate: Date | string | number): CountdownTime {
  const target = typeof targetDate === "string" || typeof targetDate === "number" 
    ? new Date(targetDate).getTime() 
    : targetDate.getTime();
  const now = Date.now();
  const diff = target - now;

  if (isNaN(diff) || diff <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isExpired: true,
    };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return {
    days,
    hours,
    minutes,
    seconds,
    isExpired: false,
  };
}
