import type { Metadata } from "next";
import { AdminInstallationAnalyticsView } from "@/features/admin";

export const metadata: Metadata = {
  title: "آمار و عملکرد پروژه‌های پسیو | پنل مدیریت ققنوس آکادمی",
  description:
    "تحلیل شاخص‌های مالی، نرخ تست فلوک، پراکندگی جغرافیایی پروژه‌ها و سرعت تحویل تیم‌های اجرایی.",
};

export default function AdminInstallationAnalyticsPage() {
  return <AdminInstallationAnalyticsView />;
}
