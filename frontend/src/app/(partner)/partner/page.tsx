import type { Metadata } from "next";
import { PartnerOverviewView } from "@/features/partner";

export const metadata: Metadata = {
  title: "پیشخوان پرتال همکاران تجاری (B2B) | ققنوس آکادمی",
  description: "داشبورد اختصاصی مدیریت خط اعتباری، چک‌های صیادی و خریدهای عمده تجهیزات شبکه.",
};

export default function PartnerPage() {
  return <PartnerOverviewView />;
}
