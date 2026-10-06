import type { Metadata } from "next";
import { DashboardSectionPage } from "@/features/dashboard";

export const metadata: Metadata = {
  title: "مرکز فرماندهی و مدیریت سامانه | پیشخوان کاربری",
  description: "پایش بلادرنگ سرورها، تایید هویت شرکتی همکاران، گزارش‌های فروش کل و انبارداری",
};

export default function DashboardAdminOverviewPage() {
  return <DashboardSectionPage pageKey="admin-overview" />;
}
