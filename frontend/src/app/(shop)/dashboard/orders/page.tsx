import type { Metadata } from "next";
import { DashboardSectionPage } from "@/features/dashboard";

export const metadata: Metadata = {
  title: "سفارش‌ها و رهگیری مرسولات | پیشخوان کاربری",
  description: "لیست کلیه خریدهای در حال پردازش، ارسال شده، تحویل شده و رهگیری مرسولات پستی و باربری",
};

export default function DashboardOrdersPage() {
  return <DashboardSectionPage pageKey="orders" />;
}
