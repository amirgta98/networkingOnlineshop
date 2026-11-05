import type { Metadata } from "next";
import { AdminContactSettingsView } from "@/features/admin";

export const metadata: Metadata = {
  title: "تنظیمات تماس و شبکه‌های اجتماعی | پنل مدیریت | ققنوس آکادمی",
  description:
    "مدیریت اطلاعات تماس، خطوط پشتیبانی، پیام‌رسان‌ها، شبکه‌های اجتماعی و نشانی سایت ققنوس آکادمی.",
};

export default function ContactSettingsPage() {
  return <AdminContactSettingsView />;
}
