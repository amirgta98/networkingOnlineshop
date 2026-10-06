import type { Metadata } from "next";
import { DashboardSectionPage } from "@/features/dashboard";

export const metadata: Metadata = {
  title: "باشگاه مشتریان و امتیاز وفاداری | پیشخوان کاربری",
  description: "امتیازات کسب‌شده از هر خرید و تبدیل به بن تخفیف یا هدایای فنی و تجهیزات شبکه",
};

export default function DashboardClubPage() {
  return <DashboardSectionPage pageKey="club" />;
}
