import * as React from "react";
import type { Metadata } from "next";
import { AboutPageClient } from "@/features/about";

export const metadata: Metadata = {
  title: "درباره ما و اطلاعات تماس | فروشگاه تخصصی تجهیزات شبکه ققنوس آکادمی",
  description:
    "آشنایی با تاریخچه، ماموریت، تیم مهندسی CCIE، انبار مکانیزه، تست فلوک DSX-8000، گارانتی تعویض ۱۸ ماهه و اطلاعات تماس و آدرس دفتر مرکزی فروشگاه تخصصی تجهیزات شبکه ققنوس آکادمی.",
  keywords: [
    "درباره ققنوس آکادمی",
    "تماس با ققنوس آکادمی",
    "تجهیزات شبکه تهران",
    "سوئیچ سیسکو اصل",
    "نمایندگی میکروتیک",
    "کابل شبکه لگراند اورجینال",
    "تست فلوک شبکه",
    "پشتیبانی فنی دیتاسنتر",
    "دفتر فروش ققنوس آکادمی",
  ],
  openGraph: {
    title: "درباره ما و اطلاعات تماس | فروشگاه تخصصی تجهیزات شبکه ققنوس آکادمی",
    description:
      "تامین اصیل، مهندسی پیشرفته و زیرساخت پایدار برای دیتاسنترهای ایران با گارانتی طلایی تعویض ۱۸ ماهه.",
    locale: "fa_IR",
    type: "website",
  },
};

export default function AboutPage() {
  return (
    <React.Suspense fallback={null}>
      <AboutPageClient />
    </React.Suspense>
  );
}
