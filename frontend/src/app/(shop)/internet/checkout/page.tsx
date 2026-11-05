import * as React from "react";
import type { Metadata } from "next";
import { InternetCheckoutClient } from "@/features/internet/components/internet-checkout-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "تکمیل خرید و پرداخت اشتراک اینترنت سازمانی | ققنوس آکادمی",
  description:
    "مرحله تسویه حساب و پرداخت آنلاین اشتراک اینترنت پرسرعت سازمانی (FTTH، پهنای باند متقارن و IP استاتیک اختصاصی) از طریق درگاه امن شاپرک یا کیف پول اعتباری.",
};

export default function InternetCheckoutPage() {
  return (
    <React.Suspense
      fallback={
        <div className="py-24 text-center max-w-md mx-auto text-neutral-400 text-xs" dir="rtl">
          در حال بارگذاری صفحه پرداخت اینترنت...
        </div>
      }
    >
      <InternetCheckoutClient />
    </React.Suspense>
  );
}
