import * as React from "react";
import type { Metadata } from "next";
import { InternetPageClient } from "@/features/internet";
import { internetApi } from "@/features/internet/api/internet-api";
import type { InternetPlan, InternetSettings } from "@/features/internet/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "خرید اینترنت پرسرعت سازمانی و IP استاتیک اختصاصی | ققنوس آکادمی",
  description:
    "خرید آنلاین انواع پلن‌های اینترنت فیبر نوری (FTTH)، پهنای باند اختصاصی متقارن، اینترنت اداری VDSL و TD-LTE به همراه تخصیص رسمی IP استاتیک برای دوربین‌های مداربسته، فایروال و اتصال شعب با تضمین پایداری ۹۹.۹٪.",
  keywords: [
    "خرید اینترنت",
    "اینترنت سازمانی",
    "خرید ای پی استاتیک",
    "آی پی استاتیک",
    "اینترنت فیبر نوری",
    "پهنای باند اختصاصی",
    "Static IP",
    "انتقال تصویر دوربین",
    "VDSL اداری",
    "اینترنت شرکت ها",
  ],
  openGraph: {
    title: "خرید اینترنت پرسرعت سازمانی و IP استاتیک اختصاصی | ققنوس آکادمی",
    description:
      "تخصیص آنلاین اینترنت فیبر نوری و بسته‌های IP استاتیک سازمانی با پشتیبانی ۲۴ ساعته NOC.",
    locale: "fa_IR",
    type: "website",
  },
};

export default async function InternetPage() {
  let initialPlans: InternetPlan[] = [];
  let initialSettings: InternetSettings | undefined = undefined;

  try {
    const [plans, settings] = await Promise.all([
      internetApi.getPlans(),
      internetApi.getSettings(),
    ]);
    initialPlans = plans || [];
    initialSettings = settings || undefined;
  } catch (err) {
    console.warn("SSR: Failed to pre-fetch internet plans from backend API:", err);
  }

  return (
    <React.Suspense fallback={null}>
      <InternetPageClient initialPlans={initialPlans} initialSettings={initialSettings} />
    </React.Suspense>
  );
}
