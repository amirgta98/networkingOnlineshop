import type { Metadata } from "next";
import { DashboardSectionPage } from "@/features/dashboard";

export const metadata: Metadata = {
  title: "شخصی‌سازی زنده ظاهر و تم پلتفرم | پیشخوان کاربری",
  description: "تغییر لحظه‌ای پالت رنگ‌های اکتیو، فونت‌های فارسی، حاشیه‌ها و نورپردازی LED",
};

export default function DashboardAdminThemePage() {
  return <DashboardSectionPage pageKey="admin-theme" />;
}
