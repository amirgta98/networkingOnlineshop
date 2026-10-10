import type { Metadata } from "next";
import { ADMIN_PAGES, AdminPagePlaceholder } from "@/features/admin";

export const metadata: Metadata = {
  title: "تیکت‌ها و پشتیبانی فنی مهندسی | پنل مدیریت ققنوس آکادمی",
  description: "پاسخگویی به سوالات مهندسی شبکه، طراحی توپولوژی، کانفیگ سیسکو و راهنمایی کارفرمایان.",
};

export default function AdminSupportPage() {
  const page = ADMIN_PAGES.find((p) => p.id === "support")!;
  return <AdminPagePlaceholder page={page} />;
}
