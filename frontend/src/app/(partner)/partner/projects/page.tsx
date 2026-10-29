import * as React from "react";
import type { Metadata } from "next";
import { PartnerProjectsView } from "@/features/partner";

export const metadata: Metadata = {
  title: "پروژه‌ها و مقاصد تحویل کارگاهی | پرتال سازمانی ققنوس آکادمی",
  description: "مدیریت سایت‌های اجرایی، کارگاه‌های نصب و دیتاسنترها جهت تحویل مستقیم به سرپرست کارگاه.",
};

export default function PartnerProjectsPage() {
  return (
    <React.Suspense fallback={<div className="p-8 text-center text-xs text-neutral-400">در حال بارگذاری...</div>}>
      <PartnerProjectsView />
    </React.Suspense>
  );
}
