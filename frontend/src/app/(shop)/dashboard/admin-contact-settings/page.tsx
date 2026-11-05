import type { Metadata } from "next";
import { DashboardSectionPage } from "@/features/dashboard";

export const metadata: Metadata = {
  title: "تنظیمات تماس و شبکه‌های اجتماعی | پیشخوان کاربری",
  description: "مدیریت اطلاعات تماس، شماره‌های پشتیبانی، شبکه‌های اجتماعی و راه‌های ارتباطی سایت",
};

export default function DashboardAdminContactSettingsPage() {
  return <DashboardSectionPage pageKey="admin-contact-settings" />;
}
