import type { Metadata } from "next";
import { DashboardSectionPage } from "@/features/dashboard";

export const metadata: Metadata = {
  title: "امنیت و تایید دو مرحله‌ای (۲FA) | پیشخوان کاربری",
  description: "مدیریت لایه رمز عبور دوم، نشست‌های ورود فعال، مانیتورینگ دستگاه‌ها و گزارش ورود",
};

export default function DashboardSecurityPage() {
  return <DashboardSectionPage pageKey="security" />;
}
