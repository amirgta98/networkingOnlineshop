import type { Metadata } from "next";
import { DashboardSectionPage } from "@/features/dashboard";

export const metadata: Metadata = {
  title: "مدیریت کارشناسان خرید شرکت | پیشخوان کاربری",
  description: "افزودن دسترسی کارشناسان تدارکات و پیمانکاران زیرمجموعه جهت ثبت سفارش",
};

export default function DashboardPartnerAgentsPage() {
  return <DashboardSectionPage pageKey="partner-agents" />;
}
