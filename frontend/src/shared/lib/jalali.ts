/**
 * Comprehensive Jalali (Solar Hijri / تقویم هجری شمسی) Calendar Library
 * Provides accurate bidirectional conversions, calendar grid mathematics,
 * and Persian formatting for all date/time operations.
 */

export const JALALI_MONTH_NAMES = [
  "فروردین",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند",
] as const;

export const JALALI_WEEKDAYS = [
  "شنبه",
  "یکشنبه",
  "دوشنبه",
  "سه‌شنبه",
  "چهارشنبه",
  "پنج‌شنبه",
  "جمعه",
] as const;

export const JALALI_SHORT_WEEKDAYS = ["ش", "ی", "د", "س", "چ", "پ", "ج"] as const;

export interface JalaliDateTime {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second?: number;
}

/**
 * Converts a Gregorian date (year, month 1-12, day 1-31) to Jalali (jy, jm, jd).
 */
export function gregorianToJalali(gy: number, gm: number, gd: number): { jy: number; jm: number; jd: number } {
  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  const gy2 = gm > 2 ? gy + 1 : gy;
  let days = 355666 + 365 * gy + Math.floor((gy2 + 3) / 4) - Math.floor((gy2 + 99) / 100) + Math.floor((gy2 + 399) / 400) + gd + g_d_m[gm - 1];
  let jy = -1595 + 33 * Math.floor(days / 12053);
  days %= 12053;
  jy += 4 * Math.floor(days / 1461);
  days %= 1461;
  if (days > 365) {
    jy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }
  let jm: number;
  let jd: number;
  if (days < 186) {
    jm = 1 + Math.floor(days / 31);
    jd = 1 + (days % 31);
  } else {
    jm = 7 + Math.floor((days - 186) / 30);
    jd = 1 + ((days - 186) % 30);
  }
  return { jy, jm, jd };
}

/**
 * Converts a Jalali date (jy, jm 1-12, jd 1-31) to Gregorian (gy, gm, gd).
 */
export function jalaliToGregorian(jy: number, jm: number, jd: number): { gy: number; gm: number; gd: number } {
  let gy = jy > 979 ? 1600 : 621;
  const adjustedJy = jy > 979 ? jy - 979 : jy;
  let days =
    365 * adjustedJy +
    Math.floor(adjustedJy / 33) * 8 +
    Math.floor(((adjustedJy % 33) + 3) / 4) +
    78 +
    jd +
    (jm < 7 ? (jm - 1) * 31 : (jm - 7) * 30 + 186);

  gy += 400 * Math.floor(days / 146097);
  days %= 146097;

  if (days > 36524) {
    gy += 100 * Math.floor(--days / 36524);
    days %= 36524;
    if (days >= 365) days++;
  }

  gy += 4 * Math.floor(days / 1461);
  days %= 1461;

  if (days > 365) {
    gy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }

  let gd = days + 1;
  const sal_a = [
    0,
    31,
    (gy % 4 === 0 && gy % 100 !== 0) || gy % 400 === 0 ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ];
  let gm = 0;
  while (gm < 13 && gd > sal_a[gm]) {
    gd -= sal_a[gm];
    gm++;
  }
  return { gy, gm, gd };
}

/**
 * Determines if a Jalali year is a leap year (کبیسه).
 */
export function isJalaliLeap(year: number): boolean {
  const g = jalaliToGregorian(year, 12, 30);
  const j = gregorianToJalali(g.gy, g.gm, g.gd);
  return j.jy === year && j.jm === 12 && j.jd === 30;
}

/**
 * Returns number of days in a given Jalali month (1 to 12).
 */
export function getDaysInJalaliMonth(year: number, month: number): number {
  if (month >= 1 && month <= 6) return 31;
  if (month >= 7 && month <= 11) return 30;
  if (month === 12) return isJalaliLeap(year) ? 30 : 29;
  return 30;
}

/**
 * Converts a JS Date or ISO string into Jalali year, month, day, hour, minute.
 */
export function dateToJalali(dateInput: Date | string): JalaliDateTime {
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) {
    const now = new Date();
    return dateToJalali(now);
  }

  try {
    const parts = new Intl.DateTimeFormat("en-US-u-ca-persian", {
      timeZone: "Asia/Tehran",
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: false,
    }).formatToParts(date);

    const get = (type: string) => {
      const p = parts.find((x) => x.type === type);
      return p ? parseInt(p.value, 10) : 0;
    };

    return {
      year: get("year"),
      month: get("month"),
      day: get("day"),
      hour: get("hour") % 24,
      minute: get("minute"),
      second: get("second"),
    };
  } catch {
    // Pure mathematical fallback if Intl fails
    const gy = date.getUTCFullYear();
    const gm = date.getUTCMonth() + 1;
    const gd = date.getUTCDate();
    const j = gregorianToJalali(gy, gm, gd);
    return {
      year: j.jy,
      month: j.jm,
      day: j.jd,
      hour: (date.getUTCHours() + 3) % 24,
      minute: (date.getUTCMinutes() + 30) % 60,
      second: date.getUTCSeconds(),
    };
  }
}

/**
 * Converts Jalali date components (Tehran time UTC+3:30) to a standard JavaScript Date.
 */
export function jalaliToDate(
  year: number,
  month: number,
  day: number,
  hour: number = 0,
  minute: number = 0,
  second: number = 0
): Date {
  const safeMonth = Math.min(Math.max(month, 1), 12);
  const maxDay = getDaysInJalaliMonth(year, safeMonth);
  const safeDay = Math.min(Math.max(day, 1), maxDay);
  const safeHour = Math.min(Math.max(hour, 0), 23);
  const safeMinute = Math.min(Math.max(minute, 0), 59);
  const safeSecond = Math.min(Math.max(second, 0), 59);

  const { gy, gm, gd } = jalaliToGregorian(year, safeMonth, safeDay);

  // Iran Standard Time is UTC+3:30 (12600000 ms)
  const utcMs = Date.UTC(gy, gm - 1, gd, safeHour, safeMinute, safeSecond) - 3.5 * 60 * 60 * 1000;
  return new Date(utcMs);
}

/**
 * Returns weekday index in Jalali week (0: شنبه, 1: یکشنبه, ..., 6: جمعه)
 */
export function getJalaliWeekdayIndex(date: Date): number {
  return (date.getDay() + 1) % 7;
}

/**
 * Returns weekday index for the 1st day of the given Jalali year and month.
 */
export function getFirstDayOfJalaliMonthWeekday(year: number, month: number): number {
  const firstDayDate = jalaliToDate(year, month, 1, 12, 0);
  return getJalaliWeekdayIndex(firstDayDate);
}

/**
 * Formats a Date or ISO string into full readable Persian string.
 * Example: "سه‌شنبه ۲۸ مهر ۱۴۰۵ ساعت ۱۳:۳۰"
 */
export function formatPersianDateTime(dateInput: Date | string | null | undefined): string {
  if (!dateInput) return "—";
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return "—";

  try {
    return new Intl.DateTimeFormat("fa-IR-u-ca-persian", {
      timeZone: "Asia/Tehran",
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch {
    const j = dateToJalali(date);
    const mName = JALALI_MONTH_NAMES[j.month - 1] || "";
    return `${j.day} ${mName} ${j.year}، ساعت ${String(j.hour).padStart(2, "0")}:${String(j.minute).padStart(2, "0")}`;
  }
}

/**
 * Formats date into numeric Jalali string with time.
 * Example: "۱۴۰۵/۰۷/۲۸ ۱۳:۳۰"
 */
export function formatPersianNumeric(dateInput: Date | string | null | undefined): string {
  if (!dateInput) return "—";
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return "—";

  const j = dateToJalali(date);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${j.year}/${pad(j.month)}/${pad(j.day)} ${pad(j.hour)}:${pad(j.minute)}`;
}
