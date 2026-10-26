import type { Metadata } from "next";
import { AdminAffiliatesView } from "@/features/admin";

export const metadata: Metadata = {
  title: "مدیریت همکاران فروش و سیستم پورسانت | پنل مدیریت ققنوس آکادمی",
  description: "مدیریت همکاران فعال، نظارت بر نرخ‌های اختصاصی، محاسبه پورسانت خطوط و تسویه‌حساب‌های مالی.",
};

export default function AdminAffiliatesPage() {
  return <AdminAffiliatesView />;
}
